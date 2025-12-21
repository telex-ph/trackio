import React from "react";
import { FileText, Search, Eye, Download, X as ClearIcon } from "lucide-react";

const CaseHistory = ({
  offenses,
  filters,
  setFilters,
  onDateReset,
  isLoading,
  formatDisplayDate,
  today,
  userMap,
  onView,
}) => {
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
                <th className="p-4 whitespace-nowrap">Date Created</th>
                <th className="p-4 whitespace-nowrap">Category</th>
                <th className="p-4 whitespace-nowrap">Respondant</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Action</th>
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
                      {off.offenseCategory}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {userMap[off.respondantId]
                        ? `${userMap[off.respondantId].firstName} ${
                            userMap[off.respondantId].lastName
                          }`
                        : "N/A"}
                    </td>
                    <td className="p-4">
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
                            "Findings sent":
                              "bg-cyan-100 text-cyan-700 border border-cyan-200",
                            "Escalated to Compliance":
                              "bg-orange-100 text-orange-700 border border-orange-200",
                          }[off.status] ||
                          "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {off.status}
                      </span>
                    </td>
                    {/* End of Evidence Column */}

                    <td className="p-4 text-sm text-gray-600">
                      <button
                        onClick={() => off && off._id && onView(off)}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        View
                      </button>
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

export default CaseHistory;
