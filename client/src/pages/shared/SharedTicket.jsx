"use client";

import { useState, useRef, useEffect } from "react";
import { Pen, Trash2, Ticket } from "lucide-react"; // Natanggal yung ibang icons
import { Button, Spinner } from "flowbite-react"; // Natanggal Label at TextInput
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";

// Import natin yung mga bagong modal components
import AddTicketModal from "../../components/tickets/AddTicketModal";
import TicketDetailsModal from "../../components/tickets/TicketDetailsModal";
import TicketCommentsModal from "../../components/tickets/TicketCommentsModal";

// Helper function para sa pag-format ng date
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

// I-define ang Bearer Token dito
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

  // useEffect para sa pag-fetch ng listahan ng tickets (Table)
  useEffect(() => {
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

    fetchTickets();
  }, [user.email]);

  // useEffect para sa Details Modal
  useEffect(() => {
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

        if (
          responseData &&
          responseData.document &&
          Array.isArray(responseData.document) &&
          responseData.document.length > 0
        ) {
          setTicketDetails(responseData.document[0]);
        } else if (Array.isArray(responseData) && responseData.length > 0) {
          setTicketDetails(responseData[0]);
        } else if (
          responseData &&
          typeof responseData === "object" &&
          responseData !== null &&
          !Array.isArray(responseData)
        ) {
          setTicketDetails(responseData);
        } else {
          console.error("Unexpected data format:", response.data);
          throw new Error("Unexpected data format from API");
        }
      } catch (error) {
        console.error("Failed to fetch ticket details:", error);
        toast.error("Could not fetch ticket details.");
        setIsDetailsModalOpen(false);
      } finally {
        setIsModalLoading(false);
      }
    };

    fetchTicketDetails();
  }, [isDetailsModalOpen, selectedTicket, user.email]);

  // Function para sa pag-fetch ng comments
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
        console.warn("Unexpected comments data format", response.data);
        setTicketComments([]);
      }
  } catch (error) { // <--- IDAGDAG ANG OPENING BRACE DITO
    console.error("Failed to fetch comments:", error);
    toast.error("Could not load comments.");
    setTicketComments([]);
  } finally {
//...
      setIsCommentsLoading(false);
    }
  };

  // useEffect para sa pag-fetch ng comments
  useEffect(() => {
    if (isCommentsModalOpen) {
      fetchComments();
      setActiveTab("comments");
    } else {
      setTicketComments([]);
      setNewCommentText("");
    }
  }, [isCommentsModalOpen]);

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

  const handleViewDetails = (ticketData) => {
    console.log("Setting selected ticket:", ticketData);
    setSelectedTicket(ticketData);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (ticketData) => {
    console.log("Edit:", ticketData);
    toast.info(`Editing Ticket #${ticketData.ticketNo}`);
  };

  const handleDelete = (ticketData) => {
    console.log("Delete:", ticketData);
    toast.error(`Deleting Ticket #${ticketData.ticketNo}`);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTicket(null);
    setTicketDetails(null);
    setIsCommentsModalOpen(false);
  };

  const columns = [
    // ... (Walang pagbabago dito, same columns definition)
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

      {/* --- ITO ANG MGA PAGBABAGO --- */}

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

      {/* Details Modal */}
      <TicketDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        ticketDetails={ticketDetails}
        isLoading={isModalLoading}
        onViewComments={() => setIsCommentsModalOpen(true)}
        formatDate={formatDate}
      />

      {/* Comments Modal */}
      <TicketCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        user={user}
        comments={ticketComments}
        isLoading={isCommentsLoading}
sSubmitting={isSubmittingComment}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        onSubmitComment={handleSubmitComment}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formatDate={formatDate}
      />
    </div>
  );
};

export default TicketsTable;