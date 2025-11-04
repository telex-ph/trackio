import { X, MessageSquare, Clock, Bold, Italic, Underline, Image as ImageIcon, Lock, Edit2, Save, Send } from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";

// --- Helper function to parse special comments (Unchanged) ---
const parseConfirmationComment = (commentText) => {
  const confirmationPattern = /✅ Resolution confirmed by User:/;
  const match = commentText.match(confirmationPattern);

  if (match) {
    return {
      isConfirmation: true,
    };
  }
  return { isConfirmation: false };
};
// -----------------------------------------------

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
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // State for editing
  const [isEditing, setIsEditing] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  if (!isOpen) return null;

  // Check if ticket is resolved or closed
  const isResolved = ticketStatus?.toLowerCase() === "resolved";
  const isClosed = ticketStatus?.toLowerCase() === "closed";
  const canComment = !isResolved && !isClosed;
  const canEdit = !isResolved && !isClosed; // This just checks ticket status

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCommentText.trim() && canComment) {
      onSubmitComment(e);
      setIsExpanded(false);
      setShowQuickResponses(true);
    }
  };

  // Handlers for editing
  const handleStartEdit = (comment) => {
    if (!canEdit) return;
    setIsEditing(comment.$id);
    setEditedCommentText(comment.commentText);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditedCommentText("");
  };

  // +++ BINAGO DITO: `handleSaveEdit` +++
  const handleSaveEdit = async (commentId) => {
    if (!editedCommentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    // Prevent editing confirmation comments
    if (
      parseConfirmationComment(
        comments.find((c) => c.$id === commentId)?.commentText || ""
      ).isConfirmation
    ) {
      toast.error("Cannot edit a Resolution Confirmation comment.");
      handleCancelEdit();
      return;
    }

    // +++ BAGONG CHECK +++
    // Check kung ito ang pinakabagong comment
    // Ang `comments` array ay dapat laging sorted newest-first
    if (comments.length > 0 && comments[0].$id !== commentId) {
      toast.error("You can only edit the newest comment.");
      handleCancelEdit();
      return;
    }
    // +++ END NG BAGONG CHECK +++

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
  // +++ END NG PAGBABAGO +++

  // Utility functions
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[700px] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-[#a10000] to-[#a10000] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Activity</h2>
              <p className="text-red-100 text-sm">Comments & History</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs - Fixed */}
        <div className="px-6 pt-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${
                activeTab === "comments"
                  ? "bg-white text-[#a10000] shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${
                activeTab === "history"
                  ? "bg-white text-[#a10000] shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                History
              </div>
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeTab === "comments" && (
            <div className="p-6 space-y-6">
              {/* New Comment Section - Sticky at top */}
              {canComment ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-0 z-10">
                  <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#a10000] to-[#a10000] flex items-center justify-center text-white font-bold shadow-md">
                          {getInitials(user.name)}
                        </div>
                      </div>
                      <div className="flex-1">
                        {!isExpanded && showQuickResponses ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#a10000] focus:border-transparent placeholder-gray-400 transition-all"
                              placeholder="Add a comment..."
                              onFocus={handleFocus}
                              readOnly
                            />
                            <div className="flex flex-wrap gap-2">
                              {quickResponses.map((response, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleQuickResponse(response)}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-all"
                                >
                                  {response.length > 30
                                    ? response.substring(0, 30) + "..."
                                    : response}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="border-2 border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-[#a10000] focus-within:border-transparent transition-all">
                              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Bold"
                                >
                                  <Bold className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Italic"
                                >
                                  <Italic className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Underline"
                                >
                                  <Underline className="w-4 h-4 text-gray-600" />
                                </button>
                                <div className="flex-1"></div>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Add image"
                                >
                                  <ImageIcon className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <textarea
                                rows="4"
                                className="w-full px-4 py-3 text-gray-900 bg-white focus:outline-none placeholder-gray-400 resize-none"
                                placeholder="Add a comment..."
                                value={newCommentText}
                                onChange={(e) =>
                                  setNewCommentText(e.target.value)
                                }
                                disabled={isSubmitting}
                                autoFocus
                              />
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {newCommentText.length} characters
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancel}
                                  className="px-4 py-2 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={
                                    isSubmitting || !newCommentText.trim()
                                  }
                                  className="px-4 py-2 bg-gradient-to-r from-[#a10000] to-[#a10000] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                  {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                      <Spinner size="sm" />
                                      Posting...
                                    </span>
                                  ) : (
                                    "Save"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl shadow-sm border-2 border-gray-300 p-5 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900">
                        Comments Disabled
                      </h3>
                      <p className="text-xs text-gray-600">
                        {isClosed
                          ? "This ticket is closed. No more comments can be added."
                          : "This ticket is resolved. No more comments can be added."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List - Scrollable */}
              <div className="space-y-4 pb-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Spinner size="lg" />
                    <span className="text-gray-600 mt-4 font-medium">
                      Loading comments...
                    </span>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment, index) => {
                    const isNewest = index === 0; // Check kung ito ang nasa index 0 (newest)
                    const isCurrentUser =
                      comment.commentor?.email === user.email;
                    const isCurrentCommentEditing = isEditing === comment.$id;
                    const { isConfirmation } = parseConfirmationComment(
                      comment.commentText
                    );

                    return (
                      <div
                        key={comment.$id || index}
                        className={`rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                          isConfirmation
                            ? "bg-yellow-50 border-yellow-300"
                            : isNewest && !isCurrentUser
                            ? "border-[#a10000]/30 bg-red-50/30"
                            : isCurrentUser
                            ? "border-green-300 bg-green-50/30"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-md ${
                                  isCurrentUser || isConfirmation
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                    : "bg-gradient-to-br from-gray-500 to-gray-600"
                                }`}
                              >
                                {getInitials(
                                  comment.commentor?.name ||
                                    comment.commentor?.email
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-gray-900">
                                    {comment.commentor?.name ||
                                      comment.commentor?.email ||
                                      "Unknown User"}
                                  </h4>
                                  {isNewest &&
                                    !isCurrentUser &&
                                    !isConfirmation && (
                                      <span className="px-2.5 py-1 text-xs font-bold bg-[#a10000] text-white rounded-full shadow-sm">
                                        NEW
                                      </span>
                                    )}
                                  {isCurrentUser && !isConfirmation && (
                                    <span className="px-2.5 py-1 text-xs font-bold bg-green-500 text-white rounded-full shadow-sm">
                                      YOU
                                    </span>
                                  )}
                                  {isConfirmation && (
                                    <span className="px-2.5 py-1 text-xs font-bold bg-yellow-600 text-white rounded-full shadow-sm">
                                      RESOLUTION CONFIRMED
                                    </span>
                                  )}
                                  {comment.status && (
                                    <span className="px-2.5 py-1 text-xs font-bold bg-purple-500 text-white rounded-full shadow-sm">
                                      {comment.status}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* +++ BINAGO DITO: Display logic ng Edit Button +++ */}
                                  {/* Idinagdag ang 'isNewest' sa condition */}
                                  {isCurrentUser &&
                                    canEdit &&
                                    isNewest && 
                                    !isCurrentCommentEditing &&
                                    !isConfirmation && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(comment)}
                                        className="p-1 hover:bg-gray-100 rounded transition-colors text-blue-600"
                                        title="Edit Comment"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  {/* +++ END NG PAGBABAGO +++ */}
                                  
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium whitespace-nowrap">
                                      {formatDate(
                                        comment.$createdAt || comment.createdAt
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {isCurrentCommentEditing ? (
                                <div className="pt-2 space-y-3">
                                  <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    value={editedCommentText}
                                    onChange={(e) =>
                                      setEditedCommentText(e.target.value)
                                    }
                                    disabled={isUpdatingComment}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      disabled={isUpdatingComment}
                                      className="px-4 py-2 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSaveEdit(comment.$id)
                                      }
                                      disabled={
                                        isUpdatingComment ||
                                        !editedCommentText.trim()
                                      }
                                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                      {isUpdatingComment ? (
                                        <Spinner size="sm" />
                                      ) : (
                                        <Save className="w-4 h-4" />
                                      )}
                                      Save Changes
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                  {comment.commentText}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No comments yet
                      </h3>
                      <p className="text-sm text-gray-500 max-w-sm">
                        {canComment
                          ? "Be the first to start the conversation. Share your thoughts above!"
                          : "No comments have been added to this ticket."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-6 h-full flex items-center justify-center">
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 max-w-md">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No history available
                  </h3>
                  <p className="text-sm text-gray-500">
                    Activity history will appear here once changes are made to
                    this ticket.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketCommentsModal;