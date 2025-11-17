import { DateTime } from "luxon";
import Attendance from "../model/Attendance.js";
import { STATUS } from "../../constants/status.js";
import Schedules from "../model/Schedule.js";

export const biometricIn = async (userId, employeeId) => {
  const TARDINESS_TOLERANCE_HOURS = 2;
  const EARLY_GRACE_HOURS = 4;

  const timeIn = DateTime.now().setZone("Asia/Manila");
  const minShiftStart = timeIn.minus({ hours: TARDINESS_TOLERANCE_HOURS });
  const maxShiftStart = timeIn.plus({ hours: EARLY_GRACE_HOURS });

  const matchingSchedule = await Schedules.get(
    userId,
    minShiftStart.toUTC().toJSDate(),
    maxShiftStart.toUTC().toJSDate()
  );

  if (!matchingSchedule) {
    throw new Error("No matching schedule found for this time-in.");
  }

  try {
    const result = await Attendance.timeIn(
      userId,
      employeeId,
      matchingSchedule.shiftStart,
      matchingSchedule.shiftEnd
    );
    return result;
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    return false;
  }
};

export const biometricOut = async (attendanceId) => {
  try {
    await Attendance.updateFieldById(attendanceId, "status", STATUS.OOF);
    await Attendance.updateFieldById(
      attendanceId,
      "updatedAt",
      DateTime.now().toUTC()
    );
    await Attendance.updateFieldById(
      attendanceId,
      "timeOut",
      DateTime.now().toUTC()
    );
    return true;
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    return false;
  }
};

export const biometricBreakIn = async (docId, breaks, totalBreak) => {
  const now = DateTime.now().setZone("Asia/Manila").toJSDate();
  const newBreak = {
    start: now,
  };
  const newBreaks = [...breaks, newBreak];

  try {
    await Attendance.updateFieldById(docId, "breaks", newBreaks);
    await Attendance.updateFieldById(docId, "totalBreak", totalBreak);
    await Attendance.updateFieldById(docId, "status", STATUS.ON_BREAK);
    await Attendance.updateFieldById(docId, "updatedAt", now);
    return true;
  } catch (error) {
    console.error(`Error starting break in user attendance: `, error);
    return false;
  }
};

export const biometricBreakOut = async (docId, breaks) => {
  const prevBreak = breaks[breaks.length - 1];

  // current end time (PH time)
  const end = DateTime.now().setZone("Asia/Manila");
  prevBreak.end = end.toJSDate();

  const start = DateTime.fromJSDate(prevBreak.start).setZone("Asia/Manila");
  const diffInMs = end.diff(start).milliseconds;
  prevBreak.duration = diffInMs;

  const updatedTotalBreak = breaks.reduce(
    (sum, b) => sum + (b.duration || 0),
    0
  );
  try {
    await Attendance.updateFieldById(docId, "breaks", breaks);
    await Attendance.updateFieldById(docId, "totalBreak", updatedTotalBreak);
    await Attendance.updateFieldById(docId, "status", STATUS.WORKING);
    await Attendance.updateFieldById(docId, "updatedAt", end.toJSDate());
    return true;
  } catch (error) {
    console.error(`Error ending break in user attendance:`, error);
    return false;
  }
};
