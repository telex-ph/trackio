import SCHEDULE from "../../constants/schedule";
import {
  BriefcaseBusiness,
  Hamburger,
  BedDouble,
  TentTree,
  StickyNote,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";
import { useStore } from "../../store/useStore";

const CalendarDay = ({ date, handleRightClick, handleDateClick }) => {
  // eg: 2021-03-12
  const formattedDate = dateFormatter(date, "yyyy-MM-dd");
  // eg: 12
  const formmatedDay = dateFormatter(date, "d");
  // Shift Schedule

  const shiftSchedule = useStore((state) => state.shiftSchedule);
  const schedule = shiftSchedule.find(
    (schedule) => dateFormatter(schedule.date, "yyyy-MM-dd") === formattedDate
  );

  switch (schedule?.type) {
    case SCHEDULE.WORK_DAY:
      return (
        <section
          className="flex flex-col gap-2"
          onContextMenu={handleRightClick}
          onClick={() => {
            handleDateClick(date);
          }}
        >
          <div className="flex justify-between">
            <span className="text-start">{formmatedDay}</span>
            <span className="font-bold">{schedule.type || "---"}</span>
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

          <div className="flex items-center gap-1 w-full">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1"
            >
              {schedule.notes || "---"}
            </span>
          </div>
        </section>
      );
    case SCHEDULE.REST_DAY:
      return (
        <section
          className="relative flex flex-col h-full justify-between items-end"
          onContextMenu={handleRightClick}
          onClick={() => {
            handleDateClick(date);
          }}
        >
          <div className="w-full flex justify-between">
            <span className="text-start">{formmatedDay}</span>
            <span className="font-bold">{schedule.type || "---"}</span>
          </div>

          <div className="h-full w-full absolute inset-0 flex justify-center items-center">
            <BedDouble className="h-8 w-8" />
          </div>

          <div className="flex items-center gap-1 w-full">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1"
            >
              {schedule.notes || "---"}
            </span>
          </div>
        </section>
      );
    case SCHEDULE.HOLIDAY:
      return (
        <section
          className="relative flex flex-col h-full justify-between items-end"
          onContextMenu={handleRightClick}
          onClick={() => {
            handleDateClick(date);
          }}
        >
          <div className="w-full flex justify-between">
            <span className="text-start">{formmatedDay}</span>
            <span className="font-bold">{schedule.type || "---"}</span>
          </div>

          <div className="h-full w-full absolute inset-0 flex justify-center items-center">
            <TentTree className="h-8 w-8" />
          </div>

          <div className="flex items-center gap-1 w-full">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1"
            >
              {schedule.notes || "---"}
            </span>
          </div>
        </section>
      );
    default:
      return (
        <section
          className="flex flex-col justify-start text-xs italic h-full"
          onContextMenu={handleRightClick}
          onClick={() => {
            handleDateClick(date);
          }}
        >
          <span className="text-start">{formmatedDay}</span>
          <span>No schedule</span>
        </section>
      );
  }
};

export default CalendarDay;
