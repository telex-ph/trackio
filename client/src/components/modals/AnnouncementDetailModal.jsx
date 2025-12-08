import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Heart,
  Eye,
  Pin,
  PinOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const AnnouncementDetailModal = ({
  isOpen,
  onClose,
  announcement,
  onLike,
  currentUser,
  onTogglePin,
  pinnedCount,
  maxPinnedLimit,
  trackView,
}) => {
  
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [localViewCount, setLocalViewCount] = useState(0);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const viewTrackedRef = useRef(false);

  useEffect(() => {
    if (announcement) {
      const views = Array.isArray(announcement.views) ? announcement.views.length : 0;
      const likes = Array.isArray(announcement.acknowledgements) ? announcement.acknowledgements.length : 0;
    
      let liked = false;
      if (currentUser && announcement.acknowledgements && Array.isArray(announcement.acknowledgements)) {
        liked = announcement.acknowledgements.some(ack => ack.userId === currentUser._id);
      }
      
      setLocalViewCount(views);
      setLocalLikeCount(likes);
      setLocalIsLiked(liked);
      setIsLikeDisabled(liked);
      
      console.log("🔍 Modal initialized:", {
        announcementId: announcement._id,
        initialViews: views,
        initialLikes: likes,
        userHasLiked: liked
      });
    }
  }, [announcement, currentUser]);

  useEffect(() => {
    if (isOpen && announcement && currentUser && trackView) {
      if (!viewTrackedRef.current) {
        console.log("📊 Tracking view for announcement:", announcement._id);
        
        setLocalViewCount(prev => {
          const newCount = prev + 1;
          console.log("📈 View count updated:", newCount);
          return newCount;
        });

        viewTrackedRef.current = true;
        trackView(announcement._id, currentUser._id);
        
        console.log("✅ View tracked successfully");
      }
    }
  }, [isOpen, announcement, currentUser, trackView]);

  useEffect(() => {
    if (!isOpen) {
      console.log("🔄 Resetting view tracking for next open");
      viewTrackedRef.current = false;
    }
  }, [isOpen]);

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

  // ✅ UPDATED: Handle both Cloudinary URL and old data format
  const getImageUrl = () => {
    if (!announcement.attachment) return null;
    return announcement.attachment.url || announcement.attachment.data;
  };

  const hasImages = announcement.attachment && 
    announcement.attachment.type?.startsWith('image/') && 
    getImageUrl();
  
  const isPdf = announcement.attachment && 
    announcement.attachment.type === 'application/pdf';

  const handleLikeClick = async () => {
    if (!onLike || !currentUser || isLikeDisabled) {
      console.log("❌ Like button blocked:", {
        hasOnLike: !!onLike,
        hasCurrentUser: !!currentUser,
        isLikeDisabled
      });
      return;
    }

    try {
      console.log("❤️ Starting like process for announcement:", announcement._id);
      
      const newLikeStatus = true;
      const newLikeCount = localLikeCount + 1;
      
      setLocalIsLiked(newLikeStatus);
      setLocalLikeCount(newLikeCount);
      setIsLikeDisabled(true);

      await onLike(announcement._id, currentUser._id);
      
      console.log("✅ Like action completed - Button disabled:", {
        announcementId: announcement._id,
        userId: currentUser._id,
        newLikeStatus,
        newLikeCount
      });

    } catch (error) {
      console.error("❌ Error in like action:", error);
      setLocalIsLiked(false);
      setLocalLikeCount(localLikeCount);
      setIsLikeDisabled(false);
    }
  };

  const openImageViewer = () => {
    if (hasImages) {
      setIsImageViewerOpen(true);
      setZoomLevel(1);
      setRotation(0);
    }
  };

  // ✅ UPDATED: Open PDF directly in browser
  const openPdfInBrowser = () => {
    if (isPdf && announcement.attachment) {
      const pdfUrl = announcement.attachment.url || announcement.attachment.data;
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    }
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
    setZoomLevel(1);
    setRotation(0);
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

  // ✅ UPDATED: Get attachment filename
  const getAttachmentName = () => {
    if (!announcement.attachment) return '';
    return announcement.attachment.fileName || 
           announcement.attachment.name || 
           'Attachment';
  };

  // ✅ UPDATED: Get attachment size in MB
  const getAttachmentSize = () => {
    if (!announcement.attachment || !announcement.attachment.size) return '0 MB';
    return `${(announcement.attachment.size / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <>
      {isOpen && (
        <>
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

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto">
                {/* Image Section - Full Width */}
                {hasImages && (
                  <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-50">
                    <img
                      src={getImageUrl()}
                      alt={announcement.title}
                      className="w-full h-full object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                      onClick={openImageViewer}
                      onError={(e) => {
                        console.error('Image failed to load:', getImageUrl());
                        e.target.style.display = 'none';
                      }}
                    />

                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                      <ZoomIn className="w-3 h-3" />
                      <span>Click to view</span>
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8">
                  <div className="space-y-4 sm:space-y-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                      {announcement.title}
                    </h1>

                    <div className="flex flex-row xs:flex-row items-start xs:items-center gap-3 xs:gap-6">
                      {/* ✅ FIXED: Using local view count */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-base sm:text-lg">
                          {localViewCount} View{localViewCount !== 1 ? 's' : ''}
                        </span>
                        {viewTrackedRef.current && (
                          <span className="text-xs text-green-600 bg-green-100 px-1 rounded">+1</span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleLikeClick}
                        disabled={!currentUser || isLikeDisabled}
                        className={`flex items-center gap-2 transition-all group ${
                          !currentUser || isLikeDisabled 
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:scale-105"
                        }`}
                        title={
                          !currentUser 
                            ? "Please log in to like" 
                            : isLikeDisabled 
                            ? "You've already liked this announcement"
                            : "Like this announcement"
                        }
                      >
                        <Heart
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                            localIsLiked 
                              ? "text-red-500 fill-current scale-110" 
                              : "text-gray-600 group-hover:text-red-400 group-hover:scale-110"
                          }`}
                          fill={localIsLiked ? "currentColor" : "none"}
                        />
                        <span
                          className={`font-medium text-base sm:text-lg transition-colors ${
                            localIsLiked ? "text-red-500" : "text-gray-600"
                          }`}
                        >
                          {localLikeCount} Like{localLikeCount !== 1 ? 's' : ''}
                          {isLikeDisabled && " ✓"}
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

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Description</h3>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                        {announcement.agenda || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {announcement.attachment && !hasImages && (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">Attachment</h3>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200 gap-4 lg:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                            {isPdf ? (
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-600" />
                            ) : (
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-base sm:text-lg truncate">
                              {getAttachmentName()}
                            </p>
                            <p className="text-gray-600 text-sm sm:text-base">
                              {getAttachmentSize()}
                            </p>
                            {isPdf && (
                              <p className="text-xs sm:text-sm text-red-600 font-medium">PDF Document</p>
                            )}
                            {announcement.attachment.url && (
                              <p className="text-xs sm:text-sm text-green-600 font-medium">Cloudinary</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
                          {isPdf ? (
                            // ✅ UPDATED: PDF opens directly in browser
                            <button
                              onClick={openPdfInBrowser}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm sm:text-base w-full xs:w-auto"
                            >
                              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Open PDF</span>
                            </button>
                          ) : (
                            // For non-PDF files, show download button
                            <button
                              onClick={() => {
                                if (announcement.attachment.url) {
                                  window.open(announcement.attachment.url, '_blank');
                                } else if (announcement.attachment.data) {
                                  // For old Base64 format
                                  const link = document.createElement('a');
                                  link.href = announcement.attachment.data;
                                  link.download = getAttachmentName();
                                  link.click();
                                }
                              }}
                              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base w-full xs:w-auto"
                            >
                              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span>Open File</span>
                            </button>
                          )}
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

      {/* Image Viewer Modal */}
      {isImageViewerOpen && hasImages && (
        <>
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70]" onClick={closeImageViewer} />
          <div className="fixed inset-2 sm:inset-4 bg-black rounded-xl sm:rounded-2xl shadow-2xl z-[80] flex flex-col overflow-hidden">
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
            </div>
            <div className="flex-1 flex items-center justify-center bg-black p-2 sm:p-4 min-h-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={getImageUrl()}
                  alt={announcement.title}
                  className="max-w-full max-h-full object-contain transition-all duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                  onError={(e) => {
                    console.error('Image failed to load in viewer:', getImageUrl());
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-black/80 border-t border-gray-700 shrink-0 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/10 rounded-full px-3 py-2 sm:px-4 sm:py-2 overflow-x-auto">
                  <button
                    onClick={zoomOut}
                    disabled={zoomLevel <= 0.5}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 flex-shrink-0 text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    onClick={resetImage}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all flex-shrink-0 text-white"
                    title="Reset Image"
                  >
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <span className="mx-1 sm:mx-2 text-sm font-medium min-w-[50px] sm:min-w-[60px] text-center flex-shrink-0 text-white">
                    {Math.round(zoomLevel * 100)}%
                  </span>

                  <button
                    onClick={zoomIn}
                    disabled={zoomLevel >= 3}
                    className="p-1 sm:p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 flex-shrink-0 text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

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
    </>
  );
};

export default AnnouncementDetailModal;