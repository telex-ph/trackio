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

    const result = await collection.insertMany(schedules);
    return {
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    };
  }

  static async getAll(id) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const query = id ? { userId: new ObjectId(id) } : {};

    return await collection.find(query).toArray();
  }
}

export default Schedules;
