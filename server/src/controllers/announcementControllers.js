import Announcement from "../model/Announcement.js";
import { DateTime } from "luxon";

export const getAnnouncements = async (req, res) => {
  try {
    // Note: Sa pag-shift sa Cloudinary, babalik ang bilis dahil maliit na URL na lang ang attachment.
    const announcements = await Announcement.getAll();
    return res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

export const addAnnouncement = async (req, res) => {
  const data = req.body;
  try {
    // 1. Duration Logic: Calculate expiresAt
    if (data.duration && data.duration !== 'permanent') {
      const start = DateTime.fromISO(data.dateTime);
      let end;
      
      switch(data.duration) {
          case '24h': end = start.plus({ hours: 24 }); break;
          case '3d': end = start.plus({ days: 3 }); break;
          case '1w': end = start.plus({ weeks: 1 }); break;
          case '1m': end = start.plus({ months: 1 }); break;
      }
      
      if (end) data.expiresAt = end.toISO();
    }
    
    // 2. Approval Logic (Uses isHead flag passed from frontend)
    // If isHead is true (i.e., ADMIN_HR_HEAD or COMPLIANCE_HEAD), auto-approve.
    const { isHead, postedBy } = data;

    if (isHead) {
        // Authorized Head is posting, auto-approve
        data.approvalStatus = "Approved";
        data.status = "Active";
        data.approvedBy = postedBy; 
        data.approvedAt = new Date().toISOString();
    } else {
        // Admin/Subordinate is posting, requires Head approval.
        data.approvalStatus = "Pending";
        data.status = "Inactive";
    }

    // 💡 CLOUDINARY FIX: Ang data.attachment ay naglalaman na ng Cloudinary URL/details,
    // hindi na ito Base64 string. Direkta na itong ini-store sa DB.

    const announcement = await Announcement.create(data);
    return res.status(201).json(announcement);
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).json({
      message: "Failed to add announcement",
      error: error.message,
    });
  }
};

// NEW: Approve Endpoint
export const approveAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { approverName } = req.body;

  try {
    const result = await Announcement.approve(id, approverName);
    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to approve announcement:", error);
    res.status(500).json({
      message: "Failed to approve announcement",
      error: error.message,
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // 💡 CLOUDINARY FIX: Kung ang update ay may kasamang attachment, Cloudinary details na ito.
    
    // Duration Logic for updates (Optional: re-calculate expiresAt if duration/dateTime changed)
    if (updatedData.duration && updatedData.duration !== 'permanent' && updatedData.dateTime) {
        const start = DateTime.fromISO(updatedData.dateTime);
        let end;
        
        switch(updatedData.duration) {
            case '24h': end = start.plus({ hours: 24 }); break;
            case '3d': end = start.plus({ days: 3 }); break;
            case '1w': end = start.plus({ weeks: 1 }); break;
            case '1m': end = start.plus({ months: 1 }); break;
        }
        
        if (end) updatedData.expiresAt = end.toISO();
    }


    const updatedAnnouncement = await Announcement.update(id, updatedData);
    res.status(200).json(updatedAnnouncement); // Return the updated announcement for frontend refresh
  } catch (error) {
    console.error("Failed to update announcement:", error);
    res.status(500).json({
      message: "Failed to update announcement",
      error: error.message,
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.delete(id);
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (e) {
    console.error("Failed to delete announcement:", e);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

export const addView = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ message: "User ID and name are required" });
    }

    const updatedAnnouncement = await Announcement.addView(id, userId, userName);
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error adding view:", error);
    res.status(500).json({
      message: "Failed to add view",
      error: error.message,
    });
  }
};

export const addAcknowledgement = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ message: "User ID and name are required" });
    }

    const updatedAnnouncement = await Announcement.addAcknowledgement(id, userId, userName);
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error adding acknowledgement:", error);
    res.status(500).json({
      message: "Failed to add acknowledgement",
      error: error.message,
    });
  }
};

export const removeAcknowledgement = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const updatedAnnouncement = await Announcement.removeAcknowledgement(id, userId);
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error removing acknowledgement:", error);
    res.status(500).json({
      message: "Failed to remove acknowledgement",
      error: error.message,
    });
  }
};