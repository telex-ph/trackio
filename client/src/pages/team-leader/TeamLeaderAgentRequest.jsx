import React, { useState, useEffect } from "react";
import { Clock, FileText } from "lucide-react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

import Notification from "../../components/notification/Notification";
import ConfirmationModal from "../../components/modals/ConfirmationModal.jsx";
import RequestForm from "../../components/team-leader-request/RequestForm";
import RequestList from "../../components/team-leader-request/RequestList";
import RequestHistory from "../../components/team-leader-request/RequestHistory";
import UnderContruction from "../../assets/illustrations/UnderContruction.jsx";

const TeamLeaderAgentRequest = () => {
  const [requests, setRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

      const pendingRequests = allRequests.filter((r) => r.status === "Pending");
      for (const req of pendingRequests) {
        const endTime = DateTime.fromISO(req.endTime);
        if (endTime < now) {
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
    } catch (err) {
      console.error("Error fetching or updating requests:", err);
      setError("Failed to load requests. Please check server connection.");
      showNotification(
        "Failed to load requests. Please check your network.",
        "error"
      );
    } finally {
      setIsLoading(false);
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
      if (hours > 0) durationText += `${hours} hour${hours !== 1 ? "s" : ""}`;
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

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

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
        const base64File = await fileToBase64(selectedFile);
        payload.attachment = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: base64File,
        };
      }

      if (isEditMode) {
        await api.put(`/requests/${editingId}`, payload);
        showNotification("Request updated successfully!", "success");
      } else {
        await api.post("/requests", payload);
        showNotification("Request submitted successfully!", "success");
      }

      fetchRequests();
      resetForm();
    } catch (error) {
      console.error("Error submitting request:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        editingId,
      });
      if (error.response?.status === 404) {
        showNotification(
          "Request not found. It may have been deleted.",
          "error"
        );
        setIsEditMode(false);
        setEditingId(null);
        fetchRequests();
      } else {
        showNotification(
          `Failed to ${
            isEditMode ? "update" : "submit"
          } request. Please try again.`,
          "error"
        );
      }
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

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const formatDisplayTime = (isoDateStr) =>
    isoDateStr
      ? DateTime.fromISO(isoDateStr).toLocaleString(DateTime.TIME_SIMPLE)
      : "";

  return (
    <section className="h-full">
      <UnderContruction />
    </section>
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        <RequestForm
          formData={formData}
          isEditMode={isEditMode}
          selectedFile={selectedFile}
          isDragOver={isDragOver}
          handleInputChange={handleInputChange}
          handleFileUpload={handleFileUpload}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
        />
        <RequestList
          requests={requests}
          isLoading={isLoading}
          handleCancelClick={handleCancelClick}
          handleEdit={handleEdit}
          formatDisplayDate={formatDisplayDate}
          formatDisplayTime={formatDisplayTime}
        />
      </div>

      <RequestHistory
        requestHistory={requestHistory}
        isLoading={isLoading}
        formatDisplayDate={formatDisplayDate}
        formatDisplayTime={formatDisplayTime}
      />
    </div>
  );
};

export default TeamLeaderAgentRequest;
