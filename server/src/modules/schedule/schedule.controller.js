import {
  addSchedulesService,
  deleteSchedulesService,
  getScheduleService,
  getSchedulesService,
} from "./schedule.service.js";

export const addSchedules = async (req, res) => {
  const { schedules, id, schedType, updatedBy } = req.body;
  try {
    const result = await addSchedulesService(
      schedules,
      id,
      schedType,
      updatedBy
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error adding schedules: ", error);
    return res.status(500).json({
      message: "Failed to add list of schedules",
      error: error.message,
    });
  }
};

export const deleteSchedules = async (req, res) => {
  const shiftSchedules = req.body.shiftSchedules;
  const userId = req.body.userId;

  try {
    const schedules = await deleteSchedulesService(userId, shiftSchedules);
    return res.status(200).json(schedules);
  } catch (error) {
    console.error("Error deleting schedules: ", error);
    res.status(500).json({
      message: "Failed to delete list of schedules",
      error: error.message,
    });
  }
};

export const getSchedules = async (req, res) => {
  const id = req.params.id;
  const currentMonth = req.query.currentMonth;
  const currentYear = req.query.currentYear;

  try {
    const result = await getSchedulesService(id, currentMonth, currentYear);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all user's schedules:", error);
    res.status(500).json({
      message: "Failed to user schedules",
      error: error.message,
    });
  }
};

export const getSchedule = async (req, res) => {
  const id = req.params.id;
  const date = req.params.date;

  try {
    const result = await getScheduleService(id, date);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user schedule: ", error);
    res.status(500).json({
      message: "Failed to fetch user schedule: ",
      error: error.message,
    });
  }
};
