import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { PieChart } from "lucide-react";

function useChart(canvasRef, buildConfig, deps = []) {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // destroy existing
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

const TeamStatusChart = () => {
  const ref = useRef(null);

  useChart(
    ref,
    () => ({
      type: "doughnut",
      data: {
        labels: ["Present", "On Break", "On Lunch", "Absent"],
        datasets: [
          {
            data: [25, 3, 2, 5],
            backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, padding: 12 },
          },
        },
      },
    }),
    []
  );

  return (
    <div className="bg-white border-light rounded-md h-full p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-slate-600" />
          <span className="hidden sm:inline font-bold">
            Current Team Status
          </span>
          <span className="sm:hidden">Team Status</span>
        </div>
        <div className="text-xs text-gray-500">Live snapshot</div>
      </div>
      <div className="w-full h-full relative flex items-start justify-center">
        <canvas ref={ref} className="max-h-78" />
      </div>
    </div>
  );
};

export default TeamStatusChart;
