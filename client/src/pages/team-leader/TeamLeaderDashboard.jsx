import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import Chart from "chart.js/auto";

// ---------- Sample Data (kept small for demo) ----------
const teamData = [
  {
    id: 1,
    name: "Maria Santos",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
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
  {
    id: 3,
    name: "Ana Reyes",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
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
  {
    id: 5,
    name: "Lisa Garcia",
    avatar: "https://randomuser.me/api/portraits/women/41.jpg",
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
];

const recentActivities = [
  {
    id: 1,
    employee: "John Rivera",
    action: "Started Break",
    time: "2:30 PM",
    timestamp: "5 mins ago",
    type: "break",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 2,
    employee: "Carlos Mendoza",
    action: "Ended Break",
    time: "1:45 PM",
    timestamp: "20 mins ago",
    type: "break_end",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: 3,
    employee: "Ana Reyes",
    action: "Started Lunch",
    time: "12:00 PM",
    timestamp: "2 hours ago",
    type: "lunch",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    id: 4,
    employee: "Mark Reyes",
    action: "Timed Out",
    time: "6:30 PM",
    timestamp: "30 mins ago",
    type: "timeout",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 5,
    employee: "Sarah Johnson",
    action: "Timed In",
    time: "8:05 AM",
    timestamp: "8 hours ago",
    type: "timein",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
];

// ---------- Small helper to create/destroy charts cleanly ----------
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return chartRef;
}

// ---------- Charts (using the helper) ----------
const AttendanceChart = () => {
  const ref = useRef(null);

  useChart(
    ref,
    () => ({
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Present",
            data: [28, 25, 27, 26, 24, 22, 20],
            backgroundColor: "rgba(34,197,94,0.9)",
            borderColor: "rgba(34,197,94,1)",
            borderWidth: 1,
          },
          {
            label: "Absent",
            data: [2, 5, 3, 4, 6, 8, 10],
            backgroundColor: "rgba(239,68,68,0.9)",
            borderColor: "rgba(239,68,68,1)",
            borderWidth: 1,
          },
          {
            label: "Late",
            data: [5, 3, 4, 6, 4, 2, 3],
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
          y: { beginAtZero: true, suggestedMax: 32 },
        },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } },
          tooltip: { mode: "index", intersect: false },
        },
      },
    }),
    []
  );

  return (
    <div className="h-70 md:h-96 pt-4 px-6 pb-13 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <BarChart2 className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Weekly Attendance Trend
          </h3>
        </div>
        <div className="text-xs text-gray-500">Mon - Sun</div>
      </div>
      <div className="w-full h-full relative">
        <canvas ref={ref} />
      </div>
    </div>
  );
};

const CurrentStatusChart = () => {
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
    <div className="h-80 md:h-96 p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Current Team Status
          </h3>
        </div>
        <div className="text-xs text-gray-500">Live snapshot</div>
      </div>
      <div className="w-full h-full relative flex items-start justify-center">
        <canvas ref={ref} className="max-h-78" />
      </div>
    </div>
  );
};

const WorkHoursChart = () => {
  const ref = useRef(null);

  useChart(
    ref,
    () => ({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Overtime (mins)",
            data: [15, 20, 10, 18, 15, 25, 20],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.12)",
            tension: 0.35,
            fill: true,
          },
          {
            label: "Undertime (mins)",
            data: [8, 10, 5, 7, 6, 12, 9],
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.08)",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { position: "bottom" } },
      },
    }),
    []
  );

  return (
    <div className="h-70 md:h-96 p-16 bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <LineChart className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Work Hours Analysis
          </h3>
        </div>
        <div className="text-xs text-gray-500">Overtime vs Undertime</div>
      </div>
      <div className="w-full h-full relative">
        <canvas ref={ref} />
      </div>
    </div>
  );
};

// ---------- Main Dashboard ----------
const TeamLeaderDashboard = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
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

  const filteredEmployees =
    filterStatus === "All"
      ? teamData
      : teamData.filter((emp) => {
          if (filterStatus === "Present") return emp.status === "Present";
          if (filterStatus === "Absent") return emp.status === "Absent";
          if (filterStatus === "Late") return emp.isLate;
          return emp.status === filterStatus;
        });

  const stats = {
    present: teamData.filter((emp) => emp.status === "Present").length,
    absent: teamData.filter((emp) => emp.status === "Absent").length,
    late: teamData.filter((emp) => emp.isLate).length,
    onBreak: teamData.filter((emp) => emp.breakStatus === "On Break").length,
    onLunch: teamData.filter((emp) => emp.lunchStatus === "On Lunch").length,
    overtime: teamData.filter((emp) => emp.overtime !== "0:00").length,
    undertime: teamData.filter((emp) => emp.undertime !== "0:00").length,
    total: teamData.length,
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Team Monitoring Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time attendance and work hours monitoring
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {currentTime.toLocaleTimeString()} | Today:{" "}
            {currentTime.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            View Reports
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Live Monitor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <StatCard
          title="Total Team"
          value={stats.total}
          icon={<Users className="w-6 h-6 text-slate-600" />}
          subtitle="Team Members"
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

      {/* Main */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttendanceChart />
            <CurrentStatusChart />
          </div>

          <WorkHoursChart />

          <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl shadow-lg border border-gray-200/60 p-0 overflow-hidden">
            {/* Enhanced Header */}
            <div className="p-6 border-b border-gray-200/80 bg-gradient-to-r from-gray-50/50 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-indigo-500/8 rounded-full -translate-y-12 translate-x-12"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      Today's Attendance Status
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Team member tracking overview
                    </p>
                  </div>
                </div>

                <select
                  className="bg-white border border-gray-300 hover:border-gray-400 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Members</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late Arrivals</option>
                </select>
              </div>
            </div>

            {/* Enhanced Employee List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="group p-5 border-b border-gray-100/60 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-white cursor-pointer transition-all duration-200 hover:shadow-sm relative"
                  onClick={() => setSelectedEmployee(employee)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeIn 0.5s ease-out forwards",
                  }}
                >
                  {/* Status indicator line */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-300 group-hover:w-1.5 ${
                      employee.status === "Present" && !employee.isLate
                        ? "bg-gradient-to-b from-emerald-400 to-emerald-600"
                        : employee.isLate
                        ? "bg-gradient-to-b from-orange-400 to-orange-600"
                        : employee.status === "Absent"
                        ? "bg-gradient-to-b from-red-400 to-red-600"
                        : "bg-gradient-to-b from-gray-300 to-gray-500"
                    }`}
                  />

                  <div className="flex items-center justify-between ml-2">
                    {/* Employee Info Section */}
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Enhanced Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md group-hover:shadow-lg transition-shadow duration-200"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                            employee.status === "Present"
                              ? "bg-emerald-500"
                              : employee.status === "Absent"
                              ? "bg-red-500"
                              : employee.breakStatus === "On Break"
                              ? "bg-blue-500"
                              : employee.lunchStatus === "On Lunch"
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>

                      {/* Employee Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-bold text-gray-900 text-base group-hover:text-gray-800 transition-colors truncate">
                            {employee.name}
                          </h4>
                          {employee.isLate && (
                            <span className="inline-flex items-center text-xs bg-orange-100 text-orange-800 px-2.5 py-1 rounded-lg border border-orange-200 font-medium shadow-sm">
                              <Clock className="w-3 h-3 mr-1" />
                              Late
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mb-2 flex-wrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border shadow-sm ${
                              statusColors[employee.status]
                            }`}
                          >
                            {employee.status}
                          </span>

                          {employee.breakStatus && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                              <Coffee className="w-3 h-3 mr-1" />
                              {employee.breakStatus}
                            </span>
                          )}

                          {employee.lunchStatus && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                              <Utensils className="w-3 h-3 mr-1" />
                              {employee.lunchStatus}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <Activity className="w-3 h-3 mr-1" />
                          <span className="font-medium">
                            {employee.lastActivity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Time Metrics */}
                    <div className="flex-shrink-0 ml-6">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200/60 shadow-sm group-hover:shadow-md transition-all duration-200">
                          <div className="text-sm font-bold text-gray-900">
                            {employee.timeIn || "--"}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            Time In
                          </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200/60 shadow-sm group-hover:shadow-md transition-all duration-200">
                          <div className="text-sm font-bold text-gray-900">
                            {employee.workHours}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            Hours
                          </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200/60 shadow-sm group-hover:shadow-md transition-all duration-200">
                          <div
                            className={`text-sm font-bold ${
                              employee.overtime !== "0:00"
                                ? "text-purple-600"
                                : "text-gray-900"
                            }`}
                          >
                            {employee.overtime}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            Overtime
                          </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200/60 shadow-sm group-hover:shadow-md transition-all duration-200">
                          <div
                            className={`text-sm font-bold ${
                              employee.undertime !== "0:00"
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {employee.undertime}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            Undertime
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4">
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
          {/* TL Side Quick Actions Container */}
          <div className="bg-gradient-to-br from-white to-gray-50/50 shadow-lg rounded-2xl border border-gray-200/60 p-6 w-full mt-5 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 rounded-full -translate-y-10 translate-x-10"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Frequently used operations
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <button className="group w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700 hover:text-gray-900 py-4 px-4 rounded-xl text-left flex items-center justify-between text-sm transition-all duration-200 relative overflow-hidden">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mr-3 transition-colors">
                      <Timer className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Generate Attendance Report
                      </div>
                      <div className="text-xs text-gray-500">
                        Export detailed attendance data
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full transform group-hover:translate-x-0.5 transition-transform"></div>
                    </div>
                  </div>
                </button>

                <button className="group w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700 hover:text-gray-900 py-4 px-4 rounded-xl text-left flex items-center justify-between text-sm transition-all duration-200 relative overflow-hidden">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-50 group-hover:bg-green-100 rounded-lg flex items-center justify-center mr-3 transition-colors">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Export Time Logs
                      </div>
                      <div className="text-xs text-gray-500">
                        Download time tracking records
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full transform group-hover:translate-x-0.5 transition-transform"></div>
                    </div>
                  </div>
                </button>

                <button className="group w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700 hover:text-gray-900 py-4 px-4 rounded-xl text-left flex items-center justify-between text-sm transition-all duration-200 relative overflow-hidden">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-50 group-hover:bg-orange-100 rounded-lg flex items-center justify-center mr-3 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        View Attendance Issues
                      </div>
                      <div className="text-xs text-gray-500">
                        Check flagged attendance records
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full transform group-hover:translate-x-0.5 transition-transform"></div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal Overlay */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred and dimmed background */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedEmployee(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl p-0 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                Details for {selectedEmployee.name}
              </h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Employee Info */}
                <div className="col-span-5 space-y-6">
                  {/* Employee Details Card */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="relative">
                        <img
                          src={selectedEmployee.avatar}
                          alt={selectedEmployee.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            selectedEmployee.status === "Present"
                              ? "bg-green-500"
                              : selectedEmployee.status === "Break"
                              ? "bg-blue-500"
                              : selectedEmployee.status === "Lunch"
                              ? "bg-orange-500"
                              : selectedEmployee.status === "Absent"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {selectedEmployee.name}
                        </h4>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${
                            statusColors[selectedEmployee.status]
                          }`}
                        >
                          {selectedEmployee.status}
                        </span>
                        {selectedEmployee.isLate && (
                          <div className="mt-2">
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-lg border border-orange-200">
                              Late Arrival
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            EMPLOYEE ID
                          </span>
                          <div className="font-semibold text-gray-900">
                            {selectedEmployee.employeeId || "#EMP001"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            EMAIL ADDRESS
                          </span>
                          <div className="font-medium text-gray-900">
                            {selectedEmployee.email || "employee@company.com"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            POSITION
                          </span>
                          <div className="font-medium text-gray-900">
                            {selectedEmployee.position ||
                              "Customer Service Rep"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs uppercase tracking-wide">
                            DEPARTMENT
                          </span>
                          <div className="font-medium text-gray-900">
                            {selectedEmployee.department || "Customer Support"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Today's Schedule */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-600" />
                      Today's Schedule
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Time In:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedEmployee.timeIn || "Not yet"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Time Out:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedEmployee.timeOut || "Not yet"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">
                          Work Hours:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {selectedEmployee.workHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Deviations */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                      Time Deviations
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">Overtime:</span>
                        <span
                          className={`font-semibold ${
                            selectedEmployee.overtime !== "0:00"
                              ? "text-purple-600"
                              : "text-gray-900"
                          }`}
                        >
                          {selectedEmployee.overtime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 text-sm">
                          Undertime:
                        </span>
                        <span
                          className={`font-semibold ${
                            selectedEmployee.undertime !== "0:00"
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {selectedEmployee.undertime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-span-7 space-y-6">
                  {/* Tardiness Details */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-600" />
                      Tardiness Details
                    </h5>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          Scheduled In
                        </div>
                        <div className="font-bold text-gray-900">
                          {selectedEmployee.scheduledIn || "9:00 A.M."}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-600 mb-1">
                          Actual In
                        </div>
                        <div className="font-bold text-gray-900">
                          {selectedEmployee.actualIn || "9:15 A.M."}
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                        <div className="text-sm text-red-600 mb-1">
                          Minutes Late
                        </div>
                        <div className="font-bold text-red-600">
                          {selectedEmployee.minutesLate || "15 mins"}
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h6 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Notes
                      </h6>
                      <textarea
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows="3"
                        placeholder="Add notes about tardiness..."
                        defaultValue={
                          selectedEmployee.notes || "Traffic on the way"
                        }
                      />
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-600" />
                      Current Status
                    </h5>
                    <div className="space-y-3">
                      {selectedEmployee.breakStatus && (
                        <div className="flex items-center text-sm">
                          <Coffee className="w-4 h-4 text-blue-600 mr-3" />
                          <span className="text-blue-800 font-medium">
                            {selectedEmployee.breakStatus}
                          </span>
                        </div>
                      )}
                      {selectedEmployee.lunchStatus && (
                        <div className="flex items-center text-sm">
                          <Utensils className="w-4 h-4 text-orange-600 mr-3" />
                          <span className="text-orange-800 font-medium">
                            {selectedEmployee.lunchStatus}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Activity className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-gray-700 font-medium">
                          {selectedEmployee.lastActivity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 ml-7">
                        {selectedEmployee.activityTime}
                      </div>
                    </div>
                  </div>

                  {/* Call Attempts */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h5 className="font-bold text-gray-900 mb-3">
                      Call Attempts
                    </h5>
                    <p className="text-sm text-gray-600 mb-4">
                      View the employee's call attempt history and details.
                    </p>
                    <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium">
                      <Users className="w-4 h-4 mr-2" />
                      View Call Attempts
                    </button>
                  </div>

                  {/* This Week Summary */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center">
                      <BarChart2 className="w-5 h-5 mr-2 text-gray-600" />
                      This Week Summary
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="text-2xl font-bold text-green-600">
                          4
                        </div>
                        <div className="text-xs text-green-700 font-medium">
                          Days Present
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="text-2xl font-bold text-red-600">1</div>
                        <div className="text-xs text-red-700 font-medium">
                          Days Absent
                        </div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="text-2xl font-bold text-orange-600">
                          2
                        </div>
                        <div className="text-xs text-orange-700 font-medium">
                          Late Arrivals
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600">
                          3.5h
                        </div>
                        <div className="text-xs text-purple-700 font-medium">
                          Total Overtime
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Reusable Components ----------
const Card = ({ title, children, className }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
      className || ""
    }`}
  >
    {title && (
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          {title}
        </h2>
      </div>
    )}
    <div className={title ? "" : "p-4"}>{children}</div>
  </div>
);

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

export default TeamLeaderDashboard;
