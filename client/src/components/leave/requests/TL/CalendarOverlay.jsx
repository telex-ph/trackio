import React, { useEffect, useState } from "react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarOverlay = ({
  startDate,
  endDate,
  onChange,
  isViewMode,
}) => {
  const ADVANCE_LEAVE_TYPES = [
    "parental leave",
    "vacation leave",
    "leave without pay",
  ];

  useEffect(() => {
    if (!isViewMode) return;

    setSelectedStart(startDate ? new Date(startDate) : null);
    setSelectedEnd(endDate ? new Date(endDate) : null);

    if (startDate) {
      setCurrentMonth(new Date(startDate));
    }
  }, [startDate, endDate, isViewMode]);

  useEffect(() => {
    if (isViewMode) return;

    setSelectedStart(null);
    setSelectedEnd(null);
    setHoverDate(null);
  }, [isViewMode]);

  const today = new Date();

  //Detect booked leave helper
  const normalizeDate = (date) => {
    const dates = new Date(date);
    dates.setHours(0, 0, 0, 0);
    return dates;
  };

  today.setHours(0, 0, 0, 0);

  // Today at midnight
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState(
    startDate ? new Date(startDate) : null
  );
  const [selectedEnd, setSelectedEnd] = useState(
    endDate ? new Date(endDate) : null
  );
  const [hoverDate, setHoverDate] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        // Clear selection
        setSelectedStart(null);
        setSelectedEnd(null);
        onChange({ startDate: "", endDate: "" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onChange]);

  // Format date in local YYYY-MM-DD to avoid UTC shift in Render
  const formatDate = (dates) => {
    const year = dates.getFullYear();
    const month = String(dates.getMonth() + 1).padStart(2, "0");
    const day = String(dates.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const startOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const generateCalendar = (date) => {
    const firstDay = startOfMonth(date);
    const lastDay = endOfMonth(date);
    const days = [];

    // Previous month's overflow
    const prevMonthDays = firstDay.getDay();
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const dates = new Date(date.getFullYear(), date.getMonth(), -i);
      days.push({ date: dates, currentMonth: false });
    }

    // Current month
    for (let dates = 1; dates <= lastDay.getDate(); dates++) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth(), dates),
        currentMonth: true,
      });
    }

    // Next month's overflow
    const nextDays = 7 - (days.length % 7 || 7);
    for (let dates = 1; dates <= nextDays; dates++) {
      const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, dates);
      days.push({ date: nextDate, currentMonth: false });
    }

    return days;
  };

  const isInRange = (date) => {
    if (!selectedStart) return false;
    const end = selectedEnd || hoverDate;
    if (!end) return false;

    const dates = normalizeDate(date);
    const start = normalizeDate(selectedStart);
    const finish = normalizeDate(end);

    return dates >= start && dates <= finish;
  };

  const days = generateCalendar(currentMonth);

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        Select Leave Dates
      </h3>

      <div className="flex justify-between items-center mb-1 px-4">
        <button
          disabled={isViewMode}
          onClick={() =>
            !isViewMode &&
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
              )
            )
          }
          className={`px-3 py-1 rounded transition 
      ${isViewMode ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
        >
          ◀
        </button>

        <span className="text-gray-800 font-semibold">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>

        <button
          disabled={isViewMode}
          onClick={() =>
            !isViewMode &&
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
              )
            )
          }
          className={`px-3 py-1 rounded transition 
      ${isViewMode ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}`}
        >
          ▶
        </button>
      </div>

      <div className="grid grid-cols-7 text-center font-medium text-gray-500 mb-1 select-none">
        {WEEK_DAYS.map((dates) => (
          <div key={dates} className="text-sm py-1">
            {dates}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {days.map(({ date, currentMonth }, idx) => {
          const isToday = date.toDateString() === today.toDateString();
          const isStart =
            selectedStart &&
            date.toDateString() === selectedStart.toDateString();
          const isEnd =
            selectedEnd && date.toDateString() === selectedEnd.toDateString();
          const inRange = isInRange(date);

          return (
            <button
              key={idx}
              onMouseEnter={() => setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
              className={`
    relative flex items-center justify-center text-sm transition
    aspect-square outline-none focus:outline-none focus:ring-0 cursor-pointer
    ${currentMonth ? "text-gray-700" : "text-gray-300 text-xs"}
    ${isToday ? "border-2 border-red-500 font-semibold" : ""}
  `}
            >
              {inRange && !isStart && !isEnd && (
                <span className="absolute inset-0 bg-red-200 rounded-lg"></span>
              )}

              {(isStart || isEnd) && (
                <span className="absolute inset-0 bg-red-600 rounded-lg shadow-md"></span>
              )}

              <span
                className={
                  isStart || isEnd ? "relative text-white" : "relative"
                }
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {(selectedStart || selectedEnd) && (
        <p className="mt-2 mb-2 text-gray-700 text-sm font-medium text-center">
          Selected: {selectedStart ? formatDate(selectedStart) : "—"}{" "}
          {selectedEnd ? `→ ${formatDate(selectedEnd)}` : ""}
        </p>
      )}
    </div>
  );
};

export default CalendarOverlay;
