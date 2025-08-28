import connectDB from "../config/db.js";

class User {
  #collection = "users";

  async login(_email, password) {
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
    };
  }
}

export default User;
