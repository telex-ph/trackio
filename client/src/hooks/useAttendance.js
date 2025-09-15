import { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import api from "../utils/axios";
import { formatTime, formatDate } from "../utils/formatDateTime";

export const useAttendance = (userId, filter) => {
  const [attendance, setAttendance] = useState(null);
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

      // TODO: improve this, so DRY! HAHAHAHAAH
      const formattedData = response.data.map((item) => {
        const accounts = item.accounts.map((acc) => acc.name).join(", ");

        // Calculating if the user is late or not
        const shift = DateTime.fromISO(item.shiftStart);
        const time = DateTime.fromISO(item.timeIn);
        const punctuality = time <= shift ? "On Time" : "Late";

        return {
          id: item.user._id,
          date: formatDate(item.createdAt),
          name: `${item.user.firstName} ${item.user.lastName}`,
          email: item.user.email,
          shiftStart: formatTime(item.shiftStart),
          firstBreakStart: formatTime(item.firstBreakStart),
          firstBreakEnd: formatTime(item.firstBreakEnd),
          secondBreakStart: formatTime(item.secondBreakStart),
          secondBreakEnd: formatTime(item.secondBreakEnd),
          timeIn: formatTime(item.timeIn),
          punctuality,
          accounts,
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

  return {
    attendance,
    attendancesByStatus,
    loading,
    error,
    addAttendance,
    updateAttendance,
  };
};
