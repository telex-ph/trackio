import { ObjectId } from "mongodb";
import { DateTime } from "luxon";
import connectDB from "../config/db.js";

class Otp {
  static #collection = "otps";

  static async create(userId, hashedOtp) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const newRecord = {
      userId: new ObjectId(userId),
      hashedOtp,
      expiresAt: DateTime.utc().plus({ minutes: 5 }).toJSDate(),
    };

    const result = await collection.insertOne(newRecord);
    return { _id: result.insertedId };
  }

  static async get(userId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection
      .find({
        userId: new ObjectId(userId),
        expiresAt: { $gt: DateTime.now().toUTC().toJSDate() },
      })
      .sort({ expiresAt: -1 })
      .limit(1)
      .toArray();

    return result[0] || null;
  }
}

export default Otp;
