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
import api from "../../utils/axios";
import { DateTime } from "luxon";
import { useStore } from "../../store/useStore";
import { fetchUserById } from "../../store/stores/getUserById";

import PendingLeaveRequest from "../../components/leave/requests/TL/PendingLeaveRequest";
import PendingLeaveDetails from "../../components/leave/requests/TL/PendingLeaveDetails";
import CalendarOverlay from "../../components/leave/requests/TL/CalendarOverlay";
import LeaveHistoryTable from "../../components/leave/requests/TL/LeaveHistoryTable";
import socket from "../../utils/socket";

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

const SharedMyTeamLeave = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    remarks: "",
  });
  //   const [selectedFile, setSelectedFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [_currentUser, setCurrentUser] = useState(null);
  const loggedUser = useStore((state) => state.user);
  const [isViewMode, setIsViewMode] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // States for History Filters
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const today = DateTime.now().toISODate();

  //Loader state
  const [isUploading, setIsUploading] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const setupSocketListeners = useCallback(() => {
    const onAdd = (leave) => leave?._id && setLeaves((p) => [leave, ...p]);

    const onUpdate = (updated) => {
      if (!updated?._id) return;
      setLeaves((prev) =>
        prev.map((leave) =>
          leave._id === updated._id ? { ...leave, ...updated } : leave
        )
      );
    };

    const onDelete = (id) => {
      if (!id) return;
      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
    };

    socket.on("leaveAdded", onAdd);
    socket.on("leaveUpdated", onUpdate);
    socket.on("leaveDeleted", onDelete);
    socket.on("connect", setupSocketListeners);

    return () => {
      socket.off("leaveAdded", onAdd);
      socket.off("leaveUpdated", onUpdate);
      socket.off("leaveDeleted", onDelete);
      socket.off("connect", setupSocketListeners);
    };
  }, []);

  useEffect(() => setupSocketListeners(), [setupSocketListeners]);

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
    const idsToFetch = leaves.flatMap((leave) => [
      leave.createdById,
      leave.isRequestedToId,
      leave.coachId,
    ]);
    fetchUsersByIds(idsToFetch);
  }, [leaves, fetchUsersByIds]);

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

  const fetchLeaves = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/leave");
      setLeaves(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching leaves:", error);
      showNotification("Failed to load leaves. Please try again.", "error");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchCurrentUser();
      await fetchLeaves();
    };
    loadData();
  }, [fetchCurrentUser, fetchLeaves]);

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
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeaveView = async (leaveOrId) => {
    let leaveData;

    if (typeof leaveOrId === "string") {
      leaveData = leaves.find((leave) => leave._id === leaveOrId);

      if (!leaveData) {
        console.error("Leave not found for ID:", leaveOrId);
        return;
      }
    } else {
      leaveData = leaveOrId;
    }

    setIsViewMode(true);
    setEditingId(leaveOrId._id);

    let requesterName = userMap[leaveData.createdById];
    if (leaveData.createdById && !requesterName) {
      requesterName = await fetchUserById(leaveData.createdById);
      setUserMap((prev) => ({
        ...prev,
        [leaveData.createdById]: requesterName,
      }));
    }

    setFormData({
      requesterName: requesterName
        ? `${requesterName.firstName} ${requesterName.lastName}`
        : "Unknown",
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      remarks: leaveData.remarks || "",
      leaveFile: leaveData.leaveFile || [],
      status: leaveData.status,
      rejectReasonTL: leaveData.rejectReasonTL,
      rejectedBySupervisorDate: leaveData.rejectedBySupervisorDate,
    });

    try {
      setIsUploading(true);
    } catch (error) {
      console.error("Error updating leave:", error);
      showNotification("Failed to update leave. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApprove = async () => {
    if (!isViewMode) return;
    const now = new Date();

    try {
      setIsUploading(true);

      const payload = {
        status: "Approved by TL",
        approvedBySupervisorDate: now.toISOString(),
        isApprovedBySupervisor: true,
        isApprovedByHR: false,
      };

      const { data: existingLeave } = await api.get(`/leave/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingLeave },
        after: { ...existingLeave, ...payload },
        collection: "leave"
      });

      await api.put(`/leave/${editingId}`, payload);

      showNotification("Leave approved!", "success");
      resetForm();
      fetchLeaves();
    } catch (error) {
      console.error("Error updating leave:", error);
      showNotification("Failed to update.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const [_showInvalidModal, setShowInvalidModal] = useState(false);
  const [_invalidReason, setRejectReason] = useState("");

  const handleReject = async (rejectReason) => {
    if (!isViewMode) return;
    const now = new Date();

    try {
      setIsUploading(true);
      const payload = {
        status: "Rejected by TL",
        rejectReasonTL: rejectReason,
        rejectedBySupervisorDate: now.toISOString(),
        isReadByApprover: true,
        isApprovedBySupervisor: false,
      };

      const { data: existingLeave } = await api.get(`/leave/${editingId}`);

      await api.post("/auditlogs", {
        action: "update",
        before: { ...existingLeave },
        after: { ...existingLeave, ...payload },
        collection: "leave"
      });

      await api.put(`/leave/${editingId}`, payload);
      showNotification("Leave rejected.", "success");
      resetForm();
      fetchLeaves();
      setShowInvalidModal(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      showNotification("Failed to reject.", "error");
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

  const safeLeaves = useMemo(
    () => leaves.filter((leave) => leave && leave._id),
    [leaves]
  );

  const filteredPendingLeaves = safeLeaves.filter((leave) => {
    const isSupervisor = leave.isRequestedToId === loggedUser._id;

    if (!isSupervisor) return false;
    if (!["For approval"].includes(leave.status)) return false;

    return [
      leave.leaveType,
      leave.startDate,
      leave.endDate,
      leave.remarks || "",
      leave.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const leaveHistoryList = useMemo(() => {
    return safeLeaves
      .filter((leave) => {
        const isListed =
          loggedUser &&
          leave.createdById !== loggedUser._id &&
          ["Rejected by TL", "Approved by TL"].includes(leave.status);
        if (!isListed) return false;

        const textMatch = [
          formatDisplayDate(leave.startDate),
          formatDisplayDate(leave.endDate),
          leave.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(historySearchQuery.toLowerCase());

        if (!textMatch) return false;

        const leaveDate = DateTime.fromISO(leave.createdAt).startOf("day");
        const start = historyStartDate
          ? DateTime.fromISO(historyStartDate).startOf("day")
          : null;
        const end = historyEndDate
          ? DateTime.fromISO(historyEndDate).startOf("day")
          : null;

        return (!start || leaveDate >= start) && (!end || leaveDate <= end);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [
    safeLeaves,
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
            Apply Leave & Medical Certificate Upload
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage your team's leave applications
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {!isViewMode ? (
          <PendingLeaveRequest
            leaves={filteredPendingLeaves}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onView={handleLeaveView}
            isLoading={isLoading}
            formatDisplayDate={formatDisplayDate}
            loggedUser={loggedUser}
            userMap={userMap}
          />
        ) : (
          <PendingLeaveDetails
            isViewMode={isViewMode}
            resetForm={resetForm}
            formData={formData}
            formatDisplayDate={formatDisplayDate}
            handleInputChange={handleInputChange}
            loggedUser={loggedUser}
            userMap={userMap}
            isUploading={isUploading}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />
        )}

        {/* --- CALENDAR OVERLAY --- */}
        <CalendarOverlay
          isViewMode={isViewMode}
          startDate={formData.startDate}
          endDate={formData.endDate}
          onChange={(range) => setFormData({ ...formData, ...range })}
        />
      </div>

      {/* --- LEAVE HISTORY --- */}
      <LeaveHistoryTable
        leaves={leaveHistoryList}
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
        onView={handleLeaveView}
        userMap={userMap}
      />
    </div>
  );
};

export default SharedMyTeamLeave;
