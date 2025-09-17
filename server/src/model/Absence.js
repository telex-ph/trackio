import connectDB from "../config/db.js";
import { DateTime } from "luxon";

class Absence {
  static #collection = "absence";

  /**
   * Marks users as absent for a specific shift date.
   * Checks for existing absence records to prevent duplicates.
   *
   * @param {Array<string|ObjectId>} userIds - Array of user IDs to mark as absent.
   * @param {Date} shiftDate - The date of the shift.
   * @returns {Promise<InsertManyResult|undefined>} Returns the result of insertMany if records were added, otherwise undefined.
   */
  static async mark(userIds, shiftDate = null) {
    return;
    if (!userIds.length) return;

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const now = DateTime.utc().toJSDate();

    const recordsToInsert = [];

    for (const userId of userIds) {
      // const exists = await collection.findOne({ userId, shiftDate });
      const exists = await collection.findOne({ userId });

      if (!exists) {
        recordsToInsert.push({ userId, shiftDate, createdAt: now });
      }
    }

    if (!recordsToInsert.length) return;

    return collection.insertMany(recordsToInsert);
  }
  // static async mark(userIds, shiftDate) {
  //   if (!userIds.length) return;

  //   const db = await connectDB();
  //   const collection = db.collection(this.#collection);

  //   const now = DateTime.utc().toJSDate(); // UTC timestamp as JS Date

  //   // Build documents to insert
  //   const records = userIds.map((userId) => ({
  //     userId,
  //     shiftDate,
  //     createdAt: now,
  //   }));

  //   // Insert into MongoDB
  //   const result = await collection.insertMany(records);
  //   return result;
  // }
}

export default Absence;
