import React from "react";
import { Doughnut } from "react-chartjs-2";

const PunctualityChart = () => {
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

  const chartItems = [
    { label: "Late", value: 12, color: "#f97316" },
    { label: "Absent", value: 5, color: "#6b7280" },
    { label: "Overbreak", value: 8, color: "#a855f7" },
    { label: "Undertime", value: 3, color: "#22c55e" },
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex-1 hover:shadow-2xl transition-all duration-300">
      <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base text-gray-800">
        Punctuality & Discipline
      </h4>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-45 md:h-45 flex-shrink-0">
          <Doughnut data={data} options={options} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3.5 w-full">
          {chartItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 sm:gap-3 bg-white/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow hover:scale-105 hover:shadow-md transition-transform duration-300"
            >
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
  );
};

export default PunctualityChart;