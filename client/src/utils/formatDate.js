import { DateTime } from "luxon";

const formatDate = (date) => {
  if (!date) return "---";

  return DateTime.fromISO(date).toFormat("hh:mm a"); 
  // Example output: "03:45 PM"
};

export default formatDate;
