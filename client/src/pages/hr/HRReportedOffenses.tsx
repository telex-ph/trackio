import React, { useState, useEffect, useCallback } from "react";
import { DateTime } from "luxon";
import { motion } from "framer-motion";
import api from "../../utils/axios";
import socket from "../../utils/socket";

// Components
import Notification from "../../components/incident-reports/Notification";
import HR_OffenseDetails from "../../components/HRIncidentReport/ReportedIR/HR_OffenseDetails";
import HR_CasesInProgress from "../../components/HRIncidentReport/ReportedIR/HR_CasesInProgress";
import HR_CaseHistory from "../../components/HRIncidentReport/ReportedIR/HR_CaseHistory";

import { useStore } from "../../store/useStore";
import { fetchUserById } from "../../store/stores/getUserById";

// --------------------------------------------------------
// Interfaces
// --------------------------------------------------------

interface FileUpload {
  fileName: string;
  size: number;
  type: string;
  public_id: string;
  url: string;
}

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

const HRReportedOffenses = () => {
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

  // Logged in HR user
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

  const [selectedEscalateFile, setSelectedEscalateFile] = useState<File | null>(
    null
  );
  const [isDragOverEscalate, setIsDragOverEscalate] = useState(false);

  const [selectedMOMFile, setSelectedMOMFile] = useState<File | null>(null);
  const [isDragOverMOM, setIsDragOverMOM] = useState(false);

  const [selectedNDAFile, setSelectedNDAFile] = useState<File | null>(null);
  const [isDragOverNDA, setIsDragOverNDA] = useState(false);

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

  // When HR clicks "View"
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
    });

    // Auto-mark as read
    try {
      const { data: offense } = await api.get(`/offenses/${off._id}`);

      if (offense.isReadByHR === false) {
        await api.put(`/offenses/${off._id}`, {
          ...off,
          isReadByHR: true,
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

  // Validate offense → send NTE
  const handleValid = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      setIsUploading(true);

      const payload = {
        ...formData,
        offenseCategory: Array.isArray(formData.offenseCategory)
          ? formData.offenseCategory
          : formData.offenseCategory
          ? [formData.offenseCategory]
          : [],
        isReadByRespondant: false,
        status: "NTE",
        nteSentDateTime: now.toISOString(),
        isReadByHR: true,
      };

      // Upload NTE file
      if (selectedFile) {
        const form = new FormData();
        form.append("file", selectedFile);

        const uploadRes = await api.post("/upload/nte", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        payload.fileNTE = [
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

      showNotification("Offense validated. NTE sent!", "success");

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

  // Set hearing schedule
  const handleHearingDate = async (
    hearingDate: string,
    witnesses: { _id: string; name: string; employeeId: string }[]
  ) => {
    try {
      setIsUploading(true);
      const now = new Date();

      const payload = {
        ...formData,
        status: "Scheduled for hearing",
        isReadByRespondant: false,
        hearingDate,
        witnesses,
        schedHearingDateTime: now.toISOString(),
      };

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-ir",
      });

      await api.put(`/offenses/${editingId}`, payload);

      showNotification("Hearing has been set.", "success");
      resetForm();
      fetchOffenses();
    } catch (error) {
      console.error("Error setting hearing:", error);
      showNotification("Failed to set hearing date.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload Escalation File for Compliance
  const handleUploadEscalate = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      setIsUploading(true);
      const payload = {
        ...formData,
        status: "Escalated to Compliance",
        isReadByRespondant: true,
        isReadByHR: true,
        isReadByCompliance: false,
        afterHearingDateTime: now.toISOString(),
        escalationSentDateTime: now.toISOString(),
      };

      if (selectedEscalateFile) {
        const formData = new FormData();
        formData.append("file", selectedEscalateFile);

        const uploadRes = await api.post("/upload/escalate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        payload.fileEscalation = [
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

      showNotification("Escalation Sent To Compliance!", "success");

      resetForm();
      setSelectedEscalateFile(null);
      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload MOM
  const handleUploadMOM = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      setIsUploading(true);
      const payload = {
        ...formData,
        status: "MOM Uploaded",
        isReadByRespondant: false,
        afterHearingDateTime: now.toISOString(),
        momSentDateTime: now.toISOString(),
      };

      if (selectedMOMFile) {
        const formData = new FormData();
        formData.append("file", selectedMOMFile);

        const uploadRes = await api.post("/upload/mom", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        payload.fileMOM = [
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

      showNotification("MOM uploaded!", "success");

      resetForm();
      setSelectedMOMFile(null);
      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload NDA
  const handleUploadNDA = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      setIsUploading(true);
      const payload = {
        ...formData,
        isAcknowledged: false,
        status: "For Acknowledgement",
        isReadByRespondant: false,
        afterHearingDateTime: now.toISOString(),
        ndaSentDateTime: now.toISOString(),
      };

      if (selectedNDAFile) {
        const formData = new FormData();
        formData.append("file", selectedNDAFile);

        const uploadRes = await api.post("/upload/nda", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

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

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-ir",
      });

      await api.put(`/offenses/${editingId}`, payload);

      showNotification("NDA uploaded!", "success");

      resetForm();
      setSelectedNDAFile(null);

      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Reject offense
  const handleInvalid = async (invalidReason: string) => {
    try {
      setIsUploading(true);
      const payload = {
        ...formData,
        status: "Invalid",
        invalidReason,
        isReadByReporter: false,
        isReadByHR: true,
      };

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-ir",
      });

      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case rejected.", "success");
      resetForm();
      fetchOffenses();
    } catch (error) {
      console.error("Error rejecting case:", error);
      showNotification("Failed to reject.", "error");
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
    const isResolved = ["Invalid", "Acknowledged"].includes(off.status);
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

  // Safe Asset Resolver
  const imagePath = new URL('../../assets/background/bg-005.png', import.meta.url).href;

  return (
    <div className="min-h-screen">
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {/* HEADER SECTION */}
      <div className="w-full max-w-9xl mx-auto mb-10 px-2 sm:px-6 md:px-3">
        <div className="flex flex-col mb-4">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">team offense management</h2>
          <p className="text-gray-500 text-sm italic">create, view, and manage offenses for your team.</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* LEFT SIDE: STATIC IMAGE */}
          <div className="w-full lg:w-3/5">
            <img
              src={imagePath}
              alt="Management Banner"
              className="w-full h-auto object-cover rounded-3xl shadow-lg border border-gray-100"
            />
          </div>

          {/* RIGHT SIDE: KUSANG GUMAGALAW (Maroon and White Theme) */}
          <div className="w-full lg:w-2/5 flex flex-col gap-6">
            
            {/* Case Stats Tile - Floats Up & Down Automatically */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-red-900 flex items-center justify-between relative overflow-hidden"
            >
              {/* Subtle Maroon Background Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-900/5 rounded-full -mr-10 -mt-10" />
              
              <div className="z-10">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">currently active</p>
                <h3 className="text-4xl font-black text-red-900">{filteredOffenses.length}</h3>
                <span className="text-[11px] text-gray-500 font-medium">Pending IR Reports</span>
              </div>

              {/* Pulsing Maroon Dot */}
              <div className="relative flex items-center justify-center w-16 h-16">
                <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute w-full h-full bg-red-900 rounded-full"
                />
                <div className="w-4 h-4 bg-red-900 rounded-full z-10 shadow-lg shadow-red-900/50" />
              </div>
            </motion.div>

            {/* Resolved Summary - Drifts Sideways Smoothly */}
            <motion.div 
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-red-900 p-6 rounded-3xl shadow-2xl text-white flex flex-col gap-2 relative overflow-hidden"
            >
               {/* Decorative Diagonal Line Animation */}
               <motion.div 
                 animate={{ x: [-200, 400] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="absolute top-0 left-0 w-32 h-full bg-white/10 skew-x-12"
               />

              <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">successfully resolved</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black">{resolvedOffenses.length}</h3>
                <span className="text-xs opacity-60">Items Total</span>
              </div>

              <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-white shadow-[0_0_10px_white]"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* MAIN DATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        <HR_OffenseDetails
          isViewMode={isViewMode}
          formData={formData as Offense}
          onClose={resetForm}
          onFormChange={handleFormChange}
          handleValid={handleValid}
          handleInvalid={handleInvalid}
          handleHearingDate={handleHearingDate}
          handleUploadEscalate={handleUploadEscalate}
          handleUploadMOM={handleUploadMOM}
          handleUploadNDA={handleUploadNDA}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedEscalateFile={selectedEscalateFile}
          setSelectedEscalateFile={setSelectedEscalateFile}
          selectedMOMFile={selectedMOMFile}
          setSelectedMOMFile={setSelectedMOMFile}
          selectedNDAFile={selectedNDAFile}
          setSelectedNDAFile={setSelectedNDAFile}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          isDragOverEscalate={isDragOverEscalate}
          setIsDragOverEscalate={setIsDragOverEscalate}
          isDragOverMOM={isDragOverMOM}
          setIsDragOverMOM={setIsDragOverMOM}
          isDragOverNDA={isDragOverNDA}
          setIsDragOverNDA={setIsDragOverNDA}
          isUploading={isUploading}
        />

        <HR_CasesInProgress
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

      <HR_CaseHistory
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

export default HRReportedOffenses;