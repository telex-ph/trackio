import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";

const CoachingDetails = ({
  isViewMode,
  formData,
  onClose,
  onDelete,
  formatDisplayDate,
  isUploading,
  coachingRef,
  loggedUser,
  accountsMap,
}) => {
  const userAccounts = accountsMap[loggedUser._id]?.accounts || [];
  const accountName =
    userAccounts.length > 0 ? userAccounts[0].name : "No account";

  return (
    <div>
      {JSON.stringify(accountName)}
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
            <div className="flex items-center gap-2">
              {/* {["Invalid", "Acknowledged", "Archived"].includes(
                formData.status
              ) && (
                <button
                  onClick={() => exportAllFiles(formData)}
                  className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-200 transition"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )} */}
              <button
                onClick={onClose}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>

        {isViewMode ? (
          <div ref={coachingRef} className="space-y-6">
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
            {/* // ----------------------------- 
              // Export File UI //
            ----------------------------- */}
            <div
              id="coaching-pdf-export"
              style={{
                position: "absolute",
                left: "-9999px",
                top: "0",
                backgroundColor: "#fff",
                color: "#000",
                width: "800px",
                padding: "20px",
              }}
            >
              {/* 1. Header Logo */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <p className="text-sm font-extrabold text-black uppercase mb-1">
                    TELEX BUSINESS SUPPORT SERVICES INC.
                  </p>
                  <p className="text-sm text-gray-900 leading-tight">
                    Telex Building, Brgy. Cawayan Bugtong,
                    <br />
                    Guimba, Nueva Ecija 3115
                    <br />
                    044-950-4196
                  </p>
                </div>
                <div className="shrink-0">
                  <img
                    src="../../../public/telex-logo.png"
                    alt="TELEX Logo"
                    className="h-20 w-auto"
                  />
                </div>
              </div>

              {/* 2. Key Details */}
              <div className="border-t border-black divide-y divide-black">
                <div className="flex justify-between p-2 text-sm bg-gray-50 border-b border-black">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">📅</span>
                    <span className="font-bold">Date:</span>{" "}
                    {formData.coachingDate
                      ? new Date(formData.coachingDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </div>
                </div>

                <div className="flex justify-between p-2 text-sm border-b border-black">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">👤</span>
                    <span className="font-bold">Agent Name:</span>{" "}
                    {formData.agentName || "Unknown agent"}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">👥</span>
                    <span className="font-bold">Coach/Supervisor:</span>{" "}
                    {formData.coachName || "Unknown coach"}
                  </div>
                </div>

                <div className="p-2 text-sm border-b border-black">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500">🧑‍💻</span>
                    <span className="font-bold">Team Leader:</span>{" "}
                    {formData.teamLeaderName || "Unknown team leader"}
                  </div>
                </div>

                <div className="p-2 text-sm bg-gray-100 border-b border-black">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 text-lg">❌</span>
                    <span className="font-bold">Coaching Mistake:</span>{" "}
                    {formData.coachingMistake || "No mistake"}
                  </div>
                </div>
              </div>

              {/* 3. Feedback & Discussion */}
              <div className="border-t border-black divide-y divide-gray-300">
                <div className="font-bold p-2 bg-gray-200 border-b border-black">
                  Feedback & Discussion
                </div>

                <div className="p-2">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✅</span>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">
                        What the Agent Did:
                      </span>{" "}
                      Agent have used the 0271.1 refund confirmation
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2 mt-1">⚠️</span>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">
                        What the agent should have done:
                      </span>{" "}
                      Agent should have use 0271 version for refund.
                    </p>
                  </div>
                </div>

                <div className="p-2 border-b border-black">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">💬</span>
                    <p className="text-sm">
                      <span className="font-bold text-gray-800">
                        Agent's Response/Insight:
                      </span>{" "}
                      {formData.respondantExplanation || "No Explanation"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Action Plan & Next Steps */}
              <div className="bg-gray-100 p-2 text-sm">
                <span className="font-bold">Action Plan & Next Steps:</span>{" "}
                {formData.actionPlan || "No Action Plan"}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            Select an offense from the list to view details.
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachingDetails;
