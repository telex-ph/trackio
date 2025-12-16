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

    let query;

    // Check if id looks like a valid MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { employeeId: id };
    }

    // Add condition to exclude deleted users
    query.isDeleted = { $ne: true };

    const user = await collection.findOne(query, {
      projection: { password: 0 },
    });

    return user;
  }

  static async addUser(data) {
    if (!data.firstName || !data.lastName) {
      throw new Error("Missing required fields");
    }

    const db = await connectDB();
    const collection = db.collection(this.#collection);

    const newUser = {
      employeeId: data.employeeId || null,
      firstName: data.firstName,
      lastName: data.lastName,
      groupId: data.teamId ? new ObjectId(data.teamId) : null,
      email: data.email || null,
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

    const users = await collection
      .aggregate([
        { $match: query },

        // Lookup Team Leader
        {
          $lookup: {
            from: "users",
            localField: "teamLeaderId",
            foreignField: "_id",
            as: "teamLeader",
          },
        },
        {
          $unwind: {
            path: "$teamLeader",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Add computed Team Leader full name
        {
          $addFields: {
            teamLeaderName: {
              $cond: [
                { $ifNull: ["$teamLeader", false] },
                {
                  $concat: [
                    "$teamLeader.firstName",
                    " ",
                    "$teamLeader.lastName",
                  ],
                },
                null,
              ],
            },
          },
        },

        // Lookup group
        {
          $lookup: {
            from: "groups",
            localField: "groupId",
            foreignField: "_id",
            as: "group",
          },
        },
        { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },

        // Lookup accounts from group.accountIds
        {
          $lookup: {
            from: "accounts",
            localField: "group.accountIds",
            foreignField: "_id",
            as: "accounts",
          },
        },

        // Add only account names for convenience
        {
          $addFields: {
            accountNames: {
              $cond: [
                { $gt: [{ $size: "$accounts" }, 0] },
                { $map: { input: "$accounts", as: "acc", in: "$$acc.name" } },
                [],
              ],
            },
          },
        },

        // Exclude sensitive or redundant fields
        {
          $project: {
            password: 0,
            group: 0,
            accounts: 0,
          },
        },
      ])
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
      case Roles.OPERATION_ASSOCIATE:
      case Roles.BACK_OFFICE_HEAD:
      case Roles.MANAGER:
      case Roles.OM:
      case Roles.ADMIN:
      case Roles.ADMIN_HR_HEAD:
      case Roles.COMPLIANCE:
      case Roles.COMPLIANCE_HEAD:
      case Roles.PRESIDENT:
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

        //  Filter users by group.agentIds and group.accountIds
        ...(role === Roles.MANAGER
          ? [
            {
              $match: {
                $or: [
                  // Include BO Head, OA, Trainer QA
                  {
                    role: {
                      $in: [
                        Roles.BACK_OFFICE_HEAD,
                        Roles.OPERATION_ASSOCIATE,
                        Roles.TRAINER_QUALITY_ASSURANCE,
                      ],
                    },
                  },
                  {
                    "group.accountIds": new ObjectId(
                      "64f600000000000000000003"
                    ),
                  },
                ],
              },
            },
          ]
          : []),

        ...(role === Roles.BACK_OFFICE_HEAD
          ? [
            {
              $match: {
                role: Roles.TRAINER_QUALITY_ASSURANCE,
              },
            },
          ]
          : []),

        ...(role === Roles.OPERATION_ASSOCIATE
          ? [
            {
              $lookup: {
                from: "groups",
                localField: "_id",
                foreignField: "teamLeaderId",
                as: "asTeamLeaderOfGroup",
              },
            },
            {
              $unwind: {
                path: "$asTeamLeaderOfGroup",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $match: {
                "asTeamLeaderOfGroup.accountIds": new ObjectId(
                  "64f600000000000000000003"
                ),
              },
            },
          ]
          : []),

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

  static async getUserAccountsById(userId) {
    if (!userId) throw new Error("User ID is required");

    if (!ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

    const db = await connectDB();
    const users = db.collection("users");

    const userData = await users.aggregate([
      {
        $match: { _id: new ObjectId(userId), isDeleted: { $ne: true } }
      },

      // Find the user's group whether they are agent or team leader
      {
        $lookup: {
          from: "groups",
          let: { userId: "$_id", groupId: "$groupId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$groupId"] },      // agent
                    { $eq: ["$teamLeaderId", "$$userId"] } // team leader
                  ]
                }
              }
            }
          ],
          as: "group"
        }
      },

      { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },

      // Get accounts from the group
      {
        $lookup: {
          from: "accounts",
          localField: "group.accountIds",
          foreignField: "_id",
          as: "accounts"
        }
      },

      // Clean output
      {
        $project: {
          password: 0,
          "group.agentIds": 0,
          "group.accountIds": 0
        }
      }
    ]).toArray();

    return userData[0] || null;
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
