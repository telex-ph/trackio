import connectDB from "../config/db.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

class Attendance {
  static #collection = "attendances";

  // Get all attendance records
  static async getAll() {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const attendances = await collection
      .aggregate([
        {
          $sort: { createdAt: -1 }, // sort by createdAt first
        },
        {
          $lookup: {
            from: "users", // the collection with user details
            localField: "userId", // field in attendances
            foreignField: "_id", // field in users
            as: "user", // output array field
          },
        },
        {
          $unwind: "$user", // convert user array to single object
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
            shiftStart: {
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
  static async updateById(id, fields) {
    if (!id) {
      throw new Error("ID is required");
    }

    if (!fields) {
      throw new Error("Field/s is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: fields }
    );
    return result;
  }
}

export default Attendance;
