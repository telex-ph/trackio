import React from "react";
import { DateTime } from "luxon";
import { FileText, Eye, Download } from "lucide-react";

// --- HELPER FUNCTION ---
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

const OffenseHistory = ({ offenses, isLoading }) => {
  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const resolvedOffenses = offenses.filter(
    (off) =>
      off.status === "Action Taken" ||
      off.status === "Escalated" ||
      off.status === "Closed"
  );

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
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
      {resolvedOffenses.length > 0 ? (
        <div className="w-full overflow-x-auto overflow-y-auto max-h-200">
          <table className="w-full text-left border-collapse">
            <thead>
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
                  <td className="p-4 text-sm text-gray-600">
                    {formatDisplayDate(off.dateOfOffense)}
                  </td>
                  <td className="p-4 text-sm text-gray-800 font-medium">
                    {off.agentName}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {off.offenseType}
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

                  {/* --- MODIFIED EVIDENCE COLUMN DATA --- */}
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
                              {/* File name as text */}
                              <span className="truncate" title={ev.fileName}>{ev.fileName}</span>
                              
                              {/* View icon button */}
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              
                              {/* Download icon button */}
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
                  {/* --- END OF MODIFIED SECTION --- */}

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
            : "No resolved offense records found."}
        </div>
      )}
    </div>
  );
};

export default OffenseHistory;