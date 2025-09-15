import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Calendar,
  BarChart3,
  Download,
  Filter,
  Search,
  Phone,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  DollarSign
} from "lucide-react";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const TLPerformancePage = () => {
  const [agentData, setAgentData] = useState([]);
  const [filters, setFilters] = useState("This Week");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("overall");
  const [expandedSections, setExpandedSections] = useState({
    attendance: true,
    productivity: true,
    quality: true,
    goals: true
  });

  const [summary, setSummary] = useState({
    totalAgents: 0,
    present: 0,
    absent: 0,
    late: 0,
    overtime: 0,
    avgProductivity: 0,
    avgQualityScore: 0,
    goalAchievement: 0
  });

  useEffect(() => {
    // Enhanced mock agent data with comprehensive performance metrics
    const agents = [
      { 
        id: 1, 
        name: "Alice Johnson", 
        status: "Present", 
        hoursWorked: 8, 
        overtime: 1,
        callsHandled: 45,
        avgCallDuration: 6.5,
        qualityScore: 92,
        customerSatisfaction: 4.8,
        salesTarget: 15,
        salesAchieved: 18,
        escalations: 2,
        firstCallResolution: 88,
        loginTime: "08:00",
        department: "Sales",
        teamLead: "John Smith",
        productivity: 95
      },
      { 
        id: 2, 
        name: "Bob Williams", 
        status: "Late", 
        hoursWorked: 7, 
        overtime: 0,
        callsHandled: 38,
        avgCallDuration: 7.2,
        qualityScore: 85,
        customerSatisfaction: 4.2,
        salesTarget: 12,
        salesAchieved: 10,
        escalations: 4,
        firstCallResolution: 75,
        loginTime: "08:15",
        department: "Support",
        teamLead: "Jane Doe",
        productivity: 78
      },
      { 
        id: 3, 
        name: "Charlie Brown", 
        status: "Absent", 
        hoursWorked: 0, 
        overtime: 0,
        callsHandled: 0,
        avgCallDuration: 0,
        qualityScore: 0,
        customerSatisfaction: 0,
        salesTarget: 10,
        salesAchieved: 0,
        escalations: 0,
        firstCallResolution: 0,
        loginTime: "N/A",
        department: "Sales",
        teamLead: "John Smith",
        productivity: 0
      },
      { 
        id: 4, 
        name: "David Lee", 
        status: "Present", 
        hoursWorked: 8, 
        overtime: 2,
        callsHandled: 52,
        avgCallDuration: 5.8,
        qualityScore: 96,
        customerSatisfaction: 4.9,
        salesTarget: 20,
        salesAchieved: 22,
        escalations: 1,
        firstCallResolution: 94,
        loginTime: "07:55",
        department: "Sales",
        teamLead: "John Smith",
        productivity: 98
      },
      { 
        id: 5, 
        name: "Eve Davis", 
        status: "Late", 
        hoursWorked: 7, 
        overtime: 1,
        callsHandled: 41,
        avgCallDuration: 6.8,
        qualityScore: 89,
        customerSatisfaction: 4.5,
        salesTarget: 14,
        salesAchieved: 16,
        escalations: 3,
        firstCallResolution: 82,
        loginTime: "08:10",
        department: "Support",
        teamLead: "Jane Doe",
        productivity: 86
      },
      { 
        id: 6, 
        name: "Frank Miller", 
        status: "Present", 
        hoursWorked: 8, 
        overtime: 0,
        callsHandled: 43,
        avgCallDuration: 6.3,
        qualityScore: 88,
        customerSatisfaction: 4.4,
        salesTarget: 13,
        salesAchieved: 15,
        escalations: 2,
        firstCallResolution: 86,
        loginTime: "08:02",
        department: "Sales",
        teamLead: "John Smith",
        productivity: 90
      }
    ];

    // Calculate comprehensive performance scores
    const agentsWithScore = agents.map((a) => {
      const attendanceScore = a.status === "Present" ? 25 : a.status === "Late" ? 15 : 0;
      const productivityScore = Math.min((a.callsHandled / 50) * 25, 25);
      const qualityScore = (a.qualityScore / 100) * 25;
      const salesScore = Math.min((a.salesAchieved / a.salesTarget) * 25, 25);
      
      return { 
        ...a, 
        performance: Math.round(attendanceScore + productivityScore + qualityScore + salesScore),
        goalAchievementRate: a.salesTarget > 0 ? Math.round((a.salesAchieved / a.salesTarget) * 100) : 0
      };
    });

    setAgentData(agentsWithScore);

    // Calculate enhanced summary metrics
    const totalAgents = agents.length;
    const present = agents.filter((a) => a.status === "Present").length;
    const absent = agents.filter((a) => a.status === "Absent").length;
    const late = agents.filter((a) => a.status === "Late").length;
    const overtime = agents.reduce((sum, a) => sum + a.overtime, 0);
    
    const activeAgents = agents.filter(a => a.status !== "Absent");
    const avgProductivity = activeAgents.length > 0 
      ? Math.round(activeAgents.reduce((sum, a) => sum + a.productivity, 0) / activeAgents.length)
      : 0;
    const avgQualityScore = activeAgents.length > 0
      ? Math.round(activeAgents.reduce((sum, a) => sum + a.qualityScore, 0) / activeAgents.length)
      : 0;
    const goalAchievement = agentsWithScore.length > 0
      ? Math.round(agentsWithScore.reduce((sum, a) => sum + a.goalAchievementRate, 0) / agentsWithScore.length)
      : 0;

    setSummary({ 
      totalAgents, 
      present, 
      absent, 
      late, 
      overtime, 
      avgProductivity,
      avgQualityScore,
      goalAchievement
    });
  }, []);

  // Filter agents based on search term
  const filteredAgents = agentData.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top performers and improvement needed
  const topPerformers = [...agentData]
    .filter(a => a.status !== "Absent")
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 3);

  const needImprovement = [...agentData]
    .filter(a => a.status !== "Absent")
    .sort((a, b) => a.performance - b.performance)
    .slice(0, 3);

  // Enhanced chart data
  const attendanceTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Present",
        data: [4, 5, 4, 5, 4],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Late",
        data: [1, 1, 0, 1, 0],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Absent",
        data: [1, 0, 1, 0, 1],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const productivityData = {
    labels: ["Calls Handled", "Avg Duration", "Quality Score", "FCR Rate"],
    datasets: [
      {
        label: "Team Average",
        data: [42, 6.5, 88, 85],
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "#4f46e5",
        pointBackgroundColor: "#4f46e5",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#4f46e5",
      },
      {
        label: "Industry Benchmark",
        data: [40, 7, 85, 80],
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "#22c55e",
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#22c55e",
      },
    ],
  };

  const departmentPerformanceData = {
    labels: ["Sales", "Support"],
    datasets: [
      {
        data: [
          agentData.filter(a => a.department === "Sales" && a.status !== "Absent").length,
          agentData.filter(a => a.department === "Support" && a.status !== "Absent").length
        ],
        backgroundColor: ["#6366f1", "#8b5cf6"],
        hoverBackgroundColor: ["#5b21b6", "#7c3aed"],
      },
    ],
  };

  const salesPerformanceData = {
    labels: agentData.filter(a => a.status !== "Absent").map(a => a.name),
    datasets: [
      {
        label: "Sales Target",
        data: agentData.filter(a => a.status !== "Absent").map(a => a.salesTarget),
        backgroundColor: "rgba(156, 163, 175, 0.7)",
      },
      {
        label: "Sales Achieved",
        data: agentData.filter(a => a.status !== "Absent").map(a => a.salesAchieved),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { 
      legend: { position: "top" },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#4f46e5",
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPerformanceColor = (score) => {
    if (score >= 85) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "Present":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Late":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Absent":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="space-y-6 p-6">
        {/* Header Section */}
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Team Performance Dashboard</h1>
              </div>
              <p className="text-gray-600">Comprehensive performance analytics and team insights</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters}
                onChange={(e) => setFilters(e.target.value)}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Quarter</option>
              </select>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Agents</p>
                <p className="text-3xl font-bold text-gray-900">{summary.totalAgents}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-xs text-gray-500">Active today</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round((summary.present / summary.totalAgents) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">+5% from last week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Productivity</p>
                <p className="text-3xl font-bold text-gray-900">{summary.avgProductivity}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-xs text-blue-600">Above target</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Goal Achievement</p>
                <p className="text-3xl font-bold text-gray-900">{summary.goalAchievement}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Award className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-xs text-purple-600">Exceeding targets</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name or department..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="overall">Overall Performance</option>
              <option value="attendance">Attendance</option>
              <option value="productivity">Productivity</option>
              <option value="quality">Quality Score</option>
              <option value="sales">Sales Performance</option>
            </select>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold">Top Performers</h3>
            </div>
            <div className="space-y-3">
              {topPerformers.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{agent.performance}%</p>
                    <p className="text-xs text-gray-500">{agent.callsHandled} calls</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Needs Attention</h3>
            </div>
            <div className="space-y-3">
              {needImprovement.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{agent.performance}%</p>
                    <p className="text-xs text-gray-500">Needs coaching</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('attendance')}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Attendance Analytics</h3>
            </div>
            {expandedSections.attendance ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {expandedSections.attendance && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Line data={attendanceTrendData} options={chartOptions} />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Present Today</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">{summary.present}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Late Arrivals</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{summary.late}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Absent</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-2">{summary.absent}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Productivity & Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection('productivity')}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold">Productivity Metrics</h3>
              </div>
              {expandedSections.productivity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            
            {expandedSections.productivity && (
              <Radar data={productivityData} options={radarOptions} />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold">Department Distribution</h3>
            </div>
            <Doughnut 
              data={departmentPerformanceData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                  }
                }
              }} 
            />
          </div>
        </div>

        {/* Sales Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div 
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => toggleSection('goals')}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Sales Performance & Goals</h3>
            </div>
            {expandedSections.goals ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {expandedSections.goals && (
            <Bar data={salesPerformanceData} options={chartOptions} />
          )}
        </div>

        {/* Detailed Agent Performance Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold">Detailed Performance Report</h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CSAT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">ID: {agent.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(agent.status)}>
                        {agent.status}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Login: {agent.loginTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{agent.department}</div>
                      <div className="text-xs text-gray-500">{agent.teamLead}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent.callsHandled}</div>
                      <div className="text-xs text-gray-500">Avg: {agent.avgCallDuration}min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{agent.qualityScore}%</div>
                        {agent.qualityScore >= 90 && <Star className="w-4 h-4 text-yellow-500 ml-1" />}
                      </div>
                      <div className="text-xs text-gray-500">
                        {agent.escalations} escalations
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {agent.salesAchieved}/{agent.salesTarget}
                      </div>
                      <div className={`text-xs ${
                        agent.goalAchievementRate >= 100 ? 'text-green-600' : 
                        agent.goalAchievementRate >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {agent.goalAchievementRate}% achieved
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{agent.customerSatisfaction}/5.0</span>
                      </div>
                      <div className="text-xs text-gray-500">Customer rating</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{agent.firstCallResolution}%</div>
                      <div className="text-xs text-gray-500">First call resolution</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPerformanceColor(agent.performance)}`}>
                        {agent.performance}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agent.performance >= 85 ? 'Excellent' : 
                         agent.performance >= 70 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Performance Insights & Recommendations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Productivity Trend</h4>
              </div>
              <p className="text-sm text-blue-700">
                Overall team productivity is up 8% this week. David Lee and Alice Johnson are leading performers.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Areas for Improvement</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Focus on reducing average call duration and improving first call resolution rates in the Support team.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Recognition</h4>
              </div>
              <p className="text-sm text-green-700">
                3 agents exceeded their sales targets this week. Consider implementing peer mentoring programs.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Timer className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Real-time Activity Feed</h3>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm"><strong>David Lee</strong> completed a sale - Target: $2,500</span>
              <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm"><strong>Alice Johnson</strong> received 5-star customer rating</span>
              <span className="text-xs text-gray-500 ml-auto">5 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm"><strong>Bob Williams</strong> marked as late arrival</span>
              <span className="text-xs text-gray-500 ml-auto">15 min ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm"><strong>Frank Miller</strong> handled 10 calls in the last hour</span>
              <span className="text-xs text-gray-500 ml-auto">18 min ago</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm"><strong>Charlie Brown</strong> marked as absent</span>
              <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
              <Users className="w-6 h-6" />
              <span className="text-sm font-medium">Schedule Meeting</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
              <FileText className="w-6 h-6" />
              <span className="text-sm font-medium">Generate Report</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
              <Award className="w-6 h-6" />
              <span className="text-sm font-medium">Send Recognition</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
              <Target className="w-6 h-6" />
              <span className="text-sm font-medium">Set Goals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TLPerformancePage;