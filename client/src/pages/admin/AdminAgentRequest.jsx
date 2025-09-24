import React, { useState, useEffect } from "react";
import { Clock, FileText, Bell } from "lucide-react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// Reusable components (already in your components folder)
import Notification from "../../components/notification/Notification.jsx";
import ConfirmationModal from "../../components/confirmation-modal/ConfirmationModal.jsx";

// Import new admin-specific components
import AdminRequestDetails from "../../components/admin-request/RequestDetails.jsx";
import AdminActiveRequests from "../../components/admin-request/ActiveRequests.jsx";
import AdminRequestHistory from "../../components/admin-request/RequestHistory.jsx";

const AdminAgentRequest = () => {
  const [requests, setRequests] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchRequests = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching or updating requests:", err);
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

  const handleDecision = async (status) => {
    if (!selectedRequest) {
      showNotification("Please select a request first.", "info");
      return;
    }

    const requestId = selectedRequest._id;
    const url = `/requests/${requestId}`;

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
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        message="Are you sure you want to proceed with this action?"
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
        <AdminRequestDetails
          selectedRequest={selectedRequest}
          remarks={remarks}
          setRemarks={setRemarks}
          handleDecision={handleDecision}
        />
        <AdminActiveRequests
          requests={requests}
          isLoading={isLoading}
          setSelectedRequest={setSelectedRequest}
        />
      </div>

      {/* Request History Table */}
      <AdminRequestHistory
        requestHistory={requestHistory}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminAgentRequest;