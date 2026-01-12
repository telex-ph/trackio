import { useState, useEffect } from "react";
import EmployeeModal from "../../components/modals/EmployeeModal";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Coffee,
  Utensils,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  Bell,
  Pin,
} from "lucide-react";
import AnnouncementDetailModal from "../../components/modals/AnnouncementDetailModal";
import DepartmentAnnouncementSection from "../../components/cards/DepartmentAnnouncementSection";
import { useAnnouncementInteractions } from "../../hooks/useAnnouncementInteractions";
import { getAnnouncementDepartment } from "../../utils/announcementUtils";
import { DateTime } from "luxon";
import api from "../../utils/axios";
import socket from "../../utils/socket";
import FileViewModal from "../../components/modals/FileViewModal";

const getUniqueViewers = (announcement) => {
  if (!announcement.views || !Array.isArray(announcement.views)) return [];

  return announcement.views
    .filter((view) => view && view.userId && view.userId.trim() !== "" && view.viewedAt)
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
};

const getUniqueAcknowledgements = (announcement) => {
  if (!announcement.acknowledgements || !Array.isArray(announcement.acknowledgements))
    return [];

  return announcement.acknowledgements
    .filter((ack) => ack && ack.userId && ack.userId.trim() !== "" && ack.acknowledgedAt)
    .reduce((acc, ack) => {
      if (!acc.find((a) => a.userId === ack.userId)) {
        acc.push({
          userId: ack.userId,
          userName: ack.userName || "Unknown User",
          acknowledgedAt: ack.acknowledgedAt,
          acknowledgedAtFormatted: new Date(ack.acknowledgedAt).toLocaleDateString(),
        });
      }
      return acc;
    }, []);
};

const processAnnouncementData = (announcement) => {
  if (!announcement) return null;

  const uniqueViewers = getUniqueViewers(announcement);
  const uniqueAcknowledgements = getUniqueAcknowledgements(announcement);
  const now = DateTime.local();
  const expiresAt = announcement.expiresAt ? DateTime.fromISO(announcement.expiresAt) : null;
  const isExpired = expiresAt ? expiresAt <= now : false;

  return {
    ...announcement,
    processedViews: uniqueViewers,
    processedAcknowledgements: uniqueAcknowledgements,
    totalViews: uniqueViewers.length,
    totalAcknowledgements: uniqueAcknowledgements.length,
    formattedDateTime: new Date(announcement.dateTime).toLocaleDateString(),
    realTimeFormatted: DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED),
    isExpired,
    expiresAtFormatted: expiresAt ? expiresAt.toLocaleString(DateTime.DATETIME_MED) : null,
  };
};

const getRealTimeAgo = (isoDateStr) => {
  if (!isoDateStr) return "";
  const announcementTime = DateTime.fromISO(isoDateStr);
  if (!announcementTime.isValid) return "";

  const now = DateTime.local();
  const diff = now.diff(announcementTime, ["years", "months", "days", "hours", "minutes", "seconds"]);

  if (diff.years > 0) return `${Math.floor(diff.years)} year${diff.years > 1 ? "s" : ""} ago`;
  if (diff.months > 0) return `${Math.floor(diff.months)} month${diff.months > 1 ? "s" : ""} ago`;
  if (diff.days > 0) return `${Math.floor(diff.days)} day${diff.days > 1 ? "s" : ""} ago`;
  if (diff.hours > 0) return `${Math.floor(diff.hours)} hour${diff.hours > 1 ? "s" : ""} ago`;
  if (diff.minutes > 0) return `${Math.floor(diff.minutes)} minute${diff.minutes > 1 ? "s" : ""} ago`;

  const seconds = Math.floor(diff.seconds);
  return seconds <= 1 ? "just now" : `${seconds} seconds ago`;
};

const AdminDashboard = () => {
  const [isEmployeeClicked, setIsEmployeeClicked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementDetailModal, setAnnouncementDetailModal] = useState({
    isOpen: false,
    announcement: null,
  });
  const [fileViewModal, setFileViewModal] = useState({ isOpen: false, file: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showPinLimitToast, setShowPinLimitToast] = useState(false);
  const [accountingPinned, setAccountingPinned] = useState(false);
  const [compliancePinned, setCompliancePinned] = useState(false);
  const [hrPinned, setHrPinned] = useState(false);
  const [technicalPinned, setTechnicalPinned] = useState(false);
  const [currentRealTime, setCurrentRealTime] = useState(DateTime.local());

  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements_admin";

  const {
    hasLiked,
    trackView,
    handleLike,
    getViewCount,
    getLikeCount,
  } = useAnnouncementInteractions(announcements, setAnnouncements, currentUser?._id);

  useEffect(() => {
    const initializeAdminUser = () => {
      try {
        const storedUser = localStorage.getItem("admin_user");
        if (storedUser) {
          const adminData = JSON.parse(storedUser);
          setCurrentUser({
            _id: adminData._id || "admin_user",
            name: adminData.name || "Administrator",
            employeeId: adminData.employeeId || "admin001",
            department: adminData.department || "Administration",
            role: "admin",
          });
        } else {
          setCurrentUser({
            _id: "admin_user",
            name: "Administrator",
            employeeId: "admin001",
            department: "Administration",
            role: "admin",
          });
        }
      } catch (error) {
        console.error("Error initializing admin user:", error);
        setCurrentUser({
          _id: "admin_user_fallback",
          name: "Administrator",
          employeeId: "admin001",
          department: "Administration",
          role: "admin",
        });
      }
    };
    initializeAdminUser();
  }, []);

  // Time intervals
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    const realTimeInterval = setInterval(() => setCurrentRealTime(DateTime.local()), 1000);

    return () => {
      clearInterval(t);
      clearInterval(realTimeInterval);
    };
  }, []);

  // Real-time expiry & time ago update
  useEffect(() => {
    if (announcements.length === 0) return;

    const updated = announcements.map((ann) => {
      const isExpired = ann.expiresAt
        ? DateTime.fromISO(ann.expiresAt) <= currentRealTime
        : false;

      return {
        ...ann,
        timeAgo: getRealTimeAgo(ann.dateTime),
        realTimeFormatted: DateTime.fromISO(ann.dateTime).toLocaleString(DateTime.DATETIME_MED),
        isExpired,
      };
    });

    const filtered = updated.filter(
      (ann) => !ann.isExpired && ann.status === "Active" && ann.approvalStatus === "Approved"
    );

    setAnnouncements((prev) => {
      const hasChanges =
        prev.length !== filtered.length ||
        prev.some((p, i) => p.timeAgo !== filtered[i]?.timeAgo || p.isExpired !== filtered[i]?.isExpired);
      return hasChanges ? filtered : prev;
    });
  }, [currentRealTime, announcements.length]);

  // Pinning helpers
  const getPinnedAnnouncementsFromStorage = () => {
    try {
      const pinned = localStorage.getItem(PINNED_ANNOUNCEMENTS_KEY);
      return pinned ? JSON.parse(pinned) : {};
    } catch {
      return {};
    }
  };

  const savePinnedAnnouncementToStorage = (id, isPinned) => {
    try {
      const pinned = getPinnedAnnouncementsFromStorage();
      if (isPinned) pinned[id] = true;
      else delete pinned[id];
      localStorage.setItem(PINNED_ANNOUNCEMENTS_KEY, JSON.stringify(pinned));
    } catch (e) {
      console.error("Error saving pinned:", e);
    }
  };

  const removePinnedAnnouncementFromStorage = (id) => {
    try {
      const pinned = getPinnedAnnouncementsFromStorage();
      delete pinned[id];
      localStorage.setItem(PINNED_ANNOUNCEMENTS_KEY, JSON.stringify(pinned));
    } catch (e) {
      console.error("Error removing pinned:", e);
    }
  };

  const getPinnedCountByDepartment = (deptAnns) =>
    deptAnns.filter((a) => a.isPinned).length;

  const canPinMoreInDepartment = (deptAnns) =>
    getPinnedCountByDepartment(deptAnns) < MAX_PINNED_PER_DEPARTMENT;

  const showPinLimitMessage = () => {
    setShowPinLimitToast(true);
    setTimeout(() => setShowPinLimitToast(false), 3000);
  };

  const handleTogglePin = async (announcement) => {
    try {
      const newPinnedStatus = !announcement.isPinned;
      const department = getAnnouncementDepartment(announcement.postedBy, announcement.title);
      const { accounting, compliance, technical, hr } = categorizeAnnouncements(announcements);

      let deptAnns = [];
      switch (department) {
        case "Accounting": deptAnns = accounting; break;
        case "Compliance": deptAnns = compliance; break;
        case "Technical": deptAnns = technical; break;
        case "HR & Admin": deptAnns = hr; break;
        default: deptAnns = hr;
      }

      if (newPinnedStatus && !canPinMoreInDepartment(deptAnns)) {
        showPinLimitMessage();
        return;
      }

      savePinnedAnnouncementToStorage(announcement._id, newPinnedStatus);

      const updatedAnnouncements = announcements.map((a) =>
        a._id === announcement._id ? { ...a, isPinned: newPinnedStatus } : a
      );

      const sorted = updatedAnnouncements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (diff !== 0) return diff;
        return new Date(b.dateTime) - new Date(a.dateTime);
      });

      setAnnouncements(sorted);

      try {
        await api.patch(`/announcements/${announcement._id}`, { isPinned: newPinnedStatus });
      } catch {
        await api.put(`/announcements/${announcement._id}`, { ...announcement, isPinned: newPinnedStatus });
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

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
      console.error("Error downloading file:", error);
    }
  };

  const handleFileView = (file) => setFileViewModal({ isOpen: true, file });
  const closeFileView = () => setFileViewModal({ isOpen: false, file: null });

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await api.get("/announcements");
      const pinned = getPinnedAnnouncementsFromStorage();
      const now = DateTime.local();

      const processed = response.data
        .filter((ann) => {
          if (!ann?._id || ann.status !== "Active" || ann.approvalStatus !== "Approved") return false;
          if (ann.expiresAt && DateTime.fromISO(ann.expiresAt) <= now) return false;
          return true;
        })
        .map((ann) => ({
          ...ann,
          isPinned: pinned[ann._id] || ann.isPinned || false,
          views: Array.isArray(ann.views) ? ann.views : [],
          acknowledgements: Array.isArray(ann.acknowledgements) ? ann.acknowledgements : [],
        }))
        .map(processAnnouncementData)
        .map((ann) => ({
          ...ann,
          timeAgo: getRealTimeAgo(ann.dateTime),
          realTimeFormatted: DateTime.fromISO(ann.dateTime).toLocaleString(DateTime.DATETIME_MED),
        }))
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const pA = { High: 3, Medium: 2, Low: 1 }[a.priority] || 0;
          const pB = { High: 3, Medium: 2, Low: 1 }[b.priority] || 0;
          if (pB !== pA) return pB - pA;
          return new Date(b.dateTime) - new Date(a.dateTime);
        });

      setAnnouncements(processed);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const categorizeAnnouncements = (anns) => {
    const accounting = [], compliance = [], hr = [], technical = [];
    anns.forEach((ann) => {
      const dept = getAnnouncementDepartment(ann.postedBy, ann.title);
      switch (dept) {
        case "Accounting": accounting.push(ann); break;
        case "Compliance": compliance.push(ann); break;
        case "Technical": technical.push(ann); break;
        case "HR & Admin": hr.push(ann); break;
        default: hr.push(ann);
      }
    });
    return { accounting, compliance, technical, hr };
  };

  const { accounting, compliance, technical, hr } = categorizeAnnouncements(announcements);

  const filteredAnnouncements = searchTerm
    ? announcements.filter((ann) =>
        [ann.title, ann.agenda, ann.postedBy, ann.content]
          .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : announcements;

  const getFilteredByDept = (dept) => {
    const map = {
      technical: technical,
      compliance: compliance,
      accounting: accounting,
      hr: hr,
    };
    return filteredAnnouncements.filter((ann) => map[dept]?.some((a) => a._id === ann._id));
  };

  const hasFilteredAnnouncements =
    getFilteredByDept("technical").length > 0 ||
    getFilteredByDept("compliance").length > 0 ||
    getFilteredByDept("accounting").length > 0 ||
    getFilteredByDept("hr").length > 0;

  const handleReadMore = async (announcement) => {
    if (currentUser?._id) await trackView(announcement._id, currentUser._id);
    setAnnouncementDetailModal({ isOpen: true, announcement });
  };

  const closeAnnouncementDetail = () => setAnnouncementDetailModal({ isOpen: false, announcement: null });
  const handleModalOnClose = () => setIsEmployeeClicked(false);

  // Socket listeners
  useEffect(() => {
    if (!currentUser?._id) return;

    console.log("Setting up socket listeners for admin...");

    const handleInitialData = (data) => {
      // same processing as fetchAnnouncements
      const pinned = getPinnedAnnouncementsFromStorage();
      const now = DateTime.local();
      const processed = (Array.isArray(data) ? data : [])
        .filter((ann) => ann?._id && ann.status === "Active" && ann.approvalStatus === "Approved" && !(ann.expiresAt && DateTime.fromISO(ann.expiresAt) <= now))
        .map((ann) => ({
          ...ann,
          isPinned: pinned[ann._id] || ann.isPinned || false,
          views: Array.isArray(ann.views) ? ann.views : [],
          acknowledgements: Array.isArray(ann.acknowledgements) ? ann.acknowledgements : [],
        }))
        .map(processAnnouncementData)
        .map((ann) => ({
          ...ann,
          timeAgo: getRealTimeAgo(ann.dateTime),
          realTimeFormatted: DateTime.fromISO(ann.dateTime).toLocaleString(DateTime.DATETIME_MED),
        }))
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const pA = { High: 3, Medium: 2, Low: 1 }[a.priority] || 0;
          const pB = { High: 3, Medium: 2, Low: 1 }[b.priority] || 0;
          if (pB !== pA) return pB - pA;
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
      setAnnouncements(processed);
      setIsLoadingAnnouncements(false);
    };

    const handleUnifiedAnnouncement = (ann, source) => {
      const now = DateTime.local();
      if (ann.status !== "Active" || ann.approvalStatus !== "Approved") return;
      if (ann.expiresAt && DateTime.fromISO(ann.expiresAt) <= now) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== ann._id));
        removePinnedAnnouncementFromStorage(ann._id);
        return;
      }

      const processed = processAnnouncementData({
        ...ann,
        isPinned: getPinnedAnnouncementsFromStorage()[ann._id] || false,
        views: Array.isArray(ann.views) ? ann.views : [],
        acknowledgements: Array.isArray(ann.acknowledgements) ? ann.acknowledgements : [],
      });

      if (!processed) return;

      const withTime = {
        ...processed,
        timeAgo: getRealTimeAgo(processed.dateTime),
        realTimeFormatted: DateTime.fromISO(processed.dateTime).toLocaleString(DateTime.DATETIME_MED),
      };

      setAnnouncements((prev) => {
        const filtered = prev.filter((a) => a._id !== withTime._id);
        const updated = [withTime, ...filtered];
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const pA = { High: 3, Medium: 2, Low: 1 }[a.priority] || 0;
          const pB = { High: 3, Medium: 2, Low: 1 }[b.priority] || 0;
          if (pB !== pA) return pB - pA;
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
      });
    };

    const handleAnnouncementCancelled = (data) => {
      const id = data?.announcementId || data?._id;
      if (id) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
        removePinnedAnnouncementFromStorage(id);
      }
    };

    socket.on("initialAgentData", handleInitialData);
    socket.on("newAnnouncement", (ann) => handleUnifiedAnnouncement(ann, "NEW"));
    socket.on("announcementReposted", (ann) => handleUnifiedAnnouncement(ann, "REPOST"));
    socket.on("announcementUpdated", (ann) => handleUnifiedAnnouncement(ann, "UPDATE"));
    socket.on("announcementCancelled", handleAnnouncementCancelled);
    socket.on("announcementCanceled", handleAnnouncementCancelled);
    socket.on("cancelledAnnouncement", handleAnnouncementCancelled);
    socket.on("announcementDeleted", handleAnnouncementCancelled);

    socket.emit("getAgentData");

    const timeout = setTimeout(() => {
      if (isLoadingAnnouncements) fetchAnnouncements();
    }, 3000);

    return () => {
      clearTimeout(timeout);
      socket.off("initialAgentData", handleInitialData);
      socket.off("newAnnouncement");
      socket.off("announcementReposted");
      socket.off("announcementUpdated");
      socket.off("announcementCancelled");
      socket.off("announcementCanceled");
      socket.off("cancelledAnnouncement");
      socket.off("announcementDeleted");
    };
  }, [currentUser?._id]);

  const stats = [
    { key: "totalEmployees", title: "Total Employees", subTitle: "Company-wide", icon: <Users className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-slate-600 bg-slate-100 border-slate-400 border" /> },
    { key: "present", title: "Present", subTitle: "Currently Working", icon: <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-emerald-600 bg-emerald-100 border-emerald-400 border" /> },
    { key: "absent", title: "Absentees", subTitle: "Not Present", icon: <UserX className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-red-500 bg-red-100 border-red-400 border" /> },
    { key: "late", title: "Late Arrivals", subTitle: "Late Today", icon: <Clock className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-amber-600 bg-amber-100 border-amber-400 border" /> },
    { key: "onBreak", title: "On Break", subTitle: "Currently", icon: <Coffee className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-blue-600 bg-blue-100 border-blue-400 border" /> },
    { key: "onLunch", title: "On Lunch", subTitle: "Lunch Break", icon: <Utensils className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-orange-600 bg-orange-100 border-orange-400 border" /> },
    { key: "overtime", title: "Overtime", subTitle: "Extra Hours", icon: <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-violet-600 bg-violet-100 border-violet-400 border" /> },
    { key: "undertime", title: "Undertime", subTitle: "Short Hours", icon: <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-pink-600 bg-pink-100 border-pink-400 border" /> },
  ];

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-gray-600 text-lg">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      {showPinLimitToast && (
        <div className="fixed top-4 left-2 right-2 sm:left-4 sm:right-auto z-[10000] bg-yellow-500 text-white p-3 sm:p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-sm mx-auto sm:mx-0">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Pin Limit Reached</p>
            <p className="text-xs opacity-90">Max {MAX_PINNED_PER_DEPARTMENT} pins per department</p>
          </div>
        </div>
      )}

      <FileViewModal isOpen={fileViewModal.isOpen} onClose={closeFileView} file={fileViewModal.file} />
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

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Monitoring Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time attendance and work hours monitoring</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-sm text-gray-500">
              Last updated: {currentTime.toLocaleTimeString()} | Today: {currentTime.toLocaleDateString()}
            </p>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Real-time updates
            </span>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          <span>{currentUser.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 h-80">
        <div className="relative md:col-span-2 overflow-hidden rounded-2xl shadow-xl group">
          <img src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=2069&auto=format&fit=crop" alt="call center" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 opacity-60 mix-blend-multiply"></div>
        </div>
        <div className="relative hidden md:block overflow-hidden rounded-2xl shadow-xl group">
          <img src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=2071&auto=format&fit=crop" alt="team" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 opacity-65 mix-blend-multiply"></div>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">Employee Performance Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => {
          const isTotal = stat.key === "totalEmployees";
          const cardStyle = isTotal ? "bg-[#800000] border-none shadow-[#800000]/30" : "border-[#800000]/10 shadow-gray-200/50";
          const titleColor = isTotal ? "text-white" : "text-gray-900";
          const subTitleColor = isTotal ? "text-red-200" : "text-[#800000]";
          const valueColor = isTotal ? "text-white" : "text-gray-900";
          const iconStyle = isTotal ? "bg-white/20 text-white" : "bg-gradient-to-br from-[#800000] to-[#5a0000] text-white shadow-red-900/40";
          const footerStyle = isTotal ? "bg-white/10 text-white border-white/20" : "bg-white/60 text-[#800000] border-[#800000]/20";
          const pulseWave = isTotal ? "bg-red-400" : "bg-[#800000]";

          return (
            <div key={stat.key} className={`relative ${cardStyle} rounded-3xl p-0 shadow-xl overflow-hidden transition-all duration-700 group hover:shadow-2xl hover:scale-[1.02] border`}>
              <div className="p-5 relative z-10">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 z-0 transform scale-0 transition duration-700 ease-out origin-top-right group-hover:scale-[6] group-hover:opacity-0 ${pulseWave}`}></div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col min-w-0 flex-1 pr-4">
                    <p className={`text-xs font-bold ${subTitleColor} uppercase tracking-widest opacity-80`}>{stat.subTitle}</p>
                    <p className={`text-xl font-black ${titleColor} truncate mt-0.5`}>{stat.title}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconStyle} shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="py-2">
                  <span className={`text-6xl font-black ${valueColor} leading-none tracking-tighter`}>--</span>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className={`text-[10px] font-bold px-3 py-1 ${footerStyle} rounded-lg backdrop-blur-md shadow-sm border uppercase tracking-tighter`}>Live Update</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight mt-12">Real-Time Analytics & Trends</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {["Attendance Trend", "Employee Metrics", "Activity Monitor"].map((title) => (
          <div key={title} className="w-full h-64 bg-white rounded-xl shadow-2xl border border-gray-100 transition-all duration-300 hover:scale-[1.02] flex flex-col mt-8">
            <div className="bg-red-900 p-4 rounded-xl shadow-lg flex justify-between items-start flex-shrink-0 mx-4 mt-[-20px]">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">{title}</h3>
              <span className="text-xs font-semibold px-3 py-1 bg-white/20 text-white rounded-full">COMING SOON</span>
            </div>
            <div className="flex-grow p-6 pt-8 flex flex-col justify-between">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-md bg-red-100 border border-red-200">
                  <svg className="w-6 h-6 text-red-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-gray-700">{title}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm font-medium text-gray-500 uppercase">Current Development Stage</p>
                <p className="text-lg font-extrabold text-gray-900">In Progress</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Department Announcements</h3>
              <p className="text-gray-600">Latest updates from different departments - Real-time</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                <Pin className="w-4 h-4" />
                Max {MAX_PINNED_PER_DEPARTMENT} pins
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </span>
            </div>
          </div>

          <div className="mt-4 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoadingAnnouncements ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <span className="text-gray-600">Loading announcements...</span>
          </div>
        ) : hasFilteredAnnouncements ? (
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
            {["technical", "hr", "compliance", "accounting"].map((dept) => {
              const anns = getFilteredByDept(dept);
              if (anns.length === 0) return null;
              const titleMap = {
                technical: "Technical Announcements",
                hr: "HR & Admin Announcements",
                compliance: "Compliance Announcements",
                accounting: "Accounting Announcements",
              };
              const deptAnns = dept === "technical" ? technical : dept === "hr" ? hr : dept === "compliance" ? compliance : accounting;
              const pinnedState = dept === "technical" ? technicalPinned : dept === "hr" ? hrPinned : dept === "compliance" ? compliancePinned : accountingPinned;
              const setPinnedState = dept === "technical" ? setTechnicalPinned : dept === "hr" ? setHrPinned : dept === "compliance" ? setCompliancePinned : setAccountingPinned;

              return (
                <div key={dept} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <DepartmentAnnouncementSection
                    title={titleMap[dept]}
                    announcements={anns}
                    onReadMore={handleReadMore}
                    onFileDownload={handleFileDownload}
                    onFileView={handleFileView}
                    onTogglePin={handleTogglePin}
                    canPinMore={canPinMoreInDepartment(deptAnns)}
                    showPinnedOnly={pinnedState}
                    onTogglePinnedView={() => setPinnedState(!pinnedState)}
                    pinnedCount={anns.filter((a) => a.isPinned).length}
                    maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    onLike={handleLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id}
                    getViewCount={getViewCount}
                    getLikeCount={getLikeCount}
                    compactView={true}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              {searchTerm ? "No Matching Announcements" : "No Announcements Found"}
            </h4>
            <p className="text-gray-500">
              {searchTerm ? "Try different keywords." : "There are no active announcements at the moment."}
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Real-time updates enabled</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              Total: {filteredAnnouncements.length}
            </span>
          </div>
          <div>Max {MAX_PINNED_PER_DEPARTMENT} pins per department</div>
        </div>
      </div>

      {isEmployeeClicked && <EmployeeModal onClose={handleModalOnClose} />}
    </div>
  );
};

export default AdminDashboard;
