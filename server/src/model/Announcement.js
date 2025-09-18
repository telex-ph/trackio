// Announcement.js
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb"; // Correct import for ObjectId

class Announcement {
  static #collection = "announcements";

  // Get all announcements
  static async getAll() {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({}).toArray();
  }

  // Create a new announcement
  static async create(announcementData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    const result = await collection.insertOne(announcementData);

    // MongoDB v4+ does not return .ops
    return { _id: result.insertedId, ...announcementData };
  }

  // Update an existing announcement
  static async update(id, updatedData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatedData },
      { returnDocument: "after" } // returns the updated document
    );

    return result.value; // the updated document
  }

  // Delete an announcement
  static async delete(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

export default Announcement;
