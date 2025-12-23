import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import Analytics from "./analytics.model.js";

export const getAttendanceAll = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await Analytics.getAttendanceAll({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Attendance analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance analytics",
      error: error.message,
    });
  }
};

export const getAttendancePerOrganization = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await Analytics.getAttendancePerOrganization({
      startDate,
      endDate,
    });

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Attendance analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance analytics",
      error: error.message,
    });
  }
};

export const getAttendanceUsers = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;

    // Default date range: current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const analytics = await Analytics.getAttendanceUsers({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
      role,
      userId,
    });

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance analytics",
      error: error.message,
    });
  }
};

export const getAttendanceListPerUser = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const { userId: filterUserId, filter } = req.query;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const analytics = await Analytics.getAttendanceListPerUser({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
      role,
      loggedUserId: userId,
      userFilterId: filterUserId,
      filter: filter || "all",
    });

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance analytics",
      error: error.message,
    });
  }
};

export const getTopThreePerOrganization = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const analytics = await Analytics.getTopThreePerOrganization({
      startDate: firstDayOfMonth,
      endDate: lastDayOfMonth,
    });

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch top 3 attendance analytics",
      error: error.message,
    });
  }
};
