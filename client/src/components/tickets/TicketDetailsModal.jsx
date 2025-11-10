import {
  X,
  MessageSquare,
  Clock,
  FileText,
  CheckCircle,
  Lock,
  Edit2,
  Save,
  XCircle
} from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Bearer Token
const bearerToken =
  "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47";

// +++ HELPER COMPONENT +++
const AttachmentViewerModal = ({ isOpen, onClose, attachmentUrl }) => {
  if (!isOpen) return null;

  // +++ FIXED FUNCTION +++
  // Ginawang mas robust para i-handle ang non-string values
  const getFileExtension = (url) => {
    // Siguraduhin na ito ay isang string bago mag-split
    if (typeof url !== "string" || !url) {
      return "";
    }
    const parts = url.split("?")[0].split("."); // Handle URLs with query params
    return parts.pop().toLowerCase();
  };
  // +++ END OF FIX +++

  const extension = getFileExtension(attachmentUrl);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
    extension
  );
  const isPdf = extension === "pdf";

  let content;

  if (isImage) {
    content = (
      <img
        src={attachmentUrl}
        alt="Attachment"
        className="max-w-full max-h-full object-contain"
      />
    );
  } else if (isPdf) {
    content = (
      <iframe
        src={attachmentUrl}
        title="Attachment Preview"
        className="w-full h-full"
        frameBorder="0"
      />
    );
  } else {
    // Fallback para sa mga file na hindi pwedeng i-preview (e.g., .zip, .docx)
    content = (
      <div className="text-center text-white bg-gray-700 p-10 rounded-lg">
        <p className="text-lg mb-4">Cannot preview this file type.</p>
        <a
          href={attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Download / View File
        </a>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4" // z-60 para pumantay sa ibabaw ng main modal (z-50)
      onClick={onClose} // Isara kapag nag-click sa labas
    >
      <div
        className={`bg-black/30 p-4 rounded-lg w-full ${
          isPdf ? "max-w-5xl h-[90vh]" : "max-w-4xl h-auto max-h-[90vh]"
        } relative flex items-center justify-center`}
        onClick={(e) => e.stopPropagation()} // Pigilan ang pag-close kapag sa loob ng content nag-click
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div
          className={`flex items-center justify-center ${
            isPdf ? "w-full h-full" : "w-auto h-auto"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
};
// +++ END NG HELPER COMPONENT +++

const TicketDetailsModal = ({
  isOpen,
  onClose,
  ticketDetails,
  isLoading,
  onViewComments,
  onConfirmResolution,
  onRejectResolution,
  formatDate,
  userEmail,
  onTicketUpdate,
}) => {
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editedSubject, setEditedSubject] = useState("");
  const [isEditingStationNo, setIsEditingStationNo] = useState(false);
  const [editedStationNo, setEditedStationNo] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

  if (!isOpen) return null;

  // Check ticket status and if it's editable
  const isResolved = ticketDetails?.status?.toLowerCase() === "resolved";
  const isClosed = ticketDetails?.status?.toLowerCase() === "closed";
  const isTicketEditable = !isResolved && !isClosed;
  const canConfirm =
    isResolved && ticketDetails?.ticketNo && !ticketDetails?.agentConfirmed;

  // Handlers for editing
  const handleEdit = (field) => {
    if (field === "subject") {
      setEditedSubject(ticketDetails.subject || "");
      setIsEditingSubject(true);
    } else if (field === "stationNo") {
      setEditedStationNo(ticketDetails.stationNo || "");
      setIsEditingStationNo(true);
    } else if (field === "description") {
      setEditedDescription(ticketDetails.description || "");
      setIsEditingDescription(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingSubject(false);
    setEditedSubject("");
    setIsEditingStationNo(false);
    setEditedStationNo("");
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  const handleSaveTicketDetails = async () => {
    const newSubject = isEditingSubject
      ? editedSubject.trim()
      : ticketDetails.subject;
    const newStationNo = isEditingStationNo
      ? editedStationNo.trim()
      : ticketDetails.stationNo;
    const newDescription = isEditingDescription
      ? editedDescription.trim()
      : ticketDetails.description;

    // Validation checks
    if (isEditingSubject && !newSubject) {
      toast.error("Subject cannot be empty");
      return;
    }
    if (isEditingStationNo) {
      const stationNoValue = Number(newStationNo);
      if (!newStationNo) {
        toast.error("Station Number cannot be empty");
        return;
      }
      if (isNaN(stationNoValue) || stationNoValue < 0) {
        toast.error("Station Number must be a valid positive number");
        return;
      }
      // NEW VALIDATION: Limit to 178
      if (stationNoValue > 178) {
        toast.error("Station Number cannot exceed 178");
        return;
      }
    }

    if (isEditingDescription && !newDescription) {
      toast.error("Description cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const url =
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/updateTicket";

      const payload = {
        email: userEmail,
        updateTicketNo: ticketDetails.ticketNo,
        // Only send the potentially updated values
        subject: newSubject,
        description: newDescription,
        stationNo: Number(newStationNo),
      };

      await axios.patch(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      toast.success("Ticket details updated successfully!");
      handleCancelEdit(); // Close all editing modes

      // Update the local ticket details
      if (onTicketUpdate) {
        onTicketUpdate({
          ...ticketDetails,
          subject: newSubject,
          description: newDescription,
          stationNo: newStationNo, // Keep as string for display if API sends it that way, but convert to Number for API payload
        });
      }
    } catch (error) {
      console.error("Failed to update ticket details:", error);
      toast.error("Failed to update ticket details");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if any field is currently being edited
  const isEditingAnyField =
    isEditingSubject || isEditingStationNo || isEditingDescription;

  // Content to display inside the subject/stationNo/description card when editing is active
  const EditingControls = ({ onSave, onCancel, isSaving }) => (
    <div className="flex gap-2 mt-3">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Spinner size="sm" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save
          </>
        )}
      </button>
      <button
        onClick={onCancel}
        disabled={isSaving}
        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
    </div>
  );

  return (
    // Ang z-50 dito ay ang main modal
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
        style={{ height: "700px", maxHeight: "90vh" }}
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
              <span className="text-gray-600 mt-4 font-medium">
                Loading details...
              </span>
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
                      This ticket has been resolved. Please confirm the
                      resolution to close the ticket.
                    </p>
                  </div>
                </div>
              )}

              {/* Closed Alert - Show only if status is Closed */}
              {isClosed && (
                <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-900 mb-1">
                      Ticket Closed
                    </h3>
                    <p className="text-xs text-red-700">
                      This ticket has been closed. Both parties have confirmed
                      the resolution.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* COLUMN 1: Main Content */}
                <div className="space-y-5">
                  {/* Subject with Edit */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Subject
                      </p>
                      {!isEditingAnyField && isTicketEditable && (
                        <button
                          onClick={() => handleEdit("subject")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingSubject ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="w-full p-2.5 text-base font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter ticket subject..."
                          disabled={isSaving}
                        />
                        <EditingControls
                          onSave={handleSaveTicketDetails}
                          onCancel={handleCancelEdit}
                          isSaving={isSaving}
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-gray-900">
                        {ticketDetails.subject}
                      </p>
                    )}
                  </div>

                  {/* Description with Edit */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Description
                      </p>
                      {!isEditingAnyField && isTicketEditable && (
                        <button
                          onClick={() => handleEdit("description")}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      )}
                    </div>

                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          className="w-full min-h-[120px] p-4 text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Enter ticket description..."
                          disabled={isSaving}
                        />
                        <EditingControls
                          onSave={handleSaveTicketDetails}
                          onCancel={handleCancelEdit}
                          isSaving={isSaving}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                        {/* FIXED LOGIC: Display actual description or the placeholder */}
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {ticketDetails.description || (
                            <span className="text-gray-400 italic">
                              No description provided.
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Resolution Notes */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Resolution Notes
                    </p>
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
                  {ticketDetails.attachment &&
                    ticketDetails.attachment.length > 0 && (
                      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Attachment
                        </p>

                        <button
                          type="button"
                          onClick={() => setIsAttachmentModalOpen(true)}
                          className="inline-flex items-center gap-2 text-[#a10000] hover:text-[#a10000] font-medium text-sm underline"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          View Attachment
                        </button>
                      </div>
                    )}
                </div>

                {/* COLUMN 2: Details & Timeline */}
                <div className="space-y-5">
                  {/* Ticket Info Card */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Ticket No
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          #{ticketDetails.ticketNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                            ticketDetails.status === "Open"
                              ? "bg-blue-100 text-blue-700"
                              : ticketDetails.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : ticketDetails.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : ticketDetails.status === "Closed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ticketDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Severity & Category */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Severity
                        </p>
                        <span
                          className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${
                            ticketDetails.severity === "Critical"
                              ? "bg-red-100 text-red-700"
                              : ticketDetails.severity === "High"
                              ? "bg-orange-100 text-orange-700"
                              : ticketDetails.severity === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ticketDetails.severity}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Category
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.category}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requester Info & Station No with Edit */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      People Involved
                    </p>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Requester
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.requestee?.name || (
                            <span className="text-gray-400 italic">N/A</span>
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Station No with Edit */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-gray-500">
                              Station No
                            </p>
                            {!isEditingAnyField && isTicketEditable && (
                              <button
                                onClick={() => handleEdit("stationNo")}
                                className="flex items-center text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors p-1"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {isEditingStationNo ? (
                            <div className="space-y-3">
                              <input
                                type="number"
                                value={editedStationNo}
                                onChange={(e) =>
                                  setEditedStationNo(e.target.value)
                                }
                                className="w-full p-2.5 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter station no. (max 178)"
                                disabled={isSaving}
                                min="1"
                                max="178" // Added max attribute
                              />
                              <EditingControls
                                onSave={handleSaveTicketDetails}
                                onCancel={handleCancelEdit}
                                isSaving={isSaving}
                              />
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900">
                              {ticketDetails.stationNo}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Assigned To
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {ticketDetails.assignee?.name || (
                              <span className="text-gray-400 italic">
                                Not assigned
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      Timeline
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Date Created
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.$createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Last Updated
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.$updatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Date Resolved
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.resolved_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Date Closed
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(ticketDetails.closed_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Feedback */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                      User Feedback
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Rating
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.rating ? (
                            <span className="flex items-center gap-1">
                              {ticketDetails.rating}
                              <svg
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">
                              No rating
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Feedback
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ticketDetails.feedback || (
                            <span className="text-gray-400 italic">
                              No feedback
                            </span>
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

                  {/* Confirm Resolution Button - Only show if status is Resolved and not yet confirmed */}
                  {canConfirm && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onConfirmResolution(ticketDetails)}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm Resolution
                      </button>

                      <button
                        type="button"
                        onClick={() => onRejectResolution(ticketDetails)}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Resolution
                      </button>
                    </div>
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
              <p className="text-gray-600 font-medium">
                Could not load ticket details.
              </p>
            </div>
          )}
        </div>
      </div>

      {ticketDetails?.attachment && ticketDetails.attachment.length > 0 && (
        <AttachmentViewerModal
          isOpen={isAttachmentModalOpen}
          onClose={() => setIsAttachmentModalOpen(false)}
          attachmentUrl={
            Array.isArray(ticketDetails.attachment)
              ? ticketDetails.attachment[0]
              : ticketDetails.attachment
          }
        />
      )}
    </div>
  );
};

export default TicketDetailsModal;
