import {
  X,
  MessageSquare,
  Lock,
  Edit2,
  Send,
  History,
  FileText,
} from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";
import React from "react";

// --- Helper function to parse special comments ---
const parseConfirmationComment = (commentText) => {
  const confirmationPattern = /✅ Resolution confirmed by User:/;
  const match = commentText.match(confirmationPattern);
  if (match) {
    return { isConfirmation: true };
  }
  return { isConfirmation: false };
};

const TicketCommentsModal = ({
  isOpen,
  onClose,
  user,
  comments,
  isLoading,
  isSubmitting,
  newCommentText,
  setNewCommentText,
  onSubmitComment,
  activeTab,
  setActiveTab,
  formatDate,
  ticketStatus,
  onCommentUpdate,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  if (!isOpen) return null;

  const isResolved = ticketStatus?.toLowerCase() === "resolved";
  const isClosed = ticketStatus?.toLowerCase() === "closed";
  const canComment = !isResolved && !isClosed;
  const canEdit = !isResolved && !isClosed;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (newCommentText.trim() && canComment) {
      onSubmitComment(e);
      setIsExpanded(false);
      setShowQuickResponses(true);
    }
  };

  const handleStartEdit = (comment) => {
    if (!canEdit) return;
    setIsEditing(comment.$id);
    setEditedCommentText(comment.commentText);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditedCommentText("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editedCommentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    if (
      parseConfirmationComment(
        comments.find((c) => c.$id === commentId)?.commentText || ""
      ).isConfirmation
    ) {
      toast.error("Cannot edit a Resolution Confirmation comment.");
      handleCancelEdit();
      return;
    }

    if (comments.length > 0 && comments[0].$id !== commentId) {
      toast.error("You can only edit the newest comment.");
      handleCancelEdit();
      return;
    }

    setIsUpdatingComment(true);
    try {
      await onCommentUpdate(commentId, editedCommentText);
      toast.success("Comment updated successfully!");
      setIsEditing(null);
      setEditedCommentText("");
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment.");
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const quickResponses = [
    "Here's a quick status update:",
    "Thanks for your help with this!",
    "I completely agree with your point.",
  ];

  const handleQuickResponse = (response) => {
    if (!canComment) return;
    setNewCommentText(response);
    setIsExpanded(true);
    setShowQuickResponses(false);
  };

  const handleFocus = () => {
    if (!canComment) return;
    setIsExpanded(true);
    setShowQuickResponses(false);
  };

  const handleCancel = () => {
    setNewCommentText("");
    setIsExpanded(false);
    setShowQuickResponses(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-gray-400 relative">
        
        {/* Maroon Accent Line */}
        <div className="h-2 w-full bg-[#a10000] flex-shrink-0" />

        {/* Header Section */}
        <div className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center border border-gray-200 shadow-sm">
              <MessageSquare className="w-5 h-5 text-[#a10000]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Ticket Communication</h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-normal">Status:</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${isClosed || isResolved ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
                  {ticketStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex space-x-1 bg-gray-100 p-1 rounded border border-gray-200">
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
                  activeTab === "comments" ? "bg-white text-[#a10000] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 text-xs font-bold rounded transition-colors ${
                  activeTab === "history" ? "bg-white text-[#a10000] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                History
              </button>
            </nav>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors p-1" aria-label="Close">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-400">
            {activeTab === "comments" && (
              <div className="space-y-8 max-w-4xl mx-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Spinner size="xl" />
                    <p className="mt-4 text-gray-900 font-bold text-xs">Retrieving Messages...</p>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment, index) => {
                    const isCurrentUser = comment.commentor?.email === user.email;
                    const isNewest = index === 0;
                    const isCurrentCommentEditing = isEditing === comment.$id;
                    const { isConfirmation } = parseConfirmationComment(comment.commentText);
                    const attachments = Array.isArray(comment.attachment) 
                      ? comment.attachment 
                      : comment.attachment ? [comment.attachment] : [];

                    return (
                      <div key={comment.$id || index} className="flex gap-6 pb-8 border-b border-gray-200 last:border-0">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-md border-2 flex items-center justify-center font-bold text-sm shadow-sm ${
                            isConfirmation ? 'bg-amber-50 text-amber-700 border-amber-300' : 
                            isCurrentUser ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-900 border-gray-300'
                          }`}>
                            {getInitials(comment.commentor?.name || comment.commentor?.email)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-bold text-gray-900">
                                {comment.commentor?.name || comment.commentor?.email}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-gray-800 text-white px-1.5 py-0.5 rounded font-bold">You</span>
                              )}
                              {isConfirmation && (
                                <span className="text-[10px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded font-bold border border-amber-500">Confirmed</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-gray-600">{formatDate(comment.$createdAt || comment.createdAt)}</span>
                              {isCurrentUser && canEdit && isNewest && !isCurrentCommentEditing && !isConfirmation && (
                                <button 
                                  onClick={() => handleStartEdit(comment)}
                                  className="text-gray-400 hover:text-[#a10000] transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-1">
                            {isCurrentCommentEditing ? (
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-400 shadow-inner">
                                <textarea
                                  className="w-full bg-white p-3 border border-gray-300 rounded text-sm text-gray-900 outline-none resize-none font-bold"
                                  rows={4}
                                  value={editedCommentText}
                                  onChange={(e) => setEditedCommentText(e.target.value)}
                                  disabled={isUpdatingComment}
                                />
                                <div className="flex justify-end gap-3 mt-3">
                                  <button onClick={handleCancelEdit} className="text-xs font-bold text-gray-500 hover:text-gray-800">Cancel</button>
                                  <button 
                                    onClick={() => handleSaveEdit(comment.$id)}
                                    className="bg-gray-900 text-white px-4 py-1.5 rounded text-xs font-bold shadow-sm"
                                  >
                                    {isUpdatingComment ? "Saving..." : "Save Changes"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-[15px] text-gray-900 leading-relaxed font-semibold whitespace-pre-wrap">
                                {comment.commentText}
                              </div>
                            )}
                          </div>

                          {attachments.length > 0 && !isCurrentCommentEditing && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              {attachments.map((url, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 border border-gray-300 rounded bg-white hover:border-[#a10000] transition-colors shadow-sm">
                                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img 
                                      src={url} 
                                      alt="Attachment" 
                                      className="w-12 h-12 object-cover rounded border border-gray-300 cursor-pointer" 
                                      onClick={() => setSelectedImage(url)}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center text-gray-500">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[11px] font-bold text-gray-900 truncate max-w-[150px]">{url.split("/").pop()}</p>
                                    <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-[#a10000] font-black hover:underline">Download</a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-gray-400 font-bold text-sm">No activity recorded for this ticket.</div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="py-20 text-center text-gray-400 font-bold text-sm">System logs are empty.</div>
            )}
          </div>

          {/* Footer Input Section */}
          <div className="bg-gray-100 border-t border-gray-300 p-6 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              {canComment ? (
                <div className="bg-white border border-gray-400 rounded-lg shadow-md focus-within:border-[#a10000] transition-all overflow-hidden">
                  {showQuickResponses && !isExpanded && (
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
                      {quickResponses.map((text, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => handleQuickResponse(text)}
                          className="text-[10px] font-bold text-gray-700 bg-white border border-gray-300 px-3 py-1 rounded hover:text-[#a10000] hover:border-[#a10000] transition-all shadow-sm"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea
                    rows={isExpanded ? 5 : 2}
                    className="w-full p-4 text-[14px] text-gray-900 font-bold placeholder:text-gray-400 outline-none resize-none"
                    placeholder="Provide your update here..."
                    onFocus={handleFocus}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting}
                  />
                  <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                    
                    {/* Character Counter - Letter spacing removed */}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-500 tracking-normal">
                        Characters: <span className={newCommentText.length > 500 ? "text-red-600" : "text-gray-900"}>{newCommentText.length}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {isExpanded && (
                        <button onClick={handleCancel} className="text-xs font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                      )}
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newCommentText.trim()}
                        className="bg-[#a10000] hover:bg-[#800000] disabled:bg-gray-300 text-white px-6 py-2 rounded text-[11px] font-bold uppercase transition-all shadow-md flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <><Spinner size="sm" /> Sending...</>
                        ) : (
                          <><Send className="w-3.5 h-3.5" /> Post Comment</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-white border border-dashed border-gray-400 rounded-lg shadow-inner">
                  <span className="text-xs font-bold text-gray-500 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" /> Discussion Locked
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Image Preview */}
        {selectedImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} alt="Large preview" className="max-w-full max-h-full object-contain shadow-2xl rounded" />
            <button className="absolute top-10 right-10 text-white"><X className="w-10 h-10" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCommentsModal;