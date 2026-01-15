import React, { useState, useEffect, useCallback } from "react";
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
  Shield,
  CheckCircle,
  User,
  Calendar,
  Clock,
  Heart,
} from "lucide-react";
import telexcover from "../../assets/background/telex-cover.jpg";
import api from "../../utils/axios";
import socket from "../../utils/socket";

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

import { DateTime } from "luxon";

import Roles from "../../constants/roles";

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
    realTimeFormatted: DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED),
    timeAgo: "",
  };
};

const getRealTimeAgo = (isoDateStr) => {
  if (!isoDateStr) return "";
  const announcementTime = DateTime.fromISO(isoDateStr);
  if (!announcementTime.isValid) return "";
 
  const now = DateTime.local();
  const diff = now.diff(announcementTime, ["years", "months", "days", "hours", "minutes", "seconds"]);

  if (diff.years > 0) return `${Math.floor(diff.years)} year${Math.floor(diff.years) > 1 ? "s" : ""} ago`;
  if (diff.months > 0) return `${Math.floor(diff.months)} month${Math.floor(diff.months) > 1 ? "s" : ""} ago`;
  if (diff.days > 0) return `${Math.floor(diff.days)} day${Math.floor(diff.days) > 1 ? "s" : ""} ago`;
  if (diff.hours > 0) return `${Math.floor(diff.hours)} hour${Math.floor(diff.hours) > 1 ? "s" : ""} ago`;
  if (diff.minutes > 0) return `${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) > 1 ? "s" : ""} ago`;
 
  const seconds = Math.floor(diff.seconds);
  return seconds <= 1 ? "just now" : `${seconds} seconds ago`;
};

const CAROUSEL_PLACEHOLDERS = [
    {
        id: 1,
        image: telexcover,
        title: "Welcome to Telex",
        subtitle: "Building the future together",
        color: "from-blue-500 to-indigo-600"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        title: "Global Collaboration",
        subtitle: "Connect with teams worldwide",
        color: "from-purple-500 to-pink-600"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        title: "Modern Workplace",
        subtitle: "Efficiency at its finest",
        color: "from-teal-500 to-green-600"
    },
];

const HeaderCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                (prevIndex + 1) % CAROUSEL_PLACEHOLDERS.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    const currentSlide = CAROUSEL_PLACEHOLDERS[currentIndex];

    return (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg group">
            <div
                key={currentIndex}
                className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-44 xl:h-52 2xl:h-60"
            >
                <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                />
            </div>
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {CAROUSEL_PLACEHOLDERS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
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
  const [searchTerm, setSearchTerm] = useState("");

  const [currentTime, setCurrentTime] = useState(DateTime.local());

  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements";

  const { hasLiked, trackView, handleLike, getViewCount, getLikeCount } =
    useAnnouncementInteractions(announcements, setAnnouncements);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.local());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (!socket) {
      fetchAnnouncements();
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    let dataLoaded = false;

    const handleInitialData = (socketAnnouncements) => {
      if (Array.isArray(socketAnnouncements) && socketAnnouncements.length > 0) {
        const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
       
        const processedAnnouncements = socketAnnouncements
          .filter((ann) => ann && ann._id && ann.status === "Active")
          .map((announcement) => ({
            ...announcement,
            isPinned: pinnedAnnouncements[announcement._id] || announcement.isPinned || false,
            views: Array.isArray(announcement.views) ? announcement.views : [],
            acknowledgements: Array.isArray(announcement.acknowledgements)
              ? announcement.acknowledgements
              : [],
          }))
          .map(processAnnouncementData)
          .map(announcement => ({
            ...announcement,
            timeAgo: getRealTimeAgo(announcement.dateTime),
            realTimeFormatted: DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED)
          }))
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
        dataLoaded = true;
      }
    };

    const handleAgentUpdate = (updateData) => {
      setAnnouncements(prev => prev.map(ann => {
        if (ann._id === updateData.announcementId) {
          return {
            ...ann,
            totalViews: updateData.views,
            totalAcknowledgements: updateData.likes,
            timeAgo: ann.timeAgo || getRealTimeAgo(ann.dateTime),
            realTimeFormatted: ann.realTimeFormatted || DateTime.fromISO(ann.dateTime).toLocaleString(DateTime.DATETIME_MED)
          };
        }
        return ann;
      }));
    };

    const handleUnifiedAnnouncement = (announcementData) => {
      if (announcementData.status !== "Active") return;

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      const processedAnnouncement = processAnnouncementData({
        ...announcementData,
        isPinned: pinnedAnnouncements[announcementData._id] || false,
        views: Array.isArray(announcementData.views) ? announcementData.views : [],
        acknowledgements: Array.isArray(announcementData.acknowledgements)
          ? announcementData.acknowledgements
          : [],
      });

      if (!processedAnnouncement) return;

      const announcementWithRealTime = {
        ...processedAnnouncement,
        timeAgo: getRealTimeAgo(processedAnnouncement.dateTime),
        realTimeFormatted: DateTime.fromISO(processedAnnouncement.dateTime).toLocaleString(DateTime.DATETIME_MED)
      };

      setAnnouncements(prev => {
        const filtered = prev.filter(a => a._id !== announcementWithRealTime._id);
        const updated = [announcementWithRealTime, ...filtered];
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;

          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;

          if (priorityB !== priorityA) return priorityB - priorityA;
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
      });
    };

    const handleNewAnnouncement = (newAnnouncement) => handleUnifiedAnnouncement(newAnnouncement);
    const handleAnnouncementReposted = (repostedAnnouncement) => handleUnifiedAnnouncement(repostedAnnouncement);

    const handleAnnouncementCancelled = (data) => {
      const announcementId = data?.announcementId || data?._id || data?.id;
      if (!announcementId) return;
      setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
      removePinnedAnnouncementFromStorage(announcementId);
    };

    const handleAnnouncementUpdated = (updatedAnnouncement) => {
      if (updatedAnnouncement.status !== "Active") {
        setAnnouncements(prev => prev.filter(ann => ann._id !== updatedAnnouncement._id));
        removePinnedAnnouncementFromStorage(updatedAnnouncement._id);
        return;
      }

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      const processedAnnouncement = processAnnouncementData({
        ...updatedAnnouncement,
        isPinned: pinnedAnnouncements[updatedAnnouncement._id] || false,
        views: Array.isArray(updatedAnnouncement.views) ? updatedAnnouncement.views : [],
        acknowledgements: Array.isArray(updatedAnnouncement.acknowledgements)
          ? updatedAnnouncement.acknowledgements
          : [],
      });

      if (!processedAnnouncement) return;

      const announcementWithRealTime = {
        ...processedAnnouncement,
        timeAgo: getRealTimeAgo(processedAnnouncement.dateTime),
        realTimeFormatted: DateTime.fromISO(processedAnnouncement.dateTime).toLocaleString(DateTime.DATETIME_MED)
      };

      setAnnouncements(prev => {
        const filtered = prev.filter(a => a._id !== announcementWithRealTime._id);
        const updated = [announcementWithRealTime, ...filtered];
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;

          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          const priorityA = priorityOrder[a.priority] || 0;
          const priorityB = priorityOrder[b.priority] || 0;

          if (priorityB !== priorityA) return priorityB - priorityA;
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
      });
    };

    socket.on("initialAgentData", handleInitialData);
    socket.on("agentAnnouncementUpdate", handleAgentUpdate);
    socket.on("newAnnouncement", handleNewAnnouncement);
    socket.on("announcementCancelled", handleAnnouncementCancelled);
    socket.on("announcementReposted", handleAnnouncementReposted);
    socket.on("announcementUpdated", handleAnnouncementUpdated);

    socket.emit("getAgentData");

    const fallbackTimeout = setTimeout(() => {
      if (!dataLoaded) fetchAnnouncements();
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      socket.off("initialAgentData", handleInitialData);
      socket.off("agentAnnouncementUpdate", handleAgentUpdate);
      socket.off("newAnnouncement", handleNewAnnouncement);
      socket.off("announcementCancelled", handleAnnouncementCancelled);
      socket.off("announcementReposted", handleAnnouncementReposted);
      socket.off("announcementUpdated", handleAnnouncementUpdated);
    };
  }, []);

  const getPinnedAnnouncementsFromStorage = () => {
    try {
      const pinned = localStorage.getItem(PINNED_ANNOUNCEMENTS_KEY);
      return pinned ? JSON.parse(pinned) : {};
    } catch (error) {
      return {};
    }
  };

  const removePinnedAnnouncementFromStorage = (announcementId) => {
    try {
      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      if (pinnedAnnouncements[announcementId]) {
        delete pinnedAnnouncements[announcementId];
        localStorage.setItem(PINNED_ANNOUNCEMENTS_KEY, JSON.stringify(pinnedAnnouncements));
      }
    } catch (error) {}
  };

  const savePinnedAnnouncementToStorage = (announcementId, isPinned) => {
    try {
      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      if (isPinned) pinnedAnnouncements[announcementId] = true;
      else delete pinnedAnnouncements[announcementId];
      localStorage.setItem(PINNED_ANNOUNCEMENTS_KEY, JSON.stringify(pinnedAnnouncements));
    } catch (error) {}
  };

  const getPinnedCountByDepartment = (departmentAnnouncements) => {
    return departmentAnnouncements.filter((a) => a.isPinned).length;
  };

  const canPinMoreInDepartment = (departmentAnnouncements) => {
    return getPinnedCountByDepartment(departmentAnnouncements) < MAX_PINNED_PER_DEPARTMENT;
  };

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
      ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.dateTime) - new Date(a.dateTime);
      });

      setAnnouncements(updatedAnnouncements);

      try {
        await api.patch(`/announcements/${announcement._id}`, { isPinned: newPinnedStatus });
      } catch (e) {
        await api.put(`/announcements/${announcement._id}`, { ...announcement, isPinned: newPinnedStatus });
      }
    } catch (error) {}
  };

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await api.get("/announcements");
      const pinned = getPinnedAnnouncementsFromStorage();

      const processed = response.data
        .filter((ann) => ann && ann._id && ann.status === "Active")
        .map((ann) => ({
          ...ann,
          isPinned: pinned[ann._id] || ann.isPinned || false,
          views: Array.isArray(ann.views) ? ann.views : [],
          acknowledgements: Array.isArray(ann.acknowledgements) ? ann.acknowledgements : [],
        }))
        .map(processAnnouncementData)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.dateTime) - new Date(a.dateTime);
        });

      setAnnouncements(processed);
      setIsLoadingAnnouncements(false);
    } catch (error) {
      setIsLoadingAnnouncements(false);
    }
  };

  const handleFileDownload = (file) => {
    try {
      const base64Data = file.data.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
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
    } catch (error) {}
  };

  const handleFileView = (file) => setFileViewModal({ isOpen: true, file });
  const closeFileView = () => setFileViewModal({ isOpen: false, file: null });

  const handleReadMore = async (announcement) => {
    if (currentUser?._id) await trackView(announcement._id, currentUser._id);
    setAnnouncementDetailModal({ isOpen: true, announcement });
  };

  const closeAnnouncementDetail = () => setAnnouncementDetailModal({ isOpen: false, announcement: null });

  const categorizeAnnouncements = (announcements) => {
    const accounting = [];
    const compliance = [];
    const hr = [];
    const technical = [];

    announcements.forEach((ann) => {
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

  const getFilteredAnnouncements = () => {
    if (!searchTerm) return announcements;
    return announcements.filter(ann =>
      ann.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.agenda?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredAnnouncements = getFilteredAnnouncements();
  const getFilteredAnnouncementsByDepartment = (department) => {
    const { accounting: fAcc, compliance: fComp, technical: fTech, hr: fHr } = categorizeAnnouncements(filteredAnnouncements);
    switch (department) {
      case "technical": return fTech;
      case "compliance": return fComp;
      case "accounting": return fAcc;
      case "hr": return fHr;
      default: return [];
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <FileViewModal isOpen={fileViewModal.isOpen} onClose={closeFileView} file={fileViewModal.file} />
      <AnnouncementDetailModal
        isOpen={announcementDetailModal.isOpen}
        onClose={closeAnnouncementDetail}
        announcement={announcementDetailModal.announcement}
        onTogglePin={handleTogglePin}
        onLike={handleLike}
        hasLiked={hasLiked}
        currentUser={currentUser}
      />

      <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
        <header className="mb-2">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Welcome back, {currentUser.name}!</h1>
          <p className="text-sm sm:text-lg text-gray-500 font-medium">Stay updated with the latest announcements</p>
        </header>

        <HeaderCarousel />

        {/* ✅ COMPREHENSIVE RESPONSIVE GRID FOR CORE CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="w-full flex overflow-hidden">
            <PaydayCard />
          </div>
          <div className="w-full flex overflow-hidden">
            <DailyRecordsCard />
          </div>
          <div className="w-full flex overflow-hidden">
            <PunctualityChart />
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-50 rounded-xl">
                  <Bell className="w-6 h-6 text-blue-600" />
               </div>
               <div>
                  <h3 className="font-bold text-lg sm:text-2xl text-gray-800 leading-tight">Department Announcements</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Real-time enabled</p>
                  </div>
               </div>
            </div>
           
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {isLoadingAnnouncements ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-12">
              {["technical", "compliance", "accounting", "hr"].map(dept => {
                const deptAnns = getFilteredAnnouncementsByDepartment(dept);
                if (deptAnns.length === 0) return null;
                return (
                  <DepartmentAnnouncementSection
                    key={dept}
                    title={`${dept.charAt(0).toUpperCase() + dept.slice(1)} Announcements`}
                    announcements={deptAnns}
                    onReadMore={handleReadMore}
                    onFileDownload={handleFileDownload}
                    onFileView={handleFileView}
                    onTogglePin={handleTogglePin}
                    onLike={handleLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id}
                    getViewCount={getViewCount}
                    getLikeCount={getLikeCount}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No announcements found matching your criteria.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
