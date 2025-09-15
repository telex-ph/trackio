import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

const TLPerformancePage = () => {
  const [agentData, setAgentData] = useState([]);
  const [filters, setFilters] = useState("This Week");
  const [summary, setSummary] = useState({
    totalAgents: 0,
    present: 0,
    absent: 0,
    late: 0,
    overtime: 0,
  });

  useEffect(() => {
    // Mock agent data
    const agents = [
      { id: 1, name: "Alice", status: "Present", hoursWorked: 8, overtime: 1 },
      { id: 2, name: "Bob", status: "Late", hoursWorked: 7, overtime: 0 },
      { id: 3, name: "Charlie", status: "Absent", hoursWorked: 0, overtime: 0 },
      { id: 4, name: "David", status: "Present", hoursWorked: 8, overtime: 2 },
      { id: 5, name: "Eve", status: "Late", hoursWorked: 7, overtime: 1 },
      { id: 6, name: "Frank", status: "Present", hoursWorked: 8, overtime: 0 },
    ];

    // Calculate performance score (for demo)
    const agentsWithScore = agents.map((a) => {
      const attendanceScore =
        a.status === "Present" ? 50 : a.status === "Late" ? 25 : 0;
      const overtimeScore = Math.min(a.overtime * 5, 50);
      return { ...a, performance: attendanceScore + overtimeScore };
    });

    setAgentData(agentsWithScore);

    const totalAgents = agents.length;
    const present = agents.filter((a) => a.status === "Present").length;
    const absent = agents.filter((a) => a.status === "Absent").length;
    const late = agents.filter((a) => a.status === "Late").length;
    const overtime = agents.reduce((sum, a) => sum + a.overtime, 0);

    setSummary({ totalAgents, present, absent, late, overtime });
  }, []);

  // Top absents and lates
  const topAbsents = agentData.filter((a) => a.status === "Absent").slice(0, 3);
  const topLates = agentData.filter((a) => a.status === "Late").slice(0, 3);

  // Attendance trend chart
  const attendanceTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Present",
        data: [4, 5, 4, 5, 4],
        borderColor: "#22c55e",
        backgroundColor: "#22c55e33",
        tension: 0.3,
      },
      {
        label: "Absent",
        data: [1, 0, 1, 0, 1],
        borderColor: "#f87171",
        backgroundColor: "#f8717133",
        tension: 0.3,
      },
      {
        label: "Late",
        data: [1, 1, 0, 1, 0],
        borderColor: "#facc15",
        backgroundColor: "#facc1533",
        tension: 0.3,
      },
    ],
  };

  const topBottomPerformanceData = {
    labels: agentData.map((a) => a.name),
    datasets: [
      {
        label: "Performance Score",
        data: agentData.map((a) => a.performance),
        backgroundColor: agentData.map((a) =>
          a.performance >= 75
            ? "#22c55e"
            : a.performance >= 50
            ? "#facc15"
            : "#f87171"
        ),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
  };

  return (
    <div className="space-y-6 min-h-screen">
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Performance</h2>
        </div>
        <p className="text-light">Records of employees with late attendance.</p>
      </section>

      {/* Quick Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col items-center">
          <Users className="w-7 h-7 mb-2 text-indigo-500" />
          <span className="text-gray-500">Total Agents</span>
          <span className="font-bold text-xl">{summary.totalAgents}</span>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col items-center">
          <Clock className="w-7 h-7 mb-2 text-green-500" />
          <span className="text-gray-500">Present</span>
          <span className="font-bold text-xl">{summary.present}</span>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col items-center">
          <AlertCircle className="w-7 h-7 mb-2 text-red-500" />
          <span className="text-gray-500">Absent</span>
          <span className="font-bold text-xl">{summary.absent}</span>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col items-center">
          <Clock className="w-7 h-7 mb-2 text-yellow-500" />
          <span className="text-gray-500">Late</span>
          <span className="font-bold text-xl">{summary.late}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <span className="font-semibold">Filter:</span>
        <select
          className="p-2 border rounded-lg"
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
        >
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Top Absents and Lates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-lg">
          <h3 className="font-semibold text-lg mb-3">Top Absents</h3>
          {topAbsents.length ? (
            <ul className="list-disc pl-5 space-y-1">
              {topAbsents.map((a) => (
                <li key={a.id}>{a.name}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-400">No absents today</span>
          )}
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg">
          <h3 className="font-semibold text-lg mb-3">Top Lates</h3>
          {topLates.length ? (
            <ul className="list-disc pl-5 space-y-1">
              {topLates.map((a) => (
                <li key={a.id}>{a.name}</li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-400">No lates today</span>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-lg">
          <h3 className="font-semibold text-lg mb-3">Attendance Trend</h3>
          <Line data={attendanceTrendData} options={chartOptions} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-lg">
          <h3 className="font-semibold text-lg mb-3">Top/Bottom Performers</h3>
          <Bar data={topBottomPerformanceData} options={chartOptions} />
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white p-5 rounded-xl shadow-lg overflow-x-auto">
        <h3 className="font-semibold text-lg mb-3">Agent Performance Table</h3>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Hours Worked</th>
              <th className="p-2 text-left">Overtime</th>
              <th className="p-2 text-left">Performance (%)</th>
            </tr>
          </thead>
          <tbody>
            {agentData.map((a) => (
              <tr
                key={a.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  a.performance >= 75
                    ? "bg-green-50"
                    : a.performance >= 50
                    ? "bg-yellow-50"
                    : "bg-red-50"
                }`}
              >
                <td className="p-2">{a.id}</td>
                <td className="p-2">{a.name}</td>
                <td className="p-2">{a.status}</td>
                <td className="p-2">{a.hoursWorked}</td>
                <td className="p-2">{a.overtime}</td>
                <td className="p-2 font-bold">{a.performance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TLPerformancePage;
