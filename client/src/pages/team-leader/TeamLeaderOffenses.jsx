import React, { useState, useEffect } from "react";
import { DateTime } from "luxon"; // Import DateTime
import api from "../../utils/axios";

import Notification from "../../components/incident-reports/Notification";

// --- IMPORT NEW TL COMPONENTS ---
import TLOffenseDetails from "../../components/incident-reports/TLOffenseDetails";
import TLCaseHistory from "../../components/incident-reports/TLCaseHistory";

// --- HELPER FUNCTION ---
// Converts Base64 data URL to a browser-readable Blob URL
const base64ToBlobUrl = (base64, type) => {
  try {
    const base64Data = base64.split(",")[1];
    if (!base64Data) {
      console.error("Invalid Base64 string");
      return base64; // Fallback
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
    return base64; // Fallback
  }
};
// --- END OF HELPER FUNCTION ---

const TeamLeaderOffenses = () => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // For Cases in Progress
  const [currentUser, setCurrentUser] = useState(null);

  // States for History Filters
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  // Get today's date in YYYY-MM-DD format for max attribute
  const today = DateTime.now().toISODate();

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  // (Iniwan ko ito kung sakaling gagamitin mo para sa delete, pero tanggal na sa JSX)
  // const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  // const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    agentName: "",
    offenseCategory: "",
    offenseType: "",
    offenseLevel: "",
    dateOfOffense: "",
    status: "",
    actionTaken: "",
    remarks: "",
    invalidReason: "",
    evidence: [],
  });

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/get-auth-user");
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

  const fetchOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/offenses");
      setOffenses(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching offenses:", error);
      showNotification("Failed to load offenses. Please try again.", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchOffenses();
    };
    loadData();
  }, []);



  const resetForm = () => {
    setFormData({
      agentName: "",
      offenseCategory: "",
      offenseType: "",
      offenseLevel: "",
      dateOfOffense: "",
      status: "",
      actionTaken: "",
      remarks: "",
      evidence: [],
      isRead: false,
    });
    setIsViewMode(false);
    setEditingId(null);
  };

  const handleView = (off) => {
    if (!off || !off._id) return;
    setIsViewMode(true);
    setEditingId(off._id);
    setFormData({
      agentName: off.agentName,
      offenseCategory: off.offenseCategory,
      offenseType: off.offenseType,
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      actionTaken: off.actionTaken,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      isRead: off.isRead || false,
    });
  };

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  // Filter for "Cases In Progress"
  const filteredOffenses = offenses.filter(
    (off) =>
      currentUser &&
      off.employeeId === currentUser.employeeId &&
      !["Action Taken", "Escalated", "Closed"].includes(off.status) &&
      [
        off.offenseType,
        off.offenseCategory,
        off.offenseLevel || "",
        off.status,
        off.actionTaken,
        off.remarks || "",
        formatDisplayDate(off.dateOfOffense),
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) // Uses the main searchQuery
  );

  // Filter for "Case History"
  const resolvedOffenses = offenses.filter((off) => {
    // Basic status & user filter
    const isResolved =
      currentUser &&
      off.employeeId === currentUser.employeeId &&
      ["Action Taken", "Escalated", "Closed"].includes(off.status);
    if (!isResolved) return false;

    // Text search filter
    const textMatch = [
      off.offenseType,
      off.offenseLevel || "",
      off.status,
      off.actionTaken,
      off.remarks || "",
      formatDisplayDate(off.dateOfOffense),
    ]
      .join(" ")
      .toLowerCase()
      .includes(historySearchQuery.toLowerCase());
    if (!textMatch) return false;

    // Date range filter using Luxon
    const offenseDate = DateTime.fromISO(off.dateOfOffense).startOf("day");
    const start = historyStartDate
      ? DateTime.fromISO(historyStartDate).startOf("day")
      : null;
    const end = historyEndDate
      ? DateTime.fromISO(historyEndDate).startOf("day")
      : null;

    const isAfterStartDate = start ? offenseDate >= start : true;
    const isBeforeEndDate = end ? offenseDate <= end : true;

    return isAfterStartDate && isBeforeEndDate; // Return true only if all filters pass
  });

  return (
    <div>
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Offense Management</h2>
        </div>
        <p className="text-gray-600">View your disciplinary offenses.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* --- OFFENSE DETAILS (Refactored) --- */}
        <TLOffenseDetails
          isViewMode={isViewMode}
          formData={formData}
          onClose={resetForm}
          formatDisplayDate={formatDisplayDate}
          base64ToBlobUrl={base64ToBlobUrl}
        />

        {/* --- CASES IN PROGRESS (Refactored) --- */}
      </div>

      {/* --- CASE HISTORY (Refactored) --- */}
      <TLCaseHistory
        offenses={resolvedOffenses}
        filters={{
          searchQuery: historySearchQuery,
          startDate: historyStartDate,
          endDate: historyEndDate,
        }}
        setFilters={{
          setSearchQuery: setHistorySearchQuery,
          setStartDate: setHistoryStartDate,
          setEndDate: setHistoryEndDate,
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

export default TeamLeaderOffenses;
