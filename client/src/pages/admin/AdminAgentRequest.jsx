import React, { useState, useMemo, memo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  User,
  FileText,
  ChevronDown,
  Edit,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// Custom Notification Component
const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-500",
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    error: {
      bg: "bg-red-500",
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
    info: {
      bg: "bg-blue-500",
      icon: <Bell className="w-5 h-5 text-white" />,
    },
  };

  const { bg, icon } = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed top-20 right-4 sm:top-20 sm:right-8 z-50 flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl shadow-lg text-white transition-all duration-300 ease-in-out transform ${bg}`}
    >
      {icon}
      <p className="text-sm sm:text-base font-medium">{message}</p>
      <button onClick={() => setIsVisible(false)} className="ml-auto">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

// Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-gray-200">
        <div className="flex justify-center mb-4">
          <Bell className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          Confirm Action
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white p-3 rounded-xl font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminAgentRequest = () => {
  const [requests, setRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);

  const [formData, setFormData] = useState({
    agentName: "",
    requestType: "Overtime",
    supervisor: "",
    reason: "",
    dateInput: "",
    startTime: "",
    endTime: "",
    duration: "",
  });

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/requests");
      const allRequests = response.data;
      const now = DateTime.now();

      // Check and update statuses of pending requests that have passed their end time
      const pendingRequests = allRequests.filter((r) => r.status === "Pending");
      for (const req of pendingRequests) {
        const endTime = DateTime.fromISO(req.endTime);
        if (endTime < now) {
          // If the request's end time is in the past, update its status
          await api.put(`/requests/${req._id}`, { status: "Approved" });
        }
      }

      const updatedResponse = await api.get("/requests");
      const updatedRequests = updatedResponse.data;

      const active = updatedRequests.filter((r) => r.status === "Pending");
      const history = updatedRequests.filter((r) => r.status !== "Pending");

      const sortedActive = active.sort(
        (a, b) =>
          DateTime.fromISO(b.createdAt || b.startTime).toMillis() -
          DateTime.fromISO(a.createdAt || a.startTime).toMillis()
      );

      const sortedHistory = history.sort(
        (a, b) =>
          DateTime.fromISO(b.createdAt || b.startTime).toMillis() -
          DateTime.fromISO(a.createdAt || a.startTime).toMillis()
      );

      setRequests(sortedActive);
      setRequestHistory(sortedHistory);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching or updating requests:", err);
      setError("Failed to load requests. Please check server connection.");
      setIsLoading(false);
      showNotification(
        "Failed to load requests. Please check your network.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.dateInput) {
      calculateDuration();
    }
  }, [formData.startTime, formData.endTime, formData.dateInput]);

  const calculateDuration = () => {
    const { startTime, endTime, dateInput } = formData;

    if (!startTime || !endTime || !dateInput) {
      setFormData((prev) => ({ ...prev, duration: "" }));
      return;
    }

    try {
      let startDateTime = DateTime.fromISO(`${dateInput}T${startTime}`);
      let endDateTime = DateTime.fromISO(`${dateInput}T${endTime}`);

      if (endDateTime <= startDateTime) {
        endDateTime = endDateTime.plus({ days: 1 });
      }

      const diff = endDateTime
        .diff(startDateTime, ["hours", "minutes"])
        .toObject();
      const hours = Math.floor(diff.hours || 0);
      const minutes = Math.floor(diff.minutes || 0);

      let durationText = "";
      if (hours > 0) {
        durationText += `${hours} hour${hours !== 1 ? "s" : ""}`;
      }
      if (minutes > 0) {
        if (durationText) durationText += " ";
        durationText += `${minutes} minute${minutes !== 1 ? "s" : ""}`;
      }

      setFormData((prev) => ({
        ...prev,
        duration: durationText || "0 minutes",
      }));
    } catch (error) {
      console.error("Error calculating duration:", error);
      setFormData((prev) => ({ ...prev, duration: "" }));
    }
  };

  const handleDecision = async (status) => {
    if (!selectedRequest) {
      console.error("No request selected for decision.");
      showNotification("Please select a request first.", "info");
      return;
    }

    const requestId = selectedRequest._id; // ✅ fix
    const url = `/requests/${requestId}`;
    console.log(`Attempting to update request with ID: ${requestId}`);

    try {
      await api.put(url, { status, remarks });
      showNotification(`Request ${status}`, "success");

      fetchRequests();
    } catch (err) {
      console.error(
        "Failed to update request:",
        err.response ? err.response.data : err.message
      );
      showNotification("Failed to update request", "error");
    } finally {
      setSelectedRequest(null);
      setRemarks("");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      showNotification("File size must be less than 10MB", "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.agentName ||
      !formData.requestType ||
      !formData.dateInput ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.supervisor ||
      !formData.reason
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    if (formData.startTime === formData.endTime) {
      showNotification("End time must be different from start time", "error");
      return;
    }

    try {
      let startDateTime = DateTime.fromISO(
        `${formData.dateInput}T${formData.startTime}`
      );
      let endDateTime = DateTime.fromISO(
        `${formData.dateInput}T${formData.endTime}`
      );

      if (endDateTime <= startDateTime) {
        endDateTime = endDateTime.plus({ days: 1 });
      }

      const payload = {
        agentName: formData.agentName,
        requestType: formData.requestType,
        supervisor: formData.supervisor,
        reason: formData.reason,
        date: formData.dateInput,
        startTime: startDateTime.toISO(),
        endTime: endDateTime.toISO(),
        duration: formData.duration,
        status: "Pending",
      };

      if (selectedFile) {
        try {
          const base64File = await fileToBase64(selectedFile);
          payload.attachment = {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: base64File,
          };
        } catch (error) {
          console.error("Error converting file to base64:", error);
          showNotification("Error processing file attachment", "error");
          return;
        }
      }

      if (isEditMode) {
        await api.put(`/requests/${editingId}`, payload);
        showNotification("Request updated successfully!", "success");
        fetchRequests();
      } else {
        await api.post("/requests", payload);
        showNotification("Request submitted successfully!", "success");
        fetchRequests();
      }

      resetForm();
    } catch (error) {
      console.error("Error submitting request:", error);
      showNotification(
        `Failed to ${
          isEditMode ? "update" : "submit"
        } request. Please try again.`,
        "error"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      agentName: "",
      requestType: "Overtime",
      supervisor: "",
      reason: "",
      dateInput: "",
      startTime: "",
      endTime: "",
      duration: "",
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleEdit = (request) => {
    setIsEditMode(true);
    setEditingId(request._id);

    const startDt = DateTime.fromISO(request.startTime);
    const endDt = DateTime.fromISO(request.endTime);

    setFormData({
      agentName: request.agentName,
      requestType: request.requestType,
      supervisor: request.supervisor,
      reason: request.reason,
      dateInput: request.date,
      startTime: startDt.toFormat("HH:mm"),
      endTime: endDt.toFormat("HH:mm"),
      duration: request.duration,
    });
    setSelectedFile(null);
  };

  const handleCancelClick = (id) => {
    setItemToCancel(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await api.delete(`/requests/${itemToCancel}`);
      showNotification("Request cancelled successfully!", "success");
      fetchRequests();
    } catch (error) {
      console.error("Error cancelling request:", error);
      showNotification("Failed to cancel request. Please try again.", "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToCancel(null);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = DateTime.fromISO(dateStr);
    return date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  };

  const formatDisplayTime = (isoDateStr) => {
    if (!isoDateStr) return "";
    const time = DateTime.fromISO(isoDateStr);
    return time.toLocaleString(DateTime.TIME_SIMPLE);
  };

  return (
    <div>
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancel}
        message="Are you sure you want to cancel this request? This action cannot be undone."
      />

      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Overtime/Undertime Request</h2>
        </div>
        <p className="text-gray-600">
          Submit and track your overtime and undertime requests.
        </p>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        <div className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Request Details
              </h3>
            </div>
          </div>

          {selectedRequest ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Agent Name
                  </p>
                  <p className="text-gray-800 font-medium">
                    {selectedRequest.agentName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Supervisor
                  </p>
                  <p className="text-gray-800 font-medium">
                    {selectedRequest.supervisor}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Request Type
                  </p>
                  <p className="text-gray-800 font-medium">
                    {selectedRequest.requestType}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">Date</p>
                  <p className="text-gray-800 font-medium">
                    {formatDisplayDate(selectedRequest.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    Start Time
                  </p>
                  <p className="text-gray-800 font-medium">
                    {formatDisplayTime(selectedRequest.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">
                    End Time
                  </p>
                  <p className="text-gray-800 font-medium">
                    {formatDisplayTime(selectedRequest.endTime)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Duration
                  </p>
                  <p className="text-gray-800 font-medium">
                    {selectedRequest.duration}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-600">Reason</p>
                  <p className="text-gray-800">{selectedRequest.reason}</p>
                </div>
                {selectedRequest.attachment && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-gray-600">
                      Attachment
                    </p>
                    <p className="text-purple-700">
                      {selectedRequest.attachment.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Remarks input */}
              <div>
                <label className="text-xs font-semibold text-gray-700">
                  Remarks (optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:bg-white text-gray-800 text-sm"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDecision("Approved")}
                  className="flex-1 bg-green-500 text-white p-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision("Rejected")}
                  className="flex-1 bg-red-500 text-white p-3 rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Select a request to view details.
            </p>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Active Requests
              </h3>
            </div>
            <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {requests.length} Active
            </span>
          </div>

          {requests.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
              {requests.map((req) => (
                <div
                  key={`${req._id}-${req.requestType}`}
                  onClick={() => setSelectedRequest(req)}
                  className="cursor-pointer group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {req.requestType} Request
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className="text-xs text-gray-500">
                            Filed: {formatDisplayDate(req.date)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      Agent:{" "}
                      <span className="font-medium">{req.agentName}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      Supervisor:{" "}
                      <span className="font-medium">{req.supervisor}</span>
                    </p>

                    <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border-l-4 border-blue-500">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold">
                            Start Time
                          </p>
                          <p className="text-sm text-blue-800">
                            {formatDisplayTime(req.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-600 font-semibold">
                            End Time
                          </p>
                          <p className="text-sm text-blue-800">
                            {formatDisplayTime(req.endTime)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-semibold">
                          Duration
                        </p>
                        <p className="text-sm text-blue-800 font-medium">
                          {req.duration}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                          Reason:
                        </span>{" "}
                        {req.reason}
                      </p>
                    </div>

                    {req.attachment && (
                      <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                        <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-800">
                            Attachment:
                          </span>
                          <span className="text-purple-700">
                            {req.attachment.name}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelClick(req._id);
                      }}
                      className="flex-1 bg-white border-2 border-red-500 text-red-600 p-2 sm:p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(req);
                      }}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-gray-500 italic">
              {isLoading ? "Loading requests..." : "No active requests found."}
            </div>
          )}
        </div>
      </div>

      {/* Request History Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          Request History
        </h3>
        {requestHistory && requestHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Agent
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Start Time
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    End Time
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Supervisor
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {requestHistory.map((req) => (
                  <tr
                    key={`${req._id}-${req.requestType}`}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-600">
                      {formatDisplayDate(req.date)}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {req.agentName}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {req.requestType}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDisplayTime(req.startTime)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDisplayTime(req.endTime)}
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">
                      {req.duration}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "Rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {req.supervisor}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {req.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            {isLoading ? "Loading history..." : "No request history found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgentRequest;
