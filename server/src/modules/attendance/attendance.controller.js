import Attendance from "./attendance.model.js";
import { DateTime } from "luxon";
import Schedules from "../schedule/schedule.model.js";
import { STATUS } from "../../../constants/status.js";

export const addAttendance = async (userId) => {
  const TARDINESS_TOLERANCE_HOURS = 2;
  const EARLY_GRACE_HOURS = 6;

  const timeIn = DateTime.now().toUTC();
  const minShiftStart = timeIn.minus({ hours: TARDINESS_TOLERANCE_HOURS });
  const maxShiftStart = timeIn.plus({ hours: EARLY_GRACE_HOURS });

  const matchingSchedule = await Schedules.get(
    userId,
    minShiftStart.toJSDate(),
    maxShiftStart.toJSDate()
  );

  if (!matchingSchedule) {
    throw new Error("No matching schedule found for this time-in.");
  }

  try {
    const result = await Attendance.timeIn(
      userId,
      matchingSchedule.shiftStart,
      matchingSchedule.shiftEnd
    );
    return result;
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    return false;
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
    const response = await Attendance.getById(id, "desc");
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
    const { id, fields, status } = req.body;
    // Convert any string dates back to JS Date, since the date from the frontend
    // becomes string
    Object.keys(fields).forEach((key) => {
      const value = fields[key];
      if (typeof value === "string" && !isNaN(Date.parse(value))) {
        fields[key] = new Date(value);
      }
    });

    const attendance = await Attendance.getByDocId(id);
    if (
      status === STATUS.OOF &&
      attendance.breaks &&
      attendance.breaks.length > 0
    ) {
      const breaks = attendance.breaks;
      const latestBreak = breaks[breaks?.length - 1];

      if (breaks && !latestBreak.end) {
        const now = DateTime.now().setZone("Asia/Manila");
        latestBreak.end = now.toJSDate();

        const start = DateTime.fromJSDate(latestBreak.start).setZone(
          "Asia/Manila"
        );

        const diffInMs = now.diff(start, "milliseconds").milliseconds;
        latestBreak.duration = diffInMs;

        const previousTotal = attendance.totalBreak || 0;
        const newTotalBreak = previousTotal + diffInMs;

        await Attendance.updateFieldById(id, "breaks", breaks);
        await Attendance.updateFieldById(id, "totalBreak", newTotalBreak);
      }
    }

    const response = await Attendance.updateById(id, fields, status);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error updating user attendance: ", error);
    res.status(500).json({
      message: "Failed to update user attendance",
      error: error.message,
    });
  }
};

export const updateField = async (req, res) => {
  const { id, field, newValue } = req.body;

  try {
    const response = await Attendance.updateFieldById(id, field, newValue);
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error updating in user  attendance: `, error);
    res.status(500).json({
      message: `Failed to update user attendance`,
      error: error.message,
    });
  }
};

export const getAllOnBreak = async (req, res) => {
  try {
    const response = await Attendance.getAllOnBreak();
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching attendances on break: ", error);
    res.status(500).json({
      message: "Failed to fetch attendances on break",
      error: error.message,
    });
  }
};
