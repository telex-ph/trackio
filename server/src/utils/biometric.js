import { DateTime } from "luxon";
import Attendance from "../model/Attendance.js";
import { STATUS } from "../../constants/status.js";
import Schedules from "../model/Schedule.js";

export const biometricIn = async (userId, employeeId) => {
  const TARDINESS_TOLERANCE_HOURS = 2;
  const EARLY_GRACE_HOURS = 4;

  const timeIn = DateTime.utc();
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
    return await Attendance.timeIn(
      userId,
      employeeId,
      matchingSchedule.shiftStart,
      matchingSchedule.shiftEnd
    );
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    return false;
  }
};

export const biometricOut = async (attendanceId) => {
  const nowUtc = DateTime.utc().toJSDate();

  try {
    await Attendance.updateFieldById(attendanceId, "status", STATUS.OOF);
    await Attendance.updateFieldById(attendanceId, "updatedAt", nowUtc);
    await Attendance.updateFieldById(attendanceId, "timeOut", nowUtc);
    return true;
  } catch (error) {
    console.error("Error updating user's attendance:", error);
    return false;
  }
};

export const biometricBreakIn = async (docId, breaks, totalBreak) => {
  const nowUtc = DateTime.utc().toJSDate();

  const newBreak = { start: nowUtc };
  const newBreaks = [...breaks, newBreak];

  try {
    await Attendance.updateFieldById(docId, "breaks", newBreaks);
    await Attendance.updateFieldById(docId, "totalBreak", totalBreak);
    await Attendance.updateFieldById(docId, "status", STATUS.ON_BREAK);
    await Attendance.updateFieldById(docId, "updatedAt", nowUtc);
    return true;
  } catch (error) {
    console.error(`Error starting break:`, error);
    return false;
  }
};

export const biometricBreakOut = async (docId, breaks) => {
  const prevBreak = breaks[breaks.length - 1];

  const endUtc = DateTime.utc();
  prevBreak.end = endUtc.toJSDate();

  const startUtc = DateTime.fromJSDate(prevBreak.start);
  prevBreak.duration = endUtc.diff(startUtc).milliseconds;

  const updatedTotalBreak = breaks.reduce(
    (sum, b) => sum + (b.duration || 0),
    0
  );

  try {
    await Attendance.updateFieldById(docId, "breaks", breaks);
    await Attendance.updateFieldById(docId, "totalBreak", updatedTotalBreak);
    await Attendance.updateFieldById(docId, "status", STATUS.WORKING);
    await Attendance.updateFieldById(docId, "updatedAt", endUtc.toJSDate());
    return true;
  } catch (error) {
    console.error(`Error ending break:`, error);
    return false;
  }
};
