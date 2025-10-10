import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  addAttendance,
  getAttendances,
  getAttendance,
  updateAttendance,
  updateField,
} from "../controllers/attendanceControllers.js";
import connectDB from "../config/db.js";

const router = Router();

router.post("/add-attendance/:id", verifyJWT, addAttendance);

router.get("/get-attendances", verifyJWT, getAttendances);

router.get("/get-attendance/:id", verifyJWT, getAttendance);

// TODO: refactor kasi super messy code HAHAHHAHAAH
router.patch("/update-attendance", verifyJWT, updateAttendance);

router.patch("/update-attendance-field", verifyJWT, updateField);

const COLLECTION = "attendances";

// Format duration helper
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// 🟢 START BREAK
router.post("/start", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = await db.collection(COLLECTION);

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if there's already an active break
    const existingBreak = await collection.findOne({
      userId,
      breakEnd: { $exists: false },
    });

    if (existingBreak) {
      return res
        .status(400)
        .json({ error: "You already have an active break." });
    }

    const now = new Date();
    const maxBreakDurationMs = 1.5 * 60 * 60 * 1000; // 1 hour 30 mins

    const result = await collection.insertOne({
      userId,
      breakStart: now,
      maxBreakDurationMs,
      createdAt: now,
    });

    return res.status(201).json({
      message: "Break started successfully.",
      breakId: result.insertedId,
      breakStart: now,
    });
  } catch (error) {
    console.error("Error starting break:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔴 END BREAK
router.patch("/end", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = await db.collection(COLLECTION);

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const ongoing = await collection.findOne({
      userId,
      breakEnd: { $exists: false },
    });

    if (!ongoing) {
      return res.status(404).json({ error: "No active break found." });
    }

    const breakEnd = new Date();
    const durationMs = breakEnd - ongoing.breakStart;

    await collection.updateOne(
      { _id: ongoing._id },
      {
        $set: {
          breakEnd,
          durationMs,
          durationFormatted: formatDuration(durationMs),
          updatedAt: breakEnd,
        },
      }
    );

    return res.json({
      message: "Break ended successfully.",
      durationMs,
      durationFormatted: formatDuration(durationMs),
    });
  } catch (error) {
    console.error("Error ending break:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
