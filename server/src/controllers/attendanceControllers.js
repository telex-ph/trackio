import Attendance from "../model/Attendance.js";
import { DateTime } from "luxon";
import Schedules from "../model/Schedule.js";
import { STATUS } from "../../../client/src/constants/status.js";

export const addAttendance = async (req, res) => {
  const id = req.params.id;
  const TARDINESS_TOLERANCE_HOURS = 2;
  const EARLY_GRACE_HOURS = 4;

  try {
    const timeIn = DateTime.now().toUTC();
    const minShiftStart = timeIn.minus({ hours: TARDINESS_TOLERANCE_HOURS });
    const maxShiftStart = timeIn.plus({ hours: EARLY_GRACE_HOURS });

    const matchingSchedule = await Schedules.get(
      id,
      minShiftStart.toJSDate(), // UTC ISO String
      maxShiftStart.toJSDate() // UTC ISO String
    );

    if (!matchingSchedule) {
      return res.status(404).json({
        success: false,
        message: "No matching schedule found for this time-in.",
      });
    }

    const result = await Attendance.timeIn(
      id,
      matchingSchedule.shiftStart,
      matchingSchedule.shiftEnd
    );
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

export const updateBreakStart = async (req, res) => {
  const { docId, totalBreak } = req.body;
  const breaks = (req.body.breaks || []).map((b) => ({
    ...b,
    start: b.start
      ? DateTime.fromISO(b.start, { zone: "Asia/Manila" }).toJSDate()
      : null,
    end: b.end
      ? DateTime.fromISO(b.end, { zone: "Asia/Manila" }).toJSDate()
      : null,
  }));

  const newBreak = {
    start: DateTime.now().setZone("Asia/Manila").toJSDate(),
  };
  const newBreaks = [...breaks, newBreak];

  try {
    await Attendance.updateFieldById(docId, "breaks", newBreaks);
    await Attendance.updateFieldById(docId, "totalBreak", totalBreak);
    await Attendance.updateFieldById(docId, "status", STATUS.ON_BREAK);
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error(`Error starting break in user attendance: `, error);
    res.status(500).json({
      message: `Failed to start break`,
      error: error.message,
    });
  }
};

export const updateBreakPause = async (req, res) => {
  const { docId, totalBreak } = req.body;

  const breaks = (req.body.breaks || []).map((b) => ({
    ...b,
    start: b.start
      ? DateTime.fromISO(b.start, { zone: "Asia/Manila" }).toJSDate()
      : null,
    end: b.end
      ? DateTime.fromISO(b.end, { zone: "Asia/Manila" }).toJSDate()
      : null,
  }));

  const prevBreak = breaks[breaks.length - 1];

  // current end time (PH time)
  const end = DateTime.now().setZone("Asia/Manila");
  prevBreak.end = end.toJSDate();

  const start = DateTime.fromJSDate(prevBreak.start).setZone("Asia/Manila");
  const diffInMinutes = end.diff(start, "minutes").minutes;
  prevBreak.duration = diffInMinutes;

  try {
    await Attendance.updateFieldById(docId, "breaks", breaks);
    await Attendance.updateFieldById(docId, "totalBreak", totalBreak);
    await Attendance.updateFieldById(docId, "status", STATUS.WORKING);
    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    console.error(`Error ending break in user attendance: `, error);
    res.status(500).json({
      message: `Failed to end break`,
      error: error.message,
    });
  }
};
