import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

class Announcement {
  static #collection = "announcements";

  // Get all announcements
  // ✅ UPDATED: Ibinabalik sa simpleng find({}) dahil ang attachment ay Cloudinary URL na lang.
  // Walang malaking Base64 data na kailangang i-exclude.
  static async getAll() {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    return await collection.find({}).toArray();
  }

  // Create a new announcement (Updated for Approval & Expiry)
  static async create(announcementData) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);
    
    // Initialize defaults including new fields
    const announcementWithDefaults = {
      ...announcementData,
      category: announcementData.category || "Department", // 'General' or 'Department'
      approvalStatus: announcementData.approvalStatus || "Pending", // 'Pending' or 'Approved'
      expiresAt: announcementData.expiresAt || null, // Date when it stops showing
      duration: announcementData.duration || "1w", // Duration configuration
      views: [],
      acknowledgements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: announcementData.status || "Inactive" // Default based on logic in controller
    };
    
    const result = await collection.insertOne(announcementWithDefaults);
    return { _id: result.insertedId, ...announcementWithDefaults };
  }

  // Approve an announcement (New Method for Department Head action)
  static async approve(id, approverName) {
    const db = await connectDB();
    const collection = await db.collection(this.#collection);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          approvalStatus: "Approved",
          status: "Active", // Auto-activate upon approval
          approvedBy: approverName,
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: "after" }
    );

    return result.value;
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