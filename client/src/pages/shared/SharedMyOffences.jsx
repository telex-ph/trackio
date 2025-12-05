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
  X as ClearIcon,
  Users,
} from "lucide-react";
import { DateTime } from "luxon"; // Import DateTime
import api from "../../utils/axios";
import socket from "../../utils/socket";
import CaseHistory from "../../components/incident-reports/my-offences/CaseHistory";
import { useStore } from "../../store/useStore";
import CasesInProgress from "../../components/incident-reports/my-offences/CasesInProgress";
import OffenseDetails from "../../components/incident-reports/my-offences/OffenseDetails";
import MyCoachingDetails from "../../components/incident-reports/coaching/my-coaching/MyCoachingDetails";
import MyCoachingInProgress from "../../components/incident-reports/coaching/my-coaching/MyCoachingInProgress";
import MyCoachingHistory from "../../components/incident-reports/coaching/my-coaching/MyCoachingHistory";
import { fetchUserById } from "../../store/stores/getUserById";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [_currentUser, setCurrentUser] = useState(null);
  const loggedUser = useStore((state) => state.user);

  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [ackMessage, setAckMessage] = useState("");

  // States for History Filters
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const today = DateTime.now().toISODate();

  const [offenseType, setOffenseType] = useState("COACHING");

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
      offense.respondantId,
      offense.reportedById,
      offense.coachId,
    ]);
    fetchUsersByIds(idsToFetch);
  }, [offenses, fetchUsersByIds]);

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
        prev.map((offense) =>
          offense._id === updated._id ? { ...offense, ...updated } : offense
        )
      );
    };

    const onDelete = (id) => {
      if (!id) return;
      setOffenses((prev) => prev.filter((offense) => offense._id !== id));
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

  const handleIRSubmit = async () => {
    if (
      !formData.respondantExplanation ||
      formData.respondantExplanation.trim() === ""
    ) {
      showNotification("Please provide an explanation.", "error");
      return;
    }

    const now = new Date();

    try {
      const payload = {
        ...formData,
        respondantExplanation: formData.respondantExplanation,
        status: "Respondant Explained",
        isReadByHR: false,
        explanationDateTime: now.toISOString(),
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

  const handleCoachingSubmit = async () => {
    if (
      !formData.respondantExplanation ||
      formData.respondantExplanation.trim() === ""
    ) {
      showNotification("Please provide an explanation.", "error");
      return;
    }

    const now = new Date();

    try {
      const payload = {
        respondantExplanation: formData.respondantExplanation,
        status: "Respondant Explained",
        isReadByCoach: false,
        isReadByRespondant: true,
        explanationDateTime: now.toISOString(),
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

  const handleIRAcknowledge = async (ackMessage) => {
    try {
      const now = new Date();

      const payload = {
        ...formData,
        status: "Acknowledged",
        ackMessage,
        isAcknowledged: true,
        isReadByHR: true,
        acknowledgedDateTime: now.toISOString(),
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

  const handleCoachingAcknowledge = async (ackMessage) => {
    try {
      const now = new Date();

      const payload = {
        status: "Acknowledged",
        ackMessage,
        isAcknowledged: true,
        isReadByCoach: true,
        isReadByRespondant: true,
        acknowledgedDateTime: now.toISOString(),
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

  const handleIRView = async (off) => {
    setIsViewMode(true);
    setEditingId(off._id);

    let reporterUser = userMap[off.reportedById];
    if (off.reportedById && !reporterUser) {
      reporterUser = await fetchUserById(off.reportedById);
      setUserMap((prev) => ({ ...prev, [off.reportedById]: reporterUser }));
    }

    setFormData({
      ...off,
      reporterName: reporterUser
        ? `${reporterUser.firstName} ${reporterUser.lastName}`
        : "Unknown",
      offenseCategory: off.offenseCategory,
      offenseLevel: off.offenseLevel || "",
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      isReadByRespondant: off.isReadByRespondant || false,
    });

    setOriginalExplanation(off.respondantExplanation || "");

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

  const handleCoachingView = async (off) => {
    setIsViewMode(true);
    setEditingId(off._id);

    let agentUser = userMap[off.respondantId];
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
      respondantExplanation: off.respondantExplanation,
      status: off.status,
      isAcknowledged: off.isAcknowledged,
      ackMessage: off.ackMessage,
      evidence: off.evidence || [],
      fileNTE: off.fileNTE || [],
      fileNDA: off.fileNDA || [],
    });

    setOriginalExplanation(off.respondantExplanation || "");

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

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  const handleHistoryDateReset = () => {
    setHistoryStartDate("");
    setHistoryEndDate("");
  };

  const safeOffenses = useMemo(
    () => offenses.filter((offense) => offense && offense._id),
    [offenses]
  );

  const filteredIROffenses = safeOffenses.filter((off) => {
    const isInvolved =
      off.respondantId === loggedUser._id ||
      off.witnesses?.some((witness) => witness._id === loggedUser._id);

    if (!isInvolved) return false;
    if (["Pending Review", "Invalid", "Acknowledged"].includes(off.status))
      return false;
    if (off.type !== "IR") return false;

    // Only filter by search for Respondants
    if (off.respondantId === loggedUser._id) {
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
    }

    return true; // witnesses always see
  });

  const filteredCoachingOffenses = safeOffenses.filter((off) => {
    const isInvolved =
      off.respondantId === loggedUser._id &&
      !["Invalid", "Acknowledged"].includes(off.status);

    if (!isInvolved) return false;
    if (off.type !== "COACHING") return false;

    // Only filter by search for Respondants
    if (off.respondantId === loggedUser._id) {
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
    }

    return true; // witnesses always see
  });

  const resolvedOffensesForHistory = useMemo(() => {
    return safeOffenses.filter((off) => {
      const isResolved =
        (loggedUser &&
          off.reportedById === loggedUser._id &&
          ["Invalid", "Acknowledged"].includes(off.status) &&
          off.type !== "COACHING") ||
        (loggedUser &&
          off.respondantId === loggedUser._id &&
          ["Invalid", "Acknowledged"].includes(off.status) &&
          off.type !== "COACHING");
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

  const resolvedCoachingForHistory = useMemo(() => {
    return safeOffenses.filter((off) => {
      const isResolved =
        loggedUser &&
        off.respondantId === loggedUser._id &&
        ["Invalid", "Acknowledged"].includes(off.status) &&
        off.type !== "IR";
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

      {/* Header + Offense Type Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
            Offense Management
            {/* Offense Type Toggle */}
            <div className="bg-gray-200 rounded-full p-1 flex shadow-inner">
              {["COACHING", "IR"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setOffenseType(type);
                    resetForm();
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
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage your {offenseType} offenses.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {offenseType === "IR" ? (
          <OffenseDetails
            isViewMode={isViewMode}
            resetForm={resetForm}
            formData={formData}
            formatDisplayDate={formatDisplayDate}
            handleInputChange={handleInputChange}
            originalExplanation={originalExplanation}
            handleSubmit={handleIRSubmit}
            showAcknowledgeModal={showAcknowledgeModal}
            setShowAcknowledgeModal={setShowAcknowledgeModal}
            ackMessage={ackMessage}
            setAckMessage={setAckMessage}
            handleAcknowledge={handleIRAcknowledge}
            loggedUser={loggedUser}
            userMap={userMap}
          />
        ) : (
          <MyCoachingDetails
            isViewMode={isViewMode}
            onClose={resetForm}
            formData={formData}
            formatDisplayDate={formatDisplayDate}
            originalExplanation={originalExplanation}
            handleInputChange={handleInputChange}
            handleSubmit={handleCoachingSubmit}
            showAcknowledgeModal={showAcknowledgeModal}
            setShowAcknowledgeModal={setShowAcknowledgeModal}
            ackMessage={ackMessage}
            setAckMessage={setAckMessage}
            handleAcknowledge={handleCoachingAcknowledge}
            loggedUser={loggedUser}
          />
        )}

        {/* --- CASES IN PROGRESS --- */}
        {offenseType === "IR" ? (
          <CasesInProgress
            offenses={filteredIROffenses}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onView={handleIRView}
            isLoading={isLoading}
            formatDisplayDate={formatDisplayDate}
            loggedUser={loggedUser}
            userMap={userMap}
          />
        ) : (
          <MyCoachingInProgress
            offenses={filteredCoachingOffenses}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onView={handleCoachingView}
            isLoading={isLoading}
            formatDisplayDate={formatDisplayDate}
            loggedUser={loggedUser}
            userMap={userMap}
          />
        )}
      </div>

      {/* --- CASE HISTORY --- */}
      {offenseType === "IR" ? (
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
          onView={handleIRView}
        />
      ) : (
        <MyCoachingHistory
          offenses={resolvedCoachingForHistory}
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
          onView={handleCoachingView}
        />
      )}
    </div>
  );
};

export default SharedMyOffences;
