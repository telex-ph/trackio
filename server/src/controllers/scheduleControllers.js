import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import Schedule from "../model/Schedule.js";
import SCHEDULE from "../../constants/schedule.js";
import User from "../model/User.js";

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
    const baseDate = DateTime.fromISO(schedule.date).startOf("day");

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

    switch (type) {
      case SCHEDULE.WORK_DAY:
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
      default:
        return {
          userId: new ObjectId(id),
          date: baseDate.toJSDate(),
          type,
          notes: schedule.notes,
          createdAt: new Date(),
        };
    }
  });

  try {
    const schedules = await Schedule.addAll(formattedSchedules);
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
  const id = req.params.id;

  try {
    const result = await Schedule.getAll(id);
    console.log(result);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all user's schedules:", error);
    res.status(500).json({
      message: "Failed to user schedules",
      error: error.message,
    });
  }
};
