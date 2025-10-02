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

// Example user
// date
// const date = "2025-09-29T08:30:00.000Z";
// Format as date only
// console.log(dateFormatter(date, "yyyy-MM-dd"));
// → 2025-09-29
// Format as time only
// console.log(dateFormatter(date, "hh:mm a"));
// → 04:30 PM (in Manila timezone)
// Full readable format
// console.log(dateFormatter(date, "DDD"));
// → Sep 29, 2025
// Custom format with weekday
// console.log(dateFormatter(date, "cccc, LLL dd, yyyy • hh:mm a"));
// → Monday, Sep 29, 2025 • 04:30 PM
export const dateFormatter = (date, format) => {
  if (!format) {
    console.error("Format is required");
    return "---";
  }

  return DateTime.fromISO(date).setZone(zone).toFormat(format);
};
