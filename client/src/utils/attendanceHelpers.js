// utils/attendanceHelpers.js
import { DateTime, Interval } from "luxon";

export const calculateDuration = (start, end) => {
  if (!start || !end) return "Start";

  const startDT = DateTime.fromJSDate(new Date(start));
  const endDT = DateTime.fromJSDate(new Date(end));

  if (!startDT.isValid || !endDT.isValid) return "0h 0m 0s";

  const interval = Interval.fromDateTimes(startDT, endDT);
  const duration = interval.toDuration(["hours", "minutes", "seconds"]);

  return `${Math.floor(duration.hours || 0)}h ${Math.floor(
    duration.minutes || 0
  )}m ${Math.floor(duration.seconds || 0)}s`;
};

export const getButtonState = (
  attendance,
  field,
  isTimeIn = false,
  isEndAction = false,
  startField = null
) => {
  const { timeIn, timeOut } = attendance || {};

  // NEW CODE ADDED
  if (isEndAction && startField) {
    const startValue = attendance?.[startField];
    if (!startValue) {
      return {
        isDisabled: true,
        errorMessage: "You must start this activity before ending it.",
      };
    }
  }

  if (isTimeIn) {
    return {
      isDisabled: !!timeIn,
      errorMessage: timeIn ? "You have already clocked in for today." : null,
    };
  }

  // For all other actions
  if (!timeIn) {
    return {
      isDisabled: true,
      errorMessage: "Please clock in first before performing this action.",
    };
  }

  if (timeOut) {
    return {
      isDisabled: true,
      errorMessage: "You have already clocked out for today.",
    };
  }

  const fieldValue = attendance?.[field];
  if (fieldValue) {
    return {
      isDisabled: true,
      errorMessage: "This action has already been recorded.",
    };
  }

  return {
    isDisabled: false,
    errorMessage: null,
  };
};
