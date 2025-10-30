"use client";

import { useState, useRef, useEffect } from "react";
import { Pen, Trash2, Ticket, X } from "lucide-react";
import { Label, TextInput, Button, Spinner } from "flowbite-react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios";
import UnderContruction from "../../assets/illustrations/UnderContruction";
import { useStore } from "../../store/useStore";

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

// --- START: I-define ang Bearer Token dito ---
// Ginamit ko lang 'yung nasa example mo kanina
const bearerToken =
  "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47";
// --- END: I-define ang Bearer Token dito ---

const TicketsTable = () => {
  const user = useStore((state) => state.user);

  const tableRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  // --- NA-UPDATE: States para sa Details Modal ---
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false); // Galing sa logic mo
  const [selectedTicket, setSelectedTicket] = useState(null); // Galing sa logic mo (trigger)
  const [ticketDetails, setTicketDetails] = useState(null); // Galing sa logic mo (data)

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
            Authorization: bearerToken, // Ginamit ang variable
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

  // --- BAGONG DAGDAG: Ito 'yung useEffect mo para sa Details Modal ---
  useEffect(() => {
    const fetchTicketDetails = async () => {
      // Kung walang user, email, o ticket na pinili, huwag tumuloy
      if (!isDetailsModalOpen || !selectedTicket || !user.email) {
        return;
      }

      setIsModalLoading(true);
      setTicketDetails(null); // I-clear muna ang lumang data

      try {
        const url = `https://ticketing-system-eight-kappa.vercel.app/api/ittickets/trackio/overview/${user.email}/${selectedTicket.ticketNo}`;

        console.log("Fetching details from:", url); // For debugging

        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: bearerToken, // Ginamit ang variable
          },
        });

        // I-assume natin na ang data ay nasa response.data.data
        // Paki-adjust kung iba ang structure (e.g., response.data lang)
        setTicketDetails(response.data.data || response.data);
      } catch (error) {
        console.error("Failed to fetch ticket details:", error);
        toast.error("Could not fetch ticket details.");
        // Isara ang modal kung nag-error
        setIsDetailsModalOpen(false);
      } finally {
        setIsModalLoading(false);
      }
    };

    fetchTicketDetails();
    // Ang dependency array na ito ang magti-trigger ng fetch:
  }, [isDetailsModalOpen, selectedTicket, user.email]);
  // --- END: useEffect ---

  const handleFileUpload = async () => {
    // ... (logic for file upload)
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
    // ... (logic for adding a ticket)
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
            Authorization: bearerToken, // Ginamit ang variable
          },
        }
      );

      setTickets((prev) => [...prev, response.data]);
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

  // --- NA-UPDATE: handleViewDetails ---
  // Ngayon, nagse-set na lang ito ng state para i-trigger ang useEffect
  const handleViewDetails = (ticketData) => {
    console.log("Setting selected ticket:", ticketData);
    setSelectedTicket(ticketData); // I-set ang ticket data galing sa row
    setIsDetailsModalOpen(true); // Buksan ang modal
  };

  const handleEdit = (ticketData) => {
    console.log("Edit:", ticketData);
    toast.info(`Editing Ticket #${ticketData.ticketNo}`);
  };

  const handleDelete = (ticketData) => {
    console.log("Delete:", ticketData);
    toast.error(`Deleting Ticket #${ticketData.ticketNo}`);
  };

  // --- BAGONG DAGDAG: Function para isara ang details modal at mag-clear ng state ---
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTicket(null);
    setTicketDetails(null);
  };

  const columns = [
    { headerName: "Ticket No", field: "ticketNo", flex: 1 },
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
          {/* Ito na yung tatawag sa na-update na handleViewDetails */}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark rounded-xl shadow-lg p-6 w-full max-w-lg relative border border-light container-light">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-light hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-light">
              Create New Ticket
            </h3>

            <form onSubmit={handleAddTicket} className="space-y-4">
              {/* Station Number */}
              <div>
                <Label htmlFor="stationNo" className="text-light mb-2 block">
                  Station Number
                </Label>
                <TextInput
                  id="stationNo"
                  name="stationNo"
                  type="number"
                  min="1"
                  max="178"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setFormData({ ...formData, stationNo: "" });
                      return;
                    }
                    const numValue = Number(value);
                    if (
                      !isNaN(numValue) &&
                      numValue >= 1 &&
                      numValue <= 178 &&
                      Number.isInteger(numValue)
                    ) {
                      setFormData({
                        ...formData,
                        stationNo: numValue,
                      });
                    } else if (numValue > 178) {
                      setFormData({ ...formData, stationNo: 178 });
                    }
                  }}
                  required
                  className="flex-1"
                  value={formData.stationNo || ""}
                  placeholder="Enter station number (1-178)"
                />
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="text-light mb-2 block">
                  Subject
                </Label>
                <TextInput
                  id="subject"
                  name="subject"
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  className="flex-1"
                  value={formData.subject}
                  placeholder="Enter ticket subject"
                />
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-light mb-2 block"
                >
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="w-full border border-light container-light rounded-lg px-3 py-2 text-light bg-transparent"
                  rows="3"
                  placeholder="Describe the issue"
                  value={formData.description}
                ></textarea>
              </div>

              {/* Attachment */}
              <div>
                <Label htmlFor="attachment" className="text-light mb-2 block">
                  Attachment
                </Label>
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 flex items-center justify-between border border-light container-light rounded-lg p-2">
                    <input
                      id="attachment"
                      name="attachment"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) =>
                        setAttachmentFile(e.target.files[0] || null)
                      }
                      className="w-full text-sm text-light file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                        file:text-sm file:font-semibold file:bg-blue-600 file:text-white 
                        hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                  {attachmentFile && (
                    <div className="flex items-center justify-center p-2 border border-light container-light rounded-lg">
                      <X
                        className="text-light cursor-pointer"
                        onClick={() => setAttachmentFile(null)}
                      />
                    </div>
                  )}
                </div>
                {attachmentFile && (
                  <p className="text-xs text-light mt-1">
                    📎 Selected: {attachmentFile.name}
                  </p>
                )}
              </div>

              {/* Category + Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="category" className="text-light mb-2 block">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border border-light container-light rounded-lg px-3 py-2 bg-transparent text-light"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="NETWORK">Network</option>
                    <option value="HARDWARE">Hardware</option>
                    <option value="SOFTWARE">Software</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="severity" className="text-light mb-2 block">
                    Severity
                  </Label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                    className="w-full border border-light container-light rounded-lg px-3 py-2 bg-transparent text-light"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="LOW">Low</option>
                    <option value="MID">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-5">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  color="white"
                  className="border border-light text-light"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  gradientDuoTone="purpleToBlue"
                >
                  {isSubmitting ? "Saving..." : "Save Ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NA-UPDATE: Details Modal --- */}
      {/* Gumagamit na ng 'closeDetailsModal' function */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark rounded-xl shadow-lg p-6 w-full max-w-lg relative border border-light container-light">
            <button
              onClick={closeDetailsModal} // Ginamit ang close function
              className="absolute top-3 right-3 text-light hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-light">
              Ticket Details
            </h3>

            {/* Gumagamit na ng 'isModalLoading' state */}
            {isModalLoading ? (
              // Loading State
              <div className="flex justify-center items-center h-48">
                <Spinner size="xl" />
                <span className="text-light ml-3">Loading details...</span>
              </div>
            ) : ticketDetails ? ( // Gumagamit na ng 'ticketDetails' state
              // Data Loaded State
              <div className="space-y-4 text-light max-h-[70vh] overflow-y-auto pr-2">
                {/* --- Group 1: Main Info --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Ticket No
                    </p>
                    <p className="text-lg font-bold">
                      {ticketDetails.ticketNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Status
                    </p>
                    <p className="text-lg font-bold text-blue-400">
                      {ticketDetails.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Severity
                    </p>
                    <p className="text-lg">{ticketDetails.severity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Category
                    </p>
                    <p className="text-lg">{ticketDetails.category}</p>
                  </div>
                </div>

                <hr className="border-gray-600" />

                {/* --- Group 2: Requester --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Requester ID
                    </p>
                    <p className="text-md break-all">
                      {ticketDetails.requesteeId || (
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
                </div>

                <hr className="border-gray-600" />

                {/* --- Group 3: Content --- */}
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Subject
                  </p>
                  <p className="text-lg">{ticketDetails.subject}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Description
                  </p>
                  <p className="p-3 bg-black/20 rounded-lg mt-1 whitespace-pre-wrap">
                    {ticketDetails.description || (
                      <span className="text-gray-500">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

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

                {/* --- Group 4: Timeline --- */}
                <hr className="border-gray-600" />
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

                {/* --- Group 5: Resolution & Feedback --- */}
                <hr className="border-gray-600" />
                <h4 className="text-md font-semibold text-gray-300">
                  Resolution
                </h4>
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Assigned To (ID)
                  </p>
                  <p className="text-md">
                    {ticketDetails.assigneeId || (
                      <span className="text-gray-500">
                        Not yet assigned
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Resolution Notes
                  </p>
                  <p className="p-3 bg-black/20 rounded-lg mt-1 whitespace-pre-wrap">
                    {ticketDetails.resolutionText || (
                      <span className="text-gray-500">
                        No resolution notes yet.
                      </span>
                    )}
                  </p>
                </div>

                <h4 className="text-md font-semibold text-gray-300 mt-4">
                  User Feedback
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      Rating
                    </p>
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

                {/* --- Footer --- */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={closeDetailsModal} // Ginamit ang close function
                    color="white"
                    className="border border-light text-light"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              // Error State (kung walang details na na-load)
              <div className="text-light text-center h-48 flex items-center justify-center">
                <p>Could not load ticket details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsTable;