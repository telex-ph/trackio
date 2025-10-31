import { X, MessageSquare } from "lucide-react";
import { Button, Spinner } from "flowbite-react";

const TicketDetailsModal = ({
  isOpen,
  onClose,
  ticketDetails,
  isLoading,
  onViewComments,
  formatDate, // Kailangan natin 'to ipasa as prop
}) => {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-dark rounded-xl shadow-lg p-6 w-full max-w-4xl relative border border-light container-light">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-light hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-4 text-light">
          Ticket Details
        </h3>
        {isLoading ? (
          // Loading State
          <div className="flex justify-center items-center h-48">
            <Spinner size="xl" />
            <span className="text-light ml-3">Loading details...</span>
          </div>
        ) : ticketDetails ? (
          // Data Loaded State
          <div className="text-light max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* --- COLUMN 1: Main Content --- */}
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <p className="text-sm font-medium text-gray-400">Subject</p>
                  <p className="text-lg font-semibold">
                    {ticketDetails.subject}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Description
                  </p>
                  <p className="p-3 bg-black/20 rounded-lg mt-1 whitespace-pre-wrap min-h-[100px]">
                    {ticketDetails.description || (
                      <span className="text-gray-500">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

                {/* Resolution Notes */}
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Resolution Notes
                  </p>
                  <p className="p-3 bg-black/20 rounded-lg mt-1 whitespace-pre-wrap min-h-[100px]">
                    {ticketDetails.resolutionText || (
                      <span className="text-gray-500">
                        No resolution notes yet.
                      </span>
                    )}
                  </p>
                </div>

                {/* Attachment */}
                {ticketDetails.attachment &&
                ticketDetails.attachment.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Attachment
                    </p>
                    <a
                      href={ticketDetails.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all"
                    >
                      View Attachment
                    </a>
                  </div>
                ) : null}
              </div>

              {/* --- COLUMN 2: Details & Timeline --- */}
              <div className="space-y-4">
                {/* Ticket No & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Ticket No
                    </p>
                    <p className="text-lg font-bold">
                      Ticket#{ticketDetails.ticketNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Status</p>
                    <p className="text-lg font-bold text-blue-400">
                      {ticketDetails.status}
                    </p>
                  </div>
                </div>

                {/* Severity & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Severity
                    </p>
                    <p className="text-md">{ticketDetails.severity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Category
                    </p>
                    <p className="text-md">{ticketDetails.category}</p>
                  </div>
                </div>

                <hr className="border-gray-600" />

                {/* Requester Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Requester
                    </p>
                    <p className="text-md break-all">
                      {ticketDetails.requestee?.name || (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Station No
                    </p>
                    <p className="text-md">{ticketDetails.stationNo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Assigned To
                    </p>
                    <p className="text-md">
                      {ticketDetails.assignee?.name || (
                        <span className="text-gray-500">
                          Not yet assigned
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-600" />

                {/* Timeline */}
                <h4 className="text-md font-semibold text-gray-300">
                  Timeline
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Date Created
                    </p>
                    <p className="text-md">
                      {formatDate(ticketDetails.$createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-md">
                      {formatDate(ticketDetails.$updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Date Resolved
                    </p>
                    <p className="text-md">
                      {formatDate(ticketDetails.resolved_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Date Closed
                    </p>
                    <p className="text-md">
                      {formatDate(ticketDetails.closed_at)}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-600" />

                {/* Feedback */}
                <h4 className="text-md font-semibold text-gray-300">
                  User Feedback
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Rating</p>
                    <p className="text-md">
                      {ticketDetails.rating || (
                        <span className="text-gray-500">No rating</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Feedback
                    </p>
                    <p className="text-md">
                      {ticketDetails.feedback || (
                        <span className="text-gray-500">No feedback</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Footer --- */}
            <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-600">
              <Button
                type="button"
                onClick={onViewComments}
                color="gray"
                className="flex items-center gap-2"
              >
                <MessageSquare size={16} />
                View Comments
              </Button>
              <Button
                type="button"
                onClick={onClose}
                color="white"
                className="border border-light text-light"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          // Error State
          <div className="text-light text-center h-48 flex items-center justify-center">
            <p>Could not load ticket details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetailsModal;