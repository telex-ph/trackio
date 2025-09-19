import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Timer,
  Coffee,
  Utensils,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  BarChart2,
  PieChart,
  LineChart,
  Building2,
  Shield,
  Settings,
  Download,
  Filter,
  Search,
  Bell,
  User,
  Hash,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
} from "lucide-react";
import Chart from "chart.js/auto";

// ---------- Extended Sample Data for Admin Dashboard ----------
const companyData = [
  // IT Department
  {
    id: 1,
    name: "Maria Santos",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    department: "IT Department",
    role: "Software Developer",
    status: "Present",
    timeIn: "08:00 AM",
    timeOut: null,
    breakStatus: null,
    lunchStatus: null,
    workHours: "8:15",
    overtime: "0:15",
    undertime: "0:00",
    isLate: false,
    lastActivity: "Timed In - 08:00 AM",
    activityTime: "8 hours ago",
  },
  {
    id: 2,
    name: "John Rivera",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    department: "IT Department",
    role: "DevOps Engineer",
    status: "Present",
    timeIn: "08:15 AM",
    timeOut: null,
    breakStatus: "On Break",
    lunchStatus: null,
    workHours: "8:00",
    overtime: "0:00",
    undertime: "0:00",
    isLate: true,
    lastActivity: "Started Break - 02:30 PM",
    activityTime: "5 mins ago",
  },
  // Customer Service Department
  {
    id: 3,
    name: "Ana Reyes",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    department: "Customer Service",
    role: "Customer Service Rep",
    status: "Present",
    timeIn: "07:55 AM",
    timeOut: null,
    breakStatus: null,
    lunchStatus: "On Lunch",
    workHours: "8:20",
    overtime: "0:20",
    undertime: "0:00",
    isLate: false,
    lastActivity: "Started Lunch - 12:00 PM",
    activityTime: "2 hours ago",
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    department: "Customer Service",
    role: "Customer Service Rep",
    status: "Present",
    timeIn: "08:30 AM",
    timeOut: null,
    breakStatus: null,
    lunchStatus: null,
    workHours: "7:45",
    overtime: "0:00",
    undertime: "0:15",
    isLate: true,
    lastActivity: "Ended Break - 01:45 PM",
    activityTime: "20 mins ago",
  },
  // Management
  {
    id: 5,
    name: "Lisa Garcia",
    avatar: "https://randomuser.me/api/portraits/women/41.jpg",
    department: "Management",
    role: "Project Manager",
    status: "Absent",
    timeIn: null,
    timeOut: null,
    breakStatus: null,
    lunchStatus: null,
    workHours: "0:00",
    overtime: "0:00",
    undertime: "8:00",
    isLate: false,
    lastActivity: "No Time In Today",
    activityTime: "N/A",
  },
  {
    id: 6,
    name: "Mark Reyes",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    department: "Management",
    role: "Team Lead",
    status: "Present",
    timeIn: "08:10 AM",
    timeOut: "06:30 PM",
    breakStatus: null,
    lunchStatus: null,
    workHours: "9:30",
    overtime: "1:30",
    undertime: "0:00",
    isLate: true,
    lastActivity: "Timed Out - 06:30 PM",
    activityTime: "30 mins ago",
  },
  // HR Department
  {
    id: 7,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    department: "HR",
    role: "HR Specialist",
    status: "Present",
    timeIn: "08:05 AM",
    timeOut: null,
    breakStatus: null,
    lunchStatus: null,
    workHours: "8:10",
    overtime: "0:10",
    undertime: "0:00",
    isLate: true,
    lastActivity: "Timed In - 08:05 AM",
    activityTime: "8 hours ago",
  },
  // Finance Department
  {
    id: 8,
    name: "Mike Chen",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    department: "Finance",
    role: "Accountant",
    status: "Present",
    timeIn: "07:50 AM",
    timeOut: null,
    breakStatus: null,
    lunchStatus: null,
    workHours: "8:25",
    overtime: "0:25",
    undertime: "0:00",
    isLate: false,
    lastActivity: "Ended Lunch - 01:00 PM",
    activityTime: "1 hour ago",
  },
  // Sales Department
  {
    id: 9,
    name: "Emma Wilson",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    department: "Sales",
    role: "Sales Representative",
    status: "Present",
    timeIn: "08:20 AM",
    timeOut: null,
    breakStatus: "On Break",
    lunchStatus: null,
    workHours: "7:55",
    overtime: "0:00",
    undertime: "0:05",
    isLate: true,
    lastActivity: "Started Break - 02:45 PM",
    activityTime: "10 mins ago",
  },
  {
    id: 10,
    name: "David Brown",
    avatar: "https://randomuser.me/api/portraits/men/78.jpg",
    department: "Sales",
    role: "Sales Manager",
    status: "Present",
    timeIn: "07:45 AM",
    timeOut: null,
    breakStatus: null,
    lunchStatus: null,
    workHours: "8:30",
    overtime: "0:30",
    undertime: "0:00",
    isLate: false,
    lastActivity: "Timed In - 07:45 AM",
    activityTime: "8 hours ago",
  },
];

const recentActivities = [
  {
    id: 1,
    employee: "John Rivera",
    department: "IT Department",
    action: "Started Break",
    time: "2:30 PM",
    timestamp: "5 mins ago",
    type: "break",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 2,
    employee: "Carlos Mendoza",
    department: "Customer Service",
    action: "Ended Break",
    time: "1:45 PM",
    timestamp: "20 mins ago",
    type: "break_end",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: 3,
    employee: "Ana Reyes",
    department: "Customer Service",
    action: "Started Lunch",
    time: "12:00 PM",
    timestamp: "2 hours ago",
    type: "lunch",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    id: 4,
    employee: "Mark Reyes",
    department: "Management",
    action: "Timed Out",
    time: "6:30 PM",
    timestamp: "30 mins ago",
    type: "timeout",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 5,
    employee: "Sarah Johnson",
    department: "HR",
    action: "Timed In",
    time: "8:05 AM",
    timestamp: "8 hours ago",
    type: "timein",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
];

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
      className="w-full min-h-[280px] h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[400px] 
                    p-3 sm:p-4 md:p-6 
                    bg-gradient-to-br from-white to-slate-50 
                    rounded-lg sm:rounded-xl 
                    shadow-sm sm:shadow-md 
                    border border-gray-100"
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
      className="w-full min-h-[280px] h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[400px]
                    p-5 sm:p-4 md:p-6 
                    bg-gradient-to-br from-white to-slate-50 
                    rounded-lg sm:rounded-xl 
                    shadow-sm sm:shadow-md 
                    border border-gray-100"
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
        <div className="w-full h-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]">
          <canvas ref={ref} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

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
      className="w-full min-h-[280px] h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[400px]
                    p-3 sm:p-4 md:p-6 
                    bg-gradient-to-br from-white to-slate-50 
                    rounded-lg sm:rounded-xl 
                    shadow-sm sm:shadow-md 
                    border border-gray-100"
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

// Fake department data (replace with API data if needed)
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
    <div className="w-full min-h-[300px] h-72 sm:h-80 md:h-88 lg:h-[26rem] xl:h-[27.7rem] p-3 sm:p-4 md:p-6 bg-gradient-to-br from-white to-slate-50 rounded-lg sm:rounded-xl shadow-sm sm:shadow-md border border-gray-100">
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
    </div>
  );
};

// ---------- Main Admin Dashboard ----------
const AdminDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const statusColors = {
    Present: "text-green-700 bg-green-100 border-green-200",
    Absent: "text-red-700 bg-red-100 border-red-200",
    "On Break": "text-blue-700 bg-blue-100 border-blue-200",
    "On Lunch": "text-yellow-700 bg-yellow-100 border-yellow-200",
  };

  const departments = [
    "All",
    "IT Department",
    "Customer Service",
    "Management",
    "HR",
    "Finance",
    "Sales",
  ];

  const filteredEmployees = companyData.filter((emp) => {
    const matchesDepartment =
      filterDepartment === "All" || emp.department === filterDepartment;
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Present" && emp.status === "Present") ||
      (filterStatus === "Absent" && emp.status === "Absent") ||
      (filterStatus === "Late" && emp.isLate);
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const stats = {
    totalEmployees: companyData.length,
    present: companyData.filter((emp) => emp.status === "Present").length,
    absent: companyData.filter((emp) => emp.status === "Absent").length,
    late: companyData.filter((emp) => emp.isLate).length,
    onBreak: companyData.filter((emp) => emp.breakStatus === "On Break").length,
    onLunch: companyData.filter((emp) => emp.lunchStatus === "On Lunch").length,
    overtime: companyData.filter((emp) => emp.overtime !== "0:00").length,
    undertime: companyData.filter((emp) => emp.undertime !== "0:00").length,
    departments: departments.length - 1, // exclude "All"
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 lg:gap-6 mb-4 sm:mb-6">
        <div className="flex-1">
          <section className="flex flex-col mb-2">
            <div className="flex items-center gap-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Admin Monitoring Dashboard
              </h2>
            </div>
            <p className="text-light text-sm sm:text-base">
              Real-time attendance and work hours monitoring
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Last updated: {currentTime.toLocaleTimeString()} | Today:{" "}
              {currentTime.toLocaleDateString()}
            </p>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <Download className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Export Data</span>
          </button>
          <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Analytics</span>
          </button>
          <button className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
            <Settings className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Settings</span>
          </button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />}
          subtitle="Company-wide"
          className="col-span-2 sm:col-span-1"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />}
          subtitle="Active Depts"
        />
        <StatCard
          title="Present"
          value={stats.present}
          icon={
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
          }
          subtitle="Currently Working"
        />
        <StatCard
          title="Absentees"
          value={stats.absent}
          icon={<UserX className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />}
          subtitle="Not Present"
        />
        <StatCard
          title="Late Arrivals"
          value={stats.late}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />}
          subtitle="Late Today"
        />
        <StatCard
          title="On Break"
          value={stats.onBreak}
          icon={<Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />}
          subtitle="Currently"
        />
        <StatCard
          title="On Lunch"
          value={stats.onLunch}
          icon={<Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />}
          subtitle="Lunch Break"
        />
        <StatCard
          title="Overtime"
          value={stats.overtime}
          icon={
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
          }
          subtitle="Extra Hours"
        />
        <StatCard
          title="Undertime"
          value={stats.undertime}
          icon={
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
          }
          subtitle="Short Hours"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CompanyAttendanceChart />
            <DepartmentStatusChart />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductivityChart />
            <WorkHoursAnalysisChart />
          </div>

          {/* Employee List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0">
            {/* Employee List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                        Employee Directory & Status
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        Complete employee management overview
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full sm:w-64 bg-white border border-gray-300 hover:border-gray-400 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="w-full sm:w-40 bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full sm:w-32 bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late Arrivals</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 sm:space-y-2 p-2">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:border-gray-300"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
                    {/* Left section - Employee info */}
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      {/* Avatar with status */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${
                            employee.status === "Present"
                              ? "bg-green-500"
                              : employee.status === "Absent"
                              ? "bg-red-500"
                              : employee.breakStatus === "On Break"
                              ? "bg-blue-500"
                              : employee.lunchStatus === "On Lunch"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }`}
                        />
                      </div>

                      {/* Employee details */}
                      <div className="flex-1 min-w-0">
                        {/* Name and late badge */}
                        <h4 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                          <span className="truncate">{employee.name}</span>
                          {employee.isLate && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 sm:py-1 rounded-full flex-shrink-0">
                              Late
                            </span>
                          )}
                        </h4>

                        {/* Department and role */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <span className="px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {employee.department}
                          </span>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            •
                          </span>
                          <span className="text-xs text-gray-600 truncate">
                            {employee.role}
                          </span>
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                          <span
                            className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${
                              statusColors[employee.status]
                            }`}
                          >
                            {employee.status}
                          </span>
                          {employee.breakStatus && (
                            <span className="px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {employee.breakStatus}
                            </span>
                          )}
                          {employee.lunchStatus && (
                            <span className="px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              {employee.lunchStatus}
                            </span>
                          )}
                        </div>

                        {/* Last activity */}
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {employee.lastActivity}
                        </p>
                      </div>
                    </div>

                    {/* Right section - Time data */}
                    <div className="w-full lg:w-auto lg:flex-shrink-0">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center lg:text-right">
                        <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                          <div className="text-xs sm:text-sm font-bold text-gray-900">
                            {employee.timeIn || "--"}
                          </div>
                          <div className="text-xs text-gray-500">Time In</div>
                        </div>
                        <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                          <div className="text-xs sm:text-sm font-bold text-gray-900">
                            {employee.workHours}
                          </div>
                          <div className="text-xs text-gray-500">Hours</div>
                        </div>
                        <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                          <div
                            className={`text-xs sm:text-sm font-bold ${
                              employee.overtime !== "0:00"
                                ? "text-purple-600"
                                : "text-gray-900"
                            }`}
                          >
                            {employee.overtime}
                          </div>
                          <div className="text-xs text-gray-500">Overtime</div>
                        </div>
                        <div className="bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-2 lg:p-0">
                          <div
                            className={`text-xs sm:text-sm font-bold ${
                              employee.undertime !== "0:00"
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {employee.undertime}
                          </div>
                          <div className="text-xs text-gray-500">Undertime</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
                  No employees found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 relative overflow-hidden">
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gray-100 rounded-full translate-y-8 -translate-x-8"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-1 h-4 bg-white rounded-full ml-1"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Activity Monitor
                  </h3>
                  <p className="text-sm text-gray-500">
                    Employee time tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Active
                </span>
              </div>
            </div>

            {/* Activity List */}
            <div className="relative z-10 space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group bg-gray-50/40 hover:bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 relative"
                >
                  {/* Minimal status line */}
                  <div
                    className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${
                      activity.type === "timein"
                        ? "bg-green-400"
                        : activity.type === "timeout"
                        ? "bg-red-400"
                        : activity.type === "break"
                        ? "bg-blue-400"
                        : activity.type === "break_end"
                        ? "bg-blue-300"
                        : activity.type === "lunch"
                        ? "bg-orange-400"
                        : activity.type === "lunch_end"
                        ? "bg-orange-300"
                        : "bg-gray-300"
                    }`}
                  />

                  <div className="flex items-start space-x-4 ml-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={activity.avatar}
                        alt={activity.employee}
                        className="w-11 h-11 rounded-lg object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-shadow duration-200"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          activity.type === "timein"
                            ? "bg-green-400"
                            : activity.type === "timeout"
                            ? "bg-red-400"
                            : activity.type === "break" ||
                              activity.type === "break_end"
                            ? "bg-blue-400"
                            : activity.type === "lunch" ||
                              activity.type === "lunch_end"
                            ? "bg-orange-400"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Employee info */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {activity.employee}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium">
                            {activity.department || "Customer Service"} •{" "}
                            {activity.position || "Representative"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                            {activity.time}
                          </span>
                        </div>
                      </div>

                      {/* Action and status */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center space-x-2 text-xs font-medium px-2.5 py-1 rounded-md border ${
                            activity.type === "timein"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : activity.type === "timeout"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : activity.type === "break"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : activity.type === "break_end"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : activity.type === "lunch"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : activity.type === "lunch_end"
                              ? "bg-orange-50 text-orange-600 border-orange-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              activity.type === "timein"
                                ? "bg-green-400"
                                : activity.type === "timeout"
                                ? "bg-red-400"
                                : activity.type === "break" ||
                                  activity.type === "break_end"
                                ? "bg-blue-400"
                                : activity.type === "lunch" ||
                                  activity.type === "lunch_end"
                                ? "bg-orange-400"
                                : "bg-gray-400"
                            }`}
                          />
                          <span>{activity.action}</span>
                        </span>

                        <span className="text-xs text-gray-400 font-medium">
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="bg-white shadow-md rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Admin Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-blue-200">
                <Download className="w-4 h-4 mr-3" />
                Generate Company Report
              </button>
              <button className="w-full bg-green-50 hover:bg-green-100 text-green-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-green-200">
                <BarChart2 className="w-4 h-4 mr-3" />
                Department Analytics
              </button>
              <button className="w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-yellow-200">
                <AlertTriangle className="w-4 h-4 mr-3" />
                Review Attendance Issues
              </button>
              <button className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-purple-200">
                <Timer className="w-4 h-4 mr-3" />
                Manage Time Policies
              </button>
              <button className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-3 px-4 rounded-lg text-left flex items-center text-sm transition-colors border border-red-200">
                <Bell className="w-4 h-4 mr-3" />
                Send Company Notice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedEmployee(null)}
          ></div>

          <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl z-10">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Employee Details
              </h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Section - Employee Details */}
                <div className="col-span-4">
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <img
                        src={selectedEmployee.avatar}
                        alt={selectedEmployee.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {selectedEmployee.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {selectedEmployee.role}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Full Name
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedEmployee.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Hash className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Employee ID
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            #EMP
                            {selectedEmployee.id?.toString().padStart(3, "0") ||
                              "001"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Email Address
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedEmployee.email ||
                              `${selectedEmployee.name
                                .toLowerCase()
                                .replace(" ", ".")}@company.com`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Phone Number
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            09123456789
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Assigned Accounts
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            N/A
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Position
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedEmployee.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Department
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedEmployee.department}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Work Details */}
                <div className="col-span-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h5 className="text-lg font-medium text-gray-900">
                      Work Details
                    </h5>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Work Duration Card */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="text-sm text-gray-500 uppercase tracking-wide">
                          Work Duration
                        </h6>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedEmployee.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : selectedEmployee.status === "Absent"
                              ? "bg-red-100 text-red-800"
                              : selectedEmployee.status === "On Break"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedEmployee.status === "Working"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedEmployee.status}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedEmployee.workHours}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Time In:</span>
                          <span className="font-medium">
                            {selectedEmployee.timeIn || "Not yet"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Out:</span>
                          <span className="font-medium">
                            {selectedEmployee.timeOut || "Not yet"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h6 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
                        Status
                      </h6>
                      <div className="space-y-2">
                        <div
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            selectedEmployee.status === "Working"
                              ? "bg-green-100 text-green-800"
                              : selectedEmployee.status === "On Break"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedEmployee.status === "Absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {selectedEmployee.status}
                        </div>
                        {selectedEmployee.isLate && (
                          <div className="block">
                            <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Late Arrival
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <h6 className="font-medium text-gray-900">Notes</h6>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">
                        {selectedEmployee.notes ||
                          "Currently working on project A"}
                      </p>
                    </div>
                  </div>

                  {/* Time Tracking Details */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-lg font-bold text-purple-600">
                        {selectedEmployee.overtime || "0:00"}
                      </div>
                      <div className="text-xs text-purple-600 font-medium">
                        Overtime
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-lg font-bold text-red-600">
                        {selectedEmployee.undertime || "0:00"}
                      </div>
                      <div className="text-xs text-red-600 font-medium">
                        Undertime
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-blue-600">
                        {selectedEmployee.activityTime || "Just now"}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        Last Activity
                      </div>
                    </div>
                  </div>

                  {/* Weekly Summary */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h6 className="font-medium text-gray-900 mb-3">
                      This Week Summary
                    </h6>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          4
                        </div>
                        <div className="text-xs text-gray-600">
                          Days Present
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">1</div>
                        <div className="text-xs text-gray-600">Days Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          2
                        </div>
                        <div className="text-xs text-gray-600">Late Count</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          3.5h
                        </div>
                        <div className="text-xs text-gray-600">
                          Total Overtime
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Recorded on September 01, 2025 • 12:00 AM
              </div>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Reusable Components ----------
const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 ease-out">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-white/80 rounded-xl shadow-sm">{icon}</div>
      <div className="text-right">
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
    <div>
      <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);

export default AdminDashboard;
