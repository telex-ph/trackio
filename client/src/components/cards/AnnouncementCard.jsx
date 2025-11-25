import React from "react";
import {
  Calendar,
  User,
  Eye,
  Heart,
  Pin,
  PinOff,
  ArrowUpRight,
  Paperclip,
  FileText,
  Download,
  Clock,
  AlertCircle,
} from "lucide-react";
import { DateTime } from "luxon";

const FileAttachment = ({ file, onDownload, onView }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Paperclip className="w-4 h-4 text-gray-500" />;
    }
  };

  const canPreview = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["pdf", "jpg", "jpeg", "png", "gif", "txt"].includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg mt-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(file.name)}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-700 truncate block">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">
            {formatFileSize(file.size || 0)}
          </span>
        </div>
      </div>
      <div className="flex gap-1 ml-2">
        {canPreview(file.name) && (
          <button
            onClick={() => onView(file)}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
            title="View file"
          >
            <Eye className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onDownload(file)}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
          title="Download file"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const AnnouncementCard = ({ 
    announcement, 
    onReadMore, 
    // onFileDownload, 
    // onFileView,
    onTogglePin,
    canPinMore,
    onLike,
    hasLiked,
    currentUserId,
    socket, // ADD SOCKET PROP HERE
}) => {
    const formatDisplayDate = (isoDateStr) => {
      if (!isoDateStr) return "";
      const date = DateTime.fromISO(isoDateStr);
      return date.toLocaleString({ 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    const formatDisplayTime = (isoDateStr) => {
      if (!isoDateStr) return "";
      const time = DateTime.fromISO(isoDateStr);
      return time.toLocaleString(DateTime.TIME_SIMPLE);
    };

    const getTimeAgo = (isoDateStr) => {
      if (!isoDateStr) return "";
      const date = DateTime.fromISO(isoDateStr);
      const now = DateTime.local();
      const diff = now.diff(date, ['days', 'hours', 'minutes']);
      
      if (diff.days > 0) {
        return `${Math.floor(diff.days)}d ago`;
      } else if (diff.hours > 0) {
        return `${Math.floor(diff.hours)}h ago`;
      } else {
        return `${Math.floor(diff.minutes)}m ago`;
      }
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
        case "Active":
          return "bg-green-100 text-green-700";
        case "Scheduled":
          return "bg-blue-100 text-blue-700";
        case "Completed":
          return "bg-gray-100 text-gray-700";
        case "Cancelled":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    const isUrgent = () => {
      const announcementDate = DateTime.fromISO(announcement.dateTime);
      const now = DateTime.local();
      const hoursDiff = announcementDate.diff(now, 'hours').hours;
      
      return announcement.priority === "High" && hoursDiff <= 24;
    };

    const placeholderImage = "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

    const getViewCount = (announcement) => {
      if (!announcement.views) return 0;
      return Array.isArray(announcement.views) ? announcement.views.length : 0;
    };

    const getLikeCount = (announcement) => {
      if (!announcement.acknowledgements) return 0;
      return Array.isArray(announcement.acknowledgements) ? announcement.acknowledgements.length : 0;
    };

    const viewCount = getViewCount(announcement);
    const likeCount = getLikeCount(announcement);
    
    const isLiked = hasLiked(announcement, currentUserId);
    const isAnnouncementUrgent = isUrgent();

    // Handle Read More with socket view emission
    const handleReadMore = () => {
      console.log('📖 Read More clicked for announcement:', announcement._id);
      
      // Emit view event via socket when user clicks Read More
      if (socket && currentUserId) {
        const viewData = {
          announcementId: announcement._id,
          userId: currentUserId
        };
        console.log('🔌 Emitting view from AnnouncementCard:', viewData);
        socket.emit('view-announcement', viewData);
        socket.emit('add-view', viewData);
      }
      
      // Call the original onReadMore function
      onReadMore(announcement);
    };

    // Handle Like with socket emission
    const handleLike = (e) => {
      e.stopPropagation();
      
      if (!currentUserId) return;
      
      console.log('❤️ Like clicked for announcement:', announcement._id);
      
      // Emit like event via socket
      if (socket) {
        const likeData = {
          announcementId: announcement._id,
          userId: currentUserId,
          liked: !isLiked
        };
        console.log('🔌 Emitting like from AnnouncementCard:', likeData);
        socket.emit('like-announcement', likeData);
        socket.emit('toggle-like', likeData);
      }
      
      // Call the original onLike function
      onLike(announcement._id, currentUserId);
    };

    return (
      <div className={`group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col relative`}>
        
        {/* Urgent Badge */}
        {isAnnouncementUrgent && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              URGENT
            </div>
          </div>
        )}

        <div className="relative h-40 overflow-hidden">
          {announcement.attachment && announcement.attachment.type.startsWith('image/') ? (
            <img
              src={announcement.attachment.data}
              alt={announcement.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <img
              src={placeholderImage}
              alt="Announcement"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          {/* Pin Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(announcement);
            }}
            disabled={!canPinMore && !announcement.isPinned}
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all duration-300 backdrop-blur-sm ${
              announcement.isPinned 
                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                : !canPinMore
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gray-500/80 text-white hover:bg-gray-600'
            }`}
          >
            {announcement.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            {announcement.isPinned ? 'Pinned' : 'Pin'}
          </button>

          {/* Status Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(announcement.status)}`}>
            {announcement.status}
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col">
          {/* Header with Priority */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 flex-1">
                {announcement.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)} whitespace-nowrap`}>
                {announcement.priority}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{formatDisplayDate(announcement.dateTime)}</span>
              <span>•</span>
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>{formatDisplayTime(announcement.dateTime)}</span>
              <span>•</span>
              <span className="text-gray-400">{getTimeAgo(announcement.dateTime)}</span>
            </div>
          </div>

          {/* Agenda */}
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
            {announcement.agenda}
          </p>

          {/* Posted By */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <User className="w-3 h-3" />
            <span className="font-medium">By: {announcement.postedBy}</span>
          </div>

          {/* File Attachment
          {announcement.attachment && !announcement.attachment.type.startsWith('image/') && (
            <div className="mb-3">
              <FileAttachment
                file={announcement.attachment}
                onDownload={onFileDownload}
                onView={onFileView}
              />
            </div>
          )} */}
          
          {/* Footer with Stats and Actions */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              {/* Views */}
              <div className="flex items-center gap-1 text-gray-600 text-sm" title={`${viewCount} views`}>
                <Eye className="w-4 h-4" />
                <span>{viewCount} views</span>
              </div>
              
              {/* Likes Button */}
              <button
                onClick={handleLike}
                disabled={!currentUserId}
                className="flex items-center gap-1 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/like"
                title={
                  !currentUserId 
                    ? "Please log in to like announcements" 
                    : isLiked 
                      ? "You liked this announcement" 
                      : "Like this announcement"
                }
              >
                <Heart 
                  className={`w-4 h-4 transition-all ${
                    isLiked 
                      ? 'text-red-500 fill-current scale-110' 
                      : 'text-gray-500 group-hover/like:text-red-500 group-hover/like:scale-110'
                  }`} 
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span className={isLiked ? 'text-red-500 font-medium' : 'text-gray-600'}>
                  {likeCount} likes</span>
              </button>
            </div>

            {/* Read More Button */}
            <button
              onClick={handleReadMore}
              className="w-auto bg-gradient-to-r from-[#ff0b0b] via-[#c11112] to-[#60020c] text-white py-2 px-4 rounded-[20px] text-sm font-medium hover:from-[#c11112] hover:via-[#ff0b0b] hover:to-[#c11112] transition-all duration-300 hover:shadow-lg flex items-center gap-2 group/readmore"
            >
              <span>Read More</span>
              <ArrowUpRight className="w-4 h-4 group-hover/readmore:translate-x-0.5 group-hover/readmore:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
};

export default AnnouncementCard;