import React, { useMemo } from "react";
import { Button } from "flowbite-react";
import { Square } from "lucide-react";
import formatDate from "../utils/formatDate";
import toast from "react-hot-toast";
import { calculateDuration, getButtonState } from "../utils/attendanceHelpers";

const TimeBox = ({ attendance, config, onTimeIn, onUpdate, user }) => {
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

  const duration = useMemo(
    () => calculateDuration(startTime, endTime),
    [startTime, endTime]
  );

  const handleStartClick = () => {
    if (isStartDisabled) {
      if (startErrorMessage) {
        toast.error(startErrorMessage);
      }
      return;
    }

    if (isSpecial) {
      onTimeIn(user.shiftStart, user.shiftEnd);
    } else {
      onUpdate(fieldOne, fieldOneStatus);
    }
  };

  const handleEndClick = () => {
    if (isEndDisabled) {
      if (endErrorMessage) {
        toast.error(endErrorMessage);
      }
      return;
    }
    onUpdate(fieldTwo, fieldTwoStatus);
  };

  return (
    <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
      <span className="font-medium">{title}</span>
      <div className="flex gap-3">
        <Button
          className={`flex-1 hover:bg-[#${textColor}] hover:text-white font-bold transition-colors duration-200
          ${isStartDisabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          style={{
            backgroundColor: `#${bgColor}`,
            color: `#${textColor}`,
          }}
          onClick={handleStartClick}
        >
          {duration}
        </Button>
        {isTwoBtn && (
          <Button
            className={`bg-red-500 hover:bg-red-700 p-2 transition-colors duration-200 ${
              isEndDisabled ? "cursor-not-allowed opacity-60" : ""
            }`}
            onClick={handleEndClick}
          >
            <Square />
          </Button>
        )}
      </div>
      <span className="text-light text-sm">
        Time Recorded: {startTime ? formatDate(startTime) : "Not recorded"}
      </span>
    </div>
  );
};

export default React.memo(TimeBox);
