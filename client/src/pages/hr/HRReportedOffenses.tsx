import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// Import components
import Notification from "../../components/incident-reports/Notification";
// MODIFIED: Import the new .tsx file. No extension needed.
import HR_OffenseDetails from "../../components/HRIncidentReport/ReportedIR/HR_OffenseDetails";
import HR_CasesInProgress from "../../components/HRIncidentReport/ReportedIR/HR_CasesInProgress";
import HR_CaseHistory from "../../components/HRIncidentReport/ReportedIR/HR_CaseHistory";

// Define TypeScript Interfaces
interface OffenseEvidence {
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
  evidence?: OffenseEvidence[];
  isRead?: boolean;
  isReadByHR?: boolean; // Added for HR acknowledgment
  reportedById?: string;
  reportedByName?: string; // Field for reporter's name
  reporterRole?: string;
  createdAt?: string; // Field for when it was created
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

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [formData, setFormData] = useState<Partial<Offense>>({
    agentName: "", offenseCategory: "", offenseType: "", offenseLevel: "",
    dateOfOffense: "", status: "", actionTaken: "", remarks: "",
    evidence: [], isRead: false, isReadByHR: false,
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

  // Reset form/view
  const resetForm = () => {
    setFormData({
      agentName: "", offenseCategory: "", offenseType: "", offenseLevel: "",
      dateOfOffense: "", status: "", actionTaken: "", remarks: "",
      evidence: [], isRead: false, isReadByHR: false,
    });
    setIsViewMode(false);
    setEditingId(null);
  };

  // Handle clicking "View" on a card
  const handleView = (off: Offense) => {
    setIsViewMode(true);
    setEditingId(off._id);
    setFormData({
      ...off, // Load all offense data
      agentName: off.agentName,
      offenseCategory: off.offenseCategory,
      offenseType: off.offenseType,
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense, // Keep as ISO string for the input
      status: off.status,
      actionTaken: off.actionTaken,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      isRead: off.isRead || false,
      isReadByHR: off.isReadByHR || false,
    });
  };

  // REMOVED: handleMarkAsRead function is no longer needed.

  // NEW: Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: Handle Update button
  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const payload = { ...formData, isReadByHR: true };
      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Offense updated successfully!", "success");
      resetForm();
      fetchOffenses(); // Refresh list
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update. Please try again.", "error");
    }
  };

  // NEW: Handle Escalate button
  const handleEscalate = async () => {
    if (!editingId) return;
    try {
      const payload = {
        ...formData,
        status: "Escalated to Compliance", // Set new status
        isReadByHR: true,
      };
      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case escalated to Compliance!", "success");
      resetForm();
      fetchOffenses();
    } catch (error) {
      console.error("Error escalating case:", error);
      showNotification("Failed to escalate. Please try again.", "error");
    }
  };

  // NEW: Handle Reject button
  const handleReject = async () => {
    if (!editingId) return;
    try {
      // You might want to ensure remarks are filled before rejecting
      if (!formData.remarks) {
        showNotification("Please add remarks before rejecting.", "warning");
        return;
      }
      const payload = {
        ...formData,
        status: "Rejected", // Set new status
        isReadByHR: true,
      };
      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case has been rejected.", "success");
      resetForm();
      fetchOffenses();
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
      !["Action Taken", "Escalated", "Closed", "Rejected", "Escalated to Compliance"].includes(off.status) &&
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
    const isResolved = ["Action Taken", "Escalated", "Closed", "Rejected", "Escalated to Compliance"].includes(
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
        <p className="text-gray-600">View all reported disciplinary offenses.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Offense Details Panel */}
        <HR_OffenseDetails
          isViewMode={isViewMode}
          formData={formData as Offense} // Casting here is fine
          onClose={resetForm}
          onFormChange={handleFormChange}
          onUpdate={handleUpdate}
          onEscalate={handleEscalate}
          onReject={handleReject}
          formatDisplayDate={formatDisplayDate}
          base64ToBlobUrl={base64ToBlobUrl}
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