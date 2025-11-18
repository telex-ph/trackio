import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

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
    
    // Initialize views and acknowledgements arrays
    const announcementWithDefaults = {
      ...announcementData,
      views: [],
      acknowledgements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(announcementWithDefaults);
    return { _id: result.insertedId, ...announcementWithDefaults };
  }

  // Update an existing announcement
  static async update(id, updatedData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updatedData,
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // Delete an announcement
  static async delete(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }

  // Add view to announcement
  static async addView(announcementId, userId, userName) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(announcementId) },
      { 
        $addToSet: {
          views: {
            userId: userId,
            userName: userName,
            viewedAt: new Date()
          }
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // Add acknowledgement (like) to announcement
  static async addAcknowledgement(announcementId, userId, userName) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(announcementId) },
      { 
        $addToSet: {
          acknowledgements: {
            userId: userId,
            userName: userName,
            acknowledgedAt: new Date()
          }
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // Remove acknowledgement (unlike) from announcement
  static async removeAcknowledgement(announcementId, userId) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(announcementId) },
      { 
        $pull: {
          acknowledgements: {
            userId: userId
          }
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
  }

  // Get announcement by ID
  static async getById(id) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.findOne({ _id: new ObjectId(id) });
  }
}

export default Announcement;