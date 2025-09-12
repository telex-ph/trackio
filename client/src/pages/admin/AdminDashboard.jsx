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
          x: { stacked: false, grid: { display: false } },
          y: { beginAtZero: true, suggestedMax: 100 },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, padding: 12 },
          },
          tooltip: { mode: "index", intersect: false },
        },
      },
    }),
    [chartData]
  );

  return (
    <div className="h-80 md:h-96 pt-4 px-6 pb-19 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <BarChart2 className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Company-wide Attendance Trend
          </h3>
        </div>

        {/* Filter dropdown */}
        <select
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-slate-700"
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

      <div className="w-full h-full relative">
        <canvas ref={ref} />
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
            labels: {
              usePointStyle: true,
              padding: 8,
              font: { size: 11 },
            },
          },
        },
      },
    }),
    [chartData, selectedDept]
  );

  return (
    <div className="h-80 md:h-96 p-4 pb-24 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Employee Distribution by Department
          </h3>
        </div>

        {/* Department Filter */}
        <select
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-slate-700"
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

      <div className="text-xs text-gray-500 mb-2 text-right">
        Total: {totalEmployees}
      </div>

      <div className="w-full h-full relative flex items-start justify-center">
        <canvas ref={ref} className="max-h-78" />
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
            pointBorderWidth: 2,
            pointRadius: 5,
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
            pointBorderWidth: 2,
            pointRadius: 5,
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
            grid: { color: "rgba(0,0,0,0.1)" },
          },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { position: "bottom", labels: { padding: 15 } },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
          },
        },
        interaction: { mode: "index", intersect: false },
      },
    }),
    [chartData]
  );

  return (
    <div className="h-80 md:h-96 p-6 pb-19 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <LineChart className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Overtime vs Undertime Trends
          </h3>
        </div>

        {/* Filter dropdown */}
        <select
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-slate-700"
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

      <div className="w-full h-full relative">
        <canvas ref={ref} />
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
        labels: ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Average Work Hours",
            data: chartData.avg,
            backgroundColor: "rgba(59,130,246,0.8)",
            borderColor: "rgba(59,130,246,1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(59,130,246,1)",
          },
          {
            label: "Overtime Hours",
            data: chartData.overtime,
            backgroundColor: "rgba(239,68,68,0.8)",
            borderColor: "rgba(239,68,68,1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(239,68,68,1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500, easing: "easeOutQuart" },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, minRotation: 0 },
          },
          y: {
            beginAtZero: true,
            suggestedMax: 10,
            grid: { color: "rgba(0,0,0,0.1)" },
          },
        },
        plugins: {
          legend: { position: "bottom", labels: { padding: 15 } },
          tooltip: { mode: "index", intersect: false },
        },
        interaction: { mode: "index", intersect: false },
      },
    }),
    [chartData]
  );

  return (
    <div className="h-96 p-6 pb-20 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Weekly Work Hours & Overtime
          </h3>
        </div>

        {/* Filter dropdown */}
        <select
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white text-slate-700"
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

      <div className="w-full h-full relative">
        <canvas ref={ref} />
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Company-wide attendance and workforce management
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {currentTime.toLocaleTimeString()} | Today:{" "}
            {currentTime.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="w-6 h-6 text-slate-600" />}
          subtitle="Company-wide"
        />
        <StatCard
          title="Departments"
          value={stats.departments}
          icon={<Building2 className="w-6 h-6 text-indigo-600" />}
          subtitle="Active Depts"
        />
        <StatCard
          title="Present"
          value={stats.present}
          icon={<UserCheck className="w-6 h-6 text-emerald-600" />}
          subtitle="Currently Working"
        />
        <StatCard
          title="Absentees"
          value={stats.absent}
          icon={<UserX className="w-6 h-6 text-red-500" />}
          subtitle="Not Present"
        />
        <StatCard
          title="Late Arrivals"
          value={stats.late}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          subtitle="Late Today"
        />
        <StatCard
          title="On Break"
          value={stats.onBreak}
          icon={<Coffee className="w-6 h-6 text-blue-600" />}
          subtitle="Currently"
        />
        <StatCard
          title="On Lunch"
          value={stats.onLunch}
          icon={<Utensils className="w-6 h-6 text-orange-600" />}
          subtitle="Lunch Break"
        />
        <StatCard
          title="Overtime"
          value={stats.overtime}
          icon={<TrendingUp className="w-6 h-6 text-violet-600" />}
          subtitle="Extra Hours"
        />
        <StatCard
          title="Undertime"
          value={stats.undertime}
          icon={<TrendingDown className="w-6 h-6 text-pink-600" />}
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
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="font-semibold text-gray-800">
                  Employee Directory & Status
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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

            <div className="max-h-96 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
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
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          {employee.name}
                          {employee.isLate && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                              Late
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {employee.department}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-600">
                            {employee.role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              statusColors[employee.status]
                            }`}
                          >
                            {employee.status}
                          </span>
                          {employee.breakStatus && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {employee.breakStatus}
                            </span>
                          )}
                          {employee.lunchStatus && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              {employee.lunchStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {employee.lastActivity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {employee.timeIn || "--"}
                          </div>
                          <div className="text-xs text-gray-500">Time In</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {employee.workHours}
                          </div>
                          <div className="text-xs text-gray-500">Hours</div>
                        </div>
                        <div>
                          <div
                            className={`text-sm font-bold ${
                              employee.overtime !== "0:00"
                                ? "text-purple-600"
                                : "text-gray-900"
                            }`}
                          >
                            {employee.overtime}
                          </div>
                          <div className="text-xs text-gray-500">Overtime</div>
                        </div>
                        <div>
                          <div
                            className={`text-sm font-bold ${
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
                <div className="p-8 text-center text-gray-500">
                  No employees found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                Live Activity Feed
              </h4>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs text-gray-500">Updating...</span>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1.5 custom-scrollbar">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-all"
                >
                  {/* Avatar */}
                  <img
                    src={activity.avatar}
                    alt={activity.employee}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {activity.employee}
                      </p>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {activity.time}
                      </span>
                    </div>

                    {/* Tag + Status */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        {activity.department}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md capitalize ${
                          activity.type === "timein"
                            ? "bg-green-100 text-green-700"
                            : activity.type === "timeout"
                            ? "bg-red-100 text-red-700"
                            : activity.type === "break"
                            ? "bg-blue-100 text-blue-700"
                            : activity.type === "break_end"
                            ? "bg-blue-50 text-blue-600"
                            : activity.type === "lunch"
                            ? "bg-yellow-100 text-yellow-700"
                            : activity.type === "lunch_end"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {activity.action}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <p className="text-[11px] text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Department Overview
            </h3>
            <div className="space-y-4">
              {[
                {
                  dept: "IT Department",
                  present: 2,
                  total: 2,
                  color: "bg-blue-500",
                },
                {
                  dept: "Customer Service",
                  present: 2,
                  total: 2,
                  color: "bg-green-500",
                },
                {
                  dept: "Management",
                  present: 1,
                  total: 2,
                  color: "bg-yellow-500",
                },
                { dept: "HR", present: 1, total: 1, color: "bg-red-500" },
                {
                  dept: "Finance",
                  present: 1,
                  total: 1,
                  color: "bg-purple-500",
                },
                { dept: "Sales", present: 2, total: 2, color: "bg-cyan-500" },
              ].map((item, index) => {
                const percentage = (item.present / item.total) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.dept}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.present}/{item.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
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
