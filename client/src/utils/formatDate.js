import { DateTime } from "luxon";

const formatDate = (date) => {
  if (!date) return "---";

  return DateTime.fromISO(date).toFormat("hh:mm a"); 
};

export default formatDate;
