import React, { useState, useRef } from "react";
import { Calendar, Clock } from "lucide-react";

const TeamLeaderCoaching = () => {
  const sessions = [
    {
      id: "1",
      type: "COACHING",
      title: "You've been scheduled for coaching.",
      postedBy: "Facilitator Team Leader",
      date: "23 Mar 2024",
      time: "12:45 pm",
      status: "Scheduled",
    },
    {
      id: "2",
      type: "HUDDLE",
      title: "You've been scheduled for coaching.",
      postedBy: "Facilitator Team Leader",
      date: "23 Mar 2024",
      time: "12:45 pm",
      status: "Scheduled",
    },
    {
      id: "3",
      type: "COACHING",
      title: "Team meeting scheduled.",
      postedBy: "HR Department",
      date: "24 Mar 2024",
      time: "10:00 am",
      status: "Scheduled",
    },
    {
      id: "4",
      type: "HUDDLE",
      title: "Performance review session.",
      postedBy: "Facilitator Team Leader",
      date: "25 Mar 2024",
      time: "2:00 pm",
      status: "Scheduled",
    },
    {
      id: "5",
      type: "COACHING",
      title: "Training session planned.",
      postedBy: "Training Coordinator",
      date: "26 Mar 2024",
      time: "9:00 am",
      status: "Scheduled",
    },
    {
      id: "6",
      type: "HUDDLE",
      title: "Project update meeting.",
      postedBy: "Project Manager",
      date: "27 Mar 2024",
      time: "1:00 pm",
      status: "Scheduled",
    },
  ];

  // Convert to state para pwede ma-update
  const [sessionHistory, setSessionHistory] = useState([
    {
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Coaching",
      time: "3:00 P.M.",
      agenda: "Incorrect ticket handling",
      status: "Completed",
      remarks: "Missed escalation step – discussed proper escalation flow.",
    },
    {
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda: "Recognition of employee achievements",
      status: "Cancelled",
      remarks: "-",
    },
    {
      date: "August 7, 2025",
      facilitator: "Maria Santos",
      type: "Coaching",
      time: "10:00 A.M.",
      agenda: "Customer service training",
      status: "Completed",
      remarks: "Improved response time – great progress.",
    },
    {
      date: "August 7, 2025",
      facilitator: "Maria Santos",
      type: "Huddle",
      time: "2:00 P.M.",
      agenda: "Team coordination",
      status: "Completed",
      remarks: "Successful team alignment.",
    },
    {
      date: "August 6, 2025",
      facilitator: "Pedro Garcia",
      type: "Coaching",
      time: "11:00 A.M.",
      agenda: "Error handling",
      status: "Cancelled",
      remarks: "Rescheduled due to conflict.",
    },
    {
      date: "August 6, 2025",
      facilitator: "Pedro Garcia",
      type: "Huddle",
      time: "1:00 P.M.",
      agenda: "Project status",
      status: "Completed",
      remarks: "On track – no issues.",
    },
    {
      date: "August 5, 2025",
      facilitator: "Ana Lopez",
      type: "Coaching",
      time: "9:00 A.M.",
      agenda: "Sales techniques",
      status: "Completed",
      remarks: "Excellent performance boost.",
    },
    {
      date: "August 5, 2025",
      facilitator: "Ana Lopez",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda: "Budget review",
      status: "Cancelled",
      remarks: "-",
    },
    {
      date: "August 4, 2025",
      facilitator: "Juan Reyes",
      type: "Coaching",
      time: "10:30 A.M.",
      agenda: "Technical skills",
      status: "Completed",
      remarks: "Improved coding skills.",
    },
    {
      date: "August 4, 2025",
      facilitator: "Juan Reyes",
      type: "Huddle",
      time: "2:30 P.M.",
      agenda: "Team feedback",
      status: "Completed",
      remarks: "Positive feedback received.",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSession, setSelectedSession] = useState(null);
  const [remarkInput, setRemarkInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sessionHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sessionHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const openModal = (session) => setSelectedSession(session);
  const closeModal = () => {
    setSelectedSession(null);
    setRemarkInput("");
    setFileInput(null);
  };

  const handleUpdateSession = () => {
    if (!selectedSession) return;

    const updatedHistory = sessionHistory.map((session) =>
      session.date === selectedSession.date &&
      session.facilitator === selectedSession.facilitator &&
      session.type === selectedSession.type
        ? {
            ...session,
            remarks: remarkInput || session.remarks,
            attachment: fileInput ? fileInput.name : session.attachment,
          }
        : session
    );

    setSessionHistory(updatedHistory);
    closeModal();
  };

  const sessionsContainerRef = useRef(null);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Coaching & Huddle
        </h2>
        <p className="text-gray-600">
          All updates will be reflected on the admin profile.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Create Session */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Create New Session
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <select className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Session Type</option>
                <option>COACHING</option>
                <option>HUDDLE</option>
              </select>
              <input
                type="date"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="time"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <select className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option>Employee(s) Involved</option>
                <option>Employee 1</option>
                <option>Employee 2</option>
              </select>
              <input
                type="text"
                placeholder="Facilitator"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <textarea
              placeholder="Agenda"
              className="w-full p-3 border rounded-lg h-55 focus:ring-2 focus:ring-indigo-500"
            ></textarea>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md">
              Create
            </button>
          </div>
        </div>

        {/* Session List */}
        <div
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
          ref={sessionsContainerRef}
        >
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Upcoming Sessions
          </h3>
          <div className="space-y-6 overflow-y-auto h-[400px] pr-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-6 rounded-xl shadow-md transition hover:scale-[1.01] ${
                  session.type === "COACHING"
                    ? "bg-red-50 border border-red-100"
                    : "bg-green-50 border border-green-100"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-medium">{session.type}</h4>
                  <span className="text-sm text-gray-500">12 Min Left</span>
                </div>
                <p className="text-gray-700">{session.title}</p>
                <p className="text-gray-600 text-sm">
                  Posted by: {session.postedBy}
                </p>
                <div className="flex gap-4 text-sm text-gray-700 mt-4">
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-2" /> {session.date}
                  </span>
                  <span className="flex items-center">
                    <Clock size={16} className="mr-2" /> {session.time}
                  </span>
                </div>
                <button className="mt-4 w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          Session History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-md text-left text-gray-700 border-separate border-spacing-y-2">
            <thead className="bg-gray-100 text-gray-800 font-semibold rounded-lg">
              <tr>
                {[
                  "DATE",
                  "FACILITATOR",
                  "TYPE",
                  "TIME",
                  "AGENDA",
                  "STATUS",
                  "REMARKS",
                  "ATTACHMENT",
                  "ACTION",
                ].map((col) => (
                  <th key={col} className="px-4 py-3">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, i) => (
                <tr
                  key={i}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3">{row.facilitator}</td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">{row.time}</td>
                  <td className="px-4 py-3">{row.agenda}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        row.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.remarks}</td>
                  <td className="px-4 py-3">
                    {row.attachment ? (
                      <a
                        href="#"
                        className="text-indigo-600 hover:underline"
                      >
                        {row.attachment}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-indigo-600 cursor-pointer hover:underline"
                      onClick={() => openModal(row)}
                    >
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 mx-1 rounded ${
                    currentPage === number
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  } hover:bg-indigo-700 hover:text-white transition`}
                >
                  {number}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedSession && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-8 rounded-2xl shadow-2xl w-1/3 transform transition-all scale-100 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Session Details
            </h3>
            <div className="space-y-4">
              <p><strong>Date:</strong> {selectedSession.date}</p>
              <p><strong>Facilitator:</strong> {selectedSession.facilitator}</p>
              <p><strong>Type:</strong> {selectedSession.type}</p>
              <p><strong>Time:</strong> {selectedSession.time}</p>
              <p><strong>Agenda:</strong> {selectedSession.agenda}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedSession.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {selectedSession.status}
                </span>
              </p>
              <p><strong>Remarks:</strong> {selectedSession.remarks}</p>
              {selectedSession.attachment && (
                <p>
                  <strong>Attachment:</strong>{" "}
                  <a href="#" className="text-indigo-600 hover:underline">
                    {selectedSession.attachment}
                  </a>
                </p>
              )}

              {/* Add remarks + file upload */}
              <textarea
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Add remarks..."
                className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="file"
                onChange={(e) => setFileInput(e.target.files[0])}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md"
                onClick={handleUpdateSession}
              >
                Save
              </button>
              <button
                className="flex-1 bg-gray-300 text-gray-800 p-3 rounded-lg hover:bg-gray-400 transition font-medium shadow-md"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeaderCoaching;