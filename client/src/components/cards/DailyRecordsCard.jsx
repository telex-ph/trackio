import React from "react";
import {
  Clock,
  Coffee,
  Activity,
  LogIn,
  Utensils,
  LogOut,
} from "lucide-react";

const DailyRecordsCard = () => {
  const stats = [
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
  ];

  const timeRecords = [
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
  ];

  const getStatusIndicator = (status) => {
    switch (status) {
      case "completed":
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>;
      case "active":
        return <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>;
      default:
        return null;
    }
  };

  const getProgressBar = (status) => {
    if (status === "active") {
      return (
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
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm h-fit">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/15 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-green-400/15 to-teal-400/20 rounded-full blur-xl sm:blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 sm:w-16 h-8 sm:h-16 bg-gradient-to-r from-pink-400/10 to-rose-400/15 rounded-full blur-lg sm:blur-xl animate-ping"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
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

        {/* Stats Grid */}
        <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 mb-6 sm:mb-8 border-t border-gray-200/60">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="group">
                <div className="bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden">
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

        {/* Time Records */}
        <div className="grid grid-cols-1 gap-3 sm:gap-5">
          {timeRecords.map((record, i) => (
            <div key={i} className="group">
              <div
                className={`bg-white/80 backdrop-blur-md border ${record.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/95 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-0 group-hover:opacity-8 transition-all duration-500 rounded-xl sm:rounded-2xl`}
                ></div>
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${record.color} opacity-0 group-hover:opacity-20 blur-sm transition-all duration-500 rounded-xl sm:rounded-2xl`}
                ></div>

                <div className="flex items-center gap-3 sm:gap-5 relative z-10">
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <p
                        className={`text-xs font-bold ${record.textColor} tracking-wider uppercase`}
                      >
                        {record.label}
                      </p>
                      {getStatusIndicator(record.status)}
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {record.value}
                    </p>
                  </div>

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

                {getProgressBar(record.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/60 text-center">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Live tracking enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRecordsCard;