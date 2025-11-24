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
  Search,
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

// ==================== SINGLE ANNOUNCEMENT CARD COMPONENT ====================
const AnnouncementCard = ({ 
  announcement, 
  onReadMore, 
  onFileDownload, 
  onFileView, 
  onTogglePin, 
  onLike,
  hasLiked,
  currentUserId,
  getViewCount,
  getLikeCount 
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 mb-4 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {announcement.isPinned && (
                <Pin className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                announcement.priority === 'High' 
                  ? 'bg-red-100 text-red-800' 
                  : announcement.priority === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {announcement.priority || 'Normal'}
              </span>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 line-clamp-2">
              {announcement.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {announcement.agenda}
            </p>
          </div>
          <button
            onClick={() => onTogglePin(announcement)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              announcement.isPinned
                ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Pin className={`w-5 h-5 ${announcement.isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="font-medium">{announcement.postedBy}</span>
          <span>{announcement.formattedDateTime}</span>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{getViewCount(announcement._id)}</span>
            </div>
            <button
              onClick={() => onLike(announcement._id)}
              className={`flex items-center gap-1 transition-colors ${
                hasLiked(announcement._id) 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <svg className="w-4 h-4" fill={hasLiked(announcement._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{getLikeCount(announcement._id)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files */}
      {announcement.files && announcement.files.length > 0 && (
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="space-y-2">
            {announcement.files.map((file, index) => (
              <FileAttachment
                key={index}
                file={file}
                onDownload={onFileDownload}
                onView={onFileView}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 sm:p-6">
        <button
          onClick={() => onReadMore(announcement)}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors text-center block"
        >
          Read More
        </button>
      </div>
    </div>
  );
};

// ==================== DEPARTMENT SECTION COMPONENT ====================
const DepartmentSection = ({ 
  title, 
  announcements, 
  onReadMore, 
  onFileDownload, 
  onFileView, 
  onTogglePin, 
  onLike,
  hasLiked,
  currentUserId,
  getViewCount,
  getLikeCount,
  showPinnedOnly,
  onTogglePinnedView,
  pinnedCount,
  maxPinnedLimit
}) => {
  if (!announcements || announcements.length === 0) return null;

  const displayAnnouncements = showPinnedOnly 
    ? announcements.filter(a => a.isPinned)
    : announcements;

  if (displayAnnouncements.length === 0) return null;

  return (
    <div className="department-section mb-8 last:mb-0">
      {/* Department Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl sm:text-2xl text-gray-900">{title}</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {displayAnnouncements.length}
          </span>
          {pinnedCount > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
              <Pin className="w-4 h-4" />
              {pinnedCount}/{maxPinnedLimit}
            </span>
          )}
        </div>
        
        {announcements.some(a => a.isPinned) && (
          <button
            onClick={onTogglePinnedView}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              showPinnedOnly
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showPinnedOnly ? 'Show All' : `Show Pinned (${pinnedCount})`}
          </button>
        )}
      </div>

      {/* Announcements List - ONE PER ROW */}
      <div className="space-y-4">
        {displayAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement._id}
            announcement={announcement}
            onReadMore={onReadMore}
            onFileDownload={onFileDownload}
            onFileView={onFileView}
            onTogglePin={onTogglePin}
            onLike={onLike}
            hasLiked={hasLiked}
            currentUserId={currentUserId}
            getViewCount={getViewCount}
            getLikeCount={getLikeCount}
          />
        ))}
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
  const [searchTerm, setSearchTerm] = useState("");

  const [accountingPinned, setAccountingPinned] = useState(false);
  const [compliancePinned, setCompliancePinned] = useState(false);
  const [hrPinned, setHrPinned] = useState(false);
  const [technicalPinned, setTechnicalPinned] = useState(false);

  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements";

  const { hasLiked, trackView, handleLike, getViewCount, getLikeCount } =
    useAnnouncementInteractions(announcements, setAnnouncements);

  // User initialization (same as before)
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

  // Pinning functionality (same as before)
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

  // File handling (same as before)
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

  // Announcement handling
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

  // Search functionality
  const getFilteredAnnouncements = () => {
    if (!searchTerm) return announcements;

    return announcements.filter(announcement => 
      announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.postedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  const getFilteredAnnouncementsByDepartment = (department) => {
    const { accounting: filteredAccounting, compliance: filteredCompliance, technical: filteredTechnical, hr: filteredHr } = 
      categorizeAnnouncements(filteredAnnouncements);

    switch (department) {
      case "technical":
        return filteredTechnical;
      case "compliance":
        return filteredCompliance;
      case "accounting":
        return filteredAccounting;
      case "hr":
        return filteredHr;
      default:
        return [];
    }
  };

  const hasFilteredAnnouncements = 
    getFilteredAnnouncementsByDepartment("technical").length > 0 ||
    getFilteredAnnouncementsByDepartment("compliance").length > 0 ||
    getFilteredAnnouncementsByDepartment("accounting").length > 0 ||
    getFilteredAnnouncementsByDepartment("hr").length > 0;

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-gray-600 text-lg">Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
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

      {/* Pin Limit Toast */}
      {showPinLimitToast && (
        <div className="fixed top-4 left-2 right-2 sm:left-4 sm:right-auto z-[10000] bg-yellow-500 text-white p-3 sm:p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-sm mx-auto sm:mx-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base">Pin Limit Reached</p>
            <p className="text-xs sm:text-sm opacity-90">
              Max {MAX_PINNED_PER_DEPARTMENT} pins per department
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 min-h-screen ${isMobileMenuOpen ? 'lg:flex-row' : ''}`}>
        
        {/* Left Column - Main Content */}
        <div className="flex-1 min-w-0 order-1 lg:order-1 space-y-4 sm:space-y-6 overflow-hidden">
          
          {/* Cover Image */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
            <img
              className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-44 xl:h-52 2xl:h-60 object-cover"
              src={telexcover}
              alt="Dashboard Cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
              <div className="text-white p-4 sm:p-6 lg:p-8">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">
                  Welcome back, {currentUser.name}!
                </h1>
                <p className="text-sm sm:text-base lg:text-lg opacity-90">
                  Stay updated with the latest announcements
                </p>
              </div>
            </div>
          </div>

          {/* Top Cards Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="min-w-0">
              <PaydayCard />
            </div>
            <div className="min-w-0">
              <PunctualityChart />
            </div>
          </div>

          {/* Announcements Section */}
          <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm">
            <div className="relative z-10">
              {/* Header Section */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                      <span className="text-xl sm:text-2xl">📢</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                        Department Announcements
                      </h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        Latest updates from different departments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <Pin className="w-4 h-4" />
                      Max {MAX_PINNED_PER_DEPARTMENT}
                    </span>
                  </div>
                </div>

                {/* Search Section */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search all announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoadingAnnouncements ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <span className="text-lg text-gray-600">Loading announcements...</span>
                </div>
              ) : hasFilteredAnnouncements ? (
                <div className="space-y-8">
                  {/* TECHNICAL */}
                  {getFilteredAnnouncementsByDepartment("technical").length > 0 && (
                    <DepartmentSection
                      title="Technical Announcements"
                      announcements={getFilteredAnnouncementsByDepartment("technical")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                      showPinnedOnly={technicalPinned}
                      onTogglePinnedView={() => setTechnicalPinned(!technicalPinned)}
                      pinnedCount={getFilteredAnnouncementsByDepartment("technical").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    />
                  )}

                  {/* COMPLIANCE */}
                  {getFilteredAnnouncementsByDepartment("compliance").length > 0 && (
                    <DepartmentSection
                      title="Compliance Announcements"
                      announcements={getFilteredAnnouncementsByDepartment("compliance")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                      showPinnedOnly={compliancePinned}
                      onTogglePinnedView={() => setCompliancePinned(!compliancePinned)}
                      pinnedCount={getFilteredAnnouncementsByDepartment("compliance").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    />
                  )}

                  {/* ACCOUNTING */}
                  {getFilteredAnnouncementsByDepartment("accounting").length > 0 && (
                    <DepartmentSection
                      title="Accounting Announcements"
                      announcements={getFilteredAnnouncementsByDepartment("accounting")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                      showPinnedOnly={accountingPinned}
                      onTogglePinnedView={() => setAccountingPinned(!accountingPinned)}
                      pinnedCount={getFilteredAnnouncementsByDepartment("accounting").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    />
                  )}

                  {/* HR & ADMIN */}
                  {getFilteredAnnouncementsByDepartment("hr").length > 0 && (
                    <DepartmentSection
                      title="HR & Admin Announcements"
                      announcements={getFilteredAnnouncementsByDepartment("hr")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id}
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                      showPinnedOnly={hrPinned}
                      onTogglePinnedView={() => setHrPinned(!hrPinned)}
                      pinnedCount={getFilteredAnnouncementsByDepartment("hr").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-600 mb-3">
                    {searchTerm ? "No Matching Announcements" : "No Announcements Found"}
                  </h4>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm
                      ? "No announcements match your search criteria. Try different keywords."
                      : "There are no active announcements at the moment."
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Daily Records Card */}
        <div className={`w-full lg:w-80 xl:w-96 2xl:w-[28rem] p-3 lg:p-4 flex-shrink-0 order-2 lg:order-2 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-4">
            <DailyRecordsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;