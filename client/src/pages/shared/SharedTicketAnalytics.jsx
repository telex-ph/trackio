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
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
            Shared Ticket Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-normal">
            Monitoring agent productivity and service quality metrics
          </p>
        </div>

{/* --- DATE FILTER CONTAINER --- */}
<div className="relative bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] rounded-[1.5rem] lg:rounded-[2rem] p-3 mb-12 border border-white/50">
  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
   
    {/* Header Section: Icon & Title */}
    <div className="flex items-center px-2 lg:pl-4 lg:pr-6 border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0">
      <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-[#800000] shadow-inner border border-slate-100 flex-shrink-0">
        <Calendar size={18} strokeWidth={1.5} />
      </div>
      <div className="ml-4">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-0.5">Range</p>
        <p className="text-[14px] font-medium text-slate-800">Data Filter</p>
      </div>
     
      {/* Mobile Live Sync Indicator */}
      <div className="ml-auto lg:hidden flex flex-col items-end">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-medium text-emerald-600 uppercase">Live</span>
        </div>
      </div>
    </div>

    {/* Main Controls Wrapper */}
    <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 flex-grow bg-slate-50/50 rounded-[1.5rem] p-4 lg:px-6 lg:py-2 border border-slate-100/50">
     
      {/* Date Inputs Group */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4 lg:gap-6">
        <div className="flex flex-col min-w-[100px] lg:min-w-[120px]">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight mb-0.5">Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-[13px] text-slate-700 outline-none cursor-pointer hover:text-[#800000] transition-colors font-normal w-full"
          />
        </div>
       
        <div className="w-6 h-[1px] bg-slate-200 flex-shrink-0"></div>

        <div className="flex flex-col min-w-[100px] lg:min-w-[120px]">
          <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight mb-0.5">End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-[13px] text-slate-700 outline-none cursor-pointer hover:text-[#800000] transition-colors font-normal w-full"
          />
        </div>
      </div>

      <div className="hidden lg:block w-[1px] h-8 bg-slate-200/60 mx-2"></div>

      {/* Quick Select Buttons - Scrollable on mobile */}
      <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
        {[
          { label: "Week", fn: getThisWeek },
          { label: "Month", fn: getThisMonth },
          { label: "Year", fn: getThisYear },
        ].map((btn) => {
          const { start, end } = btn.fn();
          const isActive = startDate === start && endDate === end;

          return (
            <button
              key={btn.label}
              onClick={() => {
                setStartDate(start);
                setEndDate(end);
                fetchAnalytics(start, end);
              }}
              className={`px-4 py-2 text-[11px] font-medium rounded-xl transition-all duration-300 active:scale-95 whitespace-nowrap
                ${isActive
                  ? 'bg-[#800000] text-white shadow-md shadow-red-900/20'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
            >
              {btn.label}
            </button>
          );
        })}
       
        <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0"></div>
       
        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            fetchAnalytics("", "");
          }}
          className={`px-4 py-2 text-[11px] font-medium rounded-xl transition-all duration-300 active:scale-95 whitespace-nowrap
            ${(startDate === "" && endDate === "")
              ? 'bg-[#800000] text-white shadow-md shadow-red-900/20'
              : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
        >
          All Tickets
        </button>
      </div>
    </div>

    {/* Desktop Status Info */}
    <div className="px-4 hidden xl:flex flex-col items-end flex-shrink-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-[9px] font-medium text-emerald-600 uppercase tracking-tighter">Live Sync</span>
      </div>
      <p className="text-[11px] font-normal text-slate-400 truncate max-w-[120px]">
        {appliedStartDate || 'Full'} → {appliedEndDate || 'History'}
      </p>
    </div>

    {/* Action Button */}
    <button
      onClick={handleApplyFilter}
      disabled={loading}
      className="w-full lg:w-auto h-12 lg:h-14 px-8 bg-[#800000] text-white rounded-xl lg:rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-[#600000] transition-all duration-500 shadow-[0_10px_20px_rgba(128,0,0,0.15)] active:scale-95 disabled:opacity-30 group"
    >
      <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">
        {loading ? "Updating..." : "Refresh Report"}
      </span>
      {!loading && (
        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
             <path d="M21 3v5h-5"/>
           </svg>
        </div>
      )}
    </button>
  </div>
</div>

{/* --- Performance Grid --- */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-gradient-to-br from-[#990000] via-[#800000] to-[#4a0000] rounded-[2rem] px-6 py-2 text-white shadow-2xl border border-white/10 flex flex-col justify-between h-[160px] relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50"></div>
    <div className="relative z-10 flex justify-between items-start pt-1">
      <div className="flex gap-1">
        <div className="w-2 h-3 bg-white rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.6)]"></div>
        <div className="w-2 h-3 bg-white/20 rounded-sm"></div>
      </div>
      <div className="text-white opacity-100">
        <Layers size={14} />
      </div>
    </div>
    <div className="relative z-10 text-center -mt-1">
      <h2 className="text-sm font-black tracking-tight leading-none text-white/90 mb-1.5 uppercase">TOTAL TICKETS</h2>
      <h3 className="text-7xl font-black tracking-tighter leading-none text-white drop-shadow-md">791</h3>
    </div>
    <div className="relative z-10 text-center pb-1.5 pt-1 border-t border-white/20">
      <p className="text-[8px] font-normal text-white/60 lowercase tracking-wide font-medium">overall system data logs</p>
    </div>
    <div className="absolute -right-8 -top-8 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-red-500/10 rounded-full blur-3xl"></div>
  </div>
  <div className="bg-white rounded-[2rem] px-6 py-2 text-slate-900 shadow-xl border border-slate-100 flex flex-col justify-between h-[160px] relative overflow-hidden group">
    <div className="relative z-10 flex justify-between items-start pt-1">
      <div className="flex gap-1">
        <div className="w-2 h-3 bg-[#ef4444] rounded-sm"></div>
        <div className="w-2 h-3 bg-[#ef4444]/20 rounded-sm"></div>
      </div>
      <div className="text-[#ef4444] opacity-100">
        <AlertTriangle size={14} />
      </div>
    </div>
    <div className="relative z-10 text-center -mt-1">
      <h2 className="text-sm font-black tracking-tight leading-none text-slate-800 mb-1.5 uppercase">OPEN TICKETS</h2>
      <h3 className="text-7xl font-black tracking-tighter leading-none text-[#ef4444]">{data.openTickets}</h3>
    </div>

    <div className="relative z-10 text-center pb-1.5 pt-1 border-t border-slate-100">
      <p className="text-[8px] font-normal text-slate-400 lowercase tracking-wide">active alerts requiring action</p>
    </div>
  </div>
  <div className="bg-white rounded-[2rem] px-6 py-2 text-slate-900 shadow-xl border border-slate-100 flex flex-col justify-between h-[160px] relative overflow-hidden group">
    <div className="relative z-10 flex justify-between items-start pt-1">
      <div className="flex gap-1">
        <div className="w-2 h-3 bg-[#10b981] rounded-sm"></div>
        <div className="w-2 h-3 bg-[#10b981]/20 rounded-sm"></div>
      </div>
      <div className="text-[#10b981] opacity-100">
        <CheckCircle size={14} />
      </div>
    </div>
    <div className="relative z-10 text-center -mt-1">
      <h2 className="text-sm font-black tracking-tight leading-none text-slate-800 mb-1.5 uppercase">RESOLVED TICKETS</h2>
      <h3 className="text-7xl font-black tracking-tighter leading-none text-[#10b981]">{data.resolvedTickets}</h3>
    </div>
    <div className="relative z-10 text-center pb-1.5 pt-1 border-t border-slate-100">
      <p className="text-[8px] font-normal text-slate-400 lowercase tracking-wide">successfully closed issues</p>
    </div>
  </div>
  <div className="bg-white rounded-[2rem] px-6 py-2 text-slate-900 shadow-xl border border-slate-100 flex flex-col justify-between h-[160px] relative overflow-hidden group">
    <div className="relative z-10 flex justify-between items-start pt-1">
      <div className="flex gap-1">
        <div className="w-2 h-3 bg-[#8b5cf6] rounded-sm"></div>
        <div className="w-2 h-3 bg-[#8b5cf6]/20 rounded-sm"></div>
      </div>
      <div className="text-[#8b5cf6] opacity-100">
        <CheckCircle size={14} />
      </div>
    </div>
    <div className="relative z-10 text-center -mt-1">
      <h2 className="text-sm font-black tracking-tight leading-none text-slate-800 mb-1.5 uppercase">COMPLETED</h2>
      <h3 className="text-7xl font-black tracking-tighter leading-none text-[#8b5cf6]">{data.completedTickets}</h3>
    </div>
    <div className="relative z-10 text-center pb-1.5 pt-1 border-t border-slate-100">
      <p className="text-[8px] font-normal text-slate-400 lowercase tracking-wide">finalized project milestone</p>
    </div>
  </div>
</div>  

    {/* Average Metrics & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-xl rounded-2xl p-7 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-red-600 text-white rounded-lg">
                <Clock size={20} />
              </div>
              <p className="text-lg font-bold text-slate-900">
                Key Performance Timings
              </p>
            </div>

            <div className="space-y-10">
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Average First Response
                    </p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                      {data.avgFirstResponse}
                    </p>
                  </div>
                  <div className="pb-1">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Optimal
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-md transition-all duration-1000"
                    style={{ width: '70%' }}
                  ></div>
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">
                      Average Resolution Time
                    </p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">
                      {data.avgResolution}
                    </p>
                  </div>
                  <div className="pb-1">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      Standard
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-slate-800 rounded-md transition-all duration-1000"
                    style={{ width: '55%' }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="absolute left-0 top-0 h-full w-1 bg-red-600"></div>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white shadow-xl rounded-2xl p-7 border border-slate-200 relative overflow-hidden flex flex-col">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#E02424]"></div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PieChartIcon size={34} className="p-2 bg-red-600 text-white rounded-lg" />
                Tickets by Category
              </h3>
              <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border border-slate-100">
                Distribution
              </span>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="relative h-[280px] w-full flex flex-col justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: '50px' }}>
                  <span className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                    {categoryChartData.reduce((acc, curr) => acc + curr.value, 0)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase mt-1">Total</span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      stroke="none"
                      labelLine={false}
                      /* Percentage labels - Bold and tight font */
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={TELEX_CHART_COLORS[index % TELEX_CHART_COLORS.length]}
                          className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                   
                    <Tooltip
                      content={typeof CustomTooltip !== 'undefined' ? <CustomTooltip /> : null}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />

                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      wrapperStyle={{
                        paddingTop: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#475569",
                        textTransform: "uppercase"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                <PieChartIcon size={40} className="mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase">No data found</p>
              </div>
            )}
          </div>
          </div>

{/* Assignee Bar Chart */}
<div className="lg:col-span-2 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-2xl p-8 border border-slate-100 relative overflow-hidden group">
 
  <div className="mb-8 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h3 className={`text-lg font-bold text-slate-900 flex items-center gap-3 ${TEXT_TELEX_DARK_GREY}`}>
        <div className="p-2 bg-red-600/10 text-red-600 rounded-lg">
          <BarChartIcon size={20} />
        </div>
        Ticket Distribution by Assignee
      </h3>
      <p className="text-[12px] font-normal text-slate-400 mt-1 ml-11">
        Visual breakdown of workload across all active team members
      </p>
    </div>
   
    {assigneeChartData.length > 0 && (
      <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-medium text-slate-400 uppercase tracking-tight">
        Total Agents: {assigneeChartData.length}
      </div>
    )}
  </div>

  {assigneeChartData.length > 0 ? (
    <>
      <div className="h-[320px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={assigneeChartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A30000" />
                <stop offset="100%" stopColor="#800000" />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={70}
              style={{ fontSize: "11px", fontWeight: 400, fontFamily: "sans-serif" }}
            />
            <YAxis
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toFixed(0)}
              style={{ fontSize: "11px", fontWeight: 400, fontFamily: "sans-serif" }}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc", radius: 6 }}
              formatter={(value) => [value, "Tickets"]}
              contentStyle={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                fontSize: "12px",
                fontWeight: 400,
              }}
            />
            <Bar
              dataKey="tickets"
              fill="url(#maroonGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- Ticket Distribution by Assignee --- */}
      <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col lg:flex-row gap-8 relative z-10">
        <div className="flex-1 flex gap-4">
          <div className="flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <span className="text-[#800000] text-[12px]">🏆</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Top Performer</span>
            </div>
            <p className="text-[15px] font-medium text-slate-800 truncate">
              {assigneeChartData.length > 0 ? [...assigneeChartData].sort((a,b) => b.tickets - a.tickets)[0]?.name : 'N/A'}
            </p>
          </div>
          <div className="flex-1 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <BarChartIcon size={14} />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">Average Load</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-medium text-slate-800">
                {(assigneeChartData.reduce((acc, curr) => acc + curr.tickets, 0) / (assigneeChartData.length || 1)).toFixed(1)}
              </p>
              <span className="text-[11px] text-slate-400 font-normal">Tickets</span>
            </div>
          </div>
        </div>
        <div className="lg:w-1/3 flex flex-col justify-center space-y-4 px-2">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight mb-1">Dashboard Legend</span>
         
          <div className="space-y-3">
            <div className="flex items-start gap-3 group/item">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-gradient-to-b from-[#A30000] to-[#800000] shrink-0"></div>
              <p className="text-[11px] font-normal text-slate-500 leading-tight group-hover/item:text-slate-700 transition-colors">
                Vertical bars represent active ticket volume per agent.
              </p>
            </div>
           
            <div className="flex items-start gap-3 group/item">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0"></div>
              <p className="text-[11px] font-normal text-slate-500 leading-tight group-hover/item:text-slate-700 transition-colors">
                Horizontal baseline represents neutral workload state.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="h-[320px] flex items-center justify-center text-slate-400 font-light italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
      No assignee data available for this period.
    </div>
  )}
</div>
</div>

{/* Assignee Performance*/}
      <div className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
              Assignee Performance
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Monitoring agent productivity and service quality metrics
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">Live Statistics</span>
          </div>
        </div>

        {assigneeChartData.length > 0 ? (
          <div className="space-y-3">
            <div className="hidden lg:grid grid-cols-5 px-8 py-3 text-sm font-medium text-slate-400">
              <div>Agent Name</div>
              <div>Ticket Load</div>
              <div>Customer Rating</div>
              <div>First Response</div>
              <div className="text-right">Resolution Time</div>
            </div>
            {assigneeChartData.map((assignee) => (
              <div
                key={assignee.name}
                className="bg-white border border-slate-100 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300 group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-red-50 transition-colors">
                      <span className="text-sm font-semibold text-[#800000]">
                        {assignee.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-800 group-hover:text-[#800000] transition-colors">
                        {assignee.name}
                      </p>
                      <p className="text-xs text-slate-400">Support Representative</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between lg:justify-start lg:gap-3">
                      <span className="text-sm font-medium text-slate-700">{assignee.tickets} Tickets</span>
                    </div>
                    <div className="w-full lg:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#800000] rounded-full"
                        style={{ width: `${Math.min((assignee.tickets / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <StarRating rating={assignee.avgRating} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Clock size={14} className="text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">
                      {assignee.avgFirstResponse}
                    </span>
                  </div>
                  <div className="text-left lg:text-right">
                    <span className="inline-block px-3 py-1 bg-slate-50 rounded-lg text-xs font-medium text-slate-500 border border-slate-100">
                      {assignee.avgResolution}
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-20 border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-medium">No performance data found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedTicketAnalytics;
