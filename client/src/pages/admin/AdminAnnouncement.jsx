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
  XCircle,
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
  PieChart,
  Zap,
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
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
    <div className="bg-white rounded-none border-t-[6px] border-[#800000] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
     
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <Info className="w-6 h-6 text-[#800000]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Announcement Details
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Complete communication log and metadata
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsViewDetailsModalOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-6 overflow-y-auto bg-white flex-grow">
        <div className="space-y-8">
         
          {/* STATUS & PRIORITY SECTION */}
          <div className="flex flex-wrap gap-3">
            <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(viewDetailsAnnouncement.actualStatus)}`}>
              Status: {viewDetailsAnnouncement.actualStatus === "Pending" ? "Pending Approval" : viewDetailsAnnouncement.actualStatus}
            </div>
            <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(viewDetailsAnnouncement.priority)}`}>
              Priority: {viewDetailsAnnouncement.priority}
            </div>
          </div>

          {/* MAIN INFORMATION GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Title Section */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight block mb-2">Subject Title</label>
              <div className="p-4 bg-slate-50 border-l-4 border-[#800000] rounded-r-lg">
                <p className="text-lg font-bold text-slate-900">
                  {viewDetailsAnnouncement.title}
                </p>
              </div>
            </div>

            {/* Timing column */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight block mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-[#800000]" /> Timing Info
                </label>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-800">Posted:</span> {formatDateTime(viewDetailsAnnouncement.dateTime)}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-bold text-slate-800">Duration:</span> {viewDetailsAnnouncement.duration || "1 Week"}
                  </p>
                  {viewDetailsAnnouncement.expiresAt && (
                    <p className={`text-sm font-medium ${viewDetailsAnnouncement.isExpired ? "text-red-600" : "text-slate-600"}`}>
                      <span className="font-bold text-slate-800">Expires:</span> {formatDateTime(viewDetailsAnnouncement.expiresAt)}
                      {viewDetailsAnnouncement.isExpired && " (Expired)"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personnel column */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight block mb-2 flex items-center gap-2">
                  <User size={14} className="text-[#800000]" /> Personnel Involved
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {viewDetailsAnnouncement.postedBy?.charAt(0)}
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-bold text-slate-800">Posted by:</span> {viewDetailsAnnouncement.postedBy}
                    </p>
                  </div>
                  {viewDetailsAnnouncement.approvedBy && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <p className="text-sm text-slate-600">
                        <span className="font-bold text-slate-800">Approved by:</span> {viewDetailsAnnouncement.approvedBy}
                      </p>
                    </div>
                  )}
                  {viewDetailsAnnouncement.cancelledBy && (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle size={14} />
                      <p className="text-sm">
                        <span className="font-bold">Cancelled by:</span> {viewDetailsAnnouncement.cancelledBy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AGENDA SECTION */}
          <div className="pt-6 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-tight block mb-3">Announcement Content / Agenda</label>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {viewDetailsAnnouncement.agenda}
              </p>
            </div>
          </div>

          {/* ATTACHMENT SECTION */}
          {viewDetailsAnnouncement.attachment && (
            <div className="pt-6 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight block mb-3">Associated Attachment</label>
              <div className="bg-white rounded-xl border border-slate-200 p-1">
                <FileAttachment
                  file={viewDetailsAnnouncement.attachment}
                  onDownload={handleFileDownload}
                  onView={handleFileView}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <button
          onClick={() => setIsViewDetailsModalOpen(false)}
          className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
        >
          Dismiss
        </button>
       
        {viewDetailsAnnouncement.actualStatus === "Active" && (
          <button
            onClick={() => {
              setIsViewDetailsModalOpen(false);
              handleEdit(viewDetailsAnnouncement);
            }}
            className="px-6 py-2.5 bg-[#800000] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#600000] shadow-lg shadow-[#800000]/10 transition-all flex items-center gap-2 active:scale-95"
          >
            <Edit className="w-4 h-4" />
            Edit Announcement
          </button>
        )}
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
<div className="w-full p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#800000] p-6 rounded-[2rem] shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all hover:bg-[#6b0000]">
          <div>
            <p className="text-sm font-bold tracking-widest text-white/80 uppercase mb-1">Total Announcements</p>
            <p className="text-4xl font-black text-white leading-tight">{analyticsData.totalAnnouncements}</p>
          </div>
          <div className="flex items-center gap-3 mt-4 text-sm font-bold text-white uppercase">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span>Filtered: {analyticsFilter.timeRange !== "all" ? analyticsFilter.timeRange : "All time"}</span>
          </div>
          <div className="absolute right-6 top-10 flex items-end gap-1 h-12 opacity-30">
            <div className="w-2 h-4 bg-white/20 rounded-full"></div>
            <div className="w-2 h-6 bg-white/20 rounded-full"></div>
            <div className="w-2 h-8 bg-white/40 rounded-full"></div>
            <div className="w-2 h-12 bg-white rounded-full"></div>
            <div className="w-2 h-5 bg-white/20 rounded-full"></div>
          </div>
        </div>

        {/* AVERAGE VIEWS */}
        <div className="bg-[#800000] p-6 rounded-[2rem] shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all hover:bg-[#6b0000]">
          <div>
            <p className="text-sm font-bold tracking-widest text-white/80 uppercase mb-1">Average Views</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-black text-white leading-tight">{analyticsData.averageViews.toFixed(1)}</p>
              <span className="text-sm font-extrabold text-white bg-white/20 px-2 py-0.5 rounded-lg">
                +{((analyticsData.totalViews / (analyticsData.totalAnnouncements || 1)) * 0.1).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 text-sm font-bold text-white uppercase">
            <div className="p-2 bg-white/10 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span>Total: {analyticsData.totalViews} views</span>
          </div>
          <div className="absolute right-6 top-10 opacity-40">
            <svg width="70" height="40" viewBox="0 0 60 30" fill="none" className="text-white">
              <path d="M2 25C10 25 15 5 25 15C35 25 45 5 58 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* AVERAGE LIKES */}
        <div className="bg-[#800000] p-6 rounded-[2rem] shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all hover:bg-[#6b0000]">
          <div>
            <p className="text-sm font-bold tracking-widest text-white/80 uppercase mb-1">Average Likes</p>
            <div className="flex items-center gap-3">
              <p className="text-4xl font-black text-white leading-tight">{analyticsData.averageLikes.toFixed(1)}</p>
              <span className="text-sm font-extrabold text-white bg-white/20 px-2 py-0.5 rounded-lg">
                {(analyticsData.averageLikes / 10).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 text-sm font-bold text-white uppercase">
            <div className="p-2 bg-white/10 rounded-xl">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span>Total: {analyticsData.totalLikes} likes</span>
          </div>
          <div className="absolute right-6 top-10 opacity-20">
            <div className="flex flex-col items-end">
              <div className="w-10 h-3 border-r-4 border-t-4 border-white"></div>
              <div className="w-14 h-3 border-r-4 border-t-4 border-white"></div>
              <div className="w-20 h-3 border-r-4 border-t-4 border-white"></div>
            </div>
          </div>
        </div>

        {/* ENGAGEMENT RATE */}
        <div className="bg-[#800000] p-6 rounded-[2rem] shadow-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden transition-all hover:bg-[#6b0000]">
          <div>
            <p className="text-sm font-bold tracking-widest text-white uppercase mb-1">Engagement Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-black text-white leading-tight">{analyticsData.averageEngagement.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 text-sm font-bold text-white uppercase">
            <div className="p-2 bg-white/10 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span>Views to Likes ratio</span>
          </div>
          <div className="absolute right-6 top-10 opacity-60">
            <svg width="70" height="40" viewBox="0 0 60 30" fill="none" className="text-white">
              <path d="M2 20C10 20 15 5 25 25C35 45 45 5 58 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="58" cy="15" r="3" fill="white" />
            </svg>
          </div>
        </div>

      </div>
    </div>

{/* PERFORMANCE BREAKDOWN */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 px-4">
 
  {/* HIGHEST PERFORMING - HIGH CONTRAST SURROUND SHADOW */}
  <div className="bg-white rounded-[2.5rem] shadow-[0_0_35px_rgba(0,0,0,0.12)] hover:shadow-[0_0_50px_rgba(128,0,0,0.2)] transition-all duration-500 flex items-center overflow-hidden h-36 hover:-translate-y-2 cursor-default border border-slate-100 relative group">
   
    <div className="flex-1 px-8 flex items-center justify-between relative z-10">
      {/* LEFT SIDE: INFO */}
      <div className="max-w-[55%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-[#800000]/10 rounded-xl shadow-sm">
            <TrendingUp className="w-5 h-5 text-[#800000]" />
          </div>
          <span className="text-[10px] font-black text-[#800000] uppercase tracking-[0.2em]">Highest Performing</span>
        </div>
        {analyticsData.highestPerforming ? (
          <>
            <h5 className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-[#800000] transition-colors">
              {analyticsData.highestPerforming.announcement.title}
            </h5>
            <p className="text-[10px] font-medium text-slate-400 mt-1">
              Published {formatTimeAgo(analyticsData.highestPerforming.announcement.dateTime)}
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-400 italic">No data record</p>
        )}
      </div>

      {/* RIGHT SIDE: PRIORITY & STATS */}
      <div className="flex flex-col items-end gap-1 pl-6">
        {analyticsData.highestPerforming && (
          <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm mb-3 ${getPriorityColor(analyticsData.highestPerforming.announcement.priority)}`}>
            {analyticsData.highestPerforming.announcement.priority}
          </span>
        )}
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Views</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
              {analyticsData.highestPerforming?.views || 0}
            </p>
          </div>
          <div className="text-right border-l-2 border-slate-100 pl-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Likes</p>
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                {analyticsData.highestPerforming?.likes || 0}
              </p>
              <Heart className="w-4 h-4 text-[#800000]" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* NEEDS REVIEW - HIGH CONTRAST SURROUND SHADOW */}
  <div className="bg-white rounded-[2.5rem] shadow-[0_0_35px_rgba(0,0,0,0.12)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all duration-500 flex items-center overflow-hidden h-36 hover:-translate-y-2 cursor-default border border-slate-100 relative group">
    <div className="flex-1 px-8 flex items-center justify-between relative z-10">
      {/* LEFT SIDE: INFO */}
      <div className="max-w-[55%]">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-slate-100 rounded-xl shadow-sm">
            <Target className="w-5 h-5 text-slate-600" />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Needs Review</span>
        </div>
        {analyticsData.lowestPerforming ? (
          <>
            <h5 className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-slate-600 transition-colors">
              {analyticsData.lowestPerforming.announcement.title}
            </h5>
            <p className="text-[10px] font-medium text-slate-400 mt-1">
              Published {formatTimeAgo(analyticsData.lowestPerforming.announcement.dateTime)}
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-400 italic">No data record</p>
        )}
      </div>

      {/* RIGHT SIDE: PRIORITY & STATS */}
      <div className="flex flex-col items-end gap-1 pl-6">
        {analyticsData.lowestPerforming && (
          <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm mb-3 ${getPriorityColor(analyticsData.lowestPerforming.announcement.priority)}`}>
            {analyticsData.lowestPerforming.announcement.priority}
          </span>
        )}
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Views</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
              {analyticsData.lowestPerforming?.views || 0}
            </p>
          </div>
          <div className="text-right border-l-2 border-slate-100 pl-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Likes</p>
            <div className="flex items-center gap-1.5 justify-end">
              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                {analyticsData.lowestPerforming?.likes || 0}
              </p>
              <Heart className="w-4 h-4 text-slate-400" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

{/* SORTABLE TABLE & Announcement Performance */}
<div className="bg-white rounded-[2rem] border-t-4 border-t-[#800000] border-x border-b border-slate-100 shadow-xl overflow-hidden transition-all duration-500">
  <div className="p-5 bg-white relative overflow-hidden">
    {/* HIGHLIGHT GRADIENT AT THE TOP RIGHT */}
    <div className="absolute top-0 right-0 w-48 h-48 bg-[#800000]/10 rounded-full blur-[50px] -mr-20 -mt-20" />
   
    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
     
      {/* LEFT SIDE: TITLE & SUBTITLE */}
      <div className="flex flex-col px-2">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight leading-tight">
          Executive Performance Analytics
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-medium text-gray-400 italic">
            Performance metrics and strategic insights overview
          </span>
          <div className="h-px w-6 bg-[#800000]/30"></div>
        </div>
      </div>

      {/* RIGHT SIDE: FILTERS (COMPACT) */}
      <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
        <select
          value={analyticsFilter.sortBy}
          onChange={(e) =>
            setAnalyticsFilter((prev) => ({
              ...prev,
              sortBy: e.target.value,
            }))
          }
          className="bg-transparent pl-3 pr-6 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 focus:outline-none cursor-pointer"
        >
          <option value="views">By Views</option>
          <option value="likes">By Likes</option>
          <option value="engagement">By Engagement</option>
          <option value="date">By Date</option>
        </select>
       
        <button
          onClick={() =>
            setAnalyticsFilter((prev) => ({
              ...prev,
              sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
            }))
          }
          className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#800000] hover:text-[#800000] transition-all"
        >
          {analyticsFilter.sortOrder === "desc" ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  </div>

  {/* MODERN BORDERLESS TABLE (COMPACT HEIGHT) */}
  <div className="overflow-x-auto px-6 pb-6">
    <table className="w-full border-separate border-spacing-y-1">
      <thead>
        <tr>
          {/* HEADERS CHANGED TO MAROON */}
          <th className="px-4 py-2 text-left text-[9px] font-black text-[#800000] uppercase tracking-[0.2em]">The Announcement</th>
          <th className="px-4 py-2 text-left text-[9px] font-black text-[#800000] uppercase tracking-[0.2em]">Category</th>
          <th className="px-4 py-2 text-left text-[9px] font-black text-[#800000] uppercase tracking-[0.2em]">Reach</th>
          <th className="px-4 py-2 text-left text-[9px] font-black text-[#800000] uppercase tracking-[0.2em]">Growth</th>
          <th className="px-4 py-2 text-center text-[9px] font-black text-[#800000] uppercase tracking-[0.2em]">Status</th>
        </tr>
      </thead>
      <tbody>
        {analyticsData.announcementsWithStats
          .slice(0, 10)
          .map((announcement, index) => (
            <tr key={announcement._id} className="group hover:bg-slate-50/80 transition-all duration-200">
              <td className="px-4 py-2.5 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700 group-hover:text-[#800000] transition-colors line-clamp-1">
                    {announcement.title}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400">
                    {announcement.postedBy}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 border-y border-transparent group-hover:border-slate-100">
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                  {announcement.category}
                </span>
              </td>
              <td className="px-4 py-2.5 border-y border-transparent group-hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 leading-none">{announcement.views.toLocaleString()}</span>
                    <span className="text-[8px] font-medium text-slate-400 uppercase mt-0.5">Views</span>
                  </div>
                  <div className="flex flex-col border-l border-slate-100 pl-3">
                    <div className="flex items-center gap-1 leading-none">
                      <span className="text-sm font-bold text-slate-800">{announcement.likes.toLocaleString()}</span>
                      <Heart className="w-2 h-2 text-[#800000]" fill="currentColor" />
                    </div>
                    <span className="text-[8px] font-medium text-slate-400 uppercase mt-0.5">Likes</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 border-y border-transparent group-hover:border-slate-100">
                <div className="flex flex-col gap-1 w-24">
                  <span className="text-[10px] font-bold text-emerald-600">
                    {announcement.calculatedEngagement.toFixed(1)}%
                  </span>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(announcement.calculatedEngagement, 100)}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-100 text-center">
                <span className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider border shadow-sm ${getStatusColor(announcement.actualStatus)}`}>
                  {announcement.actualStatus}
                </span>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>

{/* EXECUTIVE SUMMARY CARDS (High Visibility Icons) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                  {/* DISTRIBUTION ANALYSIS */}
                  <div className="relative group bg-white rounded-[2.5rem] p-6 shadow-[0_0_40px_rgba(0,0,0,0.08)] border border-slate-50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_50px_rgba(0,0,0,0.12)] hover:-translate-y-1">
                    {/* High Visibility Background Icon */}
                    <div className="absolute top-1/2 right-[-2%] -translate-y-1/2 opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-700 pointer-events-none">
                      <PieChart className="w-44 h-44 text-[#800000]" strokeWidth={1.5} />
                    </div>
                   
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-[2px] h-3.5 bg-[#800000] rounded-full" />
                        <h4 className="text-[11px] font-black text-[#800000] uppercase tracking-normal">
                          Distribution Analysis
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(analyticsData.categoryBreakdown).map(([category, count]) => {
                          const percentage = (count / analyticsData.totalAnnouncements) * 100;
                          return (
                            <div key={category} className="relative">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{category}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-black">{count}</span>
                                  <span className="text-[9px] font-bold text-[#800000] bg-[#800000]/10 px-1.5 py-0.5 rounded-md">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-[3.5px] w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                <div
                                  className="h-full bg-[#800000] transition-all duration-1000 ease-out"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* PRIORITY STRATIFICATION */}
                  <div className="relative group bg-white rounded-[2.5rem] p-6 shadow-[0_0_40px_rgba(0,0,0,0.08)] border border-slate-50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_50px_rgba(0,0,0,0.12)] hover:-translate-y-1">
                    {/* High Visibility Background Icon */}
                    <div className="absolute top-1/2 right-[0%] -translate-y-1/2 opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-700 pointer-events-none">
                      <Zap className="w-44 h-44 text-slate-900" strokeWidth={1.5} />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-[2px] h-3.5 bg-black rounded-full" />
                        <h4 className="text-[11px] font-black text-black uppercase tracking-normal">
                          Priority Stratification
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {Object.entries(analyticsData.priorityBreakdown).map(([priority, count]) => {
                          const percentage = (count / analyticsData.totalAnnouncements) * 100;
                         
                          let barColor = "bg-slate-300";
                          if (priority === "High") barColor = "bg-[#800000]";
                          if (priority === "Medium") barColor = "bg-yellow-400";
                          if (priority === "Low") barColor = "bg-green-500";
                         
                          return (
                            <div key={priority} className="relative">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{priority}</span>
                                <span className="text-xs font-black text-black">{percentage.toFixed(0)}%</span>
                              </div>
                              <div className="h-[3.5px] w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                <div
                                  className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                <div className="p-5 bg-slate-50 rounded-full mb-4 group hover:bg-purple-50 transition-colors duration-500">
                  <BarChart3 className="w-12 h-12 text-slate-200 group-hover:text-purple-200 transition-colors" />
                </div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-tighter">System Idle</h3>
                <p className="text-[10px] text-slate-300 mt-2 uppercase font-bold tracking-tighter">Waiting for data stream input</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 px-2 gap-4 mb-8">
      {/*CREATE ANNOUNCEMENT FORM */}
        <div className="bg-white rounded-none border-t-[6px] border-[#800000] shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 ${
                    isEditMode ? "bg-red-50" : "bg-red-50"
                  } rounded-none border border-red-100`}
                >
                  {isEditMode ? (
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-[#800000]" />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#800000]" />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {isEditMode ? "Edit Announcement" : "Create New Announcement"}
                </h3>
              </div>

              {isEditMode && (
                <button
                  onClick={resetForm}
                  className="p-1 text-red-700 hover:text-red-900 hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#800000] uppercase tracking-wide">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter announcement title"
                className="w-full p-3 bg-white border border-gray-300 rounded-none focus:border-[#800000] focus:ring-1 focus:ring-[#800000] transition-all text-gray-800 placeholder-gray-400 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Category (SOON)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full p-3 bg-white border border-gray-300 rounded-none focus:border-[#800000] text-gray-800 text-sm outline-none"
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
                  className="w-full p-3 bg-white border border-gray-300 rounded-none focus:border-[#800000] text-gray-800 text-sm outline-none"
                >
                  <option value="24h">24 Hours</option>
                  <option value="3d">3 Days</option>
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#800000] z-10" />
                  <input
                    type="date"
                    value={formData.dateInput}
                    min={today}
                    onChange={(e) =>
                      handleInputChange("dateInput", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-none focus:border-[#800000] text-gray-800 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#800000] z-10" />
                  <input
                    type="time"
                    value={formData.timeInput}
                    onChange={(e) =>
                      handleInputChange("timeInput", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-none focus:border-[#800000] text-gray-800 text-sm outline-none"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
                  <span>Current time: {getCurrentDateTime().displayTime}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Posted By *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.postedBy}
                    readOnly
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-none text-gray-500 cursor-not-allowed text-sm font-medium"
                    title="This field is automatically set to your name"
                  />
                </div>
                <p className="text-[10px] text-gray-400 italic">
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
                  className="w-full p-3 bg-white border border-gray-300 rounded-none focus:border-[#800000] text-gray-800 text-sm outline-none"
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
                className={`relative border border-dashed rounded-none p-4 transition-all duration-300 ${
                  isDragOver
                    ? "border-[#800000] bg-red-50"
                    : selectedFile
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300 bg-gray-50/50 hover:bg-white"
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
                      <FileText className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-700 text-xs">
                          {selectedFile.name ||
                            selectedFile.originalName ||
                            "Uploaded file"}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="text-[#800000] hover:underline text-[10px] font-bold"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-gray-600 text-xs">
                        Drop file or <span className="text-[#800000] font-bold">browse</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
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
                className="w-full p-3 bg-white border border-gray-300 rounded-none h-24 focus:border-[#800000] transition-all text-gray-800 placeholder-gray-400 resize-none text-sm outline-none"
              ></textarea>
            </div>
            <div className="pt-2">
              <button
                onClick={handlePreview}
                disabled={isSubmitting || isApproving || isCancellingApproval}
                className={`w-full bg-[#800000] text-white p-3.5 rounded-none hover:bg-[#5c0000] transition-all duration-300 font-bold text-sm shadow-md ${
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
              <div className="mt-4 space-y-2">
                {!isEditMode && !canAutoPost && (
                  <p className="text-[11px] text-center text-amber-700 font-medium py-2 bg-amber-50 border border-amber-100">
                    ⚠️ Your post requires approval from Admin&HR Head or Compliance
                    Head before going live.
                  </p>
                )}
                {!isEditMode && canAutoPost && (
                  <p className="text-[11px] text-center text-green-700 font-medium py-2 bg-green-50 border border-green-100">
                    ✅ As a Department Head, your posts are automatically approved.
                  </p>
                )}
                {isEditMode && !canAutoPost && (
                  <p className="text-[11px] text-center text-amber-700 font-medium py-2 bg-amber-50 border border-amber-100">
                    ⚠️ Your edited announcement will require re-approval from
                    Department Head.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - ANNOUNCEMENTS MANAGEMENT */}
        <div className="bg-white rounded-none border-t-[6px] border-[#800000] shadow-xl overflow-hidden">
          <div className="bg-white p-6 border-b border-slate-200">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <FileText className="w-5 h-5 text-[#800000]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Announcements Management
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Oversee and moderate organization-wide communications
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="flex bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
                  <button
                    onClick={() => {
                      setActiveTab("pending");
                      setShouldStayOnPending(false);
                    }}
                    className={`flex-1 lg:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "pending"
                        ? "bg-white text-[#800000] shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Approvals
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'pending' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                      {pendingCount}
                    </span>
                  </button>
                 
                  <button
                    onClick={() => {
                      setActiveTab("active");
                      setShouldStayOnPending(false);
                    }}
                    className={`flex-1 lg:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "active"
                        ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Active
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                      {activeCount}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("inactive");
                      setShouldStayOnPending(false);
                    }}
                    className={`flex-1 lg:flex-none px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      activeTab === "inactive"
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    History
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'inactive' ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-600'}`}>
                      {inactiveCount}
                    </span>
                  </button>
                </div>

                <div className="relative w-full lg:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] outline-none transition-all"
                  />
                  {searchTerm && (
                    <button onClick={clearFilters} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6 bg-[#f8fafc] scrollbar-hide"
            style={{
              maxHeight: "600px",
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}} />

            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="w-8 h-8 border-4 border-[#800000]/20 border-t-[#800000] rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500">Syncing announcements...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            ) : filteredAnnouncements.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredAnnouncements.map((a) => (
                  <div
                    key={a._id}
                    className={`group bg-white border rounded-xl transition-all duration-200 hover:border-slate-300 hover:shadow-md overflow-hidden ${
                      a._id === lastEditedId ? "ring-2 ring-[#800000]" : "border-slate-200"
                    }`}
                  >
                    <div className="flex">
                      <div className={`w-1.5 ${
                        a.actualStatus === 'Active' ? 'bg-emerald-500' :
                        a.actualStatus === 'Pending' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />

                      <div className="flex-1 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                              a.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                              'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${a.priority === 'High' ? 'bg-red-500' : 'bg-slate-400'}`} />
                              {a.priority} Priority
                            </span>
                           
                            {a.category === "General" && (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                                {a.category}
                              </span>
                            )}
                          </div>

                          {a.expiresAt && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                              <Clock className="w-3.5 h-3.5" />
                              {a.isExpired ? (
                                <span className="text-red-600 font-bold uppercase">Expired</span>
                              ) : (
                                <span>Exp: {DateTime.fromISO(a.expiresAt).toRelative()}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-[#800000] transition-colors">
                            {a.title}
                          </h4>
                          <div className="bg-slate-50 border-l-2 border-slate-300 p-3 rounded-r-lg">
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                              <span className="font-bold text-slate-700 text-xs uppercase mr-2">Agenda:</span>
                              {a.agenda}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                {a.postedBy.charAt(0)}
                              </div>
                              <span>By <span className="font-semibold text-slate-700">{a.postedBy}</span></span>
                            </div>

                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleViewDetails(a)}
                                disabled={a.actualStatus === "Pending" || a.isLoadingViews}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                {Array.isArray(a.views) ? a.views.length : 0}
                              </button>
                              <button
                                onClick={() => handleLikeDetails(a)}
                                disabled={a.actualStatus === "Pending" || a.isLoadingLikes}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                              >
                                <Heart className={`w-3.5 h-3.5 ${a.actualStatus !== "Pending" ? "text-red-500" : ""}`} />
                                {Array.isArray(a.acknowledgements) ? a.acknowledgements.length : 0}
                              </button>
                            </div>
                          </div>

                          {a.attachment && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                              <Paperclip className="w-3 h-3 text-blue-600" />
                              <span className="text-[11px] font-semibold text-blue-700 max-w-[100px] truncate">Document</span>
                              <div className="flex gap-1 border-l border-blue-200 ml-1 pl-2">
                                <button onClick={() => handleFileView(a.attachment)} className="text-[10px] text-blue-600 hover:underline">View</button>
                              </div>
                            </div>
                          )}
                        </div>

                        {(a.approvedBy || a.cancelledBy || a.wasEdited) && (
                          <div className="mt-3 flex flex-wrap gap-3">
                            {a.approvedBy && a.approvalStatus === "Approved" && (
                              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                                <CheckCircle className="w-3 h-3" /> Approved by {a.approvedBy}
                              </span>
                            )}
                            {a.cancelledBy && a.approvalStatus === "Cancelled" && (
                              <span className="flex items-center gap-1 text-[10px] font-medium text-red-600">
                                <XCircle className="w-3 h-3" /> Cancelled by {a.cancelledBy}
                              </span>
                            )}
                            {a.wasEdited && (
                              <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600">
                                <Edit className="w-3 h-3" /> Edited by {a.editedBy || "User"}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2">
                          <button
                            onClick={() => handleViewDetailsModal(a)}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                          >
                            <Info className="w-3.5 h-3.5" /> Details
                          </button>

                          {activeTab === "pending" && a.actualStatus === "Pending" && (
                            canCurrentUserApprove ? (
                              <>
                                <button
                                  onClick={() => handleCancelApproval(a)}
                                  disabled={isCancellingApproval}
                                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" /> Reject
                                </button>
                                <button
                                  onClick={() => handleApprove(a)}
                                  disabled={isApproving}
                                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-[#800000] rounded-lg hover:bg-[#600000] transition-all shadow-md"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                                </button>
                              </>
                            ) : (
                              <div className="col-span-3 flex items-center justify-center px-3 py-2 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg">
                                <Clock className="w-3.5 h-3.5 mr-2" /> Pending Department Head Review
                              </div>
                            )
                          )}

                          {activeTab === "active" && a.actualStatus === "Active" && (
                            <>
                              <button
                                onClick={() => handleCancelClick(a._id)}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all shadow-sm"
                              >
                                Cancel Post
                              </button>
                              <button
                                onClick={() => handleEdit(a)}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-black transition-all shadow-md"
                              >
                                <Edit className="w-3.5 h-3.5" /> Update
                              </button>
                            </>
                          )}

                          {activeTab === "inactive" && (a.actualStatus === "Inactive" || a.actualStatus === "Expired") && (
                            <button
                              onClick={() => handleRepostClick(a._id)}
                              disabled={isSubmitting}
                              className="col-span-3 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Repost Announcement
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">No announcements found</h4>
                <p className="text-xs text-slate-500 max-w-[200px] mt-1 mx-auto">
                  {searchTerm !== ""
                    ? "Try adjusting your search filters to find what you're looking for."
                    : "This list is currently empty. New posts will appear here."}
                </p>
                {searchTerm !== "" && (
                  <button onClick={clearFilters} className="mt-4 text-xs font-bold text-[#800000] hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncement;