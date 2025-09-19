import React, { useState, useMemo, useEffect, memo } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  Bell,
  User,
  FileText,
  ChevronDown,
  Edit,
  Info,
  CheckCircle,
  XCircle,
  Download,
  Paperclip,
} from "lucide-react";
import { DateTime } from "luxon";
import Table from "../../components/Table";
import api from "../../utils/axios";

// Custom Notification Component
const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: "bg-green-500",
      icon: <CheckCircle className="w-5 h-5 text-white" />,
    },
    error: {
      bg: "bg-red-500",
      icon: <XCircle className="w-5 h-5 text-white" />,
    },
    info: {
      bg: "bg-blue-500",
      icon: <Bell className="w-5 h-5 text-white" />,
    },
  };

  const { bg, icon } = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed top-20 right-4 sm:top-20 sm:right-8 z-50 flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl shadow-lg text-white transition-all duration-300 ease-in-out transform ${bg} animate-slide-in-right`}
    >
      {icon}
      <p className="text-sm sm:text-base font-medium">{message}</p>
      <button onClick={() => setIsVisible(false)} className="ml-auto">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

// Inline Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-gray-200 animate-scale-up">
        <div className="flex justify-center mb-4">
          <Bell className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          Confirm Action
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">{message}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-xl font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white p-3 rounded-xl font-medium hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// New File View Modal Component
const FileViewModal = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const renderFilePreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.data}
          alt={file.name}
          className="max-w-full max-h-[80vh] object-contain mx-auto"
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <embed
          src={file.data}
          type="application/pdf"
          className="w-full h-[80vh]"
        />
      );
    } else if (file.type.startsWith('text/')) {
      // Decode Base64 data for text files
      const base64Data = file.data.split(',')[1];
      const decodedText = atob(base64Data);
      return (
        <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-[80vh] text-sm text-gray-800">
          {decodedText}
        </pre>
      );
    } else {
      return (
        <div className="p-6 text-center text-gray-600">
          <p className="text-lg font-semibold mb-2">File Preview Not Available</p>
          <p>This file type cannot be previewed in the browser.</p>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-[90%] sm:w-[80%] lg:w-[70%] max-h-[90%] bg-white rounded-xl shadow-2xl overflow-hidden p-4">
        <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-200">
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
            {file.name}
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center items-center">
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
};

// File attachment component
const FileAttachment = ({ file, onDownload, onView }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Paperclip className="w-4 h-4 text-gray-500" />;
    }
  };

  const canPreview = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt'].includes(extension);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center gap-2">
        {getFileIcon(file.name)}
        <span className="text-sm font-medium text-gray-700 truncate max-w-32">
          {file.name}
        </span>
      </div>
      <div className="flex gap-1">
        {canPreview(file.name) && (
          <button
            onClick={() => onView(file)}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
            title="View file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDownload(file)}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
          title="Download file"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AdminAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [itemToCancel, setItemToCancel] = useState(null);
  const [fileViewModal, setFileViewModal] = useState({ isOpen: false, file: null });

  // Dummy state to trigger re-renders for time display
  const [timeTicker, setTimeTicker] = useState(Date.now());

  const [formData, setFormData] = useState({
    title: "",
    dateTime: "",
    postedBy: "",
    agenda: "",
    priority: "Medium",
    dateInput: "",
    timeInput: "",
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const isExpired = (isoDateStr) => {
    const announcementDateTime = DateTime.fromISO(isoDateStr);
    const now = DateTime.local();
    const diffInHours = now.diff(announcementDateTime, "hours").hours;
    return diffInHours >= 24;
  };

  const checkAndUpdateExpiredAnnouncements = async () => {
    try {
      const response = await api.get("/announcements");
      const activeAnnouncements = response.data.filter(
        (a) => a.status !== "Completed"
      );

      const updatePromises = activeAnnouncements.map(async (announcement) => {
        if (isExpired(announcement.dateTime)) {
          await api.put(`/announcements/${announcement._id}`, {
            ...announcement,
            status: "Completed",
          });
          return announcement._id;
        }
        return null;
      });

      const updatedIds = (await Promise.all(updatePromises)).filter(Boolean);

      if (updatedIds.length > 0) {
        setAnnouncements((prev) =>
          prev.filter((a) => !updatedIds.includes(a._id))
        );
        setAnnouncementHistory((prev) => [
          ...prev,
          ...announcements.filter((a) => updatedIds.includes(a._id)),
        ]);
      }
    } catch (err) {
      console.error("Error checking for expired announcements:", err);
    }
  };

  // Helper function to get a numerical value for priority
  const getPriorityValue = (priority) => {
    switch (priority) {
      case "High":
        return 3;
      case "Medium":
        return 2;
      case "Low":
        return 1;
      default:
        return 0;
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/announcements");
      const active = response.data.filter((a) => a.status !== "Completed");
      const history = response.data.filter((a) => a.status === "Completed");

      // NEW: Sort by priority first (High > Medium > Low), then by date (newest first)
      const sortedActive = active.sort((a, b) => {
        const priorityA = getPriorityValue(a.priority);
        const priorityB = getPriorityValue(b.priority);

        // Sort by priority first (descending)
        if (priorityB !== priorityA) {
          return priorityB - priorityA;
        }

        // If priorities are equal, sort by date/time (newest first)
        return DateTime.fromISO(b.dateTime).toMillis() - DateTime.fromISO(a.dateTime).toMillis();
      });

      const sortedHistory = history.sort(
        (a, b) =>
          DateTime.fromISO(b.dateTime).toMillis() -
          DateTime.fromISO(a.dateTime).toMillis()
      );

      setAnnouncements(sortedActive);
      setAnnouncementHistory(sortedHistory);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements. Please check server connection.");
      setIsLoading(false);
      showNotification(
        "Failed to load announcements. Please check your network.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(checkAndUpdateExpiredAnnouncements, 10000);
    return () => clearInterval(interval);
  }, []);

  // New useEffect for real-time time display
  useEffect(() => {
    const timeUpdateInterval = setInterval(() => {
      setTimeTicker(Date.now());
    }, 60000); // Update every minute
    return () => clearInterval(timeUpdateInterval);
  }, []);

  const handleInputChange = (field, value) => {
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
    setFormData({
      title: "",
      dateTime: "",
      postedBy: "",
      agenda: "",
      priority: "Medium",
      dateInput: "",
      timeInput: "",
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  // Convert file to base64 for database storage
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
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

    try {
      const payload = {
        title: formData.title,
        postedBy: formData.postedBy,
        agenda: formData.agenda,
        priority: formData.priority,
        dateTime: combinedDateTime.toISO(),
      };

      // Handle file attachment
      if (selectedFile) {
        try {
          const base64File = await fileToBase64(selectedFile);
          payload.attachment = {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: base64File
          };
        } catch (error) {
          console.error("Error converting file to base64:", error);
          showNotification("Error processing file attachment", "error");
          return;
        }
      }

      if (isEditMode) {
        await api.put(`/announcements/${editingId}`, payload);
        setAnnouncements((prev) =>
          prev.map((a) => (a._id === editingId ? { ...a, ...payload } : a))
        );
        showNotification("Announcement updated successfully!", "success");
      } else {
        const response = await api.post(`/announcements`, {
          ...payload,
          status: "Scheduled",
        });
        setAnnouncements((prev) => [
          { ...response.data, status: "Scheduled" },
          ...prev,
        ]);
        showNotification("Announcement created successfully!", "success");
      }
      resetForm();
    } catch (error) {
      console.error("Error submitting announcement:", error);
      showNotification(
        `Failed to ${isEditMode ? "update" : "create"
        } announcement. Please try again.`,
        "error"
      );
    }
  };

  const handleEdit = (announcement) => {
    setIsEditMode(true);
    setEditingId(announcement._id);

    const dt = DateTime.fromISO(announcement.dateTime);
    setFormData({
      title: announcement.title,
      dateTime: announcement.dateTime,
      postedBy: announcement.postedBy,
      agenda: announcement.agenda,
      priority: announcement.priority,
      dateInput: dt.toISODate(),
      timeInput: dt.toFormat("HH:mm"),
    });
    setSelectedFile(null);
  };

  const handleCancelClick = (id) => {
    setItemToCancel(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await api.delete(`/announcements/${itemToCancel}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== itemToCancel));
      showNotification("Announcement cancelled successfully!", "success");
    } catch (error) {
      console.error("Error cancelling announcement:", error);
      showNotification("Failed to cancel announcement. Please try again.", "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToCancel(null);
    }
  };

  const handleFileDownload = (file) => {
    try {
      // Convert base64 to blob
      const base64Data = file.data.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification("File downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading file:", error);
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

  const formatTimeAgo = (isoDateStr) => {
    // This is now automatically updated by the timeTicker state
    if (!isoDateStr) return "";
    const combinedDateTime = DateTime.fromISO(isoDateStr);
    if (!combinedDateTime.isValid) {
      return "";
    }
    const diff = DateTime.local().diff(combinedDateTime, [
      "years",
      "months",
      "days",
      "hours",
      "minutes",
      "seconds",
    ]);

    if (diff.years > 0) {
      return `${Math.floor(diff.years)} year${Math.floor(diff.years) > 1 ? "s" : ""
        } ago`;
    }
    if (diff.months > 0) {
      return `${Math.floor(diff.months)} month${Math.floor(diff.months) > 1 ? "s" : ""
        } ago`;
    }
    if (diff.days > 0) {
      return `${Math.floor(diff.days)} day${Math.floor(diff.days) > 1 ? "s" : ""
        } ago`;
    }
    if (diff.hours > 0) {
      return `${Math.floor(diff.hours)} hour${Math.floor(diff.hours) > 1 ? "s" : ""
        } ago`;
    }
    if (diff.minutes > 0) {
      return `${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) > 1 ? "s" : ""
        } ago`;
    }
    const seconds = Math.floor(diff.seconds);
    return seconds <= 1 ? "just now" : `${seconds} seconds ago`;
  };

  const columns = useMemo(
    () => [
      {
        headerName: "DATE",
        field: "dateTime",
        sortable: true,
        filter: true,
        width: 150,
        cellRenderer: (params) => formatDisplayDate(params.value),
      },
      {
        headerName: "FACILITATOR",
        field: "postedBy",
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        headerName: "TYPE",
        field: "title",
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        headerName: "TIME",
        field: "dateTime",
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params) => formatDisplayTime(params.value),
      },
      {
        headerName: "AGENDA",
        field: "agenda",
        sortable: true,
        filter: true,
        width: 300,
        tooltipField: "agenda",
      },
      {
        headerName: "STATUS",
        field: "status",
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params) => {
          const statusClass =
            params.value === "Completed"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600";
          return `<span class="px-4 py-2 rounded-xl text-sm font-semibold ${statusClass}">${params.value}</span>`;
        },
      },
      {
        headerName: "ATTACHMENT",
        field: "attachment",
        sortable: false,
        filter: false,
        width: 120,
        cellRenderer: (params) => {
          if (params.value && params.value.name) {
            return `<span class="flex items-center gap-1 text-blue-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>${params.value.name}</span>`;
          }
          return '<span class="text-gray-400">No file</span>';
        },
      },
      {
        headerName: "REMARKS",
        field: "remarks",
        sortable: true,
        filter: true,
        width: 300,
        tooltipField: "remarks",
      },
    ],
    []
  );

  return (
    <div>
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancel}
        message="Are you sure you want to cancel this announcement? This action cannot be undone."
      />

      {/* New File View Modal */}
      <FileViewModal
        isOpen={fileViewModal.isOpen}
        onClose={closeFileView}
        file={fileViewModal.file}
      />

      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Announcement</h2>
        </div>
        <p className="text-light">
          Manage and view all company announcements.
        </p>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Create/Edit Announcement */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 ${isEditMode ? "bg-red-100" : "bg-indigo-100"
                  } rounded-lg`}
              >
                {isEditMode ? (
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                ) : (
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Announcement" : "Create New Announcement"}
              </h3>
            </div>
            {isEditMode && (
              <button
                onClick={resetForm}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter announcement title"
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                  <input
                    type="date"
                    value={formData.dateInput}
                    min={today}
                    onChange={(e) =>
                      handleInputChange("dateInput", e.target.value)
                    }
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                  <input
                    type="time"
                    value={formData.timeInput}
                    onChange={(e) =>
                      handleInputChange("timeInput", e.target.value)
                    }
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Posted By *
                </label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) =>
                      handleInputChange("postedBy", e.target.value)
                    }
                    placeholder="Your name or department"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Attachment
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${isDragOver
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
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 text-xs sm:text-sm">
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
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium text-xs sm:text-sm">
                        Drop file or{" "}
                        <span className="text-red-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Agenda *
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange("agenda", e.target.value)}
                placeholder="Describe the announcement details..."
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
              ></textarea>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {isEditMode ? "Update Announcement" : "Create Announcement"}
            </button>
          </div>
        </div>

        {/* List of Announcements */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Active Announcements
              </h3>
            </div>
            <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {announcements.length} Active
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500 italic">
              Loading announcements...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-10 text-red-500 italic">
              {error}
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-150px)] pr-2">
              {announcements.map((a) => (
                <div
                  key={a._id}
                  className={`group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {a.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              a.priority
                            )}`}
                          >
                            {a.priority} Priority
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(a.dateTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      Posted by: <span className="font-medium">{a.postedBy}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-gray-700">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        {formatDisplayDate(a.dateTime)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        {formatDisplayTime(a.dateTime)}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                          Agenda:
                        </span>{" "}
                        {a.agenda}
                      </p>
                    </div>

                    {/* File attachment section */}
                    {a.attachment && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCancelClick(a._id)}
                      className="flex-1 bg-white border-2 border-red-500 text-red-600 p-2 sm:p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(a)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-10 text-gray-500 italic">
              No active announcements found.
            </div>
          )}
        </div>
      </div>

      {/* Announcement History with Table Component */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          Announcement History
        </h3>

        {announcementHistory && announcementHistory.length > 0 ? (
          <Table
            data={announcementHistory}
            columns={columns}
            pagination={{
              pageSize: 10,
            }}
          />
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            No announcement history found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncement;