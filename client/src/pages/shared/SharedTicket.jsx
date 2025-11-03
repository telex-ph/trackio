"use client";

import { useState, useRef, useEffect } from "react";
import { Pen, Trash2, Ticket } from "lucide-react";
import { Button, Spinner } from "flowbite-react";
import Table from "../../components/Table"; // Assuming this path is correct
import TableAction from "../../components/TableAction"; // Assuming this path is correct
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios"; // Assuming this path is correct
import { useStore } from "../../store/useStore"; // Assuming this path is correct

// Import modal components - Ensure these paths are correct
import AddTicketModal from "../../components/tickets/AddTicketModal";
import TicketDetailsModal from "../../components/tickets/TicketDetailsModal";
import TicketCommentsModal from "../../components/tickets/TicketCommentsModal";
import TicketConfirmationModal from "../../components/tickets/TicketConfirmationModal";

// Helper function for date formatting
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

  // Determine user role (kept for context)
  const userRole = 'agent';

  // Function to fetch the list of tickets
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
      setTickets(response.data.data.documents || []);
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

      const commentsData = commentsResponse.data?.data || commentsResponse.data || [];
      const commentsList = Array.isArray(commentsData) ? commentsData : 
                          (commentsData.documents && Array.isArray(commentsData.documents)) ? commentsData.documents : [];

      // Check if there's a confirmation comment from this user
      const hasUserConfirmation = commentsList.some(comment => 
        comment.commentText && 
        comment.commentText.includes('Resolution confirmed by User') &&
        comment.commentText.includes(user.email)
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

  // Handle file upload (attachment)
  const handleFileUpload = async () => {
    if (!attachmentFile) return null;
    try {
      const formData = new FormData();
      formData.append("files", attachmentFile);
      formData.append("folder", "tickets");
      const res = await api.post(`/media/upload-media`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Attachment uploaded!");
      return res.data?.files?.[0]?.url || res.data?.url;
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload attachment");
      return null;
    }
  };

  // Handle adding a new ticket
  const handleAddTicket = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const uploadedUrl = await handleFileUpload();
      const response = await axios.post(
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets",
        {
          ...formData,
          stationNo: Number(formData.stationNo),
          attachment: uploadedUrl || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: bearerToken,
          },
        }
      );

      setTickets((prev) => [response.data, ...prev]);
      toast.success("Ticket added successfully");
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
    } catch (error) {
      console.error(error);
      toast.error("Failed to add ticket");
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

  // Handle confirmation of resolution
  const handleConfirmResolution = async () => {
    if (!ticketDetails || !user.email) {
      toast.error("Missing ticket information");
      return;
    }

    // Check if already confirmed
    if (ticketDetails.agentConfirmed) {
      toast.error("You have already confirmed this resolution");
      return;
    }

    setIsConfirming(true);
    try {
      // Step 1: Confirm the resolution via PATCH API
      const confirmUrl = "https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/confirmation";
      const confirmPayload = {
        email: user.email,
        updateTicketNo: ticketDetails.ticketNo,
      };

      const confirmResponse = await axios.patch(confirmUrl, confirmPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      // Step 2: Automatically post a comment about the confirmation
      const commentUrl = "https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/itTicketComment";
      const commentPayload = {
        email: user.email,
        ticketNum: ticketDetails.ticketNo,
        commentText: `✅ Resolution confirmed by User: ${user.email}.`, 
      };

      await axios.post(commentUrl, commentPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
      });

      // Check if ticket was automatically closed
      const newStatus = confirmResponse.data?.status || confirmResponse.data?.data?.status;
      const isClosed = newStatus?.toLowerCase() === 'closed';

      if (isClosed) {
        toast.success("🎉 Ticket has been closed! Both parties have confirmed the resolution.");
      } else {
        toast.success("✅ Resolution confirmed!");
      }
      
      // Close confirmation modal
      setIsConfirmationModalOpen(false);
      
      // Step 3: Refresh ticket details in the open modal
      await fetchTicketDetails();

      // Step 4: Refresh tickets list to update status in the table
      await fetchTickets();

      // Step 5: Refresh comments if comments modal is open
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

  const handleViewDetails = (ticketData) => {
    setSelectedTicket(ticketData);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (ticketData) => {
    toast.info(`Editing Ticket #${ticketData.ticketNo}`);
    // Note: Actual editing logic happens within TicketDetailsModal now.
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

  // Columns configuration for the Table component
  const columns = [
    {
      headerName: "Ticket No",
      field: "ticketNo",
      flex: 1,
      valueFormatter: (params) => `Ticket#${params.value}`,
    },
    { headerName: "Subject", field: "subject", flex: 1 },
    { headerName: "Category", field: "category", flex: 1 },
    { headerName: "Severity", field: "severity", flex: 1 },
    { headerName: "Status", field: "status", flex: 1 },
    {
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <section className="flex items-center gap-2 justify-center h-full">
          <TableAction action={() => handleViewDetails(params.data)} />
          <button
            onClick={() => handleEdit(params.data)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            title="Edit Ticket"
          >
            <Pen size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(params.data)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            title="Delete Ticket"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </section>
      ),
    },
  ];

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

      {/* Table */}
      <Table
        data={tickets}
        tableRef={tableRef}
        columns={columns}
        loading={isLoading}
      />

      {/* Add Ticket Modal */}
      <AddTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTicket}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        attachmentFile={attachmentFile}
        setAttachmentFile={setAttachmentFile}
      />

      {/* Details Modal (with updated edit fields) */}
      <TicketDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        ticketDetails={ticketDetails}
        isLoading={isModalLoading}
        onViewComments={() => setIsCommentsModalOpen(true)}
        onConfirmResolution={() => setIsConfirmationModalOpen(true)}
        formatDate={formatDate}
        userEmail={user.email}
        onTicketUpdate={(updatedTicket) => {
          setTicketDetails(updatedTicket);
          fetchTickets(); // Refresh table data after a successful update (subject/description/stationNo)
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