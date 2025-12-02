import SCHEDULE from "../../constants/schedule";
import {
  Building,
  BriefcaseBusiness,
  BedDouble,
  TentTree,
  StickyNote,
  TreePalm,
  CircleOff,
  ShieldQuestionMark,
  TriangleAlert,
  Baby,
  UserRound,
  CalendarOff,
  FlagOff,
  AlarmClockMinus,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";
import { useStore } from "../../store/useStore";
import { useSchedule } from "../../hooks/useSchedule";
import { useParams } from "react-router-dom";

const CalendarDay = ({ date, readOnly, handleRightClick, handleDateClick }) => {
  const user = useStore((state) => state.user);
  const { id } = useParams();

  // eg: 2021-03-12
  const formattedDate = dateFormatter(date, "yyyy-MM-dd");
  // eg: 12
  const formmatedDay = dateFormatter(date, "d");
  // If read only use the userId else use the params id
  const { schedule: shiftSchedule } = useSchedule({
    id: readOnly ? user._id : id,
  });
  const schedule = shiftSchedule?.find(
    (schedule) => dateFormatter(schedule.date, "yyyy-MM-dd") === formattedDate
  );

  const getScheduleLeaveIcon = (type) => {
    switch (type) {
      case SCHEDULE.ABSENT:
        return <CalendarOff className="h-8 w-8" />;
      case SCHEDULE.SUSPENDED:
        return <FlagOff className="h-8 w-8" />;
      case SCHEDULE.UNDERTIME:
        return <AlarmClockMinus className="h-8 w-8" />;
      case SCHEDULE.VACATION_LEAVE:
        return <TreePalm className="h-8 w-8" />;
      case SCHEDULE.UNPAID_VACATION_LEAVE:
        return <CircleOff className="h-8 w-8" />;
      case SCHEDULE.EMERGENCY_LEAVE:
        return <TriangleAlert className="h-8 w-8" />;
      case SCHEDULE.MATERNITY_LEAVE:
        return <Baby className="h-8 w-8" />;
      case SCHEDULE.PATERNITY_LEAVE:
        return <Baby className="h-8 w-8" />;
      case SCHEDULE.SOLO_PARENT_LEAVE:
        return <UserRound className="h-8 w-8" />;
      default:
        return <ShieldQuestionMark className="h-8 w-8" />;
    }
  };

  switch (schedule?.type) {
    case SCHEDULE.WORK_DAY:
    case SCHEDULE.REPORTING:
      return (
        <section
          className="relative flex flex-col h-full"
          onContextMenu={handleRightClick}
          onClick={() => {
            handleDateClick(date);
          }}
        >
          <div className="flex justify-between">
            <span className="text-start">{formmatedDay}</span>
            <span className="font-bold">{schedule.type || "---"}</span>
          </div>

          <div className="h-full w-full absolute inset-0 flex justify-center items-center">
            <Building className="h-8 w-8" />
          </div>

          {/* Shift time */}
          <div className="flex items-center gap-1 text-sm">
            <BriefcaseBusiness className="w-4 h-4" />
            <span>
              {dateFormatter(schedule.shiftStart, "hh:mm a")} :{" "}
              {dateFormatter(schedule.shiftEnd, "hh:mm a")}
            </span>
          </div>

          <div className="flex items-end gap-1 w-full h-full mt-16">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1 text-left"
            >
              {schedule.notes || "---"}
            </span>
          </div>

          <div className="flex items-start gap-1 w-full italic">
            <span
              title={`${schedule?.user?.firstName} ${schedule?.user?.lastName}`}
              className="text-xs! ml-auto w-min truncate"
            >
              Updated by: {schedule?.user?.firstName} {schedule?.user?.lastName}
            </span>
          </div>
          <div className="flex gap-1 w-full italic">
            <span
              title={`${schedule?.updatedAt}`}
              className="text-xs! ml-auto w-min truncate"
            >
              {schedule?.updatedAt
                ? `at ${dateFormatter(
                    schedule?.updatedAt,
                    "yyyy-MM-dd hh:mm a"
                  )}`
                : ""}
            </span>
          </div>
        </section>
      );
    case SCHEDULE.REST_DAY:
      return (
        <section
          className="relative flex flex-col justify-evenly h-full"
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

          <div className="flex gap-1 items-end w-full h-full mt-16">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1 text-left"
            >
              {schedule.notes || ""}
            </span>
          </div>
          <div className="flex gap-1 w-full italic">
            <span
              title={`${schedule?.user?.firstName} ${schedule?.user?.lastName}`}
              className="text-xs! ml-auto w-min truncate"
            >
              Updated by: {schedule?.user?.firstName} {schedule?.user?.lastName}
            </span>
          </div>
          <div className="flex gap-1 w-full italic">
            <span
              title={`${schedule?.updatedAt}`}
              className="text-xs! ml-auto w-min truncate"
            >
              {schedule?.updatedAt
                ? `at ${dateFormatter(
                    schedule?.updatedAt,
                    "yyyy-MM-dd hh:mm a"
                  )}`
                : ""}
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

          <div className="flex items-end gap-1 w-full h-full mt-16">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1 text-left"
            >
              {schedule.notes || "---"}
            </span>
          </div>

          <div className="flex items-start gap-1 w-full italic">
            <span
              title={`${schedule?.user?.firstName} ${schedule?.user?.lastName}`}
              className="text-xs! ml-auto w-min truncate"
            >
              Updated by: {schedule?.user?.firstName} {schedule?.user?.lastName}
            </span>
          </div>
          <div className="flex items-start gap-1 w-full italic">
            <span
              title={`${schedule?.updatedAt}`}
              className="text-xs! ml-auto w-min truncate"
            >
              {schedule?.updatedAt
                ? `at ${dateFormatter(
                    schedule?.updatedAt,
                    "yyyy-MM-dd hh:mm a"
                  )}`
                : ""}
            </span>
          </div>
        </section>
      );

    case SCHEDULE.ABSENT:
    case SCHEDULE.SUSPENDED:
    case SCHEDULE.UNDERTIME:
    case SCHEDULE.VACATION_LEAVE:
    case SCHEDULE.UNPAID_VACATION_LEAVE:
    case SCHEDULE.EMERGENCY_LEAVE:
    case SCHEDULE.MATERNITY_LEAVE:
    case SCHEDULE.PATERNITY_LEAVE:
    case SCHEDULE.SOLO_PARENT_LEAVE:
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
            {getScheduleLeaveIcon(schedule?.type)}
          </div>

          <div className="flex items-end gap-1 w-full h-full mt-16">
            <StickyNote className="w-4 h-4" />
            <span
              title={schedule.notes}
              className="text-xs! w-min truncate flex-1 text-left"
            >
              {schedule.notes || "---"}
            </span>
          </div>

          <div className="flex items-start gap-1 w-full italic">
            <span
              title={`${schedule?.user?.firstName} ${schedule?.user?.lastName}`}
              className="text-xs! ml-auto w-min truncate"
            >
              Updated by: {schedule?.user?.firstName} {schedule?.user?.lastName}
            </span>
          </div>
          <div className="flex items-start gap-1 w-full italic">
            <span
              title={`${schedule?.updatedAt}`}
              className="text-xs! ml-auto w-min truncate"
            >
              {schedule?.updatedAt
                ? `at ${dateFormatter(
                    schedule?.updatedAt,
                    "yyyy-MM-dd hh:mm a"
                  )}`
                : ""}
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
