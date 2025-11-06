import React from "react";
import {
  Calendar,
  X,
  FileText,
  Eye,
  Download,
  Edit, // Changed from Eye
} from "lucide-react";

// Standard form field styling
const inputStyle =
  "w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base focus:border-indigo-500 focus:bg-white focus:outline-none transition-all duration-300";

const HR_OffenseDetails = ({
  isViewMode,
  formData,
  onClose,
  onFormChange, // NEW
  onUpdate, // NEW
  onEscalate, // NEW
  onReject, // NEW
  formatDisplayDate,
  base64ToBlobUrl,
}) => {
  return (
    <div className="rounded-md p-6 sm:p-8 border border-light">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isViewMode ? "Manage Offense" : "Offense Details"}
          </h3>
        </div>
        {isViewMode && (
          <button
            onClick={onClose} // This is "Cancel"
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {isViewMode ? (
        <div className="space-y-6">
          {/* Agent Name (Read-only) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Agent Name
            </label>
            <p
              className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              title="Agent Name cannot be changed here."
            >
              {formData.agentName}
            </p>
          </div>
          {/* Category & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Offense Category
              </label>
              {/* This could be a <select> if you have predefined categories */}
              <input
                type="text"
                name="offenseCategory"
                value={formData.offenseCategory || ""}
                onChange={onFormChange}
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Offense Type
              </label>
              {/* This could be a <select> if you have predefined types */}
              <input
                type="text"
                name="offenseType"
                value={formData.offenseType || ""}
                onChange={onFormChange}
                className={inputStyle}
              />
            </div>
          </div>
          {/* Level & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Offense Level
              </label>
              {/* This could be a <select> if you have predefined levels */}
              <input
                type="text"
                name="offenseLevel"
                value={formData.offenseLevel || ""}
                onChange={onFormChange}
                className={inputStyle}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Date of Offense
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                <input
                  type="date"
                  name="dateOfOffense"
                  // Format ISO string (e.g., "2025-10-30T10:00:00.000Z") to "2025-10-30"
                  value={
                    formData.dateOfOffense
                      ? formData.dateOfOffense.split("T")[0]
                      : ""
                  }
                  onChange={onFormChange}
                  className={`${inputStyle} pl-10 sm:pl-12`}
                />
              </div>
            </div>
          </div>
          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Status
            </label>
            <select
              name="status"
              value={formData.status || ""}
              onChange={onFormChange}
              className={inputStyle}
            >
              <option value="Pending Review">Pending Review</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Action Taken">Action Taken</option>
              <option value="Escalated">Escalated</option>
              <option value="Escalated to Compliance">
                Escalated to Compliance
              </option>
              <option value="Rejected">Rejected</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          {/* Action Taken */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Action Taken
            </label>
            <textarea
              name="actionTaken"
              value={formData.actionTaken || ""}
              onChange={onFormChange}
              className={`${inputStyle} h-24`}
              placeholder="Describe the action taken..."
            />
          </div>
          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={onFormChange}
              className={`${inputStyle} h-32`}
              placeholder="Add remarks (required for rejection)..."
            />
          </div>

          {/* Evidence Section (Still view-only) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Evidence
            </label>
            {formData.evidence && formData.evidence.length > 0 ? (
              <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                {formData.evidence.slice(0, 1).map((ev, idx) => {
                  const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                  return (
                    <div key={idx} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                        <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                          {ev.fileName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </a>
                        <a
                          href={ev.data}
                          download={ev.fileName}
                          className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-2xl p-4 border-gray-300 bg-gray-50/30">
                <p className="text-center text-gray-500 text-sm italic">
                  No evidence attached.
                </p>
              </div>
            )}
          </div>
          {/* End of Evidence Section */}

          {/* NEW Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onUpdate}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 sm:p-4 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Update
              </button>
              <button
                onClick={onEscalate}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 sm:p-4 rounded-2xl hover:from-yellow-600 hover:to-yellow-700 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Escalate to Compliance
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onReject}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Reject
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl hover:bg-gray-300 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          Select an offense from the list to manage details.
        </div>
      )}
    </div>
  );
};

export default HR_OffenseDetails;