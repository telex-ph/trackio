import React, { useState, useEffect } from "react";
import {
  Bell,
  Download,
  Paperclip,
  FileText,
  Eye,
  Pin,
  Menu,
  X,
} from "lucide-react";
import telexcover from "../../assets/background/telex-cover.jpg";
import api from "../../utils/axios";

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

  const uniqueViewers = announcement.views
    .filter(
      (view) =>
        view && view.userId && view.userId.trim() !== "" && view.viewedAt
    )
    .reduce((acc, view) => {
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

// ==================== RESPONSIVE FILE ATTACHMENT COMPONENT ====================
const FileAttachment = ({ file, onDownload, onView }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />;
      default:
        return <Paperclip className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />;
    }
  };

  const canPreview = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["pdf", "jpg", "jpeg", "png", "gif", "txt"].includes(extension);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg mt-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(file.name)}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-700 truncate block">
            {file.name}
          </span>
        </div>
      </div>
      <div className="flex gap-1 ml-2 flex-shrink-0">
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [accountingPinned, setAccountingPinned] = useState(false);
  const [compliancePinned, setCompliancePinned] = useState(false);
  const [hrPinned, setHrPinned] = useState(false);
  const [technicalPinned, setTechnicalPinned] = useState(false);

  // NEW: Separate pin limits per department
  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements";

  const { hasLiked, trackView, handleLike, getViewCount, getLikeCount } =
    useAnnouncementInteractions(announcements, setAnnouncements);

  // ✅ FIXED USER INITIALIZATION
  useEffect(() => {
    const initializeUserData = () => {
      try {
        const { user: zustandUser } = useStore.getState();
        
        if (zustandUser?._id) {
          setCurrentUser({
            _id: zustandUser._id,
            name: `${zustandUser.firstName} ${zustandUser.lastName}`.trim(),
            employeeId: zustandUser.employeeId,
            department: zustandUser.department,
          });
          return;
        }

        const userId = getPersistentUserId();
        const userName = getPersistentUserName();
        const employeeId = getPersistentUserEmployeeId();
        const department = getPersistentUserDepartment();

        const effectiveUserId = employeeId || userId;

        if (!effectiveUserId) {
          setCurrentUser({
            _id: "temp_user_" + Date.now(),
            name: "Test User",
            employeeId: "test_employee",
            department: "Technical",
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
          _id: "fallback_user_" + Math.random().toString(36).substr(2, 9),
          name: "Fallback User",
          employeeId: "fallback_emp",
          department: "Technical",
        });
      }
    };

    initializeUserData();
  }, []);

  // Pinning functionality
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

  const getPinnedCountByDepartment = (departmentAnnouncements) => {
    return departmentAnnouncements.filter((a) => a.isPinned).length;
  };

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

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await api.get("/announcements");

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();

      const processedAnnouncements = response.data
        .filter((ann) => ann && ann._id)
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
        .map(processAnnouncementData)
        .filter((ann) => ann.status === "Active")
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

      setAnnouncements(processedAnnouncements);
      setIsLoadingAnnouncements(false);
    } catch (error) {
      console.error("❌ Error fetching announcements:", error);
      setIsLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

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

      {/* Pin Limit Toast - RESPONSIVE */}
      {showPinLimitToast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[10000] bg-yellow-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-right duration-300 max-w-md mx-auto sm:mx-0">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">Pin Limit Reached</p>
            <p className="text-xs sm:text-sm opacity-90 truncate">
              Max {MAX_PINNED_PER_DEPARTMENT} pins per department
            </p>
          </div>
        </div>
      )}

      {/* Main Content - RESPONSIVE LAYOUT */}
      <div className={`flex flex-col lg:flex-row gap-2 sm:gap-4 p-1 lg:p-1 ${isMobileMenuOpen ? 'lg:flex-row' : ''}`}>
        {/* Left Column - Main Content */}
        <div className="flex-1 min-w-0 order-1 lg:order-1">
          {/* Cover Image - RESPONSIVE */}
          <div className="relative">
            <img
              className="w-full h-20 xs:h-24 sm:h-28 md:h-32 lg:h-40 xl:h-48 object-cover rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm sm:shadow-md"
              src={telexcover}
              alt="Dashboard Cover"
            />
          </div>

          <div className="p-2 sm:p-4 lg:p-6">
            {/* Top Cards Section - RESPONSIVE */}
            <div className="flex flex-col xl:flex-row gap-2 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <PaydayCard />
              </div>
              <div className="flex-1 min-w-0">
                <PunctualityChart />
              </div>
            </div>

            {/* Announcements Section - RESPONSIVE */}
            <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-lg sm:shadow-xl lg:shadow-2xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-2 sm:top-4 lg:top-6 right-2 sm:right-4 lg:right-6 w-8 sm:w-12 lg:w-16 xl:w-24 h-8 sm:h-12 lg:h-16 xl:h-24 bg-gradient-to-r from-blue-400/15 to-purple-400/10 rounded-full blur-lg sm:blur-xl lg:blur-2xl animate-pulse"></div>
                <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-2 sm:left-4 lg:left-8 w-6 sm:w-8 lg:w-12 xl:w-20 h-6 sm:h-8 lg:h-12 xl:h-20 bg-gradient-to-r from-green-400/10 to-teal-400/15 rounded-full blur-md sm:blur-lg lg:blur-xl animate-bounce"></div>
              </div>

              <div className="relative z-10">
                {/* Header Section - RESPONSIVE */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-md">
                        <span className="text-sm sm:text-base lg:text-lg xl:text-xl">📢</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg lg:text-xl xl:text-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent leading-tight">
                          Department Announcements
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                          Latest updates from different departments
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                        <Pin className="w-3 h-3" />
                        Max {MAX_PINNED_PER_DEPARTMENT}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 sm:w-16 lg:w-20 xl:w-32 h-0.5 sm:h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-md"></div>
                </div>

                {/* Loading State - RESPONSIVE */}
                {isLoadingAnnouncements ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm sm:text-base text-gray-600">
                      Loading announcements...
                    </span>
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                    {/* TECHNICAL */}
                    <DepartmentAnnouncementSection
                      title="Technical Announcements"
                      announcements={technical}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(technical)}
                      showPinnedOnly={technicalPinned}
                      onTogglePinnedView={() => setTechnicalPinned(!technicalPinned)}
                      pinnedCount={technical.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />

                    {/* COMPLIANCE */}
                    <DepartmentAnnouncementSection
                      title="Compliance Announcements"
                      announcements={compliance}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(compliance)}
                      showPinnedOnly={compliancePinned}
                      onTogglePinnedView={() => setCompliancePinned(!compliancePinned)}
                      pinnedCount={compliance.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />

                    {/* ACCOUNTING */}
                    <DepartmentAnnouncementSection
                      title="Accounting Announcements"
                      announcements={accounting}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(accounting)}
                      showPinnedOnly={accountingPinned}
                      onTogglePinnedView={() => setAccountingPinned(!accountingPinned)}
                      pinnedCount={accounting.filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />

                    {/* HR & ADMIN */}
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
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
                      No Announcements
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                      There are no active announcements at the moment.
                    </p>
                  </div>
                )}

                {/* Footer Section - RESPONSIVE */}
                <div className="mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200/60">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="font-medium">Live updates enabled</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                        Total: {announcements.length}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      Max {MAX_PINNED_PER_DEPARTMENT} pins per department
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Daily Records Card - RESPONSIVE */}
        <div className={`w-full lg:w-80 xl:w-96 p-2 sm:p-3 lg:p-2 flex-shrink-0 order-2 lg:order-2 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <DailyRecordsCard />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;