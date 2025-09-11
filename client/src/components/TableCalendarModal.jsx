import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { DateTime } from "luxon";

const TableCalendarModal = ({ isOpen, onClose, data }) => {
  const now = DateTime.now();
  const [currentMonth, setCurrentMonth] = useState(now);
  const [selectedYear, setSelectedYear] = useState(now.year);

  if (!isOpen) return null;

  // Filter data by selected year
  const filteredData = data?.filter(d => DateTime.fromISO(d.date).year === selectedYear) || [];

  // Map attendance for quick lookup
  const attendanceMap = {};
  filteredData.forEach((att) => {
    attendanceMap[att.date] = att.status;
  });

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  // Build calendar days array
  const days = [];
  for (let i = 0; i < startOfMonth.weekday % 7; i++) days.push(null);
  for (let day = 1; day <= endOfMonth.day; day++) {
    days.push(startOfMonth.set({ day }));
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getBoxColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return "bg-green-50 border-green-200 text-green-700";
      case "late": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "overtime": return "bg-blue-50 border-blue-200 text-blue-700";
      case "absent": return "bg-red-50 border-red-200 text-red-700";
      default: return "bg-gray-50 border-gray-200 text-gray-400";
    }
  };

  const prevMonth = () => setCurrentMonth(currentMonth.minus({ months: 1 }));
  const nextMonth = () => setCurrentMonth(currentMonth.plus({ months: 1 }));

  // Generate list of years for filter (past 10 years)
  const yearOptions = Array.from({ length: 10 }, (_, i) => now.year - i);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-gray-200 p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentMonth.toFormat("MMMM yyyy")} Attendance</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Month Navigation & Year Filter */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="px-2 py-1 hover:bg-gray-100 rounded transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold">{currentMonth.toFormat("MMMM")}</span>
            <button onClick={nextMonth} className="px-2 py-1 hover:bg-gray-100 rounded transition">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-700">Year:</label>
            <select
              className="border rounded px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-gray-500 font-medium mb-2">
          {weekdays.map((d) => <div key={d}>{d}</div>)}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2 text-center">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="h-20"></div>;
            const dateStr = day.toISODate();
            const status = attendanceMap[dateStr];
            return (
              <div
                key={idx}
                className={`h-20 flex flex-col items-center justify-center rounded-lg border ${getBoxColor(status)} transition cursor-pointer hover:shadow-md`}
                title={`${day.toFormat("MMMM dd, yyyy")}${status ? `: ${status}` : ""}`}
              >
                <span className="text-lg font-semibold">{day.day}</span>
                {status && <span className="text-sm mt-1 capitalize">{status}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TableCalendarModal;
