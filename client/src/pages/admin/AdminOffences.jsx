import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  User,
  FileText,
  ChevronDown,
  Edit,
  CheckCircle,
  XCircle,
  Bell,
  Search,
} from "lucide-react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// =================== Notification ===================
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
      className={`fixed top-20 right-4 sm:top-20 sm:right-8 z-50 flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl shadow-lg text-white transition-all duration-300 ease-in-out transform ${bg}`}
    >
      {icon}
      <p className="text-sm sm:text-base font-medium">{message}</p>
      <button onClick={() => setIsVisible(false)} className="ml-auto">
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
};

// =================== Confirmation Modal ===================
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-gray-200">
        <div className="flex justify-center mb-4">
          <Bell className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
          Confirm Action
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          {message}
        </p>
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

// =================== Main Component ===================
const AdminOffences = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formData, setFormData] = useState({
    agentName: "",
    offenseCategory: "",
    offenseType: "",
    offenseSeverity: "",
    dateOfOffense: "",
    status: "",
    actionTaken: "",
    remarks: "",
  });

  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/offenses");
      setOffenses(response.data);
    } catch (error) {
      console.error("Error fetching offenses:", error);
      showNotification("Failed to load offenses. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffenses();
  }, []);

  const offenseTypesByCategory = {
    Attendance: [
      "Tardiness / Lates",
      "Undertime",
      "Absent without Official Leave (AWOL)",
      "Excessive Sick Leave / SL Abuse",
      "No Call, No Show",
      "Leaving workstation without permission",
    ],
    Performance: [
      "Low Quality Scores (QA Fails)",
      "Missed Deadlines / Targets",
      "Excessive AHT",
      "Not Meeting KPIs / Metrics",
      "Failure to follow processes / workflows",
    ],
    Behavioral: [
      "Rudeness / Unprofessional behavior",
      "Disrespect towards peers or superiors",
      "Workplace misconduct",
      "Sleeping while on duty",
      "Excessive personal activities during work hours",
      "Horseplay / disruption",
    ],
    Compliance: [
      "Data Privacy Violation",
      "Breach of Company Policy / Security Policy",
      "Misuse of Company Equipment",
      "Tampering with logs / falsification of records",
      "Accessing unauthorized tools / websites",
      "Timekeeping fraud",
    ],
    "Account/Employment": [
      "Transfer to another account",
      "Final Written Warning / Termination record",
      "Disciplinary actions history",
    ],
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // =================== File Upload ===================
  const handleFileUpload = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      showNotification("File size must be less than 10MB", "error");
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

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
    if (
      !formData.agentName ||
      !formData.offenseCategory ||
      !formData.offenseType ||
      !formData.offenseSeverity ||
      !formData.dateOfOffense ||
      !formData.status ||
      !formData.actionTaken
    ) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      const payload = {
        agentName: formData.agentName,
        offenseCategory: formData.offenseCategory,
        offenseType: formData.offenseType,
        offenseSeverity: formData.offenseSeverity,
        dateOfOffense: formData.dateOfOffense,
        status: formData.status,
        actionTaken: formData.actionTaken,
        remarks: formData.remarks || "",
      };

      if (selectedFile) {
        const base64File = await fileToBase64(selectedFile);
        payload.evidence = [
          {
            fileName: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            data: base64File,
          },
        ];
      }

      if (isEditMode) {
        console.log("ID being sent to API:", editingId);
        await api.put(`/offenses/${editingId}`, payload);
        showNotification("Offense updated successfully!", "success");
      } else {
        await api.post("/offenses", payload);
        showNotification("Offense submitted successfully!", "success");
      }

      resetForm();

      try {
        await fetchOffenses();
      } catch (fetchError) {
        console.error("Failed to re-fetch offenses after update:", fetchError);
        showNotification(
          "Updated successfully, but failed to refresh list.",
          "info"
        );
      }
    } catch (error) {
      console.error("Error submitting offense:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
      }
      showNotification("Failed to submit offense. Please try again.", "error");
    }
  };

  // =================== Reset Form ===================
  const resetForm = () => {
    setFormData({
      agentName: "",
      offenseCategory: "",
      offenseType: "",
      offenseSeverity: "",
      dateOfOffense: "",
      status: "",
      actionTaken: "",
      remarks: "",
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  // =================== Edit & Delete ===================
  const handleEdit = (off) => {
    setIsEditMode(true);
    setEditingId(off._id);
    setFormData({
      agentName: off.agentName,
      offenseCategory: off.offenseCategory,
      offenseType: off.offenseType,
      offenseSeverity: off.offenseSeverity,
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      actionTaken: off.actionTaken,
      remarks: off.remarks || "",
    });
    setSelectedFile(null);
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await api.delete(`/offenses/${itemToDelete}`);
      showNotification("Offense deleted successfully!", "success");
      fetchOffenses();
    } catch (error) {
      console.error("Error deleting offense:", error);
      showNotification("Failed to delete offense. Please try again.", "error");
    } finally {
      setIsConfirmationModalOpen(false);
      setItemToDelete(null);
    }
  };

  // =================== Formatting ===================
  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";

  // Filter offenses based on search query
  const filteredOffenses = offenses.filter((off) =>
    [
      off.agentName,
      off.offenseType,
      off.offenseCategory,
      off.offenseSeverity,
      off.status,
      off.actionTaken,
      off.remarks || "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const resolvedOffenses = offenses.filter(
    (off) =>
      off.status === "Action Taken" ||
      off.status === "Escalated" ||
      off.status === "Closed"
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

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this offense?"
      />

      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Offense Management</h2>
        </div>
        <p className="text-gray-600">
          Record and manage disciplinary offenses for agents.
        </p>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Create/Edit Offense */}
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
                {isEditMode ? "Edit Offense" : "Create Incident Report"}
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
            {/* Agent Name */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => handleInputChange("agentName", e.target.value)}
                placeholder="Enter agent name"
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            {/* Offense Category & Type - Single Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Offense Category *
                </label>
                <select
                  value={formData.offenseCategory}
                  onChange={(e) =>
                    handleInputChange("offenseCategory", e.target.value)
                  }
                  className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                >
                  <option value="">Select category</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Performance">Performance</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Account/Employment">Account/Employment</option>
                </select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Offense Type *
                </label>
                <select
                  value={formData.offenseType}
                  onChange={(e) =>
                    handleInputChange("offenseType", e.target.value)
                  }
                  className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                >
                  <option value="">Select offense type</option>
                  {formData.offenseCategory &&
                    offenseTypesByCategory[formData.offenseCategory]?.map(
                      (type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      )
                    )}
                </select>
              </div>
            </div>

            {/* Severity & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Offense Severity *
                </label>
                <select
                  value={formData.offenseSeverity}
                  onChange={(e) =>
                    handleInputChange("offenseSeverity", e.target.value)
                  }
                  className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                >
                  <option value="">Select severity</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Date of Offense *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                  <input
                    type="date"
                    value={formData.dateOfOffense}
                    onChange={(e) =>
                      handleInputChange("dateOfOffense", e.target.value)
                    }
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              >
                <option value="">Select status</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="For Counseling">For Counseling</option>
                <option value="Action Taken">Action Taken</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Action Taken */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Action Taken *
              </label>
              <select
                value={formData.actionTaken}
                onChange={(e) =>
                  handleInputChange("actionTaken", e.target.value)
                }
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              >
                <option value="">Select action</option>
                <option value="Coaching / Counseling">
                  Coaching / Counseling
                </option>
                <option value="Verbal Warning">Verbal Warning</option>
                <option value="Written Warning">Written Warning</option>
                <option value="Final Written Warning">
                  Final Written Warning
                </option>
                <option value="Performance Improvement Plan (PIP)">
                  Performance Improvement Plan (PIP)
                </option>
                <option value="Suspension">Suspension</option>
                <option value="Demotion / Reassignment">
                  Demotion / Reassignment
                </option>
                <option value="Termination">Termination</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                placeholder="Additional notes..."
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
              ></textarea>
            </div>

            {/* Upload Evidence */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Upload Evidence
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

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {isEditMode ? "Update Offense" : "Submit Offense"}
            </button>
          </div>
        </div>
        {/* Offense Records */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Cases In Progress
              </h3>
            </div>
            <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {filteredOffenses.length} Records
            </span>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by agent, offense type, category..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {filteredOffenses.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-210 pr-2">
              {filteredOffenses.map((off) => (
                <div
                  key={off._id}
                  className="group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-100"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                          {off.offenseType}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className="text-xs text-gray-500">
                            Date: {formatDisplayDate(off.dateOfOffense)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              off.status === "Pending Review"
                                ? "bg-yellow-100 text-yellow-700"
                                : off.status === "Under Investigation"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {off.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      Agent:{" "}
                      <span className="font-medium">{off.agentName}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      Category:{" "}
                      <span className="font-medium">{off.offenseCategory}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      Severity:{" "}
                      <span className="font-medium">{off.offenseSeverity}</span>
                    </p>

                    <div className="bg-red-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                          Action Taken:
                        </span>{" "}
                        {off.actionTaken}
                      </p>
                    </div>

                    {off.remarks && (
                      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-gray-400">
                        <p className="text-xs sm:text-sm text-gray-700">
                          <span className="font-semibold text-gray-800">
                            Remarks:
                          </span>{" "}
                          {off.remarks}
                        </p>
                      </div>
                    )}

                    {off.evidence && off.evidence.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-3 sm:p-4 border-l-4 border-purple-500">
                        <p className="text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-800">
                            Evidence:
                          </span>
                          <span className="text-purple-700">
                            {off.evidence.map((ev, idx) => (
                              <span
                                key={idx}
                                className="ml-1 underline cursor-pointer"
                              >
                                {ev.fileName}
                              </span>
                            ))}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteClick(off._id)}
                      className="flex-1 bg-white border-2 border-red-500 text-red-600 p-2 sm:p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(off)}
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
              {isLoading
                ? "Loading offenses..."
                : searchQuery
                ? "No matching offense records found."
                : "No offense records found."}
            </div>
          )}
        </div>
      </div>
      {/* Request History */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Case History
            </h3>
          </div>
          <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            {resolvedOffenses.length} Records
          </span>
        </div>

        {resolvedOffenses.length > 0 ? (
          <div className="w-full overflow-x-auto overflow-y-auto max-h-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">Date</th>
                  <th className="p-4 whitespace-nowrap">Agent</th>
                  <th className="p-4 whitespace-nowrap">Offense Type</th>
                  <th className="p-4 whitespace-nowrap">Severity</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Action Taken</th>
                  <th className="p-4 whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {resolvedOffenses.map((off) => (
                  <tr
                    key={off._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4 text-sm text-gray-600">
                      {formatDisplayDate(off.dateOfOffense)}
                    </td>
                    <td className="p-4 text-sm text-gray-800 font-medium">
                      {off.agentName}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.offenseType}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.offenseSeverity}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          off.status === "Closed"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {off.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.actionTaken}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {off.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            {isLoading
              ? "Loading history..."
              : "No resolved offense records found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOffences;