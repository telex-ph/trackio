import React from "react";
import { FileText, Search, Eye, Download, X as ClearIcon } from "lucide-react";

const HR_CaseHistory = ({
  offenses,
  filters,
  setFilters,
  onDateReset,
  isLoading,
  formatDisplayDate,
  base64ToBlobUrl,
  today,
}) => {
  return (
    <div className="rounded-md p-6 sm:p-8 border border-light">
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
          {offenses.length} Records
        </span>
      </div>

      {/* Filters for History */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search Bar */}
        <div className="md:col-span-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters.setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Date Filters */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters.setStartDate(e.target.value)}
            max={filters.endDate || today} // Cannot be after end date or today
            className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
            title="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters.setEndDate(e.target.value)}
            min={filters.startDate} // Cannot be before start date
            max={today} // Cannot be in the future
            className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
            title="End Date"
          />
          <button
            onClick={onDateReset}
            className="flex items-center justify-center gap-1 sm:col-start-3 p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!filters.startDate && !filters.endDate}
            title="Clear Dates"
          >
            <ClearIcon className="w-4 h-4" /> Clear Dates
          </button>
        </div>
      </div>

      {offenses.length > 0 ? (
        <div className="w-full overflow-x-auto overflow-y-auto max-h-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4 whitespace-nowrap">Offense Type</th>
                <th className="p-4 whitespace-nowrap">Level</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Action Taken</th>
                <th className="p-4 whitespace-nowrap">Evidence</th>
                <th className="p-4 whitespace-nowrap">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {offenses
                ?.filter((o) => o && o._id)
                .map((off) => (
                  <tr
                    key={off._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-600">
                      {formatDisplayDate(off.dateOfOffense)}
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

                    {/* Evidence Column with icons */}
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
                    {/* End of Evidence Column */}

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
            : filters.searchQuery || filters.startDate || filters.endDate // Check if any filter is active
            ? "No matching history records found for the selected filters."
            : "No resolved offense records found."}
        </div>
      )}
    </div>
  );
};

export default HR_CaseHistory;
