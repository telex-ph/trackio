import connectDB from "../config/db.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import Schedule from "../model/Schedule.js";
import Roles from "../../../client/src/constants/roles.js";

class User {
  static #collection = "users";

  static async getById(id) {
    if (!id) {
      throw new Error("ID is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const user = await collection.findOne(
      {
        _id: new ObjectId(id),
        isDeleted: { $ne: true },
      },
      { projection: { password: 0 } }
    );

    return user;
  }

  static async addUser(data) {
    if (!data.firstName || !data.lastName || !data.email) {
      throw new Error("Missing required fields");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const newUser = {
      employeeId: data.employeeId || null,
      firstName: data.firstName,
      lastName: data.lastName,
      groupId: new ObjectId(data.teamId),
      email: data.email.toLowerCase(),
      phoneNumber: data.phoneNumber || null,
      role: data.role || "agent",
      password: "$2a$10$1jHppZ6SOnm4wnTMDg0kPOY9FHu/0L31MdP50WaeGmnVkLpeLPpau",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newUser);
    return { _id: result.insertedId, ...newUser };
  }

  static async getByEmail(email) {
    if (!email) {
      throw new Error("Email is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const user = await collection.findOne({
      email: email,
      isDeleted: { $ne: true }, // exclude soft-deleted users
    });

    return user;
  }

  static async getAll(search = "", role = Roles.AGENT) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    // Base query: exclude soft-deleted users
    const query = { isDeleted: { $ne: true } };

    // If a role filter is provided
    if (role) {
      query.role = role;
    }

    // If there's a search keyword
    if (search && search.trim()) {
      const regex = new RegExp(search, "i");

      const conditions = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ];

      // Also allow searching by ObjectId
      if (/^[a-fA-F0-9]{24}$/.test(search)) {
        conditions.push({ _id: new ObjectId(search) });
      }

      query.$or = conditions;
    }

    // Fetch filtered users (excluding deleted ones)
    const users = await collection
      .find(query, { projection: { password: 0 } })
      .toArray();

    return users;
  }

  static async getUsersByRoleScope(id, role) {
    if (!id) throw new Error("ID is required");
    if (!role) throw new Error("Role is required");

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    let query = { isDeleted: { $ne: true } };

    switch (role) {
      case Roles.TEAM_LEADER:
        query.teamLeaderId = new ObjectId(id);
        break;
      case Roles.OM:
      case Roles.ADMIN:
        // Admin/OM can see everyone, but still exclude deleted users
        query = { isDeleted: { $ne: true } };
        break;
      default:
        query._id = new ObjectId(id);
        break;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await collection
      .aggregate([
        { $match: query },

        // Lookup the user's group
        {
          $lookup: {
            from: "groups",
            localField: "groupId",
            foreignField: "_id",
            as: "group",
          },
        },
        { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },

        // Lookup all accounts associated with that group
        {
          $lookup: {
            from: "accounts",
            localField: "group.accountIds",
            foreignField: "_id",
            as: "accounts",
          },
        },

        // Lookup schedules assigned to this user (today & future only)
        {
          $lookup: {
            from: "schedules",
            let: { userId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userId", "$$userId"] },
                  date: { $gte: today },
                },
              },
            ],
            as: "futureSchedules",
          },
        },

        // Add computed fields
        {
          $addFields: {
            groupName: { $ifNull: ["$group.name", "None"] },
            accountNames: {
              $cond: [
                { $gt: [{ $size: "$accounts" }, 0] },
                { $map: { input: "$accounts", as: "acc", in: "$$acc.name" } },
                [],
              ],
            },
            upcomingScheduleCount: { $size: "$futureSchedules" },
          },
        },

        // Clean projection
        {
          $project: {
            password: 0,
            group: 0,
            accounts: 0,
            futureSchedules: 0,
          },
        },
      ])
      .toArray();

    return users;
  }

  /**
   * Log in a user by checking email and password.
   *
   * Looks up the user by email, verifies the password,
   * and returns a user object without sensitive data.
   *
   * @param {string} _email - The user's email address.
   * @param {string} password - The user's plain-text password to verify.
   * @throws {Error} If the user is not found or the password is incorrect.
   * @returns {Promise<Object>} The user's profile data (excluding password).
   */
  static async login(_email, password) {
    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const user = await collection.findOne({ email: _email });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isDeleted) {
      throw new Error("This account has been deactivated.");
    }

    if (user.password !== password) {
      throw new Error("Invalid password");
    }

    const {
      _id,
      firstName,
      lastName,
      email,
      role,
      groupId,
      teamLeaderId,
      createdAt,
      shiftStart,
      shiftEnd,
    } = user;
    return {
      _id,
      firstName,
      lastName,
      email,
      role,
      groupId,
      teamLeaderId,
      createdAt,
      shiftStart,
      shiftEnd,
    };
  }

  /**
   * Get all users scheduled for work today.
   *
   * Uses today's weekday (1 = Monday, 7 = Sunday)
   * to match against each user's `shiftDays` array.
   * Excludes password from the result.
   *
   * @returns {Promise<Array>} A list of users who are on shift today.
   */
  static async onShifts() {
    const db = await connectDB();
    const users = db.collection(this.#collection);

    const now = DateTime.utc();
    const weekday = now.weekday;

    const usersOnShift = await users
      .find(
        {
          shiftDays: weekday,
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        },
        { projection: { password: 0 } }
      )
      .toArray();

    return usersOnShift;
  }

  static async update(id, field, newValue) {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!field) {
      throw new Error("Field is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const updateData = { [field]: newValue };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }

    const updatedUser = await collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    return updatedUser;
  }
}

export default User;
