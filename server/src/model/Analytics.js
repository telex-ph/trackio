import connectDB from "../config/db.js";
import { ObjectId } from "mongodb";
import Roles from "../../../client/src/constants/roles.js";

class Analytics {
    static #collection_attendance = "attendances";
    static #collection_schedule = "schedules";

    static async getAttendanceAll({ startDate = null, endDate = null } = {}) {
        const db = await connectDB();
        const attendanceCol = db.collection(this.#collection_attendance);
        const scheduleCol = db.collection(this.#collection_schedule);

        const now = new Date();

        // 🔹 Default start: first day of the month
        const monthStart = startDate
            ? new Date(startDate)
            : new Date(now.getFullYear(), now.getMonth(), 1);

        // 🔹 Default end: today (not end of month)
        const today = endDate ? new Date(endDate) : now;

        // Expected Attendance
        const [expected] = await scheduleCol.aggregate([
            {
                $match: {
                    date: { $gte: monthStart, $lte: today },
                    type: "workday",
                },
            },
            {
                $group: {
                    _id: null,
                    totalExpected: { $sum: 1 },
                },
            },
        ]).toArray();

        const totalExpected = expected?.totalExpected || 0;

        // Actual Attendance
        const [actual] = await attendanceCol.aggregate([
            {
                $match: {
                    createdAt: { $gte: monthStart, $lte: today },
                },
            },
            {
                $addFields: {
                    overBreak: {
                        $cond: [
                            { $and: ["$mealStart", "$mealEnd"] },
                            {
                                $gt: [
                                    { $divide: [{ $subtract: ["$mealEnd", "$mealStart"] }, 1000 * 60] },
                                    90,
                                ],
                            },
                            false,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    attendance: { $sum: 1 },
                    late: { $sum: { $cond: [{ $gt: ["$timeIn", "$shiftStart"] }, 1, 0] } },
                    undertime: { $sum: { $cond: [{ $lt: ["$timeOut", "$shiftEnd"] }, 1, 0] } },
                    overBreaks: { $sum: { $cond: ["$overBreak", 1, 0] } },
                },
            },
        ]).toArray();

        const stats = actual || { attendance: 0, late: 0, undertime: 0, overBreaks: 0 };

        // Percentages
        const percentage = (value) =>
            totalExpected === 0 ? 0 : Number(((value / totalExpected) * 100).toFixed(2));

        return {
            totalExpected,
            attendance: { count: stats.attendance, percentage: percentage(stats.attendance) },
            late: { count: stats.late, percentage: percentage(stats.late) },
            undertime: { count: stats.undertime, percentage: percentage(stats.undertime) },
            overBreak: { count: stats.overBreaks, percentage: percentage(stats.overBreaks) },
        };
    }

    static async getAttendancePerOrganization({ startDate = null, endDate = null } = {}) {
        const db = await connectDB();
        const attendanceCol = db.collection(this.#collection_attendance);
        const scheduleCol = db.collection(this.#collection_schedule);

        const now = new Date();
        const monthStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const today = endDate ? new Date(endDate) : now;

        const ROLE_GROUPS = {
            ADMIN_MANAGEMENT: [
                "admin",
                "compliance",
                "compliance-head",
                "admin-hr-head",
                "human-resources",
                "operations-manager"
            ],
            OPERATION_MANAGEMENT: [
                "manager",
                "back-office-head",
                "operations-associate",
                "trainer-quality-assurance",
                "quality-assurance",
                "team-leader"
            ],
            OPERATIONS: ["agent"],
        };

        const ROLE_GROUP_LABELS = {
            ADMIN_MANAGEMENT: "Admin Management",
            OPERATION_MANAGEMENT: "Operation Management",
            OPERATIONS: "Operations",
        };

        const pipeline = [
            { $match: { createdAt: { $gte: monthStart, $lte: today } } },

            // Lookup user
            { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },

            // Lookup organization
            { $lookup: { from: "organizations", localField: "user.organizationId", foreignField: "_id", as: "organization" } },
            { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },

            // OverBreak & roleGroup
            {
                $addFields: {
                    overBreak: {
                        $cond: [
                            { $and: ["$mealStart", "$mealEnd"] },
                            { $gt: [{ $divide: [{ $subtract: ["$mealEnd", "$mealStart"] }, 1000 * 60] }, 90] },
                            false
                        ]
                    },
                    roleGroup: {
                        $switch: {
                            branches: [
                                { case: { $in: ["$user.role", ROLE_GROUPS.ADMIN_MANAGEMENT] }, then: "Admin Management" },
                                { case: { $in: ["$user.role", ROLE_GROUPS.OPERATION_MANAGEMENT] }, then: "Operations Management" },
                                { case: { $in: ["$user.role", ROLE_GROUPS.OPERATIONS] }, then: "Operations" },
                            ],
                            default: "OTHER"
                        }
                    }
                }
            },

            // Group by organization + roleGroup
            {
                $group: {
                    _id: { organizationId: "$organization._id", roleGroup: "$roleGroup" },
                    userIds: { $addToSet: "$user._id" },
                    totalAttendance: { $sum: 1 },
                    late: { $sum: { $cond: [{ $gt: ["$timeIn", "$shiftStart"] }, 1, 0] } },
                    undertime: { $sum: { $cond: [{ $lt: ["$timeOut", "$shiftEnd"] }, 1, 0] } },
                    overBreaks: { $sum: { $cond: ["$overBreak", 1, 0] } },
                }
            },

            // Lookup schedules for totalExpected
            {
                $lookup: {
                    from: "schedules",
                    let: { userIds: "$userIds" },
                    pipeline: [
                        { $match: { date: { $gte: monthStart, $lte: today }, type: "workday" } },
                        { $match: { $expr: { $in: ["$userId", "$$userIds"] } } }
                    ],
                    as: "schedules"
                }
            },
            { $addFields: { totalExpected: { $size: "$schedules" } } },

            // Percentages
            {
                $project: {
                    _id: 0,
                    organizationId: "$_id.organizationId",
                    roleGroup: "$_id.roleGroup",
                    totalExpected: 1,
                    totalAttendance: 1,
                    attendancePercentage: { $cond: [{ $eq: ["$totalExpected", 0] }, 0, { $multiply: [{ $divide: ["$totalAttendance", "$totalExpected"] }, 100] }] },
                    late: 1,
                    latePercentage: { $cond: [{ $eq: ["$totalExpected", 0] }, 0, { $multiply: [{ $divide: ["$late", "$totalExpected"] }, 100] }] },
                    undertime: 1,
                    undertimePercentage: { $cond: [{ $eq: ["$totalExpected", 0] }, 0, { $multiply: [{ $divide: ["$undertime", "$totalExpected"] }, 100] }] },
                    overBreaks: 1,
                    overBreakPercentage: { $cond: [{ $eq: ["$totalExpected", 0] }, 0, { $multiply: [{ $divide: ["$overBreaks", "$totalExpected"] }, 100] }] }
                }
            },
            { $sort: { roleGroup: 1 } }
        ];

        return await attendanceCol.aggregate(pipeline).toArray();
    }

    static async getAttendanceUsers({
        startDate = null,
        endDate = null,
        filter = "all",
        role,
        userId,
    } = {}) {
        const db = await connectDB();
        const collection = db.collection(this.#collection_attendance);

        const matchStage = {};
        if (startDate && endDate) {
            matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            matchStage.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            matchStage.createdAt = { $lte: new Date(endDate) };
        }

        switch (filter) {
            case "timeIn":
                matchStage.timeIn = { $exists: true, $ne: null };
                break;
            case "timeOut":
                matchStage.timeOut = { $exists: true, $ne: null };
                break;
            case "late":
                matchStage.$expr = { $gt: ["$timeIn", "$shiftStart"] };
                break;
            case "onBreak":
                matchStage.status = "On Break";
                break;
            case "onLunch":
                matchStage.status = "On Lunch";
                break;
            case "undertime":
                matchStage.timeOut = { $exists: true, $ne: null };
                matchStage.$expr = { $lt: ["$timeOut", "$shiftEnd"] };
                break;
            case "all":
            default:
                break;
        }

        const pipeline = [
            ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),

            // Join with users
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },

            ...(role === Roles.TEAM_LEADER
                ? [{ $match: { "user.teamLeaderId": new ObjectId(userId) } }]
                : []),

            ...(role === Roles.MANAGER
                ? [
                    {
                        $match: {
                            $or: [
                                { "user.role": { $in: [Roles.BACK_OFFICE_HEAD, Roles.OPERATION_ASSOCIATE, Roles.TRAINER_QUALITY_ASSURANCE] } },
                                { "user.groupId": new ObjectId("64f600000000000000000003") },
                            ],
                        },
                    },
                ]
                : []),

            ...(role === Roles.BACK_OFFICE_HEAD
                ? [{ $match: { "user.role": Roles.TRAINER_QUALITY_ASSURANCE } }]
                : []),

            // Add overBreak calculation per attendance
            {
                $addFields: {
                    overBreak: {
                        $cond: [
                            { $and: ["$breakStart", "$breakEnd"] },
                            { $gt: [{ $divide: [{ $subtract: ["$breakEnd", "$breakStart"] }, 1000 * 60] }, 90] },
                            false
                        ]
                    }
                }
            },

            {
                $addFields: {
                    roleTitleCase: {
                        $trim: {
                            input: {
                                $reduce: {
                                    input: { $split: [{ $replaceAll: { input: "$user.role", find: "-", replacement: " " } }, " "] },
                                    initialValue: "",
                                    in: {
                                        $concat: [
                                            "$$value",
                                            { $cond: [{ $eq: ["$$value", ""] }, "", " "] },
                                            {
                                                $concat: [
                                                    { $toUpper: { $substrCP: ["$$this", 0, 1] } },
                                                    { $toLower: { $substrCP: ["$$this", 1, { $strLenCP: "$$this" }] } }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },

            // Group by user
            {
                $group: {
                    _id: "$user._id",
                    name: { $first: { $concat: ["$user.firstName", " ", "$user.lastName"] } },
                    email: { $first: "$user.email" },
                    role: { $first: "$roleTitleCase" },
                    total: { $sum: 1 },
                    timedIn: { $sum: { $cond: [{ $ifNull: ["$timeIn", false] }, 1, 0] } },
                    timedOut: { $sum: { $cond: [{ $ifNull: ["$timeOut", false] }, 1, 0] } },
                    late: { $sum: { $cond: [{ $gt: ["$timeIn", "$shiftStart"] }, 1, 0] } },
                    undertime: { $sum: { $cond: [{ $lt: ["$timeOut", "$shiftEnd"] }, 1, 0] } },
                    overBreak: { $sum: { $cond: ["$overBreak", 1, 0] } }, // <-- new field
                },
            },

            { $sort: { total: -1 } },
        ];

        const result = await collection.aggregate(pipeline).toArray();
        return result;
    }

    static async getAttendanceListPerUser({
        startDate = null,
        endDate = null,
        filter = "all",
        role,
        loggedUserId,
        userFilterId = null,
    } = {}) {
        const db = await connectDB();
        const collection = db.collection(this.#collection_attendance);

        const matchStage = {};

        // Filter by date range
        if (startDate && endDate) {
            matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Filter by specific user
        if (userFilterId) {
            matchStage.userId = new ObjectId(userFilterId);
        }

        // Apply optional filters
        switch (filter) {
            case "timeIn":
                matchStage.timeIn = { $exists: true, $ne: null };
                break;
            case "timeOut":
                matchStage.timeOut = { $exists: true, $ne: null };
                break;
            case "late":
                matchStage.$expr = { $gt: ["$timeIn", "$shiftStart"] };
                break;
            case "undertime":
                matchStage.timeOut = { $exists: true, $ne: null };
                matchStage.$expr = { $lt: ["$timeOut", "$shiftEnd"] };
                break;
            case "overBreak":
                // will filter after calculating overBreak
                break;
            case "all":
            default:
                break;
        }

        const pipeline = [
            { $match: matchStage },
            { $sort: { createdAt: -1 } },

            // Join with users
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },

            // Optional: Apply Team Leader filter
            ...(role === "TEAM_LEADER" ? [{ $match: { "user.teamLeaderId": new ObjectId(loggedUserId) } }] : []),

            // Calculate overBreak
            {
                $addFields: {
                    overBreak: {
                        $cond: [
                            { $and: ["$breakStart", "$breakEnd"] },
                            { $gt: [{ $divide: [{ $subtract: ["$breakEnd", "$breakStart"] }, 1000 * 60] }, 90] },
                            false
                        ]
                    }
                }
            },

            // Filter only overBreak if requested
            ...(filter === "overBreak" ? [{ $match: { overBreak: true } }] : []),

            // Project fields
            {
                $project: {
                    userId: 1,
                    timeIn: 1,
                    timeOut: 1,
                    shiftStart: 1,
                    shiftEnd: 1,
                    status: 1,
                    breakStart: 1,
                    breakEnd: 1,
                    overBreak: 1,
                    createdAt: 1,
                    user: {
                        _id: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1
                    }
                }
            }
        ];

        return await collection.aggregate(pipeline).toArray();
    }

    static async getTopThreePerOrganization({
        startDate = null,
        endDate = null,
    } = {}) {
        const db = await connectDB();
        const collection = db.collection(this.#collection_attendance);

        // 🔹 Default to current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const matchStage = {
            createdAt: {
                $gte: startDate ? new Date(startDate) : monthStart,
                $lte: endDate ? new Date(endDate) : monthEnd,
            },
        };

        const ROLE_GROUPS = {
            ADMIN_MANAGEMENT: [
                "admin",
                "compliance",
                "compliance-head",
                "admin-hr-head",
                "human-resources",
                "operations-manager",
            ],
            OPERATION_MANAGEMENT: [
                "manager",
                "back-office-head",
                "operations-associate",
                "trainer-quality-assurance",
                "quality-assurance",
                "team-leader",
            ],
            OPERATIONS: ["agent"],
        };

        const pipeline = [
            { $match: matchStage },

            // 🔹 Join users
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },

            // 🔹 Calculate overBreak per attendance
            {
                $addFields: {
                    overBreak: {
                        $cond: [
                            { $and: ["$breakStart", "$breakEnd"] },
                            {
                                $gt: [
                                    {
                                        $divide: [
                                            { $subtract: ["$breakEnd", "$breakStart"] },
                                            1000 * 60,
                                        ],
                                    },
                                    90, // 1 hr 30 mins
                                ],
                            },
                            false,
                        ],
                    },
                },
            },

            // 🔹 Group per user
            {
                $group: {
                    _id: "$user._id",
                    name: {
                        $first: {
                            $concat: ["$user.firstName", " ", "$user.lastName"],
                        },
                    },
                    email: { $first: "$user.email" },
                    role: { $first: "$user.role" },

                    total: { $sum: 1 },
                    late: {
                        $sum: { $cond: [{ $gt: ["$timeIn", "$shiftStart"] }, 1, 0] },
                    },
                    undertime: {
                        $sum: { $cond: [{ $lt: ["$timeOut", "$shiftEnd"] }, 1, 0] },
                    },
                    overBreaks: {
                        $sum: { $cond: ["$overBreak", 1, 0] },
                    },
                },
            },

            // 🔹 Score calculation
            {
                $addFields: {
                    score: {
                        $subtract: [
                            "$total",
                            {
                                $add: [
                                    { $multiply: ["$late", 2] },
                                    { $multiply: ["$undertime", 2] },
                                    "$overBreaks",
                                ],
                            },
                        ],
                    },
                },
            },

            // 🔹 Assign role group
            {
                $addFields: {
                    roleGroup: {
                        $switch: {
                            branches: [
                                {
                                    case: { $in: ["$role", ROLE_GROUPS.ADMIN_MANAGEMENT] },
                                    then: "ADMIN_MANAGEMENT",
                                },
                                {
                                    case: { $in: ["$role", ROLE_GROUPS.OPERATION_MANAGEMENT] },
                                    then: "OPERATION_MANAGEMENT",
                                },
                                {
                                    case: { $in: ["$role", ROLE_GROUPS.OPERATIONS] },
                                    then: "OPERATIONS",
                                },
                            ],
                            default: "OTHER",
                        },
                    },
                },
            },

            // 🔹 Rank best employees
            { $sort: { score: -1, total: -1 } },

            // 🔹 Transform role to Title Case with spaces
            {
                $addFields: {
                    roleTitleCase: {
                        $trim: {
                            input: {
                                $reduce: {
                                    input: {
                                        $split: [
                                            {
                                                $replaceAll: {
                                                    input: { $replaceAll: { input: "$user.role", find: "-", replacement: " " } },
                                                    find: "_",
                                                    replacement: " ",
                                                }
                                            },
                                            " "
                                        ],
                                    },
                                    initialValue: "",
                                    in: {
                                        $concat: [
                                            "$$value",
                                            { $cond: [{ $eq: ["$$value", ""] }, "", " "] },
                                            {
                                                $concat: [
                                                    { $toUpper: { $substrCP: ["$$this", 0, 1] } },
                                                    { $toLower: { $substrCP: ["$$this", 1, { $strLenCP: "$$this" }] } }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },

            // 🔹 Top 3 per role group
            {
                $group: {
                    _id: "$roleGroup",
                    topEmployees: {
                        $push: {
                            userId: "$_id",
                            name: "$name",
                            email: "$email",
                            role: "$role",
                            score: "$score",
                            total: "$total",
                            late: "$late",
                            undertime: "$undertime",
                            overBreak: "$overBreaks",
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    roleGroup: "$_id",
                    top3: { $slice: ["$topEmployees", 3] },
                },
            },
        ];

        return await collection.aggregate(pipeline).toArray();
    }

}

export default Analytics;
