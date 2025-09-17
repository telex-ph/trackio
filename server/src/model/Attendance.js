import connectDB from "../config/db.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

class Attendance {
  static #collection = "attendances";
  static #usersCollection = "users";

  // Get all timed in attendance records
  static async getAll({
    startDate = null,
    endDate = null,
    filter = "all",
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
        matchStage.timeOut = null;
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

        // Filter
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

  // Check users' attendance
  static async checkAbsentees() {
    const db = await connectDB();
    const usersCollection = db.collection(this.#usersCollection);
    const attendanceCollection = db.collection(this.#collection);

    // 1️⃣ Get today's date as ISO string (ignore time)
    const todayDate = DateTime.now().toISODate(); // "2025-09-16"

    // 2️⃣ Get today's weekday
    const weekday = DateTime.now().weekday; // 1 = Monday ... 7 = Sunday

    // 3️⃣ Get all users scheduled for today
    const usersOnShift = await usersCollection
      .find({ shiftDays: weekday }, { projection: { password: 0 } })
      .toArray();

    // 4️⃣ Get all attendance records for today
    const attendanceToday = await attendanceCollection
      .find({ date: todayDate })
      .project({ userId: 1 })
      .toArray();

    // 5️⃣ Extract userIds who already attended
    const attendedUserIds = attendanceToday.map((a) => a.userId.toString());

    // 6️⃣ Filter users who haven't attended yet (absentees)
    const absentees = usersOnShift.filter(
      (user) => !attendedUserIds.includes(user._id.toString())
    );

    console.log("Absentees today:", absentees);

    return absentees;
  }
}

export default Attendance;
