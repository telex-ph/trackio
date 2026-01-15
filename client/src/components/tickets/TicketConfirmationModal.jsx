import { X, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import toast from "react-hot-toast";

// --- StarRating Component (Yellow Stars) ---
const StarRating = ({ rating, setRating, disabled }) => {
  const maxRating = 5;
  const [hoverRating, setHoverRating] = useState(0);

  const getCurrentRating = () => hoverRating || rating;

  const handleMouseMove = (e, index) => {
    if (disabled) return;
    const starNode = e.currentTarget;
    const rect = starNode.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newRating = index + (isHalf ? 0.5 : 1);
    setHoverRating(newRating);
  };

  const handleClick = () => {
    if (disabled) return;
    setRating(hoverRating);
    setHoverRating(0);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="flex justify-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const currentRating = getCurrentRating();

        return (
          <div
            key={index}
            className={`relative w-6 h-6 transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={() => handleClick(index)}
            title={`${currentRating.toFixed(1)} stars`}
          >
            <Star className="w-6 h-6 text-gray-300 absolute top-0 left-0" />
            {(currentRating >= value) ? (
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 absolute top-0 left-0" />
            ) : (currentRating > index && currentRating < value) ? (
                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%', height: '100%' }}>
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ----------------------------------------------

const TicketConfirmationModal = ({
  isOpen,
  onClose,
  ticketDetails,
  isConfirming,
  onConfirm, 
}) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleClose = () => {
    setFeedback("");
    setRating(0);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please provide a rating (1-5 stars) to confirm resolution.");
      return;
    }
    onConfirm(feedback, rating); 
  };

  const isSubmitDisabled = isConfirming || rating === 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Container with Maroon Top Border */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh] border-t-[5px] border-red-800">
        
        {/* Header - White background, Maroon text */}
        <div className="bg-white px-6 py-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-red-800" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-800 leading-tight">Confirm Resolution & Feedback</h2>
              <p className="text-gray-500 text-sm">Mark ticket as resolved and provide feedback</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isConfirming}
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - No Scrollbar */}
        <div className="p-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 shadow-inner">
              <AlertCircle className="w-8 h-8 text-red-800" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
              Confirm Ticket Resolution
            </h3>
            <p className="text-sm text-gray-600 mb-6 px-4 leading-relaxed">
              Are you sure you want to confirm that this ticket has been resolved?
              Please provide your rating and optional feedback below.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-5 text-left mb-6 border border-gray-100">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Ticket No</span>
                  <span className="text-sm font-bold text-gray-900">#{ticketDetails?.ticketNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Subject</span>
                  <span className="text-sm font-semibold text-gray-900 truncate ml-4 max-w-[300px]" title={ticketDetails?.subject}>
                    {ticketDetails?.subject}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Current Status</span>
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700">
                    {ticketDetails?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Rating <span className="text-red-600">*</span>
              </label>
              <StarRating rating={rating} setRating={setRating} disabled={isConfirming} />
              {rating === 0 && (
                <p className="mt-2 text-xs text-red-600 font-medium">A rating is required to confirm resolution.</p>
              )}
            </div>

            {/* Feedback Input */}
            <div className="mb-6 text-left">
              <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isConfirming}
                className="w-full rounded-lg border border-slate-300 p-3 shadow-sm focus:border-red-800 focus:ring-1 focus:ring-red-800 transition-all text-sm outline-none"
                placeholder="Share your thoughts on the resolution..."
              ></textarea>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-800 text-center">
              <strong>Note:</strong> Once confirmed, the ticket status will be updated to "Resolved" and the user will be notified.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 px-4 py-2.5 bg-red-800 text-white font-bold rounded-lg hover:bg-red-900 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <Spinner size="sm" />
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Resolution</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmationModal;