import React, { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";
import socket from "../../utils/socket";

// Components
import Notification from "../../components/incident-reports/Notification";

import { useStore } from "../../store/useStore";
import { fetchUserById } from "../../store/stores/getUserById";
import CaseHistory from "../../components/incident-reports/escalated-offenses/CaseHistory";
import CasesInProgress from "../../components/incident-reports/escalated-offenses/CasesInProgress";
import OffenseDetails from "../../components/incident-reports/escalated-offenses/OffenseDetails";

// --------------------------------------------------------
// Interfaces
// --------------------------------------------------------

// File structure for uploads
interface FileUpload {
  fileName: string;
  size: number;
  type: string;
  public_id: string;
  url: string;
}

// Main offense structure
interface Offense {
  _id: string;
  agentName: string;
  employeeId?: string;
  respondantId?: string;
  agentRole?: string;
  offenseCategory: string;
  offenseType: string;
  offenseLevel?: string;
  dateOfOffense: string;
  status: string;
  type: string;
  actionTaken: string;
  remarks?: string;
  evidence?: FileUpload[];
  fileNTE?: FileUpload[];
  fileFindings?: FileUpload[];
  fileEscalation?: FileUpload[];
  fileMOM?: FileUpload[];
  fileNDA?: FileUpload[];
  isReadByHR?: boolean;
  isAcknowledged?: boolean;
  afterHearingDateTime?: string;
  reportedById?: string;
  reportedByName?: string;
  reporterRole?: string;
  createdAt?: string;
  updatedAt?: string;
  coachId: string;
  reporterName?: string;
}

const EscalatedOffenses = () => {
  // UI modes and editing state
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Loading + data states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [offenses, setOffenses] = useState<Offense[]>([]);

  // Search states (Cases In Progress)
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Search states (Case History)
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [historyStartDate, setHistoryStartDate] = useState<string>("");
  const [historyEndDate, setHistoryEndDate] = useState<string>("");

  const today: string = DateTime.now().toISODate()!;

  // Logged in Compliance user
  const loggedUser = useStore((state) => state.user);

  // Notification popup
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  //Loader state
  const [isUploading, setIsUploading] = useState(false);

  // Form data for selected offense
  const [formData, setFormData] = useState<Partial<Offense>>({
    agentName: "",
    offenseCategory: "",
    offenseLevel: "",
    dateOfOffense: "",
    status: "",
    remarks: "",
    evidence: [],
    fileNTE: [],
    fileFindings: [],
    fileEscalation: [],
    fileMOM: [],
    fileNDA: [],
  });

  // Show toast-style notifications
  const showNotification = (message: string, type: string) => {
    setNotification({ message, type, isVisible: true });
  };

  // Cache users from IDs for performance
  const [userMap, setUserMap] = useState<Record<string, any>>({});

  // Fetch user details only once per ID
  const fetchUsersByIds = useCallback(
    async (ids: (string | undefined)[] = []) => {
      const uniqueIds = ids.filter((id): id is string => Boolean(id));

      for (const id of uniqueIds) {
        if (!userMap[id]) {
          const user = await fetchUserById(id);
          setUserMap((prev) => ({ ...prev, [id]: user }));
        }
      }
    },
    [userMap]
  );

  // Whenever offenses load, fetch all related user info
  useEffect(() => {
    const idsToFetch = offenses.flatMap((offense) => [
      offense.respondantId,
      offense.reportedById,
      offense.coachId,
    ]);
    fetchUsersByIds(idsToFetch);
  }, [offenses, fetchUsersByIds]);

  // Fetch offense list
  const fetchOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Offense[]>("/offenses");
      setOffenses(response.data || []);
    } catch (error) {
      console.error("Error fetching offenses:", error);
      showNotification("Failed to load offenses. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOffenses();
  }, []);

  // Live socket updates (add/update/delete)
  useEffect(() => {
    const handleAdded = (newOffense: Offense) => {
      if (newOffense?._id) setOffenses((prev) => [newOffense, ...(prev || [])]);
    };

    const handleUpdated = (updatedOffense: Offense) => {
      if (updatedOffense?._id)
        setOffenses((prev) =>
          (prev || []).map((off) =>
            off._id === updatedOffense._id ? updatedOffense : off
          )
        );
    };

    const handleDeleted = (deletedId: string) => {
      if (deletedId)
        setOffenses((prev) =>
          (prev || []).filter((off) => off._id !== deletedId)
        );
    };

    socket.on("offenseAdded", handleAdded);
    socket.on("offenseUpdated", handleUpdated);
    socket.on("offenseDeleted", handleDeleted);

    return () => {
      socket.off("offenseAdded", handleAdded);
      socket.off("offenseUpdated", handleUpdated);
      socket.off("offenseDeleted", handleDeleted);
    };
  }, []);

  // Reset view + form
  const resetForm = () => {
    setFormData({
      agentName: "",
      offenseCategory: "",
      offenseLevel: "",
      dateOfOffense: "",
      status: "",
      remarks: "",
      evidence: [],
    });
    setIsViewMode(false);
    setEditingId(null);
  };

  // When Compliance clicks "View"
  const handleView = async (off: Offense) => {
    if (!off) return;

    setIsViewMode(true);
    setEditingId(off._id);

    // Load respondent + reporter names
    let agentUser = userMap[off.respondantId || ""];
    if (off.respondantId && !agentUser) {
      agentUser = await fetchUserById(off.respondantId);
      setUserMap((prev) => ({ ...prev, [off.respondantId!]: agentUser }));
    }

    let reporterUser = userMap[off.reportedById || ""];
    if (off.reportedById && !reporterUser) {
      reporterUser = await fetchUserById(off.reportedById);
      setUserMap((prev) => ({ ...prev, [off.reportedById!]: reporterUser }));
    }

    // Fill form with selected offense
    setFormData({
      ...off,
      agentName: agentUser
        ? `${agentUser.firstName} ${agentUser.lastName}`
        : "Unknown",
      reporterName: reporterUser
        ? `${reporterUser.firstName} ${reporterUser.lastName}`
        : "Unknown",
      offenseCategory: off.offenseCategory || "",
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense || "",
      status: off.status || "",
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      fileEscalation: off.fileEscalation || [],
      fileMOM: off.fileMOM || [],
      fileNDA: off.fileNDA || [],
      fileNTE: off.fileNTE || [],
      fileFindings: off.fileFindings || [],
    });

    // Auto-mark as read
    try {
      const { data: offense } = await api.get(`/offenses/${off._id}`);

      if (offense.isReadByCompliance === false) {
        await api.put(`/offenses/${off._id}`, {
          ...off,
          isReadByCompliance: true,
        });

        showNotification("New offense has been marked as read!", "success");
        fetchOffenses();
      }
    } catch (err) {
      console.error("Error marking as read:", err);
      showNotification("Failed to update offense.", "error");
    }
  };

  // Update form fields
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Send Findings
  const handleFindings = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      setIsUploading(true);

      const payload = {
        ...formData,
        isReadByRespondant: true,
        status: "Findings sent",
        findingsSentDateTime: now.toISOString(),
        isReadByHR: false,
        isReadByCompliance: true,
      };

      // Upload file
      if (selectedFile) {
        const form = new FormData();
        form.append("file", selectedFile);

        const uploadRes = await api.post("/upload/escalate", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        payload.fileFindings = [
          {
            fileName: uploadRes.data.fileName,
            size: uploadRes.data.size,
            type: uploadRes.data.type,
            url: uploadRes.data.url,
            public_id: uploadRes.data.public_id,
          },
        ];
      }

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-ir",
      });

      await api.put(`/offenses/${editingId}`, payload);

      showNotification("Offense Findings Uploaded!", "success");

      resetForm();
      setSelectedFile(null);
      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Formatting helper for front-end display
  const formatDisplayDate = (dateStr: string | undefined): string =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  // Clear history filters
  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  // Filter active cases
  const filteredOffenses = offenses.filter(
    (off) =>
      !["Invalid", "Acknowledged"].includes(off.status) &&
      ["Escalated to Compliance"].includes(off.status) &&
      off.respondantId !== loggedUser._id &&
      off.type === "IR" &&
      [
        off.agentName,
        off.offenseType,
        off.offenseCategory,
        off.offenseLevel || "",
        off.status,
        off.actionTaken,
        off.remarks || "",
        formatDisplayDate(off.dateOfOffense),
        off.reportedByName || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Filter resolved cases (history)
  const resolvedOffenses = offenses.filter((off) => {
    const isResolved = ["Findings sent"].includes(off.status);
    if (!isResolved) return false;
    if (off.type === "COACHING") return false;

    const textMatch = [
      off.agentName,
      off.offenseType,
      off.offenseLevel || "",
      off.status,
      off.actionTaken,
      off.remarks || "",
      formatDisplayDate(off.dateOfOffense),
      off.reportedByName || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(historySearchQuery.toLowerCase());
    if (!textMatch) return false;

    const offenseDate = DateTime.fromISO(off.dateOfOffense!).startOf("day");
    const start = historyStartDate
      ? DateTime.fromISO(historyStartDate).startOf("day")
      : null;
    const end = historyEndDate
      ? DateTime.fromISO(historyEndDate).startOf("day")
      : null;

    return (!start || offenseDate >= start) && (!end || offenseDate <= end);
  });

  // --------------------------------------------------------
  // UI Rendering
  // --------------------------------------------------------

  return (
    <div>
      {/* Notification popup */}
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {/* Page header */}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Reported Offenses</h2>
        </div>
        <p className="text-gray-600">
          View all reported disciplinary offenses.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Offense details */}
        <OffenseDetails
          isViewMode={isViewMode}
          formData={formData as Offense}
          onClose={resetForm}
          onFormChange={handleFormChange}
          handleFindings={handleFindings}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          isUploading={isUploading}
        />

        {/* Cases in progress */}
        <CasesInProgress
          offenses={filteredOffenses}
          searchQuery={searchQuery}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onView={handleView}
          isLoading={isLoading}
          userMap={userMap}
        />
      </div>

      {/* Case history section */}
      <CaseHistory
        offenses={resolvedOffenses}
        filters={{
          searchQuery: historySearchQuery,
          startDate: historyStartDate,
          endDate: historyEndDate,
        }}
        setFilters={{
          setSearchQuery: (value: string) => setHistorySearchQuery(value),
          setStartDate: (value: string) => setHistoryStartDate(value),
          setEndDate: (value: string) => setHistoryEndDate(value),
        }}
        onDateReset={handleHistoryDateReset}
        isLoading={isLoading}
        formatDisplayDate={formatDisplayDate}
        today={today}
        userMap={userMap}
        onView={handleView}
      />
    </div>
  );
};

export default EscalatedOffenses;
