// index.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

const server = createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Database setup ---
const db = await connectDB();
const attendancesCollection = db.collection("attendances");
const usersCollection = db.collection("users");

// --- Cache to store "On Break" attendances ---
const attendanceCache = new Map();

// --- Function to build a cache record ---
async function buildAttendanceRecord(attendanceDoc) {
  const userDoc = await usersCollection.findOne(
    { _id: attendanceDoc.userId },
    { projection: { firstName: 1, lastName: 1 } }
  );

  return {
    attendanceId: attendanceDoc._id,
    firstName: userDoc.firstName || null,
    lastName: userDoc.lastName || null,
    employeeId: attendanceDoc.employeeId || null,
    breaks: attendanceDoc.breaks || [],
    totalBreakTime: attendanceDoc.totalBreak,
    updatedAt: attendanceDoc.updatedAt,
  };
}

// --- Initial fetch: populate cache with all "On Break" records ---
async function populateInitialCache() {
  const onBreakAttendances = await attendancesCollection
    .find({ status: "On Break" })
    .toArray();

  for (const attendanceDoc of onBreakAttendances) {
    const record = await buildAttendanceRecord(attendanceDoc);
    attendanceCache.set(attendanceDoc._id.toString(), record);
  }

  // Emit initial cache to frontend
  io.emit("attendances-updated", Array.from(attendanceCache.values()));
  console.log(`Initial cache populated, total ${attendanceCache.size}`);
}

// --- Watch for status changes in attendances ---
const changeStream = attendancesCollection.watch([
  { $match: { "updateDescription.updatedFields.status": { $exists: true } } },
]);

changeStream.on("change", async (change) => {
  try {
    const { documentKey } = change;
    const attendanceId = documentKey._id;

    const attendanceDoc = await attendancesCollection.findOne({
      _id: attendanceId,
    });
    if (!attendanceDoc) return;

    if (attendanceDoc.status !== "On Break") {
      attendanceCache.delete(attendanceDoc._id.toString());
    } else {
      const record = await buildAttendanceRecord(attendanceDoc);
      attendanceCache.set(attendanceDoc._id.toString(), record);
    }

    io.emit("attendances-updated", Array.from(attendanceCache.values()));
    console.log(`Updated attendance array, total ${attendanceCache.size}`);
  } catch (err) {
    console.error("Error processing change:", err);
  }
});

// --- Start server and populate cache ---
server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await populateInitialCache();
});
