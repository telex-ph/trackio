import { DateTime } from "luxon";
import { STATUS } from "../../../../client/src/constants/status.js";
import connectDB from "../../config/db.js";

const COLLECTION = "attendances";

export default async function statusHandler(io) {
  try {
    const db = await connectDB();
    const collection = db.collection(COLLECTION);

    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace"] },
        },
      },
    ]);

    const fetchAndEmit = async () => {
      const now = DateTime.now().setZone("Asia/Manila");
      const startOfYesterday = now.minus({ days: 1 }).startOf("day").toJSDate();
      const startOfTomorrow = now.plus({ days: 1 }).startOf("day").toJSDate();

      // const onBreakDocs = await collection
      //   .find({
      //     status: STATUS.ON_BREAK,
      //     createdAt: { $gte: startOfYesterday, $lt: startOfTomorrow },
      //   })
      //   .sort({ updatedAt: -1 })
      //   .toArray();

      const onBreakDocs = await collection
        .aggregate([
          //     // Sort latest first
          { $sort: { createdAt: -1 } },
          {
            $match: {
              status: { $in: [STATUS.ON_BREAK, STATUS.WORKING] },
              createdAt: { $gte: startOfYesterday, $lt: startOfTomorrow },
              breaks: { $exists: true },
            },
          },

          // Lookup User
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },

          { $unwind: "$user" },

          {
            $project: {
              _id: 1,
              firstName: "$user.firstName",
              lastName: "$user.lastName",
              employeeId: 1,
              breaks: 1,
              status: 1,
              totalBreakTime: "$totalBreak",
              updatedAt: 1,
            },
          },
        ])
        .toArray();

      return onBreakDocs;
    };

    changeStream.on("change", async () => {
      const docs = await fetchAndEmit();
      io.emit("statuses", docs);
    });

    // // Emit once on startup
    io.on("connection", async (socket) => {
      const docs = await fetchAndEmit();
      socket.emit("statuses", docs);
    });

    console.log("MongoDB attendance watcher started");
  } catch (error) {
    console.error("Error in statusHandler:", error);
  }
}
