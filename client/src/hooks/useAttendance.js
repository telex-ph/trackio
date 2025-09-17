import { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import api from "../utils/axios";
import { formatTime, formatDate } from "../utils/formatDateTime";

export const useAttendance = (userId, filter) => {
  const [attendance, setAttendance] = useState(null);
  const [absentees, setAbsentees] = useState(null);
  const [attendancesByStatus, setAttendancesByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserAttendance = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const response = await api.get(`/attendance/get-attendance/${userId}`);
      const attendanceData = response.data;
      setAttendance(attendanceData[0] || null);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to fetch attendance data");
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Get the attendances using status; on lunch
  const fetchAttendancesByStatus = useCallback(async (filter) => {
    if (!filter) return;

    try {
      setError(null);
      const response = await api.get("/attendance/get-attendances", {
        params: {
          startDate: filter?.startDate,
          endDate: filter?.endDate,
          filter: filter?.status,
        },
      });

      const formattedData = response.data.map((item) => {
        const accounts = item.accounts.map((acc) => acc.name).join(", ");

        // Time formatting
        const formattedTimeIn = formatTime(item.timeIn);
        const formattedTimeOut = formatTime(item.timeOut);
        const formattedShiftStart = formatTime(item.shiftStart);
        const formattedShiftEnd = formatTime(item.shiftEnd);
        const formattedFirstBreakStart = formatTime(item.firstBreakStart);
        const formattedFirstBreakEnd = formatTime(item.firstBreakEnd);
        const formattedSecondBreakStart = formatTime(item.secondBreakStart);
        const formattedSecondBreakEnd = formatTime(item.secondBreakEnd);

        // Calculating if the user is late or not
        let punctuality = "N/A";
        if (item.timeIn && item.shiftStart) {
          const timeIn = DateTime.fromISO(item.timeIn);
          const shiftStart = DateTime.fromISO(item.shiftStart).set({
            year: timeIn.year,
            month: timeIn.month,
            day: timeIn.day,
          });
          punctuality = timeIn <= shiftStart ? "On Time" : "Late";
        }

        // Calculating if the user's shift adherence
        let adherence = "N/A";
        if (item.timeOut && item.shiftEnd) {
          const timeOut = DateTime.fromISO(item.timeOut);
          const shiftEnd = DateTime.fromISO(item.shiftEnd).set({
            year: timeOut.year,
            month: timeOut.month,
            day: timeOut.day,
          });
          adherence = timeOut >= shiftEnd ? "On Time" : "Undertime";
        }
        // const adherence = timeOut >= shiftEnd ? "On Time" : "Undertime";

        // Calculate difference in minutes, for minutes of tardiness
        const fmt = "hh:mm a";
        const zone = "Asia/Manila";
        const tIn = DateTime.fromFormat(formattedTimeIn, fmt, { zone });
        const sStart = DateTime.fromFormat(formattedShiftStart, fmt, { zone });
        const tardiness = tIn.diff(sStart, "minutes").minutes;

        return {
          id: item.user._id,
          date: formatDate(item.createdAt),
          name: `${item.user.firstName} ${item.user.lastName}`,
          email: item.user.email,

          shiftStart: formattedShiftStart,
          shiftEnd: formattedShiftEnd,

          firstBreakStart: formattedFirstBreakStart,
          firstBreakEnd: formattedFirstBreakEnd,

          secondBreakStart: formattedSecondBreakStart,
          secondBreakEnd: formattedSecondBreakEnd,

          timeIn: formattedTimeIn,
          timeOut: formattedTimeOut,

          tardiness,
          punctuality,
          adherence,
          accounts,
          status: item.status,
        };
      });

      setAttendancesByStatus(formattedData);
    } catch (error) {
      console.error("Error fetching attendances by status:", error);
      setError("Failed to fetch attendances by status");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAbsentees = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get("/attendance/get-attendances", {
        params: {
          startDate: filter?.startDate,
          endDate: filter?.endDate,
          filter: filter?.status,
        },
      });
      setAbsentees(response.data);
    } catch (error) {
      console.error("Error fetching absentees:", error);
      setError("Failed to fetch absenteees");
    }
    setLoading(false);
  }, []);

  const addAttendance = useCallback(
    async (shiftStart, shiftEnd) => {
      if (!userId) return;

      try {
        setError(null);
        await api.post(`/attendance/add-attendance/${userId}`, {
          shiftStart,
          shiftEnd,
        });
        toast.success("Successfully clocked in!");
        await fetchUserAttendance();
      } catch (error) {
        console.error("Error adding attendance:", error);
        setError("Failed to clock in");
        toast.error("Failed to clock in. Please try again.");
      }
    },
    [userId, fetchUserAttendance]
  );

  const updateAttendance = useCallback(
    async (field, status) => {
      if (!attendance?._id) return;

      try {
        setError(null);
        const now = DateTime.utc().toJSDate();
        const data = {
          id: attendance._id,
          fields: {
            [field]: now,
          },
          status: status,
        };

        await api.patch("/attendance/update-attendance", data);
        toast.success(`${field} recorded successfully!`);
        await fetchUserAttendance();
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        setError(`Failed to update ${field}`);
        toast.error(`Failed to record ${field}. Please try again.`);
      }
    },
    [attendance?._id, fetchUserAttendance]
  );

  useEffect(() => {
    fetchUserAttendance();
  }, [fetchUserAttendance]);

  useEffect(() => {
    if (filter) {
      fetchAttendancesByStatus(filter);
    }
  }, [filter?.startDate, filter?.endDate, fetchAttendancesByStatus]);

  useEffect(() => {
    if (filter) {
      fetchAttendancesByStatus(filter);
    }
  }, [filter?.startDate, filter?.endDate, fetchAbsentees]);

  return {
    attendance,
    attendancesByStatus,
    absentees,
    loading,
    error,
    addAttendance,
    updateAttendance,
  };
};
