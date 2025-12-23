import Announcement from "./announcement.model.js";
import { DateTime } from "luxon";

// 💡 RECOMMENDATION: Magdagdag ng pagination (limit/skip) sa getAll() logic
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
    if (data.duration && data.duration !== "permanent") {
      const start = DateTime.fromISO(data.dateTime);

      if (!start.isValid) {
        return res
          .status(400)
          .json({ message: "Invalid starting date format (dateTime)." });
      }

      let end;

      switch (data.duration) {
        case "24h":
          end = start.plus({ hours: 24 });
          break;
        case "3d":
          end = start.plus({ days: 3 });
          break;
        case "1w":
          end = start.plus({ weeks: 1 });
          break;
        case "1m":
          end = start.plus({ months: 1 });
          break;
        default:
          end = null;
      }

      if (end) data.expiresAt = end.toISO();
    }

    // 2. Approval Logic
    const { isHead, postedBy } = data;

    if (isHead) {
      data.approvalStatus = "Approved";
      data.status = "Active";
      data.approvedBy = postedBy;
      data.approvedAt = new Date().toISOString();
    } else {
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

export const approveAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { approverName, approverRole, approvedAt, dateTime, expiresAt } =
    req.body;

  console.log("✅ Request received to approve announcement:", id);

  try {
    const announcement = await Announcement.getById(id);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    const currentDateTime = new Date();

    // Parse dates
    const approvedAtDate = new Date(approvedAt || currentDateTime);
    const dateTimeDate = new Date(
      dateTime || announcement.dateTime || currentDateTime
    );

    // Handle expiresAt logic
    let expiresAtDate = null;
    if (expiresAt && typeof expiresAt === "string" && expiresAt.trim() !== "") {
      const dateObj = new Date(expiresAt);
      expiresAtDate = isNaN(dateObj.getTime()) ? null : dateObj;
    } else if (announcement.expiresAt) {
      expiresAtDate = announcement.expiresAt;
    } else if (announcement.duration && announcement.duration !== "permanent") {
      // Calculate expiresAt based on duration if not provided
      const start = new Date(dateTimeDate);
      switch (announcement.duration) {
        case "24h":
          expiresAtDate = new Date(start.setHours(start.getHours() + 24));
          break;
        case "3d":
          expiresAtDate = new Date(start.setDate(start.getDate() + 3));
          break;
        case "1w":
          expiresAtDate = new Date(start.setDate(start.getDate() + 7));
          break;
        case "1m":
          expiresAtDate = new Date(start.setMonth(start.getMonth() + 1));
          break;
      }
    }

    // 🚨 CRITICAL: Calculate real-time status based on dates
    let calculatedStatus = "Active";

    // Check if announcement has expired
    if (expiresAtDate && new Date(expiresAtDate) < currentDateTime) {
      calculatedStatus = "Expired";
    }
    // Check if announcement is scheduled for future
    else if (dateTimeDate && new Date(dateTimeDate) > currentDateTime) {
      calculatedStatus = "Scheduled";
    }

    const updatePayload = {
      approvalStatus: "Approved",
      status: calculatedStatus, // Use calculated status instead of hardcoded "Active"
      approvedBy: approverName,
      approverRole: approverRole,
      approvedAt: approvedAtDate,
      dateTime: dateTimeDate,
      expiresAt: expiresAtDate,
      updatedAt: currentDateTime,
      // Keep existing views and acknowledgements if they exist
      views: announcement.views || [],
      acknowledgements: announcement.acknowledgements || [],
    };

    console.log("📋 Update payload:", updatePayload);

    const updatedAnnouncement = await Announcement.update(id, updatePayload);
    console.log("✅ Updated announcement result:", updatedAnnouncement);

    res.status(200).json({
      success: true,
      message: "Announcement approved successfully!",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("❌ Error approving announcement:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve announcement",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const cancelApproval = async (req, res) => {
  const { id } = req.params;
  const { cancelledBy, reason } = req.body;

  try {
    const announcement = await Announcement.getById(id);

    if (!announcement) {
      return res
        .status(404)
        .json({ success: false, message: "Announcement not found" });
    }

    if (announcement.approvalStatus === "Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Announcement already cancelled" });
    }

    const currentTime = new Date();

    const updatePayload = {
      approvalStatus: "Cancelled",
      status: "Inactive",
      cancelledBy: cancelledBy || "Unknown",
      cancelledAt: currentTime, // Date object
      cancellationReason: reason || "Approval cancelled by approver",
      views: [],
      acknowledgements: [],
      updatedAt: currentTime,
    };

    const updatedAnnouncement = await Announcement.update(id, updatePayload);

    if (!updatedAnnouncement) {
      throw new Error(
        "Failed to update announcement status. Document may have been deleted."
      );
    }

    // 🛑 INFINITE LOOP FIX: WALANG req.io.emit() dito.

    res.status(200).json({
      success: true,
      message: "Approval cancelled successfully",
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error("❌ Error cancelling approval:", error.stack || error);
    res.status(500).json({
      success: false,
      message: "Error cancelling approval",
      error: error.message,
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Security/Data Integrity: Linisin ang updatedData
    delete updatedData._id;
    delete updatedData.createdAt;
    updatedData.updatedAt = new Date();

    // Duration Logic for updates
    if (
      updatedData.duration &&
      updatedData.duration !== "permanent" &&
      updatedData.dateTime
    ) {
      const start = DateTime.fromISO(updatedData.dateTime);
      let end;

      switch (updatedData.duration) {
        case "24h":
          end = start.plus({ hours: 24 });
          break;
        case "3d":
          end = start.plus({ days: 3 });
          break;
        case "1w":
          end = start.plus({ weeks: 1 });
          break;
        case "1m":
          end = start.plus({ months: 1 });
          break;
      }

      if (end) updatedData.expiresAt = end.toISO();
    }

    // 🛑 FIX: I-convert ang expiresAt at dateTime sa Date object bago i-update (Malinis na)
    if (updatedData.expiresAt) {
      const dateObj = new Date(updatedData.expiresAt);
      updatedData.expiresAt = isNaN(dateObj.getTime()) ? null : dateObj;
    } else if (updatedData.expiresAt === "") {
      // Handle empty string from form
      updatedData.expiresAt = null;
    }

    if (updatedData.dateTime) {
      const dateObj = new Date(updatedData.dateTime);
      updatedData.dateTime = isNaN(dateObj.getTime()) ? new Date() : dateObj;
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

    const updatedAnnouncement = await Announcement.addView(
      id,
      userId,
      userName
    );
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

    const updatedAnnouncement = await Announcement.addAcknowledgement(
      id,
      userId,
      userName
    );
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

    const updatedAnnouncement = await Announcement.removeAcknowledgement(
      id,
      userId
    );
    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error removing acknowledgement:", error);
    res.status(500).json({
      message: "Failed to remove acknowledgement",
      error: error.message,
    });
  }
};
