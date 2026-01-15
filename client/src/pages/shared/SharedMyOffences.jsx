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
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
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

// local asset import - Updated from bg-005 to bg-006
import bgImage from "../../assets/background/bg-006.png";
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

  //Loader state
  const [isUploading, setIsUploading] = useState(false);

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
  const [originalActionPlan, setOriginalActionPlan] = useState("");

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
      setIsUploading(true);
      const payload = {
        ...formData,
        respondantExplanation: formData.respondantExplanation,
        status: "Respondant Explained",
        isReadByHR: false,
        explanationDateTime: now.toISOString(),
      };

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-ir",
      });

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoachingSubmit = async () => {
    if (
      (!formData.respondantExplanation ||
        formData.respondantExplanation.trim() === "") &&
      (!formData.actionPlan || formData.actionPlan.trim() === "")
    ) {
      showNotification("Please provide an explanation.", "error");
      return;
    }

    const now = new Date();

    try {
      setIsUploading(true);
      const payload = {
        respondantExplanation: formData.respondantExplanation,
        actionPlan: formData.actionPlan,
        status: "Acknowledged",
        isReadByCoach: true,
        isReadByRespondant: true,
        explanationDateTime: now.toISOString(),
      };

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-coaching",
      });

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleIRAcknowledge = async (ackMessage) => {
    try {
      setIsUploading(true);
      const now = new Date();

      const payload = {
        ...formData,
        status: "Acknowledged",
        ackMessage,
        isAcknowledged: true,
        isReadByHR: true,
        isReadByRespondant: true,
        acknowledgedDateTime: now.toISOString(),
      };

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-ir",
      });

      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case has been acknowledged.", "success");
      resetForm();
      fetchOffenses();
      setShowAcknowledgeModal(false);
      setAckMessage("");
    } catch (error) {
      console.error("Error acknowledging case:", error);
      showNotification("Failed to acknowledge. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoachingAcknowledge = async (ackMessage) => {
    try {
      setIsUploading(true);
      const now = new Date();

      const payload = {
        status: "Acknowledged",
        ackMessage,
        isAcknowledged: true,
        isReadByCoach: true,
        isReadByRespondant: true,
        acknowledgedDateTime: now.toISOString(),
      };

      const { data: existingOffense } = await api.get(`/offenses/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingOffense },
        after: { ...existingOffense, ...payload },
        collection: "offense-coaching",
      });

      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Case has been acknowledged.", "success");
      resetForm();
      fetchOffenses();
      setShowAcknowledgeModal(false);
      setAckMessage("");
    } catch (error) {
      console.error("Error acknowledging case:", error);
      showNotification("Failed to acknowledge. Please try again.", "error");
    } finally {
      setIsUploading(false);
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
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
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
      actionPlan: off.actionPlan,
      status: off.status,
      isAcknowledged: off.isAcknowledged,
      ackMessage: off.ackMessage,
      evidence: off.evidence || [],
      fileNTE: off.fileNTE || [],
      fileNDA: off.fileNDA || [],
    });

    setOriginalExplanation(off.respondantExplanation || "");
    setOriginalActionPlan(off.actionPlan || "");

    try {
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
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
      !["Invalid", "Acknowledged", "Archived"].includes(off.status);

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
        ["Invalid", "Acknowledged", "Archived"].includes(off.status) &&
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
    <div className="min-h-screen bg-gray-50 pb-12 overflow-x-hidden">
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {/* header section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 px-4 md:px-6 pt-10 gap-4">
        <div className="w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            offense management
          </h2>
          <p className="text-gray-500 text-[11px] md:text-xs mt-1 font-medium">
            {offenseType === "COACHING"
              ? "view and manage your coaching offenses."
              : "view and manage your ir offenses."}
          </p>
        </div>

        <div className="bg-gray-200/70 p-1.5 flex rounded-full shadow-inner backdrop-blur-sm self-start md:self-auto">
          {["COACHING", "IR"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setOffenseType(type);
                resetForm();
              }}
              className={`relative px-6 py-2 text-[10px] md:text-xs font-bold transition-all duration-300 rounded-full ${
                offenseType === type
                  ? "bg-[#800000] text-white shadow-lg scale-105"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-300/50"
              }`}
            >
              <span className="relative z-10">{type.toLowerCase()}</span>
              {offenseType === type && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-[#800000]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* animation section */}
      <div className="hidden md:block px-6 lg:px-10 mb-10 lg:mb-16 mt-6 relative">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:h-[160px] gap-4 relative">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[450px] h-[180px] bg-gray-200/20 blur-[100px] rounded-full -z-10" />

          {/* updated image container using bg-006.png */}
          <div className="flex-1 w-full lg:max-w-[55%] ml-0 lg:ml-[-10px] overflow-hidden rounded-[2rem] h-44 flex items-center shadow-lg border-2 border-white bg-white relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={offenseType}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                src={bgImage}
                alt="incident management background"
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[#800000]/10 mix-blend-multiply pointer-events-none" />
          </div>

          <div className="hidden lg:flex items-center justify-center w-[500px] h-44">
            <div className="w-full h-full flex items-center justify-center">
              {offenseType === "COACHING" ? (
                <div className="flex items-end gap-2.5 h-32 w-full justify-center relative">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 1 }}
                      animate={{ scaleY: [1, 1.2, 1], translateY: [0, -8, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                      style={{
                        height: `${50 + (i % 5) * 15}px`,
                        width: "32px",
                        transformOrigin: "bottom",
                      }}
                      className={`rounded-t-md shadow-md border border-gray-200 relative ${
                        i % 3 === 0
                          ? "bg-[#800000] border-none"
                          : i % 3 === 1
                          ? "bg-[#FAF9F6] border-gray-300"
                          : "bg-gray-300 border-gray-400"
                      }`}
                    >
                      <div
                        className={`absolute top-2 left-1/2 -translate-x-1/2 w-4 h-[1px] ${
                          i % 3 === 1 ? "bg-gray-300" : "bg-white/20"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center w-full relative h-44 px-4">
                  <div className="flex items-center justify-center -space-x-20 w-full">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: i === 1 ? 1 : 0.6,
                          scale: i === 1 ? 1 : 0.85,
                          rotate: i === 0 ? -10 : i === 2 ? 10 : 0,
                          y: i === 1 ? [-5, 5, -5] : 0,
                        }}
                        transition={{
                          y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                          duration: 0.5,
                        }}
                        className={`w-72 h-40 bg-white rounded-md border-t-[14px] p-6 shadow-2xl relative overflow-hidden border border-gray-100 ${
                          i === 1 ? "border-[#800000] z-20" : "border-gray-300 z-10"
                        }`}
                      >
                        <div className="space-y-3">
                          <div
                            className={`h-2 w-1/2 rounded ${
                              i === 1 ? "bg-[#800000]/20" : "bg-gray-200"
                            }`}
                          />
                          <div className="h-1.5 w-full bg-gray-100 rounded" />
                        </div>
                        {i === 1 && (
                          <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{
                              repeat: Infinity,
                              duration: 3,
                              ease: "linear",
                            }}
                            className="absolute left-0 w-full h-[3px] bg-[#800000] shadow-[0_0_15px_#800000] z-30 opacity-60"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* grid section */}
      <div className="grid grid-cols-1 md:grid-cols-2 px-4 md:px-6 gap-6 md:gap-10 mb-12 items-stretch auto-rows-fr">
        {/* left side: details */}
        <div className="relative flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#800000] z-10 rounded-t-sm" />
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
              isUploading={isUploading}
            />
          ) : (
            <MyCoachingDetails
              isViewMode={isViewMode}
              onClose={resetForm}
              formData={formData}
              formatDisplayDate={formatDisplayDate}
              originalExplanation={originalExplanation}
              originalActionPlan={originalActionPlan}
              handleInputChange={handleInputChange}
              handleSubmit={handleCoachingSubmit}
              showAcknowledgeModal={showAcknowledgeModal}
              setShowAcknowledgeModal={setShowAcknowledgeModal}
              ackMessage={ackMessage}
              setAckMessage={setAckMessage}
              handleAcknowledge={handleCoachingAcknowledge}
              loggedUser={loggedUser}
              isUploading={isUploading}
            />
          )}
        </div>

        {/* right side: progress */}
        <div className="relative flex flex-col h-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#800000] z-10 rounded-t-sm" />
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
      </div>

      {/* history section */}
      <div className="px-4 md:px-6 pb-20">
        <div className="relative overflow-hidden bg-white shadow-xl rounded-b-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#800000] z-10" />
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
              userMap={userMap}
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
              userMap={userMap}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedMyOffences;