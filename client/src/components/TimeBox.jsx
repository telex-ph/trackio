import { DateTime, Interval } from "luxon";
import { Button } from "flowbite-react";
import { Square } from "lucide-react";
import formatDate from "../utils/formatDate";
import toast from "react-hot-toast";

const TimeBox = ({
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

    if (!startDT.isValid || !endDT.isValid) return "0:0:0";

    const interval = Interval.fromDateTimes(startDT, endDT);
    const duration = interval.toDuration(["hours", "minutes", "seconds"]);

    return `${Math.floor(duration.hours)}:${Math.floor(
      duration.minutes
    )}:${Math.floor(duration.seconds)}`;
  };

  return (
    <div className="flex flex-col gap-2 container-light border-light rounded-md p-5">
      <span>{title}</span>
      <div className="flex gap-3">
        <Button
          className={`flex-1 bg-[#${bgColor}] text-[#${textColor}] hover:bg-[#${textColor}] hover:text-white font-bold ${
            startTime && "cursor-not-allowed"
          }`}
          onClick={() => {
            if (startTime) {
              toast.error("Oops! This has already been marked.");
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
              endTime && "cursor-not-allowed"
            }`}
            onClick={() => {
              if (endTime) {
                toast.error("Oops! This has already been marked.");
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
