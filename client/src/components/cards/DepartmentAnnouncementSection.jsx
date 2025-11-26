import React, { memo, useMemo } from "react";
import { Building, Pin, PinOff } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";

const DepartmentAnnouncementSection = ({ 
  title, 
  announcements = [], 
  onReadMore, 
  onFileDownload, 
  onFileView,
  onTogglePin,
  canPinMore,
  showPinnedOnly,
  onTogglePinnedView,
  pinnedCount = 0,
  maxPinnedLimit = 3,
  onLike,
  hasLiked, 
  currentUserId
}) => {

  // ✅ FIXED: Memoize filtered announcements to prevent unnecessary re-renders
  const filteredAnnouncements = useMemo(() => {
    return showPinnedOnly 
      ? announcements.filter(a => a?.isPinned)
      : announcements;
  }, [announcements, showPinnedOnly]);

  // ✅ FIXED: Early return for empty state
  if (filteredAnnouncements.length === 0 && !showPinnedOnly) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header - OPTIMIZED */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
              {title}
            </h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
              {filteredAnnouncements.length} {showPinnedOnly ? 'pinned' : ''}
            </span>
          </div>
        </div>
        
        {/* OPTIMIZED PINNED TOGGLE BUTTON - Compact and Clean */}
        {pinnedCount > 0 && (
          <button 
            onClick={onTogglePinnedView}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              showPinnedOnly 
                ? 'bg-yellow-500 text-white shadow-sm hover:bg-yellow-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            } whitespace-nowrap flex-shrink-0`}
          >
            {showPinnedOnly ? (
              <>
                <PinOff className="w-4 h-4" />
                <span>All</span>
              </>
            ) : (
              <>
                <Pin className="w-4 h-4" />
                <span>Pinned</span>
                <span className="bg-yellow-500 text-white rounded-full px-1.5 py-0.5 text-xs min-w-[2rem]">
                  {pinnedCount}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Empty State for Pinned Only */}
      {showPinnedOnly && filteredAnnouncements.length === 0 ? (
        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <Pin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-gray-600 mb-1">
            No Pinned Announcements
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
            There are no pinned announcements in this department.
          </p>
        </div>
      ) : (
        /* Announcements Grid - RESPONSIVE */
        <div className="relative">
          {/* Mobile: Vertical Scroll */}
          <div className="block lg:hidden">
            <div className="space-y-3 sm:space-y-4">
              {filteredAnnouncements.map((announcement, index) => (
                <div key={announcement?._id || `mobile-${index}`} className="w-full">
                  <AnnouncementCard
                    announcement={announcement}
                    onReadMore={onReadMore}
                    onFileDownload={onFileDownload}
                    onFileView={onFileView}
                    onTogglePin={onTogglePin}
                    canPinMore={canPinMore || announcement?.isPinned}
                    onLike={onLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUserId} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Horizontal Scroll for multiple cards */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 
              scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="flex gap-4 min-w-max pr-4">
                {filteredAnnouncements.map((announcement, index) => (
                  <div key={announcement?._id || `desktop-${index}`} className="w-80 flex-shrink-0">
                    <AnnouncementCard
                      announcement={announcement}
                      onReadMore={onReadMore}
                      onFileDownload={onFileDownload}
                      onFileView={onFileView}
                      onTogglePin={onTogglePin}
                      canPinMore={canPinMore || announcement?.isPinned}
                      onLike={onLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUserId} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tablet: 2-column grid */}
          <div className="hidden sm:block lg:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnouncements.map((announcement, index) => (
                <div key={announcement?._id || `tablet-${index}`}>
                  <AnnouncementCard
                    announcement={announcement}
                    onReadMore={onReadMore}
                    onFileDownload={onFileDownload}
                    onFileView={onFileView}
                    onTogglePin={onTogglePin}
                    canPinMore={canPinMore || announcement?.isPinned}
                    onLike={onLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUserId} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simplified Pin Status */}
      {pinnedCount > 0 && (
        <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              canPinMore ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span>
              {pinnedCount}/{maxPinnedLimit} pinned
            </span>
          </div>
          {!canPinMore && (
            <span className="text-red-500 font-medium">
              Max pins reached
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ FIXED: Wrap with memo to prevent unnecessary re-renders
export default memo(DepartmentAnnouncementSection);