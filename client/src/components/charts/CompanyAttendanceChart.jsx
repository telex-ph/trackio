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

// Fake weekly attendance data per department
const attendanceData = {
    All: {
        present: [85, 82, 88, 86, 84, 75, 70],
        absent: [8, 12, 7, 9, 11, 20, 25],
        late: [12, 8, 15, 18, 14, 10, 8],
    },
    "Call Center": {
        present: [78, 75, 82, 80, 77, 70, 65],
        absent: [12, 15, 10, 13, 14, 22, 27],
        late: [15, 10, 18, 20, 16, 12, 10],
    },
    IT: {
        present: [90, 88, 92, 91, 89, 85, 83],
        absent: [5, 7, 4, 6, 8, 10, 12],
        late: [8, 5, 9, 10, 7, 5, 4],
    },
    HR: {
        present: [87, 84, 89, 86, 85, 80, 78],
        absent: [7, 10, 6, 8, 9, 12, 14],
        late: [9, 7, 11, 12, 10, 8, 7],
    },
    Finance: {
        present: [83, 81, 86, 84, 82, 78, 74],
        absent: [9, 11, 8, 10, 12, 15, 18],
        late: [11, 9, 13, 14, 12, 9, 8],
    },
};

const CompanyAttendanceChart = () => {
    const ref = useRef(null);

    const [selectedDept, setSelectedDept] = useState("All");

    const chartData = useMemo(() => attendanceData[selectedDept], [selectedDept]);

    useChart(
        ref,
        () => ({
            type: "bar",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        label: "Present",
                        data: chartData.present,
                        backgroundColor: "rgba(34,197,94,0.9)",
                        borderColor: "rgba(34,197,94,1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Absent",
                        data: chartData.absent,
                        backgroundColor: "rgba(239,68,68,0.9)",
                        borderColor: "rgba(239,68,68,1)",
                        borderWidth: 1,
                    },
                    {
                        label: "Late",
                        data: chartData.late,
                        backgroundColor: "rgba(245,158,11,0.9)",
                        borderColor: "rgba(245,158,11,1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                scales: {
                    x: {
                        stacked: false,
                        grid: { display: false },
                        ticks: {
                            font: {
                                size: window.innerWidth < 640 ? 10 : 12,
                            },
                        },
                    },
                    y: {
                        beginAtZero: true,
                        suggestedMax: 100,
                        ticks: {
                            font: {
                                size: window.innerWidth < 640 ? 10 : 12,
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        position: window.innerWidth < 640 ? "bottom" : "bottom",
                        labels: {
                            boxWidth: window.innerWidth < 640 ? 10 : 12,
                            padding: window.innerWidth < 640 ? 8 : 12,
                            font: {
                                size: window.innerWidth < 640 ? 10 : 12,
                            },
                        },
                    },
                    tooltip: { mode: "index", intersect: false },
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
                    <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                    <h3
                        className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 
                         leading-tight"
                    >
                        <span className="hidden sm:inline">
                            Company-wide Attendance Trend
                        </span>
                        <span className="sm:hidden">Attendance Trend</span>
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
                    {Object.keys(attendanceData).map((dept) => (
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

export default CompanyAttendanceChart;