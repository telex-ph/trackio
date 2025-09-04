import connectDB from "../config/db.js";
import Attendance from "../model/Attendance.js";

export const getAttendances = async (req, res) => {
  try {
    const result = await Attendance.getAll();
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
    const response = await Attendance.getOne(id);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user attendance: ", error);
    res.status(500).json({
      message: "Failed to fetch user attendance",
      error: error.message,
    });
  }
};
