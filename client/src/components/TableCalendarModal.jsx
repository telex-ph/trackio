import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, Users, Clock, Home } from "lucide-react";
import { DateTime } from "luxon";

const TableCalendarModal = ({ isOpen, onClose, data, employeeName = "John Doe" }) => {
  const now = DateTime.now();
  const [currentMonth, setCurrentMonth] = useState(now);
  const [selectedYear, setSelectedYear] = useState(now.year);
  const [selectedMonth, setSelectedMonth] = useState(now.month);

  if (!isOpen) return null;

  // Filter data by selected year and month
  const filteredData = data?.filter(d => {
    const date = DateTime.fromISO(d.date);
    return date.year === selectedYear && date.month === selectedMonth;
  }) || [];

  // Map attendance for quick lookup
  const attendanceMap = {};
  filteredData.forEach((att) => {
    attendanceMap[att.date] = att.status;
  });

  // Use selectedYear and selectedMonth for calendar display
  const displayMonth = DateTime.fromObject({ year: selectedYear, month: selectedMonth });
  const startOfMonth = displayMonth.startOf("month");
  const endOfMonth = displayMonth.endOf("month");
  const startOfCalendar = startOfMonth.startOf("week");
  const endOfCalendar = endOfMonth.endOf("week");

  // Build calendar days array (full weeks)
  const days = [];
  let current = startOfCalendar;
  while (current <= endOfCalendar) {
    days.push(current);
    current = current.plus({ days: 1 });
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": 
        return "bg-green-500";
      case "late": 
        return "bg-yellow-500";
      case "overtime": 
        return "bg-blue-500";
      case "absent": 
        return "bg-red-500";
      default: 
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "present": 
        return "Present";
      case "late": 
        return "Late";
      case "overtime": 
        return "Overtime";
      case "absent": 
        return "Absent";
      default: 
        return status;
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    // Limit to current month
    const currentDate = DateTime.now();
    if (selectedYear < currentDate.year || (selectedYear === currentDate.year && selectedMonth < currentDate.month)) {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const goToToday = () => {
    setSelectedYear(now.year);
    setSelectedMonth(now.month);
    setCurrentMonth(now);
  };

  // Generate list of years for filter (past 10 years to current year)
  const yearOptions = Array.from({ length: 10 }, (_, i) => now.year - i);

  // Generate months up to current month for current year, or all months for past years
  const getAvailableMonths = () => {
    if (selectedYear === now.year) {
      return Array.from({ length: now.month }, (_, i) => i + 1);
    } else {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  };

  const isToday = (date) => date.hasSame(now, 'day');
  const isCurrentMonth = (date) => date.hasSame(displayMonth, 'month');

  // Calculate stats for selected month
  const currentMonthStats = {
    present: filteredData.filter(d => d.status?.toLowerCase() === 'present').length,
    late: filteredData.filter(d => d.status?.toLowerCase() === 'late').length,
    overtime: filteredData.filter(d => d.status?.toLowerCase() === 'overtime').length,
    absent: filteredData.filter(d => d.status?.toLowerCase() === 'absent').length,
  };

  const isCurrentMonthToday = selectedYear === now.year && selectedMonth === now.month;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full h-[90vh] overflow-hidden flex">
        
        {/* Left Sidebar - Made scrollable */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Employee Info - Fixed header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-semibold text-gray-900">{employeeName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedYear}
                  onChange={(e) => {
                    const newYear = Number(e.target.value);
                    setSelectedYear(newYear);
                    // Reset to January or current month if current year
                    if (newYear === now.year) {
                      setSelectedMonth(Math.min(selectedMonth, now.month));
                    } else {
                      setSelectedMonth(1);
                    }
                  }}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {getAvailableMonths().map((m) => (
                    <option key={m} value={m}>{monthNames[m - 1].slice(0, 3)}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={goToToday}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Today
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Mini Calendar */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{displayMonth.toFormat("MMMM yyyy")}</h3>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-center p-1 text-gray-500 font-medium">{day}</div>
                ))}
                {days.slice(0, 42).map((day, idx) => {
                  const isCurrentMonthDay = isCurrentMonth(day);
                  const today = isToday(day);
                  const hasStatus = attendanceMap[day.toISODate()];
                  
                  return (
                    <div
                      key={idx}
                      className={`
                        text-center p-1 text-xs rounded
                        ${!isCurrentMonthDay ? 'text-gray-300' : 'text-gray-700'}
                        ${today ? 'bg-blue-600 text-white font-bold' : ''}
                        ${hasStatus && !today ? 'bg-gray-100' : ''}
                        cursor-pointer hover:bg-gray-200
                      `}
                    >
                      {day.day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Monthly Summary</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Present</span>
                  </div>
                  <span className="font-semibold text-green-600">{currentMonthStats.present}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-600">Late</span>
                  </div>
                  <span className="font-semibold text-yellow-600">{currentMonthStats.late}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-600">Overtime</span>
                  </div>
                  <span className="font-semibold text-blue-600">{currentMonthStats.overtime}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600">Absent</span>
                  </div>
                  <span className="font-semibold text-red-600">{currentMonthStats.absent}</span>
                </div>
              </div>
            </div>

            {/* Attendance Performance Rating */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Attendance Performance</span>
              </div>
              
              {/* Overall Attendance Score */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Overall Score</span>
                  <span className="text-lg font-bold text-green-600">4.2/5.0</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-3 h-3 rounded-full ${
                        star <= 4 ? 'bg-green-400' : star <= 4.2 ? 'bg-green-200' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Individual Attendance Ratings */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Punctuality</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= 4 ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Consistency</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= 5 ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Time Management</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div
                        key={star}
                        className={`w-2 h-2 rounded-full ${
                          star <= 4 ? 'bg-green-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Monthly Stats */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Enhanced Monthly Stats</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Hours Worked</span>
                  <span className="text-lg font-bold text-green-600">168.5 hrs</span>
                </div>
                <div className="text-xs text-gray-500">
                  Target: 160 hrs (+5.3% over target)
                </div>
              </div>

              {/* Comprehensive Attendance Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 mb-2">Attendance Breakdown</div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">On Time</span>
                  </div>
                  <span className="font-semibold text-green-600">{currentMonthStats.present} days</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Late Arrivals</span>
                  </div>
                  <span className="font-semibold text-yellow-600">{currentMonthStats.late} days</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Overtime</span>
                  </div>
                  <span className="font-semibold text-blue-600">{currentMonthStats.overtime} days</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Absences</span>
                  </div>
                  <span className="font-semibold text-red-600">{currentMonthStats.absent} days</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Attendance Rate</span>
                  <span className="font-semibold text-gray-700">
                    {Math.round(((currentMonthStats.present + currentMonthStats.late + currentMonthStats.overtime) / 
                    (currentMonthStats.present + currentMonthStats.late + currentMonthStats.overtime + currentMonthStats.absent) * 100) || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={prevMonth} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={selectedYear === now.year - 9 && selectedMonth === 1}
                >
                  <ChevronLeft className={`w-5 h-5 ${selectedYear === now.year - 9 && selectedMonth === 1 ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
                
                <button 
                  onClick={nextMonth} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  disabled={isCurrentMonthToday}
                >
                  <ChevronRight className={`w-5 h-5 ${isCurrentMonthToday ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
              
              <h3 className="text-2xl font-normal text-gray-800">
                {displayMonth.toFormat("MMMM yyyy")}
              </h3>
            </div>

            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {weekdays.map((day) => (
                <div key={day} className="py-3 px-4 text-center border-r border-gray-200 last:border-r-0">
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7">
              {days.map((day, idx) => {
                const dateStr = day.toISODate();
                const status = attendanceMap[dateStr];
                const today = isToday(day);
                const currentMonthDay = isCurrentMonth(day);
                
                return (
                  <div
                    key={idx}
                    className={`
                      min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0 relative
                      ${currentMonthDay ? 'bg-white' : 'bg-gray-50'}
                      ${today ? 'bg-blue-50' : ''}
                      hover:bg-gray-50 transition-colors cursor-pointer
                    `}
                    style={{ height: 'calc((100vh - 200px) / 6)' }}
                  >
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`
                          text-sm font-medium
                          ${!currentMonthDay ? 'text-gray-400' : 'text-gray-700'}
                          ${today ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold' : ''}
                        `}>
                          {day.day}
                        </span>
                      </div>
                      
                      {status && (
                        <div className="mt-1">
                          <div className={`
                            ${getStatusColor(status)} text-white text-xs px-2 py-1 rounded font-medium
                          `}>
                            {getStatusLabel(status)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCalendarModal;