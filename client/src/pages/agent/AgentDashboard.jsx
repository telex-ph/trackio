import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  Calendar,
  Download,
  Paperclip,
  FileText,
  ArrowUpRight,
  Eye,
  Pin,
  PinOff,
  Heart,
} from "lucide-react";
import telexcover from "../../assets/background/telex-cover.jpg";
import api from "../../utils/axios";
import { DateTime } from "luxon";

import PunctualityChart from "../../components/charts/PunctualityChart";
import PaydayCard from "../../components/cards/PaydayCard";
import DailyRecordsCard from "../../components/cards/DailyRecordsCard";
import FileViewModal from "../../components/modals/FileViewModal";
import AnnouncementDetailModal from "../../components/modals/AnnouncementDetailModal";
import DepartmentAnnouncementSection from "../../components/cards/DepartmentAnnouncementSection";
import { useAnnouncementInteractions } from "../../hooks/useAnnouncementInteractions";
import { useStore } from "../../store/useStore";

import {
  getAnnouncementDepartment,
  getPersistentUserId,
  getPersistentUserName,
  getPersistentUserEmployeeId,
  getPersistentUserDepartment,
} from "../../utils/announcementUtils";

const getUniqueViewers = (announcement) => {
  if (!announcement.views || !Array.isArray(announcement.views)) {
    return [];
  }

  // Filter out empty/invalid views and get unique users
  const uniqueViewers = announcement.views
    .filter(
      (view) =>
        view && view.userId && view.userId.trim() !== "" && view.viewedAt
    )
    .reduce((acc, view) => {
      // Remove duplicates by userId
      if (!acc.find((v) => v.userId === view.userId)) {
        acc.push({
          userId: view.userId,
          userName: view.userName || "Unknown User",
          viewedAt: view.viewedAt,
          viewedAtFormatted: new Date(view.viewedAt).toLocaleDateString(),
        });
      }
      return acc;
    }, []);

  return uniqueViewers;
};

// Function to get unique acknowledgements
const getUniqueAcknowledgements = (announcement) => {
  if (
    !announcement.acknowledgements ||
    !Array.isArray(announcement.acknowledgements)
  ) {
    return [];
  }

  const uniqueAcknowledgements = announcement.acknowledgements
    .filter(
      (ack) =>
        ack && ack.userId && ack.userId.trim() !== "" && ack.acknowledgedAt
    )
    .reduce((acc, ack) => {
      if (!acc.find((a) => a.userId === ack.userId)) {
        acc.push({
          userId: ack.userId,
          userName: ack.userName || "Unknown User",
          acknowledgedAt: ack.acknowledgedAt,
          acknowledgedAtFormatted: new Date(
            ack.acknowledgedAt
          ).toLocaleDateString(),
        });
      }
      return acc;
    }, []);

  return uniqueAcknowledgements;
};

// Comprehensive function to process announcement data
const processAnnouncementData = (announcement) => {
  if (!announcement) return null;

  const uniqueViewers = getUniqueViewers(announcement);
  const uniqueAcknowledgements = getUniqueAcknowledgements(announcement);

  return {
    ...announcement,
    processedViews: uniqueViewers,
    processedAcknowledgements: uniqueAcknowledgements,
    totalViews: uniqueViewers.length,
    totalAcknowledgements: uniqueAcknowledgements.length,
    formattedDateTime: new Date(announcement.dateTime).toLocaleDateString(),
  };
};

// ==================== FILE ATTACHMENT COMPONENT ====================
const FileAttachment = ({ file, onDownload, onView }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Paperclip className="w-4 h-4 text-gray-500" />;
    }
  };

  const canPreview = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["pdf", "jpg", "jpeg", "png", "gif", "txt"].includes(extension);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg mt-2">
      <div className="flex items-center gap-2">
        {getFileIcon(file.name)}
        <span className="text-xs font-medium text-gray-700 truncate max-w-24">
          {file.name}
        </span>
      </div>
      <div className="flex gap-1">
        {canPreview(file.name) && (
          <button
            onClick={() => onView(file)}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
            title="View file"
          >
            <Eye className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onDownload(file)}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
          title="Download file"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// ==================== ANNOUNCEMENT CARD COMPONENT ====================
const AnnouncementCard = ({
  announcement,
  onReadMore,
  onFileDownload,
  onFileView,
  onTogglePin,
  canPinMore,
  onLike,
  hasLiked,
  currentUserId,
}) => {
  const formatDisplayDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const date = DateTime.fromISO(isoDateStr);
    return date.toLocaleString({
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const placeholderImage =
    "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";

  // GAMITIN ANG PROCESSED DATA
  const processedAnnouncement = processAnnouncementData(announcement);
  const viewCount = processedAnnouncement.totalViews;
  const likeCount = processedAnnouncement.totalAcknowledgements;
  const isLiked = hasLiked(announcement, currentUserId);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "High":
        return "Urgent";
      case "Medium":
        return "Medium";
      case "Low":
        return "Low";
      default:
        return priority;
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden border border-gray-200 h-full flex flex-col">
      <div className="relative h-40 overflow-hidden">
        {announcement.attachment &&
        announcement.attachment.type.startsWith("image/") ? (
          <img
            src={announcement.attachment.data}
            alt={announcement.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        ) : (
          <img
            src={placeholderImage}
            alt="Announcement"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(announcement);
          }}
          disabled={!canPinMore && !announcement.isPinned}
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all duration-300 backdrop-blur-sm ${
            announcement.isPinned
              ? "bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg"
              : !canPinMore
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-gray-500/80 text-white hover:bg-gray-600"
          }`}
        >
          {announcement.isPinned ? (
            <PinOff className="w-3 h-3" />
          ) : (
            <Pin className="w-3 h-3" />
          )}
          {announcement.isPinned ? "Pinned" : "Pin"}
        </button>

        {announcement.priority === "High" && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
            🔥 URGENT
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-2">
            {announcement.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDisplayDate(announcement.dateTime)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
          {announcement.agenda}
        </p>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <User className="w-3 h-3" />
          <span>By {announcement.postedBy}</span>
        </div>

        {announcement.attachment &&
          !announcement.attachment.type.startsWith("image/") && (
            <div className="mb-3">
              <FileAttachment
                file={announcement.attachment}
                onDownload={onFileDownload}
                onView={onFileView}
              />
            </div>
          )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            {/* GAMIT ANG PROCESSED VIEW COUNT */}
            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <Eye className="w-4 h-4" />
              <span>{viewCount}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isLiked && currentUserId) {
                  onLike(announcement._id, currentUserId);
                }
              }}
              disabled={isLiked || !currentUserId}
              className="flex items-center gap-1 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                isLiked ? "You already liked this" : "Like this announcement"
              }
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked
                    ? "text-red-500 fill-current"
                    : "text-gray-500 hover:text-red-500"
                }`}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span className={isLiked ? "text-red-500" : "text-gray-600"}>
                {likeCount}
              </span>
            </button>
          </div>

          <button
            onClick={() => onReadMore(announcement)}
            className="w-auto bg-gradient-to-r from-[#ff0b0b] via-[#c11112] to-[#60020c] text-white py-2 px-4 rounded-[20px] text-sm font-medium hover:from-[#c11112] hover:via-[#ff0b0b] transition-all duration-300 hover:shadow-lg flex items-center gap-2"
          >
            <span>Read More</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
              announcement.priority
            )}`}
          >
            {getPriorityLabel(announcement.priority)} Priority
          </span>
        </div>
      </div>
    </div>
  );
};


// ==================== MAIN AGENT DASHBOARD COMPONENT ====================
const AgentDashboard = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [fileViewModal, setFileViewModal] = useState({
    isOpen: false,
    file: null,
  });
  const [announcementDetailModal, setAnnouncementDetailModal] = useState({
    isOpen: false,
    announcement: null,
  });
  const [showPinLimitToast, setShowPinLimitToast] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [accountingPinned, setAccountingPinned] = useState(false);
  const [compliancePinned, setCompliancePinned] = useState(false);
  const [hrPinned, setHrPinned] = useState(false);
  const [technicalPinned, setTechnicalPinned] = useState(false);

  // Get the current logged user
  const user = useStore((state) => state.user);
  console.log(user);

  // NEW: Separate pin limits per department
  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements";

  const { hasLiked, trackView, handleLike, getViewCount, getLikeCount } =
    useAnnouncementInteractions(announcements, setAnnouncements);

  useEffect(() => {
    const initializeUserData = () => {
      try {
        const userId = getPersistentUserId();
        const userName = getPersistentUserName();
        const employeeId = getPersistentUserEmployeeId();
        const department = getPersistentUserDepartment();

        console.log("🔑 Initializing user data:", {
          userId,
          userName,
          employeeId,
          department,
        });

        const effectiveUserId = employeeId || userId;

        if (!effectiveUserId) {
          console.error("❌ No user ID or employee ID found");
          setCurrentUser({
            _id: "unknown_user",
            name: "User",
            employeeId: null,
            department: null,
          });
          return;
        }

        setCurrentUser({
          _id: effectiveUserId,
          name: userName || "User",
          employeeId: employeeId,
          department: department,
        });
      } catch (error) {
        console.error("❌ Error initializing user data:", error);
        setCurrentUser({
          _id: "fallback_user",
          name: "User",
          employeeId: null,
          department: null,
        });
      }
    };

    initializeUserData();
  }, []);

  // Pinning functionality - UPDATED for per-department limits
  const getPinnedAnnouncementsFromStorage = () => {
    try {
      const pinned = localStorage.getItem(PINNED_ANNOUNCEMENTS_KEY);
      return pinned ? JSON.parse(pinned) : {};
    } catch (error) {
      console.error("Error reading pinned announcements:", error);
      return {};
    }
  };

  const savePinnedAnnouncementToStorage = (announcementId, isPinned) => {
    try {
      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      if (isPinned) {
        pinnedAnnouncements[announcementId] = true;
      } else {
        delete pinnedAnnouncements[announcementId];
      }
      localStorage.setItem(
        PINNED_ANNOUNCEMENTS_KEY,
        JSON.stringify(pinnedAnnouncements)
      );
    } catch (error) {
      console.error("Error saving pinned announcement:", error);
    }
  };

  // NEW: Get pinned count per department
  const getPinnedCountByDepartment = (departmentAnnouncements) => {
    return departmentAnnouncements.filter((a) => a.isPinned).length;
  };

  // NEW: Check if can pin more in specific department
  const canPinMoreInDepartment = (departmentAnnouncements) => {
    return (
      getPinnedCountByDepartment(departmentAnnouncements) <
      MAX_PINNED_PER_DEPARTMENT
    );
  };

  const showPinLimitMessage = () => {
    setShowPinLimitToast(true);
    setTimeout(() => setShowPinLimitToast(false), 3000);
  };

  const handleTogglePin = async (announcement) => {
    try {
      const newPinnedStatus = !announcement.isPinned;

      // NEW: Get department of the announcement
      const department = getAnnouncementDepartment(
        announcement.postedBy,
        announcement.title
      );
      const { accounting, compliance, technical, hr } =
        categorizeAnnouncements(announcements);

      let departmentAnnouncements = [];
      switch (department) {
        case "Accounting":
          departmentAnnouncements = accounting;
          break;
        case "Compliance":
          departmentAnnouncements = compliance;
          break;
        case "Technical":
          departmentAnnouncements = technical;
          break;
        case "HR & Admin":
          departmentAnnouncements = hr;
          break;
        default:
          departmentAnnouncements = hr;
      }

      // NEW: Check department-specific pin limit
      if (newPinnedStatus && !canPinMoreInDepartment(departmentAnnouncements)) {
        showPinLimitMessage();
        return;
      }

      savePinnedAnnouncementToStorage(announcement._id, newPinnedStatus);

      const updatedAnnouncement = {
        ...announcement,
        isPinned: newPinnedStatus,
      };

      const updatedAnnouncements = announcements.map((a) =>
        a._id === announcement._id ? updatedAnnouncement : a
      );

      const sortedAnnouncements = updatedAnnouncements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const priorityA = priorityOrder[a.priority] || 0;
        const priorityB = priorityOrder[b.priority] || 0;

        if (priorityB !== priorityA) {
          return priorityB - priorityA;
        }

        return new Date(b.dateTime) - new Date(a.dateTime);
      });

      setAnnouncements(sortedAnnouncements);

      // Update server
      try {
        await api.patch(`/announcements/${announcement._id}`, {
          isPinned: newPinnedStatus,
        });
      } catch (patchError) {
        console.warn("PATCH failed, falling back to PUT:", patchError.message);
        await api.put(`/announcements/${announcement._id}`, {
          ...announcement,
          isPinned: newPinnedStatus,
        });
      }
    } catch (error) {
      console.error("❌ Error toggling pin:", error);
    }
  };

  // ==================== FETCH ANNOUNCEMENTS - AYOS NA QUERY ====================
  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      console.log("📡 Fetching announcements from API...");

      const response = await api.get("/announcements");
      console.log("✅ API Response:", response.data);

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();

      // PROCESS THE DATA DITO GAMIT ANG PROCESSING FUNCTION
      const processedAnnouncements = response.data
        .filter((ann) => ann && ann._id) // Filter valid announcements
        .map((announcement) => ({
          ...announcement,
          isPinned:
            pinnedAnnouncements[announcement._id] ||
            announcement.isPinned ||
            false,
          views: Array.isArray(announcement.views) ? announcement.views : [],
          acknowledgements: Array.isArray(announcement.acknowledgements)
            ? announcement.acknowledgements
            : [],
        }))
        .map(processAnnouncementData) // PROCESS EACH ANNOUNCEMENT
        .filter((ann) => ann.status !== "Cancelled") // Filter out cancelled
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;

          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }

          return new Date(b.dateTime) - new Date(a.dateTime);
        });

      console.log("📢 Processed announcements:", processedAnnouncements.length);
      console.log(
        "📊 Sample processed announcement:",
        processedAnnouncements[0]
      );

      setAnnouncements(processedAnnouncements);
      setIsLoadingAnnouncements(false);
    } catch (error) {
      console.error("❌ Error fetching announcements:", error);
      setIsLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    const interval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  // File handling
  const handleFileDownload = (file) => {
    try {
      const base64Data = file.data.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error downloading file:", error);
    }
  };

  const handleFileView = (file) => {
    setFileViewModal({ isOpen: true, file });
  };

  const closeFileView = () => {
    setFileViewModal({ isOpen: false, file: null });
  };

  // Announcement handling with COMBINED VIEW TRACKING
  const handleReadMore = async (announcement) => {
    if (currentUser?._id) {
      await trackView(announcement._id, currentUser._id);
    }
    setAnnouncementDetailModal({ isOpen: true, announcement });
  };

  const closeAnnouncementDetail = () => {
    setAnnouncementDetailModal({ isOpen: false, announcement: null });
  };

  // Categorize announcements
  const categorizeAnnouncements = (announcements) => {
    const accounting = [];
    const compliance = [];
    const hr = [];
    const technical = [];

    announcements.forEach((announcement) => {
      const department = getAnnouncementDepartment(
        announcement.postedBy,
        announcement.title
      );

      switch (department) {
        case "Accounting":
          accounting.push(announcement);
          break;
        case "Compliance":
          compliance.push(announcement);
          break;
        case "Technical":
          technical.push(announcement);
          break;
        case "HR & Admin":
          hr.push(announcement);
          break;
        default:
          hr.push(announcement);
      }
    });

    return { accounting, compliance, technical, hr };
  };

  const { accounting, compliance, technical, hr } =
    categorizeAnnouncements(announcements);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading user data...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Modals */}
      <FileViewModal
        isOpen={fileViewModal.isOpen}
        onClose={closeFileView}
        file={fileViewModal.file}
      />
      <AnnouncementDetailModal
        isOpen={announcementDetailModal.isOpen}
        onClose={closeAnnouncementDetail}
        announcement={announcementDetailModal.announcement}
        onTogglePin={handleTogglePin}
        pinnedCount={getPinnedCountByDepartment}
        maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
        onLike={handleLike}
        hasLiked={hasLiked}
        currentUser={currentUser}
      />

      {/* Pin Limit Toast */}
      {showPinLimitToast && (
        <div className="fixed top-4 right-4 z-[10000] bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="font-semibold">Pin Limit Reached</p>
            <p className="text-sm opacity-90">
              You can only pin up to {MAX_PINNED_PER_DEPARTMENT} announcements
              per department.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 p-1 lg:p-1">
        <div className="flex-1 min-w-0">
          <img
            className="w-full h-24 xs:h-28 sm:h-32 md:h-40 lg:h-48 object-cover rounded-xl sm:rounded-2xl shadow-md"
            src={telexcover}
            alt="Dashboard Cover"
          />

          <div className="p-2 sm:p-4 lg:p-6">
            {/* Top Cards Section */}
            <div className="flex flex-col xl:flex-row gap-3 sm:gap-6 mb-4 sm:mb-6">
              <PaydayCard />
              <PunctualityChart />
            </div>

            {/* Announcements Section */}
            <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-3 sm:top-6 right-3 sm:right-6 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-blue-400/15 to-purple-400/10 rounded-full blur-xl sm:blur-2xl animate-pulse"></div>
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-10 sm:w-20 h-10 sm:h-20 bg-gradient-to-r from-green-400/10 to-teal-400/15 rounded-full blur-lg sm:blur-xl animate-bounce"></div>
              </div>

              <div className="relative z-10">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-8 sm:w-12 h-8 sm:h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                        <span className="text-lg sm:text-2xl">📢</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg sm:text-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                          Department Announcements
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium">
                          Latest updates from different departments
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Pin className="w-3 h-3" />
                        Max {MAX_PINNED_PER_DEPARTMENT} per department
                      </span>
                    </div>
                  </div>
                  <div className="w-16 sm:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                </div>

                {isLoadingAnnouncements ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">
                      Loading announcements...
                    </span>
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="space-y-8">
                    <DepartmentAnnouncementSection
                      title="Technical Announcements"
                      announcements={technical}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(technical)}
                      showPinnedOnly={technicalPinned}
                      onTogglePinnedView={() =>
                        setTechnicalPinned(!technicalPinned)
                      }
                      pinnedCount={technical.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUser={currentUser}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />

                    <DepartmentAnnouncementSection
                      title="Compliance Announcements"
                      announcements={compliance}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(compliance)}
                      showPinnedOnly={compliancePinned}
                      onTogglePinnedView={() =>
                        setCompliancePinned(!compliancePinned)
                      }
                      pinnedCount={compliance.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUser={currentUser}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />

                    <DepartmentAnnouncementSection
                      title="Accounting Announcements"
                      announcements={accounting}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(accounting)}
                      showPinnedOnly={accountingPinned}
                      onTogglePinnedView={() =>
                        setAccountingPinned(!accountingPinned)
                      }
                      pinnedCount={accounting.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUser={currentUser}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />

                    <DepartmentAnnouncementSection
                      title="HR & Admin Announcements"
                      announcements={hr}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(hr)}
                      showPinnedOnly={hrPinned}
                      onTogglePinnedView={() => setHrPinned(!hrPinned)}
                      pinnedCount={hr.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUser={currentUser}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">
                      No Announcements
                    </h4>
                    <p className="text-sm text-gray-500">
                      There are no active announcements at the moment.
                    </p>
                  </div>
                )}

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200/60">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="font-medium">Live updates enabled</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Total: {announcements.length} announcements
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Max {MAX_PINNED_PER_DEPARTMENT} pins per department
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar with Daily Records */}
        <div className="w-full lg:w-96 xl:w-96 -mt-1 sm:-mt-3 p-2 sm:p-3 lg:p-2 flex-shrink-0">
          <DailyRecordsCard />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
