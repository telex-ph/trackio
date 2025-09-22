import { useState, useEffect, useRef, useMemo } from "react";
import { BarChart2 } from "lucide-react";
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


const deptData = {
    All: {
        avg: [8.2, 8.1, 8.5, 8.0, 8.3, 8.4, 8.2],
        overtime: [1.2, 0.8, 1.5, 0.5, 1.0, 1.3, 0.9],
    },
    HR: {
        avg: [7.9, 8.0, 8.1, 7.8, 8.2, 8.0, 7.9],
        overtime: [0.8, 0.6, 1.0, 0.4, 0.7, 0.9, 0.5],
    },
    IT: {
        avg: [8.5, 8.3, 8.7, 8.2, 8.4, 8.6, 8.3],
        overtime: [1.5, 1.2, 1.8, 1.0, 1.3, 1.6, 1.1],
    },
    Operations: {
        avg: [8.1, 8.2, 8.3, 8.0, 8.4, 8.5, 8.2],
        overtime: [1.0, 0.7, 1.2, 0.6, 0.9, 1.1, 0.8],
    },
};

const WorkHoursAnalysisChart = () => {
    const ref = useRef(null);
    const [selectedDept, setSelectedDept] = useState("All");

    const chartData = useMemo(() => deptData[selectedDept], [selectedDept]);

    useChart(
        ref,
        () => ({
            type: "bar",
            data: {
                labels:
                    window.innerWidth < 480
                        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                        : ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: window.innerWidth < 640 ? "Avg Hours" : "Average Work Hours",
                        data: chartData.avg,
                        backgroundColor: "rgba(59,130,246,0.8)",
                        borderColor: "rgba(59,130,246,1)",
                        borderWidth: window.innerWidth < 640 ? 1 : 1,
                        hoverBackgroundColor: "rgba(59,130,246,1)",
                        barThickness: window.innerWidth < 480 ? "flex" : undefined,
                        maxBarThickness: window.innerWidth < 480 ? 25 : 40,
                    },
                    {
                        label: window.innerWidth < 640 ? "Overtime" : "Overtime Hours",
                        data: chartData.overtime,
                        backgroundColor: "rgba(239,68,68,0.8)",
                        borderColor: "rgba(239,68,68,1)",
                        borderWidth: window.innerWidth < 640 ? 1 : 1,
                        hoverBackgroundColor: "rgba(239,68,68,1)",
                        barThickness: window.innerWidth < 480 ? "flex" : undefined,
                        maxBarThickness: window.innerWidth < 480 ? 25 : 40,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: window.innerWidth < 640 ? 300 : 500,
                    easing: "easeOutQuart",
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation:
                                window.innerWidth < 480 ? 0 : window.innerWidth < 640 ? 30 : 45,
                            minRotation: 0,
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
                    y: {
                        beginAtZero: true,
                        suggestedMax: 10,
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
                            usePointStyle: false,
                        },
                    },
                    tooltip: {
                        mode: "index",
                        intersect: false,
                        titleFont: {
                            size: window.innerWidth < 640 ? 11 : 12,
                        },
                        bodyFont: {
                            size: window.innerWidth < 640 ? 10 : 11,
                        },
                    },
                },
                interaction: { mode: "index", intersect: false },
            },
        }),
        [chartData]
    );

    return (
        <div className="bg-white border-light rounded-md h-full p-4">
            {/* Header section */}
            <div
                className="flex flex-col xs:flex-row items-start xs:items-center justify-between 
                       gap-2 xs:gap-0 mb-3 sm:mb-4"
            >
                {/* Title section */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                    <h3
                        className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 
                          leading-tight"
                    >
                        <span className="hidden md:inline">
                            Weekly Work Hours & Overtime
                        </span>
                        <span className="hidden sm:inline md:hidden">
                            Work Hours & Overtime
                        </span>
                        <span className="sm:hidden">Work Hours</span>
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
                    {Object.keys(deptData).map((dept) => (
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
        </div >
    );
};

export default WorkHoursAnalysisChart