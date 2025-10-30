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

  // States para sa Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);

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

        console.log("Fetching details from:", url); 

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
          console.log("Data found in response.data.data.document[0]");
          setTicketDetails(responseData.document[0]);
        }
        else if (Array.isArray(responseData) && responseData.length > 0) {
          console.log("Response is an array, taking first item.");
          setTicketDetails(responseData[0]);
        }
        else if (
          responseData &&
          typeof responseData === "object" &&
          responseData !== null &&
          !Array.isArray(responseData)
        ) {
          console.log("Response is an object.");
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
  };

  // --- START: BINAGO ANG COLUMNS ---
  const columns = [
    {
      headerName: "Ticket No",
      field: "ticketNo",
      flex: 1,
      // Idinagdag ito para i-format 'yung display
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
  // --- END: BINAGO ANG COLUMNS ---

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

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-dark rounded-xl shadow-lg p-6 w-full max-w-4xl relative border border-light container-light">
            <button
              onClick={closeDetailsModal}
              className="absolute top-3 right-3 text-light hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-light">
              Ticket Details
            </h3>

            {isModalLoading ? (
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
                      <p className="text-sm font-medium text-gray-400">
                        Subject
                      </p>
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
                        {/* --- START: BINAGO ANG TICKET NO --- */}
                        <p className="text-lg font-bold">
                          Ticket#{ticketDetails.ticketNo}
                        </p>
                        {/* --- END: BINAGO ANG TICKET NO --- */}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">
                          Status
                        </p>
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
                  </div>
                </div>

                {/* --- Footer --- */}
                <div className="flex justify-end pt-6 mt-4 border-t border-gray-600">
                  <Button
                    type="button"
                    onClick={closeDetailsModal}
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
      )}
    </div>
  );
};

export default TicketsTable;