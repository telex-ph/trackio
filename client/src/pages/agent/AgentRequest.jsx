import React, { useState } from "react";
import { Send, Filter } from "lucide-react";

const EmployeeRequest = () => {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    type: "Overtime",
    date: "",
    timeFrom: "",
    timeTo: "",
    leaveType: "",
    reason: "",
    newShift: "",
  });
  const [filter, setFilter] = useState("All");

  const requestTypes = ["Overtime", "Leave", "Schedule Change"];
  const leaveTypes = ["Vacation Leave", "Sick Leave", "Emergency Leave"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRequest({ ...newRequest, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setRequests([
      ...requests,
      {
        id: requests.length + 1,
        ...newRequest,
        status: "Pending",
        createdAt: new Date().toLocaleString(),
      },
    ]);
    setNewRequest({
      type: "Overtime",
      date: "",
      timeFrom: "",
      timeTo: "",
      leaveType: "",
      reason: "",
      newShift: "",
    });
  };

  const filteredRequests =
    filter === "All"
      ? requests
      : requests.filter((req) => req.type === filter);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Employee Requests
        </h2>
        <p className="text-gray-600">
          Fill out the form below to submit overtime, leave, or schedule change
          requests.
        </p>
      </div>

      {/* Request Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl p-6 space-y-4"
      >
        {/* Request Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request Type
          </label>
          <select
            name="type"
            value={newRequest.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
          >
            {requestTypes.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional Fields */}
        {newRequest.type === "Overtime" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={newRequest.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                <input
                  type="time"
                  name="timeFrom"
                  value={newRequest.timeFrom}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                <input
                  type="time"
                  name="timeTo"
                  value={newRequest.timeTo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {newRequest.type === "Leave" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                name="leaveType"
                value={newRequest.leaveType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((lt, i) => (
                  <option key={i} value={lt}>
                    {lt}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="timeFrom"
                  value={newRequest.timeFrom}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="timeTo"
                  value={newRequest.timeTo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {newRequest.type === "Schedule Change" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Change
              </label>
              <input
                type="date"
                name="date"
                value={newRequest.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested New Shift
              </label>
              <input
                type="text"
                name="newShift"
                value={newRequest.newShift}
                onChange={handleChange}
                placeholder="e.g. 1 PM - 10 PM"
                required
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason
          </label>
          <textarea
            name="reason"
            value={newRequest.reason}
            onChange={handleChange}
            required
            rows="3"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit
          </button>
        </div>
      </form>

      {/* Filter + Requests Table */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">My Requests</h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm"
          >
            <option value="All">All</option>
            {requestTypes.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No {filter !== "All" ? filter : ""} requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 border-separate border-spacing-y-3">
              <thead className="bg-gray-100 text-gray-800 font-bold rounded-2xl">
                <tr>
                  {["TYPE", "DETAILS", "REASON", "STATUS", "SUBMITTED"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-6 py-4 first:rounded-l-2xl last:rounded-r-2xl"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-lg transition"
                  >
                    <td className="px-6 py-4 font-medium">{req.type}</td>
                    <td className="px-6 py-4">
                      {req.type === "Overtime" &&
                        `${req.date} | ${req.timeFrom} - ${req.timeTo}`}
                      {req.type === "Leave" &&
                        `${req.leaveType} | ${req.timeFrom} to ${req.timeTo}`}
                      {req.type === "Schedule Change" &&
                        `${req.date} | New: ${req.newShift}`}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg text-sm font-medium bg-yellow-100 text-yellow-700">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {req.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeRequest;
