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

const AdminDashboard = () => {
  const [isEmployeeClicked, setIsEmployeeClicked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [announcementDetailModal, setAnnouncementDetailModal] = useState({
    isOpen: false,
    announcement: null,
  });

  const [fileViewModal, setFileViewModal] = useState({
    isOpen: false,
    file: null,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showPinLimitToast, setShowPinLimitToast] = useState(false);

  const [accountingPinned, setAccountingPinned] = useState(false);
  const [compliancePinned, setCompliancePinned] = useState(false);
  const [hrPinned, setHrPinned] = useState(false);
  const [technicalPinned, setTechnicalPinned] = useState(false);

  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements_admin";

  const [currentRealTime, setCurrentRealTime] = useState(DateTime.local());


  useEffect(() => {
    const initializeAdminUser = async () => {
      try {
        console.log("🔄 Initializing admin user from database...");
        
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (token) {
          try {
            const response = await api.get("/auth/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.role === "admin") {
              console.log("✅ Admin user authenticated:", response.data.name);
              setCurrentUser({
                _id: response.data._id,
                name: response.data.name,
                employeeId: response.data.employeeId,
                department: response.data.department,
                role: response.data.role
              });
              return;
            }
          } catch (authError) {
            console.log(" Authentication failed:", authError.message);
          }
        }
        
        try {
          const response = await api.get("/users/admins");
          
          if (response.data && response.data.length > 0) {
            const adminUser = response.data[0];
            console.log("✅ Found admin in database:", adminUser.name);
            setCurrentUser({
              _id: adminUser._id,
              name: adminUser.name,
              employeeId: adminUser.employeeId,
              department: adminUser.department,
              role: adminUser.role
            });
          } else {

            console.log("⚠️ No admin found in database...");
           
          }
        } catch (dbError) {
          console.error("❌ Database error:", dbError);

          setCurrentUser({
            // _id: "admin_database_error",
            // name: "Administrator",
            // // employeeId: "ADMIN001",
            // // department: "Administration",
            // role: "admin"
          });
        }
        
      } catch (error) {
        console.error("❌ Error initializing admin user:", error);
        setCurrentUser({
          // _id: "admin_error",
          // // name: "Administrator",
          // // employeeId: "ADMIN001",
          // department: "Administration",
          // role: "admin"
        });
      }
    };



    initializeAdminUser();
  }, []);

  const { 
    hasLiked, 
    trackView, 
    handleLike, 
    getViewCount, 
    getLikeCount 
  } = useAnnouncementInteractions(announcements, setAnnouncements, currentUser?._id);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    const realTimeInterval = setInterval(() => {
      setCurrentRealTime(DateTime.local());
    }, 1000);
    
    return () => {
      clearInterval(t);
      clearInterval(realTimeInterval);
    };
  }, []);

  useEffect(() => {
    if (announcements.length > 0) {
      const updatedAnnouncements = announcements.map(announcement => ({
        ...announcement,
        timeAgo: getRealTimeAgo(announcement.dateTime),
        realTimeFormatted: DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED)
      }));
      
      setAnnouncements(prev => {
        const hasChanges = prev.some((ann, index) => 
          ann.timeAgo !== updatedAnnouncements[index].timeAgo
        );
        return hasChanges ? updatedAnnouncements : prev;
      });
    }
  }, [currentRealTime]);

  // ✅ Pin functionality (localStorage OK dito lang)
  const getPinnedAnnouncementsFromStorage = () => {
    try {
      const pinned = localStorage.getItem(PINNED_ANNOUNCEMENTS_KEY);
      return pinned ? JSON.parse(pinned) : {};
    } catch (error) {
      console.error("Error reading pinned announcements:", error);
      return {};
    }
  };

  const removePinnedAnnouncementFromStorage = (announcementId) => {
    try {
      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      if (pinnedAnnouncements[announcementId]) {
        delete pinnedAnnouncements[announcementId];
        localStorage.setItem(
          PINNED_ANNOUNCEMENTS_KEY,
          JSON.stringify(pinnedAnnouncements)
        );
      }
    } catch (error) {
      console.error("Error removing pinned announcement:", error);
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
        timeAgo: announcement.timeAgo || getRealTimeAgo(announcement.dateTime),
        realTimeFormatted: announcement.realTimeFormatted || DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED)
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

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await api.get("/announcements");

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();

      const processedAnnouncements = response.data
        .filter((ann) => ann && ann._id && ann.status === "Active")
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
    } catch (error) {
      console.error("❌ Error fetching announcements:", error);
      setIsLoadingAnnouncements(false);
    }
  };

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

  // ✅ FIXED: HandleReadMore with database user ID
  const handleReadMore = async (announcement) => {
    if (currentUser?._id) {
      console.log(`👁️ Admin ${currentUser.name} viewing announcement ${announcement._id}`);
      await trackView(announcement._id, currentUser._id);
    } else {
      console.warn("⚠️ No user ID found for tracking view");
    }
    setAnnouncementDetailModal({ isOpen: true, announcement });
  };

  const closeAnnouncementDetail = () => {
    setAnnouncementDetailModal({ isOpen: false, announcement: null });
  };

  const handleModalOnClose = () => {
    setIsEmployeeClicked(false);
  };

  // ✅ FIXED: Socket implementation
  useEffect(() => {
    console.log("🔄 Setting up socket listeners for admin...");

    if (!socket) {
      console.log("❌ Socket not available for admin");
      fetchAnnouncements();
      return;
    }

    if (!socket.connected) {
      console.log("❌ Socket not connected for admin, attempting connection...");
      socket.connect();
    }

    let dataLoaded = false;

    const handleInitialData = (socketAnnouncements) => {
      console.log("📥 Received initial admin data via socket:", socketAnnouncements?.length);
      
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
        console.log("✅ Socket data loaded successfully for admin");
      }
    };

    const handleAgentUpdate = (updateData) => {
      console.log("📊 Real-time admin update:", updateData);
      
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

    const handleUnifiedAnnouncement = (announcementData, source) => {
      console.log(`📥 ${source}:`, announcementData._id, announcementData.title);
      
      if (announcementData.status !== "Active") {
        console.log("❌ Ignoring inactive announcement from", source);
        return;
      }

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      const processedAnnouncement = processAnnouncementData({
        ...announcementData,
        isPinned: pinnedAnnouncements[announcementData._id] || false,
        views: Array.isArray(announcementData.views) ? announcementData.views : [],
        acknowledgements: Array.isArray(announcementData.acknowledgements) 
          ? announcementData.acknowledgements 
          : [],
      });

      if (!processedAnnouncement) {
        console.log("❌ Failed to process announcement from", source);
        return;
      }

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

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }

          return new Date(b.dateTime) - new Date(a.dateTime);
        });
      });
    };

    const handleNewAnnouncement = (newAnnouncement) => {
      handleUnifiedAnnouncement(newAnnouncement, "NEW ANNOUNCEMENT");
    };

    const handleAnnouncementReposted = (repostedAnnouncement) => {
      handleUnifiedAnnouncement(repostedAnnouncement, "REPOST");
    };

    const handleAnnouncementCancelled = (data) => {
      console.log("🔴 Real-time: Announcement cancellation received", data);
      
      const announcementId = data?.announcementId || data?._id || data?.id;
      
      if (!announcementId) {
        console.error("❌ No announcement ID found in cancellation data:", data);
        return;
      }

      console.log("🗑️ Removing cancelled announcement from admin view:", announcementId);
      
      setAnnouncements(prev => {
        const updated = prev.filter(ann => ann._id !== announcementId);
        console.log(`✅ Removed cancelled announcement. Before: ${prev.length}, After: ${updated.length}`);
        return updated;
      });

      removePinnedAnnouncementFromStorage(announcementId);
    };

    const handleAnnouncementUpdated = (updatedAnnouncement) => {
      console.log("📝 Real-time: Announcement updated", updatedAnnouncement._id, updatedAnnouncement.title);
      
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

      if (!processedAnnouncement) {
        console.log("❌ Failed to process updated announcement");
        return;
      }

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

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }

          return new Date(b.dateTime) - new Date(a.dateTime);
        });
      });
    };

    socket.on("initialAgentData", handleInitialData);
    socket.on("agentAnnouncementUpdate", handleAgentUpdate);
    socket.on("newAnnouncement", handleNewAnnouncement);
    socket.on("announcementCancelled", handleAnnouncementCancelled);
    socket.on("announcementCanceled", handleAnnouncementCancelled);
    socket.on("cancelledAnnouncement", handleAnnouncementCancelled);
    socket.on("announcementDeleted", handleAnnouncementCancelled);
    socket.on("announcementReposted", handleAnnouncementReposted);
    socket.on("announcementUpdated", handleAnnouncementUpdated);
    socket.on("updatedAnnouncement", handleAnnouncementUpdated);

    console.log("📤 Requesting initial admin data via socket...");
    socket.emit("getAgentData");

    const fallbackTimeout = setTimeout(() => {
      if (!dataLoaded) {
        console.log("⏰ Socket timeout for admin, falling back to API...");
        fetchAnnouncements();
      }
    }, 3000);

    return () => {
      console.log("🧹 Cleaning up socket listeners for admin");
      clearTimeout(fallbackTimeout);
      
      socket.off("initialAgentData", handleInitialData);
      socket.off("agentAnnouncementUpdate", handleAgentUpdate);
      socket.off("newAnnouncement", handleNewAnnouncement);
      socket.off("announcementCancelled", handleAnnouncementCancelled);
      socket.off("announcementCanceled", handleAnnouncementCancelled);
      socket.off("cancelledAnnouncement", handleAnnouncementCancelled);
      socket.off("announcementDeleted", handleAnnouncementCancelled);
      socket.off("announcementReposted", handleAnnouncementReposted);
      socket.off("announcementUpdated", handleAnnouncementUpdated);
      socket.off("updatedAnnouncement", handleAnnouncementUpdated);
    };
  }, [currentUser?._id]);

  // Stats data with "COMING SOON" values
  const stats = [
    {
      key: "totalEmployees",
      title: "Total Employees",
      subTitle: "Company-wide",
      icon: (
        <Users className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-slate-600 bg-slate-100 border-slate-400 border" />
      ),
    },
    {
      key: "present",
      title: "Present",
      subTitle: "Currently Working",
      icon: (
        <UserCheck className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-emerald-600 bg-emerald-100 border-emerald-400 border" />
      ),
    },
    {
      key: "absent",
      title: "Absentees",
      subTitle: "Not Present",
      icon: (
        <UserX className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-red-500 bg-red-100 border-red-400 border" />
      ),
    },
    {
      key: "late",
      title: "Late Arrivals",
      subTitle: "Late Today",
      icon: (
        <Clock className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-amber-600 bg-amber-100 border-amber-400 border" />
      ),
    },
    {
      key: "onBreak",
      title: "On Break",
      subTitle: "Currently",
      icon: (
        <Coffee className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-blue-600 bg-blue-100 border-blue-400 border" />
      ),
    },
    {
      key: "onLunch",
      title: "On Lunch",
      subTitle: "Lunch Break",
      icon: (
        <Utensils className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-orange-600 bg-orange-100 border-orange-400 border" />
      ),
    },
    {
      key: "overtime",
      title: "Overtime",
      subTitle: "Extra Hours",
      icon: (
        <TrendingUp className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-violet-600 bg-violet-100 border-violet-400 border" />
      ),
    },
    {
      key: "undertime",
      title: "Undertime",
      subTitle: "Short Hours",
      icon: (
        <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-full text-pink-600 bg-pink-100 border-pink-400 border" />
      ),
    },
  ];

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="text-gray-600 text-lg">Loading admin data from database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
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

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Admin Monitoring Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time attendance and work hours monitoring
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-sm text-gray-500">
              Last updated: {currentTime.toLocaleTimeString()} | Today:{" "}
              {currentTime.toLocaleDateString()}
            </p>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Real-time updates
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>{currentUser.name}</span>
          </div>
          <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          
          </div>
          <div className="text-xs text-gray-500">
         
          </div>
        </div>
      </div>

      {/* Stats Cards with "COMING SOON" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.key} className="bg-white rounded-xl p-4 shadow border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-xs text-gray-500">{stat.subTitle}</p>
              </div>
              {stat.icon}
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-gray-800">--</span>
              <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                COMING SOON
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Weekly Attendance Trend - COMING SOON */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Attendance Trend</h3>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">COMING SOON</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-gradient-to-r from-blue-700 to-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Distribution by Department - COMING SOON */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Employee Distribution by Department</h3>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">COMING SOON</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-gradient-to-r from-green-700 to-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Monitor - COMING SOON */}
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Activity Monitor</h3>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">COMING SOON</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-inner flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-gradient-to-r from-purple-700 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section - Full Width - ACTIVE */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Department Announcements</h3>
                <p className="text-gray-600">Latest updates from different departments - Real-time</p>
                <div className="text-xs text-gray-500 mt-1">
                  Logged in as: {currentUser.name} ({currentUser.employeeId})
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                  <Pin className="w-4 h-4" />
                  Max {MAX_PINNED_PER_DEPARTMENT} pins
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live
                </span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
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

          {/* Announcements Content */}
          {isLoadingAnnouncements ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <span className="text-gray-600">Loading announcements...</span>
            </div>
          ) : hasFilteredAnnouncements ? (
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Technical Announcements */}
              {getFilteredAnnouncementsByDepartment("technical").length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <DepartmentAnnouncementSection
                    title="Technical Announcements"
                    announcements={getFilteredAnnouncementsByDepartment("technical")}
                    onReadMore={handleReadMore}
                    onFileDownload={handleFileDownload}
                    onFileView={handleFileView}
                    onTogglePin={handleTogglePin}
                    canPinMore={canPinMoreInDepartment(technical)}
                    showPinnedOnly={technicalPinned}
                    onTogglePinnedView={() => setTechnicalPinned(!technicalPinned)}
                    pinnedCount={getFilteredAnnouncementsByDepartment("technical").filter((a) => a.isPinned).length}
                    maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    onLike={handleLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id}
                    getViewCount={getViewCount}
                    getLikeCount={getLikeCount}
                    compactView={true}
                  />
                </div>
              )}

              {/* HR Announcements */}
              {getFilteredAnnouncementsByDepartment("hr").length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <DepartmentAnnouncementSection
                    title="HR & Admin Announcements"
                    announcements={getFilteredAnnouncementsByDepartment("hr")}
                    onReadMore={handleReadMore}
                    onFileDownload={handleFileDownload}
                    onFileView={handleFileView}
                    onTogglePin={handleTogglePin}
                    canPinMore={canPinMoreInDepartment(hr)}
                    showPinnedOnly={hrPinned}
                    onTogglePinnedView={() => setHrPinned(!hrPinned)}
                    pinnedCount={getFilteredAnnouncementsByDepartment("hr").filter((a) => a.isPinned).length}
                    maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    onLike={handleLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id}
                    getViewCount={getViewCount}
                    getLikeCount={getLikeCount}
                    compactView={true}
                  />
                </div>
              )}

              {/* Compliance Announcements */}
              {getFilteredAnnouncementsByDepartment("compliance").length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <DepartmentAnnouncementSection
                    title="Compliance Announcements"
                    announcements={getFilteredAnnouncementsByDepartment("compliance")}
                    onReadMore={handleReadMore}
                    onFileDownload={handleFileDownload}
                    onFileView={handleFileView}
                    onTogglePin={handleTogglePin}
                    canPinMore={canPinMoreInDepartment(compliance)}
                    showPinnedOnly={compliancePinned}
                    onTogglePinnedView={() => setCompliancePinned(!compliancePinned)}
                    pinnedCount={getFilteredAnnouncementsByDepartment("compliance").filter((a) => a.isPinned).length}
                    maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    onLike={handleLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id}
                    getViewCount={getViewCount}
                    getLikeCount={getLikeCount}
                    compactView={true}
                  />
                </div>
              )}

              {/* Accounting Announcements */}
              {getFilteredAnnouncementsByDepartment("accounting").length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <DepartmentAnnouncementSection
                    title="Accounting Announcements"
                    announcements={getFilteredAnnouncementsByDepartment("accounting")}
                    onReadMore={handleReadMore}
                    onFileDownload={handleFileDownload}
                    onFileView={handleFileView}
                    onTogglePin={handleTogglePin}
                    canPinMore={canPinMoreInDepartment(accounting)}
                    showPinnedOnly={accountingPinned}
                    onTogglePinnedView={() => setAccountingPinned(!accountingPinned)}
                    pinnedCount={getFilteredAnnouncementsByDepartment("accounting").filter((a) => a.isPinned).length}
                    maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                    onLike={handleLike}
                    hasLiked={hasLiked}
                    currentUserId={currentUser?._id}
                    getViewCount={getViewCount}
                    getLikeCount={getLikeCount}
                    compactView={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? "No Matching Announcements" : "No Announcements Found"}
              </h4>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "No announcements match your search criteria."
                  : "There are no active announcements at the moment."
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Real-time updates enabled</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Total: {filteredAnnouncements.length}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Max {MAX_PINNED_PER_DEPARTMENT} pins per department
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {isEmployeeClicked && (
        <EmployeeModal
          onClose={handleModalOnClose}
        />
      )}
    </div>
  );
};

export default AdminDashboard;