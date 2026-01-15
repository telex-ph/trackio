import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  TrendingUp,
  Trophy,
  Medal,
  Award,
  Calendar,
} from "lucide-react";
import api from "../../utils/axios";

export default function SharedAnalytics() {
  const [overallStats, setOverallStats] = useState(null);
  const [orgStats, setOrgStats] = useState([]);
  const [top3Stats, setTop3Stats] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAnalytics = useCallback(async (sDate = startDate, eDate = endDate, f = filter) => {
    setLoading(true);
    try {
      const params = {
        startDate: sDate || undefined,
        endDate: eDate || undefined,
        filter: f,
      };

      const [overallRes, orgRes, top3Res, usersRes] = await Promise.all([
        api.get("/analytics/get-attendances-all", { params }),
        api.get("/analytics/get-attendances-per-org", { params }),
        api.get("/analytics/get-top-three", { params }),
        api.get("/analytics/get-attendances-users", { params })
      ]);

      setOverallStats(overallRes.data.data);
      setOrgStats(orgRes.data.data);
      setTop3Stats(top3Res.data.data);
      setUserAttendance(usersRes.data.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDateChange = () => {
    fetchAnalytics(startDate, endDate, filter);
    setCurrentPage(1);
  };

  const filteredUsers = userAttendance.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={18} className="text-yellow-500" />;
    if (index === 1) return <Medal size={18} className="text-slate-400" />;
    return <Award size={18} className="text-amber-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-sm font-medium text-gray-600">
        Loading system data...
      </div>
    );
  }

return (
    <div className="p-4 md:p-10 space-y-12 bg-[#fafafa] min-h-screen font-sans">
     
      {/* ===== ANALYTICS BANNER ===== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#800000] via-[#5a0000] to-[#3d0000] rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-[80px]"></div>

        <div className="flex flex-col md:flex-row items-center gap-6 z-10 w-full lg:w-3/5">
          <div className="relative group hidden md:block">
             <div className="absolute -inset-2 bg-white/10 rounded-full blur-lg"></div>
             <div className="relative z-20 w-24 h-24 bg-white/5 backdrop-blur-md rounded-full p-3 border border-white/10">
               <img
                src="https://illustrations.popsy.co/white/abstract-art-4.svg"
                alt="Analytics Illustration"
                className="w-full h-full object-contain drop-shadow-2xl"
               />
             </div>
          </div>
          <div className="text-center md:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
                <TrendingUp size={10} className="text-red-300" />
                <span className="text-[10px] font-medium uppercase text-red-100">Live Insights</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Analytics<span className="text-red-400">.</span>
            </h1>
            <p className="text-red-100/80 text-sm md:text-base font-normal max-w-md leading-snug">
              Transforming raw attendance data into <span className="text-white border-b border-red-400 font-medium">actionable intelligence</span>.
            </p>
          </div>
        </div>

        {/* Updated Filter Container: White BG, Thin/Regular Text */}
        <div className="relative z-10 w-full lg:w-auto">
          <div className="bg-white p-6 rounded-[1.5rem] shadow-2xl flex flex-col gap-5 min-w-[320px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[11px] font-normal uppercase text-gray-500 ml-1">Period Start</p>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#800000] transition-colors" size={14} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] w-full transition-all cursor-pointer font-normal"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-normal uppercase text-gray-500 ml-1">Period End</p>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#800000] transition-colors" size={14} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-gray-700 outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] w-full transition-all cursor-pointer font-normal"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleDateChange}
              className="w-full py-3 bg-[#800000] text-white font-medium rounded-xl hover:bg-[#600000] active:scale-95 transition-all text-xs uppercase shadow-md shadow-maroon-900/20"
            >
              Update Analytics
            </button>
          </div>
        </div>
      </div>

      {/* ===== ORGANIZATION STATISTICS ===== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#800000]"></div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 uppercase leading-none">Organization Statistics</h2>
            <p className="text-xs text-gray-500 font-normal mt-1">Performance analysis by designated role groups</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overallStats && (
            <>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Total Expected</p>
                    <h3 className="text-4xl font-bold text-slate-800 mt-1">{overallStats.totalExpected}</h3>
                  </div>
                  <div className="flex items-end gap-1 h-12 pt-2">
                    <div className="w-1.5 h-[40%] bg-slate-100 rounded-full"></div>
                    <div className="w-1.5 h-[70%] bg-slate-100 rounded-full"></div>
                    <div className="w-1.5 h-[90%] bg-slate-800 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600">
                    <Users size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Baseline Target</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Attendance</p>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-4xl font-bold text-slate-800">{overallStats.attendance.count}</h3>
                      <span className="text-xs font-bold text-emerald-600">+{overallStats.attendance.percentage}%</span>
                    </div>
                  </div>
                  <svg width="60" height="30" viewBox="0 0 60 30" className="text-emerald-500/30">
                    <path d="M0 25C10 25 15 5 25 15C35 25 45 5 60 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Check-ins</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#800000] text-[10px] font-bold uppercase">Late Arrivals</p>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-4xl font-bold text-slate-800">{overallStats.late.count}</h3>
                      <span className="text-xs font-bold text-[#800000] opacity-60">{overallStats.late.percentage}%</span>
                    </div>
                  </div>
                  <svg width="50" height="30" viewBox="0 0 50 30" className="text-[#80000020]">
                    <path d="M0 25 H10 V15 H25 V10 H40 V5 H50" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="p-1.5 bg-[#80000010] rounded-lg text-[#800000]">
                    <Clock size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Delay Index</span>
                </div>
              </div>

              <div className="bg-[#800000] rounded-3xl p-6 shadow-lg flex flex-col justify-between min-h-[160px] relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase">Undertime</p>
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="text-4xl font-bold text-white leading-none">{overallStats.undertime.count}</h3>
                      <div className="px-1.5 py-0.5 bg-white/20 rounded-md">
                        <span className="text-[10px] font-bold text-white">{overallStats.undertime.percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <svg width="70" height="35" viewBox="0 0 70 35" className="text-white/40">
                    <path d="M5 25 Q15 5 25 20 T45 15 T65 25" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="relative z-10 flex items-center gap-2 mt-4">
                  <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/20">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-white/50 uppercase">Variance Tracking</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== 1. ATTENDANCE ANALYTICS TABLE ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#800000]"></div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 uppercase leading-none">Attendance Analytics</h2>
            <p className="text-xs text-gray-500 font-normal mt-1">Real-time monitoring of expected vs actual attendance</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-600 uppercase">
                <th className="px-6 py-4 border-r border-gray-200">Role Group</th>
                <th className="px-6 py-4 text-center border-r border-gray-200">Total Expected</th>
                <th className="px-6 py-4 text-center border-r border-gray-200">Attendance %</th>
                <th className="px-6 py-4 text-center border-r border-gray-200">Late %</th>
                <th className="px-6 py-4 text-center">Overbreak %</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100">
              {(orgStats || []).map((org, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700 border-r border-gray-100">{org.roleGroup}</td>
                  <td className="px-6 py-4 text-center font-mono text-gray-600 border-r border-gray-100">{org.totalExpected}</td>
                  <td className="px-6 py-4 text-center font-bold text-[#800000] border-r border-gray-100">{org.attendancePercentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center text-gray-500 border-r border-gray-100">{org.latePercentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 text-center text-gray-500">{org.overBreakPercentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

 {/* ===== 2. PERFORMANCE LEADERBOARD ===== */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#800000]"></div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 uppercase leading-none">Performance Leaderboard</h2>
            <p className="text-xs text-gray-500 font-normal mt-1">Ranking of top performing employees by department</p>
          </div>
        </div>

        <div className="space-y-10">
          {(top3Stats || [])
            .filter(group => ["ADMIN_MANAGEMENT", "OPERATION_MANAGEMENT", "OPERATIONS"].includes(group.roleGroup))
            .sort((a, b) => {
                const order = { "OPERATIONS": 1, "ADMIN_MANAGEMENT": 2, "OPERATION_MANAGEMENT": 3 };
                return (order[a.roleGroup] || 99) - (order[b.roleGroup] || 99);
            })
            .map((roleGroup, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#800000] uppercase">
                    {roleGroup.roleGroup.replace("_", " ")}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Department Top 3</span>
                </div>
               
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-100/50">
                  {(roleGroup.top3 || []).map((emp, index) => (
                    <div key={emp.userId || index} className="flex flex-col border border-slate-200 rounded-2xl bg-white p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] relative">
                      <div className="absolute top-0 right-0 bg-[#800000] text-white px-3 py-1 rounded-bl-xl rounded-tr-2xl text-[10px] font-bold">
                        {emp.score} PTS
                      </div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                          {getRankIcon(index)}
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Rank #{index + 1}</span>
                          <h4 className="text-[13px] font-bold text-gray-800 uppercase truncate leading-tight">{emp.name}</h4>
                          <p className="text-[9px] font-bold text-[#800000] uppercase tracking-tighter">{emp.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Late</p>
                          <p className={`text-xs font-bold ${emp.late > 0 ? 'text-red-600' : 'text-gray-800'}`}>{emp.late}</p>
                        </div>
                        <div className="text-center border-x border-gray-100">
                          <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">U.Time</p>
                          <p className="text-xs font-bold text-gray-800">{emp.undertime}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">O.Break</p>
                          <p className="text-xs font-bold text-gray-800">{emp.overBreak}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ===== 3. USER ATTENDANCE DETAILS ===== */}
      <div className="w-full pb-20">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-1.5 h-8 bg-[#800000]"></div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 leading-tight">
                User Attendance Details
              </h2>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Detailed overview of employee work hours and punctuality
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/10 focus:border-[#800000] text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-bold text-[#800000] border-r border-gray-200 uppercase text-[10px]">User</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-[10px]">Email</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-[10px]">Role</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-center uppercase text-[10px]">Total Days</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-center uppercase text-[10px]">Timed In</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-center uppercase text-[10px]">Timed Out</th>
                  <th className="px-6 py-4 font-bold text-[#801B1B] text-center uppercase text-[10px] border-l border-gray-200">Late</th>
                  <th className="px-6 py-4 font-bold text-[#D97706] text-center uppercase text-[10px]">Undertime</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-center uppercase text-[10px] border-l border-gray-200">Overbreak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-3.5 font-bold text-gray-800 border-r border-gray-100 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase
                        ${user.role?.toLowerCase().includes('admin') ? 'border-[#801B1B] text-[#801B1B] bg-[#801B1B]/5' :
                          user.role?.toLowerCase().includes('engineer') ? 'border-blue-600 text-blue-600 bg-blue-50' :
                          'border-green-600 text-green-600 bg-green-50'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center text-gray-600 font-mono">{user.total}</td>
                    <td className="px-6 py-3.5 text-center text-gray-500">{user.timedIn}</td>
                    <td className="px-6 py-3.5 text-center text-gray-500">{user.timedOut}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-[#B91C1C] border-l border-gray-100">{user.late}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-[#D97706]">{user.undertime}</td>
                    <td className="px-6 py-3.5 text-center text-gray-600 border-l border-gray-100">{user.overBreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-bold text-[#800000] bg-white border border-[#800000] rounded-lg hover:bg-red-50 disabled:opacity-30 transition-colors"
            >
              Prev
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => goToPage(num)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border ${currentPage === num ? "bg-[#800000] text-white border-[#800000] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-[#800000]"}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-bold text-[#800000] bg-white border border-[#800000] rounded-lg hover:bg-red-50 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
