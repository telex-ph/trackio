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
  ExternalLink,
  Maximize2,
  Minimize2,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewTrackedRef = useRef(false);
  const modalRef = useRef(null);
  const imageViewerRef = useRef(null);

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
    }
  }, [announcement, currentUser]);

  useEffect(() => {
    if (isOpen && announcement && currentUser && trackView) {
      if (!viewTrackedRef.current) {
        setLocalViewCount(prev => prev + 1);
        viewTrackedRef.current = true;
        trackView(announcement._id, currentUser._id);
      }
    }
  }, [isOpen, announcement, currentUser, trackView]);

  useEffect(() => {
    if (!isOpen) {
      viewTrackedRef.current = false;
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Close on Escape key
      if (e.key === 'Escape') {
        if (isImageViewerOpen) {
          closeImageViewer();
        } else {
          onClose();
        }
      }

      // Image viewer shortcuts
      if (isImageViewerOpen) {
        switch (e.key) {
          case '+':
          case '=':
            if (e.ctrlKey || e.metaKey) zoomIn();
            break;
          case '-':
            if (e.ctrlKey || e.metaKey) zoomOut();
            break;
          case '0':
            if (e.ctrlKey || e.metaKey) resetImage();
            break;
          case 'r':
          case 'R':
            rotateImage();
            break;
          case 'f':
          case 'F':
            toggleFullscreen();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isImageViewerOpen, onClose]);

  // Handle body overflow
  useEffect(() => {
    if (isOpen || isImageViewerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isImageViewerOpen]);

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close main modal when clicking outside
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen && !isImageViewerOpen) {
        onClose();
      }
      
      // Close image viewer when clicking on overlay (only if not clicking on controls)
      if (isImageViewerOpen && imageViewerRef.current && 
          !imageViewerRef.current.contains(e.target) &&
          !e.target.closest('.image-controls') &&
          !e.target.closest('.close-image-btn')) {
        closeImageViewer();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isImageViewerOpen, onClose]);

  if (!isOpen || !announcement) return null;

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
    if (!onLike || !currentUser || isLikeDisabled) return;

    try {
      const newLikeStatus = true;
      const newLikeCount = localLikeCount + 1;
      
      setLocalIsLiked(newLikeStatus);
      setLocalLikeCount(newLikeCount);
      setIsLikeDisabled(true);

      await onLike(announcement._id, currentUser._id);

    } catch (error) {
      console.error("Error in like action:", error);
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
      setIsFullscreen(false);
    }
  };

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
    setIsFullscreen(false);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getAttachmentName = () => {
    if (!announcement.attachment) return '';
    return announcement.attachment.fileName || 
           announcement.attachment.name || 
           'Attachment';
  };

  const getAttachmentSize = () => {
    if (!announcement.attachment || !announcement.attachment.size) return '0 MB';
    return `${(announcement.attachment.size / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <>
      {/* Main Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn" 
            onClick={onClose}
          />
          
          <div 
            ref={modalRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors close-btn"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Announcement Details
                    </h2>
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      announcement.isPinned
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    }`}
                    title={announcement.isPinned ? "Unpin announcement" : "Pin announcement"}
                  >
                    {announcement.isPinned ? (
                      <PinOff className="w-4 h-4" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                    <span>{announcement.isPinned ? "Unpin" : "Pin"}</span>
                  </button>
                )}
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  
                  {/* Image Preview */}
                  {hasImages && (
                    <div 
                      className="relative w-full h-64 bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in group"
                      onClick={openImageViewer}
                    >
                      <img
                        src={getImageUrl()}
                        alt={announcement.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Image failed to load');
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                        <ZoomIn className="w-4 h-4" />
                        <span>Click to view</span>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {announcement.title}
                  </h1>

                  {/* Stats and Author */}
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">
                          {localViewCount} View{localViewCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <button
                        onClick={handleLikeClick}
                        disabled={!currentUser || isLikeDisabled}
                        className={`flex items-center gap-2 transition-all ${
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
                          className={`w-5 h-5 transition-all ${
                            localIsLiked 
                              ? "text-red-500 fill-current scale-110" 
                              : "text-gray-600 hover:text-red-400 hover:scale-110"
                          }`}
                          fill={localIsLiked ? "currentColor" : "none"}
                        />
                        <span
                          className={`font-medium ${
                            localIsLiked ? "text-red-500" : "text-gray-600"
                          }`}
                        >
                          {localLikeCount} Like{localLikeCount !== 1 ? 's' : ''}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
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

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-800">Description</h3>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {announcement.agenda || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Attachment */}
                  {announcement.attachment && !hasImages && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-800">Attachment</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            {isPdf ? (
                              <FileText className="w-6 h-6 text-red-600" />
                            ) : (
                              <FileText className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 truncate">
                              {getAttachmentName()}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {getAttachmentSize()}
                            </p>
                            {isPdf && (
                              <p className="text-xs text-red-600 font-medium">PDF Document</p>
                            )}
                            {announcement.attachment.url && (
                              <p className="text-xs text-green-600 font-medium">Cloudinary</p>
                            )}
                          </div>
                        </div>

                        {isPdf ? (
                          <button
                            onClick={openPdfInBrowser}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open PDF</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const url = announcement.attachment.url || announcement.attachment.data;
                              if (url) window.open(url, '_blank');
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Open File</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">
                    Posted by: <span className="font-semibold">{announcement.postedBy}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Viewer Modal - IMPROVED */}
      {isImageViewerOpen && hasImages && (
        <>
          <div 
            className={`fixed inset-0 z-[70] transition-all duration-300 ${
              isFullscreen ? 'bg-black' : 'bg-black/90 backdrop-blur-sm'
            }`}
          />
          
          <div 
            ref={imageViewerRef}
            className={`fixed z-[80] transition-all duration-300 ${
              isFullscreen 
                ? 'inset-0' 
                : 'inset-4 md:inset-8 lg:inset-12 xl:inset-16'
            }`}
          >
            <div className={`relative bg-black flex flex-col overflow-hidden ${
              isFullscreen ? 'h-screen' : 'h-full rounded-2xl shadow-2xl'
            }`}>
              
              {/* Image Viewer Header - ALWAYS VISIBLE */}
              <div className="flex items-center justify-between p-4 bg-black/80 border-b border-gray-700 shrink-0">
                <div className="flex items-center gap-4">
                 
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate max-w-xs">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-300">Image Preview • Press Esc to close</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-5 h-5" />
                    ) : (
                      <Maximize2 className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={closeImageViewer}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-white close-image-btn"
                    title="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Image Container - WITH EASY CLOSE */}
              <div 
                className="flex-1 flex items-center justify-center bg-black p-4 min-h-0 cursor-zoom-out"
                onClick={(e) => {
                  // Close when clicking on the image background (not on the image itself)
                  if (e.target === e.currentTarget || !e.target.closest('img')) {
                    closeImageViewer();
                  }
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={getImageUrl()}
                    alt={announcement.title}
                    className="max-w-full max-h-full object-contain transition-all duration-200 select-none"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      cursor: zoomLevel > 1 ? 'grab' : 'default'
                    }}
                    draggable="false"
                    onError={(e) => {
                      console.error('Image failed to load in viewer');
                      e.target.style.display = 'none';
                    }}
                  />
                  
                  {/* Close hint for mobile */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                    <span>Click outside to close</span>
                  </div>
                </div>
              </div>

              {/* Image Controls - FIXED POSITION */}
              <div className="image-controls p-4 bg-black/80 border-t border-gray-700 shrink-0">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <button
                      onClick={zoomOut}
                      disabled={zoomLevel <= 0.5}
                      className="p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 text-white"
                      title="Zoom Out (Ctrl+-)"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>

                    <button
                      onClick={resetImage}
                      className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
                      title="Reset Zoom (Ctrl+0)"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>

                    <span className="mx-2 text-sm font-medium min-w-[60px] text-center text-white">
                      {Math.round(zoomLevel * 100)}%
                    </span>

                    <button
                      onClick={zoomIn}
                      disabled={zoomLevel >= 3}
                      className="p-2 hover:bg-white/20 rounded-full transition-all disabled:opacity-30 text-white"
                      title="Zoom In (Ctrl++)"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>

                    <button
                      onClick={rotateImage}
                      className="p-2 hover:bg-white/20 rounded-full transition-all text-white"
                      title="Rotate (R)"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </div>             
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom CSS for better experience */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }

        /* Prevent image dragging */
        img {
          -webkit-user-drag: none;
          user-select: none;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
};

export default AnnouncementDetailModal;