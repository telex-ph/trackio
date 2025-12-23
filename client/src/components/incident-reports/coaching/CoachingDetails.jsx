import React from "react";
import { Calendar, X, FileText, Eye, Download } from "lucide-react";
import { exportAllFiles } from "./exportPDF";
import ExportCoachingPDF from "./ExportCoachingPDF";

const CoachingDetails = ({
  isViewMode,
  formData,
  onClose,
  onDelete,
  formatDisplayDate,
  isUploading,
  coachingRef,
}) => {
  return (
    <div>
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Coaching Details
            </h3>
          </div>

          {isViewMode && (
            <div className="flex items-center gap-2">
              {["Invalid", "Acknowledged", "Archived"].includes(
                formData.status
              ) && (
                <button
                  onClick={() => exportAllFiles(coachingRef)}
                  className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-200 transition"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* CONTENT */}
        {isViewMode ? (
          <>
            {/* ================= UI VIEW ================= */}
            <div className="space-y-6">
              {/* Agent / Coach */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Agent Name" value={formData.agentName} />
                <Field label="Coach Name" value={formData.coachName} />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DateField
                  label="Date of Mistake"
                  value={formatDisplayDate(formData.dateOfMistake)}
                />
                <DateField
                  label="Coaching Date"
                  value={formatDisplayDate(formData.coachingDate)}
                />
              </div>

              {/* Mistake */}
              <TextArea
                label="Agent Mistake"
                value={formData.coachingMistake}
              />

              {/* Evidence */}
              {formData.evidence?.length > 0 && (
                <Evidence evidence={formData.evidence} />
              )}

              {/* Explanation & Action Plan */}
              {[
                "Respondant Explained",
                "For Acknowledgement",
                "Acknowledged",
              ].includes(formData.status) && (
                <>
                  <TextArea
                    label="Explanation"
                    value={formData.respondantExplanation}
                  />
                  <TextArea label="Action Plan" value={formData.actionPlan} />
                </>
              )}

              {formData.status === "Invalid" && (
                <TextArea
                  label="Invalid Reason"
                  value={formData.invalidReason}
                />
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 p-4 rounded-2xl font-semibold"
                >
                  Close
                </button>

                {formData.isReadByHR && (
                  <button
                    onClick={onDelete}
                    disabled={isUploading}
                    className="flex-1 bg-red-600 text-white p-4 rounded-2xl font-semibold"
                  >
                    {isUploading ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </div>

            {/* ================= PDF EXPORT (HIDDEN) ================= */}
            <ExportCoachingPDF ref={coachingRef} formData={formData} />
          </>
        ) : (
          <div className="py-10 text-center text-gray-500 italic">
            Select an offense from the list to view details.
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Field = ({ label, value }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <p className="p-4 bg-gray-50 rounded-xl">{value || "N/A"}</p>
  </div>
);

const DateField = ({ label, value }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
      <p className="pl-10 p-4 bg-gray-50 rounded-xl">{value || "N/A"}</p>
    </div>
  </div>
);

const TextArea = ({ label, value }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <p className="p-4 bg-gray-50 rounded-xl h-28 overflow-y-auto">
      {value || "N/A"}
    </p>
  </div>
);

const Evidence = ({ evidence }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">Evidence</label>
    <div className="border-dashed border-2 p-4 rounded-xl bg-blue-50">
      {evidence.map((ev, i) => (
        <div key={i} className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm">{ev.fileName}</span>
          </div>
          <a
            href={ev.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm"
          >
            View
          </a>
        </div>
      ))}
    </div>
  </div>
);

export default CoachingDetails;

