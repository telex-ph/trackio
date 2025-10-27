import React, { useState } from "react";
import { DateTime } from "luxon"; // Import DateTime
import { FileText, Eye, Download, Search, X as ClearIcon } from "lucide-react"; // Added ClearIcon

// Helper function (no changes)
const base64ToBlobUrl = (base64, type) => {
  try {
    const base64Data = base64.split(",")[1];
    if (!base64Data) return base64;
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    const blob = new Blob([bytes], { type: type });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Failed to convert Base64 to Blob URL:", e);
    return base64;
  }
};

const OffenseHistory = ({ offenses, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(""); // --- Added Start Date state ---
  const [endDate, setEndDate] = useState("");   // --- Added End Date state ---

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = DateTime.now().toISODate();

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const handleDateReset = () => {
    setStartDate("");
    setEndDate("");
  };

  const resolvedOffenses = offenses.filter((off) => {
    // Basic status filter
    const isResolved =
      off.status === "Action Taken" ||
      off.status === "Escalated" ||
      off.status === "Closed";
    if (!isResolved) return false;

    // Text search filter
    const textMatch = [
      off.agentName,
      off.offenseType,
      off.otherOffenseType || "", // <-- ADDED THIS FOR SEARCH
      off.offenseLevel || "",
      off.status,
      off.actionTaken,
      off.remarks || "",
      formatDisplayDate(off.dateOfOffense),
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (!textMatch) return false;

    // Date range filter using Luxon
    const offenseDate = DateTime.fromISO(off.dateOfOffense).startOf("day"); // Use startOf('day') for accurate comparison
    const start = startDate ? DateTime.fromISO(startDate).startOf("day") : null;
    const end = endDate ? DateTime.fromISO(endDate).startOf("day") : null;

    const isAfterStartDate = start ? offenseDate >= start : true;
    const isBeforeEndDate = end ? offenseDate <= end : true;

    return isAfterStartDate && isBeforeEndDate; // Return true only if all filters pass
  });

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        {/* Header (no changes) */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Case History
          </h3>
        </div>
        <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {resolvedOffenses.length} Records
        </span>
      </div>

      {/* --- ADDED FILTERS ROW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Bar */}
        <div className="md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Date Filters */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate || today} // Cannot be after end date or today
            className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
            title="Start Date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate} // Cannot be before start date
            max={today}       // Cannot be in the future
            className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
            title="End Date"
          />
           <button
             onClick={handleDateReset}
             className="flex items-center justify-center gap-1 sm:col-start-3 p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
             disabled={!startDate && !endDate}
             title="Clear Dates"
           >
             <ClearIcon className="w-4 h-4" /> Clear Dates
           </button>
        </div>
      </div>
      {/* --- END OF FILTERS ROW --- */}


      {resolvedOffenses.length > 0 ? (
        <div className="w-full overflow-x-auto overflow-y-auto max-h-200">
          <table className="w-full text-left border-collapse">
            <thead>
              {/* Table Headers (no changes) */}
              <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4 whitespace-nowrap">Agent</th>
                <th className="p-4 whitespace-nowrap">Offense Type</th>
                <th className="p-4 whitespace-nowrap">Level</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Action Taken</th>
                <th className="p-4 whitespace-nowrap">Evidence</th>
                <th className="p-4 whitespace-nowrap">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {resolvedOffenses.map((off) => (
                <tr
                  key={off._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {/* Table Data (evidence column already uses icons) */}
                  <td className="p-4 text-sm text-gray-600">
                    {formatDisplayDate(off.dateOfOffense)}
                  </td>
                  <td className="p-4 text-sm text-gray-800 font-medium">
                    {off.agentName}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {/* --- MODIFICATION: LOGIC FOR 'OTHER' --- */}
                    {off.offenseType === "Other"
                      ? off.otherOffenseType
                      : off.offenseType}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {off.offenseLevel || "N/A"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        off.status === "Closed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {off.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {off.actionTaken}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {off.evidence && off.evidence.length > 0 ? (
                      <div className="flex flex-col items-start gap-2">
                        {off.evidence.map((ev, idx) => {
                          const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2"
                            >
                              <span className="truncate" title={ev.fileName}>
                                {ev.fileName}
                              </span>
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <a
                                href={ev.data}
                                download={ev.fileName}
                                className="p-1 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {off.remarks || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          {isLoading
            ? "Loading history..."
            : searchQuery || startDate || endDate // Check if any filter is active
            ? "No matching history records found for the selected filters."
            : "No resolved offense records found."}
        </div>
      )}
    </div>
  );
};

export default OffenseHistory;