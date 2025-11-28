import React, { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  CheckCircle, 
  User, 
  Calendar, 
  Clock, 
  Paperclip, 
  Eye,
  Heart,
  Download
} from "lucide-react";
import { DateTime } from "luxon";

const AnnouncementPreview = ({ isOpen, onClose, onConfirm, formData, selectedFile }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [fileAttachment, setFileAttachment] = useState(null);

  // ✅ FIX: Move all hooks before any conditional returns
  useEffect(() => {
    if (!isOpen) return;

    if (!selectedFile) {
      setImagePreview(null);
      setFileAttachment(null);
      return;
    }

    const processFile = async () => {
      try {
        console.log("📁 Processing file:", selectedFile);
        console.log("📁 File type:", selectedFile.type);
        console.log("📁 Is File instance:", selectedFile instanceof File);

        // If it's already a data URL (from existing announcement)
        if (selectedFile.data && typeof selectedFile.data === 'string') {
          console.log("✅ Using existing data URL");
          if (selectedFile.type?.startsWith('image/')) {
            setImagePreview(selectedFile.data);
            setFileAttachment(null);
          } else {
            setImagePreview(null);
            setFileAttachment(selectedFile);
          }
          return;
        }

        // If it's a File object (from file input)
        if (selectedFile instanceof File) {
          console.log("🔄 Converting File object to data URL");
          
          if (selectedFile.type.startsWith('image/')) {
            // Convert image file to data URL
            const reader = new FileReader();
            reader.onload = (e) => {
              console.log("✅ Image conversion successful");
              setImagePreview(e.target.result);
              setFileAttachment(null);
            };
            reader.onerror = (error) => {
              console.error("❌ Image conversion failed:", error);
              setImagePreview(null);
            };
            reader.readAsDataURL(selectedFile);
          } else {
            // For non-image files
            console.log("📄 Non-image file detected");
            setImagePreview(null);
            setFileAttachment({
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              data: null
            });
          }
        }
      } catch (error) {
        console.error("❌ Error processing file:", error);
        setImagePreview(null);
        setFileAttachment(null);
      }
    };

    processFile();
  }, [isOpen, selectedFile]);

  // ✅ FIX: Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('data:')) {
        console.log("🧹 Cleaning up image preview");
      }
    };
  }, [imagePreview]);

  // ✅ FIX: Conditional return AFTER all hooks
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
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
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

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Image Preview Section */}
          {imagePreview && (
            <div className="relative w-full h-80 bg-gray-100">
              <img
                src={imagePreview}
                alt="Announcement Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Image failed to load:", imagePreview);
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("✅ Image loaded successfully");
                }}
              />
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                📷 Featured Image
              </div>
            </div>
          )}

          <div className="p-4 sm:p-8">
            {/* Title and Stats Section */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {formData.title || "No Title Provided"}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">0 Views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-4 h-4" fill="none" />
                  <span className="font-medium">0 Likes</span>
                </div>
              </div>

              {/* Author and Priority Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Posted by {formData.postedBy || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPreviewDate(formData.dateInput)} at {formatPreviewTime(formData.dateInput, formData.timeInput)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(formData.priority)}`}>
                    {formData.priority} Priority
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                    ✅ Active
                  </span>
                </div>
              </div>
            </div>

            {/* Date and Time Details */}
            <div className="flex flex-wrap gap-4 text-gray-700 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span className="font-medium">Date:</span>
                <span>{formatPreviewDate(formData.dateInput) || "Not set"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="font-medium">Time:</span>
                <span>{formatPreviewTime(formData.dateInput, formData.timeInput) || "Not set"}</span>
              </div>
            </div>

            {/* Agenda/Description Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
              <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-red-500">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                  {formData.agenda || "No description provided."}
                </p>
              </div>
            </div>

            {/* File Attachment Section */}
            {fileAttachment && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Attachment</h3>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Paperclip className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {fileAttachment.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {fileAttachment.size ? `${(fileAttachment.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm({
                    ...formData,
                    attachment: imagePreview 
                      ? { 
                          name: selectedFile.name,
                          type: selectedFile.type,
                          data: imagePreview,
                          size: selectedFile.size
                        }
                      : fileAttachment
                  });
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Confirm & Post Announcement
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPreview;