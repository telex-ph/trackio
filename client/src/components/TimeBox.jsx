import { DateTime, Interval } from "luxon";
import { Button } from "flowbite-react";
import { Square } from "lucide-react";
import formatDate from "../utils/formatDate";
import toast from "react-hot-toast";

const TimeBox = ({
  timeIn,
  timeOut,
  isTwoBtn,
  title,
  startTime = null,
  endTime = null,
  fieldOne,
  fieldTwo,
  btnClick,
  bgColor,
  textColor,
}) => {
  const calculateDuration = (start, end) => {
    if (!start || !end) return "Start";

    const startDT = DateTime.fromJSDate(new Date(start));
    const endDT = DateTime.fromJSDate(new Date(end));

    if (!startDT.isValid || !endDT.isValid) return "0h 0m 0s";

    const interval = Interval.fromDateTimes(startDT, endDT);
    const duration = interval.toDuration(["hours", "minutes", "seconds"]);

    return `${Math.floor(duration.hours)}h ${Math.floor(
      duration.minutes
    )}m ${Math.floor(duration.seconds)}s`;
  };

  let isStartDisabled = false;
  let isEndDisabled = false;

  // Disallow buttons
  if ((!timeIn && title !== "Time In") || startTime || timeOut) {
    isStartDisabled = true;
  }
  if ((!timeIn && title !== "Time In") || endTime || timeOut) {
    isEndDisabled = true;
  }

  return (
    <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
      <span>{title}</span>
      <div className="flex gap-3">
        {/* TODO: implement the hovering */}
        <Button
          className={`flex-1 hover:bg-[#${textColor}] hover:text-white font-bold
          ${isStartDisabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          style={{
            backgroundColor: `#${bgColor}`,
            color: `#${textColor}`,
          }}
          onClick={() => {
            if (isStartDisabled) {
              if (!timeIn) {
                toast.error(
                  "Please clock in first before performing this action."
                );
              } else if (timeOut) {
                toast.error("You have already clocked out for today.");
              } else {
                toast.error("This action has already been recorded.");
              }
              return;
            }
            btnClick(fieldOne);
          }}
        >
          {calculateDuration(startTime, endTime)}
        </Button>
        {isTwoBtn && (
          <Button
            className={`bg-red-500 hover:bg-red-700 p-2 ${
              isEndDisabled && "cursor-not-allowed"
            }`}
            onClick={() => {
              if (isEndDisabled) {
                if (!timeIn) {
                  toast.error(
                    "Please clock in first before performing this action."
                  );
                } else if (timeOut) {
                  toast.error("You have already clocked out for today.");
                } else {
                  toast.error("This action has already been recorded.");
                }
                return;
              }
              btnClick(fieldTwo);
            }}
          >
            <Square />
          </Button>
        )}
      </div>
      <span className="text-light">Time Recorded: {formatDate(startTime)}</span>
    </div>
  );
};

export default TimeBox;
