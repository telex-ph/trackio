import React from "react";
import { TrendingUp, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const PunctualityChart = () => {
  return (
    <div className="p-[2px] rounded-3xl bg-gradient-to-br from-gray-200/60 via-gray-100/60 to-gray-200/60 shadow-xl">
      <div
        className="
          bg-white rounded-2xl sm:rounded-3xl
          p-4 sm:p-5 shadow-lg relative overflow-hidden
          animate-fadeUp h-[588px]
        "
      >
       
        <div className="flex flex-col h-full">

          <div className="absolute top-6 right-6 w-3 h-3 bg-purple-300/30 rounded-full blur-sm animate-ping"></div>
          <div className="absolute bottom-8 left-6 w-2.5 h-2.5 bg-blue-300/30 rounded-full blur-sm animate-pulse"></div>

          <h4 className="font-bold mb-1 text-base sm:text-lg text-gray-800 flex-shrink-0">
            Punctuality & Discipline
          </h4>
          <div className="w-10 h-1 bg-purple-500/50 rounded-full mb-4 flex-shrink-0"></div>

          <div className="flex items-start gap-4 mb-6 flex-shrink-0">
            <div className="w-40 h-40 relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-[3px] border-dashed border-purple-400/40 animate-spin-slow"></div>
              <div
                className="
                  w-full h-full rounded-full
                  bg-gradient-to-br from-gray-100 to-gray-200
                  border-4 border-white shadow-inner flex items-center justify-center
                "
              >
                <div className="text-center">
                  <div
                    className="
                    w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2
                    bg-gradient-to-r from-red-700 to-red-500
                    rounded-full flex items-center justify-center shadow-md
                    "
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">COMING SOON</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 w-full">
              {[
                { label: "Late", color: "#f97316", icon: AlertTriangle },
                { label: "Absent", color: "#6b7280", icon: CheckCircle },
                { label: "Overbreak", color: "#a855f7", icon: Clock },
                { label: "Undertime", color: "#22c55e", icon: TrendingUp }
              ].map((item, index) => (
                <div
                  key={index}
                  className="
                    flex items-center gap-3
                    bg-white px-3 py-2 rounded-xl border border-gray-100
                    transition-all duration-300
                  "
                >
                  <div
                    className="w-3 h-3 rounded-full opacity-80 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {item.label}
                  </span>
                  <span
                    className="ml-auto text-sm font-semibold opacity-70 flex-shrink-0"
                    style={{ color: item.color }}
                  >
                    --
                  </span>
                </div>
              ))}
            </div>
          </div>
         
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h5 className="font-bold text-sm text-gray-800">Policy Compliance Insights</h5>
            </div>
           
            <div className="space-y-3 text-sm">
              <p className="flex justify-between items-center py-2 px-4 bg-purple-50 rounded-xl border border-purple-200">
                <span className="font-medium text-gray-700">Time-in Window Compliance:</span>
                <span className="font-bold text-lg text-green-600">98.5%</span>
              </p>
              <p className="flex justify-between items-center py-2 px-4 bg-red-50 rounded-xl border border-red-200">
                <span className="font-medium text-gray-700">Average Lateness (Month):</span>
                <span className="font-bold text-lg text-orange-600">1 min 30 sec</span>
              </p>
              <p className="flex justify-between items-center py-2 px-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="font-medium text-gray-700">Unexcused Absences:</span>
                <span className="font-bold text-lg text-red-600">0 of 4</span>
              </p>
              <p className="flex justify-between items-center py-2 px-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <span className="font-medium text-gray-700">Average Break Overrun:</span>
                <span className="font-bold text-lg text-amber-600">2 min 10 sec</span>
              </p>
            </div>
          </div>
         
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp {
          animation: fadeUp .6s ease-out;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PunctualityChart;
