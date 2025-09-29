import React from "react";
import SCHEDULE from "../../constants/schedule";
import {
  BriefcaseBusiness,
  Hamburger,
  BedDouble,
  TentTree,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";

const CalendarDay = ({ schedules, date, day, index }) => {
  const schedule = schedules.find((schedule) => schedule.date === date);

  if (!schedule) {
    return (
      <section className="flex flex-col justify-start text-xs italic h-full">
        <span className="text-start">{day}</span>
        <span>No schedule</span>
      </section>
    );
  }

  switch (schedule.type) {
    case SCHEDULE.WORK_DAY:
      return (
        <section key={index} className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-start">{day}</span>
            <span className="font-bold">{schedule.type}</span>
          </div>

          {/* Shift time */}
          <div className="flex items-center gap-1 text-sm">
            <BriefcaseBusiness className="w-4 h-4" />
            <span>
              {dateFormatter(schedule.shiftStart, "hh:mm a")} :{" "}
              {dateFormatter(schedule.shiftEnd, "hh:mm a")}
            </span>
          </div>

          {/* Meal time */}
          {schedule.mealStart && schedule.mealEnd && (
            <div className="flex items-center gap-1 text-sm">
              <Hamburger className="w-4 h-4" />
              <span>
                {dateFormatter(schedule.mealStart, "hh:mm a")} :{" "}
                {dateFormatter(schedule.mealEnd, "hh:mm a")}
              </span>
            </div>
          )}
        </section>
      );
    case SCHEDULE.REST_DAY:
      return (
        <section className="relative flex flex-col h-full justify-between items-end">
          <span className="font-bold">{schedule.type}</span>
          <div className="h-full w-full absolute inset-0 flex justify-center items-center">
            <BedDouble className="h-8 w-8" />
          </div>
        </section>
      );
    case SCHEDULE.HOLIDAY:
      return (
        <section className="relative flex flex-col h-full justify-between items-end">
          <span className="font-bold">{schedule.type}</span>
          <div className="h-full w-full absolute inset-0 flex justify-center items-center">
            <TentTree className="h-8 w-8" />
          </div>
        </section>
      );
    default:
      break;
  }

  return <section>CalendarDay</section>;
};

export default CalendarDay;
