import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Eye,
  Download,
  X as ClearIcon,
  Tag,
  MessageCircle,
  Users, // Added ClearIcon for reset
} from "lucide-react";
import { DateTime } from "luxon"; // Import DateTime
import api from "../../utils/axios";

// --- HELPER FUNCTION ---
// Converts Base64 data URL to a browser-readable Blob URL
// This fixes the "blank screen" issue when viewing PDFs
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
    // Create and return the Object URL
    const url = URL.createObjectURL(blob);
    // Optional: Revoke the URL when it's no longer needed (e.g., in useEffect cleanup or when component unmounts)
    // This helps free up memory, but be careful not to revoke too early if the URL is still needed.
    // setTimeout(() => URL.revokeObjectURL(url), 60000); // Example: Revoke after 1 minute
    return url;
  } catch (e) {
    console.error("Failed to convert Base64 to Blob URL:", e);
    return base64; // Fallback
  }
};
// --- END OF HELPER FUNCTION ---

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-500",
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    error: {
      bg: "bg-red-500",
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
    info: {
      bg: "bg-blue-500",
      icon: <Bell className="w-5 h-5 text-white" />,
    },
  };

  const { bg, icon } = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed top-20 right-4 sm:top-20 sm:right-8 z-50 flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl shadow-lg text-white transition-all duration-300 ease-in-out transform ${bg}`}
    >
      {icon}
      <p className="text-sm sm:text-base font-medium">{message}</p>
      <button onClick={() => setIsVisible(false)} className="ml-auto">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-gray-200">
        <div className="flex justify-center mb-4">
          <Bell className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          Confirm Action
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white p-3 rounded-xl font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamLeaderOffenses = () => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // For Cases in Progress
  const [currentUser, setCurrentUser] = useState(null);

  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [ackMessage, setAckMessage] = useState("");

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

  const [formData, setFormData] = useState({
    agentName: "",
    offenseCategory: "",
    offenseLevel: "",
    dateOfOffense: "",
    remarks: "",
    evidence: [],
    respondantExplanation: "",
  });

  const [originalExplanation, setOriginalExplanation] = useState("");

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
      offenseLevel: "",
      dateOfOffense: "",
      status: "",
      remarks: "",
      evidence: [],
    });
    setIsViewMode(false);
    setEditingId(null);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.respondantExplanation ||
      formData.respondantExplanation.trim() === ""
    ) {
      showNotification("Please provide an explanation.", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        respondantExplanation: formData.respondantExplanation,
        status: "Respondent Explained",
        isReadByHR: false,
      };

      await api.put(`/offenses/${editingId}`, payload);

      showNotification("Explanation submitted successfully!", "success");

      resetForm();
      fetchOffenses();
    } catch (error) {
      console.error("Error submitting explanation:", error);
      showNotification(
        "Failed to submit explanation. Please try again.",
        "error"
      );
    }
  };

  const handleAcknowledge = async (ackMessage) => {
    try {
      const payload = {
        ...formData,
        status: "Acknowledged",
        ackMessage,
        isAcknowledged: true,
        isReadByHR: false,
      };

      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case has been acknowledged.", "success");
      resetForm();
      fetchOffenses();
      setShowAcknowledgeModal(false);
      setAckMessage("");
    } catch (error) {
      console.error("Error acknowledging case:", error);
      showNotification("Failed to acknowledge. Please try again.", "error");
    }
  };

  const handleView = async (off) => {
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
      isReadByRespondant: off.isReadByRespondant || false, // for agents
    });

    setOriginalExplanation(off.respondantExplanation || "");

    setRespondentHasExplanation(!!off.respondantExplanation);

    setAcknowledged(!!off.isAcknowledged);

    try {
      // Fetch the latest offense data
      const { data: offense } = await api.get(`/offenses/${off._id}`);

      // Only update if not yet read
      if (offense.isReadByRespondant === false) {
        const payload = { ...offense, isReadByRespondant: true };
        await api.put(`/offenses/${off._id}`, payload);

        showNotification("Marked as read successfully!", " success");
        fetchOffenses(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating offense:", error);
      showNotification("Failed to update offense. Please try again.", "error");
    }
  };

  const [respondentHasExplanation, setRespondentHasExplanation] =
    useState(false);

  const [acknowledged, setAcknowledged] = useState(false);

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
      (off.employeeId === currentUser.employeeId ||
        off.witnesses?.some((w) => w._id === currentUser._id)) &&
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
        {/* --- OFFENSE DETAILS --- */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Offense Details
              </h3>
            </div>
            {isViewMode && (
              <button
                onClick={resetForm}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {isViewMode ? (
            <div className="space-y-6">
              {/* Agent Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Respondant
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formData.agentName}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Offense Category
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formData.offenseCategory || "N/A"}
                  </p>
                </div>
              </div>
              {/* Level & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Offense Level
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formData.offenseLevel || "Coming Soon!"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Date of Offense
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                    <p className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                      {formatDisplayDate(formData.dateOfOffense) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* Remarks */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Remarks
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                  {formData.remarks || "No remarks"}
                </p>
              </div>

              {/* Evidence Section (Styled like HR Form) */}

              {formData.evidence.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Evidence
                  </label>
                  <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                    {formData.evidence.slice(0, 1).map((ev, idx) => {
                      const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                      return (
                        <div key={idx} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                            <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                              {ev.fileName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={ev.data}
                              download={ev.fileName}
                              className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Notice to explain
                </label>
                {formData.fileNTE.length > 0 ? (
                  <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                    {formData.fileNTE.slice(0, 1).map((nte, idx) => {
                      const viewUrl = base64ToBlobUrl(nte.data, nte.type);
                      return (
                        <div key={idx} className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                            <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                              {nte.fileName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </a>
                            <a
                              href={nte.data}
                              download={nte.fileName}
                              className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Explanation
                </label>
                <textarea
                  onChange={(e) =>
                    handleInputChange("respondantExplanation", e.target.value)
                  }
                  placeholder="Your explanation..."
                  className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl 
                    h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 
                  text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
                  disabled={!!originalExplanation}
                  value={formData.respondantExplanation || ""}
                />
              </div>
              {formData.fileMOM &&
                formData.fileMOM.length > 0 &&
                formData.fileNDA.length > 0 && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Minutes of the meeting
                    </label>
                    <div className="border-2 border-dashed rounded-2xl p-4 mb-4 border-blue-400 bg-blue-50">
                      {formData.fileMOM.slice(0, 1).map((mom, idx) => {
                        const viewUrl = base64ToBlobUrl(mom.data, mom.type);
                        return (
                          <div key={idx} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                              <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                                {mom.fileName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </a>
                              <a
                                href={mom.data}
                                download={mom.fileName}
                                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      Notice of Disciplinary Action
                    </label>
                    <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
                      {formData.fileNDA.slice(0, 1).map((nda, idx) => {
                        const viewUrl = base64ToBlobUrl(nda.data, nda.type);
                        return (
                          <div key={idx} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                              <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                                {nda.fileName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </a>
                              <a
                                href={nda.data}
                                download={nda.fileName}
                                className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              {acknowledged && (
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Acknowledgement
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                    {formData.ackMessage || "No acknowledgement"}
                  </p>
                </div>
              )}
              {/* Buttons */}
              <div className="flex gap-4">
                {!respondentHasExplanation && (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    Submit
                  </button>
                )}
                {acknowledged && (
                  <button
                    onClick={() => setShowAcknowledgeModal(true)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl hover:bg-gray-300 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-gray-500 italic">
              Select an offense from the list to view details.
            </div>
          )}
        </div>

        {showAcknowledgeModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Acknowledge Action
                </h2>
                <button
                  onClick={() => setShowAcknowledgeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message */}
              <p className="text-gray-700 mb-4">
                Please provide a message or note as part of your
                acknowledgement.
              </p>

              {/* Textarea */}
              <textarea
                className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                value={ackMessage}
                onChange={(e) => setAckMessage(e.target.value)}
                placeholder="Enter your acknowledgement message..."
              />

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                  onClick={() => setShowAcknowledgeModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={!ackMessage.trim()}
                  onClick={() => handleAcknowledge(ackMessage)}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- CASES IN PROGRESS --- */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Cases In Progress
              </h3>
            </div>
            <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {filteredOffenses.length} Records
            </span>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by level, type, category..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {filteredOffenses.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[52.5rem] pr-2">
              {filteredOffenses.map(
                (off) =>
                  off.status !== "Pending Review" &&
                  off.status !== "Invalid" && (
                    <div
                      key={off._id}
                      className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                              {off.offenseType}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                              <span className="text-xs text-gray-500">
                                Date: {formatDisplayDate(off.dateOfOffense)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  {
                                    "Pending Review":
                                      "bg-amber-100 text-amber-700 border border-amber-200",
                                    NTE: "bg-blue-100 text-blue-700 border border-blue-200",
                                    Invalid:
                                      "bg-red-100 text-red-700 border border-red-200",
                                    "Respondent Explained":
                                      "bg-purple-100 text-purple-700 border border-purple-200",
                                    "Scheduled for hearing":
                                      "bg-indigo-100 text-indigo-700 border border-indigo-200",
                                    "After Hearing":
                                      "bg-teal-100 text-teal-700 border border-teal-200",
                                    Acknowledged:
                                      "bg-green-100 text-green-700 border border-green-200",
                                  }[off.status] ||
                                  "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {off.status}
                              </span>

                              {(() => {
                                const status = off.status;

                                // Map status to which "reader" we care about
                                const statusReaderMap = {
                                  "Pending Review": "isReadByHR",
                                  "Respondent Explained": "isReadByHR",
                                  Acknowledged: "isReadByHR",
                                  NTE: "isReadByRespondant",
                                  "Scheduled for hearing": "isReadByRespondant",
                                  "After Hearing": "isReadByRespondant",
                                  Invalid: "isReadByReporter",
                                };

                                const readerKey = statusReaderMap[status];
                                const hasRead = readerKey
                                  ? off[readerKey]
                                  : null;

                                // Determine label based on status
                                const labelMap = {
                                  isReadByHR: {
                                    read: "Read by HR",
                                    unread: "Unread by HR",
                                  },
                                  isReadByRespondant: {
                                    read: "Read",
                                    unread: "Unread",
                                  },
                                  isReadByReporter: {
                                    read: "Read by You",
                                    unread: "Unread by You",
                                  },
                                };

                                if (!readerKey) {
                                  return (
                                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                                      <Bell className="w-4 h-4" /> No Read
                                      Status
                                    </span>
                                  );
                                }

                                const label = hasRead
                                  ? labelMap[readerKey].read
                                  : labelMap[readerKey].unread;
                                const isUnread = !hasRead;

                                return (
                                  <span
                                    className={`flex items-center gap-1 text-xs ${
                                      isUnread
                                        ? "text-red-600 font-bold"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {isUnread ? (
                                      <Bell className="w-4 h-4" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                    {label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="space-y-3 mb-4">
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          Reporter:{" "}
                          <span className="font-medium">
                            {off.reporterName || "N/A"}
                          </span>
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                          <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                          Category:{" "}
                          <span className="font-medium">
                            {off.offenseCategory}
                          </span>
                        </p>
                        {off.hearingDate && (
                          <div className="space-y-3 mb-4">
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              Hearing date:{" "}
                              <span className="font-medium">
                                {DateTime.fromISO(
                                  off.hearingDate
                                ).toLocaleString({
                                  weekday: "short",
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              Witnesses:{" "}
                              <span className="font-medium">
                                {off.witnesses?.length > 0
                                  ? off.witnesses.map((w) => w.name).join(", ")
                                  : "None"}
                              </span>
                            </p>
                          </div>
                        )}

                        {off.remarks && (
                          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-gray-400">
                            <p className="text-xs sm:text-sm text-gray-700 flex items-start gap-2">
                              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-gray-600" />
                              <span className="font-semibold text-gray-800">
                                Remarks:
                              </span>{" "}
                              {off.remarks}
                            </p>
                          </div>
                        )}

                        {off.evidence?.length > 0 && (
                          <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                            {off.evidence.map((ev, idx) => {
                              const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 w-full p-2 bg-white border border-purple-100 rounded-lg mt-1"
                                >
                                  <span className="text-purple-700 truncate text-xs font-medium">
                                    {ev.fileName}
                                  </span>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <a
                                      href={viewUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                      href={ev.data}
                                      download={ev.fileName}
                                      className="p-1 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {off.fileNTE?.length > 0 && (
                          <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                              <span className="font-semibold text-gray-800 text-sm">
                                Notice to explain:
                              </span>
                            </div>
                            <div className="space-y-2">
                              {off.fileNTE.map((ev, idx) => {
                                const viewUrl = base64ToBlobUrl(
                                  ev.data,
                                  ev.type
                                );
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between gap-2 w-full p-2 bg-white border border-purple-100 rounded-lg mt-1"
                                  >
                                    <span className="text-purple-700 truncate text-xs font-medium">
                                      {ev.fileName}
                                    </span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <a
                                        href={viewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </a>
                                      <a
                                        href={ev.data}
                                        download={ev.fileName}
                                        className="p-1 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleView(off)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  )
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-gray-500 italic">
              {isLoading
                ? "Loading offenses..."
                : searchQuery
                ? "No matching offense records found."
                : "No offense records found."}
            </div>
          )}
        </div>
      </div>

      {/* --- CASE HISTORY --- */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Case History
            </h3>
          </div>
          <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            {resolvedOffenses.length} Records
          </span>
        </div>

        {/* Filters for History */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Date Filters */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="date"
              value={historyStartDate}
              onChange={(e) => setHistoryStartDate(e.target.value)}
              max={historyEndDate || today} // Cannot be after end date or today
              className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              title="Start Date"
            />
            <input
              type="date"
              value={historyEndDate}
              onChange={(e) => setHistoryEndDate(e.target.value)}
              min={historyStartDate} // Cannot be before start date
              max={today} // Cannot be in the future
              className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-green-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              title="End Date"
            />
            <button
              onClick={handleHistoryDateReset}
              className="flex items-center justify-center gap-1 sm:col-start-3 p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!historyStartDate && !historyEndDate}
              title="Clear Dates"
            >
              <ClearIcon className="w-4 h-4" /> Clear Dates
            </button>
          </div>
        </div>

        {resolvedOffenses.length > 0 ? (
          <div className="w-full overflow-x-auto overflow-y-auto max-h-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap">Offense Type</th>
                  <th className="p-4 whitespace-nowrap">Level</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Action Taken</th>
                  <th className="p-4 whitespace-nowrap">Evidence</th>
                  <th className="p-4 whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {resolvedOffenses.map((off) => (
                  <tr
                    key={off._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-600">
                      {formatDisplayDate(off.dateOfOffense)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.offenseType}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.offenseLevel || "N/A"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          off.status === "Closed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {off.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.actionTaken}
                    </td>

                    {/* Evidence Column with icons */}
                    <td className="p-4 text-sm text-gray-600">
                      {off.evidence && off.evidence.length > 0 ? (
                        <div className="flex flex-col items-start gap-2">
                          {off.evidence.map((ev, idx) => {
                            const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2"
                              >
                                <span className="truncate" title={ev.fileName}>
                                  {ev.fileName}
                                </span>
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                                <a
                                  href={ev.data}
                                  download={ev.fileName}
                                  className="p-1 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    {/* End of Evidence Column */}

                    <td className="p-4 text-sm text-gray-600">
                      {off.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            {isLoading
              ? "Loading history..."
              : historySearchQuery || historyStartDate || historyEndDate // Check if any filter is active
              ? "No matching history records found for the selected filters."
              : "No resolved offense records found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeaderOffenses;
