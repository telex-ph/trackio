import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import socket from "../../utils/socket";
import CaseHistory from "../../components/incident-reports/my-offences/CaseHistory";
import { useStore } from "../../store/useStore";
import CasesInProgress from "../../components/incident-reports/my-offences/CasesInProgress";

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

const SharedMyOffences = () => {
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // For Cases in Progress
  const [currentUser, setCurrentUser] = useState(null);
  const loggedUser = useStore((state) => state.user);

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

  const fetchCurrentUser = useCallback(async () => {
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
  }, []);

  const fetchOffenses = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchOffenses();
    };
    loadData();
  }, [fetchCurrentUser, fetchOffenses]);

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

  useEffect(() => setupSocketListeners(), [setupSocketListeners]);

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
        isReadByHR: true,
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

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  const safeOffenses = useMemo(
    () => offenses.filter((o) => o && o._id),
    [offenses]
  );

  const filteredOffensesForList = useMemo(() => {
    return safeOffenses.filter((off) => {
      console.log("Respondant", off.respondantId);
      console.log("Logged user", loggedUser._id);

      if (
        off.respondantId !== loggedUser._id ||
        off.witnesses?.some((w) => w._id === loggedUser._id)
      )
        return false;
      if (["Pending Review", "Invalid", "Acknowledged"].includes(off.status)) return false;

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
  ]);

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
        {/* <OffenseDetails
          isViewMode={true}
          resetForm={resetForm}
          formData={formData}
          formatDisplayDate={formatDisplayDate}
          handleInputChange={handleInputChange}
          originalExplanation={originalExplanation}
          respondentHasExplanation={respondentHasExplanation}
          handleSubmit={handleSubmit}
          showAcknowledgeModal={showAcknowledgeModal}
          setShowAcknowledgeModal={setShowAcknowledgeModal}
          ackMessage={ackMessage}
          setAckMessage={setAckMessage}
          handleAcknowledge={handleAcknowledge}
        /> */}

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
                      const viewUrl = ev.url;
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
                              href={ev.url}
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
                      const viewUrl = nte.url;
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
                              href={nte.url}
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
                        const viewUrl = mom.url;
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
                                href={mom.url}
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
                        const viewUrl = nda.url;
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
                                href={nda.url}
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
              {formData.status === "Acknowledged" && (
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
                {formData.status === "After Hearing" && (
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
        <CasesInProgress
          offenses={filteredOffensesForList}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onView={handleView}
          isLoading={isLoading}
          formatDisplayDate={formatDisplayDate}
        />
      </div>

      {/* --- CASE HISTORY --- */}
      <CaseHistory
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

export default SharedMyOffences;
