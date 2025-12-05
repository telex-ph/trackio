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
  User,
  Calendar,
  Users,
  Tag,
  MessageCircle,
} from "lucide-react";
import { DateTime } from "luxon";

const HR_CasesInProgress = ({
  offenses,
  searchQuery,
  onSearchChange,
  onView,
  isLoading,
  userMap,
}) => {
  const safeOffenses = Array.isArray(offenses)
    ? offenses.filter((o) => o && typeof o === "object" && o._id)
    : [];

  return (
    <div className="rounded-md p-6 sm:p-8 border border-light">
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
          {safeOffenses.length} Records
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

      {safeOffenses.length > 0 ? (
        <div className="space-y-4 overflow-y-auto max-h-210 pr-2">
          {safeOffenses.map((off) => {
            // -------------------------------
            // OVERDUE LOGIC (added)
            // -------------------------------
            const isOverdue =
              off.status === "Pending Review" &&
              (!off.fileNTE || off.fileNTE.length === 0) && // fileNTE does NOT exist
              Math.floor(
                DateTime.now()
                  .diff(DateTime.fromISO(off.createdAt), "days")
                  .as("days")
              ) >= 3;

            return (
              <div
                key={off._id}
                className={`relative group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
                ${
                  isOverdue
                    ? "bg-red-50 border-red-500 pulse-red" // 🔴 Card pulses
                    : "bg-linear-to-br from-white to-gray-50 border-gray-100"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
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
                          Date:{" "}
                          {DateTime.fromISO(off.createdAt).toLocaleString({
                            weekday: "short",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>

                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            {
                              "Pending Review":
                                "bg-amber-100 text-amber-700 border border-amber-200",
                              NTE: "bg-blue-100 text-blue-700 border border-blue-200",
                              Invalid:
                                "bg-red-100 text-red-700 border border-red-200",
                              "Respondant Explained":
                                "bg-purple-100 text-purple-700 border border-purple-200",
                              "Scheduled for hearing":
                                "bg-indigo-100 text-indigo-700 border border-indigo-200",
                              "After Hearing":
                                "bg-teal-100 text-teal-700 border border-teal-200",
                              Acknowledged:
                                "bg-green-100 text-green-700 border border-green-200",
                            }[off.status] ||
                            "bg-gray-100 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {off.status}
                        </span>

                        {/* -------------------------------
                            OVERDUE BADGE (added)
                        -------------------------------- */}
                        {isOverdue && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800 border border-red-300">
                            Overdue — Pending Review (3+ days)
                          </span>
                        )}

                        {(() => {
                          const status = off.status;

                          const statusReaderMap = {
                            "Pending Review": "isReadByHR",
                            "Respondant Explained": "isReadByHR",
                            Acknowledged: "isReadByHR",
                            NTE: "isReadByRespondant",
                            "Scheduled for hearing": "isReadByRespondant",
                            "After Hearing": "isReadByRespondant",
                            "For Acknowledgement": "isReadByRespondant",
                            Invalid: "isReadByReporter",
                          };

                          const readerKey = statusReaderMap[status];
                          const hasRead = readerKey ? off[readerKey] : null;

                          const labelMap = {
                            isReadByHR: {
                              read: "Read",
                              unread: "Unread",
                            },
                            isReadByRespondant: {
                              read: "Read by Respondant",
                              unread: "Unread by Respondant",
                            },
                            isReadByReporter: {
                              read: "Read by Reporter",
                              unread: "Unread by Reporter",
                            },
                          };

                          if (!readerKey) {
                            return (
                              <span className="flex items-center gap-1 text-gray-500 text-xs">
                                <Bell className="w-4 h-4" /> No Read Status
                              </span>
                            );
                          }

                          const label = hasRead
                            ? labelMap[readerKey].read
                            : labelMap[readerKey].unread;
                          const isUnread = !hasRead;

                          return (
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                isUnread
                                  ? "text-red-600 font-bold"
                                  : "text-green-600"
                              }`}
                            >
                              {isUnread ? (
                                <Bell className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              {label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BODY CONTENT (unchanged) */}
                <div className="space-y-3 mb-4">
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    Reporter:{" "}
                    <span className="font-medium">
                      {userMap[off.reportedById]
                        ? `${userMap[off.reportedById].firstName} ${
                            userMap[off.reportedById].lastName
                          }`
                        : "N/A"}
                    </span>
                  </p>

                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    Respondant:{" "}
                    <span className="font-medium">
                      {userMap[off.respondantId]
                        ? `${userMap[off.respondantId].firstName} ${
                            userMap[off.respondantId].lastName
                          }`
                        : "N/A"}
                    </span>
                  </p>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="font-medium">Category:</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(off.offenseCategory) &&
                        off.offenseCategory.map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs"
                          >
                            {cat}
                          </span>
                        ))}
                    </div>
                  </div>

                  {off.hearingDate && (
                    <div className="space-y-3 mb-4">
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        Hearing date:{" "}
                        <span className="font-medium">
                          {DateTime.fromISO(off.hearingDate).toLocaleString({
                            weekday: "short",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        Witnesses:{" "}
                        <span className="font-medium">
                          {off.witnesses?.length > 0
                            ? off.witnesses.map((w) => w.name).join(", ")
                            : "None"}
                        </span>
                      </p>
                    </div>
                  )}

                  {off.evidence?.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="font-semibold text-gray-800 text-sm">
                          Evidence:
                        </span>
                      </div>

                      <div className="space-y-2">
                        {off.evidence.map((ev, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 w-full p-2 bg-white border border-purple-100 rounded-lg"
                          >
                            <span className="text-purple-700 truncate text-xs font-medium">
                              {ev.fileName}
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </a>

                              <a
                                href={ev.url}
                                download={ev.fileName}
                                className="p-1 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => off && off._id && onView(off)}
                    className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
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

export default HR_CasesInProgress;
