// src/model/Offense.js
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

class Offense {
  static #collection = "offenses";

  // Get all offenses
  static async getAll() {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.find({}).toArray();
  }

  // Get offense by ID
  static async getById(id) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Create new offense
  static async create(offenseData) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const offenseWithTimestamp = {
      ...offenseData,
      isRead: false, // ✅ default when creating
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(offenseWithTimestamp);
    return { _id: result.insertedId, ...offenseWithTimestamp };
  }

  static async update(id, updatedData) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const dataWithTimestamp = {
      ...updatedData,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataWithTimestamp },
      { returnDocument: "after" }
    );

    console.log("MongoDB update result:", result);
    return result.value;
  }

  // Delete offense
  static async delete(id) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  }

  // Filters
  static async getByAgent(agentName) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.find({ agentName }).toArray();
  }

  static async getByCategory(category) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.find({ offenseCategory: category }).toArray();
  }

  static async getByStatus(status) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.find({ status }).toArray();
  }
}

export default Offense;
