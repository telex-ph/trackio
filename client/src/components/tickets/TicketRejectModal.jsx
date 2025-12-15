import { X, AlertCircle, Star, XCircle } from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";

const TicketRejectModal = ({
  isOpen,
  onClose,
  ticketDetails,
  isRejecting,
  onConfirm,
}) => {
  const [feedback, setFeedback] = useState("");

  const handleClose = () => {
    setFeedback("");
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (feedback.trim() === "") {
      toast.error("Please provide a comment to reject resolution.");
      return;
    }

    onConfirm(feedback);
  };

  const isSubmitDisabled = isRejecting;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Confirm Rejection & comment
              </h2>
              <p className="text-red-100 text-sm">
                Mark ticket as rejected and provide comment
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isRejecting}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reject Ticket Resolution
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject this ticket that has been marked
              as resolved? Please provide your comment below.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Ticket No
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    #{ticketDetails?.ticketNo}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Subject
                  </span>
                  <span
                    className="text-sm font-semibold text-gray-900 truncate ml-2 max-w-[200px]"
                    title={ticketDetails?.subject}
                  >
                    {ticketDetails?.subject}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Current Status
                  </span>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">
                    {ticketDetails?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-6 text-left">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Comment*
              </label>
              <textarea
                id="feedback"
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isRejecting}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="Share your thoughts on the resolution..."
              ></textarea>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Once confirmed, the ticket status will be
              updated to "In Progress" and the user will be notified.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isRejecting}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRejecting ? (
                <>
                  <Spinner size="sm" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Re-open Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketRejectModal;
