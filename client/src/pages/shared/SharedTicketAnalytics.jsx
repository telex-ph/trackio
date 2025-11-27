"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Star,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  User,
  Layers,
  Calendar, // Added Calendar icon for date filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import axios from "axios";

// --- TELEX BRANDING PALETTE ---
const TELEX_RED_PRIMARY = "#FF0B0B"; // Brightest red from the reference
const TELEX_RED_DARK_ACCENT = "#a10000"; // Darker red, close to 60020c
const TELEX_DARK_GREY = "#292929"; // Secondary dark grey
const TELEX_LIGHT_GREY_BG = "#f2f2f2"; // A very light grey for main background
const TELEX_WHITE = "#ffffff";

const TELEX_CHART_COLORS = [
  TELEX_RED_PRIMARY, // Primary Red
  "#007bff", // Blue
  "#28a745", // Green
  "#ffc107", // Yellow
  "#6f42c1", // Purple
  "#17a2b8", // Cyan
  "#dc3545", // Another Red
];

// Tailwind classes for easy reuse
const TEXT_TELEX_RED_PRIMARY = `text-[${TELEX_RED_PRIMARY}]`;
const FILL_TELEX_RED_PRIMARY = `fill-[${TELEX_RED_PRIMARY}]`;
const BORDER_TELEX_RED_PRIMARY = `border-[${TELEX_RED_PRIMARY}]`;
const BG_TELEX_RED_PRIMARY = `bg-[${TELEX_RED_PRIMARY}]`; // <-- ADD THIS LINE

const TEXT_TELEX_RED_DARK_ACCENT = `text-[${TELEX_RED_DARK_ACCENT}]`;
const BORDER_TELEX_RED_DARK_ACCENT = `border-[${TELEX_RED_DARK_ACCENT}]`;
const BG_TELEX_RED_DARK_ACCENT = `bg-[${TELEX_RED_DARK_ACCENT}]`;

const TEXT_TELEX_DARK_GREY = `text-[${TELEX_DARK_GREY}]`;
const BG_TELEX_LIGHT_GREY_BG = `bg-[${TELEX_LIGHT_GREY_BG}]`;

// Static Bearer Token
const bearerToken =
  "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47";

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// --- STAR RATING COMPONENT ---
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={16}
        className={
          i <= Math.round(rating)
            ? "text-yellow-400 fill-yellow-400" // Kept yellow for rating visibility
            : "text-gray-300"
        }
      />
    ))}
    <span className="text-sm font-medium text-gray-700 ml-1">
      {rating ? rating.toFixed(2) : "N/A"}
    </span>
  </div>
);

// --- SUMMARY CARD COMPONENT ---
const SummaryCard = ({ title, value, borderColor, icon: Icon, subText }) => {
  const iconColorClass = `text-[${borderColor}]`;
  return (
    <div
      className={`bg-white shadow-lg rounded-xl p-5 border-l-4 ${iconColorClass}`} // Use borderColor directly for border-left
      style={{ borderColor: borderColor }} // Apply actual hex color
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">
          {title}
        </p>
        {Icon && <Icon size={24} className={`opacity-80 ${iconColorClass}`} />}
      </div>
      <p className={`text-4xl font-extrabold mt-1 text-gray-900 `}>{value}</p>
      {subText && (
        <p className="text-xs text-gray-400 mt-2 font-poppins">{subText}</p>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const SharedTicketAnalytics = ({ email }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  ); // Default to 30 days ago
  const [endDate, setEndDate] = useState(formatDate(new Date())); // Default to today
  const [appliedStartDate, setAppliedStartDate] = useState(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState(endDate);

  const fetchAnalytics = useCallback(async (start, end) => {
    setLoading(true);
    try {
      // API endpoint from the original code
      const baseUrl = `https://ticketing-system-2u0k.onrender.com/api/ittickets/trackio/analytics/heyjena@telexph.com`;

      // Construct the URL with date range parameters
      const url =
        start && end ? `${baseUrl}?startDate=${start}&endDate=${end}` : baseUrl;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      setAnalytics(response.data.data);
      setAppliedStartDate(start || "All");
      setAppliedEndDate(end || "All");
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // On mount, fetch all tickets by default
    fetchAnalytics("", "");
  }, [email, fetchAnalytics]);

  // Re-fetch when the 'Apply' button is clicked (handled by handleApplyFilter)

  const handleApplyFilter = () => {
    fetchAnalytics(startDate, endDate);
  };

  // Get start and end of this week (Mon-Sun)
  const getThisWeek = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(now.getDate() - now.getDay() + 7);
    end.setHours(23, 59, 59, 999);
    return { start: formatDate(start), end: formatDate(end) };
  };

  // Get start and end of this month
  const getThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start: formatDate(start), end: formatDate(end) };
  };

  // Get start and end of this year
  const getThisYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start: formatDate(start), end: formatDate(end) };
  };

  if (loading && !analytics)
    // Show full loading screen only if no data has been fetched yet
    return (
      <div className={`p-6 ${BG_TELEX_LIGHT_GREY_BG} min-h-screen`}>
        <div className="text-center py-12 text-lg text-gray-500">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );

  if (!analytics && !loading)
    return (
      <div className={`p-6 ${BG_TELEX_LIGHT_GREY_BG} min-h-screen`}>
        <div className="text-center py-12 text-lg text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          Failed to load analytics data.
        </div>
      </div>
    );

  // Use a temporary object if analytics is null while loading new data
  const data = analytics || {
    totalTickets: "...",
    openTickets: "...",
    resolvedTickets: "...",
    completedTickets: "...",
    avgFirstResponse: "...",
    avgResolution: "...",
    ticketsByCategory: {},
    ticketsByAssignee: {},
  };

  const categoryChartData = Object.entries(data.ticketsByCategory).map(
    ([key, value]) => ({ name: key, value })
  );

  const assigneeChartData = Object.entries(data.ticketsByAssignee)
    .map(([name, stats]) => ({
      name,
      tickets: stats.ticketCount,
      avgRating: parseFloat(stats.avgRating),
      avgFirstResponse: stats.avgFirstResponse,
      avgResolution: stats.avgResolution,
    }))
    .sort((a, b) => b.tickets - a.tickets); // Sort by ticket count

  // Custom Tooltip for PieChart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pieData = payload[0].payload;
      return (
        <div
          className={`bg-white p-3 border border-gray-200 shadow-xl rounded-lg font-poppins`}
        >
          <p className="font-semibold text-gray-800">{pieData.name}</p>
          <p className="text-sm text-gray-600">
            Tickets: <span className="font-bold">{pieData.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage:{" "}
            <span className="font-bold">
              {(pieData.percent * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`p-8 ${BG_TELEX_LIGHT_GREY_BG} min-h-screen space-y-10 font-sans`}
    >
      <h1
        className={`text-4xl font-extrabold text-gray-900 border-b-4 ${BORDER_TELEX_RED_PRIMARY} pb-4 flex items-center gap-3 tracking-tight`}
      >
        <TrendingUp className={TEXT_TELEX_RED_PRIMARY} size={32} />
        Shared Ticket Analytics
      </h1>

      {/* --- Date Range Filter --- */}
      <div
        className="bg-white shadow-lg rounded-xl p-5 flex flex-wrap items-end gap-4 border-l-4"
        style={{ borderColor: TELEX_RED_PRIMARY }}
      >
        <Calendar size={24} className={TEXT_TELEX_RED_PRIMARY} />
        <h2 className={`text-lg font-bold ${TEXT_TELEX_DARK_GREY}`}>
          Filter Analytics by Date Range
        </h2>

        {/* Start Date */}
        <div className="flex flex-col flex-grow min-w-[150px]">
          <label
            htmlFor="startDate"
            className="text-xs font-medium text-gray-500 mb-1"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-400 transition duration-150"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col flex-grow min-w-[150px]">
          <label
            htmlFor="endDate"
            className="text-xs font-medium text-gray-500 mb-1"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-400 transition duration-150"
          />
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            onClick={() => {
              const { start, end } = getThisWeek();
              setStartDate(start);
              setEndDate(end);
              fetchAnalytics(start, end);
            }}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            This Week
          </button>
          <button
            onClick={() => {
              const { start, end } = getThisMonth();
              setStartDate(start);
              setEndDate(end);
              fetchAnalytics(start, end);
            }}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const { start, end } = getThisYear();
              setStartDate(start);
              setEndDate(end);
              fetchAnalytics(start, end);
            }}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            This Year
          </button>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
              fetchAnalytics("", "");
            }}
            className="px-3 py-1 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            All Tickets
          </button>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyFilter}
          style={{ backgroundColor: TELEX_RED_PRIMARY }}
          className="px-6 py-2 min-w-[120px] rounded-lg font-semibold text-white hover:bg-red-700 hover:scale-105 transition duration-150 ease-in-out disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Filter"}
        </button>

        {/* Applied Date Range Display */}
        <div className="ml-auto text-sm text-gray-600">
          <span className="font-bold">Data Range:</span> {appliedStartDate} to{" "}
          {appliedEndDate}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Tickets"
          value={data.totalTickets}
          borderColor={TELEX_DARK_GREY}
          icon={Layers}
        />
        <SummaryCard
          title="Open Tickets"
          value={data.openTickets}
          borderColor={TELEX_RED_PRIMARY} // Brighter red for open
          icon={AlertTriangle}
        />
        <SummaryCard
          title="Resolved Tickets"
          value={data.resolvedTickets}
          borderColor={TELEX_CHART_COLORS[2]} // Green from palette
          icon={CheckCircle}
        />
        <SummaryCard
          title="Completed Tickets"
          value={data.completedTickets}
          borderColor={TELEX_CHART_COLORS[4]} // Purple from palette
          icon={CheckCircle}
        />
      </div>

      {/* Average Metrics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Average Response / Resolution */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className={`bg-white shadow-xl rounded-xl p-6 border-t-4 ${BORDER_TELEX_RED_DARK_ACCENT}`}
            style={{ borderColor: TELEX_RED_DARK_ACCENT }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock size={24} className={TEXT_TELEX_RED_DARK_ACCENT} />
              <p className={`text-xl font-bold ${TEXT_TELEX_DARK_GREY}`}>
                Key Timings
              </p>
            </div>
            <div className="pt-2">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-poppins">
                Avg First Response
              </p>
              <p
                className={`text-3xl font-extrabold ${TEXT_TELEX_RED_PRIMARY} mt-1`}
              >
                {data.avgFirstResponse}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4">
              <p className="text-sm text-gray-500 uppercase tracking-wide font-poppins">
                Avg Resolution Time
              </p>
              <p
                className={`text-3xl font-extrabold ${TEXT_TELEX_RED_PRIMARY} mt-1`}
              >
                {data.avgResolution}
              </p>
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white shadow-xl rounded-xl p-6 border">
            <h2
              className={`text-xl font-bold mb-4 flex items-center gap-2 ${TEXT_TELEX_DARK_GREY}`}
            >
              <PieChartIcon size={24} className={TEXT_TELEX_RED_DARK_ACCENT} />
              Tickets by Category
            </h2>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    fill="#8884d8"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          TELEX_CHART_COLORS[index % TELEX_CHART_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{
                      paddingLeft: "20px",
                      fontSize: "12px",
                      fontFamily: "sans-serif",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No category data for this period.
              </div>
            )}
          </div>
        </div>

        {/* Assignee Bar Chart */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-xl p-6 border">
          <h2
            className={`text-xl font-bold mb-4 flex items-center gap-2 ${TEXT_TELEX_DARK_GREY}`}
          >
            <BarChartIcon size={24} className={TEXT_TELEX_RED_DARK_ACCENT} />
            Ticket Distribution by Assignee
          </h2>
          {assigneeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={assigneeChartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  stroke={TELEX_DARK_GREY}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-25} // Slightly steeper angle for labels
                  textAnchor="end"
                  height={70} // Increase height for angled labels
                  style={{ fontSize: "12px", fontFamily: "sans-serif" }}
                />
                <YAxis
                  stroke={TELEX_DARK_GREY}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toFixed(0)}
                  style={{ fontSize: "12px", fontFamily: "sans-serif" }}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  formatter={(value) => [value, "Tickets"]}
                  contentStyle={{
                    border: "none",
                    borderRadius: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    fontFamily: "sans-serif",
                  }}
                />
                <Bar
                  dataKey="tickets"
                  fill={TELEX_RED_PRIMARY} // Use primary red color
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No assignee data for this period.
            </div>
          )}
        </div>
      </div>

      {/* Assignee Performance Table */}
      <div className="bg-white shadow-xl rounded-xl p-6 border">
        <h2
          className={`text-xl font-bold mb-6 flex items-center gap-2 ${TEXT_TELEX_DARK_GREY} border-b-2 border-gray-200 pb-3`}
        >
          <User size={24} className={TEXT_TELEX_RED_DARK_ACCENT} />
          Assignee Performance Summary
        </h2>

        {assigneeChartData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className={`${BG_TELEX_RED_DARK_ACCENT} text-white uppercase tracking-wider font-semibold`}
                >
                  <th className="p-4 text-left rounded-tl-lg">Assignee</th>
                  <th className="p-4 text-left">Tickets</th>
                  <th className="p-4 text-left">Avg Rating</th>
                  <th className="p-4 text-left">Avg First Response</th>
                  <th className="p-4 text-left rounded-tr-lg">
                    Avg Resolution Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {assigneeChartData.map((assignee, index) => (
                  <tr
                    key={assignee.name}
                    className={`border-t border-gray-100 transition duration-150 ease-in-out ${
                      index % 2 === 0
                        ? "bg-white hover:bg-gray-50"
                        : `${BG_TELEX_LIGHT_GREY_BG} hover:bg-gray-100`
                    }`}
                  >
                    <td className={`p-4 font-medium ${TEXT_TELEX_DARK_GREY}`}>
                      {assignee.name}
                    </td>
                    <td className={`p-4 font-bold ${TEXT_TELEX_RED_PRIMARY}`}>
                      {assignee.tickets}
                    </td>
                    <td className="p-4">
                      <StarRating rating={assignee.avgRating} />
                    </td>
                    <td className="p-4 text-gray-600 font-poppins">
                      {assignee.avgFirstResponse}
                    </td>
                    <td className="p-4 text-gray-600 font-poppins">
                      {assignee.avgResolution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No assignee performance data for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedTicketAnalytics;
