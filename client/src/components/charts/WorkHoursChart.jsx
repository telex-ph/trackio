import { useState, useEffect, useRef, useMemo } from "react";
import { LineChart } from "lucide-react";
import Chart from "chart.js/auto";

// ---------- Chart Helper Hook ----------
function useChart(canvasRef, buildConfig, deps = []) {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const config = buildConfig();
    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, deps);

  return chartRef;
}

// ---------- Weekly Productivity Data for Current Month ----------
const productivityData = {
  All: {
    overtime: [82, 85, 79, 88, 84], // 5 weeks (could be 4 if month is shorter)
    undertime: [90, 88, 92, 91, 89],
  },
  "Call Center": {
    overtime: [80, 83, 77, 85, 82],
    undertime: [91, 89, 93, 92, 88],
  },
  IT: {
    overtime: [85, 87, 82, 89, 86],
    undertime: [86, 84, 88, 87, 85],
  },
  HR: {
    overtime: [72, 75, 70, 77, 74],
    undertime: [93, 91, 95, 94, 92],
  },
  Finance: {
    overtime: [81, 84, 78, 86, 83],
    undertime: [89, 87, 91, 90, 88],
  },
};

const WorkHoursChart = () => {
  const ref = useRef(null);
  const [selectedDept, setSelectedDept] = useState("All");

  const chartData = useMemo(
    () => productivityData[selectedDept],
    [selectedDept]
  );

  useChart(
    ref,
    () => ({
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"], // weekly view
        datasets: [
          {
            label: "Overtime",
            data: chartData.overtime,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            tension: 0.35,
            fill: true,
            pointBackgroundColor: "#3b82f6",
            pointBorderColor: "#ffffff",
            pointBorderWidth: window.innerWidth < 640 ? 1 : 2,
            pointRadius: window.innerWidth < 640 ? 3 : 5,
            borderWidth: window.innerWidth < 640 ? 2 : 3,
          },
          {
            label: "Undertime",
            data: chartData.undertime,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.1)",
            tension: 0.35,
            fill: true,
            pointBackgroundColor: "#22c55e",
            pointBorderColor: "#ffffff",
            pointBorderWidth: window.innerWidth < 640 ? 1 : 2,
            pointRadius: window.innerWidth < 640 ? 3 : 5,
            borderWidth: window.innerWidth < 640 ? 2 : 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 100,
            grid: {
              color: "rgba(0,0,0,0.1)",
              lineWidth: window.innerWidth < 640 ? 0.5 : 1,
            },
            ticks: {
              font: {
                size:
                  window.innerWidth < 480
                    ? 9
                    : window.innerWidth < 640
                    ? 10
                    : 12,
              },
            },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: {
                size:
                  window.innerWidth < 480
                    ? 9
                    : window.innerWidth < 640
                    ? 10
                    : 12,
              },
            },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: window.innerWidth < 640 ? 10 : 15,
              font: {
                size:
                  window.innerWidth < 480
                    ? 10
                    : window.innerWidth < 640
                    ? 11
                    : 12,
              },
              boxWidth: window.innerWidth < 640 ? 10 : 12,
              usePointStyle: window.innerWidth < 640,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            titleFont: {
              size: window.innerWidth < 640 ? 11 : 12,
            },
            bodyFont: {
              size: window.innerWidth < 640 ? 10 : 11,
            },
          },
        },
        interaction: { mode: "index", intersect: false },
        elements: {
          line: {
            borderWidth: window.innerWidth < 640 ? 2 : 3,
          },
          point: {
            hoverRadius: window.innerWidth < 640 ? 5 : 7,
          },
        },
      },
    }),
    [chartData]
  );

  return (
    <div className="bg-white border-light rounded-md h-full p-4">
      {/* Header section */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 leading-tight">
            <span className="inline">Work Hours Analysis</span>
          </h3>
        </div>

        {/* Filter dropdown */}
        <select
          className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1 sm:px-3 sm:py-1.5 bg-white text-slate-700 min-w-0 w-full xs:w-auto xs:min-w-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          {Object.keys(productivityData).map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Chart container */}
      <div className="w-full h-[calc(100%-60px)] sm:h-[calc(100%-70px)] relative overflow-hidden">
        <canvas ref={ref} className="w-full h-full" />
      </div>
    </div>
  );
};

export default WorkHoursChart;
