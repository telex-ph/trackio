import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  Bell,
  User,
  FileText,
  Edit,
  Paperclip,
  Eye,
  Heart,
  Filter,
  Search,
  RotateCcw,
  CheckCircle,
  Shield,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  Target,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
} from "lucide-react";
import { DateTime } from "luxon";
import { useStore } from "../../store/useStore";
import api from "../../utils/axios";
import socket from "../../utils/socket";

import Notification from "../../components/announcement/Notification";
import FileAttachment from "../../components/announcement/FileAttachment";

import ConfirmationModal from "../../components/modals/ConfirmationModal";
import AnnouncementPreviewModal from "../../components/announcement/AnnouncementPreview";
import ViewsModal from "../../components/modals/ViewsModal";
import LikesModal from "../../components/modals/LikesModal";
import FileViewModal from "../../components/modals/FileViewModal";

import Roles from "../../constants/roles";

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // Default to 'pending' tab

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false); // For approval loading state
  const [isCancellingApproval, setIsCancellingApproval] = useState(false); // For cancellation loading state

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
  const [selectedAnnouncementViews, setSelectedAnnouncementViews] = useState(
    []
  );
  const [selectedAnnouncementLikes, setSelectedAnnouncementLikes] = useState(
    []
  );
  const [selectedAnnouncementTitle, setSelectedAnnouncementTitle] =
    useState("");
  const [itemToCancel, setItemToCancel] = useState(null);
  const [itemToRepost, setItemToRepost] = useState(null);
  const [fileViewModal, setFileViewModal] = useState({
    isOpen: false,
    file: null,
  });

  // States for edit flow
  const [isCurrentlyEditing, setIsCurrentlyEditing] = useState(false);
  const [shouldStayOnPending, setShouldStayOnPending] = useState(false);
  const [lastEditedId, setLastEditedId] = useState(null);

  // State for pending approval action
  const [pendingApprovalAction, setPendingApprovalAction] = useState({
    isOpen: false,
    announcementId: null,
    action: null,
    announcementData: null,
  });

  // State for view details
  const [viewDetailsAnnouncement, setViewDetailsAnnouncement] = useState(null);

  // Analytics states
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsFilter, setAnalyticsFilter] = useState({
    timeRange: "all",
    category: "all",
    priority: "all",
    sortBy: "views",
    sortOrder: "desc",
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const user = useStore((state) => state.user);

  // Get user's full name
  const getUserFullName = useCallback(() => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`.trim();
    }
    if (user && user.firstName) {
      return user.firstName.trim();
    }
    if (user && user.lastName) {
      return user.lastName.trim();
    }
    if (user && user.name) {
      return user.name.trim();
    }
    return "Admin User";
  }, [user]);

  // Check if current user can approve announcements
  const canCurrentUserApprove = useMemo(() => {
    return (
      user?.role === Roles.ADMIN_HR_HEAD || user?.role === Roles.COMPLIANCE_HEAD
    );
  }, [user?.role]);

  // Check if current user can auto-post (no approval needed)
  const canAutoPost = useMemo(() => {
    return (
      user?.role === Roles.ADMIN_HR_HEAD || user?.role === Roles.COMPLIANCE_HEAD
    );
  }, [user?.role]);

  // Real-time current date/time
  const [currentDateTime, setCurrentDateTime] = useState(() =>
    DateTime.local()
  );

  // Update current time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(DateTime.local());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Real-time time display function
  const getCurrentDateTime = useCallback(() => {
    const now = DateTime.local();
    return {
      dateInput: now.toISODate(),
      timeInput: now.toFormat("HH:mm"),
      displayTime: now.toFormat("HH:mm:ss"),
      displayDate: now.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
    };
  }, []);

  // Initialize form data with current date/time
  const [formData, setFormData] = useState(() => {
    const currentDateTime = getCurrentDateTime();
    const userName = getUserFullName();

    return {
      title: "",
      dateTime: "",
      postedBy: userName,
      agenda: "",
      priority: "Medium",
      category: "Department",
      duration: "1w",
      dateInput: currentDateTime.dateInput,
      timeInput: currentDateTime.timeInput,
    };
  });

  // Auto-update form time for NEW announcements only
  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        dateInput: getCurrentDateTime().dateInput,
        timeInput: getCurrentDateTime().timeInput,
      }));
    }
  }, [currentDateTime, isEditMode, getCurrentDateTime]);

  // Fetch announcements
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching announcements from database...");
      const response = await api.get("/announcements");

      if (response.data && Array.isArray(response.data)) {
        console.log(
          "✅ Successfully loaded",
          response.data.length,
          "announcements"
        );

        const now = DateTime.local();
        const processedAnnouncements = response.data.map((announcement) => {
          const expiresAt = announcement.expiresAt
            ? DateTime.fromISO(announcement.expiresAt)
            : null;
          const isExpired = expiresAt && expiresAt <= now;

          let actualStatus = announcement.status;
          if (announcement.approvalStatus === "Pending") {
            actualStatus = "Pending";
          } else if (announcement.status === "Active" && isExpired) {
            actualStatus = "Expired";
          } else if (announcement.approvalStatus === "Cancelled") {
            actualStatus = "Inactive";
          }

          return {
            ...announcement,
            originalDateTime: announcement.dateTime,
            isExpired: isExpired,
            actualStatus: actualStatus,
            frozenTimeAgo:
              announcement.status === "Inactive" ||
              announcement.approvalStatus === "Cancelled"
                ? formatTimeAgo(
                    announcement.cancelledAt || announcement.dateTime
                  )
                : null,
          };
        });

        const sortedAll = processedAnnouncements.sort((a, b) => {
          const statusOrder = {
            Pending: 4,
            Active: 3,
            Expired: 2,
            Inactive: 1,
          };

          if (statusOrder[b.actualStatus] !== statusOrder[a.actualStatus]) {
            return statusOrder[b.actualStatus] - statusOrder[a.actualStatus];
          }

          const priorityA =
            a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB =
            b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }

          return (
            DateTime.fromISO(b.dateTime).toMillis() -
            DateTime.fromISO(a.dateTime).toMillis()
          );
        });

        setAnnouncements(sortedAll);
        console.log("📊 Announcements loaded:", {
          total: sortedAll.length,
          pending: sortedAll.filter((a) => a.actualStatus === "Pending").length,
          active: sortedAll.filter((a) => a.actualStatus === "Active").length,
          expired: sortedAll.filter((a) => a.actualStatus === "Expired").length,
          inactive: sortedAll.filter((a) => a.actualStatus === "Inactive")
            .length,
        });
      } else {
        console.warn("⚠️ No data received from API");
        setAnnouncements([]);
      }
    } catch (err) {
      console.error("❌ API Error:", err);

      if (err.response?.status >= 400 || err.message?.includes("Network")) {
        setError("Failed to load announcements. Using real-time data only.");
      } else {
        console.log("⚠️ Non-critical error, continuing...");
      }
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) {
      console.log("❌ Socket not available, using API only");
      fetchAnnouncements();
      return;
    }

    console.log("🔄 Setting up socket listeners for admin...");

    let dataLoaded = false;

    const handleInitialData = (socketAnnouncements) => {
      console.log(
        "📥 Received initial admin data via socket:",
        socketAnnouncements?.length
      );

      if (
        Array.isArray(socketAnnouncements) &&
        socketAnnouncements.length > 0
      ) {
        const now = DateTime.local();
        const processedAnnouncements = socketAnnouncements.map(
          (announcement) => {
            const expiresAt = announcement.expiresAt
              ? DateTime.fromISO(announcement.expiresAt)
              : null;
            const isExpired = expiresAt && expiresAt <= now;

            let actualStatus = announcement.status;
            if (announcement.approvalStatus === "Pending") {
              actualStatus = "Pending";
            } else if (announcement.status === "Active" && isExpired) {
              actualStatus = "Expired";
            } else if (announcement.approvalStatus === "Cancelled") {
              actualStatus = "Inactive";
            }

            return {
              ...announcement,
              originalDateTime: announcement.dateTime,
              isExpired: isExpired,
              actualStatus: actualStatus,
              frozenTimeAgo:
                announcement.status === "Inactive" ||
                announcement.approvalStatus === "Cancelled"
                  ? formatTimeAgo(
                      announcement.cancelledAt || announcement.dateTime
                    )
                  : null,
            };
          }
        );

        const sortedAll = processedAnnouncements.sort((a, b) => {
          const statusOrder = {
            Pending: 4,
            Active: 3,
            Expired: 2,
            Inactive: 1,
          };

          if (statusOrder[b.actualStatus] !== statusOrder[a.actualStatus]) {
            return statusOrder[b.actualStatus] - statusOrder[a.actualStatus];
          }

          const priorityA =
            a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB =
            b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return (
            DateTime.fromISO(b.dateTime).toMillis() -
            DateTime.fromISO(a.dateTime).toMillis()
          );
        });

        setAnnouncements(sortedAll);
        setIsLoading(false);
        dataLoaded = true;
        console.log("✅ Socket data loaded successfully");
      }
    };

    const handleAdminUpdate = (detailedStats) => {
      console.log("📈 Real-time admin stats update:", detailedStats);

      setAnnouncements((prev) =>
        prev.map((ann) => {
          if (ann._id === detailedStats.announcementId) {
            return {
              ...ann,
              views: detailedStats.viewedBy || ann.views,
              acknowledgements: detailedStats.likedBy || ann.acknowledgements,
            };
          }
          return ann;
        })
      );
    };

    const handleNewAnnouncement = (newAnnouncement) => {
      console.log("🆕 New announcement received via socket:", newAnnouncement);

      const now = DateTime.local();
      const expiresAt = newAnnouncement.expiresAt
        ? DateTime.fromISO(newAnnouncement.expiresAt)
        : null;
      const isExpired = expiresAt && expiresAt <= now;

      let actualStatus = newAnnouncement.status;
      if (newAnnouncement.approvalStatus === "Pending") {
        actualStatus = "Pending";
      } else if (newAnnouncement.status === "Active" && isExpired) {
        actualStatus = "Expired";
      } else if (newAnnouncement.approvalStatus === "Cancelled") {
        actualStatus = "Inactive";
      }

      const processedAnnouncement = {
        ...newAnnouncement,
        originalDateTime: newAnnouncement.dateTime,
        isExpired: isExpired,
        actualStatus: actualStatus,
        frozenTimeAgo: null,
      };

      setAnnouncements((prev) => {
        const exists = prev.find((a) => a._id === processedAnnouncement._id);
        if (exists)
          return prev.map((a) =>
            a._id === processedAnnouncement._id ? processedAnnouncement : a
          );

        return [processedAnnouncement, ...prev].sort((a, b) => {
          const statusOrder = {
            Pending: 4,
            Active: 3,
            Expired: 2,
            Inactive: 1,
          };

          if (statusOrder[b.actualStatus] !== statusOrder[a.actualStatus]) {
            return statusOrder[b.actualStatus] - statusOrder[a.actualStatus];
          }

          const priorityA =
            a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB =
            b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return (
            DateTime.fromISO(b.dateTime).toMillis() -
            DateTime.fromISO(a.dateTime).toMillis()
          );
        });
      });

      if (newAnnouncement._id === lastEditedId) {
        console.log("📌 This is our edited announcement, keeping tab as is");
        return;
      }

      if (!shouldStayOnPending) {
        if (newAnnouncement.approvalStatus === "Pending") {
          showNotification("Announcement submitted for approval!", "success");
          setActiveTab("pending");
        } else {
          showNotification("New announcement posted!", "success");
          setActiveTab("active");
        }
      }
    };

    const handleAnnouncementUpdated = (updatedAnnouncement) => {
      console.log("📝 Announcement updated via socket");

      const now = DateTime.local();
      const expiresAt = updatedAnnouncement.expiresAt
        ? DateTime.fromISO(updatedAnnouncement.expiresAt)
        : null;
      const isExpired = expiresAt && expiresAt <= now;

      let actualStatus = updatedAnnouncement.status;
      if (updatedAnnouncement.approvalStatus === "Pending") {
        actualStatus = "Pending";
      } else if (updatedAnnouncement.status === "Active" && isExpired) {
        actualStatus = "Expired";
      } else if (updatedAnnouncement.approvalStatus === "Cancelled") {
        actualStatus = "Inactive";
      }

      const processedAnnouncement = {
        ...updatedAnnouncement,
        originalDateTime:
          updatedAnnouncement.originalDateTime || updatedAnnouncement.dateTime,
        isExpired: isExpired,
        actualStatus: actualStatus,
        frozenTimeAgo:
          updatedAnnouncement.status === "Inactive" ||
          updatedAnnouncement.approvalStatus === "Cancelled"
            ? formatTimeAgo(
                updatedAnnouncement.cancelledAt || updatedAnnouncement.dateTime
              )
            : null,
      };

      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === processedAnnouncement._id ? processedAnnouncement : ann
        )
      );
    };

    const handleAnnouncementCancelled = (data) => {
      console.log("🔴 Cancellation confirmed via socket:", data.announcementId);

      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === data.announcementId
            ? {
                ...ann,
                status: "Inactive",
                approvalStatus: "Approved",
                actualStatus: "Inactive",
                cancelledBy: data.cancelledBy,
                cancelledAt: data.cancelledAt || new Date().toISOString(),
                frozenTimeAgo: formatTimeAgo(
                  data.cancelledAt || new Date().toISOString()
                ),
                views: [],
                acknowledgements: [],
              }
            : ann
        )
      );
    };

    const handleAnnouncementReposted = (repostedAnnouncement) => {
      console.log("🟢 Repost confirmed via socket:", repostedAnnouncement._id);

      const currentTime = new Date().toISOString();
      const now = DateTime.local();
      const expiresAt = repostedAnnouncement.expiresAt
        ? DateTime.fromISO(repostedAnnouncement.expiresAt)
        : null;
      const isExpired = expiresAt && expiresAt <= now;

      const processedAnnouncement = {
        ...repostedAnnouncement,
        status: "Active",
        approvalStatus: "Approved",
        actualStatus: "Active",
        dateTime: currentTime,
        originalDateTime: currentTime,
        isExpired: isExpired,
        frozenTimeAgo: null,
        cancelledAt: null,
        cancelledBy: null,
        views: [],
        acknowledgements: [],
      };

      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === processedAnnouncement._id ? processedAnnouncement : ann
        )
      );
    };

    const handleAnnouncementApproved = (approvedAnnouncement) => {
      console.log(
        "✅ Approval confirmed via socket:",
        approvedAnnouncement._id
      );

      const now = DateTime.local();
      const expiresAt = approvedAnnouncement.expiresAt
        ? DateTime.fromISO(approvedAnnouncement.expiresAt)
        : null;
      const isExpired = expiresAt && expiresAt <= now;

      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === approvedAnnouncement._id
            ? {
                ...ann,
                approvalStatus: "Approved",
                status: "Active",
                actualStatus: "Active",
                approvedBy: approvedAnnouncement.approvedBy,
                dateTime:
                  approvedAnnouncement.dateTime || new Date().toISOString(),
                originalDateTime:
                  approvedAnnouncement.dateTime || new Date().toISOString(),
                isExpired: isExpired,
                frozenTimeAgo: null,
                views: [],
                acknowledgements: [],
              }
            : ann
        )
      );
    };

    const handleApprovalCancelled = (cancelledAnnouncement) => {
      console.log(
        "❌ Approval cancellation confirmed via socket:",
        cancelledAnnouncement._id
      );

      const now = DateTime.local();
      const expiresAt = cancelledAnnouncement.expiresAt
        ? DateTime.fromISO(cancelledAnnouncement.expiresAt)
        : null;
      const isExpired = expiresAt && expiresAt <= now;

      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === cancelledAnnouncement._id
            ? {
                ...ann,
                approvalStatus: "Cancelled",
                actualStatus: "Inactive",
                cancelledBy: cancelledAnnouncement.cancelledBy,
                cancelledAt: cancelledAnnouncement.cancelledAt,
                frozenTimeAgo: formatTimeAgo(cancelledAnnouncement.cancelledAt),
                isExpired: isExpired,
                views: [],
                acknowledgements: [],
              }
            : ann
        )
      );
    };

    // Register event listeners
    socket.on("initialAdminData", handleInitialData);
    socket.on("adminAnnouncementUpdate", handleAdminUpdate);
    socket.on("newAnnouncement", handleNewAnnouncement);
    socket.on("announcementUpdated", handleAnnouncementUpdated);
    socket.on("announcementCancelled", handleAnnouncementCancelled);
    socket.on("announcementReposted", handleAnnouncementReposted);
    socket.on("announcementApproved", handleAnnouncementApproved);
    socket.on("approvalCancelled", handleApprovalCancelled);

    // Request initial data via socket
    socket.emit("getAdminData");

    // Fallback to API if socket doesn't respond in 3 seconds
    const fallbackTimeout = setTimeout(() => {
      if (!dataLoaded) {
        console.log("⏰ Socket timeout, falling back to API...");
        fetchAnnouncements();
      }
    }, 3000);

    // Cleanup
    return () => {
      clearTimeout(fallbackTimeout);
      socket.off("initialAdminData", handleInitialData);
      socket.off("adminAnnouncementUpdate", handleAdminUpdate);
      socket.off("newAnnouncement", handleNewAnnouncement);
      socket.off("announcementUpdated", handleAnnouncementUpdated);
      socket.off("announcementCancelled", handleAnnouncementCancelled);
      socket.off("announcementReposted", handleAnnouncementReposted);
      socket.off("announcementApproved", handleAnnouncementApproved);
      socket.off("approvalCancelled", handleApprovalCancelled);
    };
  }, [fetchAnnouncements, lastEditedId, shouldStayOnPending]);

  // Update form with user's name
  useEffect(() => {
    const userName = getUserFullName();
    setFormData((prev) => ({
      ...prev,
      postedBy: userName,
    }));
  }, [getUserFullName]);

  // ✅ FIXED: ANALYTICS CALCULATION FUNCTION - TYPO CORRECTED
  const calculateAnalytics = useCallback(() => {
    if (!announcements || announcements.length === 0) return null;

    const now = DateTime.local();
    let filteredAnnouncements = [...announcements];

    // Apply time range filter
    if (analyticsFilter.timeRange !== "all") {
      const cutoffDate = now.minus(
        analyticsFilter.timeRange === "24h"
          ? { hours: 24 }
          : analyticsFilter.timeRange === "7d"
          ? { days: 7 }
          : { days: 30 }
      );

      filteredAnnouncements = filteredAnnouncements.filter((a) => {
        const announcementDate = DateTime.fromISO(a.dateTime || a.createdAt);
        return announcementDate >= cutoffDate;
      });
    }

    // Apply category filter
    if (analyticsFilter.category !== "all") {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.category === analyticsFilter.category
      );
    }

    // Apply priority filter
    if (analyticsFilter.priority !== "all") {
      filteredAnnouncements = filteredAnnouncements.filter(
        (a) => a.priority === analyticsFilter.priority
      );
    }

    // ✅ FIXED: Changed from 'filtertedAnnouncements' to 'filteredAnnouncements'
    if (filteredAnnouncements.length === 0) return null;

    // Calculate statistics
    const stats = {
      totalAnnouncements: filteredAnnouncements.length,
      totalViews: filteredAnnouncements.reduce(
        (sum, a) => sum + (Array.isArray(a.views) ? a.views.length : 0),
        0
      ),
      totalLikes: filteredAnnouncements.reduce(
        (sum, a) =>
          sum +
          (Array.isArray(a.acknowledgements) ? a.acknowledgements.length : 0),
        0
      ),
      averageViews: 0,
      averageLikes: 0,
      averageEngagement: 0,
      highestPerforming: null,
      lowestPerforming: null,
      categoryBreakdown: {},
      priorityBreakdown: {},
      timelineData: [],
      announcementsWithStats: [],
    };

    // Calculate averages
    stats.averageViews = stats.totalViews / stats.totalAnnouncements;
    stats.averageLikes = stats.totalLikes / stats.totalAnnouncements;
    stats.averageEngagement =
      ((stats.totalLikes + stats.totalViews) / (stats.totalAnnouncements * 2)) *
      100;

    // Prepare individual announcement stats
    filteredAnnouncements.forEach((a) => {
      const views = Array.isArray(a.views) ? a.views.length : 0;
      const likes = Array.isArray(a.acknowledgements)
        ? a.acknowledgements.length
        : 0;
      const engagement = views > 0 ? (likes / views) * 100 : 0;

      // Update category breakdown
      stats.categoryBreakdown[a.category] =
        (stats.categoryBreakdown[a.category] || 0) + 1;

      // Update priority breakdown
      stats.priorityBreakdown[a.priority] =
        (stats.priorityBreakdown[a.priority] || 0) + 1;

      // Add to timeline data (group by date)
      const date = DateTime.fromISO(a.dateTime).toFormat("yyyy-MM-dd");
      const existingDate = stats.timelineData.find((d) => d.date === date);
      if (existingDate) {
        existingDate.views += views;
        existingDate.likes += likes;
      } else {
        stats.timelineData.push({
          date,
          views,
          likes,
          announcements: 1,
        });
      }

      // Store individual stats
      stats.announcementsWithStats.push({
        ...a,
        views,
        likes,
        engagement,
        calculatedEngagement: engagement,
      });

      // Find highest and lowest performing
      const totalInteraction = views + likes;
      if (
        !stats.highestPerforming ||
        totalInteraction > stats.highestPerforming.totalInteraction
      ) {
        stats.highestPerforming = {
          announcement: a,
          views,
          likes,
          totalInteraction,
        };
      }
      if (
        !stats.lowestPerforming ||
        totalInteraction < stats.lowestPerforming.totalInteraction
      ) {
        stats.lowestPerforming = {
          announcement: a,
          views,
          likes,
          totalInteraction,
        };
      }
    });

    // Sort timeline data
    stats.timelineData.sort((a, b) => a.date.localeCompare(b.date));

    // Sort announcements based on selected sort criteria
    stats.announcementsWithStats.sort((a, b) => {
      const order = analyticsFilter.sortOrder === "desc" ? -1 : 1;

      switch (analyticsFilter.sortBy) {
        case "views":
          return (b.views - a.views) * order;
        case "likes":
          return (b.likes - a.likes) * order;
        case "engagement":
          return (b.calculatedEngagement - a.calculatedEngagement) * order;
        case "date":
          return (
            (DateTime.fromISO(b.dateTime).toMillis() -
              DateTime.fromISO(a.dateTime).toMillis()) *
            order
          );
        default:
          return 0;
      }
    });

    return stats;
  }, [announcements, analyticsFilter]);

  // Load analytics when announcements change
  useEffect(() => {
    if (showAnalytics && announcements.length > 0) {
      try {
        const calculated = calculateAnalytics();
        setAnalyticsData(calculated);
      } catch (error) {
        console.error("Error calculating analytics:", error);
        setAnalyticsData(null);
        showNotification("Failed to load analytics data", "error");
      }
    }
  }, [showAnalytics, announcements, analyticsFilter, calculateAnalytics]);

  // Export analytics to CSV
  const exportAnalyticsToCSV = () => {
    if (!analyticsData) return;

    const headers = [
      "Title",
      "Category",
      "Priority",
      "Status",
      "Posted Date",
      "Views",
      "Likes",
      "Engagement Rate",
      "Posted By",
    ];

    const rows = analyticsData.announcementsWithStats.map((a) => [
      a.title,
      a.category,
      a.priority,
      a.actualStatus,
      DateTime.fromISO(a.dateTime).toFormat("yyyy-MM-dd HH:mm"),
      a.views,
      a.likes,
      `${a.calculatedEngagement.toFixed(2)}%`,
      a.postedBy,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `announcement-analytics-${DateTime.local().toFormat(
      "yyyy-MM-dd"
    )}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Analytics exported successfully!", "success");
    setShowExportModal(false);
  };

  // Reset analytics filters
  const resetAnalyticsFilters = () => {
    setAnalyticsFilter({
      timeRange: "all",
      category: "all",
      priority: "all",
      sortBy: "views",
      sortOrder: "desc",
    });
  };

  // Filter announcements for display
  const filteredAnnouncements = useMemo(() => {
    const filtered = announcements.filter((announcement) => {
      const searchMatch =
        searchTerm === "" ||
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.postedBy?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) return false;

      if (activeTab === "pending") {
        return announcement.actualStatus === "Pending";
      } else if (activeTab === "active") {
        return announcement.actualStatus === "Active";
      } else {
        return (
          announcement.actualStatus === "Expired" ||
          announcement.actualStatus === "Inactive"
        );
      }
    });

    return filtered.sort((a, b) => {
      if (activeTab === "pending") {
        return (
          DateTime.fromISO(a.createdAt || a.dateTime).toMillis() -
          DateTime.fromISO(b.createdAt || b.dateTime).toMillis()
        );
      } else {
        const priorityA =
          a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
        const priorityB =
          b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

        if (priorityB !== priorityA) {
          return priorityB - priorityA;
        }
        return (
          DateTime.fromISO(b.dateTime).toMillis() -
          DateTime.fromISO(a.dateTime).toMillis()
        );
      }
    });
  }, [announcements, searchTerm, activeTab]);

  // Calculate counts
  const activeCount = useMemo(
    () => announcements.filter((a) => a.actualStatus === "Active").length,
    [announcements]
  );

  const inactiveCount = useMemo(
    () =>
      announcements.filter(
        (a) => a.actualStatus === "Inactive" || a.actualStatus === "Expired"
      ).length,
    [announcements]
  );

  const pendingCount = useMemo(
    () => announcements.filter((a) => a.actualStatus === "Pending").length,
    [announcements]
  );

  const clearFilters = () => {
    setSearchTerm("");
  };

  const today = new Date().toISOString().split("T")[0];

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });

    setTimeout(() => {
      setNotification({ message: "", type, isVisible: false });
    }, 5000);
  };

  const handleViewDetails = async (announcement) => {
    try {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcement._id ? { ...a, isLoadingViews: true } : a
        )
      );

      const viewsData = Array.isArray(announcement.views)
        ? announcement.views
        : [];
      setSelectedAnnouncementViews(viewsData);
      setSelectedAnnouncementTitle(announcement.title);
      setIsViewsModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching view details:", error);
      showNotification("Failed to load view details", "error");
    } finally {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcement._id ? { ...a, isLoadingViews: false } : a
        )
      );
    }
  };

  const handleLikeDetails = async (announcement) => {
    try {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcement._id ? { ...a, isLoadingLikes: true } : a
        )
      );

      const likesData = Array.isArray(announcement.acknowledgements)
        ? announcement.acknowledgements
        : [];
      setSelectedAnnouncementLikes(likesData);
      setSelectedAnnouncementTitle(announcement.title);
      setIsLikesModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching like details:", error);
      showNotification("Failed to load like details", "error");
    } finally {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === announcement._id ? { ...a, isLoadingLikes: false } : a
        )
      );
    }
  };

  const handleViewDetailsModal = (announcement) => {
    setViewDetailsAnnouncement(announcement);
    setIsViewDetailsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    if (field === "postedBy") return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      showNotification("File size must be less than 10MB", "error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Reset form
  const resetForm = () => {
    const currentDT = getCurrentDateTime();
    const userName = getUserFullName();

    setFormData({
      title: "",
      dateTime: "",
      postedBy: userName,
      agenda: "",
      priority: "Medium",
      category: "Department",
      duration: "1w",
      dateInput: currentDT.dateInput,
      timeInput: currentDT.timeInput,
    });

    setSelectedFile(null);
    setIsEditMode(false);
    setIsCurrentlyEditing(false);
    setEditingId(null);
    setLastEditedId(null);
    setShouldStayOnPending(false);
  };

  const handlePreview = () => {
    if (
      !formData.title ||
      !formData.dateInput ||
      !formData.timeInput ||
      !formData.postedBy ||
      !formData.agenda
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    const combinedDateTime = DateTime.fromISO(
      `${formData.dateInput}T${formData.timeInput}`
    );
    if (!combinedDateTime.isValid) {
      showNotification(
        "Invalid date or time. Please check your input.",
        "error"
      );
      return;
    }

    setIsPreviewModalOpen(true);
  };

  // Calculate expires_at based on duration
  const calculateExpiresAt = (dateTime, duration) => {
    const dt = DateTime.fromISO(dateTime);

    switch (duration) {
      case "24h":
        return dt.plus({ hours: 24 }).toISO();
      case "3d":
        return dt.plus({ days: 3 }).toISO();
      case "1w":
        return dt.plus({ weeks: 1 }).toISO();
      case "1m":
        return dt.plus({ months: 1 }).toISO();
      case "permanent":
        return null;
      default:
        return dt.plus({ weeks: 1 }).toISO();
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (isSubmitting) {
      console.log("⏳ Submission already in progress, please wait...");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsCurrentlyEditing(true);

      const combinedDateTime = DateTime.fromISO(
        `${formData.dateInput}T${formData.timeInput}`
      );

      if (!combinedDateTime.isValid) {
        showNotification("Invalid date or time format", "error");
        setIsSubmitting(false);
        setIsCurrentlyEditing(false);
        return;
      }

      let announcementAttachment = null;

      if (selectedFile) {
        try {
          showNotification("Uploading file...", "info");

          if (selectedFile.size > 10 * 1024 * 1024) {
            showNotification("File size must be less than 10MB", "error");
            setIsSubmitting(false);
            setIsCurrentlyEditing(false);
            return;
          }

          const uploadFormData = new FormData();
          uploadFormData.append("file", selectedFile);

          console.log("📤 Attempting file upload...", {
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
          });

          const uploadResponse = await api.post(
            "/upload/announcement",
            uploadFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (uploadResponse.data && uploadResponse.data.url) {
            announcementAttachment = uploadResponse.data;
            console.log(
              "✅ File uploaded successfully:",
              announcementAttachment
            );
            showNotification("File uploaded successfully!", "success");
          } else {
            console.warn(
              "⚠️ Upload response missing URL:",
              uploadResponse.data
            );
            showNotification(
              "File uploaded but response incomplete",
              "warning"
            );
          }
        } catch (uploadError) {
          console.error("❌ Cloudinary upload failed:", uploadError);

          let errorMsg = "Failed to upload file.";
          if (uploadError.response?.status === 400) {
            errorMsg = "Invalid file format or size. Please check your file.";
          } else if (uploadError.response?.status === 413) {
            errorMsg = "File too large. Maximum size is 10MB.";
          } else if (uploadError.response?.status === 404) {
            errorMsg = "Upload endpoint not found. Contact administrator.";
          }

          showNotification(errorMsg, "error");

          announcementAttachment = null;
          showNotification("Continuing without file attachment.", "warning");
        }
      }

      const expiresAt = calculateExpiresAt(
        combinedDateTime.toISO(),
        formData.duration
      );

      let payload;

      if (isEditMode) {
        const isApproverEditing = canAutoPost;

        payload = {
          title: formData.title,
          postedBy: formData.postedBy,
          agenda: formData.agenda,
          priority: formData.priority,
          category: formData.category,
          duration: formData.duration,
          expiresAt: expiresAt,
          dateTime: combinedDateTime.toISO(),
          status: isApproverEditing ? "Active" : "Pending",
          approvalStatus: isApproverEditing ? "Approved" : "Pending",
          userRole: user?.role,
          department: user?.department || "Unknown",
          views: [],
          acknowledgements: [],
          attachment: announcementAttachment,
          wasEdited: true,
          editedAt: new Date().toISOString(),
          editedBy: getUserFullName(),
        };
      } else {
        const isAutoApproved = canAutoPost;

        payload = {
          title: formData.title,
          postedBy: formData.postedBy,
          agenda: formData.agenda,
          priority: formData.priority,
          category: formData.category,
          duration: formData.duration,
          expiresAt: expiresAt,
          dateTime: combinedDateTime.toISO(),
          status: isAutoApproved ? "Active" : "Pending",
          approvalStatus: isAutoApproved ? "Approved" : "Pending",
          userRole: user?.role,
          department: user?.department || "Unknown",
          views: [],
          acknowledgements: [],
          attachment: announcementAttachment,
        };
      }

      console.log("📤 Submitting payload:", payload);

      let response;
      if (isEditMode) {
        console.log("✏️ Updating announcement:", editingId);
        response = await api.put(`/announcements/${editingId}`, payload);

        if (response.status === 200) {
          const isApproverEditing = canAutoPost;

          if (!isApproverEditing) {
            showNotification(
              "Announcement updated! Waiting for approval from Department Head.",
              "success"
            );

            setActiveTab("pending");
            setShouldStayOnPending(true);
            setLastEditedId(editingId);

            const updatedAnnouncement = {
              ...response.data,
              _id: editingId,
              status: "Pending",
              approvalStatus: "Pending",
              actualStatus: "Pending",
              views: response.data.views || [],
              acknowledgements: response.data.acknowledgements || [],
              originalDateTime:
                response.data.originalDateTime || response.data.dateTime,
              frozenTimeAgo: null,
              wasEdited: true,
            };

            setAnnouncements((prev) =>
              prev.map((ann) =>
                ann._id === editingId ? updatedAnnouncement : ann
              )
            );

            if (socket) {
              socket.emit("announcementUpdated", updatedAnnouncement);
            }
          } else {
            showNotification(
              "Announcement updated and auto-approved!",
              "success"
            );

            const updatedAnnouncement = {
              ...response.data,
              _id: editingId,
              status: "Active",
              approvalStatus: "Approved",
              actualStatus: "Active",
              views: response.data.views || [],
              acknowledgements: response.data.acknowledgements || [],
              originalDateTime:
                response.data.originalDateTime || response.data.dateTime,
              frozenTimeAgo: null,
            };

            setAnnouncements((prev) =>
              prev.map((ann) =>
                ann._id === editingId ? updatedAnnouncement : ann
              )
            );

            if (socket) {
              socket.emit("announcementUpdated", updatedAnnouncement);
              socket.emit("newAnnouncement", updatedAnnouncement);
            }
          }
        } else {
          throw new Error(`Update failed with status: ${response.status}`);
        }
      } else {
        console.log("📝 Creating new announcement");
        response = await api.post(`/announcements`, payload);

        if (response.status === 201 || response.status === 200) {
          if (response.data.approvalStatus === "Pending") {
            showNotification(
              "Announcement submitted for approval to Department Head.",
              "success"
            );
            setActiveTab("pending");
            setShouldStayOnPending(true);
          } else {
            showNotification(
              "Announcement posted and automatically approved.",
              "success"
            );
            setActiveTab("active");
          }

          if (socket && response.data) {
            const newAnnouncement = {
              ...response.data,
              originalDateTime: response.data.dateTime,
              actualStatus:
                response.data.approvalStatus === "Pending"
                  ? "Pending"
                  : "Active",
              frozenTimeAgo: null,
            };
            socket.emit("newAnnouncement", newAnnouncement);
          }
        } else {
          throw new Error(`Creation failed with status: ${response.status}`);
        }
      }

      resetForm();
      setIsPreviewModalOpen(false);

      if (socket) {
        socket.emit("getAdminData");
        socket.emit("getAgentData");
      }
    } catch (error) {
      console.error("❌ Error submitting announcement:", error);
      showNotification(
        `Failed to ${
          isEditMode ? "update" : "create"
        } announcement. Please try again.`,
        "error"
      );
      setIsCurrentlyEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (announcement) => {
    if (isApproving) {
      console.log("⏳ Approval already in progress, please wait...");
      return;
    }

    if (!canCurrentUserApprove) {
      showNotification(
        "Error: Only ADMIN_HR_HEAD or COMPLIANCE_HEAD can approve announcements.",
        "error"
      );
      return;
    }

    try {
      setIsApproving(true);

      const announcementToApprove = announcements.find(
        (a) => a._id === announcement._id
      );
      if (!announcementToApprove) {
        showNotification("Announcement not found", "error");
        setIsApproving(false);
        return;
      }

      setPendingApprovalAction({
        isOpen: true,
        announcementId: announcement._id,
        action: "approve",
        announcementData: announcementToApprove,
      });
    } catch (error) {
      console.error("Approval setup failed", error);
      showNotification("Failed to prepare approval.", "error");
      setIsApproving(false);
    }
  };

  const handleCancelApproval = async (announcement) => {
    if (isCancellingApproval) {
      console.log("⏳ Cancellation already in progress, please wait...");
      return;
    }

    if (!canCurrentUserApprove) {
      showNotification(
        "Error: Only ADMIN_HR_HEAD or COMPLIANCE_HEAD can cancel approvals.",
        "error"
      );
      return;
    }

    try {
      setIsCancellingApproval(true);

      const announcementToCancel = announcements.find(
        (a) => a._id === announcement._id
      );
      if (!announcementToCancel) {
        showNotification("Announcement not found", "error");
        setIsCancellingApproval(false);
        return;
      }

      setPendingApprovalAction({
        isOpen: true,
        announcementId: announcement._id,
        action: "cancel",
        announcementData: announcementToCancel,
      });
    } catch (error) {
      console.error("Cancellation setup failed", error);
      showNotification("Failed to prepare cancellation.", "error");
      setIsCancellingApproval(false);
    }
  };

  const handleConfirmApprovalAction = async () => {
    const { announcementId, action, announcementData } = pendingApprovalAction;

    if (action === "approve") {
      await confirmApprove(announcementId, announcementData);
    } else if (action === "cancel") {
      await confirmCancelApproval(announcementId, announcementData);
    }
  };

  const confirmApprove = async (id, announcementData) => {
    try {
      setIsApproving(true);

      const announcementDateTime =
        announcementData.dateTime || new Date().toISOString();
      const currentTime = new Date().toISOString();

      let expiresAt = null;
      if (
        announcementData.duration &&
        announcementData.duration !== "permanent"
      ) {
        expiresAt = calculateExpiresAt(
          announcementDateTime,
          announcementData.duration
        );
      } else if (announcementData.expiresAt) {
        expiresAt = announcementData.expiresAt;
      }

      console.log("✅ Approving announcement:", id, {
        announcementDateTime,
        duration: announcementData.duration,
        calculatedExpiresAt: expiresAt,
      });

      const response = await api.post(`/announcements/${id}/approve`, {
        approverName: getUserFullName(),
        approverRole: user?.role,
        approvedAt: currentTime,
        dateTime: announcementDateTime,
        expiresAt: expiresAt,
      });

      if (response.data && response.data.success) {
        const message =
          response.data.message ||
          `Announcement approved by ${getUserFullName()}! Time starts now.`;
        showNotification(message, "success");

        const approvedAnnouncement = response.data.data || response.data;

        setAnnouncements((prev) =>
          prev.map((a) =>
            a._id === id || a.id === id ? { ...a, ...approvedAnnouncement } : a
          )
        );

        await fetchAnnouncements();

        setActiveTab("active");
        setShouldStayOnPending(false);
      } else {
        throw new Error(
          response.data?.message ||
            `Approval failed with status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Approval failed:", error);

      let errorMessage = "Failed to approve announcement.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification(errorMessage, "error");
      await fetchAnnouncements();
    } finally {
      setIsApproving(false);
      setPendingApprovalAction({
        isOpen: false,
        announcementId: null,
        action: null,
        announcementData: null,
      });
    }
  };

  const confirmCancelApproval = async (id, announcementData) => {
    try {
      setIsCancellingApproval(true);

      const currentTime = new Date().toISOString();

      console.log("❌ Cancelling approval for announcement:", id);

      try {
        const response = await api.patch(
          `/announcements/${id}/cancel-approval`,
          {
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime,
            reason: "Approval cancelled by approver",
          }
        );

        console.log("📥 Response:", response.data);

        if (response.data?.success) {
          showNotification(
            `Approval cancelled by ${getUserFullName()}!`,
            "success"
          );

          const cancelledAnnouncement = {
            ...(response.data.data || response.data),
            _id: id,
            approvalStatus: "Cancelled",
            status: "Inactive",
            actualStatus: "Inactive",
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime,
            frozenTimeAgo: formatTimeAgo(currentTime),
            views: [],
            acknowledgements: [],
          };

          setAnnouncements((prev) =>
            prev.map((a) => (a._id === id ? cancelledAnnouncement : a))
          );

          setActiveTab("inactive");

          if (socket) {
            socket.emit("approvalCancelled", cancelledAnnouncement);
            socket.emit("announcementUpdated", cancelledAnnouncement);
          }
        } else {
          throw new Error(response.data?.message || "Cancellation failed");
        }
      } catch (patchError) {
        console.log("🔄 PATCH failed:", patchError.message);

        const fallbackTime = new Date().toISOString();

        setAnnouncements((prev) =>
          prev.map((a) =>
            a._id === id
              ? {
                  ...a,
                  approvalStatus: "Cancelled",
                  status: "Inactive",
                  actualStatus: "Inactive",
                  cancelledBy: getUserFullName(),
                  cancelledAt: fallbackTime,
                  frozenTimeAgo: formatTimeAgo(fallbackTime),
                  views: [],
                  acknowledgements: [],
                }
              : a
          )
        );

        showNotification("Approval cancelled (local update)", "warning");
        setActiveTab("inactive");

        if (socket) {
          const localCancelled = {
            ...announcementData,
            _id: id,
            approvalStatus: "Cancelled",
            status: "Inactive",
            cancelledBy: getUserFullName(),
            cancelledAt: fallbackTime,
          };
          socket.emit("approvalCancelled", localCancelled);
        }
      }
    } catch (error) {
      console.error("❌ Cancellation failed:", error);

      const errorTime = new Date().toISOString();

      try {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a._id === id
              ? {
                  ...a,
                  approvalStatus: "Cancelled",
                  status: "Inactive",
                  actualStatus: "Inactive",
                  cancelledBy: getUserFullName(),
                  cancelledAt: errorTime,
                  frozenTimeAgo: formatTimeAgo(errorTime),
                }
              : a
          )
        );
        showNotification("Updated locally due to error", "warning");
      } catch (localError) {
        console.error("Even local update failed:", localError);
        showNotification("Failed completely. Refresh page.", "error");
      }
    } finally {
      setIsCancellingApproval(false);
      setPendingApprovalAction({
        isOpen: false,
        announcementId: null,
        action: null,
        announcementData: null,
      });
    }
  };

  const handleEdit = (announcement) => {
    console.log("✏️ Starting edit for announcement:", announcement._id);

    setIsEditMode(true);
    setIsCurrentlyEditing(true);
    setEditingId(announcement._id);

    setShouldStayOnPending(false);
    setLastEditedId(null);

    const dt = DateTime.fromISO(announcement.dateTime);
    const userName = getUserFullName();

    setFormData({
      title: announcement.title,
      dateTime: announcement.dateTime,
      postedBy: userName,
      agenda: announcement.agenda,
      priority: announcement.priority,
      category: announcement.category || "Department",
      duration: announcement.duration || "1w",
      dateInput: dt.toISODate(),
      timeInput: dt.toFormat("HH:mm"),
    });

    if (announcement.attachment) {
      setSelectedFile(announcement.attachment);
    } else {
      setSelectedFile(null);
    }

    setTimeout(() => {
      document
        .querySelector(".bg-white\\/80")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelClick = (id) => {
    setItemToCancel(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const announcementToCancel = announcements.find(
        (a) => a._id === itemToCancel
      );
      if (!announcementToCancel) {
        showNotification("Announcement not found", "error");
        return;
      }

      console.log("🗑️ Cancelling announcement:", itemToCancel);

      const currentTime = new Date().toISOString();

      const payload = {
        status: "Inactive",
        actualStatus: "Inactive",
        cancelledAt: currentTime,
        cancelledBy: getUserFullName(),
        updatedAt: currentTime,
        views: [],
        acknowledgements: [],
      };

      let response;
      try {
        response = await api.patch(`/announcements/${itemToCancel}`, payload);
        console.log("✅ PATCH response:", response.data);

        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann._id === itemToCancel
              ? {
                  ...ann,
                  ...payload,
                  frozenTimeAgo: formatTimeAgo(currentTime),
                  views: [],
                  acknowledgements: [],
                }
              : ann
          )
        );

        if (socket) {
          socket.emit("announcementCancelled", {
            announcementId: itemToCancel,
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime,
          });
        }
      } catch (patchError) {
        console.log("🔄 PATCH failed, trying PUT:", patchError);
        const putPayload = {
          ...announcementToCancel,
          status: "Inactive",
          actualStatus: "Inactive",
          cancelledAt: currentTime,
          cancelledBy: getUserFullName(),
          updatedAt: currentTime,
          views: [],
          acknowledgements: [],
        };
        delete putPayload._id;
        delete putPayload.__v;
        response = await api.put(`/announcements/${itemToCancel}`, putPayload);
        console.log("✅ PUT response:", response.data);

        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann._id === itemToCancel
              ? {
                  ...ann,
                  ...putPayload,
                  frozenTimeAgo: formatTimeAgo(currentTime),
                  views: [],
                  acknowledgements: [],
                }
              : ann
          )
        );

        if (socket) {
          socket.emit("announcementCancelled", {
            announcementId: itemToCancel,
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime,
          });
        }
      }

      showNotification("Announcement cancelled successfully!", "success");
      setActiveTab("inactive");
    } catch (error) {
      console.error("❌ Error cancelling announcement:", error);
      showNotification("Failed to cancel announcement.", "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToCancel(null);
    }
  };

  const handleRepostClick = (id) => {
    setItemToRepost(id);
    setIsRepostModalOpen(true);
  };

  const handleConfirmRepost = async () => {
    try {
      const announcementToRepost = announcements.find(
        (a) => a._id === itemToRepost
      );
      if (!announcementToRepost) {
        showNotification("Announcement not found", "error");
        return;
      }

      console.log("🔄 Reposting announcement from history:", itemToRepost);

      const currentTime = new Date().toISOString();
      const expiresAt = calculateExpiresAt(
        currentTime,
        announcementToRepost.duration || "1w"
      );

      const payload = {
        status: "Pending",
        actualStatus: "Pending",
        approvalStatus: "Pending",
        dateTime: currentTime,
        expiresAt: expiresAt,
        updatedAt: currentTime,
        cancelledAt: null,
        cancelledBy: null,
        views: [],
        acknowledgements: [],
        wasEdited: true,
        editedAt: currentTime,
        editedBy: getUserFullName(),
      };

      let response;
      try {
        response = await api.patch(`/announcements/${itemToRepost}`, payload);
        console.log("✅ Repost successful (pending):", response.data);

        const repostedAnnouncement = {
          ...announcementToRepost,
          ...payload,
          originalDateTime: currentTime,
          frozenTimeAgo: null,
          isExpired: false,
          title: announcementToRepost.title,
          agenda: announcementToRepost.agenda,
          postedBy: announcementToRepost.postedBy,
          priority: announcementToRepost.priority,
          category: announcementToRepost.category,
          duration: announcementToRepost.duration,
          attachment: announcementToRepost.attachment,
        };

        setAnnouncements((prev) =>
          prev.map((ann) =>
            ann._id === itemToRepost ? repostedAnnouncement : ann
          )
        );

        if (canAutoPost) {
          showNotification(
            "Announcement reposted and auto-approved!",
            "success"
          );

          const autoApprovedAnnouncement = {
            ...repostedAnnouncement,
            status: "Active",
            actualStatus: "Active",
            approvalStatus: "Approved",
            approvedBy: getUserFullName(),
            approvedAt: currentTime,
          };

          setAnnouncements((prev) =>
            prev.map((ann) =>
              ann._id === itemToRepost ? autoApprovedAnnouncement : ann
            )
          );

          setActiveTab("active");

          if (socket) {
            socket.emit("announcementReposted", autoApprovedAnnouncement);
            socket.emit("announcementApproved", autoApprovedAnnouncement);
          }
        } else {
          showNotification(
            "Announcement reposted! Waiting for head approval.",
            "success"
          );
          setActiveTab("pending");

          if (socket) {
            socket.emit("announcementUpdated", repostedAnnouncement);
            socket.emit("newAnnouncement", repostedAnnouncement);
          }
        }
      } catch (error) {
        console.error("❌ Error reposting announcement:", error);
        showNotification("Failed to repost announcement.", "error");
      }
    } catch (error) {
      console.error("❌ Error in repost process:", error);
      showNotification("Failed to repost announcement.", "error");
    } finally {
      setIsRepostModalOpen(false);
      setItemToRepost(null);
    }
  };

  const handleFileDownload = (file) => {
    try {
      if (!file || !file.url) {
        showNotification("File data not available", "error");
        return;
      }

      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.originalName || file.name || "announcement_file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification("File downloaded successfully!", "success");
    } catch (error) {
      console.error("❌ Error downloading file:", error);
      showNotification("Error downloading file", "error");
    }
  };

  const handleFileView = (file) => {
    setFileViewModal({ isOpen: true, file });
  };

  const closeFileView = () => {
    setFileViewModal({ isOpen: false, file: null });
  };

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

  const getStatusColor = (actualStatus) => {
    switch (actualStatus) {
      case "Pending":
        return "bg-orange-100 text-orange-600";
      case "Active":
        return "bg-green-100 text-green-700";
      case "Expired":
        return "bg-pink-100 text-pink-600";
      case "Inactive":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatTimeAgo = (isoDateStr) => {
    if (!isoDateStr) return "";
    const announcementTime = DateTime.fromISO(isoDateStr);
    if (!announcementTime.isValid) return "";

    return announcementTime.toRelative();
  };

  const getSmartTimeAgo = (announcement) => {
    switch (announcement.actualStatus) {
      case "Pending":
        return "⏸️ Waiting for approval";
      case "Inactive":
        return (
          announcement.frozenTimeAgo ||
          formatTimeAgo(announcement.cancelledAt || announcement.dateTime)
        );
      case "Expired":
        return "Expired";
      case "Active":
        return formatTimeAgo(announcement.dateTime);
      default:
        return formatTimeAgo(announcement.dateTime);
    }
  };

  const formatDateTime = (isoDateStr) => {
    if (!isoDateStr) return "N/A";
    const dt = DateTime.fromISO(isoDateStr);
    if (!dt.isValid) return "Invalid Date";

    return dt.toLocaleString(DateTime.DATETIME_MED);
  };

  useEffect(() => {
    console.log("📊 Current Tab:", activeTab);
    console.log("✏️ Is edit mode:", isEditMode);
    console.log("🔄 Is currently editing:", isCurrentlyEditing);
    console.log("⏸️ Should stay on pending:", shouldStayOnPending);
    console.log("🛡️ Can auto-post:", canAutoPost);
    console.log("👑 Can approve:", canCurrentUserApprove);
    console.log("📝 Last edited ID:", lastEditedId);
  }, [
    activeTab,
    isEditMode,
    isCurrentlyEditing,
    shouldStayOnPending,
    canAutoPost,
    canCurrentUserApprove,
    lastEditedId,
  ]);

  useEffect(() => {
    if (shouldStayOnPending) {
      const timer = setTimeout(() => {
        setShouldStayOnPending(false);
        setLastEditedId(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [shouldStayOnPending]);

  return (
    <div className="pb-4">
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {/* APPROVAL ACTION MODAL */}
      <ConfirmationModal
        isOpen={pendingApprovalAction.isOpen}
        onClose={() =>
          setPendingApprovalAction({
            isOpen: false,
            announcementId: null,
            action: null,
            announcementData: null,
          })
        }
        onConfirm={handleConfirmApprovalAction}
        message={
          pendingApprovalAction.action === "approve"
            ? `Are you sure you want to approve this announcement? It will become active immediately and time will start counting.`
            : `Are you sure you want to cancel this approval? The announcement will be moved to history.`
        }
        confirmText={
          pendingApprovalAction.action === "approve"
            ? isApproving
              ? "Approving..."
              : "Approve Announcement"
            : isCancellingApproval
            ? "Cancelling..."
            : "Cancel Approval"
        }
        confirmButtonClass={
          pendingApprovalAction.action === "approve"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }
        icon={
          pendingApprovalAction.action === "approve" ? (
            <ThumbsUp className="w-6 h-6 text-green-600" />
          ) : (
            <ThumbsDown className="w-6 h-6 text-red-600" />
          )
        }
        isSubmitting={
          pendingApprovalAction.action === "approve"
            ? isApproving
            : isCancellingApproval
        }
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancel}
        message="Are you sure you want to cancel this announcement? This will reset all likes and views, and freeze the time display."
        confirmText="Cancel Announcement"
      />

      <ConfirmationModal
        isOpen={isRepostModalOpen}
        onClose={() => setIsRepostModalOpen(false)}
        onConfirm={handleConfirmRepost}
        message="Are you sure you want to repost this announcement? It will become active again with fresh likes, views, and current time."
        confirmText="Repost Announcement"
      />

      <ConfirmationModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={exportAnalyticsToCSV}
        message="Export announcement analytics to CSV file?"
        confirmText="Export CSV"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        icon={<Download className="w-6 h-6 text-green-600" />}
      />

      <AnnouncementPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onConfirm={handleSubmit}
        formData={formData}
        selectedFile={selectedFile}
        isSubmitting={isSubmitting}
      />

      <FileViewModal
        isOpen={fileViewModal.isOpen}
        onClose={closeFileView}
        file={fileViewModal.file}
      />

      <ViewsModal
        isOpen={isViewsModalOpen}
        onClose={() => setIsViewsModalOpen(false)}
        views={selectedAnnouncementViews}
        announcementTitle={selectedAnnouncementTitle}
      />

      <LikesModal
        isOpen={isLikesModalOpen}
        onClose={() => setIsLikesModalOpen(false)}
        likes={selectedAnnouncementLikes}
        announcementTitle={selectedAnnouncementTitle}
      />

      {/* VIEW DETAILS MODAL */}
      {isViewDetailsModalOpen && viewDetailsAnnouncement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Info className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Announcement Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Complete information about this announcement
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewDetailsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Basic Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-800 font-medium">
                          {viewDetailsAnnouncement.title}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg font-medium text-center ${getStatusColor(
                          viewDetailsAnnouncement.actualStatus
                        )}`}
                      >
                        {viewDetailsAnnouncement.actualStatus === "Pending"
                          ? "Pending Approval"
                          : viewDetailsAnnouncement.actualStatus}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg font-medium text-center border ${getPriorityColor(
                          viewDetailsAnnouncement.priority
                        )}`}
                      >
                        {viewDetailsAnnouncement.priority}
                      </div>
                    </div>

                    <div className="space-y-2"></div>
                  </div>
                </div>

                {/* Timing Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timing Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Posted Date & Time
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-800">
                          {formatDateTime(viewDetailsAnnouncement.dateTime)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Duration
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-800">
                          {viewDetailsAnnouncement.duration || "1 Week"}
                        </p>
                      </div>
                    </div>

                    {viewDetailsAnnouncement.expiresAt && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Expires At
                        </label>
                        <div
                          className={`p-3 rounded-lg border ${
                            viewDetailsAnnouncement.isExpired
                              ? "bg-pink-50 border-pink-200 text-pink-800"
                              : "bg-gray-50 border-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="font-medium">
                            {formatDateTime(viewDetailsAnnouncement.expiresAt)}
                            {viewDetailsAnnouncement.isExpired && (
                              <span className="ml-2 text-pink-600 font-bold">
                                (Expired)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Posted By
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-800 font-medium">
                          {viewDetailsAnnouncement.postedBy}
                        </p>
                      </div>
                    </div>

                    {viewDetailsAnnouncement.approvedBy && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Approved By
                        </label>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-green-800 font-medium">
                            {viewDetailsAnnouncement.approvedBy}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewDetailsAnnouncement.cancelledBy && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Cancelled By
                        </label>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                          <X className="w-4 h-4 text-red-500" />
                          <p className="text-red-800 font-medium">
                            {viewDetailsAnnouncement.cancelledBy}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agenda */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Agenda
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {viewDetailsAnnouncement.agenda}
                    </p>
                  </div>
                </div>

                {/* Attachment */}
                {viewDetailsAnnouncement.attachment && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Attachment
                    </h4>
                    <FileAttachment
                      file={viewDetailsAnnouncement.attachment}
                      onDownload={handleFileDownload}
                      onView={handleFileView}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600"></div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsViewDetailsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                  {viewDetailsAnnouncement.actualStatus === "Active" && (
                    <button
                      onClick={() => {
                        setIsViewDetailsModalOpen(false);
                        handleEdit(viewDetailsAnnouncement);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Announcement
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL INDICATOR FOR PENDING EDITS */}
      {activeTab === "pending" && shouldStayOnPending && (
        <div className="mb-2 px-2 animate-pulse">
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
            <Edit className="w-3 h-3" />
            <span className="font-medium">
              Your edited announcement has been moved here for re-approval
            </span>
          </div>
        </div>
      )}

      <section className="flex flex-col mb-4 px-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Announcements
            </h2>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500">
              Role:{" "}
              <span className="font-semibold text-blue-600">
                {user?.role || "Unknown"}
              </span>
            </div>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg transition-all flex items-center gap-2 text-sm shadow-md"
            >
              <BarChart3 className="w-4 h-4" />
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          Manage and view all company announcements with real-time updates.
        </p>
      </section>

      {/* ANALYTICS SECTION */}
      {showAnalytics && (
        <div className="mb-6 px-2 animate-fade-in">
          <div className="bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-purple-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Announcements Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Performance metrics and insights
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <select
                    value={analyticsFilter.timeRange}
                    onChange={(e) =>
                      setAnalyticsFilter((prev) => ({
                        ...prev,
                        timeRange: e.target.value,
                      }))
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>

                  <select
                    value={analyticsFilter.priority}
                    onChange={(e) =>
                      setAnalyticsFilter((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetAnalyticsFilters}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : analyticsData ? (
              <>
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Announcements
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {analyticsData.totalAnnouncements}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Filtered:{" "}
                      {analyticsFilter.timeRange !== "all"
                        ? analyticsFilter.timeRange
                        : "All time"}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Views</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {analyticsData.averageViews.toFixed(1)}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Eye className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Total: {analyticsData.totalViews} views
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Average Likes</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {analyticsData.averageLikes.toFixed(1)}
                        </p>
                      </div>
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Heart
                          className="w-5 h-5 text-red-600"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Total: {analyticsData.totalLikes} likes
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {analyticsData.averageEngagement.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Activity className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Views to Likes ratio
                    </div>
                  </div>
                </div>

                {/* PERFORMANCE BREAKDOWN */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* TOP PERFORMING */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Highest Performing Announcement
                    </h4>
                    {analyticsData.highestPerforming && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 truncate">
                            {analyticsData.highestPerforming.announcement.title}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                              analyticsData.highestPerforming.announcement
                                .priority
                            )}`}
                          >
                            {
                              analyticsData.highestPerforming.announcement
                                .priority
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Eye className="w-4 h-4" />
                              {analyticsData.highestPerforming.views}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <Heart
                                className="w-4 h-4 text-red-500"
                                fill="currentColor"
                              />
                              {analyticsData.highestPerforming.likes}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(
                              analyticsData.highestPerforming.announcement
                                .dateTime
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LOWEST PERFORMING */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      Needs Improvement
                    </h4>
                    {analyticsData.lowestPerforming && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 truncate">
                            {analyticsData.lowestPerforming.announcement.title}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                              analyticsData.lowestPerforming.announcement
                                .priority
                            )}`}
                          >
                            {
                              analyticsData.lowestPerforming.announcement
                                .priority
                            }
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Eye className="w-4 h-4" />
                              {analyticsData.lowestPerforming.views}
                            </span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <Heart
                                className="w-4 h-4 text-red-500"
                                fill="currentColor"
                              />
                              {analyticsData.lowestPerforming.likes}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(
                              analyticsData.lowestPerforming.announcement
                                .dateTime
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SORTABLE TABLE */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="font-bold text-gray-800">
                        Announcement Performance
                      </h4>
                      <div className="flex gap-2">
                        <select
                          value={analyticsFilter.sortBy}
                          onChange={(e) =>
                            setAnalyticsFilter((prev) => ({
                              ...prev,
                              sortBy: e.target.value,
                            }))
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="views">Sort by Views</option>
                          <option value="likes">Sort by Likes</option>
                          <option value="engagement">Sort by Engagement</option>
                          <option value="date">Sort by Date</option>
                        </select>
                        <button
                          onClick={() =>
                            setAnalyticsFilter((prev) => ({
                              ...prev,
                              sortOrder:
                                prev.sortOrder === "desc" ? "asc" : "desc",
                            }))
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {analyticsFilter.sortOrder === "desc" ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Likes
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Engagement
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analyticsData.announcementsWithStats
                          .slice(0, 10)
                          .map((announcement, index) => (
                            <tr
                              key={announcement._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                    {announcement.title}
                                  </span>
                                  {index === 0 &&
                                    analyticsFilter.sortBy === "views" && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                        Top
                                      </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {announcement.postedBy}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  {announcement.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-blue-500" />
                                  <span className="font-medium">
                                    {announcement.views}
                                  </span>
                                  {announcement.views >
                                    analyticsData.averageViews && (
                                    <span className="text-xs text-green-600">
                                      ↑
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Heart
                                    className="w-4 h-4 text-red-500"
                                    fill="currentColor"
                                  />
                                  <span className="font-medium">
                                    {announcement.likes}
                                  </span>
                                  {announcement.likes >
                                    analyticsData.averageLikes && (
                                    <span className="text-xs text-green-600">
                                      ↑
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        announcement.calculatedEngagement,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600 mt-1">
                                  {announcement.calculatedEngagement.toFixed(1)}
                                  %
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                    announcement.actualStatus
                                  )}`}
                                >
                                  {announcement.actualStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {analyticsData.announcementsWithStats.length > 10 && (
                    <div className="p-4 border-t border-gray-200 text-center">
                      <p className="text-sm text-gray-600">
                        Showing 10 of{" "}
                        {analyticsData.announcementsWithStats.length}{" "}
                        announcements
                      </p>
                    </div>
                  )}
                </div>

                {/* CATEGORY BREAKDOWN */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Category Distribution
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.categoryBreakdown).map(
                        ([category, count]) => {
                          const percentage =
                            (count / analyticsData.totalAnnouncements) * 100;
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{category}</span>
                                <span className="text-gray-600">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Priority Distribution
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(analyticsData.priorityBreakdown).map(
                        ([priority, count]) => {
                          const percentage =
                            (count / analyticsData.totalAnnouncements) * 100;
                          const colorClass =
                            priority === "High"
                              ? "from-red-400 to-red-500"
                              : priority === "Medium"
                              ? "from-yellow-400 to-yellow-500"
                              : "from-green-400 to-green-500";

                          return (
                            <div key={priority} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span
                                  className={`font-medium ${
                                    priority === "High"
                                      ? "text-red-600"
                                      : priority === "Medium"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {priority}
                                </span>
                                <span className="text-gray-600">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-gradient-to-r ${colorClass}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 text-gray-400 mb-3" />
                <p>No analytics data available for the selected filters.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 px-2 gap-4 mb-8">
        {/* LEFT COLUMN - CREATE ANNOUNCEMENT FORM */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 ${
                  isEditMode ? "bg-red-100" : "bg-indigo-100"
                } rounded-lg`}
              >
                {isEditMode ? (
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                ) : (
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                {isEditMode ? "Edit Announcement" : "Create New Announcement"}
              </h3>
            </div>

            {isEditMode && (
              <button
                onClick={resetForm}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter announcement title"
                className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm"
              />
            </div>

            {/* Category and Duration Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Category (SOON)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm"
                >
                  <option value="Department"></option>
                  <option value="General"></option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm"
                >
                  <option value="24h">24 Hours</option>
                  <option value="3d">3 Days</option>
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 z-10" />
                  <input
                    type="date"
                    value={formData.dateInput}
                    min={today}
                    onChange={(e) =>
                      handleInputChange("dateInput", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 z-10" />
                  <input
                    type="time"
                    value={formData.timeInput}
                    onChange={(e) =>
                      handleInputChange("timeInput", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm"
                  />
                </div>
                {/* REAL-TIME TIME INDICATOR */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Current time: {getCurrentDateTime().displayTime}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Posted By *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    value={formData.postedBy}
                    readOnly
                    className="w-full pl-10 pr-3 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 cursor-not-allowed text-sm"
                    title="This field is automatically set to your name"
                  />
                </div>
                <p className="text-xs text-gray-500 italic">
                  Automatically set to your name
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Attachment
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-3 transition-all duration-300 ${
                  isDragOver
                    ? "border-red-400 bg-red-50"
                    : selectedFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-gray-50/30"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                <div className="text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 text-xs">
                          {selectedFile.name ||
                            selectedFile.originalName ||
                            "Uploaded file"}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-gray-600 font-medium text-xs">
                        Drop file or{" "}
                        <span className="text-red-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Max 10MB (Will be uploaded to Cloudinary)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Agenda *
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange("agenda", e.target.value)}
                placeholder="Describe the announcement details..."
                className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl h-20 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none text-sm"
              ></textarea>
            </div>
            <button
              onClick={handlePreview}
              disabled={isSubmitting || isApproving || isCancellingApproval}
              className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                isSubmitting || isApproving || isCancellingApproval
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : isEditMode ? (
                `Update Announcement ${
                  !canAutoPost ? "(Requires Re-approval)" : ""
                }`
              ) : canAutoPost ? (
                "Preview & Auto-Post"
              ) : (
                "Preview & Submit for Approval"
              )}
            </button>
            {!isEditMode && !canAutoPost && (
              <p className="text-xs text-center text-orange-600 mt-1">
                ⚠️ Your post requires approval from Admin&HR Head or Compliance
                Head before going live.
              </p>
            )}
            {!isEditMode && canAutoPost && (
              <p className="text-xs text-center text-green-600 mt-1">
                ✅ As a Department Head, your posts are automatically approved.
              </p>
            )}
            {isEditMode && !canAutoPost && (
              <p className="text-xs text-center text-orange-600 mt-1">
                ⚠️ Your edited announcement will require re-approval from
                Department Head.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - ANNOUNCEMENTS MANAGEMENT WITH TABS */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
          {/* IMPROVED HEADER LAYOUT */}
          <div className="flex flex-col gap-3 mb-4">
            {/* TITLE SECTION */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Announcements Management
              </h3>
            </div>

            {/* SEARCH AND TABS SECTION */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              {/* SEARCH SECTION */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white sm:w-48"
                  />
                </div>

                {searchTerm !== "" && (
                  <button
                    onClick={clearFilters}
                    className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* TABS */}
              <div className="flex bg-gray-100 rounded-lg p-0.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActiveTab("pending");
                    setShouldStayOnPending(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none ${
                    activeTab === "pending"
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Approvals ({pendingCount})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("active");
                    setShouldStayOnPending(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none ${
                    activeTab === "active"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("inactive");
                    setShouldStayOnPending(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none ${
                    activeTab === "inactive"
                      ? "bg-white text-red-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  History ({inactiveCount})
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-500 italic text-sm">
              Loading announcements...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-6 text-red-500 italic text-sm">
              {error}
            </div>
          ) : filteredAnnouncements.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
              {filteredAnnouncements.map((a) => (
                <div
                  key={a._id}
                  className={`group p-3 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    a.actualStatus === "Inactive" ||
                    a.actualStatus === "Pending"
                      ? "bg-gray-100 border border-gray-300 opacity-90"
                      : "bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                  } ${a._id === lastEditedId ? "ring-2 ring-orange-400" : ""}`}
                >
                  {/* CATEGORY & EXPIRY BADGE */}
                  <div className="flex items-center gap-2 mb-2">
                    {a.category === "General" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                      </span>
                    )}
                    {a.expiresAt && (
                      <span
                        className={`text-[10px] border border-gray-200 px-1 rounded font-medium ${
                          a.isExpired
                            ? "bg-pink-100 text-pink-700"
                            : "text-gray-500 bg-gray-50"
                        }`}
                      >
                        {a.isExpired
                          ? "EXPIRED"
                          : `Expires: ${DateTime.fromISO(
                              a.expiresAt
                            ).toRelative()}`}
                      </span>
                    )}
                    {a.wasEdited && a.actualStatus === "Pending" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
                        <Edit className="w-3 h-3" /> EDITED
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <div className="flex items-start gap-2 w-full">
                      <div
                        className={`p-1 rounded-lg mt-1 ${
                          a.actualStatus === "Inactive"
                            ? "bg-gray-300"
                            : "bg-indigo-100"
                        }`}
                      >
                        <Bell
                          className={`w-3 h-3 ${
                            a.actualStatus === "Inactive"
                              ? "text-gray-600"
                              : "text-indigo-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-bold mb-1 group-hover:text-indigo-600 transition-colors truncate ${
                            a.actualStatus === "Inactive"
                              ? "text-gray-600"
                              : "text-gray-800"
                          }`}
                        >
                          {a.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                              a.priority
                            )}`}
                          >
                            {a.priority}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              a.actualStatus
                            )}`}
                          >
                            {a.actualStatus === "Pending"
                              ? "Pending Approval"
                              : a.actualStatus}
                          </span>
                          <span
                            className={`text-xs ${
                              a.actualStatus === "Pending"
                                ? "text-orange-600 font-medium"
                                : "text-gray-500"
                            }`}
                          >
                            {getSmartTimeAgo(a)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Posted by:{" "}
                      <span className="font-medium truncate">{a.postedBy}</span>
                    </p>

                    {/* APPROVED BY SECTION */}
                    {a.approvalStatus === "Approved" && a.approvedBy && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Approved by:{" "}
                        <span className="font-medium text-green-700">
                          {a.approvedBy}
                        </span>
                      </p>
                    )}

                    {/* CANCELLED BY SECTION */}
                    {a.approvalStatus === "Cancelled" && a.cancelledBy && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3 text-red-500" />
                        Cancelled by:{" "}
                        <span className="font-medium text-red-700">
                          {a.cancelledBy}
                        </span>
                      </p>
                    )}

                    {/* EDITED BY SECTION */}
                    {a.wasEdited && a.editedBy && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Edit className="w-3 h-3 text-orange-500" />
                        Edited by:{" "}
                        <span className="font-medium text-orange-700">
                          {a.editedBy}
                        </span>
                      </p>
                    )}

                    <div className="bg-gray-50 rounded-lg p-2 border-l-2 border-red-500">
                      <p className="text-xs text-gray-700 line-clamp-2">
                        <span className="font-semibold text-gray-800">
                          Agenda:
                        </span>{" "}
                        {a.agenda}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <button
                        onClick={() => handleViewDetails(a)}
                        disabled={
                          a.actualStatus === "Pending" || a.isLoadingViews
                        }
                        className={`flex items-center gap-1 transition-colors ${
                          a.actualStatus === "Pending"
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:text-blue-600"
                        }`}
                        title={
                          a.actualStatus === "Pending"
                            ? "Views will start after approval"
                            : "View who viewed this"
                        }
                      >
                        <Eye className="w-3 h-3" />
                        <span>
                          {Array.isArray(a.views) ? a.views.length : 0} views
                        </span>
                        {a.actualStatus === "Pending" && (
                          <span className="text-[10px] text-gray-400">
                            (locked)
                          </span>
                        )}
                        {a.isLoadingViews && (
                          <div className="ml-1 w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                      <button
                        onClick={() => handleLikeDetails(a)}
                        disabled={
                          a.actualStatus === "Pending" || a.isLoadingLikes
                        }
                        className={`flex items-center gap-1 transition-colors ${
                          a.actualStatus === "Pending"
                            ? "text-gray-400 cursor-not-allowed"
                            : "hover:text-red-600"
                        }`}
                        title={
                          a.actualStatus === "Pending"
                            ? "Likes will start after approval"
                            : "View who liked this"
                        }
                      >
                        <Heart
                          className="w-3 h-3 text-red-500"
                          fill={
                            a.actualStatus === "Pending"
                              ? "none"
                              : "currentColor"
                          }
                        />
                        <span>
                          {Array.isArray(a.acknowledgements)
                            ? a.acknowledgements.length
                            : 0}{" "}
                          Likes
                        </span>
                        {a.actualStatus === "Pending" && (
                          <span className="text-[10px] text-gray-400">
                            (locked)
                          </span>
                        )}
                        {a.isLoadingLikes && (
                          <div className="ml-1 w-2 h-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                    </div>

                    {a.attachment && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          Attached File:
                        </p>
                        <FileAttachment
                          file={a.attachment}
                          onDownload={handleFileDownload}
                          onView={handleFileView}
                        />
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2">
                    {/* VIEW DETAILS BUTTON */}
                    <button
                      onClick={() => handleViewDetailsModal(a)}
                      className="flex-1 bg-white border border-blue-500 text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all font-medium text-xs shadow-sm hover:shadow flex items-center justify-center gap-1"
                      title="View complete details"
                    >
                      <Info className="w-3 h-3" />
                      Details
                    </button>

                    {/* PENDING TAB BUTTONS */}
                    {activeTab === "pending" &&
                      a.actualStatus === "Pending" &&
                      canCurrentUserApprove && (
                        <>
                          <button
                            onClick={() => handleCancelApproval(a)}
                            disabled={isCancellingApproval}
                            className="flex-1 bg-white border border-red-500 text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all font-medium text-xs shadow-sm hover:shadow flex items-center justify-center gap-1"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            {isCancellingApproval ? "..." : "Cancel"}
                          </button>
                          <button
                            onClick={() => handleApprove(a)}
                            disabled={isApproving}
                            className="flex-1 bg-green-500 text-white p-1.5 rounded-lg hover:bg-green-600 transition-all font-medium text-xs shadow-sm flex items-center justify-center gap-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {isApproving ? "..." : "Approve"}
                          </button>
                        </>
                      )}

                    {activeTab === "pending" &&
                      a.actualStatus === "Pending" &&
                      !canCurrentUserApprove && (
                        <span className="flex-1 text-center text-xs text-orange-600 bg-orange-50 p-1.5 rounded-lg border border-orange-200 font-medium">
                          ⏸️ Waiting for Head's approval
                        </span>
                      )}

                    {/* ACTIVE TAB BUTTONS */}
                    {activeTab === "active" && a.actualStatus === "Active" && (
                      <>
                        <button
                          onClick={() => handleCancelClick(a._id)}
                          disabled={isSubmitting}
                          className="flex-1 bg-white border border-red-500 text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all font-medium text-xs shadow-sm hover:shadow"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEdit(a)}
                          disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-1.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium text-xs shadow-sm hover:shadow"
                        >
                          Edit {!canAutoPost && "(Requires Re-approval)"}
                        </button>
                      </>
                    )}

                    {/* INACTIVE TAB BUTTONS */}
                    {activeTab === "inactive" &&
                      (a.actualStatus === "Inactive" ||
                        a.actualStatus === "Expired") && (
                        <button
                          onClick={() => handleRepostClick(a._id)}
                          disabled={isSubmitting}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-xs shadow-sm hover:shadow flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Repost
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500 italic text-sm">
              {searchTerm !== "" ? (
                <>
                  <Filter className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-center">
                    No announcements match your search.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    Clear search
                  </button>
                </>
              ) : activeTab === "active" ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p>No active announcements found.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Create a new announcement or check pending approvals.
                  </p>
                </>
              ) : activeTab === "pending" ? (
                <>
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>No announcements pending approval.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    All announcements have been approved or there are no new
                    submissions.
                  </p>
                </>
              ) : (
                <>
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>No inactive announcements found.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    No announcements have been cancelled or expired yet.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncement;
