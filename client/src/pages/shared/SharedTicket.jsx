"use client";

import { useState, useRef } from "react";
import { Pen, Trash2, Ticket, X } from "lucide-react";
import { Label, TextInput, Button } from "flowbite-react";
import Table from "../../components/Table";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../utils/axios";
import UnderContruction from "../../assets/illustrations/UnderContruction";

const TicketsTable = () => {
  const tableRef = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    severity: "",
    status: "OPEN",
  });

  const [tickets, setTickets] = useState([
    {
      _id: "1",
      workspaceId: "68f1a7f70036cc2896bc",
      requesteeId: "68e3f51d0018e067bf4e",
      ticketNo: 124,
      subject: "No Internet",
      description: "No internet connection since morning.",
      attachment: "https://example.com/image1.png",
      category: "NETWORK",
      severity: "Severity 1",
      status: "OPEN",
    },
  ]);

  // Upload single attachment
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
      setIsLoading(true);

      // 1️⃣ Upload file first
      const uploadedUrl = await handleFileUpload();

      // 2️⃣ Submit ticket
      const response = await axios.post(
        "https://ticketing-system-eight-kappa.vercel.app/api/ittickets",
        {
          ...formData,
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

      // Reset
      setFormData({
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
      setIsLoading(false);
    }
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
      cellRenderer: () => (
        <section className="flex items-center gap-5 justify-center h-full"></section>
      ),
    },
  ];

  return (
    <section className="h-full">
      <UnderContruction />
    </section>
  );

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
                <Label htmlFor="description" className="text-light mb-2 block">
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
                  disabled={isLoading}
                  gradientDuoTone="purpleToBlue"
                >
                  {isLoading ? "Saving..." : "Save Ticket"}
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
