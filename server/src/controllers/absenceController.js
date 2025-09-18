import Absence from "../model/Absence.js";

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
