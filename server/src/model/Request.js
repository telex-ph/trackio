// src/model/Request.js
import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

class Request {
  static #collection = "requests";

  // Get all requests
  static async getAll() {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({}).toArray();
  }

  // Get request by ID
  static async getById(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Create a new request
  static async create(requestData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const requestWithTimestamp = {
      ...requestData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(requestWithTimestamp);
    return { _id: result.insertedId, ...requestWithTimestamp };
  }

  // Update an existing request
  static async update(id, updatedData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

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

  // Delete a request
  static async delete(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  }

  // Get requests by agent name
  static async getByAgent(agentName) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({ agentName }).toArray();
  }

  // Get requests by supervisor
  static async getBySupervisor(supervisor) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({ supervisor }).toArray();
  }

  // Get requests by status
  static async getByStatus(status) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({ status }).toArray();
  }

  // Get requests by type
  static async getByType(requestType) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({ requestType }).toArray();
  }
}

export default Request;
