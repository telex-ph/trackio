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

  // ✅ ADDED: Check if announcement is expired
  const now = DateTime.local();
  const expiresAt = announcement.expiresAt ? DateTime.fromISO(announcement.expiresAt) : null;
  const isExpired = expiresAt && expiresAt <= now;

  return {
    ...announcement,
    processedViews: uniqueViewers,
    processedAcknowledgements: uniqueAcknowledgements,
    totalViews: uniqueViewers.length,
    totalAcknowledgements: uniqueAcknowledgements.length,
    formattedDateTime: new Date(announcement.dateTime).toLocaleDateString(),
    realTimeFormatted: DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED),
    timeAgo: "",
    // ✅ ADDED: Expiry status and other metadata
    isExpired: isExpired,
    expiresAtFormatted: expiresAt ? expiresAt.toLocaleString(DateTime.DATETIME_MED) : null,
    // ✅ ADDED: Ensure category field exists
    category: announcement.category || "Department",
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

// Helper function para malaman ang file type mula sa URL
const getFileTypeFromUrl = (url) => {
  if (!url) return 'application/octet-stream';
  const extension = url.split('.').pop().toLowerCase().split('?')[0]; // Remove query parameters
  const mimeTypes = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

// ==================== RESPONSIVE FILE ATTACHMENT COMPONENT ====================
const FileAttachment = ({ file, onDownload, onView }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase().split('?')[0];
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
    const extension = fileName.split('.').pop().toLowerCase().split('?')[0];
    return ["pdf", "jpg", "jpeg", "png", "gif", "txt"].includes(extension);
  };

  // Extract filename from URL if fileName is not provided
  const getFileName = () => {
    if (file.name) return file.name;
    if (file.fileName) return file.fileName;
    if (file.url) {
      const urlParts = file.url.split('/');
      return urlParts[urlParts.length - 1].split('?')[0];
    }
    return 'Attachment';
  };

  const fileName = getFileName();

  return (
    <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg mt-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon(fileName)}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-700 truncate block">
            {fileName}
          </span>
        </div>
      </div>
      <div className="flex gap-1 ml-2 flex-shrink-0">
        {canPreview(fileName) && (
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
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ ADDED: Real-time current time state
  const [currentTime, setCurrentTime] = useState(DateTime.local());

  const [accountingPinned, setAccountingPinned] = useState(false);
  const [compliancePinned, setCompliancePinned] = useState(false);
  const [hrPinned, setHrPinned] = useState(false);
  const [technicalPinned, setTechnicalPinned] = useState(false);

  // NEW: Separate pin limits per department
  const MAX_PINNED_PER_DEPARTMENT = 3;
  const PINNED_ANNOUNCEMENTS_KEY = "pinned_announcements";

  const { hasLiked, trackView, handleLike, getViewCount, getLikeCount } =
    useAnnouncementInteractions(announcements, setAnnouncements);

  // ✅ ADDED: REAL-TIME TIME UPDATES EVERY SECOND
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.local());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  // ✅ ADDED: UPDATE ANNOUNCEMENT TIME DISPLAYS IN REAL-TIME
  useEffect(() => {
    if (announcements.length > 0) {
      // Update time ago for all announcements
      const updatedAnnouncements = announcements.map(announcement => ({
        ...announcement,
        timeAgo: getRealTimeAgo(announcement.dateTime),
        realTimeFormatted: DateTime.fromISO(announcement.dateTime).toLocaleString(DateTime.DATETIME_MED),
        // ✅ ADDED: Check expiry status in real-time
        isExpired: announcement.expiresAt ? 
          DateTime.fromISO(announcement.expiresAt) <= currentTime : false,
      }));
      
      // Only update if there are actual changes to prevent unnecessary re-renders
      setAnnouncements(prev => {
        const hasChanges = prev.some((ann, index) => 
          ann.timeAgo !== updatedAnnouncements[index].timeAgo ||
          ann.isExpired !== updatedAnnouncements[index].isExpired
        );
        return hasChanges ? updatedAnnouncements : prev;
      });
    }
  }, [currentTime]); // Re-run when currentTime updates

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
            role: zustandUser.role, // ✅ ADDED: Include user role
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
            role: Roles.AGENT, // Default role
          });
          return;
        }

        setCurrentUser({
          _id: effectiveUserId,
          name: userName || "User",
          employeeId: employeeId,
          department: department,
          role: Roles.AGENT, // Default role
        });

      } catch (error) {
        console.error("❌ Error initializing user data:", error);
        setCurrentUser({
          _id: "fallback_user_" + Math.random().toString(36).substr(2, 9),
          name: "Fallback User",
          employeeId: "fallback_emp",
          department: "Technical",
          role: Roles.AGENT,
        });
      }
    };

    initializeUserData();
  }, []);

  // ✅ FIXED SOCKET LISTENERS FOR REAL-TIME UPDATES WITH APPROVAL SYSTEM
  useEffect(() => {
   

    // Check socket connection
    if (!socket) {
      console.log("❌ Socket not available for agent");
      fetchAnnouncements();
      return;
    }

    if (!socket.connected) {
      console.log("❌ Socket not connected for agent, attempting connection...");
      socket.connect();
    }

    let dataLoaded = false;

    // Listen for initial data from socket
    const handleInitialData = (socketAnnouncements) => {
      console.log("📥 Received initial agent data via socket:", socketAnnouncements?.length);
      
      if (Array.isArray(socketAnnouncements) && socketAnnouncements.length > 0) {
        const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
        const now = DateTime.local();
        
        const processedAnnouncements = socketAnnouncements
          .filter((ann) => {
            // ✅ CRITICAL FILTERS: Must be Active, Approved, and Not Expired
            if (!ann || !ann._id) return false;
            if (ann.status !== 'Active') return false;
            if (ann.approvalStatus !== 'Approved') return false;
            
            // ✅ Expiry Check
            if (ann.expiresAt && DateTime.fromISO(ann.expiresAt) <= now) return false;
            
            return true;
          })
          .map((announcement) => ({
            ...announcement,
            isPinned: pinnedAnnouncements[announcement._id] || announcement.isPinned || false,
            views: Array.isArray(announcement.views) ? announcement.views : [],
            acknowledgements: Array.isArray(announcement.acknowledgements) 
              ? announcement.acknowledgements 
              : [],
            // ✅ ADDED: Ensure category field exists
            category: announcement.category || "Department",
            // ✅ PRESERVE ATTACHMENT STRUCTURE
            attachment: announcement.attachment ? {
              url: announcement.attachment.url,
              fileName: announcement.attachment.fileName || announcement.attachment.name,
              type: announcement.attachment.type || getFileTypeFromUrl(announcement.attachment.url)
            } : null,
          }))
          .map(processAnnouncementData)
          .map(announcement => ({
            ...announcement,
            // ✅ ADDED: Initialize real-time time data
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
        console.log("✅ Socket data loaded successfully for agent");
      }
    };

    // Listen for real-time updates (likes/views counts)
    const handleAgentUpdate = (updateData) => {
      console.log("📊 Real-time agent update:", updateData);
      
      setAnnouncements(prev => prev.map(ann => {
        if (ann._id === updateData.announcementId) {
          console.log("🔄 Updating agent announcement:", ann.title);
          console.log("👀 New views:", updateData.views);
          console.log("❤️ New likes:", updateData.likes);
          
          return {
            ...ann,
            // Update counts only (agents don't see user lists)
            totalViews: updateData.views,
            totalAcknowledgements: updateData.likes,
            // ✅ PRESERVE REAL-TIME TIME DATA
            timeAgo: ann.timeAgo || getRealTimeAgo(ann.dateTime),
            realTimeFormatted: ann.realTimeFormatted || DateTime.fromISO(ann.dateTime).toLocaleString(DateTime.DATETIME_MED)
          };
        }
        return ann;
      }));
    };

    // ✅ UPDATED: UNIFIED ANNOUNCEMENT HANDLER WITH APPROVAL AND EXPIRY CHECK
    const handleUnifiedAnnouncement = (announcementData, source) => {
      console.log(`📥 ${source}:`, announcementData._id, announcementData.title);
      
      // ✅ CHECK IF ANNOUNCEMENT IS ACTIVE AND APPROVED
      if (announcementData.status !== "Active" || announcementData.approvalStatus !== "Approved") {
        console.log("❌ Ignoring inactive or unapproved announcement from", source);
        // Remove if previously existed but now not approved
        if (announcementData.status !== "Active") {
          setAnnouncements(prev => prev.filter(a => a._id !== announcementData._id));
          removePinnedAnnouncementFromStorage(announcementData._id);
        }
        return;
      }

      // ✅ CHECK IF ANNOUNCEMENT IS EXPIRED
      const now = DateTime.local();
      if (announcementData.expiresAt && DateTime.fromISO(announcementData.expiresAt) <= now) {
        console.log("❌ Ignoring expired announcement from", source);
        setAnnouncements(prev => prev.filter(a => a._id !== announcementData._id));
        removePinnedAnnouncementFromStorage(announcementData._id);
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
        // ✅ ADDED: Ensure category field exists
        category: announcementData.category || "Department",
        // ✅ PRESERVE ATTACHMENT STRUCTURE
        attachment: announcementData.attachment ? {
          url: announcementData.attachment.url,
          fileName: announcementData.attachment.fileName || announcementData.attachment.name,
          type: announcementData.attachment.type || getFileTypeFromUrl(announcementData.attachment.url)
        } : null,
      });

      if (!processedAnnouncement) {
        console.log("❌ Failed to process announcement from", source);
        return;
      }

      // ✅ ADDED: Initialize real-time time data for new announcements
      const announcementWithRealTime = {
        ...processedAnnouncement,
        timeAgo: getRealTimeAgo(processedAnnouncement.dateTime),
        realTimeFormatted: DateTime.fromISO(processedAnnouncement.dateTime).toLocaleString(DateTime.DATETIME_MED)
      };

      setAnnouncements(prev => {
        // ✅ CRITICAL: Remove existing announcement with same ID first
        const filtered = prev.filter(a => a._id !== announcementWithRealTime._id);
        
        // ✅ Add the new/reposted announcement at the beginning
        const updated = [announcementWithRealTime, ...filtered];
        
        // ✅ Sort the announcements
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

      console.log(`✅ ${source} processed successfully - Announcement:`, announcementWithRealTime.title);
    };

    // ✅ FIXED: NEW ANNOUNCEMENT HANDLER WITH APPROVAL CHECK
    const handleNewAnnouncement = (newAnnouncement) => {
      handleUnifiedAnnouncement(newAnnouncement, "NEW ANNOUNCEMENT");
    };

    // ✅ FIXED: REPOST HANDLER WITH APPROVAL CHECK
    const handleAnnouncementReposted = (repostedAnnouncement) => {
      handleUnifiedAnnouncement(repostedAnnouncement, "REPOST");
    };

    // ✅ ADDED: ANNOUNCEMENT APPROVAL HANDLER
    const handleAnnouncementApproved = (approvedAnnouncement) => {
      console.log("✅ Real-time: Announcement approved", approvedAnnouncement._id);
      handleUnifiedAnnouncement(approvedAnnouncement, "APPROVED ANNOUNCEMENT");
    };

    // ✅ CRITICAL: FIXED CANCELLATION HANDLER
    const handleAnnouncementCancelled = (data) => {
      console.log("🔴 Real-time: Announcement cancellation received", data);
      
      // Extract announcement ID from different possible data structures
      const announcementId = data?.announcementId || data?._id || data?.id;
      
      if (!announcementId) {
        console.error("❌ No announcement ID found in cancellation data:", data);
        return;
      }

      console.log("🗑️ Removing cancelled announcement from agent view:", announcementId);
      
      // ✅ IMMEDIATELY REMOVE FROM AGENT DASHBOARD
      setAnnouncements(prev => {
        const updated = prev.filter(ann => ann._id !== announcementId);
        console.log(`✅ Removed cancelled announcement. Before: ${prev.length}, After: ${updated.length}`);
        return updated;
      });

      // Also remove from pinned storage
      removePinnedAnnouncementFromStorage(announcementId);
    };

    // ✅ FIXED: REAL-TIME EDIT HANDLER
    const handleAnnouncementUpdated = (updatedAnnouncement) => {
      console.log("📝 Real-time: Announcement updated", updatedAnnouncement._id, updatedAnnouncement.title);
      
      // ✅ CHECK IF ANNOUNCEMENT IS ACTIVE AND APPROVED
      if (updatedAnnouncement.status !== "Active" || updatedAnnouncement.approvalStatus !== "Approved") {
        console.log("❌ Updated announcement is not active or approved, removing it");
        // Remove if status changed to inactive
        setAnnouncements(prev => prev.filter(ann => ann._id !== updatedAnnouncement._id));
        removePinnedAnnouncementFromStorage(updatedAnnouncement._id);
        return;
      }

      // ✅ CHECK IF ANNOUNCEMENT IS EXPIRED
      const now = DateTime.local();
      if (updatedAnnouncement.expiresAt && DateTime.fromISO(updatedAnnouncement.expiresAt) <= now) {
        console.log("❌ Updated announcement is expired, removing it");
        setAnnouncements(prev => prev.filter(ann => ann._id !== updatedAnnouncement._id));
        removePinnedAnnouncementFromStorage(updatedAnnouncement._id);
        return;
      }

      console.log("✅ Processing real-time announcement update");

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      const processedAnnouncement = processAnnouncementData({
        ...updatedAnnouncement,
        isPinned: pinnedAnnouncements[updatedAnnouncement._id] || false,
        views: Array.isArray(updatedAnnouncement.views) ? updatedAnnouncement.views : [],
        acknowledgements: Array.isArray(updatedAnnouncement.acknowledgements) 
          ? updatedAnnouncement.acknowledgements 
          : [],
        // ✅ ADDED: Ensure category field exists
        category: updatedAnnouncement.category || "Department",
        // ✅ PRESERVE ATTACHMENT STRUCTURE
        attachment: updatedAnnouncement.attachment ? {
          url: updatedAnnouncement.attachment.url,
          fileName: updatedAnnouncement.attachment.fileName || updatedAnnouncement.attachment.name,
          type: updatedAnnouncement.attachment.type || getFileTypeFromUrl(updatedAnnouncement.attachment.url)
        } : null,
      });

      if (!processedAnnouncement) {
        console.log("❌ Failed to process updated announcement");
        return;
      }

      // ✅ ADDED: Initialize real-time time data for updated announcements
      const announcementWithRealTime = {
        ...processedAnnouncement,
        timeAgo: getRealTimeAgo(processedAnnouncement.dateTime),
        realTimeFormatted: DateTime.fromISO(processedAnnouncement.dateTime).toLocaleString(DateTime.DATETIME_MED)
      };

      setAnnouncements(prev => {
        // ✅ REMOVE EXISTING AND ADD UPDATED ANNOUNCEMENT
        const filtered = prev.filter(a => a._id !== announcementWithRealTime._id);
        const updated = [announcementWithRealTime, ...filtered];
        
        // ✅ SORT THE ANNOUNCEMENTS
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

      console.log("✅ Announcement updated in real-time:", announcementWithRealTime.title);
    };

    // Register event listeners with multiple event names for reliability
    socket.on("initialAgentData", handleInitialData);
    socket.on("agentAnnouncementUpdate", handleAgentUpdate);
    socket.on("newAnnouncement", handleNewAnnouncement);
    
    // ✅ ADDED: Announcement approval event
    socket.on("announcementApproved", handleAnnouncementApproved);
    
    // ✅ CRITICAL: LISTEN FOR MULTIPLE CANCELLATION EVENT NAMES
    socket.on("announcementCancelled", handleAnnouncementCancelled);
    socket.on("announcementCanceled", handleAnnouncementCancelled); // Alternative spelling
    socket.on("cancelledAnnouncement", handleAnnouncementCancelled);
    socket.on("announcementDeleted", handleAnnouncementCancelled);
    
    socket.on("announcementReposted", handleAnnouncementReposted);
    
    // ✅ REGISTER THE EDIT LISTENERS
    socket.on("announcementUpdated", handleAnnouncementUpdated);
    socket.on("updatedAnnouncement", handleAnnouncementUpdated);
  
    socket.emit("getAgentData");

    // Fallback to API if socket doesn't respond in 3 seconds
    const fallbackTimeout = setTimeout(() => {
      if (!dataLoaded) {
        fetchAnnouncements();
      }
    }, 3000);

    // Cleanup function
    return () => {
      clearTimeout(fallbackTimeout);
      
      // Remove all event listeners
      socket.off("initialAgentData", handleInitialData);
      socket.off("agentAnnouncementUpdate", handleAgentUpdate);
      socket.off("newAnnouncement", handleNewAnnouncement);
      socket.off("announcementApproved", handleAnnouncementApproved);
      
      // Remove all cancellation listeners
      socket.off("announcementCancelled", handleAnnouncementCancelled);
      socket.off("announcementCanceled", handleAnnouncementCancelled);
      socket.off("cancelledAnnouncement", handleAnnouncementCancelled);
      socket.off("announcementDeleted", handleAnnouncementCancelled);
      
      socket.off("announcementReposted", handleAnnouncementReposted);
      
      // Remove edit listeners
      socket.off("announcementUpdated", handleAnnouncementUpdated);
      socket.off("updatedAnnouncement", handleAnnouncementUpdated);
    };
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

  // ✅ ADDED: Helper to remove pinned announcement from storage
  const removePinnedAnnouncementFromStorage = (announcementId) => {
    try {
      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      if (pinnedAnnouncements[announcementId]) {
        delete pinnedAnnouncements[announcementId];
        localStorage.setItem(
          PINNED_ANNOUNCEMENTS_KEY,
          JSON.stringify(pinnedAnnouncements)
        );
        console.log("✅ Removed cancelled announcement from pinned storage:", announcementId);
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
      const { general, accounting, compliance, technical, hr } =
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
        case "General":
          departmentAnnouncements = general;
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
        // ✅ PRESERVE REAL-TIME TIME DATA
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

  const fetchAnnouncements = async () => {
    try {
      setIsLoadingAnnouncements(true);
      const response = await api.get("/announcements");

      const pinnedAnnouncements = getPinnedAnnouncementsFromStorage();
      const now = DateTime.local();

      const processedAnnouncements = response.data
        .filter((ann) => {
          // ✅ UPDATED FILTER: Must be Active, Approved, and Not Expired
          if (!ann || !ann._id) return false;
          if (ann.status !== 'Active') return false;
          if (ann.approvalStatus !== 'Approved') return false;
          
          // ✅ Expiry Check
          if (ann.expiresAt && DateTime.fromISO(ann.expiresAt) <= now) return false;
          
          return true;
        })
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
          // ✅ ADDED: Ensure category field exists
          category: announcement.category || "Department",
          // ✅ PRESERVE ATTACHMENT STRUCTURE FOR CLOUDINARY
          attachment: announcement.attachment ? {
            url: announcement.attachment.url,
            fileName: announcement.attachment.fileName || announcement.attachment.name,
            type: announcement.attachment.type || getFileTypeFromUrl(announcement.attachment.url)
          } : null,
        }))
        .map(processAnnouncementData)
        .map(announcement => ({
          ...announcement,
          // ✅ ADDED: Initialize real-time time data
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

  // ✅ UPDATED: File handling para sa Cloudinary URLs - PDF direct sa browser
  const handleFileDownload = (file) => {
    try {
      // ✅ BAGONG LOGIC PARA SA CLOUDINARY
      if (file && file.url) {
        // Para sa PDF files, buksan direkt sa bagong tab ng browser
        if (file.type === 'application/pdf' || file.url.toLowerCase().includes('.pdf')) {
          window.open(file.url, '_blank');
          return;
        }
        
        // Para sa ibang file types, download tulad ng dati
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.fileName || file.name || 'attachment';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (file && file.data) {
        // Fallback para sa lumang Base64 format
        const base64Data = file.data.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('❌ Invalid file format:', file);
      }
    } catch (error) {
      console.error('❌ Error downloading file:', error);
    }
  };

  // ✅ UPDATED: File viewing para sa images at iba pang previewable files
  const handleFileView = (file) => {
    // ✅ BAGONG LOGIC: Siguraduhin na may tamang structure ang file object
    if (!file) {
      console.error('❌ No file provided');
      return;
    }

    // ✅ Kung ang file ay attachment object mula sa Cloudinary
    if (file.url && (file.fileName || file.name)) {
      // Check kung image file - ipapakita sa modal
      const fileType = file.type || getFileTypeFromUrl(file.url);
      const fileName = file.fileName || file.name;
      
      if (fileType.includes('image')) {
        // Para sa images, buksan sa FileViewModal
        setFileViewModal({ 
          isOpen: true, 
          file: {
            url: file.url,
            name: fileName,
            type: fileType
          }
        });
      } else if (fileType === 'application/pdf') {
        // Para sa PDF, buksan direkt sa bagong tab ng browser
        window.open(file.url, '_blank');
      } else {
        // Para sa ibang file types, download na lang
        handleFileDownload(file);
      }
    } 
    // ✅ Fallback para sa lumang format
    else if (file.data) {
      setFileViewModal({ isOpen: true, file });
    } 
    else {
      console.error('❌ Unsupported file format:', file);
      alert('Cannot preview this file format');
    }
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

  // ✅ UPDATED: Categorize announcements with General category
  const categorizeAnnouncements = (announcements) => {
    const general = [];
    const accounting = [];
    const compliance = [];
    const hr = [];
    const technical = [];

    announcements.forEach((announcement) => {
      // ✅ CHECK GENERAL CATEGORY FIRST (from the category field)
      if (announcement.category === "General") {
        general.push(announcement);
        return;
      }

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

    return { general, accounting, compliance, technical, hr };
  };

  const {accounting, compliance, technical, hr } =
    categorizeAnnouncements(announcements);

  // FIXED: Search across ALL announcements and then categorize
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

  // ✅ UPDATED: Get filtered announcements by category from the already filtered list
  const getFilteredAnnouncementsByCategory = (category) => {
    const { general: filteredGeneral, accounting: filteredAccounting, compliance: filteredCompliance, technical: filteredTechnical, hr: filteredHr } = 
      categorizeAnnouncements(filteredAnnouncements);

    switch (category) {
      case "general":
        return filteredGeneral;
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

  // ✅ UPDATED: Check if any category has announcements after filtering
  const hasFilteredAnnouncements = 
    getFilteredAnnouncementsByCategory("general").length > 0 ||
    getFilteredAnnouncementsByCategory("technical").length > 0 ||
    getFilteredAnnouncementsByCategory("compliance").length > 0 ||
    getFilteredAnnouncementsByCategory("accounting").length > 0 ||
    getFilteredAnnouncementsByCategory("hr").length > 0;

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

      {/* Pin Limit Toast - RESPONSIVE */}
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

      {/* Main Content - FIXED RESPONSIVE LAYOUT */}
      <div className={`flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 min-h-screen ${isMobileMenuOpen ? 'lg:flex-row' : ''}`}>
        
        {/* Left Column - Main Content */}
        <div className="flex-1 min-w-0 order-1 lg:order-1 space-y-4 sm:space-y-6 overflow-hidden">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2">
               Welcome back, {currentUser.name}!
            </h1>
             <p className="text-sm sm:text-base lg:text-lg opacity-90">
                  Stay updated with the latest announcements
            </p>

          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg">
            <img
              className="w-full h-24 xs:h-28 sm:h-32 md:h-36 lg:h-44 xl:h-52 2xl:h-60 object-cover"
              src={telexcover}
              alt="Dashboard Cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
              <div className="text-white p-4 sm:p-6 lg:p-8">
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="min-w-0">
              <PaydayCard />
            </div>
            <div className="min-w-0">
              <PunctualityChart />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white via-gray-50/80 to-blue-50/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-200/60 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-2 sm:top-4 lg:top-6 right-2 sm:right-4 lg:right-6 w-8 sm:w-12 lg:w-16 xl:w-24 h-8 sm:h-12 lg:h-16 xl:h-24 bg-gradient-to-r from-blue-400/15 to-purple-400/10 rounded-full blur-lg sm:blur-xl lg:blur-2xl animate-pulse"></div>
              <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-2 sm:left-4 lg:left-8 w-6 sm:w-8 lg:w-12 xl:w-20 h-6 sm:h-8 lg:h-12 xl:h-20 bg-gradient-to-r from-green-400/10 to-teal-400/15 rounded-full blur-md sm:blur-lg lg:blur-xl animate-bounce"></div>
            </div>

            <div className="relative z-10">
              {/* Header Section - RESPONSIVE */}
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg">
                      <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl">📢</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent leading-tight">
                        Department Announcements
                      </h3>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-500 font-medium mt-1">
                        Latest updates from different departments
                      </p>
                      {/* ✅ ADDED: REAL-TIME UPDATE INDICATOR */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          Real-time updates
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Approved Only
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
                      <Pin className="w-3 h-3 sm:w-4 sm:h-4" />
                      Max {MAX_PINNED_PER_DEPARTMENT}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </span>
                  </div>
                </div>

                {/* Search Section - IMPROVED */}
                <div className="mb-4 sm:mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search all announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl sm:rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
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

                <div className="w-16 sm:w-20 lg:w-24 xl:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
              </div>

              {/* Loading State - RESPONSIVE */}
              {isLoadingAnnouncements ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 lg:py-16">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mb-4"></div>
                  <span className="text-sm sm:text-base lg:text-lg text-gray-600">
                    Loading announcements...
                  </span>
                </div>
              ) : hasFilteredAnnouncements ? (
                <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-h-[60vh] lg:max-h-none overflow-y-auto pr-2 -mr-2 lg:mr-0 lg:overflow-visible">
                  
                  {/* ✅ ADDED: GENERAL ANNOUNCEMENTS SECTION */}
                  {getFilteredAnnouncementsByCategory("general").length > 0 && (
                    <div className="bg-purple-50/70 border border-purple-200/60 rounded-xl p-4 sm:p-6 lg:p-8 shadow-md">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base sm:text-lg lg:text-xl text-purple-800">
                              General Announcements
                            </h4>
                            <p className="text-xs sm:text-sm text-purple-600">
                              Company-wide updates for everyone
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {getFilteredAnnouncementsByCategory("general").length} announcements
                        </span>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        {getFilteredAnnouncementsByCategory("general").map((announcement) => (
                          <div
                            key={announcement._id}
                            className="bg-white rounded-xl p-3 sm:p-4 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors truncate">
                                  {announcement.title}
                                </h5>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <User className="w-3 h-3" />
                                    {announcement.postedBy}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    {announcement.realTimeFormatted}
                                  </span>
                                  <span className="text-xs text-blue-600">
                                    {announcement.timeAgo}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleTogglePin(announcement)}
                                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ml-2 ${
                                  announcement.isPinned
                                    ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-yellow-500"
                                }`}
                                title={announcement.isPinned ? "Unpin announcement" : "Pin announcement"}
                              >
                                <Pin className={`w-3 h-3 ${announcement.isPinned ? "fill-current" : ""}`} />
                              </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {announcement.agenda}
                            </p>
                            
                            {/* ✅ ADDED: Approved by section for General announcements */}
                            {announcement.approvedBy && (
                              <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
                                <CheckCircle className="w-3 h-3" />
                                <span>Approved by: {announcement.approvedBy}</span>
                              </div>
                            )}
                            
                            {/* ✅ ADDED: Expiry warning for General announcements */}
                            {announcement.expiresAt && (
                              <div className={`flex items-center gap-1 text-xs mb-2 ${
                                announcement.isExpired ? 'text-red-600' : 'text-amber-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {announcement.isExpired ? 'Expired' : 'Expires'} 
                                  {!announcement.isExpired && `: ${DateTime.fromISO(announcement.expiresAt).toRelative()}`}
                                </span>
                              </div>
                            )}
                            
                            {/* ✅ ADDED: File Attachment Display */}
                            {announcement.attachment && (
                              <FileAttachment
                                file={announcement.attachment}
                                onDownload={handleFileDownload}
                                onView={handleFileView}
                              />
                            )}
                            
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleReadMore(announcement)}
                                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-medium"
                                >
                                  Read more →
                                </button>
                                <button
                                  onClick={() => handleLike(announcement._id, currentUser._id)}
                                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
                                >
                                  <Heart className={`w-3 h-3 ${hasLiked(announcement._id) ? "fill-current text-red-500" : ""}`} />
                                  <span>{announcement.totalAcknowledgements || 0}</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Eye className="w-3 h-3" />
                                <span>{announcement.totalViews || 0} views</span>
                              </div>
                            </div>
                            
                            {/* ✅ ADDED: Priority badge for General announcements */}
                            {announcement.priority && (
                              <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                announcement.priority === "High" 
                                  ? "bg-red-100 text-red-700 border-red-200" 
                                  : announcement.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : "bg-green-100 text-green-700 border-green-200"
                              }`}>
                                {announcement.priority} Priority
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TECHNICAL */}
                  {getFilteredAnnouncementsByCategory("technical").length > 0 && (
                    <DepartmentAnnouncementSection
                      title="Technical Announcements"
                      announcements={getFilteredAnnouncementsByCategory("technical")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(technical)}
                      showPinnedOnly={technicalPinned}
                      onTogglePinnedView={() => setTechnicalPinned(!technicalPinned)}
                      pinnedCount={getFilteredAnnouncementsByCategory("technical").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />
                  )}

                  {/* COMPLIANCE */}
                  {getFilteredAnnouncementsByCategory("compliance").length > 0 && (
                    <DepartmentAnnouncementSection
                      title="Compliance Announcements"
                      announcements={getFilteredAnnouncementsByCategory("compliance")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(compliance)}
                      showPinnedOnly={compliancePinned}
                      onTogglePinnedView={() => setCompliancePinned(!compliancePinned)}
                      pinnedCount={getFilteredAnnouncementsByCategory("compliance").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />
                  )}

                  {/* ACCOUNTING */}
                  {getFilteredAnnouncementsByCategory("accounting").length > 0 && (
                    <DepartmentAnnouncementSection
                      title="Accounting Announcements"
                      announcements={getFilteredAnnouncementsByCategory("accounting")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(accounting)}
                      showPinnedOnly={accountingPinned}
                      onTogglePinnedView={() => setAccountingPinned(!accountingPinned)}
                      pinnedCount={getFilteredAnnouncementsByCategory("accounting").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />
                  )}

                  {/* HR & ADMIN */}
                  {getFilteredAnnouncementsByCategory("hr").length > 0 && (
                    <DepartmentAnnouncementSection
                      title="HR & Admin Announcements"
                      announcements={getFilteredAnnouncementsByCategory("hr")}
                      onReadMore={handleReadMore}
                      onFileDownload={handleFileDownload}
                      onFileView={handleFileView}
                      onTogglePin={handleTogglePin}
                      canPinMore={canPinMoreInDepartment(hr)}
                      showPinnedOnly={hrPinned}
                      onTogglePinnedView={() => setHrPinned(!hrPinned)}
                      pinnedCount={getFilteredAnnouncementsByCategory("hr").filter((a) => a.isPinned).length}
                      maxPinnedLimit={MAX_PINNED_PER_DEPARTMENT}
                      onLike={handleLike}
                      hasLiked={hasLiked}
                      currentUserId={currentUser?._id} 
                      getViewCount={getViewCount}
                      getLikeCount={getLikeCount}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 lg:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-600 mb-2 sm:mb-3">
                    {searchTerm ? "No Matching Announcements" : "No Announcements Found"}
                  </h4>
                  <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto px-4">
                    {searchTerm
                      ? "No announcements match your search criteria. Try different keywords."
                      : "There are no active announcements at the moment."
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {/* Footer Section - RESPONSIVE */}
              <div className="mt-6 sm:mt-8 lg:mt-10 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200/60">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">Real-time updates enabled</span>
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                      Total: {filteredAnnouncements.length}
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

        {/* Right Column - Daily Records Card - FIXED RESPONSIVE */}
        <div className={`w-full lg:w-80 xl:w-96 2xl:w-[28rem] p-2 sm:p-3 lg:p-4 flex-shrink-0 order-2 lg:order-2 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-4">
            <DailyRecordsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;