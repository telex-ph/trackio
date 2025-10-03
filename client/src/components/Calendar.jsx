import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  Calendar as CalendarIcon,
  Home,
  Plus,
  X,
  Trash,
} from "lucide-react";
import { DateTime } from "luxon";
import useKeyboardKey from "../hooks/useKeyboardKey";
import CalendarDay from "./calendar/CalendarDay";
import Spinner from "../assets/loaders/Spinner";
import { useStore } from "../store/useStore";

const Calendar = ({ handleBtnsClick, loading, viewOnly = false }) => {
  // Explicitly use Philippine timezone
  const philippineZone = "Asia/Manila";
  const selectedDates = useStore((state) => state.selectedDates);
  const setSelectedDates = useStore((state) => state.setSelectedDates);
  const currentDate = useStore((state) => state.currentDate);
  const setCurrentDate = useStore((state) => state.setCurrentDate);

  const { isShiftPressed } = useKeyboardKey();

  const [menuPosition, setMenuPosition] = useState(null);

  const handleRightClick = (e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };
  const handleCloseMenu = () => setMenuPosition(null);

  const handleDateClick = (date) => {
    if (isShiftPressed) {
      const exists = selectedDates.some((d) => isSameDay(d, date));

      setSelectedDates(
        exists
          ? selectedDates.filter((d) => !isSameDay(d, date))
          : [...selectedDates, date]
      );

      if (!calendarData.find((d) => isSameDay(d.date, date))?.isCurrentMonth) {
        setCurrentDate(date.startOf("month"));
      }
    } else {
      setSelectedDates([date]);
    }
  };

  const handleBtnClick = (operation) => {
    if (handleBtnsClick) {
      handleBtnsClick(operation);
    }
  };

  const getDaysInMonth = (year, month) => {
    return DateTime.local(year, month, 1).daysInMonth;
  };

  const getFirstDayOfWeek = (year, month) => {
    return DateTime.local(year, month, 1).weekday % 7;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calendar data calculation using Luxon
  const calendarData = useMemo(() => {
    const year = currentDate.year;
    const month = currentDate.month;
    const daysInMonth = getDaysInMonth(year, month);

    const firstDayOfWeek = getFirstDayOfWeek(year, month);

    const days = [];

    // Previous month's trailing days
    const prevMonth = currentDate.minus({ months: 1 });

    const daysInPrevMonth = prevMonth.daysInMonth;
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: false,
        date: DateTime.local(prevMonth.year, prevMonth.month, day),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
        date: DateTime.local(year, month, day),
      });
    }

    const remainingCells = 42 - days.length;
    const nextMonth = currentDate.plus({ months: 1 });

    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        date: DateTime.local(nextMonth.year, nextMonth.month, day),
      });
    }

    return days;
  }, [currentDate]);

  // Navigation functions using Luxon
  const goToPreviousMonth = async () => {
    setCurrentDate(currentDate.minus({ months: 1 }).startOf("month"));
  };

  const goToNextMonth = async () => {
    setCurrentDate(currentDate.plus({ months: 1 }).startOf("month"));
  };

  const goToPreviousYear = async () => {
    setCurrentDate(currentDate.minus({ years: 1 }).startOf("month"));
  };

  const goToNextYear = async () => {
    setCurrentDate(currentDate.plus({ years: 1 }).startOf("month"));
  };

  const goToToday = async () => {
    const today = DateTime.now().setZone(philippineZone);
    setCurrentDate(today.startOf("month"));
    setSelectedDates([today]);
  };

  const selectMonth = (monthIndex) => {
    setCurrentDate(currentDate.set({ month: monthIndex + 1 }).startOf("month"));
  };

  const isSameDay = (date1, date2) => {
    return date1.hasSame(date2, "day");
  };

  const isToday = (date) => {
    return isSameDay(date, DateTime.now().setZone(philippineZone));
  };

  const isSelected = (date) => {
    return selectedDates.some((selectedDate) => isSameDay(date, selectedDate));
  };

  return (
    <div className="w-full mx-auto rounded-md" onClick={handleCloseMenu}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          <h3 className="text-black">Calendar</h3>
        </div>

        <button
          onClick={goToToday}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Today
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        {/* Month/Year Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousYear}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Previous Year"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-48 justify-center">
            <h3 className="text-md font-semibold text-gray-800">
              {currentDate.toFormat("MMMM yyyy")}
            </h3>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={goToNextYear}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Next Year"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>

        {/* Month Quick Selector */}
        <div className="flex flex-wrap gap-1 max-w-sm">
          {monthNames.map((month, index) => (
            <button
              key={month}
              onClick={() => selectMonth(index)}
              className={`px-2 py-1 text-xs rounded container-light border-light transition-colors text-black ${
                index + 1 === currentDate.month ? "underline" : ""
              }`}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* For testing */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <div className="">
          {isShiftPressed
            ? "Shift key is on hold"
            : "Shift key is not being pressed"}
          <p>
            Selected:{" "}
            {selectedDates.length > 0
              ? selectedDates
                  .sort((a, b) => a - b)
                  .map((d) => d.toFormat("MMM d"))
                  .join(", ")
              : "None"}
          </p>
        </div>

        <div>
          <p>
            Current time:
            {DateTime.now().setZone(philippineZone).toFormat("HH:mm:ss")}
          </p>
          <p>
            Timezone: {DateTime.now().setZone(philippineZone).zoneName}{" "}
            (Philippine Time)
          </p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-md">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-3 mb-3">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 md:p-5 text-center text-sm font-semibold container-light border-light rounded-md"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {loading ? (
          <Spinner size={30} />
        ) : (
          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {calendarData.map((dayData, index) => {
              const { date, isCurrentMonth } = dayData;
              const todayClass = isToday(date)
                ? "bg-blue-100 text-blue-800 font-bold"
                : "";
              const selectedClass = isSelected(date)
                ? "bg-blue-600 text-white"
                : "";
              const currentMonthClass = isCurrentMonth
                ? "text-gray-900"
                : "text-gray-400";

              // eg: 2025-09-11
              // const shiftDate = formatDate(date);

              return (
                <button
                  key={index}
                  className={`
    p-2 md:p-3 text-sm rounded-md cursor-pointer border-light
    ${todayClass} ${selectedClass} ${currentMonthClass}
    ${selectedClass ? "" : "hover:bg-gray-100"}
    min-h-8 sm:min-h-28 flex flex-col items-stretch
  `}
                >
                  <CalendarDay
                    date={date}
                    handleRightClick={handleRightClick}
                    handleDateClick={handleDateClick}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {menuPosition && !viewOnly && (
        <section
          className="absolute bg-white border-light shadow-lg rounded-md p-2 w-36"
          style={{
            top: menuPosition.y,
            left: menuPosition.x,
          }}
        >
          <div
            className="p-2 hover:bg-gray-200 rounded-md cursor-pointer flex justify-start items-center gap-2"
            onClick={() => handleBtnClick("upsert")}
          >
            <Plus className="w-4 h-4" />
            <span className="flex-1 text-center">Upsert</span>
          </div>
          <div
            className="p-2 hover:bg-gray-200 rounded-md cursor-pointer flex justify-start items-center gap-2"
            onClick={() => handleBtnClick("delete")}
          >
            <Trash className="w-4 h-4" />{" "}
            <span className="flex-1 text-center">Delete</span>
          </div>
          <div
            className="p-2 hover:bg-gray-200 rounded-md cursor-pointer flex justify-start items-center gap-2"
            onClick={handleCloseMenu}
          >
            <X className="w-4 h-4" />
            <span className="flex-1 text-center">Close</span>
          </div>
        </section>
      )}
    </div>
  );
};

export default Calendar;
