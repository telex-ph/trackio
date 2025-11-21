import React from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  Pin,
  PinOff,
  Heart,
} from "lucide-react";
import { DateTime } from "luxon";

const AnnouncementDetailModal = ({
  isOpen,
  onClose,
  announcement,
  onTogglePin,
  pinnedCount,
  maxPinnedLimit,
  onLike,
  hasLiked,
  currentUser,
}) => {
  if (!isOpen || !announcement) return null;

  const formatDisplayDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const date = DateTime.fromISO(isoDateStr);
    return date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  };

  const formatDisplayTime = (isoDateStr) => {
    if (!isoDateStr) return "";
    const time = DateTime.fromISO(isoDateStr);
    return time.toLocaleString(DateTime.TIME_SIMPLE);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-600";
      case "Scheduled":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleFileDownload = (file) => {
    try {
      if (!file.data) {
        console.error("File data not available");
        return;
      }

      const base64Data = file.data.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const isLiked =
    hasLiked && currentUser ? hasLiked(announcement, currentUser._id) : false;
  const viewCount = Array.isArray(announcement.views)
    ? announcement.views.length
    : 0;
  const likeCount = Array.isArray(announcement.acknowledgements)
    ? announcement.acknowledgements.length
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Announcement Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Title and Status */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {announcement.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority} Priority
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      announcement.status
                    )}`}
                  >
                    {announcement.status}
                  </span>
                </div>
              </div>

              {/* Pin Button */}
              {onTogglePin && (
                <button
                  onClick={() => onTogglePin(announcement)}
                  disabled={
                    !announcement.isPinned &&
                    pinnedCount &&
                    pinnedCount >= maxPinnedLimit
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    announcement.isPinned
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  }`}
                >
                  {announcement.isPinned ? (
                    <PinOff className="w-4 h-4" />
                  ) : (
                    <Pin className="w-4 h-4" />
                  )}
                  {announcement.isPinned ? "Unpin" : "Pin"}
                </button>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Posted By</p>
                  <p className="font-medium text-gray-800">
                    {announcement.postedBy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium text-gray-800">
                    {formatDisplayDate(announcement.dateTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium text-gray-800">
                    {formatDisplayTime(announcement.dateTime)}
                  </p>
                </div>
              </div>

              {/* Views and Likes Count */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{viewCount}</span>
                  </div>
                  <button
                    onClick={() =>
                      onLike &&
                      currentUser &&
                      !isLiked &&
                      onLike(announcement._id, currentUser._id)
                    }
                    disabled={isLiked || !currentUser}
                    className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isLiked ? "text-red-500 fill-current" : "text-gray-600"
                      }`}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isLiked ? "text-red-500" : "text-gray-600"
                      }`}
                    >
                      {likeCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Agenda
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {announcement.agenda}
                </p>
              </div>
            </div>

            {/* Attachment */}
            {announcement.attachment && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Attachment
                </h4>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {announcement.attachment.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(
                          (announcement.attachment.size || 0) /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileDownload(announcement.attachment)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium text-gray-800">
                  {announcement.createdAt
                    ? DateTime.fromISO(announcement.createdAt).toLocaleString(
                        DateTime.DATETIME_MED
                      )
                    : "N/A"}
                </p>
              </div>
              {announcement.updatedAt &&
                announcement.updatedAt !== announcement.createdAt && (
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-800">
                      {DateTime.fromISO(announcement.updatedAt).toLocaleString(
                        DateTime.DATETIME_MED
                      )}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;
