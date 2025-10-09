import connectDB from "../config/db.js";
import { DateTime } from "luxon";

class Absence {
  static #collection = "absences";

  static async updateById() {
    
  }

  static async getAll({ startDate = null, endDate = null }) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

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

    const absentees = await collection
      .aggregate([
        // Filter first if matchStage exists
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),

        // Sort latest first
        { $sort: { createdAt: -1 } },

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

        // Remove sensitive fields
        {
          $project: {
            "user.password": 0,
          },
        },
      ])
      .toArray();

    return absentees;
  }

  /**
   * Marks users as absent for a specific shift date.
   * Checks for existing absence records to prevent duplicates.
   *
   * @param {Array<string|ObjectId>} userIds - Array of user IDs to mark as absent.
   * @returns {Promise<InsertManyResult|undefined>} Returns the result of insertMany if records were added, otherwise undefined.
   */
  static async mark(users) {
    if (!users.length) return;

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const now = DateTime.utc().toJSDate();

    const recordsToInsert = [];

    for (const { userId, shiftDate } of users) {
      const exists = await collection.findOne({ userId, shiftDate });

      if (!exists) {
        recordsToInsert.push({ userId, shiftDate, createdAt: now });
      }
    }

    if (!recordsToInsert.length) return;

    return collection.insertMany(recordsToInsert);
  }
}

export default Absence;
