import React, { useState } from "react";
import {
  X,
  User,
  Heart,
  Eye,
  Pin,
  PinOff,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
} from "lucide-react";

const AnnouncementDetailModal = ({
  isOpen,
  onClose,
  announcement,
  onLike,
  hasLiked,
  currentUser,
  onTogglePin,
  pinnedCount,
  maxPinnedLimit,
}) => {
  
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !announcement) return null;

  const isLiked =
    hasLiked && currentUser ? hasLiked(announcement, currentUser._id) : false;
  const viewCount = Array.isArray(announcement.views)
    ? announcement.views.length
    : 0;
  const likeCount = Array.isArray(announcement.acknowledgements)
    ? announcement.acknowledgements.length
    : 0;

  const hasImages = announcement.attachment && 
    announcement.attachment.type?.startsWith('image/');
  
  const isPdf = announcement.attachment && 
    announcement.attachment.type === 'application/pdf';

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

  // Handle like/unlike click
  const handleLikeClick = () => {
    if (onLike && currentUser) {
      onLike(announcement._id, currentUser._id);
    }
  };

  // Image viewer functions
  const openImageViewer = () => {
    if (hasImages) {
      setIsImageViewerOpen(true);
      setZoomLevel(1);
      setRotation(0);
    }
  };

  const openPdfViewer = () => {
    if (isPdf) {
      setIsPdfViewerOpen(true);
    }
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    setZoomLevel(1);
    setRotation(0);
  };

  const closePdfViewer = () => {
    setIsPdfViewerOpen(false);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetImage = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-gray-500/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white bg-opacity-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col backdrop-blur-sm">
          {/* Header - Simplified */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 border-opacity-50">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Announcement
                </h2>
                <p className="text-sm text-gray-500">Detailed view</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Image Section - Full Width */}
            {hasImages && (
              <div className="relative w-full h-96 bg-gray-100 bg-opacity-50">
                <img
                  src={announcement.attachment.data}
                  alt={announcement.title}
                  className="w-full h-full object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                  onClick={openImageViewer}
                />
                
                {/* Pin/Unpin Button - nasa image area na */}
                {onTogglePin && (
                  <button
                    onClick={() => onTogglePin(announcement)}
                    disabled={
                      !announcement.isPinned &&
                      pinnedCount &&
                      pinnedCount >= maxPinnedLimit
                    }
                    className={`absolute top-4 right-4 p-3 rounded-full text-white transition-all ${
                      announcement.isPinned
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    }`}
                    title={announcement.isPinned ? "Unpin announcement" : "Pin announcement"}
                  >
                    {announcement.isPinned ? (
                      <PinOff className="w-5 h-5" />
                    ) : (
                      <Pin className="w-5 h-5" />
                    )}
                  </button>
                )}

                {/* Download button for image - nasa ibaba na ng pin button */}
                <button
                  onClick={() => handleFileDownload(announcement.attachment)}
                  className="absolute top-20 right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
                  title="Download image"
                >
                  <Download className="w-5 h-5" />
                </button>

                {/* Click to zoom indicator */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  Click to view full screen
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Title and Author */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {announcement.title}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-8 h-5" />
                    <span className="font-medium">{viewCount} Views</span>
                  </div>
                  <button
                    onClick={handleLikeClick}
                    disabled={!currentUser}
                    className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 group">
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        isLiked 
                          ? "text-red-500 fill-current scale-110" 
                          : "text-gray-600 group-hover:text-red-400 group-hover:scale-110"
                      }`}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span
                      className={`font-medium transition-colors ${
                        isLiked ? "text-red-500" : "text-gray-600"
                      }`} > {likeCount} Like</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {announcement.postedBy}
                    </p>
                    <p className="text-sm text-gray-500">
                      {announcement.dateTime ? 
                        new Date(announcement.dateTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        'No date specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Description/Agenda */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                <div className="bg-gray-50 bg-opacity-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {announcement.agenda || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Non-image Attachment */}
              {announcement.attachment && !hasImages && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">Attachment</h3>
                  <div className="flex items-center justify-between p-4 bg-blue-50 bg-opacity-50 rounded-xl border border-blue-200 border-opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                        {isPdf ? (
                          <FileText className="w-6 h-6 text-red-600" />
                        ) : (
                          <Download className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
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
                        {isPdf && (
                          <p className="text-xs text-red-600 font-medium">PDF Document</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Preview Button for PDF */}
                      {isPdf && (
                        <button
                          onClick={openPdfViewer}
                          className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          <FileText className="w-4 h-4" />
                          Preview
                        </button>
                      )}
                      <button
                        onClick={() => handleFileDownload(announcement.attachment)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Minimal */}
          <div className="p-6 border-t border-gray-200 border-opacity-50 bg-gray-50 bg-opacity-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Posted by: {announcement.postedBy}
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-800 bg-opacity-50 text-white rounded-xl hover:bg-gray-900 hover:bg-opacity-50 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {isImageViewerOpen && hasImages && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image with zoom and rotation */}
            <img
              src={announcement.attachment.data}
              alt={announcement.title}
              className="max-w-full max-h-full object-contain transition-all duration-200"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              }}
            />

            {/* Image Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white rounded-full px-4 py-2 flex items-center gap-4">
              {/* Zoom Out */}
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 0.5}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              {/* Reset */}
              <button
                onClick={resetImage}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                title="Reset Image"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Zoom In */}
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              {/* Rotate */}
              <button
                onClick={rotateImage}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                title="Rotate Image"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Download */}
              <button
                onClick={() => handleFileDownload(announcement.attachment)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Zoom Level Indicator */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Full Screen PDF Viewer */}
      {isPdfViewerOpen && isPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="relative w-full h-full flex flex-col">
            {/* Header with controls */}
            <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={closePdfViewer}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-lg font-semibold">
                  {announcement.attachment.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleFileDownload(announcement.attachment)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-white">
              <iframe
                src={announcement.attachment.data}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            </div>

            {/* Footer Info */}
            <div className="p-4 bg-black bg-opacity-50 text-white text-sm text-center">
              PDF Document • Use the download button to save a copy
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementDetailModal;