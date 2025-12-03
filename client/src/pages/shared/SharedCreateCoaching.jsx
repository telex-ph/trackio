import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";
import socket from "../../utils/socket";

// Components
import CreateForm from "../../components/coaching/CreateForm";
import InProgress from "../../components/coaching/InProgress";
import Details from "../../components/coaching/Details";
import History from "../../components/coaching/History";

import Notification from "../../components/incident-reports/Notification";
import { useStore } from "../../store/useStore";

// -----------------------------
// Component
// -----------------------------
const SharedCreateCoaching = () => {
  // UI & State
  const [isLoading, setIsLoading] = useState(false);
  const [panelMode, setPanelMode] = useState("create");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  // Data
  const [offenses, setOffenses] = useState([]);
  const loggedUser = useStore((state) => state.user);
  const [_currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [formData, setFormData] = useState({
    agentName: "",
    employeeId: "",
    agentRole: "",
    offenseCategory: "",
    offenseLevel: "",
    dateOfOffense: "",
    status: "",
    remarks: "",
    evidence: [],
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const today = DateTime.now().toISODate();

  // -----------------------------
  // Notifications
  // -----------------------------
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, isVisible: true });
  }, []);

  // -----------------------------
  // API Calls
  // -----------------------------
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/get-auth-user");
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Fetch user failed", err);
      showNotification(
        "Failed to load user data. Please log in again.",
        "error"
      );
    }
  }, [showNotification]);

  const fetchTeamOffenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/offenses");
      const list = Array.isArray(res.data)
        ? res.data.filter((o) => o && o._id)
        : [];
      setOffenses(list);
    } catch (err) {
      console.error("Fetch offenses failed", err);
      showNotification("Failed to load team offenses.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  // -----------------------------
  // Socket Handlers
  // -----------------------------
  const setupSocketListeners = useCallback(() => {
    const onAdd = (off) => off?._id && setOffenses((p) => [off, ...p]);

    const onUpdate = (updated) => {
      if (!updated?._id) return;
      setOffenses((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
      );
    };

    const onDelete = (id) => {
      if (!id) return;
      setOffenses((prev) => prev.filter((o) => o._id !== id));
    };

    socket.on("offenseAdded", onAdd);
    socket.on("offenseUpdated", onUpdate);
    socket.on("offenseDeleted", onDelete);
    socket.on("connect", setupSocketListeners);

    return () => {
      socket.off("offenseAdded", onAdd);
      socket.off("offenseUpdated", onUpdate);
      socket.off("offenseDeleted", onDelete);
      socket.off("connect", setupSocketListeners);
    };
  }, []);

  // -----------------------------
  // Lifecycle
  // -----------------------------
  useEffect(() => {
    fetchCurrentUser();
    fetchTeamOffenses();
  }, [fetchCurrentUser, fetchTeamOffenses]);

  useEffect(() => setupSocketListeners(), [setupSocketListeners]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const resetFormAndPanel = useCallback(() => {
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
    setPanelMode("create");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (
      !formData.agentName ||
      !formData.offenseCategory ||
      !formData.dateOfOffense
    ) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      setIsLoading(true);
      const payload = { ...formData };
      delete payload.isRead;

      if (selectedFile) {
        console.log("Evidence FIle: ", selectedFile);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await api.post("/upload/evidence", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(uploadRes.data);

        payload.evidence = [
          {
            fileName: uploadRes.data.fileName,
            size: uploadRes.data.size,
            type: uploadRes.data.type,
            url: uploadRes.data.url,
            public_id: uploadRes.data.public_id,
          },
        ];
      }

      if (panelMode === "edit") {
        await api.put(`/offenses/${editingId}`, payload);
        showNotification("Offense updated!", "success");
      } else {
        await api.post("/offenses", payload);
        showNotification("Offense created!", "success");
      }

      resetFormAndPanel();
      fetchTeamOffenses();
    } catch (err) {
      console.error("Submit error", err);
      showNotification("Failed to submit offense", "error");
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    panelMode,
    editingId,
    selectedFile,
    resetFormAndPanel,
    fetchTeamOffenses,
    showNotification,
  ]);

  const handleView = async (off) => {
    if (!off) return;

    setFormData({
      agentName: off.agentName,
      employeeId: off.employeeId || "",
      agentRole: off.agentRole || "",
      offenseCategory: off.offenseCategory,
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      fileNTE: off.fileNTE || [],
      respondantExplanation: off.respondantExplanation || "",
      fileMOM: off.fileMOM || [],
      fileNDA: off.fileNDA || [],
      isAcknowledged: off.isAcknowledged,
    });

    setEditingId(off._id);
    setPanelMode("view");

    if (off.isReadByReporter === false) {
      try {
        await api.put(`/offenses/${off._id}`, {
          ...off,
          isReadByReporter: true,
        });
        setOffenses((prev) =>
          prev.map((o) =>
            o._id === off._id ? { ...o, isReadByReporter: true } : o
          )
        );
      } catch (err) {
        console.error("Mark as read failed", err);
      }
    }
  };

  const handleEditClick = (off) => {
    setEditingId(off._id);
    setPanelMode("edit");
    setSelectedFile(null);
    setFormData({ ...off });
    window.scrollTo(0, 0);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/offenses/${editingId}`);
      showNotification("Deleted successfully", "success");
      resetFormAndPanel();
      fetchTeamOffenses();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Unknown error";
      showNotification(`Delete failed: ${msg}`, "error");
    }
  };

  const formatDisplayDate = useCallback(
    (d) =>
      d
        ? DateTime.fromISO(d).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
        : "",
    []
  );

  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  // -----------------------------
  // Memos for Filtering
  // -----------------------------
  const safeOffenses = useMemo(
    () => offenses.filter((o) => o && o._id),
    [offenses]
  );

  const filteredOffensesForList = useMemo(() => {
    return safeOffenses.filter((off) => {
      if (off.reportedById !== loggedUser._id) return false;
      if (["Invalid", "Acknowledged"].includes(off.status)) return false;

      return [
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
        .includes(searchQuery.toLowerCase());
    });
  }, [safeOffenses, searchQuery, loggedUser, formatDisplayDate]);

  const resolvedOffensesForHistory = useMemo(() => {
    return safeOffenses.filter((off) => {
      const isResolved =
        loggedUser &&
        off.reportedById === loggedUser._id &&
        ["Invalid", "Acknowledged"].includes(off.status);
      if (!isResolved) return false;

      const textMatch = [
        off.offenseType,
        off.offenseLevel || "",
        off.status,
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

      return (!start || offenseDate >= start) && (!end || offenseDate <= end);
    });
  }, [
    safeOffenses,
    historySearchQuery,
    historyStartDate,
    historyEndDate,
    loggedUser,
    formatDisplayDate,
  ]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div>
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {loggedUser.role === "human-resources" ? (
        <section className="flex flex-col mb-2">
          <h2>Offense Management</h2>
          <p className="text-gray-600 mt-1">
            Create, view, and manage offenses.
          </p>
        </section>
      ) : (
        <section className="flex flex-col mb-2">
          <h2>Coaching Logs Management</h2>
          <p className="text-gray-600 mt-1">
            Create, view, and manage coaching logs for your team.
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        <div>
          {panelMode === "create" || panelMode === "edit" ? (
            <CreateForm
              formData={formData}
              setFormData={setFormData}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              isDragOver={isDragOver}
              setIsDragOver={setIsDragOver}
              isEditMode={panelMode === "edit"}
              resetForm={resetFormAndPanel}
              handleSubmit={handleSubmit}
              showNotification={showNotification}
              isLoading={isLoading}
            />
          ) : (
            <Details
              isViewMode={true}
              formData={formData}
              onClose={resetFormAndPanel}
              onDelete={handleDelete}
              formatDisplayDate={formatDisplayDate}
              onEditClick={() => handleEditClick(formData)}
              loggedUser={loggedUser}
            />
          )}
        </div>

        <InProgress
          offenses={filteredOffensesForList}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onView={handleView}
          isLoading={isLoading}
          formatDisplayDate={formatDisplayDate}
        />
      </div>

      <History
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
        today={today}
        onView={handleView}
      />
    </div>
  );
};

export default SharedCreateCoaching;
