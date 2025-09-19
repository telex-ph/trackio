import connectDB from "../config/db.js";
import { DateTime } from "luxon";

class User {
  static #collection = "users";

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
    const user = await db
      .collection(this.#collection)
      .findOne({ email: _email });

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
