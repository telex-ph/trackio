import { ObjectId } from "mongodb";
import connectDB from "../../config/db.js";
import { DateTime } from "luxon";

class Course {
  static #collection = "courses";

  static async add(newCourse) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const newRecord = {
      ...newCourse,
      createdBy: new ObjectId(newCourse.createdBy),
      createdAt: DateTime.utc().toJSDate(),
      updatedAt: DateTime.utc().toJSDate(),
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

  static async update(id, newCourse) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    newCourse.updatedAt = DateTime.utc().toJSDate();

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: newCourse }
    );

    if (result.matchedCount === 0) {
      return null;
    }

    // Return the updated document
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  static async findByIdAndAddLesson(id, newLesson) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $push: { lessons: newLesson } },
      { returnDocument: "after" }
    );

    return result;
  }
}
export default Course;
