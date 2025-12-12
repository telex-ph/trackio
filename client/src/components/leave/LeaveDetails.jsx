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

const LeaveDetails = ({
  isViewMode,
  resetForm,
  formData,
  formatDisplayDate,
}) => {
  if (!isViewMode) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            Leave Form Details
          </h3>
        </div>
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          Select an leave from the list to view details.
        </div>
      </div>
    );
  }

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
              Leave Form Details
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
                Leave Type
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                {formData.leaveType}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Date Range
              </label>
              <div
                className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl
        text-gray-800 text-sm sm:text-base cursor-pointer
        focus-within:border-red-500 transition-all duration-300 flex items-center justify-between"
              >
                <span>
                  {formData.startDate
                    ? formData.endDate
                      ? `${formatDisplayDate(
                          formData.startDate
                        )} → ${formatDisplayDate(formData.endDate)}`
                      : formData.startDate
                    : "No date range"}
                </span>
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
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
          <FileDisplay files={formData.leaveFile} title="Leave File" />

          {formData.rejectReasonTL && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Reject Reason ({formatDisplayDate(formData.rejectedBySupervisorDate)})
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                {formData.rejectReasonTL || "No remarks"}
              </p>
            </div>
          )}
          
          {formData.rejectReasonHR && (
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Reject Reason ({formatDisplayDate(formData.rejectedByHRDate)})
              </label>
              <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                {formData.rejectReasonHR || "No remarks"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetails;
