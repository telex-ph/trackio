// src/model/Offense.js
import connectDB from "../../config/db.js";
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(offenseWithTimestamp);
    return { _id: result.insertedId, ...offenseWithTimestamp };
  }

  static async update(id, updatedData) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    delete updatedData._id;

    const dataWithTimestamp = {
      ...updatedData,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataWithTimestamp },
      { returnDocument: "after" }
    );

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

  // Get offenses by Reporter ID
  static async getByReporterId(reporterId) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    try {
      const query = { reportedById: new ObjectId(reporterId) };
      const result = await collection.find(query).toArray();
      return result;
    } catch (dbError) {
      // Iwan ang error log para sa production debugging
      console.error("MODEL - Database query failed:", dbError);
      throw dbError; // Re-throw the error
    }
  }
}

export default Offense;
