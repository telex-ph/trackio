// src/pages/AgentCreateOffenses.jsx

import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// Import all the reusable components
import Notification from "../../components/incident-reports/Notification";
import ConfirmationModal from "../../components/incident-reports/ConfirmationModal";
import OffenseForm from "../../components/incident-reports/OffenseForm";
import TLCasesInProgress from "../../components/incident-reports/TLCasesInProgress";
import TLCaseHistory from "../../components/incident-reports/TLCaseHistory";

// Helper function
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// Helper function for blob URLs
const base64ToBlobUrl = (base64, type) => {
  try {
    const base64Data = base64.split(",")[1];
    if (!base64Data) {
      console.error("Invalid Base64 string");
      return base64;
    }
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: type });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (e) {
    console.error("Failed to convert Base64 to Blob URL:", e);
    return base64;
  }
};

const AgentCreateOffenses = () => {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // History states
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const today = DateTime.now().toISODate();

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    agentName: "",
    employeeId: "",
    agentRole: "",
    offenseCategory: "",
    offenseType: "",
    otherOffenseType: "",
    offenseLevel: "",
    dateOfOffense: "",
    status: "",
    actionTaken: "",
    remarks: "",
    evidence: [],
  });

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  // --- REPORTER-SPECIFIC FUNCTIONS ---
  const fetchCurrentUser = async () => {
    try {
      const timestamp = Date.now();
      const response = await api.get(`/auth/get-auth-user?_=${timestamp}`);
      setCurrentUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      showNotification(
        "Failed to load user data. Please log in again.",
        "error"
      );
      return null;
    }
  };

  const fetchMySubmittedReports = async (userId) => {
    if (!userId) {
      showNotification("Could not verify user to fetch reports.", "error");
      return;
    }
    try {
      setIsLoading(true);
      const timestamp = Date.now();
      const response = await api.get(
        `/offenses/reporter/${userId}?_=${timestamp}`
      );
      setSubmittedReports(response.data);
    } catch (error) {
      console.error("Error fetching my submitted reports:", error);
      showNotification(
        "Failed to load my submitted reports. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const user = await fetchCurrentUser();
      if (user) {
        await fetchMySubmittedReports(user._id);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- END OF REPORTER-SPECIFIC FUNCTIONS ---

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.agentName ||
      !formData.employeeId ||
      !formData.offenseCategory ||
      !formData.offenseType ||
      (formData.offenseType === "Other" && !formData.otherOffenseType) ||
      !formData.dateOfOffense
    ) {
      showNotification(
        "Please fill in all required fields (Agent, Category, Type, Date).",
        "error"
      );
      return;
    }

    try {
      const payload = { ...formData };
      delete payload.status;
      delete payload.actionTaken;
      delete payload.offenseLevel;

      if (selectedFile) {
        const base64File = await fileToBase64(selectedFile);
        payload.evidence = [
          {
            fileName: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: base64File,
          },
        ];
      } else {
        payload.evidence = formData.evidence || [];
      }

      if (isEditMode) {
        const originalOffense = submittedReports.find(
          (o) => o._id === editingId
        );
        if (originalOffense && originalOffense.status !== "Pending Review") {
          showNotification(
            "Cannot edit a report that is already under review.",
            "error"
          );
          return;
        }
        await api.put(`/offenses/${editingId}`, payload);
        showNotification("Report updated successfully!", "success");
      } else {
        await api.post("/offenses", payload);
        showNotification("Report submitted successfully!", "success");
      }

      resetForm();
      if (currentUser) {
        await fetchMySubmittedReports(currentUser._id);
      }
    } catch (error) {
      console.error("Error submitting offense:", error);
      showNotification("Failed to submit report. Please try again.", "error");
    }
  };

  // --- Reusable functions ---
  const resetForm = () => {
    setFormData({
      agentName: "",
      employeeId: "",
      agentRole: "",
      offenseCategory: "",
      offenseType: "",
      otherOffenseType: "",
      offenseLevel: "",
      dateOfOffense: "",
      status: "",
      actionTaken: "",
      remarks: "",
      evidence: [],
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleView = (off) => {
    // For viewing, we'll populate the form in edit mode
    if (off.status !== "Pending Review" && off.status !== "Submitted") {
      showNotification(
        "Cannot edit a report that is already under review or closed.",
        "error"
      );
      return;
    }
    setIsEditMode(true);
    setEditingId(off._id);
    setFormData({
      agentName: off.agentName,
      employeeId: off.employeeId || "",
      agentRole: off.agentRole || "",
      offenseCategory: off.offenseCategory,
      offenseType: off.offenseType,
      otherOffenseType: off.otherOffenseType || "",
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      actionTaken: off.actionTaken,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
    });
    setSelectedFile(null);
  };

  const handleDeleteClick = (id) => {
    const originalOffense = submittedReports.find((o) => o._id === id);
    if (originalOffense && originalOffense.status !== "Pending Review") {
      showNotification(
        "Cannot delete a report that is already under review.",
        "error"
      );
      return;
    }
    setItemToDelete(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/offenses/${itemToDelete}`);
      showNotification("Report deleted successfully!", "success");
      if (currentUser) {
        await fetchMySubmittedReports(currentUser._id);
      }
    } catch (error) {
      console.error("Error deleting offense:", error);
      showNotification("Failed to delete report. Please try again.", "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  // Reset history date filters
  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  // --- UPDATED FILTER LOGIC (from HR file, but for JSX) ---
  // Filter for "Cases In Progress"
  const filteredOffenses = submittedReports.filter(
    (off) =>
      !["Action Taken", "Escalated", "Closed"].includes(off.status) &&
      [
        off.agentName,
        off.offenseType,
        off.offenseCategory,
        off.offenseLevel || "",
        off.status,
        off.actionTaken,
        off.remarks || "",
        formatDisplayDate(off.dateOfOffense),
        off.reportedByName || "", // Added from HR logic
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Filter for "Case History"
  const resolvedOffenses = submittedReports.filter((off) => {
    const isResolved = ["Action Taken", "Escalated", "Closed"].includes(
      off.status
    );
    if (!isResolved) return false;

    const textMatch = [
      off.agentName,
      off.offenseType,
      off.offenseLevel || "",
      off.status,
      off.actionTaken,
      off.remarks || "",
      formatDisplayDate(off.dateOfOffense),
      off.reportedByName || "", // Added from HR logic
    ]
      .join(" ")
      .toLowerCase()
      .includes(historySearchQuery.toLowerCase());
    if (!textMatch) return false;

    const offenseDate = DateTime.fromISO(off.dateOfOffense).startOf("day");
    const start = historyStartDate
      ? DateTime.fromISO(historyStartDate).startOf("day")
      : null;
    const end = historyEndDate
      ? DateTime.fromISO(historyEndDate).startOf("day")
      : null;
    const isAfterStartDate = start ? offenseDate >= start : true;
    const isBeforeEndDate = end ? offenseDate <= end : true;
    return isAfterStartDate && isBeforeEndDate;
  });
  // --- END OF UPDATED FILTER LOGIC ---

  // --- JSX ---
  return (
    <div>
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this incident report?"
      />
      {/* Header */}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>My Incident Reports</h2>
        </div>
        <p className="text-gray-600">
          Submit a new incident report or view your past submissions.
        </p>
      </section>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Left Panel: Form */}
        <OffenseForm
          formData={formData}
          setFormData={setFormData}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          isEditMode={isEditMode}
          resetForm={resetForm}
          handleSubmit={handleSubmit}
          showNotification={showNotification}
          isAgentForm={true}
        />
        {/* Right Panel: Cases in Progress */}
        <TLCasesInProgress
          offenses={filteredOffenses}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onView={handleView}
          onDelete={handleDeleteClick} // Keep delete for agent
          isLoading={isLoading}
          formatDisplayDate={formatDisplayDate}
          base64ToBlobUrl={base64ToBlobUrl}
        />
      </div>
      {/* Bottom Panel: Case History */}
      <TLCaseHistory
        offenses={resolvedOffenses}
        filters={{
          searchQuery: historySearchQuery,
          startDate: historyStartDate,
          endDate: historyEndDate,
        }}
        setFilters={{
          setSearchQuery: (value) => setHistorySearchQuery(value),
          setStartDate: (value) => setHistoryStartDate(value),
          setEndDate: (value) => setHistoryEndDate(value),
        }}
        onDateReset={handleHistoryDateReset}
        isLoading={isLoading}
        formatDisplayDate={formatDisplayDate}
        base64ToBlobUrl={base64ToBlobUrl}
        today={today}
      />
    </div>
  );
};

export default AgentCreateOffenses;