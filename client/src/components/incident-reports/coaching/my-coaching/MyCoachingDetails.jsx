import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";

const MyCoachingDetails = ({
  isViewMode,
  formData,
  onClose,
  onDelete,
  formatDisplayDate,
  handleInputChange,
  originalExplanation,
  originalActionPlan,
  handleSubmit,
  ackMessage,
  setAckMessage,
  handleAcknowledge,
  loggedUser,
  isUploading,
}) => {
  const [showAcknowledgeModal, setShowAcknowledgeModal] = React.useState(false);

  return (
    <div>
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Coaching Details
            </h3>
          </div>
          {isViewMode && (
            <button
              onClick={onClose}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {isViewMode ? (
          <div className="space-y-6">
            {/* Agent Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Agent Name
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                  {formData.agentName || "Unknown agent"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Coach Name
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                  {formData.coachName || "Unknown agent"}
                </p>
              </div>
            </div>
            {/* Category & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Date of Mistake
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                  <p className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formatDisplayDate(formData.dateOfMistake) || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Coaching Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                  <p className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formatDisplayDate(formData.coachingDate) || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            {/* Mistake */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Agent Mistake
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                {formData.coachingMistake || "No mistake"}
              </p>
            </div>

            {/* Evidence Section (Styled like HR Form) */}

            {formData.evidence.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Evidence
                </label>
                <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                  {formData.evidence.slice(0, 1).map((ev, idx) => {
                    const viewUrl = ev.url;
                    return (
                      <div key={idx} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
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
                            href={ev.url}
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
              </div>
            )}
            {formData.fileNTE && formData.fileNTE.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Notice to explain
                </label>
                <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                  {formData.fileNTE.slice(0, 1).map((nte, idx) => {
                    const viewUrl = nte.url;
                    return (
                      <div key={idx} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
                          <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                            {nte.fileName}
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
                            href={nte.url}
                            download={nte.fileName}
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
              </div>
            )}
            {[
              "Respondant Explained",
              "For Acknowledgement",
              "Acknowledged",
            ].includes(formData.status) && (
              <div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Explanation
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                    {formData.respondantExplanation || "No Explanation"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Action Plan
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                    {formData.actionPlan || "No Action Plan"}
                  </p>
                </div>
              </div>
            )}

            {formData.status === "Coaching Log" && (
              <div>
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
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Action Plan
                  </label>
                  <textarea
                    onChange={(e) =>
                      handleInputChange("actionPlan", e.target.value)
                    }
                    placeholder="Your action plan..."
                    className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl 
                h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 
                text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
                    disabled={!!originalActionPlan}
                    value={formData.actionPlan || ""}
                  />
                </div>
              </div>
            )}

            {formData.fileNDA &&
              formData.fileNDA.length > 0 &&
              formData.respondantId === loggedUser._id && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Notice of Disciplinary Action
                  </label>
                  <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                    {formData.fileNDA.slice(0, 1).map((nda, idx) => {
                      const viewUrl = nda.url;
                      return (
                        <div key={idx} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
                            <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                              {nda.fileName}
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
                              href={nda.url}
                              download={nda.fileName}
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
                </div>
              )}
            {formData.isAcknowledged === true && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Acknowledgement
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                  {formData.ackMessage || "No acknowledgement"}
                </p>
              </div>
            )}

            {formData.status === "Invalid" && (
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Invalid Reason
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                  {formData.invalidReason}
                </p>
              </div>
            )}

            {/* End of Evidence Section */}

            {/* Buttons */}
            <div className="flex gap-4">
              {formData.status === "Coaching Log" && (
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  {isUploading ? (
                    <>
                      <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              )}
              {formData.status === "For Acknowledgement" && (
                <button
                  onClick={() => setShowAcknowledgeModal(true)}
                  disabled={isUploading}
                  className="flex-1 bg-linear-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
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
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl hover:bg-gray-300 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Close
              </button>
              {formData.isReadByHR && (
                <button
                  onClick={onDelete}
                  disabled={isUploading}
                  className="flex-1 bg-linear-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {isUploading ? (
                    <>
                      <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            Select an offense from the list to view details.
          </div>
        )}
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
                disabled={!ackMessage.trim()}
                onClick={() => {
                  handleAcknowledge(ackMessage);
                  setShowAcknowledgeModal(false);
                }}
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoachingDetails;
