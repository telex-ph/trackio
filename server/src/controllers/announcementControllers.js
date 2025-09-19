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
    return res.status(201).json(announcement); // Use 201 for Created
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