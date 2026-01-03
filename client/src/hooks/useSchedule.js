import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useStore } from "../store/useStore";
import { useQuery } from "@tanstack/react-query";

export const useSchedule = ({ id }) => {
  const currentDate = useStore((state) => state.currentDate);

  const fetchSchedules = async (id) => {
    if (!id) return;

    try {
      const response = await api.get(`/schedule/get-schedules/${id}`, {
        params: {
          currentMonth: currentDate.month,
          currentYear: currentDate.year,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const {
    data: schedule,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["schedule", id],
    queryFn: () => fetchSchedules(id),
    enabled: !!id,
  });

  return { schedule, loading: isLoading, fetchSchedules: refetch };
};
