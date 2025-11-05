"use client";

import { useState, useRef, useEffect } from "react";
import { Ticket } from "lucide-react";
import { Button, Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";

// Import modal components
import AddTicketModal from "../../components/tickets/AddTicketModal";
import TicketDetailsModal from "../../components/tickets/TicketDetailsModal";
import TicketCommentsModal from "../../components/tickets/TicketCommentsModal";
import TicketConfirmationModal from "../../components/tickets/TicketConfirmationModal";

// Import ang bagong grid component
import TicketsGrid from "../../components/tickets/TicketsGrid";

// Helper function for date formatting (Naiwan dito kasi ginagamit ng Modals)
const formatDate = (dateString) => {
  if (!dateString) {
    return <span className="text-gray-500">N/A</span>;
  }
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Bearer Token - IMPORTANT: Store this securely, not hardcoded in production code!
const bearerToken =
  "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47";

const TicketsTable = () => {
  const user = useStore((state) => state.user);

  const tableRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [ticketComments, setTicketComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [activeTab, setActiveTab] = useState("comments");

  // Confirmation modal state
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [formData, setFormData] = useState({
    email: user.email,
    stationNo: "",
    subject: "",
    description: "",
    category: "",
    severity: "",
    status: "OPEN",
  });

  const [tickets, setTickets] = useState([]);

  // Function to fetch the list of tickets with resolution time details
  const fetchTickets = async () => {
    if (!user.email) {
      setIsLoading(false);
      setFormData((prev) => ({ ...prev, email: "" }));
      return;
    }

    setFormData((prev) => ({ ...prev, email: user.email }));

    setIsLoading(true);
    try {
      const url = `https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/${user.email}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      // Get documents
      const documents = response.data.data.documents || [];

      // Fetch detailed info for each ticket to get resolution_time
      const ticketsWithDetails = await Promise.all(
        documents.map(async (ticket) => {
          try {
            const detailUrl = `https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/overview/${user.email}/${ticket.ticketNo}`;
            const detailResponse = await axios.get(detailUrl, {
              headers: {
                "Content-Type": "application/json",
                Authorization: bearerToken,
              },
            });

            const detailData = detailResponse.data?.data;
            let ticketDetail = null;
            
            if (detailData?.document && Array.isArray(detailData.document) && detailData.document.length > 0) {
              ticketDetail = detailData.document[0];
            } else if (Array.isArray(detailData) && detailData.length > 0) {
              ticketDetail = detailData[0];
            } else if (detailData && typeof detailData === "object" && !Array.isArray(detailData)) {
              ticketDetail = detailData;
            }

            return {
              ...ticket,
              resolution_time: ticketDetail?.resolution_time || null,
              paused_at: ticketDetail?.paused_at || null,
              duration: ticketDetail?.duration || null,
              closed_at: ticketDetail?.closed_at || null,
            };
          } catch (error) {
            console.error(`Failed to fetch details for ticket ${ticket.ticketNo}:`, error);
            return ticket;
          }
        })
      );

      // Sort by ticketNo (descending order)
      ticketsWithDetails.sort((a, b) => Number(b.ticketNo) - Number(a.ticketNo));

      setTickets(ticketsWithDetails);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load tickets");
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of tickets
  useEffect(() => {
    fetchTickets();
  }, [user.email]);

  // Function to fetch detailed ticket data
  const fetchTicketDetails = async () => {
    if (!isDetailsModalOpen || !selectedTicket || !user.email) {
      return;
    }

    setIsModalLoading(true);
    setTicketDetails(null);

    try {
      const url = `https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/overview/${user.email}/${selectedTicket.ticketNo}`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      const responseData = response.data?.data;
      let ticketData = null;
      if (
        responseData &&
        responseData.document &&
        Array.isArray(responseData.document) &&
        responseData.document.length > 0
      ) {
        ticketData = responseData.document[0];
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        ticketData = responseData[0];
      } else if (
        responseData &&
        typeof responseData === "object" &&
        responseData !== null &&
        !Array.isArray(responseData)
      ) {
        ticketData = responseData;
      } else {
        throw new Error("Unexpected data format from API");
      }

      // Fetch comments to check if agent already confirmed
      const commentsUrl = `https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/comments/${user.email}/${selectedTicket.ticketNo}`;
      const commentsResponse = await axios.get(commentsUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      const commentsData =
        commentsResponse.data?.data || commentsResponse.data || [];
      const commentsList = Array.isArray(commentsData)
        ? commentsData
        : commentsData.documents && Array.isArray(commentsData.documents)
        ? commentsData.documents
        : [];

      // Check if there's a confirmation comment from this user
      const hasUserConfirmation = commentsList.some(
        (comment) =>
          comment.commentText &&
          comment.commentText.includes("Resolution confirmed by User:")
      );

      // Add confirmation flag to ticket data
      ticketData.agentConfirmed = hasUserConfirmation;
      setTicketDetails(ticketData);
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
      toast.error("Could not fetch ticket details.");
      setIsDetailsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Load details when modal opens
  useEffect(() => {
    fetchTicketDetails();
  }, [isDetailsModalOpen, selectedTicket, user.email]);

  // Function to fetch comments
  const fetchComments = async () => {
    if (!selectedTicket || !user.email) return;

    setIsCommentsLoading(true);
    try {
      const url = `https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/comments/${user.email}/${selectedTicket.ticketNo}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      const commentsData = response.data?.data;
      if (Array.isArray(commentsData)) {
        setTicketComments(commentsData);
      } else if (commentsData && Array.isArray(commentsData.documents)) {
        setTicketComments(commentsData.documents);
      } else if (Array.isArray(response.data)) {
        setTicketComments(response.data);
      } else {
        setTicketComments([]);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Could not load comments.");
      setTicketComments([]);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Load comments when modal opens
  useEffect(() => {
    if (isCommentsModalOpen) {
      fetchComments();
      setActiveTab("comments");
    } else {
      setTicketComments([]);
      setNewCommentText("");
    }
  }, [isCommentsModalOpen]);

    // FIXED: Handle file upload (attachment) with better error handling and logging
  const handleFileUpload = async () => {
    if (!attachmentFile) {
      console.log("No attachment file selected");
      return null;
    }

    try {
      console.log("Starting file upload...", {
        fileName: attachmentFile.name,
        fileSize: attachmentFile.size,
        fileType: attachmentFile.type
      });

      const formData = new FormData();
      formData.append("files", attachmentFile);
      formData.append("folder", "tickets");

      const res = await api.post(`/media/upload-media`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", res.data);

      // Try multiple possible response structures
      let uploadedUrl = null;
      
      // Check if response.data is an array (multiple files)
      if (Array.isArray(res.data) && res.data.length > 0) {
        uploadedUrl = res.data[0].url || res.data[0].secure_url;
      }
      // Check if response.data has files array
      else if (res.data?.files && Array.isArray(res.data.files) && res.data.files.length > 0) {
        uploadedUrl = res.data.files[0].url || res.data.files[0].secure_url || res.data.files[0].path;
      }
      // Check direct properties on res.data (Cloudinary direct response)
      else if (res.data?.url) {
        uploadedUrl = res.data.url;
      } else if (res.data?.secure_url) {
        uploadedUrl = res.data.secure_url;
      }
      // Check nested data object
      else if (res.data?.data?.url) {
        uploadedUrl = res.data.data.url;
      } else if (res.data?.data?.secure_url) {
        uploadedUrl = res.data.data.secure_url;
      }

      if (uploadedUrl) {
        console.log("File uploaded successfully:", uploadedUrl);
        toast.success("Attachment uploaded!");
        return uploadedUrl;
      } else {
        console.error("Upload succeeded but no URL found in response:", res.data);
        toast.error("Upload succeeded but no file URL returned");
        return null;
      }
    } catch (err) {
      console.error("File upload error:", err);
      console.error("Error response:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to upload attachment");
      return null;
    }
  };

  // Handle adding a new ticket
  const handleAddTicket = async (e) => {
    e.preventDefault();

    if (
      !formData.stationNo ||
      !formData.subject ||
      !formData.description ||
      !formData.category ||
      !formData.severity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting ticket creation...");

      let uploadedUrl = "";
      if (attachmentFile) {
        console.log("Uploading attachment...");
        const toastId = toast.loading("Uploading attachment...");
        
        uploadedUrl = await handleFileUpload();
        toast.dismiss(toastId);
        
        console.log("Attachment upload result:", uploadedUrl);

        if (!uploadedUrl) {
          // Ask user if they want to continue without attachment
          const continueWithoutAttachment = window.confirm(
            "Attachment upload failed. Do you want to create the ticket without attachment?"
          );
          
          if (!continueWithoutAttachment) {
            setIsSubmitting(false);
            return;
          }
          uploadedUrl = "";
        }
      }

      const ticketData = {
        email: formData.email,
        stationNo: Number(formData.stationNo),
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        status: formData.status,
        attachment: uploadedUrl,
      };

      console.log("Sending ticket data:", ticketData);

      const response = await axios.post(
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets",
        ticketData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: bearerToken,
          },
        }
      );

      console.log("Ticket creation response:", response.data);

      toast.success("Ticket added successfully!");

      setIsModalOpen(false);
      setFormData({
        email: user.email,
        stationNo: "",
        subject: "",
        description: "",
        category: "",
        severity: "",
        status: "OPEN",
      });
      setAttachmentFile(null);

      await fetchTickets();
    } catch (error) {
      console.error("Ticket creation error:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add ticket";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle posting a new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      return toast.error("Comment cannot be empty");
    }

    setIsSubmittingComment(true);
    try {
      const url =
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/itTicketComment";
      const payload = {
        email: user.email,
        ticketNum: selectedTicket.ticketNo,
        commentText: newCommentText,
      };

      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      toast.success("Comment posted!");
      setNewCommentText("");
      await fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle updating an existing comment
  const handleUpdateComment = async (commentId, updatedText) => {
    if (!selectedTicket || !user.email) return;

    try {
      const url =
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/updateComment";

      const payload = {
        email: user.email,
        ticketNum: selectedTicket.ticketNo,
        commentId: commentId,
        commentText: updatedText,
      };

      await axios.patch(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      await fetchComments();
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw new Error("API call failed to update comment.");
    }
  };

  // Handle confirmation of resolution (receives feedback and rating)
  const handleConfirmResolution = async (feedback, rating) => {
    if (!ticketDetails || !user.email) {
      toast.error("Missing ticket information");
      return;
    }

    if (ticketDetails.agentConfirmed) {
      toast.error("You have already confirmed this resolution");
      return;
    }

    if (rating === 0) {
      toast.error("Rating is required.");
      return;
    }

    setIsConfirming(true);
    try {
      // Step 1: Confirm the resolution via PATCH API
      const confirmUrl =
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/confirmation";
      const confirmPayload = {
        email: user.email,
        updateTicketNo: ticketDetails.ticketNo,
        feedback: feedback || "No feedback provided.",
        rating: rating,
      };

      const confirmResponse = await axios.patch(confirmUrl, confirmPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      // Check if ticket was automatically closed
      const newStatus =
        confirmResponse.data?.status || confirmResponse.data?.data?.status;
      const isClosed = newStatus?.toLowerCase() === "closed";

      if (isClosed) {
        toast.success(
          "🎉 Ticket has been closed! Both parties have confirmed the resolution."
        );
      } else {
        toast.success("✅ Resolution confirmed!");
      }

      // Close confirmation modal
      setIsConfirmationModalOpen(false);

      // Refresh data
      await fetchTicketDetails();
      await fetchTickets();
      if (isCommentsModalOpen) {
        await fetchComments();
      }
    } catch (error) {
      console.error("Failed to confirm resolution:", error);
      toast.error("Failed to confirm ticket resolution");
    } finally {
      setIsConfirming(false);
    }
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  // Ang mga handler na ito ay ipapasa na lang sa TicketsGrid
  const handleViewDetails = (ticketData) => {
    setSelectedTicket(ticketData);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (ticketData) => {
    toast.info(`Editing Ticket #${ticketData.ticketNo}`);
  };

  const handleDelete = (ticketData) => {
    toast.error(`Deleting Ticket #${ticketData.ticketNo}`);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTicket(null);
    setTicketDetails(null);
    setIsCommentsModalOpen(false);
    setIsConfirmationModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Tickets</h2>
          <p className="text-gray-500">
            View, add, and manage your IT tickets.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Ticket className="w-4 h-4" />
          Add Ticket
        </button>
      </div>

      {/* Table - Pinalitan ng TicketsGrid component */}
      <TicketsGrid
        data={tickets}
        tableRef={tableRef}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add Ticket Modal */}
      <AddTicketModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAttachmentFile(null);
        }}
        onSubmit={handleAddTicket}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        attachmentFile={attachmentFile}
        setAttachmentFile={setAttachmentFile}
      />

      {/* Details Modal */}
      <TicketDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        ticketDetails={ticketDetails}
        isLoading={isModalLoading}
        onViewComments={() => setIsCommentsModalOpen(true)}
        onConfirmResolution={openConfirmationModal}
        formatDate={formatDate}
        userEmail={user.email}
        onTicketUpdate={(updatedTicket) => {
          setTicketDetails(updatedTicket);
          fetchTickets();
        }}
      />

      {/* Comments Modal */}
      <TicketCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        user={user}
        comments={ticketComments}
        isLoading={isCommentsLoading}
        isSubmitting={isSubmittingComment}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        onSubmitComment={handleSubmitComment}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formatDate={formatDate}
        ticketStatus={ticketDetails?.status}
        onCommentUpdate={handleUpdateComment}
      />

      {/* Confirmation Modal */}
      <TicketConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        ticketDetails={ticketDetails}
        isConfirming={isConfirming}
        onConfirm={handleConfirmResolution}
      />
    </div>
  );
};

export default TicketsTable;