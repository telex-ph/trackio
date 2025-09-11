import connectDB from "../config/db.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

class Attendance {
  static #collection = "attendances";

  // Get all timed in attendance records
  static async getAll({
    startDate = null,
    endDate = null,
    status = "all",
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
    switch (status) {
      case "timeIn":
        // Get the attendance record of those who have not timed out yet / for time-in page
        matchStage.timeOut = null;
        break;
      case "timeOut":
        // Get the attendance records of those who have already timed out / for time-out page
        matchStage.timeOut = { $exists: true, $ne: null };
        break;
      // Get the attendance who were of those who where late / for late page
      case "late":
        matchStage.status = "Late";
      case "all":
      default:
        // No timeOut filter → return everything
        break;
    }

    const attendances = await collection
      .aggregate([
        { $sort: { createdAt: -1 } },

        // Filter by date range if provided
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

  // Get the user that matches with the id
  static async getById(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const now = DateTime.now();
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const attendances = await collection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(id),
            shiftDate: {
              $gte: now.startOf("day"),
              $lte: now.endOf("day"),
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

  // Update specific fields by
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

  static async timeIn(id, shiftStart, shiftEnd) {
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

    const result = await collection.insertOne({
      userId: new ObjectId(id),
      shiftDate: now.toJSDate(),
      shiftStart,
      shiftEnd,
      timeIn: now.toJSDate(),
      status: "Working",
      createdAt: now.toJSDate(),
      updatedAt: now.toJSDate(),
    });

    return result;
  }
}

export default Attendance;
