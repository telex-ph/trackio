import React, { useState } from "react";
import {
  User,
  Eye,
  Heart,
  Pin,
  PinOff,
  ArrowUpRight,
  Paperclip,
  FileText,
  AlertCircle,
  X,
  Maximize2
} from "lucide-react";
import { DateTime } from "luxon";

const FileAttachment = ({ file, onView }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf": return <FileText className="w-4 h-4 text-rose-500" />;
      case "doc":
      case "docx": return <FileText className="w-4 h-4 text-indigo-500" />;
      default: return <Paperclip className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 BYTES';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  const getFileName = () => {
    if (file.fileName) return file.fileName;
    if (file.name) return file.name;
    if (file.url) {
      const urlParts = file.url.split('/');
      return urlParts[urlParts.length - 1].split('?')[0];
    }
    return 'ATTACHMENT';
  };

  const fileName = getFileName();

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onView(file); }}
      className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-lg mt-2 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer group/file"
    >
      <div className="p-1 bg-white rounded shadow-sm">
        {getFileIcon(fileName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold text-slate-700 truncate uppercase tracking-tight">
          {fileName}
        </p>
        <p className="text-[8px] text-slate-400 font-medium uppercase">
          {formatFileSize(file.size || 0)}
        </p>
      </div>
      <ArrowUpRight className="w-3 h-3 text-slate-300" />
    </div>
  );
};

const AnnouncementCard = ({
    announcement,
    onReadMore,
    onFileView,
    onTogglePin,
    canPinMore,
    onLike,
    hasLiked,
    currentUserId,
    socket,
}) => {
    const [isImageOpen, setIsImageOpen] = useState(false);

    const formatDisplayDate = (isoDateStr) => {
      if (!isoDateStr) return "";
      return DateTime.fromISO(isoDateStr).toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

    const formatDisplayTime = (isoDateStr) => {
      if (!isoDateStr) return "";
      return DateTime.fromISO(isoDateStr).toLocaleString(DateTime.TIME_SIMPLE).toUpperCase();
    };

    const getTimeAgo = (isoDateStr) => {
      if (!isoDateStr) return "";
      const date = DateTime.fromISO(isoDateStr);
      const now = DateTime.local();
      const diff = now.diff(date, ['days', 'hours', 'minutes']);
      if (diff.days > 0) return `${Math.floor(diff.days)}D AGO`;
      if (diff.hours > 0) return `${Math.floor(diff.hours)}H AGO`;
      return `${Math.floor(diff.minutes)}M AGO`;
    };

    const isUrgent = () => {
      const announcementDate = DateTime.fromISO(announcement.dateTime);
      const now = DateTime.local();
      const hoursDiff = announcementDate.diff(now, 'hours').hours;
      return announcement.priority === "High" && hoursDiff <= 24;
    };

    const placeholderImage = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80";
    const imageUrl = announcement.attachment?.type?.startsWith('image/') ? (announcement.attachment.url || announcement.attachment.data) : placeholderImage;
    const viewCount = announcement.views?.length || 0;
    const likeCount = announcement.acknowledgements?.length || 0;
    const isLiked = hasLiked(announcement, currentUserId);
    const isAnnouncementUrgent = isUrgent();

    const handleReadMore = () => {
      if (socket && currentUserId) {
        const viewData = { announcementId: announcement._id, userId: currentUserId };
        socket.emit('view-announcement', viewData);
        socket.emit('add-view', viewData);
      }
      onReadMore(announcement);
    };

    const handleLike = (e) => {
      e.stopPropagation();
      if (!currentUserId) return;
      if (socket) {
        const likeData = { announcementId: announcement._id, userId: currentUserId, liked: !isLiked };
        socket.emit('like-announcement', likeData);
        socket.emit('toggle-like', likeData);
      }
      onLike(announcement._id, currentUserId);
    };

    return (
      <>
        <div className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 flex flex-col h-[480px] w-full overflow-hidden relative mb-6">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
            <div>
              {isAnnouncementUrgent && (
                <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-[8px] font-black tracking-widest flex items-center gap-1 shadow-lg shadow-rose-500/20">
                  <AlertCircle className="w-3 h-3" />
                  URGENT
                </div>
              )}
            </div>
           
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(announcement); }}
              disabled={!canPinMore && !announcement.isPinned}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                announcement.isPinned
                  ? 'bg-amber-500 border-amber-400 text-white shadow-md'
                  : 'bg-white/90 border-slate-100 text-slate-400 hover:text-amber-500'
              } ${(!canPinMore && !announcement.isPinned) ? 'opacity-30' : ''}`}
            >
              {announcement.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          </div>
          <div
            onClick={() => setIsImageOpen(true)}
            className="relative h-48 flex-shrink-0 bg-slate-100 overflow-hidden cursor-zoom-in group/img"
          >
            <img
              src={imageUrl}
              alt={announcement.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
              onError={(e) => { e.target.src = placeholderImage; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
               <Maximize2 className="text-white w-8 h-8" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
          </div>

          <div className="px-5 pb-4 flex flex-col flex-1 min-h-0 -mt-6 relative z-10">
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-50 flex flex-col min-h-0 overflow-hidden flex-1">
             
              <div className="flex items-center gap-2 mb-3 overflow-hidden whitespace-nowrap">
                <div className="bg-indigo-50 px-2.5 py-1 rounded-md">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">
                    {formatDisplayDate(announcement.dateTime)}
                  </span>
                </div>
                <span className="text-slate-300 font-light">•</span>
                <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                    {formatDisplayTime(announcement.dateTime)}
                  </span>
                </div>
                <span className="text-slate-300 font-light">•</span>
                <span className="text-[9px] font-black text-indigo-400 lowercase italic uppercase">
                  {getTimeAgo(announcement.dateTime)}
                </span>
              </div>

              <h3 className="text-[14px] font-black text-slate-800 leading-tight mb-2 line-clamp-2 uppercase tracking-tight">
                {announcement.title}
              </h3>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-3 border-l-4 border-indigo-100 pl-3 uppercase">
                {announcement.agenda}
              </p>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <User className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">
                  BY: <span className="text-slate-600">{announcement.postedBy}</span>
                </span>
              </div>

              <div className="min-h-0">
                {announcement.attachment?.url && !announcement.attachment.type?.startsWith('image/') && (
                    <FileAttachment file={announcement.attachment} onView={onFileView} />
                )}
              </div>
            </div>
           
            <div className="mt-4 flex items-center justify-between px-2 flex-shrink-0">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] font-black">{viewCount}</span>
                </div>
               
                <button
                  onClick={handleLike}
                  disabled={!currentUserId}
                  className={`flex items-center gap-1.5 transition-all cursor-pointer ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-black">{likeCount}</span>
                </button>
              </div>

              <button
                onClick={handleReadMore}
                className="h-11 w-35 px-5 bg-[#800000] rounded-full hover:bg-[#600000] transition-all active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  VIEW DETAILS
                </span>
                <ArrowUpRight className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
        {isImageOpen && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsImageOpen(false)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors cursor-pointer">
              <X className="w-10 h-10" />
            </button>
            <img
              src={imageUrl}
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 object-contain"
              alt="EXPANDED VIEW"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </>
    );
};

export default AnnouncementCard;
