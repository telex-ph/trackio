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

    console.log(schedules);

    const bulkOps = schedules.map((schedule) => ({
      updateOne: {
        filter: { date: schedule.date },
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

  static async deleteAll(schedules) {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new Error("Schedules must be a non-empty array");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const bulkOps = schedules.map((schedule) => ({
      deleteOne: {
        filter: { date: schedule },
      },
    }));

    const result = await collection.bulkWrite(bulkOps);

    return { deletedCount: result.deletedCount };
  }

  static async getAll(id, startDate = null, endDate = null) {
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

    return await collection.find(query).toArray();
  }
}

export default Schedules;
