import User from "../user/user.model.js";
import Schedule from "./schedule.model.js";
import SCHEDULE from "../../../constants/schedule.js";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";

// Helper function
const formatSchedules = (schedules, userId, schedType, updatedBy) => {
  const formattedSchedules = schedules.map((schedule) => {
    const baseDate = DateTime.fromISO(schedule.date, {
      zone: "Asia/Manila",
    }).startOf("day");

    // Merge a time with baseDate
    const mergeDateAndTime = (timeISO, shiftStartTime = null) => {
      let time = DateTime.fromISO(timeISO, { zone: "Asia/Manila" });
      let dateTime = baseDate.set({
        hour: time.hour,
        minute: time.minute,
        second: time.second,
        millisecond: 0,
      });

      // If shiftEnd (or mealEnd) is earlier than shiftStart, assume it is the next day
      if (shiftStartTime && dateTime < shiftStartTime) {
        dateTime = dateTime.plus({ days: 1 });
      }

      return dateTime.toJSDate();
    };

    switch (schedType) {
      case SCHEDULE.WORK_DAY:
      case SCHEDULE.REPORTING:
        // First get shiftStart datetime
        const shiftStartDateTime = mergeDateAndTime(schedule.shiftStart);

        return {
          userId: new ObjectId(userId),
          date: baseDate.toJSDate(),
          shiftStart: shiftStartDateTime,
          shiftEnd: mergeDateAndTime(schedule.shiftEnd, shiftStartDateTime),
          type: schedType,
          notes: schedule.notes,
          createdAt: DateTime.utc().toJSDate(),
          updatedAt: DateTime.utc().toJSDate(),
          updatedBy: new ObjectId(updatedBy),
        };

      default:
        return {
          userId: new ObjectId(userId),
          date: baseDate.toJSDate(),
          type: schedType,
          notes: schedule.notes,
          createdAt: DateTime.utc().toJSDate(),
          updatedAt: DateTime.utc().toJSDate(),
          updatedBy: new ObjectId(updatedBy),
        };
    }
  });
  return formattedSchedules;
};

export const addSchedulesService = async (
  schedules,
  userId,
  schedType,
  updatedBy
) => {
  // Early return if the id is invalid
  const user = await User.getById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const formattedSchedules = formatSchedules(
    schedules,
    userId,
    schedType,
    updatedBy
  );

  return Schedule.addAll(formattedSchedules);
};

export const deleteSchedulesService = async (userId, shiftSchedules) => {
  // Since the date stored in db is in utc
  const shiftSchedulesInUTC = shiftSchedules.map((schedule) => {
    return DateTime.fromISO(schedule, { zone: "Asia/Manila" })
      .toUTC()
      .toJSDate();
  });

  const schedules = await Schedule.deleteAll(
    shiftSchedulesInUTC,
    new ObjectId(userId)
  );
  return schedules;
};

export const getSchedulesService = async (id, currMonth, currYear) => {
  const currentMonth = parseInt(currMonth);
  const currentYear = parseInt(currYear);

  // Get the urrent month
  const now = DateTime.fromObject({
    year: currentYear,
    month: currentMonth,
    day: 1,
  });
  //  Prev month
  const prevMonth = now.minus({ months: 1 }).startOf("month").toJSDate();
  //  Next month
  const nextMonth = now.plus({ months: 1 }).endOf("month").toJSDate();
  // Get start of current month and end of current month

  const result = await Schedule.getAll(id, prevMonth, nextMonth);

  return result;
};

export const getScheduleService = async (id, date) => {
  const result = await Schedule.get(id, date);
  return result;
};
