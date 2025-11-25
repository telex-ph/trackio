import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
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
  const [currentPdfPage, setCurrentPdfPage] = useState(1);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      setCurrentPdfPage(1);
    }
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    setZoomLevel(1);
    setRotation(0);
  };

  const closePdfViewer = () => {
    setIsPdfViewerOpen(false);
    setCurrentPdfPage(1);
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

  // PDF navigation functions
  const nextPdfPage = () => {
    setCurrentPdfPage(prev => prev + 1);
  };

  const prevPdfPage = () => {
    setCurrentPdfPage(prev => Math.max(prev - 1, 1));
  };

  // For demo purposes - you'll need to replace this with actual PDF page count
  // In a real implementation, you'd get this from your PDF library
  const totalPdfPages = 10; // This should come from your PDF data

  return (
    <>
      {/* Main Modal - WITH PROPER BACKGROUND */}
      {isOpen && (
        <>
          {/* Backdrop with opacity and blur */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
          
          {/* Modal Content */}
          <div className="fixed inset-2 sm:inset-0 bg-white z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white shrink-0 gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Announcement
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">Detailed view</p>
                </div>
              </div>
              
              {/* Pin/Unpin Button in Header */}
              {onTogglePin && (
                <button
                  onClick={() => onTogglePin(announcement)}
                  disabled={
                    !announcement.isPinned &&
                    pinnedCount &&
                    pinnedCount >= maxPinnedLimit
                  }
                  className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all text-sm sm:text-base ${
                    announcement.isPinned
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  }`}
                  title={announcement.isPinned ? "Unpin announcement" : "Pin announcement"}
                >
                  {announcement.isPinned ? (
                    <PinOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Pin className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden xs:inline">{announcement.isPinned ? "Unpin" : "Pin"}</span>
                </button>
              )}
            </div>

            {/* Content - SINGLE SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                {/* Image Section - Full Width */}
                {hasImages && (
                  <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-50">
                    <img
                      src={announcement.attachment.data}
                      alt={announcement.title}
                      className="w-full h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                      onClick={openImageViewer}
                    />
                    
                    {/* Small Download button for image */}
                    <button
                      onClick={() => handleFileDownload(announcement.attachment)}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black transition-all backdrop-blur-sm"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Click to zoom indicator */}
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                      <ZoomIn className="w-3 h-3" />
                      <span>Click to view</span>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
                  {/* Title and Author */}
                  <div className="space-y-4 sm:space-y-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                      {announcement.title}
                    </h1>

                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-base sm:text-lg">{viewCount} Views</span>
                      </div>
                      <button
                        onClick={handleLikeClick}
                        disabled={!currentUser}
                        className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 group">
                        <Heart
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                            isLiked 
                              ? "text-red-500 fill-current scale-110" 
                              : "text-gray-600 group-hover:text-red-400 group-hover:scale-110"
                          }`}
                          fill={isLiked ? "currentColor" : "none"}
                        />
                        <span
                          className={`font-medium text-base sm:text-lg transition-colors ${
                            isLiked ? "text-red-500" : "text-gray-600"
                          }`} > 
                          {likeCount} Like{likeCount !== 1 ? 's' : ''}
                        </span>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-base sm:text-lg">
                          {announcement.postedBy}
                        </p>
                        <p className="text-gray-500 text-sm sm:text-base">
                          {announcement.dateTime ? 
                            new Date(announcement.dateTime).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            'No date specified'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description/Agenda */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Description</h3>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                        {announcement.agenda || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Non-image Attachment */}
                  {announcement.attachment && !hasImages && (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Attachment</h3>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200 gap-4 lg:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            {isPdf ? (
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-600" />
                            ) : (
                              <Download className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-base sm:text-lg truncate">
                              {announcement.attachment.name}
                            </p>
                            <p className="text-gray-600 text-sm sm:text-base">
                              {(
                                (announcement.attachment.size || 0) /
                                1024 /
                                1024
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                            {isPdf && (
                              <p className="text-xs sm:text-sm text-red-600 font-medium">PDF Document</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
                          {/* Preview Button for PDF */}
                          {isPdf && (
                            <button
                              onClick={openPdfViewer}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm sm:text-base w-full xs:w-auto"
                            >
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Preview</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleFileDownload(announcement.attachment)}
                            className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base w-full xs:w-auto"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
                  Posted by: <span className="font-semibold">{announcement.postedBy}</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 sm:px-8 sm:py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold text-sm sm:text-lg w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Full Screen Image Viewer - STAYS WITHIN MODAL BOUNDS */}
      {isImageViewerOpen && hasImages && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70]" onClick={closeImageViewer} />
          
          {/* Image Viewer Content - STAYS WITHIN MODAL */}
          <div className="fixed inset-2 sm:inset-4 bg-black rounded-xl sm:rounded-2xl shadow-2xl z-[80] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between p-3 sm:p-4 bg-black/80 border-b border-gray-700 shrink-0 gap-2 xs:gap-0 backdrop-blur-sm">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={closeImageViewer}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate text-white">
                    {announcement.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">Image Preview</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Small Download Button */}
                <button
                  onClick={() => handleFileDownload(announcement.attachment)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Content - FULL VIEW WITHIN MODAL */}
            <div className="flex-1 flex items-center justify-center bg-black p-2 sm:p-4 min-h-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={announcement.attachment.data}
                  alt={announcement.title}
                  className="max-w-full max-h-full object-contain transition-all duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
            </div>

            {/* Image Controls */}
            <div className="p-3 sm:p-4 bg-black/80 border-t border-gray-700 shrink-0 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-full px-3 py-2 sm:px-4 sm:py-2 overflow-x-auto">
                  {/* Zoom Out */}
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 flex-shrink-0 text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Reset */}
                  <button
                    onClick={resetImage}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all flex-shrink-0 text-white"
                    title="Reset Image"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Zoom Level Display */}
                  <span className="mx-1 sm:mx-2 text-sm font-medium min-w-[50px] sm:min-w-[60px] text-center flex-shrink-0 text-white">
                    {Math.round(zoomLevel * 100)}%
                  </span>

                  {/* Zoom In */}
                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 flex-shrink-0 text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Rotate */}
                  <button
                    onClick={rotateImage}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all flex-shrink-0 text-white"
                    title="Rotate Image"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isPdfViewerOpen && isPdf && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]" onClick={closePdfViewer} />
          
          {/* PDF Viewer Content */}
          <div className="fixed inset-2 sm:inset-4 bg-white rounded-xl sm:rounded-2xl shadow-2xl z-[80] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shrink-0 gap-3 lg:gap-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={closePdfViewer}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold truncate">
                    {announcement.attachment.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Page {currentPdfPage} of {totalPdfPages}
                  </p>
                </div>
              </div>
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-4">
                {/* Page Navigation */}
                <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg px-2 py-1 sm:px-3 sm:py-2">
                  <button
                    onClick={prevPdfPage}
                    disabled={currentPdfPage <= 1}
                    className="p-1 hover:bg-white rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  
                  <span className="mx-1 sm:mx-2 text-sm font-medium min-w-[60px] sm:min-w-[80px] text-center flex-shrink-0">
                    {currentPdfPage} / {totalPdfPages}
                  </span>
                  
                  <button
                    onClick={nextPdfPage}
                    disabled={currentPdfPage >= totalPdfPages}
                    className="p-1 hover:bg-white rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Small Download Button */}
                <button
                  onClick={() => handleFileDownload(announcement.attachment)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-100 min-h-0">
              <iframe
                src={`${announcement.attachment.data}#page=${currentPdfPage}`}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            </div>

            {/* Bottom Navigation */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Use the navigation buttons to browse pages
                </div>
                
                {/* Quick Page Jump */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 hidden xs:inline">Go to page:</span>
                  <span className="text-xs sm:text-sm text-gray-600 xs:hidden">Page:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPdfPages}
                    value={currentPdfPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPdfPages) {
                        setCurrentPdfPage(page);
                      }
                    }}
                    className="w-12 sm:w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <span className="text-xs sm:text-sm text-gray-600">of {totalPdfPages}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AnnouncementDetailModal;