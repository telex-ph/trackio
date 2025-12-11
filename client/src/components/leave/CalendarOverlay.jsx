import React, { useEffect, useState } from "react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarOverlay = ({
  startDate,
  endDate,
  onChange,
  isViewMode,
  blockedRanges,
  leaves = [],
  onView,
}) => {
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
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getStatusForDate = (date) => {
    if (!blockedRanges || blockedRanges.length === 0) return null;

    const todayMidnight = normalizeDate(new Date());
    const d = normalizeDate(date);

    return (
      blockedRanges
        .filter((range) => {
          const end = normalizeDate(range.end);
          return end >= todayMidnight; // Only future or ongoing ranges
        })
        .find((range) => {
          const start = normalizeDate(range.start);
          const end = normalizeDate(range.end);
          return d >= start && d <= end;
        })?.status || null
    );
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

  // Format date in local YYYY-MM-DD to avoid UTC shift
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
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
      const d = new Date(date.getFullYear(), date.getMonth(), -i);
      days.push({ date: d, currentMonth: false });
    }

    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth(), d),
        currentMonth: true,
      });
    }

    // Next month's overflow
    const nextDays = 7 - (days.length % 7 || 7);
    for (let d = 1; d <= nextDays; d++) {
      const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, d);
      days.push({ date: nextDate, currentMonth: false });
    }

    return days;
  };

  const handleDateClick = (date) => {
    const d = normalizeDate(date);

    // First, check if the clicked date is part of an existing leave or blocked range
    const itemForDate =
      leaves.find((leave) => {
        const start = normalizeDate(leave.startDate);
        const end = normalizeDate(leave.endDate);
        return d >= start && d <= end;
      }) ||
      blockedRanges.find((range) => {
        const start = normalizeDate(range.start);
        const end = normalizeDate(range.end);
        return d >= start && d <= end;
      });

    if (itemForDate) {
      // If we are viewing or clicking an existing leave, open the view
      onView(itemForDate._id ? itemForDate : itemForDate.id);
    } else if (!isViewMode) {
      // If no leave exists and we are NOT in view mode, select the date for new leave
      if (!selectedStart || (selectedStart && selectedEnd)) {
        // Start a new range
        setSelectedStart(d);
        setSelectedEnd(null);
        onChange({ startDate: formatDate(d), endDate: "" });
      } else if (selectedStart && !selectedEnd) {
        // Complete the range
        const start = selectedStart < d ? selectedStart : d;
        const end = selectedStart > d ? selectedStart : d;
        setSelectedStart(start);
        setSelectedEnd(end);
        onChange({ startDate: formatDate(start), endDate: formatDate(end) });
      }
    }
  };

  const isBeforeToday = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return d < today;
  };

  const isInRange = (date) => {
    if (!selectedStart) return false;
    const end = selectedEnd || hoverDate;
    if (!end) return false;

    const d = normalizeDate(date);
    const start = normalizeDate(selectedStart);
    const finish = normalizeDate(end);

    return d >= start && d <= finish;
  };

  const days = generateCalendar(currentMonth);

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full flex flex-col">
      {/* Header */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        Select Leave Dates
      </h3>

      {/* Month Navigation */}
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

      {/* Week Days */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-500 mb-1 select-none">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-sm py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Dates */}
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {days.map(({ date, currentMonth }, idx) => {
          const isToday = date.toDateString() === today.toDateString();
          const isStart =
            selectedStart &&
            date.toDateString() === selectedStart.toDateString();
          const isEnd =
            selectedEnd && date.toDateString() === selectedEnd.toDateString();
          const inRange = isInRange(date);
          const beforeToday = isBeforeToday(date);

          const status = getStatusForDate(date);

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoverDate(date)}
              onMouseLeave={() => setHoverDate(null)}
              className={`
    relative flex items-center justify-center text-sm transition
    aspect-square outline-none focus:outline-none focus:ring-0 cursor-pointer
    ${currentMonth ? "text-gray-700" : "text-gray-300 text-xs"}
    ${isToday ? "border-2 border-red-500 font-semibold" : ""}
    ${
      beforeToday &&
      !leaves.some((l) => {
        const start = normalizeDate(l.startDate);
        const end = normalizeDate(l.endDate);
        const d = normalizeDate(date);
        return d >= start && d <= end;
      })
        ? "opacity-40 cursor-not-allowed"
        : "hover:bg-red-100"
    }
    ${
      status === "For approval"
        ? "bg-yellow-200 text-yellow-900 opacity-80"
        : ""
    }
    ${status === "Approved" ? "bg-green-200 text-green-900 opacity-80" : ""}
  `}
            >
              {/* Range Highlight */}
              {inRange && !isStart && !isEnd && (
                <span className="absolute inset-0 bg-red-200 rounded-lg"></span>
              )}

              {/* Start/End Highlight */}
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

      {/* Selected Dates */}
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
