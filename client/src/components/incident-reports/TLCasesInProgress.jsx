import React from "react";
import {
  Clock,
  FileText,
  ChevronDown,
  CheckCircle,
  Bell,
  Search,
  Eye,
  Hash,
  Download,
} from "lucide-react";

const TLCasesInProgress = ({
  offenses,
  searchQuery,
  onSearchChange,
  onView,
  isLoading,
  formatDisplayDate,
  base64ToBlobUrl,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Cases In Progress
          </h3>
        </div>
        <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {offenses.length} Records
        </span>
      </div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by level, type, category..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
          />
        </div>
      </div>

      {offenses.length > 0 ? (
        <div className="space-y-4 overflow-y-auto max-h-210 pr-2">
          {offenses.map((off) => (
            <div
              key={off._id}
              className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                {/* Card Header Content */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                      {off.offenseType}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="text-xs text-gray-500">
                        Date: {formatDisplayDate(off.dateOfOffense)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          off.status === "Pending Review"
                            ? "bg-yellow-100 text-yellow-700"
                            : off.status === "Under Investigation"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {off.status}
                      </span>
                      {off.isRead ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="w-4 h-4" /> Read
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
                          <Bell className="w-4 h-4" /> Unread
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {/* Card Body Content */}
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  Category:{" "}
                  <span className="font-medium">{off.offenseCategory}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
                  Level:{" "}
                  <span className="font-medium">
                    {off.offenseLevel || "N/A"}
                  </span>
                </p>

                <div className="bg-red-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                  <p className="text-xs sm:text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">
                      Action Taken:
                    </span>{" "}
                    {off.actionTaken}
                  </p>
                </div>

                {off.remarks && (
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-gray-400">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">
                        Remarks:
                      </span>{" "}
                      {off.remarks}
                    </p>
                  </div>
                )}

                {off.evidence && off.evidence.length > 0 && (
                  <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                    <div className="text-xs sm:text-sm text-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-800">
                          Evidence:
                        </span>
                      </div>
                      {off.evidence.map((ev, idx) => {
                        const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 w-full p-2 bg-white border border-purple-100 rounded-lg mt-1"
                          >
                            <span className="text-purple-700 truncate text-xs font-medium">
                              {ev.fileName}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={ev.data}
                                download={ev.fileName}
                                className="p-1 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onView(off)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          {isLoading
            ? "Loading offenses..."
            : searchQuery
            ? "No matching offense records found."
            : "No offense records found."}
        </div>
      )}
    </div>
  );
};

export default TLCasesInProgress;