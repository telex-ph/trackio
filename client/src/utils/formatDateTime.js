import { DateTime } from "luxon";
const fmtTime = "hh:mm a";
const fmtDate = "yyyy-MM-dd";
const zone = "Asia/Manila";

export const formatTime = (time) => {
  if (!time) return "---";

  const formattedTime = time
    ? DateTime.fromISO(time).setZone(zone).toFormat(fmtTime)
    : "Not Logged In";

  return formattedTime;
};

export const formatDate = (date) => {
  const formatDate = date
    ? DateTime.fromISO(date).setZone(zone).toFormat(fmtDate)
    : "Not Logged In";
  return formatDate;
};
