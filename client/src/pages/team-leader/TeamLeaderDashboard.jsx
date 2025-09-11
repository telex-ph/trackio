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
    <div className="p-6 bg-gray-50 min-h-screen">
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Today's Attendance Status
              </h3>
              <select
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Members</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late Arrivals</option>
              </select>
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
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col">
            {/* Header */}
            <h4 className="text-sm font-semibold text-gray-800 mb-3">
              Live Activity Monitoring
            </h4>

            {/* Activity List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50/70 rounded-lg hover:bg-gray-50 transition-colors border-l-2 border-gray-200"
                >
                  <img
                    src={activity.avatar}
                    alt={activity.employee}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {activity.employee}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {activity.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          activity.type === "timein"
                            ? "bg-green-300"
                            : activity.type === "timeout"
                            ? "bg-red-300"
                            : activity.type === "break"
                            ? "bg-blue-300"
                            : activity.type === "break_end"
                            ? "bg-blue-200"
                            : activity.type === "lunch"
                            ? "bg-yellow-300"
                            : activity.type === "lunch_end"
                            ? "bg-yellow-200"
                            : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          activity.type === "timein"
                            ? "bg-green-50 text-green-700"
                            : activity.type === "timeout"
                            ? "bg-red-50 text-red-700"
                            : activity.type === "break"
                            ? "bg-blue-50 text-blue-700"
                            : activity.type === "break_end"
                            ? "bg-blue-50 text-blue-600"
                            : activity.type === "lunch"
                            ? "bg-yellow-50 text-yellow-700"
                            : activity.type === "lunch_end"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {activity.action}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* TL Side Quick Actions Container */}
          <div className="bg-white shadow-md rounded-xl p-5 w-full mt-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-left flex items-center text-sm transition-colors">
                <Timer className="w-4 h-4 mr-2" /> Generate Attendance Report
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-left flex items-center text-sm transition-colors">
                <Activity className="w-4 h-4 mr-2" /> Export Time Logs
              </button>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-left flex items-center text-sm transition-colors">
                <AlertTriangle className="w-4 h-4 mr-2" /> View Attendance
                Issues
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Employee Details
              </h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">
                      {selectedEmployee.name}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        statusColors[selectedEmployee.status]
                      }`}
                    >
                      {selectedEmployee.status}
                    </span>
                    {selectedEmployee.isLate && (
                      <div className="mt-2">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Late Arrival
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Today's Schedule
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time In:</span>
                        <span className="font-medium">
                          {selectedEmployee.timeIn || "Not yet"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time Out:</span>
                        <span className="font-medium">
                          {selectedEmployee.timeOut || "Not yet"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work Hours:</span>
                        <span className="font-medium">
                          {selectedEmployee.workHours}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Time Deviations
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overtime:</span>
                        <span
                          className={`font-medium ${
                            selectedEmployee.overtime !== "0:00"
                              ? "text-purple-600"
                              : ""
                          }`}
                        >
                          {selectedEmployee.overtime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Undertime:</span>
                        <span
                          className={`font-medium ${
                            selectedEmployee.undertime !== "0:00"
                              ? "text-red-600"
                              : ""
                          }`}
                        >
                          {selectedEmployee.undertime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold text-gray-800 mb-2">
                    Current Status
                  </h5>
                  <div className="space-y-2">
                    {selectedEmployee.breakStatus && (
                      <div className="flex items-center text-sm">
                        <Coffee className="w-4 h-4 text-blue-600 mr-2" />{" "}
                        <span className="text-blue-800">
                          {selectedEmployee.breakStatus}
                        </span>
                      </div>
                    )}
                    {selectedEmployee.lunchStatus && (
                      <div className="flex items-center text-sm">
                        <Utensils className="w-4 h-4 text-yellow-600 mr-2" />{" "}
                        <span className="text-yellow-800">
                          {selectedEmployee.lunchStatus}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Activity className="w-4 h-4 text-gray-600 mr-2" />
                      <span className="text-gray-700">
                        {selectedEmployee.lastActivity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedEmployee.activityTime}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800">Actions</h5>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-2" /> View Full Time Log
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Send Notification
                  </button>
                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Flag Attendance
                    Issue
                  </button>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-3">
                    This Week Summary
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">4</div>
                      <div className="text-xs text-gray-600">Days Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">1</div>
                      <div className="text-xs text-gray-600">Days Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">2</div>
                      <div className="text-xs text-gray-600">Late Arrivals</div>
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
