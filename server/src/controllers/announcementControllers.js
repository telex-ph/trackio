import Announcement from "../model/Announcement.js";

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
  const newAnnouncementData = req.body;
  try {
    const announcement = await Announcement.create(newAnnouncementData);
    return res.status(201).json(announcement);
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).json({
      message: "Failed to add announcement",
      error: error.message,
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    await Announcement.update(id, updatedData);
    res.status(200).json({ message: "Announcement updated successfully" });
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