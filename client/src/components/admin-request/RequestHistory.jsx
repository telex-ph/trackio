import React from "react";
import { Clock } from "lucide-react";
import { DateTime } from "luxon";

const RequestHistory = ({ requestHistory, isLoading }) => {
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = DateTime.fromISO(dateStr);
    return date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  };

  const formatDisplayTime = (isoDateStr) => {
    if (!isoDateStr) return "";
    const time = DateTime.fromISO(isoDateStr);
    return time.toLocaleString(DateTime.TIME_SIMPLE);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Clock className="w-6 h-6 text-gray-600" />
        </div>
        Request History
      </h3>
      {requestHistory && requestHistory.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Agent
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Type
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Start Time
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  End Time
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Duration
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Supervisor
                </th>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {requestHistory.map((req) => (
                <tr
                  key={`${req._id}-${req.requestType}`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-4 text-sm text-gray-600">
                    {formatDisplayDate(req.date)}
                  </td>
                  <td className="p-4 text-sm text-gray-800 font-medium">
                    {req.agentName}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {req.requestType}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {formatDisplayTime(req.startTime)}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {formatDisplayTime(req.endTime)}
                  </td>
                  <td className="p-4 text-sm text-gray-600 font-medium">
                    {req.duration}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : req.status === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {req.supervisor}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {req.remarks || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          {isLoading ? "Loading history..." : "No request history found."}
        </div>
      )}
    </div>
  );
};

export default RequestHistory;