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
    Coaching: "bg-blue-100 text-blue-700",
    Meeting: "bg-purple-100 text-purple-700",
    Huddle: "bg-green-100 text-green-700",
  };

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-1">Meeting & Coaching</h2>
        <p className="text-sm text-gray-500">Updates will automatically reflect in the admin account.</p>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">Upcoming Sessions</h3>

        <div className="relative flex items-center">
          <button onClick={() => scroll("left")} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ChevronLeft size={24} />
          </button>

          <div ref={scrollRef} className="flex-1 flex gap-5 overflow-x-auto scrollbar-hide px-2 py-1">
            {upcomingSessions.map((session, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 relative"
              >
                {/* Top Row: Type & Time Left */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[session.type]}`}>
                    {session.type}
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                    {session.timeLeft}
                  </span>
                </div>

                {/* Middle Row: Session Info */}
                <div className="mb-3">
                  <p className="text-lg font-bold text-gray-900">{session.type} Session</p>
                  <p className="text-sm text-gray-500">Facilitator: {session.facilitator}</p>
                </div>

                {/* Date & Time */}
                <div className="flex gap-4 text-gray-600 text-sm mb-2">
                  <div className="flex items-center gap-1"><Calendar size={16} /> {session.date}</div>
                  <div className="flex items-center gap-1"><Clock size={16} /> {session.time}</div>
                </div>

                {/* Agenda */}
                <div className="text-gray-700 text-sm mb-3">
                  <p><span className="font-semibold">Agenda:</span> {session.agenda}</p>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === "Completed" ? "bg-green-100 text-green-700" :
                      session.status === "Cancelled" ? "bg-red-100 text-red-600" :
                      "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => scroll("right")} className="p-2 rounded-full hover:bg-gray-100 transition">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Session History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 border-separate border-spacing-y-2">
            <thead className="bg-gray-100 text-gray-700 font-semibold rounded-xl">
              <tr>
                {["DATE", "FACILITATOR", "TYPE", "TIME", "AGENDA", "STATUS", "REMARKS"].map((col) => (
                  <th key={col} className="px-4 py-3">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((row, i) => (
                <tr key={i} className="bg-white rounded-xl shadow-sm hover:shadow-md transition">
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.facilitator}</td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">{row.time}</td>
                  <td className="px-4 py-3">{row.agenda}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.remarks}</td>
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
