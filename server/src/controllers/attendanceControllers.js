import connectDB from "../config/db.js";
import Attendance from "../model/Attendance.js";

export const addAttendance = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Attendance.timeIn(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    res.status(500).json({
      message: "Failed to add attendance",
      error: error.message,
    });
  }
};

export const getAttendances = async (req, res) => {
  const params = req.query;

  try {
    const result = await Attendance.getAll(params);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all users' attendance:", error);
    res.status(500).json({
      message: "Failed to fetch attendances",
      error: error.message,
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Attendance.getById(id);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user attendance: ", error);
    res.status(500).json({
      message: "Failed to fetch user attendance",
      error: error.message,
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const data = req.body;
    // Convert any string dates back to JS Date, since the date from the frontend
    // becomes string
    Object.keys(data.fields).forEach((key) => {
      const value = data.fields[key];
      if (typeof value === "string" && !isNaN(Date.parse(value))) {
        data.fields[key] = new Date(value);
      }
    });

    const response = await Attendance.updateById(data.id, data.fields);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating user attendance: ", error);
    res.status(500).json({
      message: "Failed to update user attendance",
      error: error.message,
    });
  }
};
