import Absence from "../model/Absence.js";
import Attendance from "../model/Attendance.js";
import User from "../model/User.js";
import { DateTime } from "luxon";

// export const checkAbsences = async () => {
//   try {
//     const now = DateTime.utc();

//     // Get all users scheduled today
//     const usersOnShift = await User.onShifts();

//     if (usersOnShift.length === 0) return [];

//     // Build today's shift windows
//     const userShiftWindows = usersOnShift.map((user) => {
//       const shiftStartTime = DateTime.fromJSDate(user.shiftStart, {
//         zone: "utc",
//       });
//       const shiftEndTime = DateTime.fromJSDate(user.shiftEnd, { zone: "utc" });

//       let shiftStartToday = now.startOf("day").set({
//         hour: shiftStartTime.hour,
//         minute: shiftStartTime.minute,
//         second: 0,
//       });

//       let shiftEndToday = now.startOf("day").set({
//         hour: shiftEndTime.hour,
//         minute: shiftEndTime.minute,
//         second: 0,
//       });

//       // overnight shift
//       if (shiftEndToday <= shiftStartToday) {
//         shiftEndToday = shiftEndToday.plus({ days: 1 });
//         console.log(
//           `user: ${user.firstName} / is now > shiftEndToday ? ${
//             now > shiftEndToday
//           }, since now is ${now} and shiftEndToday is ${shiftEndToday} - night shift`
//         );
//       } else {
//         console.log(
//           `user: ${user.firstName} / is now > shiftEndToday ? ${
//             now > shiftEndToday
//           }, since now is ${now} and shiftEndToday is ${shiftEndToday} day shift`
//         );
//       }

//       return { user, shiftStartToday, shiftEndToday };
//     });

//     // Get attendance for today's shift window
//     const earliestShiftStart = DateTime.min(
//       ...userShiftWindows.map((u) => u.shiftStartToday)
//     );
//     const latestShiftEnd = DateTime.max(
//       ...userShiftWindows.map((u) => u.shiftEndToday)
//     );

//     const userIds = usersOnShift.map((u) => u._id);

//     const attendanceRecords = await Attendance.getShift(
//       userIds,
//       earliestShiftStart,
//       latestShiftEnd
//     );

//     // Determine absentees (only after shift end)
//     // TODO: improve the logic since sabi ni ma'am trachelle, we mark
//     // them absent only if the working hour is below 4hrs na.
//     const absentees = [];
//     for (const { user, shiftEndToday } of userShiftWindows) {
//       // console.log(`user: ${user.firstName} / is now > shiftEndToday ? ${now > shiftEndToday}, since now is ${now} and shiftEndToday is ${shiftEndToday}`);

//       if (now < shiftEndToday) continue; // Skip shift kasi still ongoing

//       const hasAttendance = attendanceRecords.some((record) =>
//         record.userId.equals(user._id)
//       );

//       if (!hasAttendance) {
//         absentees.push(user);
//       }
//     }

//     return absentees;
//   } catch (error) {
//     console.error("Error fetching absences: ", error);
//   }
// };

export const checkAbsences = async () => {
  try {
    // Hardcoded 'now' for testing: 7 PM PH time (11 AM UTC)
    const now = DateTime.utc(2025, 9, 17, 11, 0, 0); // YYYY, MM, DD, HH, mm, ss

    // Get all users scheduled today
    const usersOnShift = await User.onShifts();

    if (usersOnShift.length === 0) return [];

    // Build today's shift windows
    const userShiftWindows = usersOnShift.map((user) => {
      const shiftStartTime = DateTime.fromJSDate(user.shiftStart, {
        zone: "utc",
      });
      const shiftEndTime = DateTime.fromJSDate(user.shiftEnd, { zone: "utc" });

      let shiftStartToday = now.startOf("day").set({
        hour: shiftStartTime.hour,
        minute: shiftStartTime.minute,
        second: 0,
      });

      let shiftEndToday = now.startOf("day").set({
        hour: shiftEndTime.hour,
        minute: shiftEndTime.minute,
        second: 0,
      });

      // overnight shift
      if (shiftEndToday <= shiftStartToday) {
        shiftEndToday = shiftEndToday.plus({ days: 1 });
        console.log(
          `user: ${user.firstName} / is now > shiftEndToday ? ${
            now > shiftEndToday
          }, since now is ${now} and shiftEndToday is ${shiftEndToday} - night shift`
        );
      } else {
        console.log(
          `user: ${user.firstName} / is now > shiftEndToday ? ${
            now > shiftEndToday
          }, since now is ${now} and shiftEndToday is ${shiftEndToday} day shift`
        );
      }

      return { user, shiftStartToday, shiftEndToday };
    });

    // Get attendance for today's shift window
    const earliestShiftStart = DateTime.min(
      ...userShiftWindows.map((u) => u.shiftStartToday)
    );
    const latestShiftEnd = DateTime.max(
      ...userShiftWindows.map((u) => u.shiftEndToday)
    );

    const userIds = usersOnShift.map((u) => u._id);

    const attendanceRecords = await Attendance.getShift(
      userIds,
      earliestShiftStart,
      latestShiftEnd
    );

    // Determine absentees (only after shift end)
    // TODO: improve the logic since sabi ni ma'am trachelle, we mark
    // them absent only if the working hour is below 4hrs na.
    const absentees = [];
    for (const { user, shiftEndToday } of userShiftWindows) {
      // console.log(`user: ${user.firstName} / is now > shiftEndToday ? ${now > shiftEndToday}, since now is ${now} and shiftEndToday is ${shiftEndToday}`);

      if (now < shiftEndToday) continue; // Skip shift kasi still ongoing

      const hasAttendance = attendanceRecords.some((record) =>
        record.userId.equals(user._id)
      );

      if (!hasAttendance) {
        absentees.push(user);
      }
    }

    return absentees;
  } catch (error) {
    console.error("Error fetching absences: ", error);
  }
};

export const markAbsences = async (absentees) => {
  const ids = absentees.map((absentee) => absentee._id);

  Absence.mark();
  try {
  } catch (error) {
    console.error("Error marking absences: ", error);
  }
};
