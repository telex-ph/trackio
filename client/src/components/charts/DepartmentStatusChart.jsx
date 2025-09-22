import { useState, useEffect, useRef, useMemo } from "react";
import { PieChart } from "lucide-react";
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

const departmentData = {
    All: {
        labels: [
            "IT Department",
            "Customer Service",
            "Management",
            "HR",
            "Finance",
            "Sales",
        ],
        values: [25, 30, 15, 10, 12, 18],
    },
    "IT Department": { labels: ["IT Department"], values: [25] },
    "Customer Service": { labels: ["Customer Service"], values: [30] },
    Management: { labels: ["Management"], values: [15] },
    HR: { labels: ["HR"], values: [10] },
    Finance: { labels: ["Finance"], values: [12] },
    Sales: { labels: ["Sales"], values: [18] },
};

// Fixed colors for consistency
const colors = [
    "#3b82f6", // blue
    "#22c55e", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
];

const DepartmentStatusChart = () => {
    const ref = useRef(null);
    const [selectedDept, setSelectedDept] = useState("All");

    const chartData = useMemo(() => departmentData[selectedDept], [selectedDept]);

    const totalEmployees = chartData.values.reduce((a, b) => a + b, 0);

    useChart(
        ref,
        () => ({
            type: "doughnut",
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        data: chartData.values,
                        backgroundColor:
                            selectedDept === "All"
                                ? colors
                                : [
                                    colors[
                                    Object.keys(departmentData).indexOf(selectedDept) - 1
                                    ],
                                ],
                        borderColor: "#ffffff",
                        borderWidth: window.innerWidth < 640 ? 1 : 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: window.innerWidth < 640 ? "55%" : "60%",
                plugins: {
                    legend: {
                        position: window.innerWidth < 480 ? "bottom" : "bottom",
                        labels: {
                            usePointStyle: true,
                            padding: window.innerWidth < 640 ? 6 : 8,
                            font: {
                                size:
                                    window.innerWidth < 480
                                        ? 9
                                        : window.innerWidth < 640
                                            ? 10
                                            : 11,
                            },
                            boxWidth: window.innerWidth < 640 ? 8 : 10,
                        },
                    },
                },
                elements: {
                    arc: {
                        borderWidth: window.innerWidth < 640 ? 1 : 2,
                    },
                },
            },
        }),
        [chartData, selectedDept]
    );

    return (
        <div
            className="bg-white border-light rounded-md p-4 h-full"
        >
            {/* Header section */}
            <div
                className="flex flex-col xs:flex-row items-start xs:items-center justify-between 
                      gap-2 xs:gap-0 mb-2 sm:mb-3"
            >
                {/* Title section */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
                    <h3
                        className="text-xs sm:text-sm md:text-base font-semibold text-slate-800 
                         leading-tight"
                    >
                        <span className="hidden sm:inline">
                            Employee Distribution by Department
                        </span>
                        <span className="sm:hidden">Employee Distribution</span>
                    </h3>
                </div>

                {/* Department Filter */}
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
                    {Object.keys(departmentData).map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>
            </div>

            {/* Total employees count */}
            <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 text-right">
                <span className="hidden xs:inline">Total: </span>
                <span className="font-medium">{totalEmployees}</span>
                <span className="xs:hidden ml-1 text-gray-400">employees</span>
            </div>

            {/* Chart container */}
            <div
                className="w-full h-[calc(100%-80px)] sm:h-[calc(100%-90px)] md:h-[calc(100%-100px)] 
                      relative flex items-center justify-center"
            >
                <div className="w-full h-full">
                    <canvas ref={ref} className="w-full h-full" />
                </div>
            </div>
        </div>
    );
};

export default DepartmentStatusChart;