import express from "express";
const router = express.Router();
import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

import {
  addAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcementControllers.js";
import Announcement from "../model/Announcement.js";

// GET all announcements
router.get("/", getAnnouncements);

// POST a new announcement
router.post("/", addAnnouncement);

// PUT (Update) an existing announcement
router.put("/:id", updateAnnouncement);

// DELETE an announcement
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.delete(id);
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (e) {
    console.error("Failed to delete announcement:", e);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

export default router;