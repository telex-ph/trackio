import Announcement from "../model/Announcement.js";
import { DateTime } from "luxon";

export const getAnnouncements = async (req, res) => {
  try {
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
    
    // 2. Approval Logic
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

// ✅ FIXED: Approve Endpoint
export const approveAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { approverName, approverRole, approvedAt, dateTime, expiresAt } = req.body;

  try {
    console.log(`✅ Approving announcement: ${id}`);
    console.log(`Approver: ${approverName}, Role: ${approverRole}`);
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    // Update announcement
    announcement.approvalStatus = "Approved";
    announcement.status = "Active";
    announcement.approvedBy = approverName;
    announcement.approverRole = approverRole;
    announcement.approvedAt = approvedAt || new Date().toISOString();
    announcement.dateTime = dateTime || new Date().toISOString();
    
    if (expiresAt) {
      announcement.expiresAt = expiresAt;
    } else {
      // Recalculate expiresAt if not provided
      const start = DateTime.fromISO(announcement.dateTime);
      if (announcement.duration && announcement.duration !== 'permanent') {
        let end;
        switch(announcement.duration) {
          case '24h': end = start.plus({ hours: 24 }); break;
          case '3d': end = start.plus({ days: 3 }); break;
          case '1w': end = start.plus({ weeks: 1 }); break;
          case '1m': end = start.plus({ months: 1 }); break;
        }
        if (end) announcement.expiresAt = end.toISO();
      }
    }
    
    // Reset stats
    announcement.views = [];
    announcement.acknowledgements = [];
    announcement.updatedAt = new Date().toISOString();
    
    const updatedAnnouncement = await announcement.save();
    
    console.log(`✅ Announcement approved successfully: ${id}`);
    
    // Emit socket events
    if (req.io) {
      req.io.emit('announcementApproved', updatedAnnouncement);
      req.io.emit('announcementUpdated', updatedAnnouncement);
      req.io.emit('newAnnouncement', updatedAnnouncement);
    }
    
    res.status(200).json({
      success: true,
      message: 'Announcement approved successfully',
      data: updatedAnnouncement
    });
    
  } catch (error) {
    console.error("Failed to approve announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve announcement",
      error: error.message,
    });
  }
};

// ✅ ADDED: Cancel Approval Endpoint
export const cancelApproval = async (req, res) => {
  const { id } = req.params;
  const { cancelledBy, reason } = req.body;

  try {
    console.log(`❌ Cancelling approval for announcement: ${id}`);
    console.log(`Cancelled by: ${cancelledBy}`);
    
    const announcement = await Announcement.findById(id);
    
    if (!announcement) {
      console.log(`⚠️ Announcement ${id} not found`);
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }
    
    // Check if already cancelled
    if (announcement.approvalStatus === 'Cancelled') {
      console.log(`⚠️ Announcement ${id} already cancelled`);
      return res.status(400).json({ 
        success: false, 
        message: 'Announcement already cancelled' 
      });
    }
    
    // Update the announcement
    const currentTime = new Date().toISOString();
    
    announcement.approvalStatus = 'Cancelled';
    announcement.status = 'Inactive';
    announcement.cancelledBy = cancelledBy || 'Unknown';
    announcement.cancelledAt = currentTime;
    announcement.cancellationReason = reason || 'Approval cancelled by approver';
    announcement.views = [];
    announcement.acknowledgements = [];
    announcement.updatedAt = currentTime;
    
    const updatedAnnouncement = await announcement.save();
    
    console.log(`✅ Approval cancelled successfully for: ${id}`);
    console.log(`Updated status: ${updatedAnnouncement.approvalStatus}, ${updatedAnnouncement.status}`);
    
    // Emit socket events
    if (req.io) {
      req.io.emit('approvalCancelled', updatedAnnouncement);
      req.io.emit('announcementUpdated', updatedAnnouncement);
      console.log(`📢 Socket events emitted for cancelled announcement: ${id}`);
    }
    
    res.status(200).json({
      success: true,
      message: 'Approval cancelled successfully',
      data: updatedAnnouncement
    });
    
  } catch (error) {
    console.error('❌ Error cancelling approval:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling approval',
      error: error.message 
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Duration Logic for updates
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
    res.status(200).json(updatedAnnouncement);
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