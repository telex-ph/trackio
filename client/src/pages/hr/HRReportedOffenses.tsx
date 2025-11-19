import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";
import socket from "../../utils/socket";

// Import components
import Notification from "../../components/incident-reports/Notification";
// MODIFIED: Import the new .tsx file. No extension needed.
import HR_OffenseDetails from "../../components/HRIncidentReport/ReportedIR/HR_OffenseDetails";
import HR_CasesInProgress from "../../components/HRIncidentReport/ReportedIR/HR_CasesInProgress";
import HR_CaseHistory from "../../components/HRIncidentReport/ReportedIR/HR_CaseHistory";
import { useStore } from "../../store/useStore";

// Define TypeScript Interfaces
interface FileUpload {
  fileName: string;
  size: number;
  type: string;
  data: string;
}

interface Offense {
  _id: string;
  agentName: string;
  employeeId?: string;
  agentRole?: string;
  offenseCategory: string;
  offenseType: string;
  offenseLevel?: string;
  dateOfOffense: string;
  status: string;
  actionTaken: string;
  remarks?: string;
  evidence?: FileUpload[];
  fileNTE?: FileUpload[];
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
}

// Helper Function
const base64ToBlobUrl = (base64: string, type: string): string => {
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

const HRReportedOffenses = () => {
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [offenses, setOffenses] = useState<Offense[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // History states
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [historyStartDate, setHistoryStartDate] = useState<string>("");
  const [historyEndDate, setHistoryEndDate] = useState<string>("");

  const today: string = DateTime.now().toISODate()!;

  const decrementUnreadOffensesHR = useStore(
    (state) => state.decrementUnreadOffensesHR
  );

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const [selectedMOMFile, setSelectedMOMFile] = useState<File | null>(null);
  const [isDragOverMOM, setIsDragOverMOM] = useState(false);

  const [selectedNDAFile, setSelectedNDAFile] = useState<File | null>(null);
  const [isDragOverNDA, setIsDragOverNDA] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string); // FIX
      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  };

  const [formData, setFormData] = useState<Partial<Offense>>({
    agentName: "",
    offenseCategory: "",
    offenseLevel: "",
    dateOfOffense: "",
    status: "",
    remarks: "",
    evidence: [],
    fileNTE: [],
    fileMOM: [],
    fileNDA: [],
  });

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type, isVisible: true });
  };

  // Fetch all offenses
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

  useEffect(() => {
    fetchOffenses();
  }, []);

  useEffect(() => {
    if (!setOffenses) return; // safeguard

    const handleAdded = (newOffense: Offense | null) => {
      if (!newOffense?._id) return;
      setOffenses((prev) => [newOffense, ...(prev || [])]);
    };

    const handleUpdated = (updatedOffense: Offense | null) => {
      if (!updatedOffense?._id) return;
      setOffenses((prev) =>
        (prev || []).map((off) =>
          off?._id === updatedOffense._id ? { ...off, ...updatedOffense } : off
        )
      );
    };

    const handleDeleted = (deletedId: string | null) => {
      if (!deletedId) return;
      setOffenses((prev) =>
        (prev || []).filter((off) => off?._id !== deletedId)
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
  }, [setOffenses]);

  // Reset form/view
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

  // Handle clicking "View" on a card
  const handleView = async (off: Offense) => {
    setIsViewMode(true);
    setEditingId(off._id);
    setFormData({
      ...off,
      agentName: off.agentName,
      offenseCategory: off.offenseCategory,
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      fileMOM: off.fileMOM || [],
      fileNDA: off.fileNDA || [],
      fileNTE: off.fileNTE || [],
    });

    try {
      const { data: offense } = await api.get(`/offenses/${off._id}`);
      console.log(offense.isReadByHR);
      
      if (offense.isReadByHR === false) {
        const payload = { ...off, isReadByHR: true };
        await api.put(`/offenses/${off._id}`, payload);
        decrementUnreadOffensesHR();
        showNotification("New offense have been read!", "success");
        fetchOffenses();
      }
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update. Please try again.", "error");
    }
  };

  // NEW: Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [showHearingModal, setShowHearingModal] = useState<boolean>(false);
  const [hearingDate, setHearingDate] = React.useState("");

  const handleHearingDate = async (
    hearingDate: string,
    witnesses: { _id: string; name: string; employeeId: string }[]
  ) => {
    try {
      const payload = {
        ...formData,
        status: "Scheduled for hearing",
        hearingDate,
        witnesses,
      };

      await api.put(`/offenses/${editingId}`, payload);

      showNotification("Hearing has been set.", "success");
      resetForm();
      fetchOffenses();
      setHearingDate("");
      setShowHearingModal(false);
    } catch (error) {
      console.error("Error setting hearing date:", error);
      showNotification(
        "Failed to set hearing date. Please try again.",
        "error"
      );
    }
  };

  // NEW: Handle Update button
  const handleValid = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      const payload = {
        ...formData,
        isReadByRespondant: false,
        status: "NTE",
        nteSentDateTime: now.toISOString(),
      };

      if (selectedFile) {
        const base64File = await fileToBase64(selectedFile);
        payload.fileNTE = [
          {
            fileName: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: base64File,
          },
        ];
      }
      // -------------------------------------------

      await api.put(`/offenses/${editingId}`, payload);

      showNotification("Offense is validated. NTE!", "success");

      resetForm();
      setSelectedFile(null);
      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update. Please try again.", "error");
    }
  };

  const handleAfterHearing = async () => {
    if (!editingId) return;

    const now = new Date();

    try {
      const payload = {
        ...formData,
        isAcknowledged: false,
        status: "After Hearing",
        afterHearingDateTime: now.toISOString(),
      };

      if (selectedMOMFile) {
        const base64MOM = await fileToBase64(selectedMOMFile);
        payload.fileMOM = [
          ...(formData.fileMOM || []),
          {
            fileName: selectedMOMFile.name,
            size: selectedMOMFile.size,
            type: selectedMOMFile.type,
            data: base64MOM,
          },
        ];
      }

      if (selectedNDAFile) {
        const base64NDA = await fileToBase64(selectedNDAFile);
        payload.fileNDA = [
          ...(formData.fileNDA || []),
          {
            fileName: selectedNDAFile.name,
            size: selectedNDAFile.size,
            type: selectedNDAFile.type,
            data: base64NDA,
          },
        ];
      }

      console.log("Final payload fileMOM:", payload.fileMOM);
      console.log("Final payload fileNDA:", payload.fileNDA);
      console.log("Payload before API call:", payload);
      console.log("selectedMOMFile:", selectedMOMFile);
      console.log("selectedNDAFile:", selectedNDAFile);

      // --- API Call ---
      await api.put(`/offenses/${editingId}`, payload);

      showNotification("Documents uploaded successfully!", "success");

      // --- Reset ---
      resetForm();
      setSelectedMOMFile(null);
      setSelectedNDAFile(null);

      fetchOffenses();
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update. Please try again.", "error");
    }
  };

  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidReason, setInvalidReason] = useState("");

  const rejectOffense = async (invalidReason: string) => {
    try {
      const payload = {
        ...formData,
        status: "Invalid",
        invalidReason,
        isReadByReporter: false,
      };

      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case has been rejected.", "success");
      resetForm();
      fetchOffenses();
      setShowInvalidModal(false);
      setInvalidReason("");
    } catch (error) {
      console.error("Error rejecting case:", error);
      showNotification("Failed to reject. Please try again.", "error");
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string | undefined): string =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  // Reset history date filters
  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  // Filter for "Cases In Progress"
  const filteredOffenses = offenses.filter(
    (off) =>
      ![
        "Action Taken",
        "Escalated",
        "Closed",
        "Rejected",
        "Escalated to Compliance",
      ].includes(off.status) &&
      [
        off.agentName,
        off.offenseType,
        off.offenseCategory,
        off.offenseLevel || "",
        off.status,
        off.actionTaken,
        off.remarks || "",
        formatDisplayDate(off.dateOfOffense),
        off.reportedByName || "", // Add reporter name to search
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Filter for "Case History"
  const resolvedOffenses = offenses.filter((off) => {
    const isResolved = [
      "Action Taken",
      "Escalated",
      "Closed",
      "Rejected",
      "Escalated to Compliance",
    ].includes(off.status);
    if (!isResolved) return false;

    const textMatch = [
      off.agentName,
      off.offenseType,
      off.offenseLevel || "",
      off.status,
      off.actionTaken,
      off.remarks || "",
      formatDisplayDate(off.dateOfOffense),
      off.reportedByName || "", // Add reporter name to search
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
    const isAfterStartDate = start ? offenseDate >= start : true;
    const isBeforeEndDate = end ? offenseDate <= end : true;
    return isAfterStartDate && isBeforeEndDate;
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
          <h2>Reported Offenses</h2>
        </div>
        <p className="text-gray-600">
          View all reported disciplinary offenses.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Offense Details Panel */}
        <HR_OffenseDetails
          isViewMode={isViewMode}
          formData={formData as Offense} // Casting here is fine
          onClose={resetForm}
          onFormChange={handleFormChange}
          handleValid={handleValid}
          handleHearingDate={handleHearingDate}
          handleAfterHearing={handleAfterHearing}
          base64ToBlobUrl={base64ToBlobUrl}
          rejectOffense={rejectOffense}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedMOMFile={selectedMOMFile}
          setSelectedMOMFile={setSelectedMOMFile}
          selectedNDAFile={selectedNDAFile}
          setSelectedNDAFile={setSelectedNDAFile}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
          isDragOverMOM={isDragOverMOM}
          setIsDragOverMOM={setIsDragOverMOM}
          isDragOverNDA={isDragOverNDA}
          setIsDragOverNDA={setIsDragOverNDA}
        />


        {/* Cases in Progress Panel */}
        <HR_CasesInProgress
          offenses={filteredOffenses}
          searchQuery={searchQuery}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          onView={handleView}
          isLoading={isLoading}
          formatDisplayDate={formatDisplayDate}
          base64ToBlobUrl={base64ToBlobUrl}
        />
      </div>

      {/* Case History Panel */}
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
        base64ToBlobUrl={base64ToBlobUrl}
        today={today}
      />
    </div>
  );
};

export default HRReportedOffenses;
