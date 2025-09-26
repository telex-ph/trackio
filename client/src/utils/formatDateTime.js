import { DateTime } from "luxon";

const fmtTime = "hh:mm a";
const fmtDate = "yyyy-MM-dd";
const zone = "Asia/Manila";

// TODO: make this somehow consistent
export const formatTime = (time) => {
  if (!time) return "---";
  return DateTime.fromISO(time).setZone(zone).toFormat(fmtTime);
};

export const formatDate = (date) => {
  if (!date) return "---";
  return DateTime.fromISO(date).setZone(zone).toFormat(fmtDate);
};

export const toDateTimeFromTimeString = (timeStr) => {
  if (!timeStr) return null;

  const today = DateTime.now().setZone(zone).startOf("day");
  const [hour, minute] = timeStr.split(":").map(Number);

  return today.set({ hour, minute });
};

export const dateFormatter = (date, format) => {
  return DateTime.fromISO(date).setZone(zone).toFormat(format);
};
