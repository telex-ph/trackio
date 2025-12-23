import connectDB from "../../config/db.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

class Auth {
  static #collection = "users";

  static async compare(id, password) {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!password) {
      throw new Error("Password is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch;
  }

  static async change(id, newPassword) {
    if (!id) {
      throw new Error("ID is required");
    }
    if (!newPassword) {
      throw new Error("Password is required");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: newPassword } }
    );

    return result;
  }
}
export default Auth;
