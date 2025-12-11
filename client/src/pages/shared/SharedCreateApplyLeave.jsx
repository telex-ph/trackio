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
import { useStore } from "../../store/useStore";
import LeaveHistoryTable from "../../components/leave/LeaveHistoryTable";
import CalendarOverlay from "../../components/leave/CalendarOverlay";
import LeaveForm from "../../components/leave/LeaveForm";
import { fetchUserById } from "../../store/stores/getUserById";
import LeaveDetails from "../../components/leave/LeaveDetails";

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

const SharedCreateApplyLeave = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    remarks: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [_currentUser, setCurrentUser] = useState(null);
  const loggedUser = useStore((state) => state.user);
  const [isViewMode, setIsViewMode] = useState(false);

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
    const idsToFetch = leaves.flatMap((offense) => [
      offense.respondantId,
      offense.reportedById,
      offense.coachId,
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
  }, []);

  const handleLeaveSubmit = async () => {
    if (
      !formData.leaveType.trim() ||
      !formData.startDate.trim() ||
      !formData.endDate.trim() ||
      !formData.remarks.trim()
    ) {
      showNotification("Please provide an explanation.", "error");
      return;
    }

    try {
      setIsUploading(true);

      const payload = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        remarks: formData.remarks,
        leaveFile: formData.leave || [],
        status: "For approval",
        isReadByApprover: false,
        isReadByRequestor: true,
      };

      if (selectedFile) {
        console.log("Leave FIle: ", selectedFile);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await api.post("/upload/leave", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(uploadRes.data);

        payload.leaveFile = [
          {
            fileName: uploadRes.data.fileName,
            size: uploadRes.data.size,
            type: uploadRes.data.type,
            url: uploadRes.data.url,
            public_id: uploadRes.data.public_id,
          },
        ];
      }

      await api.post("/leave", payload);
      showNotification("Leave created!", "success");

      resetFormAndPanel();
    } catch (error) {
      console.error("Error submitting explanation:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLeaveView = async (leaveOrId) => {
    let leaveData;

    if (typeof leaveOrId === "string") {
      leaveData = leaves.find((l) => l._id === leaveOrId);

      if (!leaveData) {
        console.error("Leave not found for ID:", leaveOrId);
        return;
      }
    } else {
      leaveData = leaveOrId;
    }

    setIsViewMode(true);

    setFormData({
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      remarks: leaveData.remarks || "",
      leaveFile: leaveData.leaveFile || [],
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

  const leaveHistoryList = useMemo(() => {
    return safeLeaves.filter((leave) => {
      const isListed =
        loggedUser &&
        leave.createdById === loggedUser._id &&
        ["For approval", "Approved"].includes(leave.status);
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
    });
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
            View and manage your leave applications
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {!isViewMode ? (
          <LeaveForm
            formData={formData}
            setFormData={setFormData}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handleLeaveSubmit={handleLeaveSubmit}
            isUploading={isUploading}
          />
        ) : (
          <LeaveDetails
            isViewMode={isViewMode}
            resetForm={resetForm}
            formData={formData}
            formatDisplayDate={formatDisplayDate}
            handleInputChange={handleInputChange}
            loggedUser={loggedUser}
            userMap={userMap}
            isUploading={isUploading}
          />
        )}

        {/* --- CALENDAR OVERLAY --- */}
        <CalendarOverlay
          isViewMode={isViewMode}
          startDate={formData.startDate}
          endDate={formData.endDate}
          onChange={(range) => setFormData({ ...formData, ...range })}
          blockedRanges={leaveHistoryList.map((leave) => ({
            id: leave._id,
            start: leave.startDate,
            end: leave.endDate,
            status: leave.status,
          }))}
          onView={(leave) => handleLeaveView(leave)}
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

export default SharedCreateApplyLeave;
