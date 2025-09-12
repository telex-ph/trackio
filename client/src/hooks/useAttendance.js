import { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import api from "../utils/axios";

export const useAttendance = (userId) => {
  const [attendance, setAttendance] = useState(null);
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

  return {
    attendance,
    loading,
    error,
    addAttendance,
    updateAttendance,
  };
};
