import express from "express";
const router = express.Router();
import { ObjectId } from "mongodb";
import connectDB from "../config/db.js";

import {
  addAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  addView,
  addAcknowledgement,
  removeAcknowledgement
} from "../controllers/announcementControllers.js";
import Announcement from "../model/Announcement.js";

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

// NEW ROUTES FOR ENHANCED LIKES AND VIEWS SYSTEM

// GET user interactions (views and likes)
router.get("/user-interactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const db = await connectDB();
    const interactions = await db.collection('userinteractions').find({ 
      userId 
    }).toArray();
    
    const views = interactions
      .filter(i => i.interactionType === 'view')
      .map(i => i.announcementId);
      
    const likes = interactions
      .filter(i => i.interactionType === 'like')
      .map(i => i.announcementId);
    
    res.json({ views, likes });
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST save user interaction (view or like)
router.post("/user-interactions", async (req, res) => {
  try {
    const { userId, announcementId, interactionType } = req.body;
    
    if (!userId || !announcementId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await connectDB();
    
    // Check if interaction already exists
    const existing = await db.collection('userinteractions').findOne({
      userId,
      announcementId,
      interactionType
    });
    
    if (!existing) {
      const interaction = {
        userId,
        announcementId,
        interactionType,
        timestamp: new Date()
      };
      
      await db.collection('userinteractions').insertOne(interaction);
      
      // Update announcement counts
      if (interactionType === 'view') {
        await db.collection('announcements').updateOne(
          { _id: new ObjectId(announcementId) },
          { $inc: { viewsCount: 1 } }
        );
      } else if (interactionType === 'like') {
        await db.collection('announcements').updateOne(
          { _id: new ObjectId(announcementId) },
          { $inc: { likesCount: 1 } }
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving user interaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET likes count for specific announcement
router.get("/:announcementId/likes", async (req, res) => {
  try {
    const { announcementId } = req.params;
    
    const db = await connectDB();
    
    // Get from announcements collection
    const announcement = await db.collection('announcements').findOne(
      { _id: new ObjectId(announcementId) },
      { projection: { likesCount: 1 } }
    );
    
    const likesCount = announcement?.likesCount || 0;
    
    res.json({ likesCount });
  } catch (error) {
    console.error('Error fetching likes count:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET views count for specific announcement
router.get("/:announcementId/views", async (req, res) => {
  try {
    const { announcementId } = req.params;
    
    const db = await connectDB();
    
    // Get from announcements collection
    const announcement = await db.collection('announcements').findOne(
      { _id: new ObjectId(announcementId) },
      { projection: { viewsCount: 1 } }
    );
    
    const viewsCount = announcement?.viewsCount || 0;
    
    res.json({ viewsCount });
  } catch (error) {
    console.error('Error fetching views count:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all likes count (for multiple announcements)
router.post("/bulk/likes", async (req, res) => {
  try {
    const { announcementIds } = req.body;
    
    if (!announcementIds || !Array.isArray(announcementIds)) {
      return res.status(400).json({ error: 'announcementIds array is required' });
    }

    const db = await connectDB();
    
    const objectIds = announcementIds.map(id => new ObjectId(id));
    
    const announcements = await db.collection('announcements').find(
      { _id: { $in: objectIds } },
      { projection: { _id: 1, likesCount: 1 } }
    ).toArray();
    
    const likesMap = {};
    announcements.forEach(announcement => {
      likesMap[announcement._id.toString()] = announcement.likesCount || 0;
    });
    
    res.json({ likesMap });
  } catch (error) {
    console.error('Error fetching bulk likes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all views count (for multiple announcements)
router.post("/bulk/views", async (req, res) => {
  try {
    const { announcementIds } = req.body;
    
    if (!announcementIds || !Array.isArray(announcementIds)) {
      return res.status(400).json({ error: 'announcementIds array is required' });
    }

    const db = await connectDB();
    
    const objectIds = announcementIds.map(id => new ObjectId(id));
    
    const announcements = await db.collection('announcements').find(
      { _id: { $in: objectIds } },
      { projection: { _id: 1, viewsCount: 1 } }
    ).toArray();
    
    const viewsMap = {};
    announcements.forEach(announcement => {
      viewsMap[announcement._id.toString()] = announcement.viewsCount || 0;
    });
    
    res.json({ viewsMap });
  } catch (error) {
    console.error('Error fetching bulk views:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE user interaction (unlike)
router.delete("/user-interactions", async (req, res) => {
  try {
    const { userId, announcementId, interactionType } = req.body;
    
    if (!userId || !announcementId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await connectDB();
    
    // Delete the interaction
    const result = await db.collection('userinteractions').deleteOne({
      userId,
      announcementId,
      interactionType
    });
    
    // Update announcement counts
    if (interactionType === 'like' && result.deletedCount > 0) {
      await db.collection('announcements').updateOne(
        { _id: new ObjectId(announcementId) },
        { $inc: { likesCount: -1 } }
      );
    }
    
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting user interaction:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;