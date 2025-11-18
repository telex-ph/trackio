import React from "react";
import { Bell, X, CheckCircle, User, Calendar, Clock, Paperclip, FileText } from "lucide-react";
import { DateTime } from "luxon";
import FilePreview from "./FilePreview";

const AnnouncementPreview = ({ isOpen, onClose, onConfirm, formData, selectedFile }) => {
  if (!isOpen) return null;

  const formatPreviewDate = (dateString) => {
    if (!dateString) return "";
    const date = DateTime.fromISO(dateString);
    return date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  };

  const formatPreviewTime = (dateString, timeString) => {
    if (!dateString || !timeString) return "";
    const combined = DateTime.fromISO(`${dateString}T${timeString}`);
    return combined.toLocaleString(DateTime.TIME_SIMPLE);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">Announcement Preview</h3>
              <p className="text-red-100 text-xs sm:text-sm">Review before posting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {selectedFile && (
            <div className="mb-4">
              <FilePreview file={selectedFile} />
            </div>
          )}

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
              <div className="flex items-start gap-3 w-full">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                    {formData.title || "No Title"}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(formData.priority)}`}>
                      {formData.priority} Priority
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-red-500">
                <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">Agenda:</p>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {formData.agenda || "No agenda provided"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Posted by:</span>
                <span>{formData.postedBy || "User"}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  <span className="font-medium">Date:</span>
                  <span>{formatPreviewDate(formData.dateInput) || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                  <span className="font-medium">Time:</span>
                  <span>{formatPreviewTime(formData.dateInput, formData.timeInput) || "Not set"}</span>
                </div>
              </div>

              {selectedFile && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
                    File Details:
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {selectedFile.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Confirm & Post
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPreview;