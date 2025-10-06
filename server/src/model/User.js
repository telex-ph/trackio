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
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return user;
  }

  static async getAll() {
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    // Get all users scheduled today
    const users = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();

    return users;
  }

  static async getUsersByRoleScope(id, role) {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!role) {
      throw new Error("Role is required");
    }
    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const query = {};

    switch (role) {
      case Roles.TEAM_LEADER:
        query.teamLeaderId = new ObjectId(id);
        break;
      case Roles.OPERATIONS_MANAGER:
        query = {};
        break;
      default:
        query._id = new ObjectId(id);
        break;
    }

    const users = await collection
      .find(query, { projection: { password: 0 } })
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

    // Get all users scheduled today
    const usersOnShift = await users
      .find({ shiftDays: weekday }, { projection: { password: 0 } })
      .toArray();
    return usersOnShift;
  }
}

export default User;
