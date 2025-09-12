import { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import api from "../utils/axios";

export const useAttendance = (userId, filter) => {
  const fmt = "hh:mm a";
  const zone = "Asia/Manila";
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
        const timeIn = item.timeIn
          ? DateTime.fromISO(item.timeIn).setZone(zone).toFormat(fmt)
          : "Not Logged In";

        const shiftStart = item.shiftStart
          ? DateTime.fromISO(item.shiftStart).setZone(zone).toFormat(fmt)
          : "Not Logged In";

        const createdAt = item.createdAt
          ? DateTime.fromISO(item.createdAt)
              .setZone(zone)
              .toFormat("yyyy-MM-dd")
          : "Not Logged In";

        const firstBreakStart = item.firstBreakStart
          ? DateTime.fromISO(item.firstBreakStart).setZone(zone).toFormat(fmt)
          : "---";

        const firstBreakEnd = item.firstBreakEnd
          ? DateTime.fromISO(item.firstBreakEnd).setZone(zone).toFormat(fmt)
          : "---";

        const secondBreakStart = item.secondBreakStart
          ? DateTime.fromISO(item.secondBreakStart).setZone(zone).toFormat(fmt)
          : "---";

        const secondBreakEnd = item.secondBreakEnd
          ? DateTime.fromISO(item.secondBreakEnd).setZone(zone).toFormat(fmt)
          : "---";

        const accounts = item.accounts.map((acc) => acc.name).join(", ");

        // Calculating if the user is late or not
        const shift = DateTime.fromISO(item.shiftStart);
        const time = DateTime.fromISO(item.timeIn);
        const punctuality = time <= shift ? "On Time" : "Late";

        return {
          id: item.user._id,
          date: createdAt,
          name: `${item.user.firstName} ${item.user.lastName}`,
          email: item.user.email,
          shiftStart,
          firstBreakStart,
          firstBreakEnd,
          secondBreakStart,
          secondBreakEnd,
          timeIn,
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
