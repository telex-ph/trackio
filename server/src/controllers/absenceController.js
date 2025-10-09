import Absence from "../model/Absence.js";
import { checkAbsences, markAbsences } from "../services/absence.services.js";

export const getAbsentees = async (req, res) => {
  const params = req.query;

  try {
    const result = await Absence.getAll(params);
    // const result = await Attendance.timeIn(id, shiftStart, shiftEnd);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    res.status(500).json({
      message: "Failed to add attendance",
      error: error.message,
    });
  }
};

export const addAbsentees = async (req, res) => {
  try {
    const absentees = await checkAbsences();
    if (absentees) {
      await markAbsences(absentees);
    }
    res
      .status(200)
      .json({ success: true, message: "Absences checked and marked" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error running cron task" });
  }
};

export const updateAbsentee = async (req, res) => {
  try {
    const result = await Absence.updateById(id, );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    res.status(500).json({
      message: "Failed to add attendance",
      error: error.message,
    });
  }
};
