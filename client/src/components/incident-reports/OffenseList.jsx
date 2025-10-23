import React from "react";
import { DateTime } from "luxon";
import {
  Clock,
  User,
  ChevronDown,
  Search,
  CheckCircle,
  Bell,
  Hash,
  FileText,
  Eye, // Added
  Download, // Added
} from "lucide-react";

// --- NEW HELPER FUNCTION ---
// Converts Base64 data URL to a browser-readable Blob URL
// This fixes the "blank screen" issue when viewing PDFs
const base64ToBlobUrl = (base64, type) => {
  try {
    const base64Data = base64.split(",")[1];
    if (!base64Data) {
      console.error("Invalid Base64 string");
      return base64; // Fallback
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: type });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (e) {
    console.error("Failed to convert Base64 to Blob URL:", e);
    return base64; // Fallback
  }
};
// --- END OF HELPER FUNCTION ---

const OffenseList = ({
  offenses,
  searchQuery,
  setSearchQuery,
  isLoading,
  handleEdit,
  handleDeleteClick,
}) => {
  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const filteredOffenses = offenses.filter(
    (off) =>
      !["Action Taken", "Escalated", "Closed"].includes(off.status) &&
      [
        off.agentName,
        off.agentRole || "",
        off.offenseType,
        off.offenseCategory,
        off.offenseLevel || "",
        off.status,
        off.actionTaken,
        off.remarks || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
          {filteredOffenses.length} Records
        </span>
      </div>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by agent, role, level, type..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
          />
        </div>
      </div>
      {filteredOffenses.length > 0 ? (
        <div className="space-y-4 overflow-y-auto max-h-210 pr-2">
          {filteredOffenses.map((off) => (
            <div
              key={off._id}
              className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                {/* ... (No changes here) ... */}
              </div>
              <div className="space-y-3 mb-4">
                {/* ... (No changes in Agent, Category, Level, Action, Remarks) ... */}
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  Agent: <span className="font-medium">{off.agentName}</span>
                  {off.agentRole && (
                    <span className="text-gray-500 capitalize">
                      ({off.agentRole})
                    </span>
                  )}
                </p>
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
                
                {/* --- MODIFIED EVIDENCE SECTION --- */}
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
                {/* --- END OF MODIFIED SECTION --- */}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log("Delete button clicked for ID:", off._id);
                    if (typeof handleDeleteClick === "function") {
                      handleDeleteClick(off._id);
                    } else {
                      console.error(
                        "handleDeleteClick is not a function:",
                        handleDeleteClick
                      );
                    }
                  }}
                  className="flex-1 bg-white border-2 border-red-500 text-red-600 p-2 sm:p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(off)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  Edit
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

export default OffenseList;