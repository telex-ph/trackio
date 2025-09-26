import { DateTime } from "luxon";
import Schedule from "../model/Schedule.js";
import User from "../model/User.js";
import { ObjectId } from "mongodb";

export const addSchedules = async (req, res) => {
  const { schedules, id, type } = req.body;

  // Early return if the id is invalid
  const user = await User.getById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found. Cannot add list of schedules.",
    });
  }

  const formattedSchedules = schedules.map((schedule) => {
    // Only get the date part
    const baseDate = DateTime.fromISO(schedule.date, { zone: "utc" }).startOf(
      "day"
    );

    // Helper to add date part + time
    const mergeDateAndTime = (timeISO) => {
      const time = DateTime.fromISO(timeISO, { zone: "utc" });
      return baseDate
        .set({
          hour: time.hour,
          minute: time.minute,
          second: time.second,
          millisecond: 0,
        })
        .toJSDate();
    };

    return {
      userId: new ObjectId(id),
      date: baseDate.toJSDate(),
      shiftStart: mergeDateAndTime(schedule.shiftStart),
      shiftEnd: mergeDateAndTime(schedule.shiftEnd),
      mealStart: mergeDateAndTime(schedule.mealStart),
      mealEnd: mergeDateAndTime(schedule.mealEnd),
      type,
      notes: schedule.notes,
      createdAt: new Date(),
    };
  });

  try {
    const schedules = Schedule.addAll(formattedSchedules);
    return res.status(200).json(schedules);
  } catch (error) {
    console.error("Error adsd schedules: ", error);
    res.status(500).json({
      message: "Failed to add list of schedules",
      error: error.message,
    });
  }
};

export const getSchedules = async (req, res) => {
  try {
    const result = await Schedule.getAll();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all user's schedules:", error);
    res.status(500).json({
      message: "Failed to user schedules",
      error: error.message,
    });
  }
};
