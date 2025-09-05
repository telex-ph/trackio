import React from "react";
import telexcover from "../../assets/background/telex-cover.jpg";
import { Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

// Sample chart data
const data = {
  labels: ["LATE", "ABSENT", "OVERBREAK", "UNDERTIME"],
  datasets: [
    {
      data: [12, 5, 8, 3],
      backgroundColor: ["#f97316", "#6b7280", "#a855f7", "#22c55e"],
      borderWidth: 2,
      borderColor: "#fff",
    },
  ],
};

const options = {
  cutout: "55%",
  plugins: {
    legend: {
      display: false,
    },
  },
};

const AgentDashboard = () => {
  return (
    <div className>
      {/* Main Dashboard Content */}
      <div className="flex flex-col lg:flex-row gap-4 p-1 lg:p-1">
        {/* Left Side with Header Image */}
        <div className="flex-1">
          {/* Header Image */}
          <img
            className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-2xl shadow-md"
            src={telexcover}
            alt="Dashboard Cover"
          />

          {/* Left Content */}
          <div className="p-4 lg:p-6">
            {/* Top Row */}
            <div className="flex flex-col xl:flex-row gap-6 mb-6">
              {/* Payday Section - Motivating Design */}
              <div className="relative bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg flex-1 overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Celebratory Background Sparkles */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-2 left-1/3 w-3 h-3 bg-yellow-300 rounded-full animate-bounce"></div>
                  <div className="absolute top-10 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-4 left-1/4 w-4 h-4 bg-red-500/70 rounded-full animate-bounce"></div>
                </div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      {/* Big Bold Gradient PAYDAY */}
                      <h3 className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-500 to-yellow-400 drop-shadow-lg animate-gradient-x">
                        PAYDAY
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        September 30, 2025
                      </p>
                    </div>
                    {/* Animated Icon */}
                    <div className="bg-gradient-to-tr from-red-600 to-red-400 p-5 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-500 animate-bounce">
                      <span className="text-4xl">💸</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6 relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner relative">
                      <div
                        className="h-4 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 transition-all duration-500"
                        style={{ width: "75%" }}
                      ></div>
                      {/* Spark / Ping at progress end */}
                      <div className="absolute -right-2 top-0 w-4 h-4 rounded-full bg-yellow-400 shadow-xl animate-ping"></div>
                    </div>
                    <p className="text-xs mt-2 text-gray-600">
                      75% of the month completed
                    </p>
                  </div>

                  {/* Details Cards */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-tr from-red-50 to-yellow-50 rounded-xl p-4 flex flex-col items-center shadow-inner hover:scale-105 transition-transform duration-300">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        Pay Date <span>🎉</span>
                      </p>
                      <p className="text-lg font-semibold text-red-700">
                        Sep 30
                      </p>
                    </div>
                    <div className="bg-gradient-to-tr from-red-50 to-yellow-50 rounded-xl p-4 flex flex-col items-center shadow-inner hover:scale-105 transition-transform duration-300">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        Days Remaining <span>💰</span>
                      </p>
                      <p className="text-lg font-semibold text-red-700">
                        10 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Chart */}
              <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-lg flex-1 hover:shadow-2xl transition-all duration-300">
                <h4 className="font-bold mb-4 text-base text-gray-800">
                  Punctuality & Discipline
                </h4>
                <div className="flex items-start gap-4">
                  {/* Bigger Chart */}
                  <div className="w-45 h-45 flex-shrink-0">
                    <Doughnut data={data} options={options} />
                  </div>

                  {/* Compact Legend */}
                  <div className="grid grid-cols-1 gap-3.5 w-full">
                    {[
                      { label: "Late", value: 12, color: "#f97316" }, // orange
                      { label: "Absent", value: 5, color: "#6b7280" }, // gray
                      { label: "Overbreak", value: 8, color: "#a855f7" }, // purple
                      { label: "Undertime", value: 3, color: "#22c55e" }, // green
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-xl shadow hover:scale-105 hover:shadow-md transition-transform duration-300"
                      >
                        {/* Colored Circle */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></div>

                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span
                          className="ml-auto text-xs font-semibold"
                          style={{ color: item.color }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements - More Formal & Modern */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-800">
                📢 Announcements
              </h3>

              <div className="space-y-5">
                {[
                  {
                    title: "Coaching Reminder",
                    desc: "Coaching session on Sept. 2, 3:00 PM. Attendance is required.",
                    tag: "Team Leader",
                    color: "red",
                  },
                  {
                    title: "Leave Filing",
                    desc: "Submit your September leave requests early to avoid delays.",
                    tag: "HR Department",
                    color: "blue",
                  },
                  {
                    title: "Performance Highlight",
                    desc: "Great job! Attendance compliance reached 95% this week.",
                    tag: "Operations Manager",
                    color: "green",
                  },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-xl border-l-4 border-${a.color}-500 bg-gradient-to-r from-${a.color}-50 to-${a.color}-100 shadow-sm hover:shadow-md transition`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4
                          className={`font-semibold text-lg text-${a.color}-700`}
                        >
                          {a.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{a.desc}</p>
                      </div>
                      <span
                        className={`bg-${a.color}-200 text-${a.color}-700 px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {a.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Daily Records */}
        <div className="w-full lg:w-100 xl:w-100 -mt-3 p-3 lg:p-2">
          <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50/50 rounded-3xl p-6 lg:p-8 shadow-2xl border border-gray-200/50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full blur-xl animate-bounce"></div>
            </div>

            <div className="relative z-10">
              {/* Modern Header */}
              <div className="mb-8 text-center">
                <div className></div>
                <h2 className="font-bold text-20xl text-gray-800 mb-1">
                  Daily Records
                </h2>{" "}
                <div className="w-24 h-1 bg-gradient-to-r from-red-800 to-red-500 rounded-full mx-auto"></div>
              </div>

              {/* Stats Footer */}
              <div className="mt-8 pt-6 mb-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/50 rounded-xl p-3 border border-gray-200/50 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">
                      WORKED
                    </p>
                    <p className="text-sm font-bold text-gray-800">8h 06m</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3 border border-gray-200/50 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">
                      BREAKS
                    </p>
                    <p className="text-sm font-bold text-gray-800">1h 10m</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3 border border-gray-200/50 backdrop-blur-sm">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">
                      STATUS
                    </p>
                    <p className="text-sm font-bold text-emerald-600">ACTIVE</p>
                  </div>
                </div>
              </div>

              {/* Cards Grid Layout */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    label: "TIME IN",
                    value: "8:54 A.M.",
                    icon: "🔓",
                    color: "from-emerald-500 to-teal-500",
                    textColor: "text-emerald-600",
                    bgColor: "bg-emerald-50",
                    borderColor: "border-emerald-200",
                  },
                  {
                    label: "1ST BREAK",
                    value: "11:00 A.M.",
                    icon: "⏸",
                    color: "from-amber-500 to-orange-500",
                    textColor: "text-amber-600",
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-200",
                  },
                  {
                    label: "LUNCH BREAK",
                    value: "1:00 P.M.",
                    icon: "🍽",
                    color: "from-violet-500 to-purple-500",
                    textColor: "text-violet-600",
                    bgColor: "bg-violet-50",
                    borderColor: "border-violet-200",
                  },
                  {
                    label: "2ND BREAK",
                    value: "3:00 P.M.",
                    icon: "⏸",
                    color: "from-rose-500 to-pink-500",
                    textColor: "text-rose-600",
                    bgColor: "bg-rose-50",
                    borderColor: "border-rose-200",
                  },
                  {
                    label: "BIO BREAK",
                    value: "10 minutes",
                    icon: "🚪",
                    color: "from-cyan-500 to-blue-500",
                    textColor: "text-cyan-600",
                    bgColor: "bg-cyan-50",
                    borderColor: "border-cyan-200",
                  },
                  {
                    label: "TIME OUT",
                    value: "6:00 P.M.",
                    icon: "🔒",
                    color: "from-gray-500 to-slate-500",
                    textColor: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                  },
                ].map((record, i) => (
                  <div key={i} className="group">
                    <div
                      className={`bg-white/70 backdrop-blur-sm border ${record.borderColor} rounded-2xl p-5 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden`}
                    >
                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
                      ></div>

                      <div className="flex items-center gap-4 relative z-10">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl ${record.bgColor} border ${record.borderColor} flex items-center justify-center shadow-sm`}
                        >
                          <span className="text-lg">{record.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <p
                            className={`text-xs font-bold ${record.textColor} tracking-wider uppercase mb-1`}
                          >
                            {record.label}
                          </p>
                          <p className="text-lg font-bold text-gray-800">
                            {record.value}
                          </p>
                        </div>

                        {/* Status Indicator */}
                        <div className="w-2 h-8 rounded-full bg-gray-200 relative overflow-hidden">
                          {i === 0 && (
                            <div className="w-full h-2/3 bg-gradient-to-t from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
