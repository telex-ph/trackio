import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";
import { exportAllFiles } from "./exportPDF";

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
              {["Invalid", "Acknowledged", "Archived"].includes(
                formData.status
              ) && (
                <button
                  onClick={() => exportAllFiles(formData)}
                  className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-200 transition"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              )}
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
            {/* ----------------------------- 
              // Export File UI //
            ----------------------------- */}
            <div
              id="coaching-pdf-export"
              style={{
                position: "fixed",
                left: 0,
                top: "-10000px",
                width: "600px",
                boxSizing: "border-box",
                background: "#ffffff",
                color: "#000",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: 1.25,
                padding: "10px",
                borderRadius: "2px",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "6px",
                }}
              >
                <div style={{ lineHeight: 1.1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: "13px",
                      marginBottom: "2px",
                    }}
                  >
                    TELEX BUSINESS SUPPORT SERVICES INC.
                  </div>
                  <div style={{ margin: 0 }}>
                    Telex Building, Brgy. Cawayan Bugtong,
                    <br />
                    Guimba, Nueva Ecija 3115
                    <br />
                    044-950-4196
                  </div>
                </div>

                <div style={{ flexShrink: 0 }}>
                  <img
                    src="../../../public/telex-logo.png"
                    alt="TELEX Logo"
                    style={{ height: "48px", width: "auto", display: "block" }}
                  />
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #d0d0d0",
                  borderBottom: "1px solid #d0d0d0",
                  padding: "6px 0",
                }}
              >
                {[
                  {
                    icon: "📅",
                    label: "Date",
                    value: formData.coachingDate
                      ? new Date(formData.coachingDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : "N/A",
                  },
                  {
                    icon: "👤",
                    label: "Agent Name",
                    value: formData.agentName || "Unknown agent",
                  },
                  {
                    icon: "👥",
                    label: "Coach/Supervisor",
                    value: formData.coachName || "Unknown coach",
                  },
                  {
                    icon: "🧑‍💻",
                    label: "Team Leader",
                    value: formData.teamLeaderName || "Unknown team leader",
                  },
                  {
                    icon: "❌",
                    label: "Coaching Mistake",
                    value: formData.coachingMistake || "No mistake",
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "flex-start",
                      padding: i === 0 ? "4px 0 6px 0" : "2px 0",
                    }}
                  >
                    <span
                      style={{
                        lineHeight: 1,
                        fontSize: "13px",
                        display: "inline-block",
                        width: "18px",
                        textAlign: "left",
                        marginTop: "2px",
                      }}
                    >
                      {row.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong
                        style={{
                          marginRight: "6px",
                          display: "inline-block",
                          minWidth: "120px",
                        }}
                      >
                        {row.label}:
                      </strong>
                      <span>{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "6px",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                  Feedback & Discussion
                </div>

                {[
                  // {
                  //   color: "#e6ffed",
                  //   marker: "#34a853",
                  //   title: "What the Agent Did",
                  //   text: "Agent have used the 0271.1 refund confirmation",
                  // },
                  // {
                  //   color: "#fff9e6",
                  //   marker: "#fbbc04",
                  //   title: "What the agent should have done",
                  //   text: "Agent should have use 0271 version for refund.",
                  // },
                  {
                    color: "#f2f2f2",
                    marker: "#4285f4",
                    title: "Agent's Response/Insight",
                    text: formData.respondantExplanation || "No Explanation",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "8px",
                      padding: "6px 0",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "24px",
                        background: item.marker,
                        borderRadius: "2px",
                        marginTop: "2px",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                        {item.title}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action plan */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "6px 0",
                  borderTop: "1px solid #e6e6e6",
                }}
              >
                <strong>Action Plan & Next Steps:</strong>{" "}
                <span>{formData.actionPlan || "No Action Plan"}</span>
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
