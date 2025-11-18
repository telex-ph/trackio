import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

class Schedules {
  static #collection = "schedules";

  static async addAll(schedules) {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new Error("Schedules must be a non-empty array");
    }

    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const bulkOps = schedules.map((schedule) => ({
      updateOne: {
        filter: { userId: schedule.userId, date: schedule.date },
        update: { $set: schedule },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(bulkOps);
    return {
      insertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  static async deleteAll(schedules, userId) {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new Error("Schedules must be a non-empty array");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const bulkOps = schedules.map((schedule) => ({
      deleteOne: {
        filter: { userId: userId, date: schedule },
      },
    }));

    const result = await collection.bulkWrite(bulkOps);

    return { deletedCount: result.deletedCount };
  }

  static async getAll(id = null, startDate = null, endDate = null) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const query = {};

    if (id) {
      query.userId = new ObjectId(id);
    }

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      query.date = {
        $gte: startDate,
      };
    } else if (endDate) {
      query.date = {
        $lte: endDate,
      };
    }

    const schedules = await collection
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "updatedBy",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
      ])
      .toArray();

    return schedules;
  }

  static async get(id, min, max) {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!min || !max) {
      throw new Error("Search boundaries (min and max) are required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const matchingSchedule = await collection.findOne({
      userId: new ObjectId(id),
      shiftStart: {
        $gte: min,
        $lte: max,
      },
    });

    return matchingSchedule;
  }
}

export default Schedules;
