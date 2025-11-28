import React from "react";

const PunctualityChart = () => {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex-1 hover:shadow-2xl transition-all relative overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl sm:rounded-3xl" />
      
      {/* Content */}
      <div className="relative z-20">
        <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base text-gray-800">
          Punctuality & Discipline
        </h4>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
          {/* Chart Placeholder */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-inner flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2 bg-gradient-to-r from-red-700 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-600">COMING SOON</span>
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3.5 w-full">
            {[
              { label: "Late", color: "#f97316" },
              { label: "Absent", color: "#6b7280" },
              { label: "Overbreak", color: "#a855f7" },
              { label: "Undertime", color: "#22c55e" }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 bg-white/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow hover:scale-105 hover:shadow-md transition transform duration-200"
              >
                <div
                  className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full opacity-60"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  {item.label}
                </span>
                <span
                  className="ml-auto text-xs font-semibold opacity-60"
                  style={{ color: item.color }}
                >
                  --
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunctualityChart;