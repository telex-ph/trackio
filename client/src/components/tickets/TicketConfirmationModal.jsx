import { X, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";

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

  const handleClick = (index) => {
    if (disabled) return;
    setRating(hoverRating);
    setHoverRating(0); 
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  return (
    <div className="flex justify-center space-x-1">
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const currentRating = getCurrentRating();

        return (
          <div
            key={index}
            className={`relative w-6 h-6 transition-colors ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onClick={() => handleClick(index)}
            onMouseLeave={handleMouseLeave}
            title={`${currentRating.toFixed(1)} stars`}
          >
            <Star className="w-6 h-6 text-gray-300 absolute top-0 left-0" />

            {(currentRating >= value) ? (
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 absolute top-0 left-0" />
            ) : (currentRating > index && currentRating < value) ? (
                <Star 
                    className="w-6 h-6 fill-yellow-400 text-yellow-400 absolute top-0 left-0"
                    style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                />
            ) : null}

          </div>
        );
      })}
    </div>
  );
};


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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Confirm Resolution & Feedback</h2>
              <p className="text-green-100 text-sm">Mark ticket as resolved and provide feedback</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isConfirming}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Ticket Resolution
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to confirm that this ticket has been resolved?
              Please provide your rating and optional feedback below.
            </p>
            
            {/* Ticket Info - Keep existing layout */}
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Ticket No</span>
                  <span className="text-sm font-bold text-gray-900">#{ticketDetails?.ticketNo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Subject</span>
                  <span className="text-sm font-semibold text-gray-900 truncate ml-2 max-w-[200px]" title={ticketDetails?.subject}>
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

            {/* Rating Input (Uses the new StarRating component) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Rating <span className="text-red-500">*</span>
              </label>
              <StarRating rating={rating} setRating={setRating} disabled={isConfirming} />
              {rating === 0 && (
                <p className="mt-2 text-xs text-red-500">A rating is required to confirm resolution.</p>
              )}
            </div>

            {/* Feedback Input */}
            <div className="mb-6 text-left">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isConfirming}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors"
                placeholder="Share your thoughts on the resolution..."
              ></textarea>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Once confirmed, the ticket status will be updated to "Resolved" and the user will be notified.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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