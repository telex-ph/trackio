import { X } from "lucide-react";
import { Button, Spinner } from "flowbite-react";

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
}) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
      <div className="bg-dark rounded-xl shadow-lg p-6 w-full max-w-2xl relative border border-light container-light">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-light hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-light">
            Comments & History
          </h3>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600 mb-4">
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "comments"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "history"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "comments" && (
          <div>
            {/* New Comment Form */}
            <form onSubmit={onSubmitComment} className="mb-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-light font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    id="newComment"
                    rows="3"
                    className="w-full border border-light container-light rounded-lg px-3 py-2 text-light bg-transparent"
                    placeholder="Add a comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    disabled={isSubmitting}
                  ></textarea>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      {/* ... (disabled buttons) ... */}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      gradientDuoTone="purpleToBlue"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" />
                          <span className="pl-3">Posting...</span>
                        </>
                      ) : (
                        "Post Comment"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments Display Area */}
            <div className="bg-black/20 p-4 rounded-lg h-64 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner />
                  <span className="text-light ml-2">Loading comments...</span>
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={comment.$id || index}
                    className="text-light p-3 rounded-lg bg-gray-700/50"
                  >
                    <p className="text-sm font-semibold text-blue-300">
                      {comment.commentor?.name ||
                        comment.commentor?.email ||
                        "Unknown Sender"}
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDate(comment.$createdAt || comment.createdAt)}
                      </span>
                    </p>
                    <p className="text-white mt-1 whitespace-pre-wrap">
                      {comment.commentText}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-400">No comments yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">No history available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCommentsModal;