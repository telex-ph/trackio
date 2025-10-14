import React, { useMemo, useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { Square } from "lucide-react";
import { formatTime } from "../utils/formatDateTime";
import toast from "react-hot-toast";
import { calculateDuration, getButtonState } from "../utils/attendanceHelpers";

const TimeBox = ({
  attendance,
  config,
  onTimeIn,
  onUpdate,
  fetchUserAttendance,
}) => {
  const {
    title,
    isTwoBtn,
    fieldOne,
    fieldTwo,
    fieldOneStatus,
    fieldTwoStatus,
    bgColor,
    textColor,
    isSpecial,
  } = config;

  const startTime = attendance?.[fieldOne];
  const endTime = fieldTwo ? attendance?.[fieldTwo] : null;

  // state for ticking clock
  const [now, setNow] = useState(Date.now());

  // start ticking only if started and not ended
  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  const { isDisabled: isStartDisabled, errorMessage: startErrorMessage } =
    useMemo(
      () => getButtonState(attendance, fieldOne, isSpecial),
      [attendance, fieldOne, isSpecial]
    );

  const { isDisabled: isEndDisabled, errorMessage: endErrorMessage } = useMemo(
    () =>
      fieldTwo
        ? getButtonState(attendance, fieldTwo, false, true, fieldOne)
        : { isDisabled: true, errorMessage: null },
    [attendance, fieldTwo, fieldOne]
  );

  const duration = useMemo(() => {
    if (fieldOne === "timeOut") {
      return "End Shift";
    }
    if (fieldOne === "timeIn") {
      return "Start Shift";
    }

    if (!startTime) return "Start";

    if (fieldOne === "timeOut") {
      if (attendance?.timeIn && attendance?.timeOut) {
        return calculateDuration(attendance.timeIn, attendance.timeOut);
      }
      return "Not recorded";
    }

    if (fieldOne === "timeIn" && attendance?.timeOut) {
      return calculateDuration(startTime, attendance.timeOut);
    }

    return calculateDuration(startTime, endTime || now);
  }, [
    startTime,
    endTime,
    now,
    fieldOne,
    attendance?.timeOut,
    attendance?.timeIn,
  ]);

  const handleStartClick = async () => {
    if (isStartDisabled) {
      if (startErrorMessage) toast.error(startErrorMessage);
      return;
    }

    if (isSpecial) {
      onTimeIn();
    } else {
      onUpdate(fieldOne, fieldOneStatus);
    }
  };

  const handleEndClick = async () => {
    if (isEndDisabled) {
      if (endErrorMessage) toast.error(endErrorMessage);
      return;
    }
    onUpdate(fieldTwo, fieldTwoStatus);
  };

  return (
    <div className="flex flex-col gap-2 border-light rounded-md p-5 container-light">
      <h3 className="text-black">{title}</h3>
      <div className="flex gap-3">
        <button
          className={`flex-1 bg-(--primary-color) py-4 rounded-md text-white font-bold transition-colors duration-200
          ${isStartDisabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          onClick={handleStartClick}
        >
          {duration}
        </button>
        {isTwoBtn && (
          <button
            className={`bg-(--primary-color) py-4 rounded-md p-2 transition-colors duration-200 ${
              isEndDisabled ? "cursor-not-allowed opacity-60" : ""
            }`}
            onClick={handleEndClick}
          >
            <Square />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-light">
          Recorded on: {startTime ? formatTime(startTime) : "Not recorded"}
        </span>
        {fieldTwo && (
          <span>
            Ended:{" "}
            {endTime
              ? formatTime(endTime)
              : startTime
              ? "In Progress…"
              : "Not recorded"}
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(TimeBox);
