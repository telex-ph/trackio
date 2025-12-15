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
} from "lucide-react";
import { DateTime } from "luxon";
const PendingLeaveRequest = ({
  leaves,
  searchQuery,
  onSearchChange,
  onView,
  isLoading,
  formatDisplayDate,
  loggedUser,
  userMap,
}) => {
  const safeLeaves = Array.isArray(leaves)
    ? leaves.filter((leave) => leave && leave._id)
    : [];

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Leave Request List
          </h3>
        </div>
        <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {safeLeaves.length} Records
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

      {safeLeaves.length > 0 ? (
        <div
          className="space-y-4 overflow-y-auto max-h-210 pr-2"
          style={{ maxHeight: "30rem" }}
        >
          {safeLeaves.map((leave) => (
            <div
              key={leave._id}
              className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-linear-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                {/* Card Header Content */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                      {leave.offenseType}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      <span className="text-xs text-gray-500">
                        Date: {formatDisplayDate(leave.createdAt)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          {
                            "For approval":
                              "bg-yellow-100 text-yellow-800 border border-yellow-200",
                            "Approved by TL":
                              "bg-green-100 text-green-700 border border-green-200",
                            "Approved by HR":
                              "bg-emerald-100 text-emerald-700 border border-emerald-200",
                            "Rejected by TL":
                              "bg-red-100 text-red-700 border border-red-200",
                            "Rejected by HR":
                              "bg-rose-100 text-rose-700 border border-rose-200",
                          }[leave.status] ||
                          "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {leave.witnesses?.some((w) => w._id === loggedUser._id)
                          ? "You are a witness"
                          : leave.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {/* Card Body Content */}
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  Requester:{" "}
                  <span className="font-medium">
                    {" "}
                    {userMap[leave.createdById]
                      ? `${userMap[leave.createdById].firstName} ${
                          userMap[leave.createdById].lastName
                        }`
                      : "N/A"}
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                  Leave Type:{" "}
                  <span className="font-medium">
                    {" "}
                    {leave.leaveType ? leave.leaveType : "N/A"}
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => leave && leave._id && onView(leave)}
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
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

export default PendingLeaveRequest;
