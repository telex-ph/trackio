import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";

const OffenseDetails = ({
  isViewMode,
  formData,
  onClose,
  onDelete,
  formatDisplayDate,
  loggedUser,
  onFormChange,
  onAddEvidence,
  onSubmitEdit,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Offense Details
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
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Agent Name
            </label>
            <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
              {formData.agentName}
            </p>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Offense Category - always read-only */}
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

            {/* Date of Offense */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Date of Offense
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                {formData.status === "Pending Review" ? (
                  <input
                    type="date"
                    name="dateOfOffense"
                    value={formData.dateOfOffense}
                    onChange={onFormChange}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base"
                  />
                ) : (
                  <p className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formatDisplayDate(formData.dateOfOffense) || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Remarks
            </label>
            {formData.status === "Pending Review" ? (
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={onFormChange}
                className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto"
              />
            ) : (
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                {formData.remarks || "No remarks"}
              </p>
            )}
          </div>

          {/* Evidence Section */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Evidence
            </label>
            <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50 space-y-3">
              {formData.evidence.map((ev, idx) => {
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

              {/* Add new evidence if status is Pending Review */}
              {formData.status === "Pending Review" &&
                formData.evidence.length < 2 && (
                  <input
                    type="file"
                    name="newEvidence"
                    onChange={onAddEvidence}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                  />
                )}
            </div>
          </div>

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
            "Scheduled for hearing",
            "Respondant Explained",
            "MOM Uploaded",
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
          {(formData.fileMOM &&
            formData.fileMOM.length > 0 &&
            formData.respondantId?.some(
              (witness) => witness._id === loggedUser._id
            )) ||
            (formData.fileMOM &&
              formData.fileMOM.length > 0 &&
              formData.reportedById === loggedUser._id && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Minutes of the meeting
                  </label>
                  <div className="border-2 border-dashed rounded-2xl p-4 mb-4 border-blue-400 bg-blue-50">
                    {formData.fileMOM.slice(0, 1).map((mom, idx) => {
                      const viewUrl = mom.url;
                      return (
                        <div key={idx} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
                            <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                              {mom.fileName}
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
                              href={mom.url}
                              download={mom.fileName}
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
              ))}
          {(formData.fileNDA &&
            formData.fileNDA.length > 0 &&
            formData.witnesses?.some(
              (witness) => witness._id === loggedUser._id
            )) ||
            (formData.fileNDA &&
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
              ))}
          {formData.isAcknowledged && (
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
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl hover:bg-gray-300 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Close
            </button>
            {formData.status === "Pending Review" && (
              <button
                onClick={onSubmitEdit}
                className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4 rounded-2xl 
             hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-base sm:text-lg 
             shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Edit
              </button>
            )}
            {formData.status === "Pending Review" && (
              <button
                onClick={onDelete}
                className="flex-1 bg-linear-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Delete
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
  );
};

export default OffenseDetails;
