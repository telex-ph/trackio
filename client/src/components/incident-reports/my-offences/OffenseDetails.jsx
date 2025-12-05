import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";

// Reusable file display component
const FileDisplay = ({ files, title }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
        {title}
      </label>
      <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
        {files.slice(0, 2).map((file, idx) => (
          <div key={idx} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
              <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                {file.fileName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
              >
                <Eye className="w-4 h-4" /> View
              </a>
              <a
                href={file.url}
                download={file.fileName}
                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OffenseDetails = ({
  isViewMode,
  resetForm,
  formData,
  formatDisplayDate,
  handleInputChange,
  originalExplanation,
  handleSubmit,
  ackMessage,
  setAckMessage,
  handleAcknowledge,
  loggedUser,
  isUploading,
}) => {
  const [showAcknowledgeModal, setShowAcknowledgeModal] = React.useState(false);

  if (!isViewMode) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Offense Details
          </h3>
        </div>
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          Select an offense from the list to view details.
        </div>
      </div>
    );
  }

  const isWitness = formData.witnesses?.some((w) => w._id === loggedUser._id);
  const showMom =
    formData.fileMOM?.length > 0 &&
    (isWitness ||
      formData.respondantId !== loggedUser._id ||
      formData.reportedById === loggedUser._id);

  const showNda =
    formData.fileNDA?.length > 0 &&
    (isWitness ||
      formData.respondantId === loggedUser._id ||
      formData.reportedById === loggedUser._id);

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Offense Details
            </h3>
          </div>
          <button
            onClick={resetForm}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Offense Info */}
        <div className="space-y-6">
          {/* Agent Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Reporter
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                {formData.reporterName}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Offense Category
              </label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-xl bg-gray-50 min-h-10">
                {Array.isArray(formData.offenseCategory) &&
                formData.offenseCategory.length > 0 ? (
                  formData.offenseCategory.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">
                    No category selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Level & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Offense Level
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                {formData.offenseLevel || "Coming Soon!"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Date of Offense
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                <p className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                  {formatDisplayDate(formData.dateOfOffense) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Remarks
            </label>
            <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
              {formData.remarks || "No remarks"}
            </p>
          </div>

          {/* Evidence */}
          <FileDisplay files={formData.evidence} title="Evidence" />

          {/* NTE */}
          <FileDisplay files={formData.fileNTE} title="Notice to Explain" />

          {/* Respondant Explanation */}
          {formData.fileNTE?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Explanation
              </label>
              <textarea
                onChange={(e) =>
                  handleInputChange("respondantExplanation", e.target.value)
                }
                placeholder="Your explanation..."
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl 
                h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 
                text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
                disabled={!!originalExplanation}
                value={formData.respondantExplanation || ""}
              />
            </div>
          )}

          {/* MOM */}
          {showMom && (
            <FileDisplay
              files={formData.fileMOM}
              title="Minutes of the Meeting"
            />
          )}

          {/* NDA */}
          {showNda && (
            <FileDisplay
              files={formData.fileNDA}
              title="Notice of Disciplinary Action"
            />
          )}

          {/* Acknowledgement */}
          {formData.status === "Acknowledged" && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Acknowledgement
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                {formData.ackMessage || "No acknowledgement"}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            {formData.status === "NTE" && (
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                {isUploading ? (
                  <>
                    <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                    Submiting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            )}
            {formData.status === "For Acknowledgement" && !isWitness && (
              <button
                onClick={() => setShowAcknowledgeModal(true)}
                className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                Acknowledge
              </button>
            )}
          </div>
        </div>
      </div>

      {showAcknowledgeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Acknowledge Action
              </h2>
              <button
                onClick={() => setShowAcknowledgeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message */}
            <p className="text-gray-700 mb-4">
              Please provide a message or note as part of your acknowledgement.
            </p>

            {/* Textarea */}
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              value={ackMessage}
              onChange={(e) => setAckMessage(e.target.value)}
              placeholder="Enter your acknowledgement message..."
            />

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                onClick={() => setShowAcknowledgeModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isUploading}
                onClick={() => handleAcknowledge(ackMessage)}
              >
                {isUploading ? (
                  <>
                    <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                    Acknowledging...
                  </>
                ) : (
                  "Acknowledge"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffenseDetails;
