import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

const AgentCoaching = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const upcomingSessions = [
    { type: "Coaching", facilitator: "Team Leader", date: "23 Mar 2024", time: "12:45 PM", timeLeft: "12 Min Left", agenda: "Review ticket handling", status: "Scheduled" },
    { type: "Meeting", facilitator: "Team Leader", date: "23 Mar 2024", time: "12:45 PM", timeLeft: "20 Min Left", agenda: "Weekly progress update", status: "Scheduled" },
    { type: "Huddle", facilitator: "Team Leader", date: "23 Mar 2024", time: "12:45 PM", timeLeft: "35 Min Left", agenda: "Daily operational briefing", status: "Scheduled" },
    { type: "Coaching", facilitator: "Team Leader", date: "24 Mar 2024", time: "10:00 AM", timeLeft: "1 Hr Left", agenda: "Quality improvement session", status: "Scheduled" },
    { type: "Meeting", facilitator: "Team Leader", date: "24 Mar 2024", time: "11:00 AM", timeLeft: "1 Hr 30 Min Left", agenda: "Team alignment discussion", status: "Scheduled" },
    { type: "Huddle", facilitator: "Team Leader", date: "25 Mar 2024", time: "1:30 PM", timeLeft: "2 Hr Left", agenda: "Shift handover briefing", status: "Scheduled" },
    { type: "Coaching", facilitator: "Team Leader", date: "25 Mar 2024", time: "2:45 PM", timeLeft: "2 Hr 15 Min Left", agenda: "Handling escalations", status: "Scheduled" },
    { type: "Meeting", facilitator: "Team Leader", date: "26 Mar 2024", time: "9:00 AM", timeLeft: "3 Hr Left", agenda: "Project kickoff", status: "Scheduled" },
    { type: "Huddle", facilitator: "Team Leader", date: "26 Mar 2024", time: "3:15 PM", timeLeft: "4 Hr 15 Min Left", agenda: "Quick team sync", status: "Scheduled" },
  ];

  const sessionHistory = [
    { date: "August 8, 2025", facilitator: "Juana Dela Cruz", type: "Coaching", time: "3:00 P.M.", agenda: "Incorrect ticket handling", status: "Completed", remarks: "Missed escalation step – discussed proper escalation flow." },
    { date: "August 8, 2025", facilitator: "Juana Dela Cruz", type: "Meeting", time: "3:00 P.M.", agenda: "Recognition of employee achievements", status: "Cancelled", remarks: "-" },
    { date: "August 8, 2025", facilitator: "Juana Dela Cruz", type: "Huddle", time: "3:00 P.M.", agenda: "Common errors observed yesterday", status: "Completed", remarks: "Addressed urgent issues from previous shift and reinforced quality" },
    { date: "August 8, 2025", facilitator: "Juana Dela Cruz", type: "Meeting", time: "3:00 P.M.", agenda: "Attendance & adherence reminders", status: "Cancelled", remarks: "-" },
  ];

  const typeColors = {
    Coaching: "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800",
    Meeting: "bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800",
    Huddle: "bg-gradient-to-r from-green-200 to-green-300 text-green-800",
  };

  const typeAccents = {
    Coaching: "border-blue-300 bg-blue-50",
    Meeting: "border-purple-300 bg-purple-50",
    Huddle: "border-green-300 bg-green-50",
  };

  return (
    <div className="p-6 space-y-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">Meeting & Coaching</h2>
        <p className="text-sm text-gray-500">Updates will automatically reflect in the admin account.</p>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Upcoming Sessions</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 font-medium">Live Updates</span>
          </div>
        </div>

        <div className="relative flex items-center">
          <button 
            onClick={() => scroll("left")} 
            className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 z-10"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <div ref={scrollRef} className="flex-1 flex gap-6 overflow-x-auto scrollbar-hide px-4 py-2">
            {upcomingSessions.map((session, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-80 p-4 bg-white border-l-4 ${typeAccents[session.type]} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group`}
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative Corner Element */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-${session.type === 'Coaching' ? 'blue' : session.type === 'Meeting' ? 'purple' : 'green'}-100 to-transparent opacity-50 rounded-bl-full`}></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Top Row: Type & Time Left */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${typeColors[session.type]} shadow-md transform transition-all duration-300 group-hover:scale-105`}>
                      {session.type}
                    </span>
                    <span className="bg-gradient-to-r from-red-200 to-red-300 text-red-800 px-4 py-2 rounded-xl text-sm font-bold shadow-md animate-pulse">
                      {session.timeLeft}
                    </span>
                  </div>

                  {/* Middle Row: Session Info */}
                  <div className="mb-3 space-y-1">
                    <p className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">{session.type} Session</p>
                    <p className="text-sm text-gray-600 font-medium">Facilitator: {session.facilitator}</p>
                  </div>

                  {/* Date & Time with Enhanced Icons */}
                  <div className="flex gap-6 text-gray-700 text-sm mb-3">
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                      <Calendar size={16} className="text-blue-400" /> 
                      <span className="font-medium">{session.date}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
                      <Clock size={16} className="text-orange-400" /> 
                      <span className="font-medium">{session.time}</span>
                    </div>
                  </div>

                  {/* Agenda with Enhanced Styling */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl mb-4 border-l-2 border-gray-200">
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">Agenda:</span> 
                      <span className="text-gray-700 ml-1">{session.agenda}</span>
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                        session.status === "Completed" ? "bg-gradient-to-r from-green-200 to-green-300 text-green-800" :
                        session.status === "Cancelled" ? "bg-gradient-to-r from-red-200 to-red-300 text-red-800" :
                        "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>

                {/* Subtle Border Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll("right")} 
            className="p-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 z-10"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Session History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 border-separate border-spacing-y-1">
            <thead className="bg-gray-100 text-gray-700 font-semibold rounded-xl">
              <tr>
                {["DATE", "FACILITATOR", "TYPE", "TIME", "AGENDA", "STATUS", "REMARKS"].map((col) => (
                  <th key={col} className="px-3 py-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((row, i) => (
                <tr key={i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <td className="px-3 py-2">{row.date}</td>
                  <td className="px-3 py-2">{row.facilitator}</td>
                  <td className="px-3 py-2">{row.type}</td>
                  <td className="px-3 py-2">{row.time}</td>
                  <td className="px-3 py-2">{row.agenda}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
          <span>Showing 1–9 of 78</span>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border hover:bg-gray-100 transition flex items-center justify-center">‹</button>
            <button className="w-8 h-8 rounded-full border hover:bg-gray-100 transition flex items-center justify-center">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCoaching;