import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";
import { DateTime } from "luxon";

class Course {
  static #collection = "courses";

  static async add(title, description) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const newRecord = {
      title,
      description,
      createdAt: DateTime.utc().toJSDate(),
    };

    const result = await collection.insertOne(newRecord);
    return { _id: result.insertedId };
  }

  static async getAll(category) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const query = {};

    if (category) {
      query.category = category;
    }

    const result = await collection.find(query).toArray();

    return result;
  }

  static async get(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    return await collection.findOne({ _id: new ObjectId(id) });
  }
}
export default Course;
