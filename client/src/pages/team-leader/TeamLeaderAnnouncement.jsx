import React, { useState } from "react";
import { Calendar, Clock } from "lucide-react";

const TeamLeaderAnnouncement = () => {
  const announcements = [
    {
      id: "1",
      title: "Announcement #1",
      postedBy: "Facilitator Team",
      date: "23 Mar 2024",
      time: "12:45 pm",
      agenda: "You've been scheduled for coaching.",
      status: "Scheduled",
    },
    {
      id: "2",
      title: "Announcement #2",
      postedBy: "HR Department",
      date: "23 Mar 2024",
      time: "12:45 pm",
      agenda: "You've been scheduled for coaching.",
      status: "Scheduled",
    },
  ];

  const announcementHistory = [
    {
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Meeting",
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
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = announcementHistory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(announcementHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Announcements
        </h2>
        <p className="text-gray-600">
          Any updates will reflect on the admin account profile.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Create Announcement */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Create New Announcement
          </h3>
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Title of Announcement"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <div className="grid grid-cols-3 gap-6">
              <input
                type="date"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="time"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Posted By"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <input
              type="file"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <textarea
              placeholder="Agenda"
              className="w-full p-3 border rounded-lg h-36 focus:ring-2 focus:ring-indigo-500"
            ></textarea>
            <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md">
              Announce
            </button>
          </div>
        </div>

        {/* List of Announcements */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            List of Announcements
          </h3>
          <div className="space-y-6 overflow-y-auto h-[400px] pr-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-6 rounded-xl shadow-md transition hover:scale-[1.01] bg-blue-50 border border-blue-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-medium">{a.title}</h4>
                  <span className="text-sm text-gray-500">12 Min Ago</span>
                </div>
                <p className="text-gray-600 text-sm">Posted by: {a.postedBy}</p>
                <div className="flex gap-4 text-sm text-gray-700 mt-4">
                  <span className="flex items-center">
                    <Calendar size={16} className="mr-2" /> {a.date}
                  </span>
                  <span className="flex items-center">
                    <Clock size={16} className="mr-2" /> {a.time}
                  </span>
                </div>
                <p className="text-gray-700 mt-3">Agenda: {a.agenda}</p>
                <button className="mt-4 w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition">
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcement History */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          Announcement History
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
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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
    </div>
  );
};

export default TeamLeaderAnnouncement;
