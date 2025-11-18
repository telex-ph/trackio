import React from "react";
import { Building, Pin } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";

const DepartmentAnnouncementSection = ({ 
  title, 
  announcements, 
  onReadMore, 
  onFileDownload, 
  onFileView,
  onTogglePin,
  canPinMore,
  showPinnedOnly,
  onTogglePinnedView,
  pinnedCount,
  maxPinnedLimit,
  onLike,
  hasLiked, 
  currentUser 
}) => {
  const filteredAnnouncements = showPinnedOnly 
    ? announcements.filter(a => a.isPinned)
    : announcements;

  if (filteredAnnouncements.length === 0 && !showPinnedOnly) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {filteredAnnouncements.length} {showPinnedOnly ? 'pinned' : ''} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onTogglePinnedView}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
              showPinnedOnly 
                ? 'bg-yellow-500 text-white shadow-md hover:bg-yellow-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <Pin className={`w-3 h-3 ${showPinnedOnly ? 'text-white' : 'text-yellow-500'}`} />
            {showPinnedOnly ? 'Show All' : 'Show Pinned'}
            {pinnedCount > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                showPinnedOnly 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-yellow-500 text-white'
              }`}>
                {pinnedCount}/{maxPinnedLimit}
              </span>
            )}
          </button>
        </div>
      </div>

      {showPinnedOnly && filteredAnnouncements.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <Pin className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-semibold text-gray-600 mb-1">
            No Pinned Announcements
          </h4>
          <p className="text-xs text-gray-500">
            There are no pinned announcements in this department.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 
            scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full 
            scrollbar-track-rounded-full">
            <div className="flex gap-4 min-w-max pr-4">
              {filteredAnnouncements.map((announcement, index) => (
                <div key={announcement._id || index} className="w-80 flex-shrink-0">
                  <AnnouncementCard
                    announcement={announcement}
                    onReadMore={onReadMore}
                    onFileDownload={onFileDownload}
                    onFileView={onFileView}
                    onTogglePin={onTogglePin}
                    canPinMore={canPinMore || announcement.isPinned}
                    onLike={onLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id ||  ''} />
                </div>
              ))}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAnnouncementSection;