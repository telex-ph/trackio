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
  Shield
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

// ✅ UPDATED: Import the Roles object correctly
import Roles from "../../constants/roles";

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // Default to 'pending' tab

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [selectedAnnouncementViews, setSelectedAnnouncementViews] = useState([]);
  const [selectedAnnouncementLikes, setSelectedAnnouncementLikes] = useState([]);
  const [selectedAnnouncementTitle, setSelectedAnnouncementTitle] = useState('');
  const [itemToCancel, setItemToCancel] = useState(null);
  const [itemToRepost, setItemToRepost] = useState(null);
  const [fileViewModal, setFileViewModal] = useState({
    isOpen: false,
    file: null,
  });

  const user = useStore((state) => state.user);

  // ✅ CORRECTED: Get user's full name
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

  // ✅ CORRECTED: Check if current user can approve announcements
  const canCurrentUserApprove = useMemo(() => {
    return user?.role === Roles.ADMIN_HR_HEAD || user?.role === Roles.COMPLIANCE_HEAD;
  }, [user?.role]);

  // ✅ Check if current user can auto-post (no approval needed)
  const canAutoPost = useMemo(() => {
    return canCurrentUserApprove; // Same users who can approve can also auto-post
  }, [canCurrentUserApprove]);

  // ✅ REAL-TIME CURRENT DATE/TIME
  const [currentDateTime, setCurrentDateTime] = useState(() => DateTime.local());

  // Update current time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(DateTime.local());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ REAL-TIME TIME DISPLAY FUNCTION
  const getCurrentDateTime = useCallback(() => {
    const now = DateTime.local();
    return {
      dateInput: now.toISODate(),
      timeInput: now.toFormat('HH:mm'),
      displayTime: now.toFormat('HH:mm:ss'),
      displayDate: now.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
    };
  }, []);

  // ✅ FIXED: Initialize form data with current date/time
  const [formData, setFormData] = useState(() => {
    const currentDateTime = getCurrentDateTime();
    const userName = getUserFullName();
    
    return {
      title: "",
      dateTime: "",
      postedBy: userName, 
      agenda: "",
      priority: "Medium",
      category: "Department", // Default
      duration: "1w", // Default
      dateInput: currentDateTime.dateInput,
      timeInput: currentDateTime.timeInput,
    };
  });

  // ✅ FIXED: Auto-update form time for NEW announcements only
  useEffect(() => {
    if (!isEditMode) {
      setFormData(prev => ({
        ...prev,
        dateInput: getCurrentDateTime().dateInput,
        timeInput: getCurrentDateTime().timeInput
      }));
    }
  }, [currentDateTime, isEditMode, getCurrentDateTime]);

  // ✅ FIXED: FETCH ANNOUNCEMENTS - CORRECT FILTERING LOGIC
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching announcements from database...");
      const response = await api.get("/announcements");
      
      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Successfully loaded", response.data.length, "announcements");
        
        const now = DateTime.local();
        const processedAnnouncements = response.data.map(announcement => {
          // ✅ FIXED: Check expiry correctly
          const expiresAt = announcement.expiresAt ? DateTime.fromISO(announcement.expiresAt) : null;
          const isExpired = expiresAt && expiresAt <= now;
          
          // ✅ FIXED: Determine actual status
          let actualStatus = announcement.status;
          if (announcement.approvalStatus === 'Pending') {
            actualStatus = 'Pending';
          } else if (announcement.status === 'Active' && isExpired) {
            actualStatus = 'Expired';
          }

          return {
            ...announcement,
            originalDateTime: announcement.dateTime,
            isExpired: isExpired,
            actualStatus: actualStatus,
            frozenTimeAgo: announcement.status === "Inactive" ? 
              formatTimeAgo(announcement.cancelledAt || announcement.dateTime) : null
          };
        });

        // ✅ FIXED: Sort by actual status
        const sortedAll = processedAnnouncements.sort((a, b) => {
          const statusOrder = { 
            'Pending': 4, 
            'Active': 3, 
            'Expired': 2, 
            'Inactive': 1 
          };
          
          if (statusOrder[b.actualStatus] !== statusOrder[a.actualStatus]) {
            return statusOrder[b.actualStatus] - statusOrder[a.actualStatus];
          }

          const priorityA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }

          return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
        });

        setAnnouncements(sortedAll);
        console.log("📊 Announcements loaded:", {
          total: sortedAll.length,
          pending: sortedAll.filter(a => a.actualStatus === 'Pending').length,
          active: sortedAll.filter(a => a.actualStatus === 'Active').length,
          expired: sortedAll.filter(a => a.actualStatus === 'Expired').length,
          inactive: sortedAll.filter(a => a.actualStatus === 'Inactive').length
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

  // ✅ FIXED: IMPROVED SOCKET LISTENERS WITH CORRECT STATUS HANDLING
  useEffect(() => {
    if (!socket) {
      console.log("❌ Socket not available, using API only");
      fetchAnnouncements();
      return;
    }

    console.log("🔄 Setting up socket listeners for admin...");

    let dataLoaded = false;

    // Listen for initial data from socket
    const handleInitialData = (socketAnnouncements) => {
      console.log("📥 Received initial admin data via socket:", socketAnnouncements?.length);
      
      if (Array.isArray(socketAnnouncements) && socketAnnouncements.length > 0) {
        const now = DateTime.local();
        const processedAnnouncements = socketAnnouncements.map(announcement => {
          const expiresAt = announcement.expiresAt ? DateTime.fromISO(announcement.expiresAt) : null;
          const isExpired = expiresAt && expiresAt <= now;
          
          let actualStatus = announcement.status;
          if (announcement.approvalStatus === 'Pending') {
            actualStatus = 'Pending';
          } else if (announcement.status === 'Active' && isExpired) {
            actualStatus = 'Expired';
          }

          return {
            ...announcement,
            originalDateTime: announcement.dateTime,
            isExpired: isExpired,
            actualStatus: actualStatus,
            frozenTimeAgo: announcement.status === "Inactive" ? 
              formatTimeAgo(announcement.cancelledAt || announcement.dateTime) : null
          };
        });

        const sortedAll = processedAnnouncements.sort((a, b) => {
          const statusOrder = { 
            'Pending': 4, 
            'Active': 3, 
            'Expired': 2, 
            'Inactive': 1 
          };
          
          if (statusOrder[b.actualStatus] !== statusOrder[a.actualStatus]) {
            return statusOrder[b.actualStatus] - statusOrder[a.actualStatus];
          }

          const priorityA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
        });

        setAnnouncements(sortedAll);
        setIsLoading(false);
        dataLoaded = true;
        console.log("✅ Socket data loaded successfully");
      }
    };

    // Listen for admin stats updates
    const handleAdminUpdate = (detailedStats) => {
      console.log("📈 Real-time admin stats update:", detailedStats);
      
      setAnnouncements(prev => prev.map(ann => {
        if (ann._id === detailedStats.announcementId) {
          return {
            ...ann,
            views: detailedStats.viewedBy || ann.views,
            acknowledgements: detailedStats.likedBy || ann.acknowledgements,
          };
        }
        return ann;
      }));
    };

    // Listen for new announcements
    const handleNewAnnouncement = (newAnnouncement) => {
      console.log("🆕 New announcement received via socket:", newAnnouncement);
      
      const now = DateTime.local();
      const expiresAt = newAnnouncement.expiresAt ? DateTime.fromISO(newAnnouncement.expiresAt) : null;
      const isExpired = expiresAt && expiresAt <= now;
      
      let actualStatus = newAnnouncement.status;
      if (newAnnouncement.approvalStatus === 'Pending') {
        actualStatus = 'Pending';
      } else if (newAnnouncement.status === 'Active' && isExpired) {
        actualStatus = 'Expired';
      }
      
      const processedAnnouncement = {
        ...newAnnouncement,
        originalDateTime: newAnnouncement.dateTime,
        isExpired: isExpired,
        actualStatus: actualStatus,
        frozenTimeAgo: null
      };
      
      setAnnouncements(prev => {
        const exists = prev.find(a => a._id === processedAnnouncement._id);
        if (exists) return prev.map(a => 
          a._id === processedAnnouncement._id ? processedAnnouncement : a
        );
        
        return [processedAnnouncement, ...prev].sort((a, b) => {
          const statusOrder = { 
            'Pending': 4, 
            'Active': 3, 
            'Expired': 2, 
            'Inactive': 1 
          };
          
          if (statusOrder[b.actualStatus] !== statusOrder[a.actualStatus]) {
            return statusOrder[b.actualStatus] - statusOrder[a.actualStatus];
          }

          const priorityA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
        });
      });
      
      // Show appropriate notification based on status
      if (newAnnouncement.approvalStatus === 'Pending') {
        showNotification("Announcement submitted for approval!", "success");
        setActiveTab('pending');
      } else {
        showNotification("New announcement posted!", "success");
        setActiveTab('active');
      }
    };

    // Listen for announcement updates
    const handleAnnouncementUpdated = (updatedAnnouncement) => {
      console.log("📝 Announcement updated via socket");
      
      const now = DateTime.local();
      const expiresAt = updatedAnnouncement.expiresAt ? DateTime.fromISO(updatedAnnouncement.expiresAt) : null;
      const isExpired = expiresAt && expiresAt <= now;
      
      let actualStatus = updatedAnnouncement.status;
      if (updatedAnnouncement.approvalStatus === 'Pending') {
        actualStatus = 'Pending';
      } else if (updatedAnnouncement.status === 'Active' && isExpired) {
        actualStatus = 'Expired';
      }
      
      const processedAnnouncement = {
        ...updatedAnnouncement,
        originalDateTime: updatedAnnouncement.originalDateTime || updatedAnnouncement.dateTime,
        isExpired: isExpired,
        actualStatus: actualStatus,
        frozenTimeAgo: updatedAnnouncement.status === "Inactive" ? 
          formatTimeAgo(updatedAnnouncement.cancelledAt || updatedAnnouncement.dateTime) : null
      };
      
      setAnnouncements(prev => prev.map(ann => 
        ann._id === processedAnnouncement._id ? processedAnnouncement : ann
      ));
    };

    // Listen for cancellations
    const handleAnnouncementCancelled = (data) => {
      console.log("🔴 Cancellation confirmed via socket:", data.announcementId);
      
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === data.announcementId 
            ? { 
                ...ann, 
                status: "Inactive",
                approvalStatus: 'Approved',
                actualStatus: 'Inactive',
                cancelledBy: data.cancelledBy,
                cancelledAt: data.cancelledAt || new Date().toISOString(),
                frozenTimeAgo: formatTimeAgo(data.cancelledAt || new Date().toISOString()),
                views: [],
                acknowledgements: []
              }
            : ann
        )
      );
    };

    // Listen for reposts
    const handleAnnouncementReposted = (repostedAnnouncement) => {
      console.log("🟢 Repost confirmed via socket:", repostedAnnouncement._id);
      
      const currentTime = new Date().toISOString();
      const now = DateTime.local();
      const expiresAt = repostedAnnouncement.expiresAt ? DateTime.fromISO(repostedAnnouncement.expiresAt) : null;
      const isExpired = expiresAt && expiresAt <= now;
      
      const processedAnnouncement = {
        ...repostedAnnouncement,
        status: "Active",
        approvalStatus: 'Approved',
        actualStatus: 'Active',
        dateTime: currentTime,
        originalDateTime: currentTime,
        isExpired: isExpired,
        frozenTimeAgo: null,
        cancelledAt: null,
        cancelledBy: null,
        views: [],
        acknowledgements: []
      };
      
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === processedAnnouncement._id 
            ? processedAnnouncement
            : ann
        )
      );
    };

    // ✅ ADDED: Listen for approval events
    const handleAnnouncementApproved = (approvedAnnouncement) => {
      console.log("✅ Approval confirmed via socket:", approvedAnnouncement._id);
      
      const now = DateTime.local();
      const expiresAt = approvedAnnouncement.expiresAt ? DateTime.fromISO(approvedAnnouncement.expiresAt) : null;
      const isExpired = expiresAt && expiresAt <= now;
      
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === approvedAnnouncement._id 
            ? {
                ...ann,
                approvalStatus: 'Approved',
                status: 'Active',
                actualStatus: 'Active',
                approvedBy: approvedAnnouncement.approvedBy,
                dateTime: approvedAnnouncement.dateTime || new Date().toISOString(),
                originalDateTime: approvedAnnouncement.dateTime || new Date().toISOString(),
                isExpired: isExpired,
                frozenTimeAgo: null,
                views: [],
                acknowledgements: []
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
    };
  }, [fetchAnnouncements]);

  // Update form with user's name
  useEffect(() => {
    const userName = getUserFullName();
    setFormData(prev => ({
      ...prev,
      postedBy: userName
    }));
  }, [getUserFullName]);

  // ✅ FIXED: CORRECT FILTER LOGIC WITH PROPER STATUS HANDLING
  const filteredAnnouncements = useMemo(() => {
    const filtered = announcements.filter(announcement => {
      const searchMatch = searchTerm === '' || 
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.postedBy?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!searchMatch) return false;

      if (activeTab === 'pending') {
        return announcement.actualStatus === 'Pending';
      } else if (activeTab === 'active') {
        return announcement.actualStatus === 'Active';
      } else {
        // History tab: Show both Expired and Inactive
        return announcement.actualStatus === 'Expired' || 
               announcement.actualStatus === 'Inactive';
      }
    });

    return filtered.sort((a, b) => {
      if (activeTab === 'pending') {
        return DateTime.fromISO(a.createdAt || a.dateTime).toMillis() - 
               DateTime.fromISO(b.createdAt || b.dateTime).toMillis();
      } else {
        const priorityA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
        const priorityB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

        if (priorityB !== priorityA) {
          return priorityB - priorityA;
        }
        return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
      }
    });
  }, [announcements, searchTerm, activeTab]);

  // ✅ FIXED: CORRECT COUNTS USING actualStatus
  const activeCount = useMemo(() => 
    announcements.filter(a => a.actualStatus === "Active").length, 
    [announcements]);
  
  const inactiveCount = useMemo(() => 
    announcements.filter(a => a.actualStatus === "Inactive" || a.actualStatus === "Expired").length, 
    [announcements]);
  
  const pendingCount = useMemo(() => 
    announcements.filter(a => a.actualStatus === "Pending").length, 
    [announcements]);

  const clearFilters = () => {
    setSearchTerm('');
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
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcement._id 
            ? { ...a, isLoadingViews: true }
            : a
        )
      );

      const viewsData = Array.isArray(announcement.views) ? announcement.views : [];
      setSelectedAnnouncementViews(viewsData);
      setSelectedAnnouncementTitle(announcement.title);
      setIsViewsModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching view details:", error);
      showNotification("Failed to load view details", "error");
    } finally {
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcement._id 
            ? { ...a, isLoadingViews: false }
            : a
        )
      );
    }
  };

  const handleLikeDetails = async (announcement) => {
    try {
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcement._id 
            ? { ...a, isLoadingLikes: true }
            : a
        )
      );

      const likesData = Array.isArray(announcement.acknowledgements) ? announcement.acknowledgements : [];
      setSelectedAnnouncementLikes(likesData);
      setSelectedAnnouncementTitle(announcement.title);
      setIsLikesModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching like details:", error);
      showNotification("Failed to load like details", "error");
    } finally {
      setAnnouncements(prev => 
        prev.map(a => 
          a._id === announcement._id 
            ? { ...a, isLoadingLikes: false }
            : a
        )
      );
    }
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
    setEditingId(null);
  };

  const handlePreview = () => {
    if (!formData.title || 
        !formData.dateInput || 
        !formData.timeInput || 
        !formData.postedBy || 
        !formData.agenda) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    const combinedDateTime = DateTime.fromISO(`${formData.dateInput}T${formData.timeInput}`);
    if (!combinedDateTime.isValid) {
      showNotification("Invalid date or time. Please check your input.", "error");
      return;
    }

    setIsPreviewModalOpen(true);
  };

  // ✅ FIXED: CALCULATE EXPIRES_AT BASED ON DURATION
  const calculateExpiresAt = (dateTime, duration) => {
    const dt = DateTime.fromISO(dateTime);
    
    switch(duration) {
      case '24h':
        return dt.plus({ hours: 24 }).toISO();
      case '3d':
        return dt.plus({ days: 3 }).toISO();
      case '1w':
        return dt.plus({ weeks: 1 }).toISO();
      case '1m':
        return dt.plus({ months: 1 }).toISO();
      case 'permanent':
        return null; // No expiry for permanent
      default:
        return dt.plus({ weeks: 1 }).toISO();
    }
  };

  // ✅ FIXED: HANDLE SUBMIT WITH CORRECT STATUS AND EXPIRY LOGIC
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const combinedDateTime = DateTime.fromISO(`${formData.dateInput}T${formData.timeInput}`);

      if (!combinedDateTime.isValid) {
        showNotification("Invalid date or time format", "error");
        setIsSubmitting(false);
        return;
      }

      let announcementAttachment = null;

      // ✅ CLOUDINARY UPLOAD
      if (selectedFile) {
        showNotification("Uploading file to Cloudinary...", "info");
        
        const formDataObj = new FormData();
        formDataObj.append("file", selectedFile);
        
        try {
          const uploadResponse = await api.post(
            "/upload/announcement", 
            formDataObj, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          announcementAttachment = uploadResponse.data;
          console.log("✅ File uploaded to Cloudinary:", announcementAttachment);
          showNotification("File uploaded successfully to Cloudinary.", "success");
        } catch (uploadError) {
          console.error("❌ Cloudinary upload failed:", uploadError);
          showNotification("Failed to upload file. Please try again.", "error");
          setIsSubmitting(false);
          return;
        }
      }

      // ✅ CALCULATE EXPIRES_AT
      const expiresAt = calculateExpiresAt(combinedDateTime.toISO(), formData.duration);
      
      // ✅ I-prepare ang final payload
      const isAutoApproved = canAutoPost;
      
      const payload = {
        title: formData.title,
        postedBy: formData.postedBy,
        agenda: formData.agenda,
        priority: formData.priority,
        category: formData.category,
        duration: formData.duration,
        expiresAt: expiresAt,
        dateTime: combinedDateTime.toISO(),
        // ✅ SET CORRECT STATUS BASED ON USER ROLE
        status: isAutoApproved ? "Active" : "Pending",
        approvalStatus: isAutoApproved ? "Approved" : "Pending",
        userRole: user?.role,
        department: user?.department || 'Unknown',
        views: [],
        acknowledgements: [],
        attachment: announcementAttachment
      };

      console.log("📤 Submitting payload:", payload);

      let response;
      if (isEditMode) {
        console.log("✏️ Updating announcement:", editingId);
        response = await api.put(`/announcements/${editingId}`, payload);

        if (response.status === 200) {
          const isAutoApprovedEdit = canAutoPost;
          const successMessage = isAutoApprovedEdit 
            ? "Announcement updated and auto-approved!" 
            : "Announcement updated! Waiting for approval.";
          
          showNotification(successMessage, "success");
          
          const updatedAnnouncement = {
            ...response.data,
            _id: editingId,
            status: isAutoApprovedEdit ? "Active" : "Pending",
            approvalStatus: isAutoApprovedEdit ? "Approved" : "Pending",
            actualStatus: isAutoApprovedEdit ? "Active" : "Pending",
            views: response.data.views || [],
            acknowledgements: response.data.acknowledgements || [],
            originalDateTime: response.data.originalDateTime || response.data.dateTime,
            frozenTimeAgo: null
          };
          
          if (socket) {
            socket.emit("announcementUpdated", updatedAnnouncement);
            socket.emit("newAnnouncement", updatedAnnouncement);
          }
        } else {
          throw new Error(`Update failed with status: ${response.status}`);
        }
      } else {
        console.log("📝 Creating new announcement");
        response = await api.post(`/announcements`, payload);

        if (response.status === 201 || response.status === 200) {
          if (response.data.approvalStatus === 'Pending') {
            showNotification("Announcement submitted for approval to Department Head.", "success");
            setActiveTab('pending');
          } else {
            showNotification("Announcement posted and automatically approved.", "success");
            setActiveTab('active');
          }
          
          if (socket && response.data) {
            const newAnnouncement = {
              ...response.data,
              originalDateTime: response.data.dateTime,
              actualStatus: response.data.approvalStatus === 'Pending' ? 'Pending' : 'Active',
              frozenTimeAgo: null
            };
            socket.emit("newAnnouncement", newAnnouncement);
          }
        } else {
          throw new Error(`Creation failed with status: ${response.status}`);
        }
      }
      
      resetForm();
      setIsPreviewModalOpen(false);

      // Force refresh data
      if (socket) {
        socket.emit("getAdminData");
        socket.emit("getAgentData");
      }

    } catch (error) {
      console.error("❌ Error submitting announcement:", error);
      showNotification(`Failed to ${isEditMode ? "update" : "create"} announcement. Please try again.`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ FIXED: APPROVE HANDLER WITH EXPIRES_AT UPDATE
  const handleApprove = async (id) => {
    if (!canCurrentUserApprove) {
      showNotification("Error: Only ADMIN_HR_HEAD or COMPLIANCE_HEAD can approve announcements.", "error");
      return;
    }

    try {
      const announcementToApprove = announcements.find(a => a._id === id);
      if (!announcementToApprove) {
        showNotification("Announcement not found", "error");
        return;
      }

      const currentTime = new Date().toISOString();
      const expiresAt = calculateExpiresAt(currentTime, announcementToApprove.duration || '1w');
      
      const response = await api.post(`/announcements/${id}/approve`, {
        approverName: getUserFullName(),
        approverRole: user?.role,
        approvedAt: currentTime,
        dateTime: currentTime, // ✅ Reset time when approved
        expiresAt: expiresAt    // ✅ Set new expiry based on current time
      });
      
      if (response.status === 200) {
        showNotification(`Announcement approved by ${getUserFullName()}! Time starts now.`, "success");
        
        const approvedAnnouncement = {
          ...response.data,
          _id: id,
          approvalStatus: 'Approved',
          status: 'Active',
          actualStatus: 'Active',
          approvedBy: getUserFullName(),
          dateTime: currentTime,
          expiresAt: expiresAt,
          originalDateTime: currentTime,
          frozenTimeAgo: null,
          views: [],
          acknowledgements: []
        };
        
        setAnnouncements(prev => prev.map(a => 
          a._id === id ? approvedAnnouncement : a
        ));
        
        setActiveTab('active');
        
        if (socket) {
          socket.emit("announcementApproved", approvedAnnouncement);
          socket.emit("announcementUpdated", approvedAnnouncement);
          socket.emit("newAnnouncement", approvedAnnouncement);
        }
      }
    } catch (error) {
      console.error("Approval failed", error);
      showNotification("Failed to approve announcement.", "error");
    }
  };

  const handleEdit = (announcement) => {
    setIsEditMode(true);
    setEditingId(announcement._id);

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
  };

  const handleCancelClick = (id) => {
    setItemToCancel(id);
    setIsConfirmationModalOpen(true);
  };

  // ✅ FIXED: CANCELLATION WITH CORRECT STATUS
  const handleConfirmCancel = async () => {
    try {
      const announcementToCancel = announcements.find(a => a._id === itemToCancel);
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
        acknowledgements: []
      };

      let response;
      try {
        response = await api.patch(`/announcements/${itemToCancel}`, payload);
        console.log("✅ PATCH response:", response.data);
        
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToCancel 
              ? { 
                  ...ann, 
                  ...payload,
                  frozenTimeAgo: formatTimeAgo(currentTime),
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          socket.emit("announcementCancelled", {
            announcementId: itemToCancel,
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime
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
          acknowledgements: []
        };
        delete putPayload._id;
        delete putPayload.__v;
        response = await api.put(`/announcements/${itemToCancel}`, putPayload);
        console.log("✅ PUT response:", response.data);
        
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToCancel 
              ? { 
                  ...ann, 
                  ...putPayload,
                  frozenTimeAgo: formatTimeAgo(currentTime),
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          socket.emit("announcementCancelled", {
            announcementId: itemToCancel,
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime
          });
        }
      }

      showNotification("Announcement cancelled successfully!", "success");
      setActiveTab('inactive');

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

  // ✅ FIXED: REPOSTING WITH NEW EXPIRES_AT
  const handleConfirmRepost = async () => {
    try {
      const announcementToRepost = announcements.find(a => a._id === itemToRepost);
      if (!announcementToRepost) {
        showNotification("Announcement not found", "error");
        return;
      }

      console.log("🔄 Reposting announcement:", itemToRepost);

      const currentTime = new Date().toISOString();
      const expiresAt = calculateExpiresAt(currentTime, announcementToRepost.duration || '1w');

      const payload = {
        status: "Active",
        actualStatus: "Active",
        dateTime: currentTime,
        expiresAt: expiresAt,
        updatedAt: currentTime,
        cancelledAt: null,
        cancelledBy: null,
        views: [],
        acknowledgements: []
      };

      let response;
      try {
        response = await api.patch(`/announcements/${itemToRepost}`, payload);
        console.log("✅ PATCH response:", response.data);
        
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToRepost 
              ? { 
                  ...ann, 
                  ...payload,
                  originalDateTime: currentTime,
                  frozenTimeAgo: null,
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          const repostedAnnouncement = {
            ...announcementToRepost,
            ...payload,
            _id: itemToRepost,
            originalDateTime: currentTime,
            frozenTimeAgo: null
          };
          socket.emit("announcementReposted", repostedAnnouncement);
        }
        
      } catch (patchError) {
        console.log("🔄 PATCH failed, trying PUT:", patchError);
        const putPayload = {
          ...announcementToRepost,
          status: "Active",
          actualStatus: "Active",
          dateTime: currentTime,
          expiresAt: expiresAt,
          updatedAt: currentTime,
          cancelledAt: null,
          cancelledBy: null,
          views: [],
          acknowledgements: []
        };
        delete putPayload._id;
        delete putPayload.__v;
        response = await api.put(`/announcements/${itemToRepost}`, putPayload);
        console.log("✅ PUT response:", response.data);
        
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToRepost 
              ? { 
                  ...ann, 
                  ...putPayload,
                  originalDateTime: currentTime,
                  frozenTimeAgo: null,
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          const repostedAnnouncement = {
            ...announcementToRepost,
            ...putPayload,
            _id: itemToRepost,
            originalDateTime: currentTime,
            frozenTimeAgo: null
          };
          socket.emit("announcementReposted", repostedAnnouncement);
        }
      }

      showNotification("Announcement reposted successfully!", "success");
      setActiveTab('active');

    } catch (error) {
      console.error("❌ Error reposting announcement:", error);
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
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ✅ FIXED: STATUS COLOR USING actualStatus
  const getStatusColor = (actualStatus) => {
    switch(actualStatus) {
      case 'Pending': return "bg-orange-100 text-orange-600";
      case 'Active': return "bg-green-100 text-green-700";
      case 'Expired': return "bg-pink-100 text-pink-600";
      case 'Inactive': return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  // ✅ TIME AGO FUNCTION
  const formatTimeAgo = (isoDateStr) => {
    if (!isoDateStr) return "";
    const announcementTime = DateTime.fromISO(isoDateStr);
    if (!announcementTime.isValid) return "";
    
    return announcementTime.toRelative();
  };

  // ✅ SMART TIME DISPLAY USING actualStatus
  const getSmartTimeAgo = (announcement) => {
    switch(announcement.actualStatus) {
      case 'Pending':
        return '⏸️ Waiting for approval';
      case 'Inactive':
        return announcement.frozenTimeAgo || formatTimeAgo(announcement.cancelledAt || announcement.dateTime);
      case 'Expired':
        return 'Expired';
      case 'Active':
        return formatTimeAgo(announcement.dateTime);
      default:
        return formatTimeAgo(announcement.dateTime);
    }
  };

  return (
    <div className="pb-4">
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

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

      <section className="flex flex-col mb-4 px-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Announcements</h2>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Role: <span className="font-semibold text-blue-600">{user?.role || "Unknown"}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm">Manage and view all company announcements with real-time updates.</p>
      </section>

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
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm"
                >
                  <option value="Department">Department Specific</option>
                  <option value="General">General (All Company)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
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
                          {selectedFile.name || selectedFile.originalName || "Uploaded file"}
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
                      <p className="text-xs text-gray-400 mt-1">Max 10MB (Will be uploaded to Cloudinary)</p>
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
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : isEditMode ? (
                "Update Announcement"
              ) : canAutoPost ? (
                "Preview & Auto-Post"
              ) : (
                "Preview & Submit for Approval"
              )}
            </button>
            {!isEditMode && !canAutoPost && (
              <p className="text-xs text-center text-orange-600 mt-1">
                ⚠️ Your post requires approval from Admin&HR Head or Compliance  before going live.
              </p>
            )}
            {!isEditMode && canAutoPost && (
              <p className="text-xs text-center text-green-600 mt-1">
                ✅ As a Department Head, your posts are automatically approved.
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
                
                {searchTerm !== '' && (
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
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none ${
                    activeTab === 'pending' 
                      ? 'bg-white text-orange-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Approvals ({pendingCount})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none ${
                    activeTab === 'active' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setActiveTab('inactive')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex-1 sm:flex-none ${
                    activeTab === 'inactive' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
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
                    a.actualStatus === 'Inactive' || a.actualStatus === 'Pending'
                      ? 'bg-gray-100 border border-gray-300 opacity-90' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100'
                  }`}
                >
                  {/* CATEGORY & EXPIRY BADGE */}
                  <div className="flex items-center gap-2 mb-2">
                    {a.category === 'General' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> GENERAL
                      </span>
                    )}
                    {a.expiresAt && (
                      <span className={`text-[10px] border border-gray-200 px-1 rounded font-medium ${
                        a.isExpired 
                          ? 'bg-pink-100 text-pink-700' 
                          : 'text-gray-500 bg-gray-50'
                      }`}>
                        {a.isExpired 
                          ? 'EXPIRED' 
                          : `Expires: ${DateTime.fromISO(a.expiresAt).toRelative()}`
                        }
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <div className="flex items-start gap-2 w-full">
                      <div className={`p-1 rounded-lg mt-1 ${
                        a.actualStatus === 'Inactive' ? 'bg-gray-300' : 'bg-indigo-100'
                      }`}>
                        <Bell className={`w-3 h-3 ${
                          a.actualStatus === 'Inactive' ? 'text-gray-600' : 'text-indigo-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold mb-1 group-hover:text-indigo-600 transition-colors truncate ${
                          a.actualStatus === 'Inactive' ? 'text-gray-600' : 'text-gray-800'
                        }`}>
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
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(a.actualStatus)}`}>
                            {a.actualStatus === 'Pending' ? 'Pending Approval' : a.actualStatus}
                          </span>
                          <span className={`text-xs ${
                            a.actualStatus === 'Pending' 
                              ? 'text-orange-600 font-medium' 
                              : 'text-gray-500'
                          }`}>
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
                    {a.approvalStatus === 'Approved' && a.approvedBy && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Approved by:{" "}
                        <span className="font-medium text-green-700">{a.approvedBy}</span>
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
                        disabled={a.actualStatus === 'Pending' || a.isLoadingViews}
                        className={`flex items-center gap-1 transition-colors ${
                          a.actualStatus === 'Pending' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'hover:text-blue-600'
                        }`}
                        title={a.actualStatus === 'Pending' ? "Views will start after approval" : "View who viewed this"}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{Array.isArray(a.views) ? a.views.length : 0} views</span>
                        {a.actualStatus === 'Pending' && (
                          <span className="text-[10px] text-gray-400">(locked)</span>
                        )}
                        {a.isLoadingViews && (
                          <div className="ml-1 w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                      <button
                        onClick={() => handleLikeDetails(a)}
                        disabled={a.actualStatus === 'Pending' || a.isLoadingLikes}
                        className={`flex items-center gap-1 transition-colors ${
                          a.actualStatus === 'Pending' 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'hover:text-red-600'
                        }`}
                        title={a.actualStatus === 'Pending' ? "Likes will start after approval" : "View who liked this"}
                      >
                        <Heart className="w-3 h-3 text-red-500" fill={a.actualStatus === 'Pending' ? 'none' : 'currentColor'} />
                        <span>{Array.isArray(a.acknowledgements) ? a.acknowledgements.length : 0} Likes</span>
                        {a.actualStatus === 'Pending' && (
                          <span className="text-[10px] text-gray-400">(locked)</span>
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
                    {/* PENDING TAB BUTTONS (Approval Flow) */}
                    {activeTab === 'pending' && a.actualStatus === 'Pending' && canCurrentUserApprove && (
                      <button
                        onClick={() => handleApprove(a._id)}
                        className="flex-1 bg-green-500 text-white p-1.5 rounded-lg hover:bg-green-600 transition-all font-medium text-xs shadow-sm flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve & Start Time
                      </button>
                    )}
                    
                    {activeTab === 'pending' && a.actualStatus === 'Pending' && !canCurrentUserApprove && (
                      <span className="flex-1 text-center text-xs text-orange-600 bg-orange-50 p-1.5 rounded-lg border border-orange-200 font-medium">
                        ⏸️ Waiting for Head's approval
                      </span>
                    )}

                    {/* ACTIVE TAB BUTTONS (Cancel & Edit) */}
                    {activeTab === 'active' && a.actualStatus === 'Active' && (
                      <>
                        <button
                          onClick={() => handleCancelClick(a._id)}
                          className="flex-1 bg-white border border-red-500 text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all font-medium text-xs shadow-sm hover:shadow"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEdit(a)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-1.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium text-xs shadow-sm hover:shadow"
                        >
                          Edit
                        </button>
                      </>
                    )}

                    {/* INACTIVE TAB BUTTONS (Repost) */}
                    {activeTab === 'inactive' && (a.actualStatus === 'Inactive' || a.actualStatus === 'Expired') && (
                      <button
                        onClick={() => handleRepostClick(a._id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-xs shadow-sm hover:shadow flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Repost with Fresh Time
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500 italic text-sm">
              {searchTerm !== '' ? (
                <>
                  <Filter className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-center">No announcements match your search.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    Clear search
                  </button>
                </>
              ) : activeTab === 'active' ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p>No active announcements found.</p>
                  <p className="text-xs text-gray-400 mt-1">Create a new announcement or check pending approvals.</p>
                </>
              ) : activeTab === 'pending' ? (
                <>
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>No announcements pending approval.</p>
                  <p className="text-xs text-gray-400 mt-1">All announcements have been approved or there are no new submissions.</p>
                </>
              ) : (
                <>
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p>No inactive announcements found.</p>
                  <p className="text-xs text-gray-400 mt-1">No announcements have been cancelled or expired yet.</p>
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