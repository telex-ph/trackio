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
  RotateCcw
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

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states - SEARCH ONLY
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  // ✅ FIXED: REAL-TIME CURRENT DATE/TIME WITH LIVE UPDATES EVERY SECOND
  const [currentDateTime, setCurrentDateTime] = useState(() => DateTime.local());

  // Update current time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(DateTime.local());
    }, 1000); // Update every second for real-time feel

    return () => clearInterval(interval);
  }, []);

  // ✅ FIXED: REAL-TIME TIME DISPLAY FUNCTION
  const getCurrentDateTime = useCallback(() => {
    const now = DateTime.local();
    return {
      dateInput: now.toISODate(),
      timeInput: now.toFormat('HH:mm'),
      displayTime: now.toFormat('HH:mm:ss'),
      displayDate: now.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
    };
  }, []);

  const [formData, setFormData] = useState(() => {
    const currentDateTime = getCurrentDateTime();
    const userName = getUserFullName();
    
    return {
      title: "",
      dateTime: "",
      postedBy: userName, 
      agenda: "",
      priority: "Medium",
      dateInput: currentDateTime.dateInput,
      timeInput: currentDateTime.timeInput,
    };
  });

  // ✅ FIXED: AUTO-UPDATE FORM TIME WHEN CURRENT TIME CHANGES (FOR NEW ANNOUNCEMENTS ONLY)
  useEffect(() => {
    if (!isEditMode) {
      const updatedDateTime = getCurrentDateTime();
      setFormData(prev => ({
        ...prev,
        dateInput: updatedDateTime.dateInput,
        timeInput: updatedDateTime.timeInput
      }));
    }
  }, [currentDateTime, isEditMode, getCurrentDateTime]);

  // ✅ FIXED: BETTER ERROR HANDLING
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching announcements from database...");
      const response = await api.get("/announcements");
      
      // ✅ CHECK IF RESPONSE IS VALID
      if (response.data && Array.isArray(response.data)) {
        console.log("✅ Successfully loaded", response.data.length, "announcements");
        
        const processedAnnouncements = response.data.map(announcement => ({
          ...announcement,
          // ✅ ADDED: Store original creation time for inactive announcements
          originalDateTime: announcement.dateTime,
          // ✅ ADDED: Store cancellation time for time freezing
          frozenTimeAgo: announcement.status === "Inactive" ? 
            formatTimeAgo(announcement.cancelledAt || announcement.dateTime) : null
        }));

        const sortedAll = processedAnnouncements.sort((a, b) => {
          const priorityA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }

          return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
        });

        setAnnouncements(sortedAll);
      } else {
        // Only show error if no data at all
        console.warn("⚠️ No data received from API");
        setAnnouncements([]);
      }
      
    } catch (err) {
      console.error("❌ API Error:", err);
      
      // ✅ ONLY SHOW ERROR FOR REAL FAILURES
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

  // ✅ IMPROVED SOCKET LISTENERS FOR BETTER REAL-TIME SYNC
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
        const processedAnnouncements = socketAnnouncements.map(announcement => ({
          ...announcement,
          // ✅ ADDED: Store original creation time for inactive announcements
          originalDateTime: announcement.dateTime,
          // ✅ ADDED: Store cancellation time for time freezing
          frozenTimeAgo: announcement.status === "Inactive" ? 
            formatTimeAgo(announcement.cancelledAt || announcement.dateTime) : null
        }));

        const sortedAll = processedAnnouncements.sort((a, b) => {
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

    // ✅ IMPROVED: REAL-TIME LIKES/VIEWS UPDATES
    const handleAdminUpdate = (detailedStats) => {
      console.log("📈 Real-time admin stats update:", detailedStats);
      
      setAnnouncements(prev => prev.map(ann => {
        if (ann._id === detailedStats.announcementId) {
          console.log("🔄 Updating announcement:", ann.title);
          console.log("👀 New views count:", detailedStats.totalViews);
          console.log("❤️ New likes count:", detailedStats.totalLikes);
          
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
      console.log("🆕 New announcement received via socket");
      
      const processedAnnouncement = {
        ...newAnnouncement,
        // ✅ ADDED: Store original creation time
        originalDateTime: newAnnouncement.dateTime,
        frozenTimeAgo: null
      };
      
      setAnnouncements(prev => {
        const exists = prev.find(a => a._id === processedAnnouncement._id);
        if (exists) return prev;
        
        return [processedAnnouncement, ...prev].sort((a, b) => {
          const priorityA = a.priority === "High" ? 3 : a.priority === "Medium" ? 2 : 1;
          const priorityB = b.priority === "High" ? 3 : b.priority === "Medium" ? 2 : 1;

          if (priorityB !== priorityA) {
            return priorityB - priorityA;
          }
          return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
        });
      });
      
      showNotification("New announcement posted!", "success");
    };

    // Listen for announcement updates
    const handleAnnouncementUpdated = (updatedAnnouncement) => {
      console.log("📝 Announcement updated via socket");
      
      const processedAnnouncement = {
        ...updatedAnnouncement,
        // ✅ PRESERVE ORIGINAL TIME DATA
        originalDateTime: updatedAnnouncement.originalDateTime || updatedAnnouncement.dateTime,
        frozenTimeAgo: updatedAnnouncement.status === "Inactive" ? 
          formatTimeAgo(updatedAnnouncement.cancelledAt || updatedAnnouncement.dateTime) : null
      };
      
      setAnnouncements(prev => prev.map(ann => 
        ann._id === processedAnnouncement._id ? processedAnnouncement : ann
      ));
    };

    // ✅ FIXED: CANCELLATION WITH PROPER TIME FREEZING
    const handleAnnouncementCancelled = (data) => {
      console.log("🔴 Cancellation confirmed via socket:", data.announcementId);
      
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === data.announcementId 
            ? { 
                ...ann, 
                status: "Inactive",
                cancelledBy: data.cancelledBy,
                cancelledAt: data.cancelledAt || new Date().toISOString(),
                // ✅ FREEZE THE TIME - Use cancellation time for "time ago"
                frozenTimeAgo: formatTimeAgo(data.cancelledAt || new Date().toISOString()),
                views: [],
                acknowledgements: []
              }
            : ann
        )
      );
    };

    // ✅ FIXED: REPOST WITH FRESH TIME DATA
    const handleAnnouncementReposted = (repostedAnnouncement) => {
      console.log("🟢 Repost confirmed via socket:", repostedAnnouncement._id);
      
      const currentTime = new Date().toISOString();
      const processedAnnouncement = {
        ...repostedAnnouncement,
        status: "Active",
        // ✅ RESET TIME TO CURRENT TIME
        dateTime: currentTime,
        originalDateTime: currentTime,
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

    // Register event listeners
    socket.on("initialAdminData", handleInitialData);
    socket.on("adminAnnouncementUpdate", handleAdminUpdate);
    socket.on("newAnnouncement", handleNewAnnouncement);
    socket.on("announcementUpdated", handleAnnouncementUpdated);
    socket.on("announcementCancelled", handleAnnouncementCancelled);
    socket.on("announcementReposted", handleAnnouncementReposted);

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
    };
  }, [fetchAnnouncements]);

  useEffect(() => {
    const userName = getUserFullName();
    setFormData(prev => ({
      ...prev,
      postedBy: userName
    }));
  }, [getUserFullName]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(announcement => {
      const searchMatch = searchTerm === '' || 
        announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.postedBy?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return searchMatch;
    });
  }, [announcements, searchTerm]);

  // Counts for tabs
  const activeCount = useMemo(() => 
    announcements.filter(a => a.status === "Active").length, [announcements]);
  
  const inactiveCount = useMemo(() => 
    announcements.filter(a => a.status === "Inactive").length, [announcements]);

  const clearFilters = () => {
    setSearchTerm('');
  };

  const today = new Date().toISOString().split("T")[0];

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
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
      dateInput: currentDT.dateInput,
      timeInput: currentDT.timeInput,
    });

    setSelectedFile(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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

  // ✅ FIXED: COMPLETE HANDLE SUBMIT WITH PROPER SOCKET EMISSION
  const handleSubmit = async () => {
    try {
      const combinedDateTime = DateTime.fromISO(`${formData.dateInput}T${formData.timeInput}`);

      if (!combinedDateTime.isValid) {
        showNotification("Invalid date or time format", "error");
        return;
      }

      const payload = {
        title: formData.title,
        postedBy: formData.postedBy,
        agenda: formData.agenda,
        priority: formData.priority,
        dateTime: combinedDateTime.toISO(),
        status: "Active"
      };

      if (selectedFile) {
        if (selectedFile instanceof File) {
          try {
            const base64File = await fileToBase64(selectedFile);
            payload.attachment = {
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              data: base64File,
            };
          } catch (error) {
            console.error("Error converting file to base64:", error);
            showNotification("Error processing file attachment", "error");
            return;
          }
        } else {
          payload.attachment = selectedFile;
        }
      }

      let response;
      if (isEditMode) {
        console.log("✏️ Updating announcement:", editingId);
        response = await api.put(`/announcements/${editingId}`, payload);

        if (response.status === 200) {
          showNotification("Announcement updated successfully!", "success");
          
          // ✅ FIXED: COMPLETE ANNOUNCEMENT DATA FOR SOCKET
          const updatedAnnouncement = {
            ...response.data,
            _id: editingId,
            status: "Active",
            // ✅ ENSURE ALL REQUIRED FIELDS ARE INCLUDED
            views: response.data.views || [],
            acknowledgements: response.data.acknowledgements || [],
            isPinned: response.data.isPinned || false,
            // ✅ PRESERVE ORIGINAL TIME DATA
            originalDateTime: response.data.originalDateTime || response.data.dateTime,
            frozenTimeAgo: null
          };
          
          if (socket) {
            // ✅ EMIT MULTIPLE EVENTS FOR COMPATIBILITY
            console.log("📢 Emitting announcement update via socket");
            socket.emit("announcementUpdated", updatedAnnouncement);
            socket.emit("updatedAnnouncement", updatedAnnouncement); // Alternative event
            socket.emit("newAnnouncement", updatedAnnouncement); // Fallback for agents
          }
        } else {
          throw new Error(`Update failed with status: ${response.status}`);
        }
      } else {
        console.log("📝 Creating new announcement");
        response = await api.post(`/announcements`, payload);

        if (response.status === 201) {
          showNotification("Announcement posted successfully!", "success");
          if (socket && response.data) {
            const newAnnouncement = {
              ...response.data,
              // ✅ ADD ORIGINAL TIME DATA
              originalDateTime: response.data.dateTime,
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

      // ✅ Force refresh data
      if (socket) {
        socket.emit("getAdminData");
        socket.emit("getAgentData"); // Force agent refresh
      }

    } catch (error) {
      console.error("❌ Error submitting announcement:", error);
      showNotification(`Failed to ${isEditMode ? "update" : "create"} announcement. Please try again.`, "error");
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

  // ✅ FIXED: CANCELLATION WITH PROPER TIME FREEZING AND CORRECT SOCKET EVENT
  const handleConfirmCancel = async () => {
    try {
      const announcementToCancel = announcements.find(a => a._id === itemToCancel);
      if (!announcementToCancel) {
        showNotification("Announcement not found", "error");
        return;
      }

      console.log("🗑️ Cancelling announcement:", itemToCancel);

      // ✅ FIXED: USE CURRENT REAL-TIME FOR CANCELLATION
      const currentTime = new Date().toISOString();
      
      // ✅ RESET LIKES AND VIEWS WHEN CANCELLING
      const payload = {
        status: "Inactive",
        cancelledAt: currentTime, // ✅ Use current real-time
        cancelledBy: getUserFullName(),
        updatedAt: currentTime,
        // ✅ RESET LIKES AND VIEWS
        views: [],
        acknowledgements: []
      };

      let response;
      try {
        response = await api.patch(`/announcements/${itemToCancel}`, payload);
        console.log("✅ PATCH response:", response.data);
        
        // ✅ CRITICAL: Update local state immediately for better UX
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToCancel 
              ? { 
                  ...ann, 
                  ...payload,
                  // ✅ FREEZE THE TIME - Use cancellation time for "time ago"
                  frozenTimeAgo: formatTimeAgo(currentTime),
                  // ✅ ENSURE LIKES/VIEWS ARE RESET IN FRONTEND
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          // ✅ CRITICAL FIX: Use the correct event name that AgentDashboard is listening for
          socket.emit("announcementCancelled", {
            announcementId: itemToCancel,
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime // ✅ Use current real-time
          });
          
          console.log("📢 Emitted announcementCancelled event for agents");
        }
      } catch (patchError) {
        console.log("🔄 PATCH failed, trying PUT:", patchError);
        const putPayload = {
          ...announcementToCancel,
          status: "Inactive",
          cancelledAt: currentTime, // ✅ Use current real-time
          cancelledBy: getUserFullName(),
          updatedAt: currentTime,
          // ✅ RESET LIKES AND VIEWS
          views: [],
          acknowledgements: []
        };
        delete putPayload._id;
        delete putPayload.__v;
        response = await api.put(`/announcements/${itemToCancel}`, putPayload);
        console.log("✅ PUT response:", response.data);
        
        // ✅ CRITICAL: Update local state immediately
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToCancel 
              ? { 
                  ...ann, 
                  ...putPayload,
                  // ✅ FREEZE THE TIME - Use cancellation time for "time ago"
                  frozenTimeAgo: formatTimeAgo(currentTime),
                  // ✅ ENSURE LIKES/VIEWS ARE RESET IN FRONTEND
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          // ✅ CRITICAL FIX: Use the correct event name
          socket.emit("announcementCancelled", {
            announcementId: itemToCancel,
            cancelledBy: getUserFullName(),
            cancelledAt: currentTime // ✅ Use current real-time
          });
        }
      }

      showNotification("Announcement cancelled successfully! Likes and views have been reset.", "success");
      
      // ✅ Switch to inactive tab to show the cancelled announcement
      setActiveTab('inactive');

    } catch (error) {
      console.error("❌ Error cancelling announcement:", error);
      let errorMessage = "Failed to cancel announcement. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "Announcement not found in database.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "Cannot connect to server. Please check your connection.";
      }
      showNotification(errorMessage, "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToCancel(null);
    }
  };

  const handleRepostClick = (id) => {
    setItemToRepost(id);
    setIsRepostModalOpen(true);
  };

  // ✅ FIXED: REPOSTING WITH CURRENT REAL-TIME AND TIME RESET
  const handleConfirmRepost = async () => {
    try {
      const announcementToRepost = announcements.find(a => a._id === itemToRepost);
      if (!announcementToRepost) {
        showNotification("Announcement not found", "error");
        return;
      }

      console.log("🔄 Reposting announcement:", itemToRepost);

      // ✅ FIXED: USE CURRENT REAL-TIME FOR REPOST
      const currentTime = new Date().toISOString();

      const payload = {
        status: "Active",
        dateTime: currentTime, // ✅ RESET TO CURRENT TIME
        updatedAt: currentTime,
        cancelledAt: null,
        cancelledBy: null,
        // ✅ KEEP LIKES/VIEWS EMPTY WHEN REPOSTING (FRESH START)
        views: [],
        acknowledgements: []
      };

      let response;
      try {
        response = await api.patch(`/announcements/${itemToRepost}`, payload);
        console.log("✅ PATCH response:", response.data);
        
        // ✅ CRITICAL: Update local state immediately for better UX
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToRepost 
              ? { 
                  ...ann, 
                  ...payload,
                  // ✅ RESET TIME DATA - Fresh start with current time
                  originalDateTime: currentTime,
                  frozenTimeAgo: null,
                  // ✅ ENSURE LIKES/VIEWS ARE EMPTY IN FRONTEND
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          // ✅ CRITICAL FIX: Emit repost event for agents
          socket.emit("announcementReposted", {
            ...announcementToRepost,
            ...payload,
            _id: itemToRepost,
            originalDateTime: currentTime,
            frozenTimeAgo: null
          });
          
          console.log("📢 Emitted announcementReposted event for agents");
        }
        
      } catch (patchError) {
        console.log("🔄 PATCH failed, trying PUT:", patchError);
        const putPayload = {
          ...announcementToRepost,
          status: "Active",
          dateTime: currentTime, // ✅ RESET TO CURRENT TIME
          updatedAt: currentTime,
          cancelledAt: null,
          cancelledBy: null,
          // ✅ KEEP LIKES/VIEWS EMPTY WHEN REPOSTING
          views: [],
          acknowledgements: []
        };
        delete putPayload._id;
        delete putPayload.__v;
        response = await api.put(`/announcements/${itemToRepost}`, putPayload);
        console.log("✅ PUT response:", response.data);
        
        // ✅ CRITICAL: Update local state immediately
        setAnnouncements(prev => 
          prev.map(ann => 
            ann._id === itemToRepost 
              ? { 
                  ...ann, 
                  ...putPayload,
                  // ✅ RESET TIME DATA - Fresh start with current time
                  originalDateTime: currentTime,
                  frozenTimeAgo: null,
                  // ✅ ENSURE LIKES/VIEWS ARE EMPTY IN FRONTEND
                  views: [],
                  acknowledgements: []
                }
              : ann
          )
        );
        
        if (socket) {
          // ✅ CRITICAL FIX: Emit repost event for agents
          socket.emit("announcementReposted", {
            ...announcementToRepost,
            ...putPayload,
            _id: itemToRepost,
            originalDateTime: currentTime,
            frozenTimeAgo: null
          });
        }
      }

      showNotification("Announcement reposted successfully! Ready for new likes and views with fresh time.", "success");
      
      // ✅ Switch to active tab to show the reposted announcement
      setActiveTab('active');

    } catch (error) {
      console.error("❌ Error reposting announcement:", error);
      let errorMessage = "Failed to repost announcement. Please try again.";
      if (error.response?.status === 404) {
        errorMessage = "Announcement not found in database.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "Cannot connect to server. Please check your connection.";
      }
      showNotification(errorMessage, "error");
    } finally {
      setIsRepostModalOpen(false);
      setItemToRepost(null);
    }
  };

  const handleFileDownload = (file) => {
    try {
      if (!file.data) {
        showNotification("File data not available", "error");
        return;
      }

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Inactive": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDisplayDate = (isoDateStr) => {
    if (!isoDateStr) return "";
    const date = DateTime.fromISO(isoDateStr);
    return date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
  };

  const formatDisplayTime = (isoDateStr) => {
    if (!isoDateStr) return "";
    const time = DateTime.fromISO(isoDateStr);
    return time.toLocaleString(DateTime.TIME_SIMPLE);
  };

  // ✅ FIXED: REAL-TIME TIME AGO FUNCTION WITH FREEZING FOR INACTIVE ANNOUNCEMENTS
  const formatTimeAgo = (isoDateStr) => {
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

  // ✅ ADDED: SMART TIME DISPLAY THAT FREEZES FOR INACTIVE ANNOUNCEMENTS
  const getSmartTimeAgo = (announcement) => {
    if (announcement.status === "Inactive") {
      // ✅ FROZEN TIME: Show time since cancellation (doesn't update)
      return announcement.frozenTimeAgo || formatTimeAgo(announcement.cancelledAt || announcement.dateTime);
    } else {
      // ✅ LIVE TIME: Real-time updates for active announcements
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
                {/* ✅ REAL-TIME TIME INDICATOR - FIXED */}
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
                          {selectedFile.name}
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
                      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
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
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isEditMode ? "Update Announcement" : "Preview & Post Announcement"}
            </button>
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
            
            {/* SEARCH AND TABS SECTION - IMPROVED LAYOUT */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              {/* SEARCH SECTION - IMPROVED */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white w-full sm:w-40"
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
              
              {/* TABS - IMPROVED WITH SLIMMER DESIGN */}
              <div className="flex bg-gray-100 rounded-lg p-0.5 w-full sm:w-auto">
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
                  Inactive ({inactiveCount})
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
          ) : filteredAnnouncements.filter(a => 
            activeTab === 'active' ? a.status === 'Active' : a.status === 'Inactive'
          ).length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-1">
              {filteredAnnouncements
                .filter(a => activeTab === 'active' ? a.status === 'Active' : a.status === 'Inactive')
                .map((a) => (
                <div
                  key={a._id}
                  className={`group p-3 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    a.status === 'Inactive' 
                      ? 'bg-gray-100 border border-gray-300 opacity-90' 
                      : 'bg-gradient-to-br from-white to-gray-50 border border-gray-100'
                  }`}
                >
                  {/* INACTIVE BADGE */}
                  {a.status === 'Inactive' && (
                    <div className="flex justify-between items-center mb-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                          🗑️ INACTIVE
                        </span>
                        <span className="text-xs text-red-600">
                          Cancelled by {a.cancelledBy} • {getSmartTimeAgo(a)}
                          {/* ✅ ADDED: FROZEN TIME INDICATOR */}
                          <span className="ml-1 text-gray-500"></span>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                    <div className="flex items-start gap-2 w-full">
                      <div className={`p-1 rounded-lg group-hover:bg-indigo-200 transition-colors mt-1 ${
                        a.status === 'Inactive' ? 'bg-gray-300' : 'bg-indigo-100'
                      }`}>
                        <Bell className={`w-3 h-3 ${
                          a.status === 'Inactive' ? 'text-gray-600' : 'text-indigo-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold mb-1 group-hover:text-indigo-600 transition-colors truncate ${
                          a.status === 'Inactive' ? 'text-gray-600' : 'text-gray-800'
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
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>
                            {a.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getSmartTimeAgo(a)}
                            {/* ✅ ADDED: LIVE INDICATOR FOR ACTIVE ANNOUNCEMENTS */}
                            {a.status === 'Active' && (
                              <span className="ml-1 text-green-500"></span>
                            )}
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
                    <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-red-500" />
                        {formatDisplayDate(a.dateTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-500" />
                        {formatDisplayTime(a.dateTime)}
                      </span>
                    </div>
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
                        disabled={a.isLoadingViews}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors disabled:opacity-50"
                        title="View who viewed this announcement"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{Array.isArray(a.views) ? a.views.length : 0} views</span>
                        {a.isLoadingViews && (
                          <div className="ml-1 w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </button>
                      <button
                        onClick={() => handleLikeDetails(a)}
                        disabled={a.isLoadingLikes}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="View who liked this announcement"
                      >
                        <Heart className="w-3 h-3 text-red-500" fill="currentColor" />
                        <span>{Array.isArray(a.acknowledgements) ? a.acknowledgements.length : 0} Likes</span>
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

                  {/* DIFFERENT BUTTONS FOR ACTIVE vs INACTIVE */}
                  {a.status !== 'Inactive' ? (
                    // ACTIVE ANNOUNCEMENT BUTTONS (Cancel & Edit)
                    <div className="flex gap-2">
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
                    </div>
                  ) : (
                    // INACTIVE ANNOUNCEMENT BUTTONS (Repost)
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRepostClick(a._id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white p-1.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-xs shadow-sm hover:shadow flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Repost
                      </button>
                    </div>
                  )}
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
                <p>No active announcements found.</p>
              ) : (
                <p>No inactive announcements found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncement;