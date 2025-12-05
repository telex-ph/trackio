import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";
import socket from "../../utils/socket";

// Components
import OffenseForm from "../../components/incident-reports/OffenseForm";
import OffenseDetails from "../../components/incident-reports/OffenseDetails";
import CasesInProgress from "../../components/incident-reports/CasesInProgress";
import CaseHistory from "../../components/incident-reports/CaseHistory";
import Notification from "../../components/incident-reports/Notification";

import { useStore } from "../../store/useStore";
import CoachingForm from "../../components/incident-reports/coaching/CoachingForm";
import CoachingInProgress from "../../components/incident-reports/coaching/CoachingInProgress";
import CoachingHistory from "../../components/incident-reports/coaching/CoachingHistory";
import CoachingDetails from "../../components/incident-reports/coaching/CoachingDetails";
import { fetchUserById } from "../../store/stores/getUserById";

// -----------------------------
// Component
// -----------------------------
const SharedCreateOffences = () => {
  // UI & State
  const [isLoading, setIsLoading] = useState(false);
  const [panelMode, setPanelMode] = useState("create");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  // Data
  const [offenseType, setOffenseType] = useState("COACHING");

  const [offenses, setOffenses] = useState([]);
  const loggedUser = useStore((state) => state.user);
  const [_currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [selectedNDAFile, setSelectedNDAFile] = useState(null);
  const [isDragOverNDA, setIsDragOverNDA] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const today = DateTime.now().toISODate();

  //Loader state
  const [isUploading, setIsUploading] = useState(false);

  // -----------------------------
  // Notifications
  // -----------------------------
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, isVisible: true });
  }, []);

  // -----------------------------
  // Form Data
  // -----------------------------

  const [formData, setFormData] = useState({
    coachId: "",
    agentId: "",
    agentName: "",
    employeeId: "",
    agentRole: "",
    offenseLevel: "",
    dateOfOffense: "",
    status: "",
    remarks: "",
    evidence: [],
  });

  // -----------------------------
  // API Calls
  // -----------------------------

  const [userMap, setUserMap] = useState({});

  const fetchUsersByIds = useCallback(
    async (ids = []) => {
      const uniqueIds = [...new Set(ids.filter(Boolean))];
      uniqueIds.forEach(async (id) => {
        if (!userMap[id]) {
          const user = await fetchUserById(id);
          setUserMap((prev) => ({ ...prev, [id]: user }));
        }
      });
    },
    [userMap]
  );

  useEffect(() => {
    const idsToFetch = offenses.flatMap((offense) => [
      offense.agentId,
      offense.reportedById,
      offense.coachId,
    ]);
    fetchUsersByIds(idsToFetch);
  }, [offenses, fetchUsersByIds]);

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

  const fetchOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/offenses");
      setOffenses(response.data || []);
    } catch (error) {
      console.error("Error fetching offenses:", error);
      showNotification("Failed to load offenses. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleIRSubmit = useCallback(async () => {
    if (!formData.agentName || !formData.dateOfOffense) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      setIsUploading(true);

      const payload = {
        respondantId: formData.respondantId,
        offenseLevel: formData.offenseLevel,
        dateOfOffense: formData.dateOfOffense,
        remarks: formData.remarks,
        evidence: formData.evidence || [],
        status: "Pending Review",
        isReadByHR: false,
        isReadByReporter: true,
        type: "IR",
      };

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
      setIsUploading(false);
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

  // Update form fields dynamically
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new evidence (max 2 for supporting evidence)
  const handleAddEvidence = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!editingId) return;

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);

      // Upload file to the server
      const uploadRes = await api.post("/upload/evidence", formDataToUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Prepare new evidence object
      const newEvidence = {
        fileName: uploadRes.data.fileName,
        size: uploadRes.data.size,
        type: uploadRes.data.type,
        url: uploadRes.data.url,
        public_id: uploadRes.data.public_id,
      };

      await api.put(`/offenses/${editingId}`, {
        evidence: [...(formData.evidence || []), newEvidence],
      });

      setFormData((prev) => ({
        ...prev,
        evidence: [...(prev.evidence || []), newEvidence],
      }));

      showNotification("Evidence uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading evidence:", error);
      showNotification("Failed to upload evidence. Please try again.", "error");
    }
  };

  const handleEdit = async () => {
    if (!editingId) return;

    try {
      setIsUploading(true);

      const payload = {
        dateOfOffense: formData.dateOfOffense,
        remarks: formData.remarks,
        evidence: formData.evidence,
      };

      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Offense updated successfully!", "success");

      // Refresh list
      fetchTeamOffenses();
      resetFormAndPanel();
    } catch (err) {
      console.error("Edit failed", err);
      showNotification("Failed to update offense", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoachingSubmit = useCallback(async () => {
    if (
      !formData.agentName ||
      !formData.dateOfMistake ||
      !formData.coachingMistake
    ) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      setIsUploading(true);

      const payload = {
        respondantId: formData.agentId,
        coachId: formData.coachId,
        dateOfMistake: formData.dateOfMistake,
        coachingDate: formData.coachingDate,
        coachingMistake: formData.coachingMistake,
        evidence: formData.evidence || [],
        status: "Coaching Log",
        isReadByRespondant: false,
        isReadByCoach: true,
        type: "COACHING",
      };

      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);

        const uploadRes = await api.post("/upload/evidence", uploadForm, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

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
        showNotification("Coaching log updated!", "success");
      } else {
        await api.post("/offenses", payload);
        showNotification("Coaching log created!", "success");
      }

      // Reset form and refresh list
      resetFormAndPanel();
      fetchTeamOffenses();
    } catch (err) {
      console.error("Submit error", err);
      showNotification("Failed to submit coaching log", "error");
    } finally {
      setIsUploading(false);
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

  const handleIRView = async (off) => {
    if (!off) return;

    let agentUser = userMap[off.respondantId];
    if (off.respondantId && !agentUser) {
      agentUser = await fetchUserById(off.respondantId);
      setUserMap((prev) => ({ ...prev, [off.respondantId]: agentUser }));
    }

    setFormData({
      agentName: agentUser
        ? `${agentUser.firstName} ${agentUser.lastName}`
        : "Unknown",
      reportedById: off.reportedById,
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

  const handleCoachingView = async (off) => {
    if (!off) return;

    let agentUser = userMap[off.agentId];
    if (off.respondantId && !agentUser) {
      agentUser = await fetchUserById(off.respondantId);
      setUserMap((prev) => ({ ...prev, [off.respondantId]: agentUser }));
    }

    let coachUser = userMap[off.coachId];
    if (off.coachId && !coachUser) {
      coachUser = await fetchUserById(off.coachId);
      setUserMap((prev) => ({ ...prev, [off.coachId]: coachUser }));
    }

    setFormData({
      reportedById: off.reportedById,
      respondantId: off.respondantId,
      agentName: agentUser
        ? `${agentUser.firstName} ${agentUser.lastName}`
        : "Unknown",
      coachId: off.coachId || "",
      coachName: coachUser
        ? `${coachUser.firstName} ${coachUser.lastName}`
        : "Unknown",
      dateOfMistake: off.dateOfMistake,
      coachingDate: off.coachingDate,
      coachingMistake: off.coachingMistake || "",
      status: off.status,
      respondantExplanation: off.respondantExplanation,
      isAcknowledged: off.isAcknowledged,
      ackMessage: off.ackMessage,
      evidence: off.evidence || [],
      fileNDA: off.fileNDA || [],
    });

    setEditingId(off._id);
    setPanelMode("view");

    if (off.isReadByCoach === false) {
      try {
        await api.put(`/offenses/${off._id}`, {
          ...off,
          isReadByCoach: true,
        });
        setOffenses((prev) =>
          prev.map((o) =>
            o._id === off._id ? { ...o, isReadByCoach: true } : o
          )
        );
      } catch (err) {
        console.error("Mark as read failed", err);
      }
    }
  };

  const handleUploadNDA = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      setIsUploading(true);
      const payload = {
        isAcknowledged: false,
        status: "For Acknowledgement",
        isReadByRespondant: false,
        ndaSentDateTime: now.toISOString(),
      };

      if (selectedNDAFile) {
        console.log("NDA FIle: ", selectedNDAFile);

        const formData = new FormData();
        formData.append("file", selectedNDAFile);

        const uploadRes = await api.post("/upload/nda", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(uploadRes.data);

        payload.fileNDA = [
          {
            fileName: uploadRes.data.fileName,
            size: uploadRes.data.size,
            type: uploadRes.data.type,
            url: uploadRes.data.url,
            public_id: uploadRes.data.public_id,
          },
        ];
      }

      // --- API Call ---
      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Documents uploaded successfully!", "success");

      setSelectedNDAFile(null);

      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update. Please try again.", "error");
    } finally {
      setIsUploading(false);
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
      setIsUploading(true);

      await api.delete(`/offenses/${editingId}`);
      showNotification("Deleted successfully", "success");
      resetFormAndPanel();
      fetchTeamOffenses();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Unknown error";
      showNotification(`Delete failed: ${msg}`, "error");
    } finally {
      setIsUploading(false);
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

  const filteredOffensesList = useMemo(() => {
    return safeOffenses.filter((off) => {
      if (off.reportedById !== loggedUser._id) return false;
      if (["Invalid", "Acknowledged"].includes(off.status)) return false;
      if (off.type === "COACHING") return false;

      return [
        off.respondantId,
        off.agentName,
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

  const filteredCoachingList = useMemo(() => {
    return safeOffenses.filter((off) => {
      if (off.reportedById !== loggedUser._id) return false;
      if (["Invalid", "Acknowledged"].includes(off.status)) return false;
      if (off.type === "IR") return false;

      return [
        off.respondantId,
        off.agentName,
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

  const resolvedOffensesHistory = useMemo(() => {
    return safeOffenses.filter((off) => {
      const isResolved =
        loggedUser &&
        off.reportedById === loggedUser._id &&
        ["Invalid", "Acknowledged"].includes(off.status);
      if (!isResolved) return false;
      if (off.type !== "IR") return false;

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

  const resolvedCoachingHistory = useMemo(() => {
    return safeOffenses.filter((off) => {
      const isResolved =
        loggedUser &&
        off.reportedById === loggedUser._id &&
        ["Invalid", "Acknowledged"].includes(off.status);
      if (!isResolved) return false;
      if (off.type !== "COACHING") return false;

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

      {/* Header + optional Offense Type Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          {loggedUser.role === "human-resources" ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Offense Management
              </h2>
              <p className="text-gray-600 mt-1">
                Create, view, and manage offenses.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                Team Offense Management
                {[
                  "team-leader",
                  "operations-manager",
                  "trainer-quality-assurance",
                ].includes(loggedUser.role) && (
                  <div className="bg-gray-200 rounded-full p-1 flex shadow-inner">
                    {["COACHING", "IR"].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setOffenseType(type);
                          resetFormAndPanel();
                        }}
                        className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                          offenseType === type
                            ? type === "IR"
                              ? "bg-red-600 text-white shadow"
                              : "bg-blue-600 text-white shadow"
                            : "text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                Create, view, and manage offenses for your team.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        <div>
          {/* Define forms based on role + offenseType */}
          {(() => {
            const isTLOrOM = [
              "team-leader",
              "operations-manager",
              "trainer-quality-assurance",
            ].includes(loggedUser.role);

            // If not TL/OM → always IR
            const effectiveType = isTLOrOM ? offenseType : "IR";

            const FormComponent =
              effectiveType === "IR" ? OffenseForm : CoachingForm;

            const DetailComponent =
              effectiveType === "IR" ? OffenseDetails : CoachingDetails;

            if (panelMode === "create" || panelMode === "edit") {
              return (
                <FormComponent
                  formData={formData}
                  setFormData={setFormData}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  isDragOver={isDragOver}
                  setIsDragOver={setIsDragOver}
                  isEditMode={panelMode === "edit"}
                  resetForm={resetFormAndPanel}
                  showNotification={showNotification}
                  isUploading={isUploading}
                  userMap={userMap}
                  {...(effectiveType === "IR"
                    ? { handleIRSubmit }
                    : { handleCoachingSubmit })}
                />
              );
            } else {
              return (
                <DetailComponent
                  isViewMode={true}
                  formData={formData}
                  onClose={resetFormAndPanel}
                  onDelete={handleDelete}
                  formatDisplayDate={formatDisplayDate}
                  onEditClick={() => handleEditClick(formData)}
                  handleUploadNDA={handleUploadNDA}
                  selectedNDAFile={selectedNDAFile}
                  setSelectedNDAFile={setSelectedNDAFile}
                  isDragOverNDA={isDragOverNDA}
                  setIsDragOverNDA={setIsDragOverNDA}
                  loggedUser={loggedUser}
                  onFormChange={handleFormChange}
                  onAddEvidence={handleAddEvidence}
                  onSubmitEdit={handleEdit}
                  isUploading={isUploading}
                />
              );
            }
          })()}
        </div>

        {/* Cases In Progress */}
        {(() => {
          const isTLOrOM = [
            "team-leader",
            "operations-manager",
            "trainer-quality-assurance",
          ].includes(loggedUser.role);

          // Force IR for non-TL/OM
          const effectiveType = isTLOrOM ? offenseType : "IR";

          // Component selection
          const CasesComponent =
            effectiveType === "IR" ? CasesInProgress : CoachingInProgress;

          return (
            <CasesComponent
              offenses={
                effectiveType === "IR"
                  ? filteredOffensesList
                  : filteredCoachingList
              }
              searchQuery={searchQuery}
              onSearchChange={(e) => setSearchQuery(e.target.value)}
              onView={
                effectiveType === "IR" ? handleIRView : handleCoachingView
              }
              isLoading={isLoading}
              formatDisplayDate={formatDisplayDate}
              userMap={userMap}
            />
          );
        })()}
      </div>

      {/* Case History */}
      {(() => {
        const isTLOrOM = [
          "team-leader",
          "operations-manager",
          "trainer-quality-assurance",
        ].includes(loggedUser.role);

        const effectiveType = isTLOrOM ? offenseType : "IR";

        const HistoryComponent =
          effectiveType === "IR" ? CaseHistory : CoachingHistory;

        return (
          <HistoryComponent
            offenses={
              effectiveType === "IR"
                ? resolvedOffensesHistory
                : resolvedCoachingHistory
            }
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
            onView={effectiveType === "IR" ? handleIRView : handleCoachingView}
          />
        );
      })()}
    </div>
  );
};

export default SharedCreateOffences;
