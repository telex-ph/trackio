import connectDB from "../config/db.js";

export const getAttendance = async (req, res) => {
  const db = await connectDB();

  const collection = await db.collection("attendances");

  const attendances = await collection
    .aggregate([
      {
        $sort: { createdAt: 1 }, // sort by createdAt first
      },
      {
        $lookup: {
          from: "users", // the collection with user details
          localField: "userId", // field in attendances
          foreignField: "_id", // field in users
          as: "user", // output array field
        },
      },
      {
        $unwind: "$user", // convert user array to single object
      },
    ])
    .toArray();
  res.status(200).json(attendances);
};
