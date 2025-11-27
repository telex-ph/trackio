import { DateTime } from "luxon";

const philippineZone = "Asia/Manila";
export const shiftSchedule = (set) => ({
  // Shift
  // TODO: remove since we are already implementing tanstack query
  shiftSchedule: [],
  setShiftSchedule: (data) => set({ shiftSchedule: data }),

  // Selected dates for adding shift schedule
  selectedDates: [],
  setSelectedDates: (data) => set({ selectedDates: data }),

  currentDate: DateTime.now().setZone(philippineZone),
  setCurrentDate: (data) => set({ currentDate: data }),
});
