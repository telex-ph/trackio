// src/model/Offense.js
import connectDB from "../../config/db.js";
import { ObjectId } from "mongodb";

class Leave {
    static #collection = "leave";

    // Create new leave
    static async create(leaveData) {
        const db = await connectDB();
        const collection = db.collection(this.#collection);

        const leaveWithTimestamp = {
            ...leaveData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(leaveWithTimestamp);
        return { _id: result.insertedId, ...leaveWithTimestamp };
    }

    // Get all leave
    static async getAll() {
        const db = await connectDB();
        const collection = db.collection(this.#collection);
        return await collection.find({}).toArray();
    }

    // Get leave by ID
    static async getById(id) {
        const db = await connectDB();
        const collection = db.collection(this.#collection);
        return await collection.findOne({ _id: new ObjectId(id) });
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

    static async delete(id) {
        const db = await connectDB();
        const collection = db.collection(this.#collection);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount;
    }
}

export default Leave;   