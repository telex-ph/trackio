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

// Fake productivity dataset per department
const productivityData = {
    All: {
        overtime: [75, 78, 82, 79, 85, 88],
        undertime: [88, 85, 90, 87, 92, 89],
    },
    "Call Center": {
        overtime: [72, 76, 81, 77, 84, 86],
        undertime: [90, 87, 91, 86, 93, 88],
    },
    IT: {
        overtime: [80, 82, 85, 83, 87, 90],
        undertime: [84, 82, 86, 85, 88, 86],
    },
    HR: {
        overtime: [70, 72, 75, 74, 78, 80],
        undertime: [92, 90, 93, 91, 94, 92],
    },
    Finance: {
        overtime: [77, 79, 83, 80, 86, 87],
        undertime: [87, 85, 89, 86, 91, 88],
    },
};

const ProductivityChart = () => {
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
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
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
        <div
            className="bg-white border-light rounded-md h-full p-4"
        >
            {/* Header section */}
            <div
                className="flex flex-col xs:flex-row items-start xs:items-center justify-between 
                      gap-2 xs:gap-0 mb-3 sm:mb-4"
            >
                {/* Title section */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                    <h3
                        className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 
                         leading-tight"
                    >
                        <span className="hidden sm:inline">
                            Overtime vs Undertime Trends
                        </span>
                        <span className="sm:hidden">Overtime vs Undertime</span>
                    </h3>
                </div>

                {/* Filter dropdown */}
                <select
                    className="text-xs sm:text-sm 
                     border border-gray-300 rounded-md 
                     px-2 py-1 sm:px-3 sm:py-1.5
                     bg-white text-slate-700
                     min-w-0 w-full xs:w-auto xs:min-w-[100px]
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
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

export default ProductivityChart