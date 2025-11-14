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
  onFormChange,
  handleValid,
  rejectOffense,
  base64ToBlobUrl,
}) => {
  const [showValidModal, setShowValidModal] = React.useState(false);
  const [loading] = React.useState(false);

  const [showInvalidModal, setShowInvalidModal] = React.useState(false);
  const [invalidReason, setInvalidReason] = React.useState("");

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
          {/* Reporter  (Read-only) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Reporter
            </label>
            <p
              className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              title="Agent Name cannot be changed here."
            >
              {formData.reporterName}
            </p>
          </div>
          {/* Respondant (Read-only) */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Respondant
            </label>
            <p
              className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
              title="Agent Name cannot be changed here."
            >
              {formData.agentName}
            </p>
          </div>
          {/* Category & Level */}
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
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Offense Level
              </label>
              {/* This could be a <select> if you have predefined levels */}
              <input
                type="text"
                name="offenseLevel"
                value="Feature coming soon!"
                onChange={onFormChange}
                className={inputStyle}
                disabled={true}
              />
            </div>
          </div>
          {/* Date */}
          <div className="gap-4 sm:gap-6">
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
                  disabled={true}
                />
              </div>
            </div>
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
              disabled={true}
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
          {formData.status === "Invalid" ? (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Invalid Reason
              </label>
              <textarea
                name="remarks"
                value={formData.invalidReason || ""}
                onChange={onFormChange}
                className={`${inputStyle} h-32`}
                disabled={true}
              />
            </div>
          ) : null}
          {/* NEW Buttons */}
          {formData.status !== "NTE Sent" && formData.status !== "Invalid" ? (
            <div className="space-y-3 pt-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowValidModal(true)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 sm:p-4 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Valid
                </button>
                {showValidModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                          Send NTE Confirmation
                        </h2>
                        <button
                          onClick={() => setShowValidModal(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Body */}
                      <p className="text-gray-700 mb-6">
                        Are you sure you want to validate this offense and send
                        an NTE message to the respondent?
                      </p>

                      {/* Buttons */}
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                          onClick={() => setShowValidModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleValid}
                          disabled={loading}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {loading && (
                            <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                          )}
                          Send NTE
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowInvalidModal(true)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Invalid
                </button>
                {showInvalidModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                          Reason for Invalidation
                        </h2>
                        <button
                          onClick={() => setShowInvalidModal(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Textarea */}
                      <textarea
                        className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={4}
                        value={invalidReason}
                        onChange={(e) => setInvalidReason(e.target.value)}
                        placeholder="Provide reason for marking this offense as invalid"
                      />

                      {/* Buttons */}
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                          onClick={() => setShowInvalidModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                          onClick={() => {
                            if (!invalidReason.trim()) return;
                            rejectOffense(invalidReason);
                          }}
                          disabled={!invalidReason.trim()}
                        >
                          Mark as Invalid
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
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
