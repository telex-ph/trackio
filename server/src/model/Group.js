import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";

class Group {
  static #collection = "groups";

  static async getUserGroup(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    // Aggregation to lookup accounts and users
    const groups = await collection
      .aggregate([
        { $match: { teamLeaderId: new ObjectId(id) } },
        {
          $lookup: {
            from: "accounts",
            localField: "accountIds",
            foreignField: "_id",
            as: "accounts",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "agentIds",
            foreignField: "_id",
            as: "agents",
          },
        },
        // Optional: project only needed fields
        {
          $project: {
            _id: 1,
            name: 1,
            teamLeaderId: 1,
            createdAt: 1,
            accounts: { _id: 1, name: 1, createdAt: 1 },
            agents: { _id: 1, firstName: 1, lastName: 1, email: 1 },
          },
        },
      ])
      .toArray();

    return groups;
  }

  static async addGroup(teamLeaderId, name) {
    if (!name || !teamLeaderId) {
      throw new Error("Group name and teamLeaderId are required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const newGroup = {
      _id: new ObjectId(), // or provide a custom _id if needed
      name,
      teamLeaderId: new ObjectId(teamLeaderId),
      accountIds: [],
      agentIds: [],
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newGroup);
    return result.insertedId;
  }

  static async updateGroup(id, name) {
    if (!id || !name) {
      throw new Error("Group ID and name are required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("No group found or name is the same");
    }

    return result.modifiedCount; // return number of updated documents
  }

  static async getById(id) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    return await collection.findOne({ _id: new ObjectId(id) });
  }
}

export default Group;
