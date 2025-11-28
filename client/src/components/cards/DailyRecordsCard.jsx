import React from "react";
import {
  Clock,
  Coffee,
  Activity,
  LogIn,
  Utensils,
  LogOut,
  Construction,
} from "lucide-react";

const DailyRecordsCard = () => {
  return (
    <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm h-fit">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/15 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-green-400/15 to-teal-400/20 rounded-full blur-xl sm:blur-2xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 sm:w-16 h-8 sm:h-16 bg-gradient-to-r from-pink-400/10 to-rose-400/15 rounded-full blur-lg sm:blur-xl animate-ping"></div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/90 to-blue-50/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl sm:rounded-3xl" />
      
      <div className="relative z-30">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mb-3 sm:mb-4">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-gray-400/30 to-gray-500/20 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg backdrop-blur-sm border border-white/30 relative">
              <Activity className="w-8 sm:w-10 h-8 sm:h-10 text-gray-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Construction className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h2 className="font-bold text-lg sm:text-2xl bg-gradient-to-r from-gray-600 via-gray-500 to-gray-700 bg-clip-text text-transparent mb-1 sm:mb-2">
            Daily Records
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 font-medium">
            Feature under development
          </p>
          <div className="w-16 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 rounded-full mx-auto shadow-lg"></div>
        </div>

        {/* Stats Grid - Disabled */}
        <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 mb-6 sm:mb-8 border-t border-gray-200/60">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            {[
              { label: "WORKED", icon: Clock },
              { label: "BREAKS", icon: Coffee },
              { label: "STATUS", icon: Activity }
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="bg-white/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/30 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-1 sm:mb-2">
                      <stat.icon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                    </div>
                    <p className="text-xs font-bold tracking-wider text-gray-400 mb-1 sm:mb-2">
                      {stat.label}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-gray-500">
                      --
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Records - Disabled */}
        <div className="grid grid-cols-1 gap-3 sm:gap-5">
          {[
            { label: "TIME IN", icon: LogIn, color: "from-gray-400 to-gray-500" },
            { label: "LUNCH BREAK", icon: Utensils, color: "from-gray-400 to-gray-500" },
            { label: "TIME OUT", icon: LogOut, color: "from-gray-400 to-gray-500" }
          ].map((record, i) => (
            <div key={i} className="group">
              <div className="bg-white/50 backdrop-blur-md border border-gray-200/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 opacity-0 group-hover:opacity-5 transition-all duration-500 rounded-xl sm:rounded-2xl"></div>

                <div className="flex items-center gap-3 sm:gap-5 relative z-10">
                  <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-gray-100 border border-gray-200/50 flex items-center justify-center shadow-lg transition-all duration-300 relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <record.icon className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400 relative z-10" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                        {record.label}
                      </p>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-gray-500">
                      --:--
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-2.5 sm:w-3 h-8 sm:h-10 rounded-full bg-gray-200 relative overflow-hidden shadow-inner">
                      <div className="w-full h-1/4 bg-gradient-to-t from-gray-300 to-gray-400 rounded-full"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-400">
                      ○
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Development Banner */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-red-700 to-red-600 rounded-xl p-4 sm:p-5 text-center shadow-lg border border-amber-300/50">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
            <Construction className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            <span className="text-white font-bold text-sm sm:text-base">COMMING SOON</span>
            <Construction className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-white/90 text-xs sm:text-sm font-medium">
            Trackio Daily Records features coming soon
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/40 text-center">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="font-medium">Feature in development</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRecordsCard;