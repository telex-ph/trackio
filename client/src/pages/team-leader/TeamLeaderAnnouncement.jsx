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
} from "lucide-react";
import Table from "../../components/Table";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// Memoized component for display, though not strictly needed here
const TimeBox = memo(({ value, label }) => (
  <span className="text-center">
    <h1 className="bg-white border-light text-light rounded-md">{value}</h1>
    <span className="text-light">{label}</span>
  </span>
));

const TeamLeaderAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [announcementHistory, setAnnouncementHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    dateTime: "", // Combined date and time as a single ISO string
    postedBy: "",
    agenda: "",
    priority: "Medium",
    // These are for the input fields only, not sent to the backend
    dateInput: "",
    timeInput: "",
  });

  const checkAndUpdateExpiredAnnouncements = async () => {
    try {
      const response = await api.get("/announcements");
      const activeAnnouncements = response.data.filter(
        (a) => a.status !== "Completed"
      );
      const now = DateTime.local();

      const updates = activeAnnouncements.map(async (announcement) => {
        const announcementDateTime = DateTime.fromISO(announcement.dateTime);
        if (announcementDateTime.isValid && announcementDateTime < now) {
          // If the announcement date/time is in the past, update its status
          await api.put(`/announcements/${announcement._id}`, {
            ...announcement,
            status: "Completed",
          });
        }
      });
      // Wait for all updates to complete
      await Promise.all(updates);
    } catch (err) {
      console.error("Error checking for expired announcements:", err);
      // We'll let the main fetch handle the error state for the user
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First, check and update any expired announcements
      await checkAndUpdateExpiredAnnouncements();

      // Then, fetch the updated list
      const response = await api.get("/announcements"); // Use the 'api' instance
      const active = response.data.filter((a) => a.status !== "Completed");
      const history = response.data.filter((a) => a.status === "Completed");

      // Sort announcements by date in descending order (newest first)
      const sortedActive = active.sort(
        (a, b) =>
          DateTime.fromISO(b.dateTime).toMillis() -
          DateTime.fromISO(a.dateTime).toMillis()
      );
      // Sort history by date in descending order (newest first)
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
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Set up an interval to check for expired announcements every minute
    const interval = setInterval(() => {
      checkAndUpdateExpiredAnnouncements().then(() => fetchAnnouncements());
    }, 60000); // 60000 milliseconds = 1 minute

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert("File size must be less than 10MB");
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

  const handleSubmit = async () => {
    // Basic check for empty fields
    if (
      !formData.title ||
      !formData.dateInput ||
      !formData.timeInput ||
      !formData.postedBy ||
      !formData.agenda
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Combine date and time to create a Luxon DateTime object
    const combinedDateTime = DateTime.fromISO(
      `${formData.dateInput}T${formData.timeInput}`
    );

    // Validate the combined date and time
    if (!combinedDateTime.isValid) {
      alert("Invalid date or time. Please check your input.");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        postedBy: formData.postedBy,
        agenda: formData.agenda,
        priority: formData.priority,
        // Use the validated ISO string from Luxon
        dateTime: combinedDateTime.toISO(),
      };

      if (isEditMode) {
        await api.put(`/announcements/${editingId}`, payload); // Use PUT for update
      } else {
        await api.post(`/announcements`, {
          // Use POST for create
          ...payload,
          status: "Scheduled",
        });
      }

      await fetchAnnouncements();

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

      alert(`Announcement ${isEditMode ? "updated" : "created"} successfully!`);
    } catch (error) {
      console.error("Error submitting announcement:", error);
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } announcement. Please try again.`
      );
    }
  };

  const handleEdit = (announcement) => {
    setIsEditMode(true);
    setEditingId(announcement._id);

    // Parse the ISO string to populate the date and time inputs
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

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this announcement?")) {
      try {
        await api.delete(`/announcements/${id}`); // Use 'api' instance
        await fetchAnnouncements();
        alert("Announcement cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling announcement:", error);
        alert("Failed to cancel announcement. Please try again.");
      }
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingId(null);
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
    if (!isoDateStr) return "";
    const combinedDateTime = DateTime.fromISO(isoDateStr);
    if (!combinedDateTime.isValid) {
      return "";
    }
    const diff = DateTime.local()
      .diff(combinedDateTime, ["minutes", "hours", "days"])
      .toObject();

    if (diff.days > 0) {
      return `${Math.floor(diff.days)} day${
        Math.floor(diff.days) > 1 ? "s" : ""
      } ago`;
    }
    if (diff.hours > 0) {
      return `${Math.floor(diff.hours)} hour${
        Math.floor(diff.hours) > 1 ? "s" : ""
      } ago`;
    }
    if (diff.minutes > 0) {
      return `${Math.floor(diff.minutes)} minute${
        Math.floor(diff.minutes) > 1 ? "s" : ""
      } ago`;
    }
    return "just now";
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
                className={`p-2 ${
                  isEditMode ? "bg-red-100" : "bg-indigo-100"
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
                onClick={cancelEdit}
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
                className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
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
                  className={`group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border ${
                    editingId === a._id
                      ? "border-red-300 ring-2 ring-red-100"
                      : "border-gray-100"
                  }`}
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
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCancel(a._id)}
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

export default TeamLeaderAnnouncement;