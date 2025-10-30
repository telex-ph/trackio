"use client";

import { useState, useRef, useEffect } from "react";
import { Pen, Trash2, Ticket, X } from "lucide-react";
import { Label, TextInput, Button } from "flowbite-react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction"; // --- BAGONG DAGDAG ---
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios";
import UnderContruction from "../../assets/illustrations/UnderContruction";
import { useStore } from "../../store/useStore";

const TicketsTable = () => {
  const user = useStore((state) => state.user);

  const tableRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  console.log(user);

  const [formData, setFormData] = useState({
    email: user.email,
    stationNo: "", // Naka-set sa empty string para sa placeholder
    subject: "",
    description: "",
    category: "",
    severity: "",
    status: "OPEN",
  });

  const [tickets, setTickets] = useState([]);
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
            Authorization:
              "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47",
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
    // --- FIX ---
    // Tinanggal ang formData.stationNo sa dependency array.
  }, [user.email]);

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
          // Siguraduhin na ang stationNo ay numero bago ipadala
          stationNo: Number(formData.stationNo),
          attachment: uploadedUrl || "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47",
          },
        }
      );

      setTickets((prev) => [...prev, response.data]);
      toast.success("Ticket added successfully");
      setIsModalOpen(false);

      setFormData({
        email: user.email,
        stationNo: "", // Reset pabalik sa empty string
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

  // --- BAGONG DAGDAG: Action Handlers para sa Table ---
  // Pwede mong palitan ang logic nito (e.g., mag-open ng modal, mag-navigate, etc.)
  const handleViewDetails = (ticketData) => {
    console.log("View Details:", ticketData);
    toast.success(`Opening details for Ticket #${ticketData.ticketNo}`);
    // Halimbawa:
    // setViewingTicket(ticketData);
    // setIsDetailsModalOpen(true);
  };

  const handleEdit = (ticketData) => {
    console.log("Edit:", ticketData);
    toast.info(`Editing Ticket #${ticketData.ticketNo}`);
    // Halimbawa:
    // setEditingTicket(ticketData);
    // setIsEditModalOpen(true);
  };

  const handleDelete = (ticketData) => {
    console.log("Delete:", ticketData);
    // Dito mo ilalagay ang logic for confirmation (e.g., SweetAlert)
    toast.error(`Deleting Ticket #${ticketData.ticketNo}`);
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
      // --- NA-UPDATE: Gumagamit na ng TableAction at iba pang buttons ---
      cellRenderer: (params) => (
        <section className="flex items-center gap-2 justify-center h-full">
          {/* Ito yung component na pinapa-import mo */}
          <TableAction action={() => handleViewDetails(params.data)} />

          {/* Bonus: Dinagdag ko na rin ang edit/delete buttons
              gamit ang Pen at Trash2 icons na in-import mo */}
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

      {/* Modal */}
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
              {/* --- START: UPDATED STATION NUMBER --- */}
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

                    // Payagan ang empty string (para ma-clear ang field)
                    if (value === "") {
                      setFormData({ ...formData, stationNo: "" });
                      return;
                    }

                    const numValue = Number(value);

                    // I-check kung ang numero ay integer at nasa pagitan ng 1 at 178
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
                      // Kung lumagpas sa 178, i-set sa 178
                      setFormData({ ...formData, stationNo: 178 });
                    }
                    // Kung mas mababa sa 1 (like 0) or decimal (like 1.5), huwag i-update ang state,
                    // na epektibong pinipigilan ang pag-type.
                  }}
                  required
                  className="flex-1"
                  // Gamitin ang "|| ''" para ipakita ang placeholder kapag ang value ay ""
                  // at hindi magpakita ng "0"
                  value={formData.stationNo || ""}
                  placeholder="Enter station number (1-178)"
                />
              </div>
              {/* --- END: UPDATED STATION NUMBER --- */}

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
    </div>
  );
};

export default TicketsTable;