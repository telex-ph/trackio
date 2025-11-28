import express from "express";
const router = express.Router();

import {
  addAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  addView,
  addAcknowledgement,
  removeAcknowledgement
} from "../controllers/announcementControllers.js";

// GET all announcements
router.get("/", getAnnouncements);

// POST a new announcement
router.post("/", addAnnouncement);

// PUT (Update) an existing announcement
router.put("/:id", updateAnnouncement);

// DELETE an announcement
router.delete("/:id", deleteAnnouncement);

// POST - Add view to announcement
router.post("/:id/view", addView);

// POST - Add acknowledgement (like) to announcement
router.post("/:id/acknowledge", addAcknowledgement);

// DELETE - Remove acknowledgement (unlike) from announcement
router.delete("/:id/acknowledge", removeAcknowledgement);

export default router;