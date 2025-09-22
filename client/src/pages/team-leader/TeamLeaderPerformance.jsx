import React, { useState, useEffect, useRef, memo } from "react";
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Eye,
  User,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import Chart from "chart.js/auto";
import Table from "../../components/Table";

const StatCard = memo(({ icon: Icon, title, value, change, changeType, color }) => (
  <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
      {change && (
        <div className={`flex items-center gap-1 ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {changeType === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{change}</span>
        </div>
      )}
    </div>
  </div>
));

const TeamLeaderPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  
  // Chart refs
  const attendanceChartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const trendsChartRef = useRef(null);
  const departmentChartRef = useRef(null);
  
  // Chart instances
  const attendanceChartInstance = useRef(null);
  const performanceChartInstance = useRef(null);
  const trendsChartInstance = useRef(null);
  const departmentChartInstance = useRef(null);

  // Mock data
  const [dashboardData] = useState({
    totalEmployees: 156,
    presentToday: 142,
    absentToday: 8,
    lateToday: 6,
    attendanceRate: 91.0,
    averageHours: 8.2,
    overtimeHours: 124,
    leaveRequests: 12
  });

  const [teamMembers] = useState([
    {
      id: 1,
      name: "Juan Dela Cruz",
      position: "Senior Developer",
      department: "Development",
      status: "Present",
      timeIn: "08:00",
      timeOut: "17:00",
      hoursWorked: 8.0,
      overtimeHours: 1.5,
      attendanceRate: 95.2,
      lateCount: 2,
      absentCount: 1,
      leaveBalance: 12
    },
    {
      id: 2,
      name: "Maria Santos",
      position: "QA Engineer",
      department: "Quality Assurance", 
      status: "Late",
      timeIn: "08:30",
      timeOut: "17:30",
      hoursWorked: 8.0,
      overtimeHours: 0.5,
      attendanceRate: 88.7,
      lateCount: 5,
      absentCount: 2,
      leaveBalance: 8
    },
    {
      id: 3,
      name: "Pedro Garcia",
      position: "Project Manager",
      department: "Management",
      status: "Absent",
      timeIn: "-",
      timeOut: "-",
      hoursWorked: 0,
      overtimeHours: 0,
      attendanceRate: 92.1,
      lateCount: 1,
      absentCount: 3,
      leaveBalance: 15
    },
    {
      id: 4,
      name: "Ana Rodriguez",
      position: "UI/UX Designer",
      department: "Design",
      status: "Present",
      timeIn: "07:45",
      timeOut: "16:45",
      hoursWorked: 8.0,
      overtimeHours: 2.0,
      attendanceRate: 96.8,
      lateCount: 1,
      absentCount: 0,
      leaveBalance: 18
    },
    {
      id: 5,
      name: "Carlos Mendoza",
      position: "DevOps Engineer",
      department: "Development",
      status: "Present",
      timeIn: "08:15",
      timeOut: "17:15",
      hoursWorked: 8.0,
      overtimeHours: 1.0,
      attendanceRate: 89.3,
      lateCount: 4,
      absentCount: 2,
      leaveBalance: 10
    }
  ]);

  const initializeCharts = () => {
    // Destroy existing charts
    if (attendanceChartInstance.current) {
      attendanceChartInstance.current.destroy();
    }
    if (performanceChartInstance.current) {
      performanceChartInstance.current.destroy();
    }
    if (trendsChartInstance.current) {
      trendsChartInstance.current.destroy();
    }
    if (departmentChartInstance.current) {
      departmentChartInstance.current.destroy();
    }

    // Attendance Overview Chart (Doughnut)
    if (attendanceChartRef.current) {
      const ctx = attendanceChartRef.current.getContext('2d');
      attendanceChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Late', 'Absent', 'On Leave'],
          datasets: [{
            data: [142, 6, 8, 12],
            backgroundColor: [
              '#10B981', // Green for Present
              '#F59E0B', // Yellow for Late  
              '#EF4444', // Red for Absent
              '#6366F1'  // Blue for On Leave
            ],
            borderWidth: 0,
            cutout: '70%'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            }
          }
        }
      });
    }

    // Performance Trends Chart (Line)
    if (performanceChartRef.current) {
      const ctx = performanceChartRef.current.getContext('2d');
      performanceChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Attendance Rate (%)',
              data: [88, 92, 87, 94, 91, 89],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Performance Score',
              data: [85, 88, 86, 92, 90, 87],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 80,
              max: 100
            }
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      });
    }

    // Weekly Attendance Trends (Bar)
    if (trendsChartRef.current) {
      const ctx = trendsChartRef.current.getContext('2d');
      trendsChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Present',
              data: [145, 148, 144, 142, 140, 82, 45],
              backgroundColor: '#10B981'
            },
            {
              label: 'Late',
              data: [8, 5, 9, 6, 12, 4, 2],
              backgroundColor: '#F59E0B'
            },
            {
              label: 'Absent',
              data: [3, 3, 3, 8, 4, 2, 1],
              backgroundColor: '#EF4444'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true
            }
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      });
    }

    // Department Performance (Radar)
    if (departmentChartRef.current) {
      const ctx = departmentChartRef.current.getContext('2d');
      departmentChartInstance.current = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Attendance', 'Punctuality', 'Performance', 'Overtime', 'Leave Usage'],
          datasets: [
            {
              label: 'Development',
              data: [92, 88, 94, 85, 78],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              pointBackgroundColor: '#3B82F6'
            },
            {
              label: 'Design',
              data: [96, 94, 90, 92, 85],
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              pointBackgroundColor: '#10B981'
            },
            {
              label: 'QA',
              data: [89, 85, 88, 75, 82],
              borderColor: '#F59E0B',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              pointBackgroundColor: '#F59E0B'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              beginAtZero: true,
              max: 100
            }
          },
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    initializeCharts();
    
    return () => {
      // Cleanup charts on unmount
      if (attendanceChartInstance.current) {
        attendanceChartInstance.current.destroy();
      }
      if (performanceChartInstance.current) {
        performanceChartInstance.current.destroy();
      }
      if (trendsChartInstance.current) {
        trendsChartInstance.current.destroy();
      }
      if (departmentChartInstance.current) {
        departmentChartInstance.current.destroy();
      }
    };
  }, [selectedPeriod]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Absent':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Late':
        return <Timer className="w-4 h-4 text-yellow-600" />;
      case 'Absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const columns = [
    {
      headerName: "EMPLOYEE",
      field: "name",
      sortable: true,
      filter: true,
      width: 200,
      cellRenderer: (params) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span class="text-indigo-600 font-semibold text-sm">${params.data.name.charAt(0)}</span>
            </div>
            <div>
              <div class="font-semibold text-gray-800">${params.data.name}</div>
              <div class="text-sm text-gray-500">${params.data.position}</div>
            </div>
          </div>
        `;
      }
    },
    {
      headerName: "DEPARTMENT",
      field: "department",
      sortable: true,
      filter: true,
      width: 150
    },
    {
      headerName: "STATUS",
      field: "status",
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => {
        const statusClass = getStatusColor(params.value);
        return `<span class="px-3 py-1 rounded-full text-sm font-medium border ${statusClass}">${params.value}</span>`;
      }
    },
    {
      headerName: "TIME IN",
      field: "timeIn",
      sortable: true,
      width: 100,
      cellRenderer: (params) => {
        return params.value === '-' ? 
          '<span class="text-gray-400">-</span>' : 
          `<span class="font-mono text-sm">${params.value}</span>`;
      }
    },
    {
      headerName: "TIME OUT",
      field: "timeOut",
      sortable: true,
      width: 100,
      cellRenderer: (params) => {
        return params.value === '-' ? 
          '<span class="text-gray-400">-</span>' : 
          `<span class="font-mono text-sm">${params.value}</span>`;
      }
    },
    {
      headerName: "HOURS WORKED",
      field: "hoursWorked",
      sortable: true,
      width: 130,
      cellRenderer: (params) => {
        return params.value === 0 ? 
          '<span class="text-gray-400">0.0h</span>' : 
          `<span class="font-semibold">${params.value}h</span>`;
      }
    },
    {
      headerName: "ATTENDANCE RATE",
      field: "attendanceRate",
      sortable: true,
      width: 150,
      cellRenderer: (params) => {
        const rate = params.value;
        const color = rate >= 95 ? 'text-green-600' : rate >= 85 ? 'text-yellow-600' : 'text-red-600';
        return `<span class="font-semibold ${color}">${rate}%</span>`;
      }
    },
    {
      headerName: "LATE COUNT",
      field: "lateCount",
      sortable: true,
      width: 120,
      cellRenderer: (params) => {
        const count = params.value;
        const color = count === 0 ? 'text-green-600' : count <= 2 ? 'text-yellow-600' : 'text-red-600';
        return `<span class="font-semibold ${color}">${count}</span>`;
      }
    },
    {
      headerName: "ACTIONS",
      field: "actions",
      sortable: false,
      filter: false,
      width: 120,
      cellRenderer: (params) => {
        return `
          <div class="flex gap-2">
            <button class="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors" title="View Details">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
          </div>
        `;
      }
    }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Reinitialize charts with new data
      initializeCharts();
    }, 1000);
  };

  const handleExport = () => {
    // Mock export functionality
    const csvContent = teamMembers.map(member => 
      `${member.name},${member.department},${member.status},${member.timeIn},${member.timeOut},${member.hoursWorked},${member.attendanceRate}%`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <section className="flex flex-col mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Team Performance</h2>
        </div>
        <p className="text-gray-600 mt-2">Monitor and analyze team attendance and performance metrics</p>
      </section>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Teams</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="qa">Quality Assurance</option>
                <option value="management">Management</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Employees"
          value={dashboardData.totalEmployees}
          color="bg-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Present Today"
          value={dashboardData.presentToday}
          change="+5.2%"
          changeType="up"
          color="bg-green-600"
        />
        <StatCard
          icon={XCircle}
          title="Absent Today"
          value={dashboardData.absentToday}
          change="-2.1%"
          changeType="down"
          color="bg-red-600"
        />
        <StatCard
          icon={Timer}
          title="Average Hours"
          value={`${dashboardData.averageHours}h`}
          change="+0.3h"
          changeType="up"
          color="bg-purple-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Overview */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Attendance Overview
          </h3>
          <div className="h-80">
            <canvas ref={attendanceChartRef}></canvas>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Performance Trends
          </h3>
          <div className="h-80">
            <canvas ref={performanceChartRef}></canvas>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Weekly Attendance Trends
          </h3>
          <div className="h-80">
            <canvas ref={trendsChartRef}></canvas>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Department Performance
          </h3>
          <div className="h-80">
            <canvas ref={departmentChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            Team Members
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{teamMembers.length} employees</span>
          </div>
        </div>

        <Table
          data={teamMembers}
          columns={columns}
          pagination={{
            pageSize: 10,
          }}
        />
      </div>
    </div>
  );
};

export default TeamLeaderPerformance;