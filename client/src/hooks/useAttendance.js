import { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import api from "../utils/axios";
import { formatTime, formatDate } from "../utils/formatDateTime";
import { useStore } from "../store/useStore";
import { useQuery } from "@tanstack/react-query";

export const useAttendance = (userId, filter) => {
  const [absentees, setAbsentees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useStore((state) => state.user);

  const fetchUserAttendance = async (userId) => {
    if (!userId) return;
    try {
      setError(null);
      const response = await api.get(`/attendance/get-attendance/${userId}`);
      return response.data[0] || null;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to fetch attendance data");
      toast.error("Failed to load attendance data");
    }
  };

  const { data: attendance } = useQuery({
    queryKey: ["attendance", userId],
    queryFn: () => fetchUserAttendance(userId),
    enabled: !!userId,
  });

  const fetchAttendancesByStatus = useCallback(async () => {
    if (!filter) return;

    try {
      const response = await api.get("/attendance/get-attendances", {
        params: {
          userId: user._id,
          role: user.role,
          startDate: filter.startDate,
          endDate: filter.endDate,
          filter: filter.status,
        },
      });

      const formattedData = response.data.map((item) => {
        const accounts = item.accounts.map((acc) => acc.name).join(", ");

        // Time formatting
        const formattedTimeIn = formatTime(item.timeIn);
        const formattedTimeOut = formatTime(item.timeOut);
        const formattedShiftStart = formatTime(item.shiftStart);
        const formattedShiftEnd = formatTime(item.shiftEnd);

        // Punctuality
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

        // Adherence
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
        // Undertime Duration (in minutes only)
        let undertime = null;
        if (item.timeOut && item.shiftEnd) {
          const timeOut = DateTime.fromISO(item.timeOut);
          const shiftEnd = DateTime.fromISO(item.shiftEnd).set({
            year: timeOut.year,
            month: timeOut.month,
            day: timeOut.day,
          });

          const diff = shiftEnd.diff(timeOut, "minutes").minutes;
          undertime = diff > 0 ? Math.round(diff) : 0;
        }

        // Tardiness calculation
        const fmt = "hh:mm a";
        const zone = "Asia/Manila";
        const tIn = DateTime.fromFormat(formattedTimeIn, fmt, { zone });
        const sStart = DateTime.fromFormat(formattedShiftStart, fmt, { zone });
        const tardiness = tIn.diff(sStart, "minutes").minutes;

        return {
          doc_id: item._id,
          id: item.user._id,
          employeeId: item.user.employeeId,
          date: formatDate(item.createdAt),
          name: `${item.user.firstName} ${item.user.lastName}`,
          email: item.user.email,

          shiftStart: formattedShiftStart,
          shiftEnd: formattedShiftEnd,

          timeIn: formattedTimeIn,
          timeOut: formattedTimeOut,

          tardiness,
          punctuality,
          adherence,
          undertime,
          accounts,
          notes: item.notes,
          status: item.status,
          breaks: item.breaks,
          totalBreak: item.totalBreak,
        };
      });

      return formattedData;
    } catch (error) {
      console.error("Error fetching attendances by status:", error);
      setError("Failed to fetch attendances by status");
    }
  });

  const { data: attendancesByStatus } = useQuery({
    queryKey: [
      "attendancesByStatus",
      filter?.startDate,
      filter?.endDate,
      filter?.status,
    ],
    queryFn: fetchAttendancesByStatus,
    enabled: !!filter,
  });

  const fetchAbsentees = useCallback(async () => {
    if (!filter) return;
    try {
      setError(null);
      const response = await api.get("/absence/get-absentees", {
        params: {
          startDate: filter.startDate,
          endDate: filter.endDate,
          filter: filter.status,
        },
      });

      setAbsentees(
        response.data.map((item) => ({
          id: item.user._id,
          date: formatDate(item.createdAt),
          name: `${item.user.firstName} ${item.user.lastName}`,
          email: item.user.email,
        }))
      );
    } catch (error) {
      console.error("Error fetching absentees:", error);
      setError("Failed to fetch absentees");
    } finally {
      setLoading(false);
    }
  }, [filter?.startDate, filter?.endDate, filter?.status]);

  const addAttendance = useCallback(async () => {
    if (!userId) return;
    try {
      setError(null);
      await api.post(`/attendance/add-attendance/${userId}`);
      toast.success("Successfully clocked in!");
      await fetchUserAttendance();
    } catch (error) {
      console.error("Error adding attendance:", error);
      setError("Failed to clock in");
      const message =
        error.response?.data?.message ||
        "Unexpected error occurred. Please try again.";
      toast.error(`Failed to clock in. ${message}`);
    }
  }, [userId, fetchUserAttendance]);

  const updateAttendance = useCallback(
    async (field, status) => {
      if (!attendance?._id) return;
      try {
        setError(null);
        const now = DateTime.utc().toJSDate();
        await api.patch("/attendance/update-attendance", {
          id: attendance._id,
          fields: { [field]: now },
          status,
        });
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

  return {
    attendance,
    attendancesByStatus,
    fetchUserAttendance,
    absentees,
    loading,
    error,
    addAttendance,
    updateAttendance,
  };
};
