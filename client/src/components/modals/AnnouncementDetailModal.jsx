import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Eye,
  Calendar,
  Clock,
  FileText,
  Megaphone,
  Download,
  History,
  Pin,
  PinOff
} from "lucide-react";
import { DateTime } from "luxon";

const AnnouncementDetailModal = ({
  isOpen,
  onClose,
  announcement,
  onLike,
  currentUser,
  onTogglePin,
}) => {
  const [localViewCount, setLocalViewCount] = useState(0);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (announcement && isOpen) {
      setLocalViewCount(Array.isArray(announcement.views) ? announcement.views.length : 0);
      setLocalLikeCount(Array.isArray(announcement.acknowledgements) ? announcement.acknowledgements.length : 0);
      const liked = currentUser && announcement.acknowledgements?.some(ack => ack.userId === currentUser._id);
      setLocalIsLiked(liked);
      setIsLikeDisabled(liked);
      setIsPinned(!!announcement.isPinned);
    }
  }, [announcement, currentUser, isOpen]);

  if (!isOpen || !announcement) return null;

  const getTimeAgo = (isoDateStr) => {
    if (!isoDateStr) return "";
    const date = DateTime.fromISO(isoDateStr);
    const now = DateTime.now();
    const diff = now.diff(date, ['days', 'hours', 'minutes']).toObject();
    if (diff.days >= 1) return `${Math.floor(diff.days)}d ago`;
    if (diff.hours >= 1) return `${Math.floor(diff.hours)}h ago`;
    return "just now";
  };

  const getImageUrl = () => announcement.attachment?.url || announcement.attachment?.data;
 
  const isPdf = announcement.attachment &&
    (announcement.attachment.type === 'application/pdf' ||
     announcement.attachment.fileName?.toLowerCase().endsWith('.pdf'));

  const handleLikeClick = async () => {
    if (!onLike || !currentUser || isLikeDisabled) return;
    try {
      setLocalIsLiked(true);
      setLocalLikeCount(prev => prev + 1);
      setIsLikeDisabled(true);
      await onLike(announcement._id, currentUser._id);
    } catch (error) {
      setLocalIsLiked(false);
      setLocalLikeCount(prev => prev - 1);
      setIsLikeDisabled(false);
    }
  };

  const handlePinToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onTogglePin === 'function') {
      const nextState = !isPinned;
      setIsPinned(nextState);
      try {
        await onTogglePin({
          ...announcement,
          isPinned: nextState
        });
      } catch (error) {
        setIsPinned(!nextState);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
     
      <div className="relative w-full max-w-xl bg-white rounded-none border-t-[6px] border-[#800000] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
       
        {/* HEADER */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="w-4 h-4 text-[#800000]" />
            <span className="text-sm font-bold text-slate-800 uppercase">
              Announcement Details
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePinToggle}
              className={`p-1.5 rounded border transition-colors cursor-pointer ${
                isPinned
                ? 'bg-amber-500 border-amber-400 text-white shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* BODY - HIDDEN SCROLLBAR */}
        <div
          className="p-6 overflow-y-auto max-h-[70vh] space-y-5"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Webkit Specific CSS to hide scrollbar */}
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          <div className="space-y-1">
            {isPinned && (
              <p className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
                <Pin size={10} /> Priority Pin
              </p>
            )}
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {announcement.title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-500 py-2 border-y border-slate-50">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[#800000]" />
              {new Date(announcement.dateTime).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#800000]" />
              {new Date(announcement.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-1.5">
              <History size={13} className="text-[#800000]" />
              {getTimeAgo(announcement.dateTime)}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {announcement.agenda || "No content provided."}
            </p>
          </div>

          {(getImageUrl() || isPdf) && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Supporting Document</p>
              {isPdf ? (
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="text-red-600" size={20} />
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                      {announcement.attachment.fileName || "document.pdf"}
                    </span>
                  </div>
                  <a
                    href={getImageUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#800000] text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-[#600000] transition-colors"
                  >
                    <Download size={12} /> VIEW PDF
                  </a>
                </div>
              ) : (
                <div className="rounded border border-slate-200 overflow-hidden inline-block shadow-sm">
                  <img src={getImageUrl()} alt="Preview" className="max-h-[250px] w-auto object-contain" />
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#800000] rounded flex items-center justify-center text-white text-xs font-bold">
                {announcement.postedBy?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Posted By</p>
                <p className="text-xs font-bold text-slate-800">{announcement.postedBy}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer border ${
                  localIsLiked ? 'bg-[#800000] border-[#800000] text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <Heart size={14} className={localIsLiked ? 'fill-current' : ''} />
                <span className="text-xs font-bold">{localLikeCount}</span>
              </button>
              <div className="flex items-center gap-1.5 px-2 text-slate-400">
                <Eye size={14} />
                <span className="text-xs font-bold">{localViewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;
