import { X, MessageSquare, Clock, FileText, CheckCircle } from "lucide-react";
import { Spinner } from "flowbite-react";

const TicketDetailsModal = ({
  isOpen,
  onClose,
  ticketDetails,
  isLoading,
  onViewComments,
  onConfirmResolution,
  formatDate,
}) => {
  
  if (!isOpen) return null;

  // Check if ticket status is "Resolved" (case-insensitive)
  const isResolved = ticketDetails?.status?.toLowerCase() === 'resolved';
  const canConfirm = isResolved && ticketDetails?.ticketNo;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
        style={{ height: '700px', maxHeight: '90vh' }}
      >
        
        {/* Header - FIXED */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#a10000] to-[#a10000] px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ticket Details</h2>
              <p className="text-red-100 text-sm">Complete Information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Area - SCROLLABLE */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 rounded-b-2xl">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col justify-center items-center h-full">
              <Spinner size="xl" />
              <span className="text-gray-600 mt-4 font-medium">Loading details...</span>
            </div>
          ) : ticketDetails ? (
            // Data Loaded State
            <div className="p-6">
              {/* Resolution Alert - Show only if status is Resolved */}
              {isResolved && (
                <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-green-900 mb-1">
                      Ticket Marked as Resolved
                    </h3>
                    <p className="text-xs text-green-700">
                      This ticket has been resolved. Please confirm the resolution to close the ticket.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUMN 1: Main Content */}
                <div className="space-y-5">
                  
                  {/* Subject */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subject</p>
                    <p className="text-lg font-bold text-gray-900">
                      {ticketDetails.subject}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Description</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {ticketDetails.description || (
                          <span className="text-gray-400 italic">
                            No description provided.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Resolution Notes */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolution Notes</p>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {ticketDetails.resolutionText || (
                          <span className="text-gray-400 italic">
                            No resolution notes yet.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Attachment */}
                  {ticketDetails.attachment && ticketDetails.attachment.length > 0 && (
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Attachment</p>
                      <a
                        href={ticketDetails.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#a10000] hover:text-[#a10000] font-medium text-sm underline"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>

                {/* COLUMN 2: Details & Timeline */}
                <div className="space-y-5">
                  
                  {/* Ticket Info Card */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ticket No</p>
                        <p className="text-xl font-bold text-gray-900">
                          #{ticketDetails.ticketNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
                        <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                          ticketDetails.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                          ticketDetails.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                          ticketDetails.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                          ticketDetails.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticketDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Severity & Category */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Severity</p>
                        <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                          ticketDetails.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          ticketDetails.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                          ticketDetails.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {ticketDetails.severity}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
                        <p className="text-sm font-semibold text-gray-900">{ticketDetails.category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requester Info */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">People Involved</p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Requester</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.requestee?.name || (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Station No</p>
                          <p className="text-sm font-semibold text-gray-900">{ticketDetails.stationNo}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Assigned To</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {ticketDetails.assignee?.name || (
                              <span className="text-gray-400 italic">Not assigned</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Timeline</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Date Created</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.$createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.$updatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Date Resolved</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.resolved_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Date Closed</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.closed_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Feedback */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">User Feedback</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Rating</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.rating ? (
                            <span className="flex items-center gap-1">
                              {ticketDetails.rating}
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No rating</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Feedback</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.feedback || (
                            <span className="text-gray-400 italic">No feedback</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed at Bottom of Content */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-gray-200">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onViewComments}
                    className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    View Comments
                  </button>
                  
                  {/* Confirm Resolution Button - Only show if status is Resolved */}
                  {canConfirm && (
                    <button
                      type="button"
                      onClick={() => onConfirmResolution(ticketDetails)}
                      className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm Resolution
                    </button>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#a10000] to-[#a10000] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Error State
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Could not load ticket details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;