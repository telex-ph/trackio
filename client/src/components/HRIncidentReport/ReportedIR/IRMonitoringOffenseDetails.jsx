import React from "react";
import {
  Search,
  X,
  FileText,
  Eye,
  Download,
  Edit,
  Calendar,
} from "lucide-react";
import { DateTime } from "luxon";

const inputStyle =
  "w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base focus:border-indigo-500 focus:bg-white focus:outline-none transition-all duration-300";

const IRMonitoringOffenseDetails = ({
  isViewMode,
  formData,
  onClose,
  onFormChange,
}) => {
  return (
    <div className="rounded-md p-6 sm:p-8 border border-light">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {isViewMode ? "Manage Offense" : "Offense Details"} (
            {DateTime.fromISO(formData.createdAt).toLocaleString({
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            )
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

          <div className="space-y-2">
            {formData.evidence && formData.evidence.length > 0 && (
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Evidence
                </label>
                <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                  {formData.evidence.slice(0, 2).map((ev, idx) => {
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
          </div>

          <div className="space-y-2">
            {formData.fileNTE && formData.fileNTE.length > 0 && (
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Notice to explain (
                  {DateTime.fromISO(formData.nteSentDateTime).toLocaleString({
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  )
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
                  Explanation (
                  {DateTime.fromISO(
                    formData.explanationDateTime
                  ).toLocaleString({
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  )
                </label>
                <textarea
                  name="remarks"
                  value={formData.respondantExplanation || ""}
                  onChange={onFormChange}
                  className={`${inputStyle} h-32`}
                  disabled={true}
                />
              </div>
            )}
            {formData.fileMOM && formData.fileMOM.length > 0 && (
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Minutes of the meeting (
                  {DateTime.fromISO(formData.momSentDateTime).toLocaleString({
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  )
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
            )}
            {formData.fileNDA && formData.fileNDA.length > 0 && (
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Notice of Disciplinary Action (
                  {DateTime.fromISO(formData.ndaSentDateTime).toLocaleString({
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  )
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
                  Acknowledgement (
                  {DateTime.fromISO(
                    formData.acknowledgedDateTime
                  ).toLocaleString({
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  )
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                  {formData.ackMessage || "No acknowledgement"}
                </p>
              </div>
            )}
          </div>

          {formData.status === "Invalid" && (
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
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-10 text-gray-500 italic">
          Select an offense from the list to manage details.
        </div>
      )}
    </div>
  );
};

export default IRMonitoringOffenseDetails;
