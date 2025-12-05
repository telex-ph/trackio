import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";

const CoachingDetails = ({
  isViewMode,
  formData,
  onClose,
  onDelete,
  formatDisplayDate,
  handleUploadNDA,
  selectedNDAFile,
  setSelectedNDAFile,
  isDragOverNDA,
  setIsDragOverNDA,
  loggedUser,
  isUploading,
}) => {
  const [showNDAModal, setShowNDAModal] = React.useState(false);

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
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Explanation
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                  {formData.respondantExplanation || "No explanation"}
                </p>
              </div>
            )}
            {formData.fileNDA &&
              formData.fileNDA.length > 0 &&
              formData.reportedById === loggedUser._id && (
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
              {formData.status === "Respondant Explained" && (
                <button
                  onClick={() => setShowNDAModal(true)}
                  disabled={isUploading}
                  className="flex-1 bg-linear-to-r from-indigo-600 to-indigo-700 text-white p-3 sm:p-4 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {isUploading ? (
                    <>
                      <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                      Uploading...
                    </>
                  ) : (
                    "Send NDA"
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
      {/* ================= NDA Modal ================= */}
      {showNDAModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Upload NDA</h2>
              <button
                onClick={() => setShowNDAModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div
              className={`mb-4 mt-1 p-4 border-2 rounded-xl border-dashed text-center cursor-pointer transition-colors ${
                isDragOverNDA
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 bg-white"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOverNDA(true);
              }}
              onDragLeave={() => setIsDragOverNDA(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOverNDA(false);
                if (e.dataTransfer.files?.[0])
                  setSelectedNDAFile(e.dataTransfer.files[0]);
              }}
              onClick={() => document.getElementById("ndaFileInput")?.click()}
            >
              {selectedNDAFile ? (
                <p className="text-gray-700 text-sm">
                  Selected file: {selectedNDAFile.name}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">
                  Drag & drop or click to upload NDA
                </p>
              )}
              <input
                type="file"
                id="ndaFileInput"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={(e) =>
                  setSelectedNDAFile(e.target.files?.[0] || null)
                }
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                onClick={() => setShowNDAModal(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUploadNDA();
                  setShowNDAModal(false);
                }}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                    Uploading...
                  </>
                ) : (
                  "Send NDA"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachingDetails;
