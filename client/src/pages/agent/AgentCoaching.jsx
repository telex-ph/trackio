import React, { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  User,
  Bell,
  FileText,
  Eye,
  X,
} from "lucide-react";

const AgentCoaching = () => {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 5;

  const openModal = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSession(null);
    setIsModalOpen(false);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const upcomingSessions = [
    {
      id: 1,
      type: "Coaching",
      facilitator: "Team Leader",
      date: "23 Mar 2024",
      time: "12:45 PM",
      timeLeft: "12 Min Left",
      agenda:
        "Review ticket handling procedures and best practices for customer service excellence. Focus on escalation protocols, response time optimization, and quality metrics improvement.",
      status: "High Priority",
      description:
        "This coaching session will cover comprehensive ticket handling procedures including proper categorization, priority assessment, and escalation protocols. We'll review recent cases and identify areas for improvement in response time and quality metrics.",
      objectives: [
        "Improve ticket response time",
        "Master escalation procedures",
        "Enhance customer satisfaction scores",
      ],
      materials: [
        "Ticket handling guide",
        "Escalation flowchart",
        "Performance metrics dashboard",
      ],
    },
    {
      id: 2,
      type: "Meeting",
      facilitator: "Team Leader",
      date: "23 Mar 2024",
      time: "12:45 PM",
      timeLeft: "20 Min Left",
      agenda:
        "Weekly progress update and team performance review with focus on KPI achievements and upcoming targets for the next sprint.",
      status: "Low Priority",
      description:
        "Weekly team meeting to discuss progress on current objectives, review KPI performance, and set goals for the upcoming week. Team members will present their achievements and challenges.",
      objectives: [
        "Review weekly KPIs",
        "Discuss team challenges",
        "Plan upcoming week activities",
      ],
      materials: [
        "Performance dashboard",
        "Weekly report template",
        "Goal tracking sheet",
      ],
    },
    {
      id: 3,
      type: "Huddle",
      facilitator: "Team Leader",
      date: "23 Mar 2024",
      time: "12:45 PM",
      timeLeft: "35 Min Left",
      agenda:
        "Daily operational briefing covering shift updates, urgent issues, and quick team alignment for today's priorities and goals.",
      status: "High Priority",
      description:
        "Quick daily huddle to align team on today's priorities, address urgent issues from previous shift, and ensure everyone is updated on operational changes or important announcements.",
      objectives: [
        "Align on daily priorities",
        "Address urgent issues",
        "Share operational updates",
      ],
      materials: [
        "Daily briefing notes",
        "Shift handover report",
        "Priority task list",
      ],
    },
    {
      id: 4,
      type: "Coaching",
      facilitator: "Team Leader",
      date: "24 Mar 2024",
      time: "10:00 AM",
      timeLeft: "1 Hr Left",
      agenda:
        "Quality improvement session focusing on communication skills, customer interaction techniques, and service delivery excellence.",
      status: "Medium Priority",
      description:
        "Comprehensive quality improvement session designed to enhance communication skills and customer interaction techniques. We'll practice scenarios and review best practices for service delivery.",
      objectives: [
        "Improve communication skills",
        "Practice customer scenarios",
        "Enhance service quality",
      ],
      materials: [
        "Communication guide",
        "Role-play scenarios",
        "Quality checklist",
      ],
    },
  ];

  const sessionHistory = [
    {
      id: 1,
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Coaching",
      time: "3:00 P.M.",
      agenda:
        "Incorrect ticket handling procedures and escalation process review with focus on improvement areas and best practices implementation.",
      status: "Completed",
      remarks:
        "Missed escalation step – discussed proper escalation flow and provided additional training materials for reference.",
      description:
        "Detailed coaching session addressing incorrect ticket handling procedures observed in recent cases. Focused on proper escalation protocols and provided comprehensive training on best practices.",
      objectives: [
        "Correct ticket handling errors",
        "Master escalation flow",
        "Implement best practices",
      ],
      outcomes: [
        "Improved understanding of escalation",
        "Reduced handling errors",
        "Better process compliance",
      ],
      materials: [
        "Escalation guide",
        "Best practices manual",
        "Case study examples",
      ],
    },
    {
      id: 2,
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda:
        "Recognition of employee achievements, performance highlights, and celebration of team successes from the previous quarter.",
      status: "Cancelled",
      remarks: "-",
      description:
        "Planned recognition meeting to celebrate team achievements and outstanding performance from the previous quarter. Meeting was cancelled due to scheduling conflicts.",
      objectives: [
        "Recognize achievements",
        "Celebrate successes",
        "Boost team morale",
      ],
      outcomes: [],
      materials: [
        "Achievement certificates",
        "Performance reports",
        "Recognition presentation",
      ],
    },
    {
      id: 3,
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Huddle",
      time: "3:00 P.M.",
      agenda:
        "Common errors observed yesterday during shift operations, immediate corrective actions, and preventive measures discussion.",
      status: "Completed",
      remarks:
        "Addressed urgent issues from previous shift and reinforced quality standards across all team members for better performance.",
      description:
        "Emergency huddle to address critical errors from the previous shift. Discussed immediate corrective actions and implemented preventive measures to avoid similar issues.",
      objectives: [
        "Address critical errors",
        "Implement corrections",
        "Prevent future issues",
      ],
      outcomes: [
        "Reduced error rates",
        "Improved awareness",
        "Better preventive measures",
      ],
      materials: [
        "Error report",
        "Corrective action plan",
        "Prevention checklist",
      ],
    },
    {
      id: 4,
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda:
        "Attendance and adherence reminders, policy updates, and discussion on improving punctuality and schedule compliance.",
      status: "Cancelled",
      remarks: "-",
      description:
        "Scheduled meeting to discuss attendance policies and adherence requirements. Focus was on improving punctuality and schedule compliance across the team.",
      objectives: [
        "Review attendance policies",
        "Improve punctuality",
        "Ensure schedule compliance",
      ],
      outcomes: [],
      materials: [
        "Attendance policy",
        "Schedule templates",
        "Compliance guidelines",
      ],
    },
    {
      id: 5,
      date: "August 7, 2025",
      facilitator: "Maria Santos",
      type: "Coaching",
      time: "2:30 P.M.",
      agenda:
        "Customer service excellence training with emphasis on communication skills, empathy, and problem-solving techniques for better customer satisfaction.",
      status: "Completed",
      remarks:
        "Great improvement in communication skills and customer interaction approach. Employee showed excellent progress in applying new techniques.",
      description:
        "Comprehensive customer service excellence training focusing on advanced communication techniques, empathy building, and effective problem-solving strategies.",
      objectives: [
        "Enhance communication skills",
        "Build empathy",
        "Improve problem-solving",
      ],
      outcomes: [
        "Improved communication",
        "Better customer feedback",
        "Enhanced problem-solving",
      ],
      materials: [
        "Communication handbook",
        "Empathy exercises",
        "Problem-solving toolkit",
      ],
    },
    {
      id: 6,
      date: "August 7, 2025",
      facilitator: "John Doe",
      type: "Huddle",
      time: "1:00 P.M.",
      agenda:
        "New process implementation briefing, workflow changes, and team training on updated procedures and system requirements.",
      status: "Completed",
      remarks:
        "Successfully onboarded team on new workflow processes and ensured everyone understood the updated procedures and system changes.",
      description:
        "Implementation briefing for new workflow processes. Team was trained on updated procedures, system changes, and new requirements for optimal performance.",
      objectives: [
        "Implement new workflow",
        "Train on procedures",
        "Ensure system understanding",
      ],
      outcomes: [
        "Successful implementation",
        "Team alignment",
        "Improved workflow",
      ],
      materials: [
        "Process documentation",
        "Training materials",
        "System guides",
      ],
    },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sessionHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sessionHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const typeColors = {
    Coaching: "bg-blue-100 text-blue-700 border-blue-200",
    Meeting: "bg-purple-100 text-purple-700 border-purple-200",
    Huddle: "bg-green-100 text-green-700 border-green-200",
  };

  const typeIcons = {
    Coaching: Users,
    Meeting: FileText,
    Huddle: Bell,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-600";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Meeting and Coaching
        </h2>
        <p className="text-gray-600">
          Any updates will reflect on the admin account profile.
        </p>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Upcoming Sessions
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
            <span className="text-sm text-gray-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
              Live Updates
            </span>
          </div>
        </div>

        <div className="relative flex items-center">
          <button
            onClick={() => scroll("left")}
            className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 z-10 mr-4"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            ref={scrollRef}
            className="flex-1 flex gap-6 overflow-x-auto scrollbar-hide px-2 py-4"
          >
            {upcomingSessions.map((session, i) => {
              const IconComponent = typeIcons[session.type];
              return (
                <div
                  key={i}
                  className="flex-shrink-0 w-96 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden group p-6"
                >
                  {/* Header with Type and Time Left */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 ${
                          session.type === "Coaching"
                            ? "bg-blue-100"
                            : session.type === "Meeting"
                            ? "bg-purple-100"
                            : "bg-green-100"
                        } rounded-lg group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${
                            session.type === "Coaching"
                              ? "text-blue-600"
                              : session.type === "Meeting"
                              ? "text-purple-600"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                          typeColors[session.type]
                        } shadow-md`}
                      >
                        {session.type}
                      </span>
                    </div>
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg animate-pulse">
                      {session.timeLeft}
                    </span>
                  </div>

                  {/* Session Title */}
                  <div className="mb-4">
                    <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                      {session.type} Session
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Facilitator:{" "}
                      <span className="font-medium">{session.facilitator}</span>
                    </p>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-4 text-sm text-gray-700 mb-4">
                    <span className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      {session.date}
                    </span>
                    <span className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
                      <Clock className="w-4 h-4 text-gray-500" />
                      {session.time}
                    </span>
                  </div>

                  {/* Agenda Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-red-500 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">
                        Agenda:
                      </span>{" "}
                      {session.agenda.length > 50
                        ? session.agenda.substring(0, 50) + "..."
                        : session.agenda}
                    </p>
                  </div>

                  {/* Status and View Details */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                        session.status
                      )}`}
                    >
                      {session.status}
                    </span>
                    <button
                      onClick={() => openModal(session)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-500 hover:from-red-600 hover:to-red-600 text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 z-10 ml-4"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Session History</h3>
          <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {sessionHistory.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-md text-left text-gray-700 border-separate border-spacing-y-3">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold rounded-2xl">
              <tr>
                {[
                  "DATE",
                  "FACILITATOR",
                  "TYPE",
                  "TIME",
                  "AGENDA",
                  "STATUS",
                  "REMARKS",
                  "ACTION",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 first:rounded-l-2xl last:rounded-r-2xl"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, i) => (
                <tr
                  key={i}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <td className="px-6 py-4 rounded-l-2xl font-medium">
                    {row.date}
                  </td>
                  <td className="px-6 py-4">{row.facilitator}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                        typeColors[row.type]
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{row.time}</td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="truncate block">
                      {row.agenda.length > 30
                        ? row.agenda.substring(0, 30) + "..."
                        : row.agenda}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="truncate block">
                      {row.remarks.length > 20
                        ? row.remarks.substring(0, 20) + "..."
                        : row.remarks}
                    </span>
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl">
                    <button
                      onClick={() => openModal(row)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                      currentPage === number
                        ? "bg-gradient-to-r from-red-600 to-red-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-indigo-200"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex justify-between items-center mt-8 text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200">
          <span className="font-medium">
            Showing {indexOfFirstItem + 1}–
            {Math.min(indexOfLastItem, sessionHistory.length)} of{" "}
            {sessionHistory.length} records
          </span>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-xs">
                Completed:{" "}
                {sessionHistory.filter((s) => s.status === "Completed").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-xs">
                Cancelled:{" "}
                {sessionHistory.filter((s) => s.status === "Cancelled").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 ${
                    selectedSession.type === "Coaching"
                      ? "bg-blue-100"
                      : selectedSession.type === "Meeting"
                      ? "bg-purple-100"
                      : "bg-green-100"
                  } rounded-xl`}
                >
                  {(() => {
                    const IconComponent = typeIcons[selectedSession.type];
                    return (
                      <IconComponent
                        className={`w-6 h-6 ${
                          selectedSession.type === "Coaching"
                            ? "text-blue-600"
                            : selectedSession.type === "Meeting"
                            ? "text-purple-600"
                            : "text-green-600"
                        }`}
                      />
                    );
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedSession.type} Session Details
                  </h2>
                  <p className="text-gray-600">
                    Complete information about this session
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Session Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span
                          className={`px-3 py-1 rounded-lg font-medium border ${
                            typeColors[selectedSession.type]
                          }`}
                        >
                          {selectedSession.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Facilitator:</span>
                        <span className="font-medium">
                          {selectedSession.facilitator}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {selectedSession.date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {selectedSession.time}
                        </span>
                      </div>
                      {selectedSession.timeLeft && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Left:</span>
                          <span className="font-medium text-red-600">
                            {selectedSession.timeLeft}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(
                        selectedSession.status
                      )}`}
                    >
                      {selectedSession.status}
                    </span>
                    {selectedSession.remarks &&
                      selectedSession.remarks !== "-" && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 font-medium mb-1">
                            Remarks:
                          </p>
                          <p className="text-sm text-gray-700">
                            {selectedSession.remarks}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Full Agenda */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Complete Agenda
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedSession.agenda}
                </p>
              </div>

              {/* Materials */}
              {selectedSession.materials &&
                selectedSession.materials.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Materials & Resources
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedSession.materials.map((material, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 bg-white rounded-lg p-3 border border-purple-200"
                        >
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-700 text-sm">
                            {material}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCoaching;
