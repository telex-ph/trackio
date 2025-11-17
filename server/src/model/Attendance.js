import connectDB from "../config/db.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import Roles from "../../../client/src/constants/roles.js";
import webhook from "../utils/webhook.js";

class Attendance {
  static #collection = "attendances";

  /**
   * Get attendance records, with optional filtering by date range or status.
   *
   * @param {Object} options - Optional filters for the query.
   * @param {Date} [options.startDate=null] - Only include records created on or after this date.
   * @param {Date} [options.endDate=null] - Only include records created on or before this date.
   * @param {string} [options.filter="all"] - Filter by type:
   *   "timeIn"   - Users currently timed in (no timeOut yet).
   *   "timeOut"  - Users who have already timed out.
   *   "late"     - Users who clocked in later than their shift start.
   *   "onBreak"  - Users currently on break.
   *   "onLunch"  - Users currently on lunch.
   *   "undertime"- Users who clocked out earlier than shift end.
   *   "all"      - No additional filter, return everything.
   *
   * @returns {Promise<Array>} A list of attendance records with user, group, and account details.
   */
  static async getAll({
    startDate = null,
    endDate = null,
    filter = "all",
    role,
    userId,
  } = {}) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const matchStage = {};
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      matchStage.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchStage.createdAt = { $lte: new Date(endDate) };
    }

    // Apply status filter
    switch (filter) {
      case "timeIn":
        // Get the attendance record of those who have not timed out yet / for time-in page
        matchStage.timeIn = { $exists: true, $ne: null };
        break;
      case "timeOut":
        // Get the attendance records of those who have already timed out / for time-out page
        matchStage.timeOut = { $exists: true, $ne: null };
        break;
      // Get the attendance records of those who where late / for late page
      case "late":
        matchStage.$expr = {
          $gt: ["$timeIn", "$shiftStart"], // timeIn > shiftStart → late
        };
        break;
      // Get the attendance record who currently on break / for break page
      case "onBreak":
        matchStage.status = "On Break";
        break;
      // Get the attendance record who currently on lunch / for lunch page
      case "onLunch":
        matchStage.status = "On Lunch";
        break;
      case "undertime":
        matchStage.timeOut = { $exists: true, $ne: null };
        matchStage.$expr = {
          $gt: ["$shiftEnd", "$timeOut"], //  shiftEnd > timeOut →
        };
        break;
      case "all":
      default:
        // No timeOut filter → return everything
        break;
    }

    const attendances = await collection
      .aggregate([
        { $sort: { createdAt: -1 } },

        // Pre-filter (attendance fields)
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),

        // Lookup User
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // Apply TL filter AFTER user is joined
        ...(role === Roles.TEAM_LEADER
          ? [{ $match: { "user.teamLeaderId": new ObjectId(userId) } }]
          : []),
        {
          $lookup: {
            from: "groups",
            localField: "user.groupId",
            foreignField: "_id",
            as: "group",
          },
        },
        { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "accounts",
            localField: "group.accountIds",
            foreignField: "_id",
            as: "accounts",
          },
        },
        {
          $project: {
            "user.password": 0,
          },
        },
      ])
      .toArray();

    return attendances;
  }

  static async getByDocId(docId) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.findOne({ _id: new ObjectId(docId) });
  }

  /**
   * Get all attendance records for a specific user for today.
   *
   * @param {string} id - The user ID to look up.
   * @throws {Error} If no ID is provided.
   * @returns {Promise<Array>} A list of today's attendance records for the user,
   *   including the user details (via lookup).
   */
  static async getById(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const now = DateTime.now().setZone("Asia/Manila");
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const attendances = await collection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(id),
            shiftDate: {
              $gte: now.startOf("day").toUTC().toJSDate(),
              $lte: now.endOf("day").toUTC().toJSDate(),
            },
          },
        },
        { $sort: { createdAt: 1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray();
    return attendances;
  }

  /**
   * Update specific fields in an attendance record by its ID.
   *
   * @param {string} id - The attendance record ID to update.
   * @param {Object} fields - Key/value pairs of fields to update.
   * @param {string} [status] - Optional status to update (will override fields.status if provided).
   * @throws {Error} If no ID or fields are provided.
   * @returns {Promise<Object>} The result of the update operation (acknowledgement and matched count).
   */
  static async updateById(id, fields, status) {
    if (!id) {
      throw new Error("ID is required");
    }

    if (!fields) {
      throw new Error("Field/s is required");
    }

    const updateData = { ...fields };
    if (status !== undefined) {
      updateData.status = status;
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
      }
    );
    return result;
  }

  static async updateFieldById(id, field, newValue) {
    if (!id) {
      throw new Error("ID is required");
    }

    if (!field) {
      throw new Error("Field is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { [field]: newValue },
      }
    );
    return result;
  }

  /**
   * Record a user's time-in for today.
   *
   * Creates a new attendance record with shift start/end times,
   * sets the current time as `timeIn`, and marks the status as "Working".
   * Prevents duplicate records if the user has already timed in today.
   *
   * @param {string} id - The user ID to time in.
   * @param {Date} shiftStart - The user's shift start time for today.
   * @param {Date} shiftEnd - The user's shift end time for today.
   * @throws {Error} If no ID is provided or if a record already exists for today.
   * @returns {Promise<Object>} The result of the insert operation (new record info).
   */
  static async timeIn(id, employeeId, shiftStart, shiftEnd) {
    if (!id) {
      throw new Error("ID is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const now = DateTime.utc();

    // Get start and end of today (UTC)
    const startOfDay = now.startOf("day").toJSDate();
    const endOfDay = now.endOf("day").toJSDate();

    // Check if user already has a record today
    const existing = await collection.findOne({
      userId: new ObjectId(id),
      shiftDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      throw new Error("Attendance already recorded for today.");
    }

    try {
      const result = await collection.insertOne({
        userId: new ObjectId(id),
        employeeId,
        shiftDate: now.toJSDate(),
        shiftStart,
        shiftEnd,
        timeIn: now.toJSDate(),
        status: "Working",
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
      });
      return result;
    } catch (err) {
      // If it’s a duplicate key error (code 11000)
      if (err.code === 11000) {
        console.warn(`Duplicate attendance prevented for user ${id}`);

        // Optional: send a webhook notification with details
        await webhook(
          `**Duplicate attendance prevented**\nUser ID: ${id}\n` +
            `Reason: Attempted to record attendance for the same shift or day.\n\n` +
            `**Error Details:**\n\`\`\`${err.message}\`\`\``
        );

        // Return the existing attendance so the app can continue smoothly
        return await collection.findOne({
          userId: new ObjectId(id),
          shiftDate: { $gte: startOfDay, $lte: endOfDay },
        });
      }

      // For all other errors, also send a webhook
      await webhook(
        `**Attendance Error:**\nUser ID: ${id}\n\n\`\`\`${
          err.stack || err.message
        }\`\`\``
      );

      // Then rethrow to be handled upstream if needed
      throw err;
    }
  }

  /**
   * Fetches all attendance records for the given users
   * within today's shift window (earliest shift start to latest shift end).
   *
   * @param {Array<ObjectId>} userIds - Users scheduled today.
   * @param {DateTime} earliestShiftStart - The earliest shift start time today.
   * @param {DateTime} latestShiftEnd - The latest shift end time today.
   * @returns {Promise<Array>} Attendance records matching the users and time window.
   */
  static async getShift(userIds, earliestShiftStart, latestShiftEnd) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    return await collection
      .find({
        userId: { $in: userIds },
        timeIn: {
          $gte: earliestShiftStart.toJSDate(),
          $lte: latestShiftEnd.toJSDate(),
        },
      })
      .toArray();
  }

  static async getAllOnBreak() {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const attendances = await collection
      .aggregate([
        { $match: { status: "On Break" } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: "$_id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            employeeId: 1,
            breaks: 1,
            totalBreakTime: "$totalBreak",
            updatedAt: "$updatedAt",
          },
        },
      ])
      .toArray();
    return attendances;
  }
}

export default Attendance;
