import React from "react";
import {
  Clock,
  Coffee,
  Utensils,
  Pause,
  DoorOpen,
  LogOut,
  LogIn,
  Activity,
} from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import telexcover from "../../assets/background/telex-cover.jpg";
import UnderContruction from "../../assets/illustrations/UnderContruction";

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
    <section className="h-full">
      <UnderContruction />
    </section>
  );

  return (
    <div>
      {/* Main Dashboard Content */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 p-1 lg:p-1">
        {/* Left Side with Header Image */}
        <div className="flex-1">
          {/* Header Image */}
          <img
            className="w-full h-24 xs:h-28 sm:h-32 md:h-40 lg:h-48 object-cover rounded-xl sm:rounded-2xl shadow-md"
            src={telexcover}
            alt="Dashboard Cover"
          />

          {/* Left Content */}
          <div className="p-2 sm:p-4 lg:p-6">
            {/* Top Row */}
            <div className="flex flex-col xl:flex-row gap-3 sm:gap-6 mb-4 sm:mb-6">
              {/* Payday Section - Motivating Design */}
              <div className="relative bg-gradient-to-br from-white/80 via-red-50/60 to-yellow-50/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex-1 overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] border border-white/40">
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Animated Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-yellow-500/5 animate-pulse"></div>

                  {/* Floating Money Emojis */}
                  <div
                    className="absolute top-3 sm:top-6 left-1/4 text-lg sm:text-2xl animate-bounce"
                    style={{ animationDelay: "0s" }}
                  >
                    💰
                  </div>
                  <div
                    className="absolute top-8 sm:top-16 right-1/3 text-base sm:text-xl animate-bounce"
                    style={{ animationDelay: "1s" }}
                  >
                    💸
                  </div>
                  <div
                    className="absolute bottom-10 sm:bottom-20 left-1/5 text-sm sm:text-lg animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  >
                    🤑
                  </div>

                  {/* Enhanced Sparkles */}
                  <div className="absolute top-2 left-1/3 w-2 sm:w-3 h-2 sm:h-3 bg-yellow-300 rounded-full animate-bounce"></div>
                  <div className="absolute top-5 sm:top-10 right-1/4 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-red-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-2 sm:bottom-4 left-1/4 w-3 sm:w-4 h-3 sm:h-4 bg-red-500/70 rounded-full animate-bounce"></div>
                  <div
                    className="absolute top-2 sm:top-4 left-2/3 w-2 sm:w-3 h-2 sm:h-3 bg-red-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute top-6 sm:top-12 right-1/5 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-yellow-500 rounded-full animate-ping"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>

                <div className="relative z-10">
                  {/* Enhanced Header */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex-1">
                      <h3 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-500 to-yellow-400 drop-shadow-2xl hover:scale-105 transition-transform duration-300">
                        PAYDAY
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                        <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          September 30, 2025
                        </p>
                        <span className="text-sm sm:text-lg">🎯</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-4 sm:mb-6 relative">
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded-full h-4 sm:h-6 overflow-hidden shadow-inner border border-gray-300/50 relative">
                      <div
                        className="h-4 sm:h-6 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 transition-all duration-1000 shadow-lg relative overflow-hidden"
                        style={{ width: "75%" }}
                      >
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
                      </div>
                      {/* Enhanced spark at progress end */}
                      <div className="absolute right-4 sm:right-6 top-0 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-yellow-400 shadow-xl animate-ping border-2 border-white"></div>
                    </div>
                    <p className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-600 font-medium flex items-center gap-2">
                      75% of the month completed
                    </p>
                  </div>

                  {/* Enhanced Details Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    <div className="bg-gradient-to-tr from-red-50 via-white/50 to-yellow-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm">
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 font-medium mb-1 sm:mb-2">
                        Pay Date
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">
                        Sep 30
                      </p>
                    </div>
                    <div className="bg-gradient-to-tr from-red-50 via-white/50 to-yellow-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm">
                      <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 font-medium mb-1 sm:mb-2">
                        Days Remaining
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">
                        10 days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Chart */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex-1 hover:shadow-2xl transition-all duration-300">
                <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base text-gray-800">
                  Punctuality & Discipline
                </h4>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                  {/* Bigger Chart */}
                  <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-45 md:h-45 flex-shrink-0">
                    <Doughnut data={data} options={options} />
                  </div>

                  {/* Compact Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3.5 w-full">
                    {[
                      { label: "Late", value: 12, color: "#f97316" }, // orange
                      { label: "Absent", value: 5, color: "#6b7280" }, // gray
                      { label: "Overbreak", value: 8, color: "#a855f7" }, // purple
                      { label: "Undertime", value: 3, color: "#22c55e" }, // green
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 sm:gap-3 bg-white/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow hover:scale-105 hover:shadow-md transition-transform duration-300"
                      >
                        {/* Colored Circle */}
                        <div
                          className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></div>

                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                          {item.label}
                        </span>
                        <span
                          className="ml-auto text-xs font-semibold flex-shrink-0"
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

            {/* Enhanced Announcements */}
            <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm">
              {/* Animated Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-blue-400/15 to-purple-400/10 rounded-full blur-xl sm:blur-2xl animate-pulse"></div>
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 sm:w-20 h-10 sm:h-20 bg-gradient-to-r from-green-400/10 to-teal-400/15 rounded-full blur-lg sm:blur-xl animate-bounce"></div>
              </div>

              <div className="relative z-10">
                {/* Enhanced Header */}
                <div className="mb-4 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                      <span className="text-lg sm:text-2xl">📢</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg sm:text-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                        Announcements
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        Latest updates and important notices
                      </p>
                    </div>
                  </div>
                  <div className="w-16 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                </div>

                <div className="space-y-3 sm:space-y-6">
                  {[
                    {
                      title: "Coaching Reminder",
                      desc: "Coaching session on Sept. 2, 3:00 PM. Attendance is required.",
                      tag: "Team Leader",
                      color: "red",
                      priority: "high",
                      time: "2 hours ago",
                    },
                    {
                      title: "Leave Filing",
                      desc: "Submit your September leave requests early to avoid delays.",
                      tag: "HR Department",
                      color: "blue",
                      priority: "medium",
                      time: "1 day ago",
                    },
                    {
                      title: "Performance Highlight",
                      desc: "Great job! Attendance compliance reached 95% this week.",
                      tag: "Operations Manager",
                      color: "green",
                      priority: "low",
                      time: "3 days ago",
                    },
                  ].map((a, i) => (
                    <div key={i} className="group">
                      <div
                        className={`bg-white/80 backdrop-blur-md border-l-4 ${
                          a.color === "red"
                            ? "border-red-400"
                            : a.color === "blue"
                            ? "border-blue-400"
                            : "border-green-400"
                        } rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden`}
                      >
                        {/* Hover Background Effect */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${
                            a.color === "red"
                              ? "from-red-50/80 to-red-100/50"
                              : a.color === "blue"
                              ? "from-blue-50/80 to-blue-100/50"
                              : "from-green-50/80 to-green-100/50"
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl`}
                        ></div>

                        {/* Priority Indicator */}
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                          <div
                            className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full ${
                              a.priority === "high"
                                ? "bg-red-400 animate-pulse"
                                : a.priority === "medium"
                                ? "bg-yellow-400"
                                : "bg-green-400"
                            } shadow-lg`}
                          ></div>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                            {/* Enhanced Icon */}
                            <div
                              className={`w-8 sm:w-12 h-8 sm:h-12 rounded-xl sm:rounded-2xl ${
                                a.color === "red"
                                  ? "bg-red-100 border-red-200"
                                  : a.color === "blue"
                                  ? "bg-blue-100 border-blue-200"
                                  : "bg-green-100 border-green-200"
                              } border flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                            >
                              <span className="text-lg sm:text-2xl">
                                {a.color === "red"
                                  ? "👥"
                                  : a.color === "blue"
                                  ? "📅"
                                  : "🏆"}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <h4
                                  className={`font-bold text-base sm:text-lg ${
                                    a.color === "red"
                                      ? "text-red-700"
                                      : a.color === "blue"
                                      ? "text-blue-700"
                                      : "text-green-700"
                                  } group-hover:scale-[1.02] transition-transform`}
                                >
                                  {a.title}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                                  <span>🕐</span>
                                  <span className="hidden sm:inline">
                                    {a.time}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                                {a.desc}
                              </p>

                              {/* Enhanced Tag */}
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`${
                                    a.color === "red"
                                      ? "bg-red-200/80 text-red-800 border-red-300"
                                      : a.color === "blue"
                                      ? "bg-blue-200/80 text-blue-800 border-blue-300"
                                      : "bg-green-200/80 text-green-800 border-green-300"
                                  } px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs font-bold border backdrop-blur-sm shadow-sm`}
                                >
                                  {a.tag}
                                </span>

                                {/* Action Button */}
                                <button className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors group-hover:translate-x-1 transform duration-300">
                                  <span>View Details</span>
                                  <span>→</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar for Urgent Items */}
                          {a.priority === "high" && (
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/60">
                              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                  Urgent - Action Required
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full animate-pulse"
                                  style={{ width: "85%" }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Subtle Animation Border */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Footer */}
                <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/60">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="font-medium">Live updates enabled</span>
                    </div>
                    <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      View All Announcements
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Daily Records */}
        <div className="w-full lg:w-100 xl:w-100 -mt-1 sm:-mt-3 p-2 sm:p-3 lg:p-2">
          <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm">
            {/* Enhanced Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/15 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
              <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-green-400/15 to-teal-400/20 rounded-full blur-xl sm:blur-2xl animate-bounce"></div>
              <div className="absolute top-1/2 left-1/4 w-8 sm:w-16 h-8 sm:h-16 bg-gradient-to-r from-pink-400/10 to-rose-400/15 rounded-full blur-lg sm:blur-xl animate-ping"></div>
            </div>

            <div className="relative z-10">
              {/* Modern Enhanced Header */}
              <div className="mb-6 sm:mb-8 text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg backdrop-blur-sm border border-white/30">
                    <Activity className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="font-bold text-lg sm:text-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-1 sm:mb-2">
                  Daily Records
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 font-medium">
                  Real-time attendance tracking
                </p>
                <div className="w-16 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full mx-auto shadow-lg"></div>
              </div>

              {/* Enhanced Stats Footer */}
              <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 mb-6 sm:mb-8 border-t border-gray-200/60">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  {[
                    {
                      label: "WORKED",
                      value: "8h 06m",
                      color: "from-emerald-400 to-green-500",
                      icon: Clock,
                    },
                    {
                      label: "BREAKS",
                      value: "1h 10m",
                      color: "from-amber-400 to-orange-500",
                      icon: Coffee,
                    },
                    {
                      label: "STATUS",
                      value: "ACTIVE",
                      color: "from-blue-400 to-indigo-500",
                      icon: Activity,
                      isStatus: true,
                    },
                  ].map((stat, i) => (
                    <div key={i} className="group">
                      <div className="bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden">
                        {/* Gradient Background */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl sm:rounded-2xl`}
                        ></div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-center mb-1 sm:mb-2">
                            <stat.icon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                          <p className="text-xs font-bold tracking-wider text-gray-500 mb-1 sm:mb-2">
                            {stat.label}
                          </p>
                          <p
                            className={`text-xs sm:text-sm font-bold ${
                              stat.isStatus
                                ? "text-emerald-600"
                                : "text-gray-800"
                            } group-hover:scale-105 transition-transform`}
                          >
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Cards Grid Layout */}
              <div className="grid grid-cols-1 gap-3 sm:gap-5">
                {[
                  {
                    label: "TIME IN",
                    value: "8:54 A.M.",
                    icon: LogIn,
                    color: "from-emerald-500 to-teal-500",
                    textColor: "text-emerald-600",
                    bgColor: "bg-emerald-50",
                    borderColor: "border-emerald-200",
                    iconBg: "bg-emerald-100",
                    status: "completed",
                  },
                  {
                    label: "1ST BREAK",
                    value: "11:00 A.M.",
                    icon: Pause,
                    color: "from-amber-500 to-orange-500",
                    textColor: "text-amber-600",
                    bgColor: "bg-amber-50",
                    borderColor: "border-amber-200",
                    iconBg: "bg-amber-100",
                    status: "completed",
                  },
                  {
                    label: "LUNCH BREAK",
                    value: "1:00 P.M.",
                    icon: Utensils,
                    color: "from-violet-500 to-purple-500",
                    textColor: "text-violet-600",
                    bgColor: "bg-violet-50",
                    borderColor: "border-violet-200",
                    iconBg: "bg-violet-100",
                    status: "completed",
                  },
                  {
                    label: "2ND BREAK",
                    value: "3:00 P.M.",
                    icon: Coffee,
                    color: "from-rose-500 to-pink-500",
                    textColor: "text-rose-600",
                    bgColor: "bg-rose-50",
                    borderColor: "border-rose-200",
                    iconBg: "bg-rose-100",
                    status: "active",
                  },
                  {
                    label: "BIO BREAK",
                    value: "10 minutes",
                    icon: DoorOpen,
                    color: "from-cyan-500 to-blue-500",
                    textColor: "text-cyan-600",
                    bgColor: "bg-cyan-50",
                    borderColor: "border-cyan-200",
                    iconBg: "bg-cyan-100",
                    status: "upcoming",
                  },
                  {
                    label: "TIME OUT",
                    value: "6:00 P.M.",
                    icon: LogOut,
                    color: "from-gray-500 to-slate-500",
                    textColor: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                    iconBg: "bg-gray-100",
                    status: "upcoming",
                  },
                ].map((record, i) => (
                  <div key={i} className="group">
                    <div
                      className={`bg-white/80 backdrop-blur-md border ${record.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/95 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden`}
                    >
                      {/* Enhanced Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-0 group-hover:opacity-8 transition-all duration-500 rounded-xl sm:rounded-2xl`}
                      ></div>

                      {/* Animated Border on Hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500 rounded-xl sm:rounded-2xl`}
                      ></div>

                      <div className="flex items-center gap-3 sm:gap-5 relative z-10">
                        {/* Enhanced Icon */}
                        <div
                          className={`w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl ${record.iconBg} border ${record.borderColor} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-110 relative overflow-hidden flex-shrink-0`}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                          ></div>
                          <record.icon
                            className={`w-5 sm:w-6 h-5 sm:h-6 ${record.textColor} relative z-10 transition-transform group-hover:scale-110`}
                          />
                        </div>

                        {/* Enhanced Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <p
                              className={`text-xs font-bold ${record.textColor} tracking-wider uppercase`}
                            >
                              {record.label}
                            </p>
                            {record.status === "completed" && (
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            )}
                            {record.status === "active" && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            )}
                          </div>
                          <p className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                            {record.value}
                          </p>
                        </div>

                        {/* Enhanced Status Indicator */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="w-2.5 sm:w-3 h-8 sm:h-10 rounded-full bg-gray-200 relative overflow-hidden shadow-inner">
                            {record.status === "completed" && (
                              <div className="w-full h-full bg-gradient-to-t from-emerald-400 to-teal-400 rounded-full"></div>
                            )}
                            {record.status === "active" && (
                              <div className="w-full h-2/3 bg-gradient-to-t from-blue-400 to-indigo-400 rounded-full animate-pulse"></div>
                            )}
                            {record.status === "upcoming" && (
                              <div className="w-full h-1/4 bg-gradient-to-t from-gray-300 to-gray-400 rounded-full"></div>
                            )}
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              record.status === "completed"
                                ? "text-emerald-600"
                                : record.status === "active"
                                ? "text-blue-600"
                                : "text-gray-400"
                            }`}
                          >
                            {record.status === "completed"
                              ? "✓"
                              : record.status === "active"
                              ? "●"
                              : "○"}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar for Active Item */}
                      {record.status === "active" && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200/50">
                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                            <span>In Progress</span>
                            <span>65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full animate-pulse"
                              style={{ width: "65%" }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Footer */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/60 text-center">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live tracking enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
