import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// Import ALL necessary components
import Notification from "../../components/incident-reports/Notification";
import ConfirmationModal from "../../components/incident-reports/ConfirmationModal";
import OffenseForm from "../../components/incident-reports/TLOffenseForm";
import TLOffenseDetails from "../../components/incident-reports/TLOffenseDetails";
import TLCasesInProgress from "../../components/incident-reports/TLCasesInProgress";
import TLCaseHistory from "../../components/incident-reports/TLCaseHistory";
import socket from "../../utils/socket";

// --- HELPER FUNCTIONS ---
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

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
// --- END OF HELPER FUNCTIONS ---

const TeamLeaderOffenses = () => {
  // --- States ---
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  // --- (SIGURADUHIN MONG ITO ANG NAKALAGAY) ---
  const [panelMode, setPanelMode] = useState("create"); // <-- Dapat 'create' agad

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });
  // const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // Unused for now
  // const [itemToDelete, setItemToDelete] = useState(null); // Unused for now

  const [formData, setFormData] = useState({
    agentName: "",
    employeeId: "",
    agentRole: "",
    offenseCategory: "",
    dateOfOffense: "",
    remarks: "",
    evidence: [],
    isRead: false,
  });

  const today = DateTime.now().toISODate();

  // --- Functions ---

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchCurrentUser = async () => {
    /* ...existing fetchCurrentUser... */
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

  const fetchTeamOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/offenses");

      setOffenses(
        Array.isArray(response.data)
          ? response.data.filter((o) => o && o._id)
          : []
      );
    } catch (error) {
      console.error("Error fetching team offenses:", error);
      showNotification(
        "Failed to load team offenses. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchTeamOffenses();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!setOffenses) return;

    const handleAdded = (newOffense) => {
      if (!newOffense?._id) return;
      setOffenses((prev) => [
        newOffense,
        ...(prev || []).filter((o) => o?._id),
      ]);
    };

    const handleUpdated = (updatedOffense) => {
      if (!updatedOffense?._id) return;
      console.log("Received offenseUpdated:", updatedOffense);
      setOffenses((prev) =>
        (prev || [])
          .filter((off) => off?._id)
          .map((off) =>
            off._id === updatedOffense._id ? { ...off, ...updatedOffense } : off
          )
      );
    };

    const handleDeleted = (deletedId) => {
      if (!deletedId) return;
      setOffenses((prev) =>
        (prev || []).filter((o) => o?._id && o._id !== deletedId)
      );
    };

    const attachListeners = () => {
      socket.on("offenseAdded", handleAdded);
      socket.on("offenseUpdated", handleUpdated);
      socket.on("offenseDeleted", handleDeleted);
    };

    if (socket.connected) attachListeners();

    socket.on("connect", () => attachListeners());

    return () => {
      socket.off("offenseAdded", handleAdded);
      socket.off("offenseUpdated", handleUpdated);
      socket.off("offenseDeleted", handleDeleted);
      socket.off("connect", attachListeners);
    };
  }, []);

  const handleSubmit = async () => {
    /* ...existing handleSubmit... */
    if (
      !formData.agentName ||
      !formData.offenseCategory ||
      !formData.dateOfOffense
    ) {
      showNotification(
        "Please fill in all required fields, including selecting an agent",
        "error"
      );
      return;
    }

    try {
      const payload = { ...formData };
      delete payload.isRead;
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
      }
      if (panelMode === "edit") {
        await api.put(`/offenses/${editingId}`, payload);
        showNotification("Offense updated successfully!", "success");
      } else {
        await api.post("/offenses", payload);
        showNotification("Offense submitted successfully!", "success");
      }

      resetFormAndPanel();
      await fetchTeamOffenses();
    } catch (error) {
      console.error("Error submitting offense:", error);
      showNotification("Failed to submit offense. Please try again.", "error");
    }
  };

  const resetFormAndPanel = () => {
    /* ...existing resetFormAndPanel... */
    setFormData({
      agentName: "",
      employeeId: "",
      agentRole: "",
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
    setSelectedFile(null);
    setEditingId(null);
    setPanelMode("create"); // Bumalik sa create mode
  };

  const handleView = async (off) => {
    if (!off || !off._id) return;
    /* ...existing handleView... */
    setFormData({
      agentName: off.agentName,
      offenseCategory: off.offenseCategory,
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      employeeId: off.employeeId || "",
      agentRole: off.agentRole || "",
    });
    setEditingId(off._id);
    setPanelMode("view");
    setSelectedFile(null);

    if (off.isReadByReporter === false) {
      try {
        const payload = { ...off, isReadByReporter: true };
        await api.put(`/offenses/${off._id}`, payload);
        showNotification("Offense marked as read!", "success");
        // Update local state to reflect read status immediately
        setOffenses((prev) =>
          prev.map((o) =>
            o._id === off._id ? { ...o, isReadByReporter: true } : o
          )
        );
      } catch (error) {
        console.error("Error marking offense as read:", error);
        showNotification("Failed to mark offense as read.", "error");
      }
    }
  };

  const handleEditClick = (offenseDataToEdit) => {
    if (!offenseDataToEdit || !offenseDataToEdit._id) return;
    /* ...existing handleEditClick... */
    setFormData({
      agentName: offenseDataToEdit.agentName,
      employeeId: offenseDataToEdit.employeeId || "",
      agentRole: offenseDataToEdit.agentRole || "",
      offenseCategory: offenseDataToEdit.offenseCategory,
      offenseType: offenseDataToEdit.offenseType,
      offenseLevel: offenseDataToEdit.offenseLevel || "",
      dateOfOffense: offenseDataToEdit.dateOfOffense,
      status: offenseDataToEdit.status,
      actionTaken: offenseDataToEdit.actionTaken,
      remarks: offenseDataToEdit.remarks || "",
      evidence: offenseDataToEdit.evidence || [],
    });
    setEditingId(offenseDataToEdit._id);
    setPanelMode("edit");
    setSelectedFile(null);
    window.scrollTo(0, 0);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await api.delete(`/offenses/${editingId}`);
      showNotification("Marked as read successfully!", "success");
      resetFormAndPanel();
      fetchTeamOffenses();
    } catch (error) {
      console.error("Error marking as read:", error);
      showNotification("Failed to mark as read. Please try again.", "error");
    }
  };

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";
  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  const safeOffenses = offenses.filter((o) => o && o._id);

  const filteredOffensesForList = safeOffenses.filter(
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
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const resolvedOffensesForHistory = offenses.filter(
    /* ...existing filter... */
    (off) => {
      const isResolved = ["Action Taken", "Escalated", "Closed"].includes(
        off.status
      );
      if (!isResolved) return false;
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
    }
  );

  return (
    <div>
      {/* --- Notification --- */}
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}
      {/* <ConfirmationModal ... /> */}

      {/* --- Header (No Create Button) --- */}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Team Offense Management</h2>
        </div>
        <p className="text-gray-600 mt-1">
          Create, view, and manage offenses for your team members.
        </p>
      </section>

      {/* --- Main Grid Layout --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* --- LEFT PANEL (Conditional Rendering) --- */}
        <div>
          {/* --- (SIGURADUHIN MONG ITO ANG NAKALAGAY) --- */}
          {panelMode === "create" || panelMode === "edit" ? (
            <OffenseForm
              formData={formData}
              setFormData={setFormData}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              isDragOver={isDragOver}
              setIsDragOver={setIsDragOver}
              isEditMode={panelMode === "edit"} // Dynamic based on panelMode
              resetForm={resetFormAndPanel}
              handleSubmit={handleSubmit}
              showNotification={showNotification}
            />
          ) : (
            // Only 'view' mode remains if not create or edit
            <TLOffenseDetails
              isViewMode={true}
              formData={formData}
              onClose={resetFormAndPanel}
              onDelete={handleDelete}
              formatDisplayDate={formatDisplayDate}
              base64ToBlobUrl={base64ToBlobUrl}
              onEditClick={() => handleEditClick(formData)}
            />
          )}
        </div>

        {/* --- RIGHT PANEL (Cases in Progress) --- */}
        <TLCasesInProgress
          offenses={filteredOffensesForList}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onView={handleView} // Sets panelMode to 'view'
          isLoading={isLoading}
          formatDisplayDate={formatDisplayDate}
          base64ToBlobUrl={base64ToBlobUrl}
        />
      </div>

      {/* --- BOTTOM PANEL (Case History) --- */}
      <TLCaseHistory
        offenses={resolvedOffensesForHistory}
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
