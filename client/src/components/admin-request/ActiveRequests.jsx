import React from "react";
import { Clock, User, ChevronDown, FileText } from "lucide-react";
import { DateTime } from "luxon";

const ActiveRequests = ({
  requests,
  isLoading,
  setSelectedRequest,
}) => {
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
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Active Requests
          </h3>
        </div>
        <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {requests.length} Active
        </span>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
          {requests.map((req) => (
            <div
              key={`${req._id}-${req.requestType}`}
              onClick={() => setSelectedRequest(req)}
              className="cursor-pointer group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {req.requestType} Request
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="text-xs text-gray-500">
                        Filed: {formatDisplayDate(req.date)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  Agent:{" "}
                  <span className="font-medium">{req.agentName}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  Supervisor:{" "}
                  <span className="font-medium">{req.supervisor}</span>
                </p>

                <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border-l-4 border-blue-500">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">
                        Start Time
                      </p>
                      <p className="text-sm text-blue-800">
                        {formatDisplayTime(req.startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">
                        End Time
                      </p>
                      <p className="text-sm text-blue-800">
                        {formatDisplayTime(req.endTime)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold">
                      Duration
                    </p>
                    <p className="text-sm text-blue-800 font-medium">
                      {req.duration}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">
                      Reason:
                    </span>{" "}
                    {req.reason}
                  </p>
                </div>

                {req.attachment && (
                  <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                    <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-800">
                        Attachment:
                      </span>
                      <span className="text-purple-700">
                        {req.attachment.name}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          {isLoading ? "Loading requests..." : "No active requests found."}
        </div>
      )}
    </div>
  );
};

export default ActiveRequests;