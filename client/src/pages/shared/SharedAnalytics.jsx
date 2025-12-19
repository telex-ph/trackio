import React, { useEffect, useState } from "react";
import api from "../../utils/axios";

export default function SharedAnalytics() {
  const [overallStats, setOverallStats] = useState(null);
  const [orgStats, setOrgStats] = useState([]);
  const [top3Stats, setTop3Stats] = useState([]);
  const [userAttendance, setUserAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, _setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAnalytics = async (
    sDate = startDate,
    eDate = endDate,
    f = filter
  ) => {
    setLoading(true);
    try {
      const params = {
        startDate: sDate || undefined,
        endDate: eDate || undefined,
        filter: f,
      };

      const overallRes = await api.get("/analytics/get-attendances-all", {
        params,
      });
      setOverallStats(overallRes.data.data);

      const orgRes = await api.get("/analytics/get-attendances-per-org", {
        params,
      });
      setOrgStats(orgRes.data.data);

      const top3Res = await api.get("/analytics/get-top-three", { params });
      setTop3Stats(top3Res.data.data);

      const usersRes = await api.get("/analytics/get-attendances-users", {
        params,
      });
      setUserAttendance(usersRes.data.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDateChange = async () => {
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
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading analytics...
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      {/* ===== Date Filter ===== */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <button
          onClick={handleDateChange}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* ===== Overall Stats ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overallStats && (
          <>
            <div className="p-4 border rounded shadow text-center bg-white">
              <h3 className="font-semibold mb-2">Total Expected</h3>
              <p className="text-xl">{overallStats.totalExpected}</p>
            </div>
            <div className="p-4 border rounded shadow text-center bg-white">
              <h3 className="font-semibold mb-2">Attendance</h3>
              <p className="text-xl">
                {overallStats.attendance.count} (
                {overallStats.attendance.percentage}%)
              </p>
            </div>
            <div className="p-4 border rounded shadow text-center bg-white">
              <h3 className="font-semibold mb-2">Late</h3>
              <p className="text-xl">
                {overallStats.late.count} ({overallStats.late.percentage}%)
              </p>
            </div>
            <div className="p-4 border rounded shadow text-center bg-white">
              <h3 className="font-semibold mb-2">Undertime</h3>
              <p className="text-xl">
                {overallStats.undertime.count} (
                {overallStats.undertime.percentage}%)
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Attendance per Organization ===== */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 mt-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Role Group</th>
              <th className="border p-2">Total Expected</th>
              <th className="border p-2">Attendance %</th>
              <th className="border p-2">Late %</th>
              <th className="border p-2">Undertime %</th>
              <th className="border p-2">Overbreak %</th>
            </tr>
          </thead>
          <tbody>
            {(orgStats || []).map((org, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">{org.roleGroup}</td>
                <td className="border p-2">{org.totalExpected}</td>
                <td className="border p-2">
                  {org.attendancePercentage.toFixed(2)}%
                </td>
                <td className="border p-2">{org.latePercentage.toFixed(2)}%</td>
                <td className="border p-2">
                  {org.undertimePercentage.toFixed(2)}%
                </td>
                <td className="border p-2">
                  {org.overBreakPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Top 3 Employees per Role ===== */}
      <div className="space-y-4 mt-6">
        {(top3Stats || []).map((roleGroup, idx) => (
          <div key={idx} className="p-4 border rounded bg-white shadow">
            <h3 className="font-semibold text-lg mb-2">
              {roleGroup.roleGroup.replace("_", " ")}
            </h3>
            <ul className="list-disc list-inside">
              {roleGroup.top3.map((emp) => (
                <li key={emp.userId}>
                  {emp.name} ({emp.role}) - Score: {emp.score}, Late: {emp.late}
                  , Undertime: {emp.undertime}, Overbreak: {emp.overBreak}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ===== User Attendance Search ===== */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded p-2 w-full md:w-64"
        />
      </div>

      {/* ===== User Attendance Table ===== */}
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">User Attendance Details</h2>
        <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Total Days</th>
              <th className="border p-2">Timed In</th>
              <th className="border p-2">Timed Out</th>
              <th className="border p-2">Late</th>
              <th className="border p-2">Undertime</th>
              <th className="border p-2">Overbreak</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">{user.total}</td>
                <td className="border p-2">{user.timedIn}</td>
                <td className="border p-2">{user.timedOut}</td>
                <td className="border p-2">{user.late}</td>
                <td className="border p-2">{user.undertime}</td>
                <td className="border p-2">{user.overBreak}</td>
              </tr>
            ))}
            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center p-2 text-gray-500">
                  No user attendance data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Pagination Controls ===== */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                currentPage === num ? "bg-blue-600 text-white" : ""
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
