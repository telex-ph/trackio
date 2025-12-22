import { DateTime } from "luxon";
import Attendance from "../modules/attendance/attendace.model.js";
import { STATUS } from "../../constants/status.js";
import Schedules from "../modules/schedule/schedule.model.js";

export const biometricIn = async (userId, employeeId, now) => {
  const TARDINESS_TOLERANCE_HOURS = 4;
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
      matchingSchedule.shiftEnd,
      now
    );
  } catch (error) {
    console.error("Error adding user's attendance:", error);
    return false;
  }
};

export const biometricOut = async (attendanceId, now) => {
  const nowUtc = DateTime.fromISO(now).toUTC();

  try {
    // await Attendance.updateFieldById(attendanceId, "status", STATUS.OOF);
    // await Attendance.updateFieldById(attendanceId, "updatedAt", nowUtc);
    // await Attendance.updateFieldById(attendanceId, "timeOut", nowUtc);

    await Attendance.timeOut(attendanceId, STATUS.OOF, nowUtc, nowUtc);

    return true;
  } catch (error) {
    console.error("Error updating user's attendance:", error);
    return false;
  }
};

export const biometricBreakIn = async (docId, breaks, totalBreak, now) => {
  // const nowUtc = DateTime.utc().toJSDate();
  const nowUtc = DateTime.fromISO(now).toUTC().toJSDate();

  // console.log(`biometricBreakIn(): nowUtc ${nowUtc} / test ${test}`);

  const newBreak = { start: nowUtc };
  const newBreaks = [...breaks, newBreak];

  try {
    // await Attendance.updateFieldById(docId, "breaks", newBreaks);
    // await Attendance.updateFieldById(docId, "totalBreak", totalBreak);
    // await Attendance.updateFieldById(docId, "status", STATUS.ON_BREAK);
    // await Attendance.updateFieldById(docId, "updatedAt", nowUtc);
    await Attendance.breakIn(
      docId,
      newBreaks,
      totalBreak,
      STATUS.ON_BREAK,
      nowUtc
    );
    return true;
  } catch (error) {
    console.error(`Error starting break:`, error);
    return false;
  }
};

export const biometricBreakOut = async (docId, breaks, now) => {
  const prevBreak = breaks[breaks.length - 1];

  // const endUtc = DateTime.utc();
  const endUtc = DateTime.fromISO(now).toUTC();
  prevBreak.end = endUtc.toJSDate();

  // console.log(
  //   `biometricBreakOut(): endUtc ${endUtc} / testEndUtc ${testEndUtc}`
  // );

  const startUtc = DateTime.fromJSDate(prevBreak.start);
  prevBreak.duration = endUtc.diff(startUtc).milliseconds;

  const updatedTotalBreak = breaks.reduce(
    (sum, b) => sum + (b.duration || 0),
    0
  );

  try {
    // await Attendance.updateFieldById(docId, "breaks", breaks);
    // await Attendance.updateFieldById(docId, "totalBreak", updatedTotalBreak);
    // await Attendance.updateFieldById(docId, "status", STATUS.WORKING);
    // await Attendance.updateFieldById(docId, "updatedAt", endUtc.toJSDate());

    await Attendance.breakOut(
      docId,
      breaks,
      updatedTotalBreak,
      STATUS.WORKING,
      endUtc.toJSDate()
    );
    return true;
  } catch (error) {
    console.error(`Error ending break:`, error);
    return false;
  }
};

export const biomtricCorrection = async (docId) => {
  if (!docId) {
    throw new Error("Document ID is required");
  }

  try {
    const result = await Attendance.updateLastBreakStartById(docId);

    if (result.matchedCount === 0) {
      throw new Error("Document not found");
    }

    return {
      success: true,
      message: "Last break removed successfully",
    };
  } catch (error) {
    console.error(`Error removing last break:`, error);
    return false;
  }
};
