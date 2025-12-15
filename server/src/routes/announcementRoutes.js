import express from "express";
const router = express.Router();

import {
  addAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  addView,
  addAcknowledgement,
  removeAcknowledgement,
  approveAnnouncement,
  cancelApproval,
} from "../controllers/announcementControllers.js";

// GET all announcements
router.get("/", getAnnouncements);

// POST a new announcement
router.post("/", addAnnouncement);

// PUT (Update) an existing announcement
router.put("/:id", updateAnnouncement);
router.patch("/:id", updateAnnouncement);
// DELETE an announcement
router.delete("/:id", deleteAnnouncement);

// POST - Approve announcement (New Route)
router.post("/:id/approve", approveAnnouncement);

router.post("/:id/cancel-approval", cancelApproval);
router.patch("/:id/cancel-approval", cancelApproval);

// POST - Add view to announcement
router.post("/:id/view", addView);

// POST - Add acknowledgement (like) to announcement
router.post("/:id/acknowledge", addAcknowledgement);

// DELETE - Remove acknowledgement (unlike) from announcement
router.delete("/:id/acknowledge", removeAcknowledgement);

export default router;