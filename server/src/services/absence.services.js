import Absence from "../modules/absence/absence.model.js";
import Attendance from "../modules/attendance/attendace.model.js";
import User from "../modules/user/user.model.js";
import { DateTime, Interval } from "luxon";

export const checkAbsences = async () => {
  try {
    // Work in PH timezone
    const nowPH = DateTime.now().setZone("Asia/Manila");

    // Get all users scheduled today
    const usersOnShift = await User.onShifts();
    if (usersOnShift.length === 0) return [];

    const userShiftWindows = usersOnShift.map((user) => {
      // Interpret stored times (UTC) as PH times
      const shiftStartPH = DateTime.fromJSDate(user.shiftStart, {
        zone: "utc",
      }).setZone("Asia/Manila");

      const shiftEndPH = DateTime.fromJSDate(user.shiftEnd, {
        zone: "utc",
      }).setZone("Asia/Manila");

      // Build today's shift in PH time
      let shiftStartTodayPH = shiftStartPH.set({
        year: nowPH.year,
        month: nowPH.month,
        day: nowPH.day,
      });

      let shiftEndTodayPH = shiftEndPH.set({
        year: nowPH.year,
        month: nowPH.month,
        day: nowPH.day,
      });

      // Handle overnight shift (e.g., 9PM–6AM)
      if (shiftEndTodayPH <= shiftStartTodayPH) {
        shiftEndTodayPH = shiftEndTodayPH.plus({ days: 1 });
      }

      // Convert PH times back to UTC for querying Attendance
      return {
        user,
        shiftStartTodayUTC: shiftStartTodayPH.toUTC(),
        shiftEndTodayUTC: shiftEndTodayPH.toUTC(),
      };
    });

    // Determine earliest start / latest end (in UTC) for Attendance query
    const earliestShiftStart = DateTime.min(
      ...userShiftWindows.map((u) => u.shiftStartTodayUTC)
    );
    const latestShiftEnd = DateTime.max(
      ...userShiftWindows.map((u) => u.shiftEndTodayUTC)
    );

    const userIds = usersOnShift.map((u) => u._id);

    // Get attendance for today's PH shift window (query still in UTC)
    const attendanceRecords = await Attendance.getShift(
      userIds,
      earliestShiftStart,
      latestShiftEnd
    );

    // Determine absentees
    const absentees = [];
    for (const { user, shiftEndTodayUTC } of userShiftWindows) {
      // Skip if shift still ongoing (compare in UTC)
      if (DateTime.utc() < shiftEndTodayUTC) continue;

      const userAttendance = attendanceRecords
        .filter((record) => record.userId.equals(user._id))
        .map((record) => {
          const timeIn = DateTime.fromJSDate(record.timeIn, { zone: "utc" });
          const timeOut = record.timeOut
            ? DateTime.fromJSDate(record.timeOut, { zone: "utc" })
            : DateTime.utc();
          return Interval.fromDateTimes(timeIn, timeOut);
        });

      // Total worked hours
      const totalWorkedHours = userAttendance.reduce(
        (sum, interval) => sum + interval.length("hours"),
        0
      );

      // Mark absent if walang attendance or worked < 4 hours
      if (totalWorkedHours < 4) {
        absentees.push(user);
      }
    }

    return absentees;
  } catch (error) {
    console.error("Error fetching absences: ", error);
    return [];
  }
};

export const markAbsences = async (absentees) => {
  if (!absentees.length) return console.log("No absentees to mark.");

  const now = DateTime.utc();
  const recordsToMark = [];

  for (const absentee of absentees) {
    // Parse their stored shiftStart (always UTC in DB)
    const userShiftStart = DateTime.fromJSDate(absentee.shiftStart, {
      zone: "utc",
    });

    // Build today’s shift start for this user
    const shiftStartToday = now.set({
      hour: userShiftStart.hour,
      minute: userShiftStart.minute,
      second: 0,
      millisecond: 0,
    });

    // Decide shift date (handle night shift wrap)
    const derivedShiftDate =
      now < shiftStartToday
        ? shiftStartToday.minus({ days: 1 }).startOf("day")
        : shiftStartToday.startOf("day");

    recordsToMark.push({
      userId: absentee._id,
      shiftDate: derivedShiftDate.toJSDate(),
    });
  }

  try {
    const result = await Absence.mark(recordsToMark);
    if (result) {
      console.log("Generated new records of absentees");
    } else {
      console.log("No generated records");
    }
  } catch (error) {
    console.error("Error marking absences:", error);
  }
};
