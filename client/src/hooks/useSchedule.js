import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useStore } from "../store/useStore";

export const useSchedule = ({ id }) => {
  const setShiftSchedule = useStore((state) => state.setShiftSchedule);
  const currentDate = useStore((state) => state.currentDate);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/schedule/get-schedules/${id}`, {
        params: {
          currentMonth: currentDate.month,
          currentYear: currentDate.year,
        },
      });

      setShiftSchedule(response.data);
      setSchedule(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [id, currentDate.month, currentDate.year]);

  return { schedule, loading };
};
