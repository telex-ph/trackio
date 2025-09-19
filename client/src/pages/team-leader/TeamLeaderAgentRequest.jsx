import React, { useState, useMemo, memo } from "react";
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
} from "lucide-react";
import Table from "../../components/Table";
import { DateTime } from "luxon";

// Memoized component for display, though not strictly needed here
const TimeBox = memo(({ value, label }) => (
  <span className="text-center">
    <h1 className="bg-white border-light text-light rounded-md">{value}</h1>
    <span className="text-light">{label}</span>
  </span>
));

const TeamLeaderAgentRequest = () => {
  const [requests, setRequests] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nextId, setNextId] = useState(1); // For local ID generation

  const [formData, setFormData] = useState({
    agentName: "",
    requestType: "Overtime",
    supervisor: "",
    reason: "",
    additionalNotes: "",
    // These are for the input fields only
    dateInput: "",
    timeInput: "",
  });

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

  const handleSubmit = () => {
    if (
      !formData.agentName ||
      !formData.requestType ||
      !formData.dateInput ||
      !formData.timeInput ||
      !formData.supervisor ||
      !formData.reason
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

    const payload = {
      agentName: formData.agentName,
      requestType: formData.requestType,
      supervisor: formData.supervisor,
      reason: formData.reason,
      additionalNotes: formData.additionalNotes,
      // Use the validated ISO string from Luxon
      dateTime: combinedDateTime.toISO(),
    };

    if (isEditMode) {
      // Update existing request
      setRequests((prev) =>
        prev.map((req) =>
          req.id === editingId
            ? { ...payload, id: editingId, status: "Pending" }
            : req
        )
      );
    } else {
      // Create new request
      const newRequest = {
        id: nextId,
        ...payload,
        status: "Pending",
      };
      setRequests((prev) => [newRequest, ...prev]);
      setNextId((prev) => prev + 1);
    }

    // Reset form fields
    setFormData({
      agentName: "",
      requestType: "Overtime",
      supervisor: "",
      reason: "",
      additionalNotes: "",
      dateInput: "",
      timeInput: "",
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setEditingId(null);

    alert(`Request ${isEditMode ? "updated" : "submitted"} successfully!`);
  };

  const handleEdit = (request) => {
    setIsEditMode(true);
    setEditingId(request.id);

    // Parse the ISO string to populate the date and time inputs
    const dt = DateTime.fromISO(request.dateTime);
    setFormData({
      agentName: request.agentName,
      requestType: request.requestType,
      supervisor: request.supervisor,
      reason: request.reason,
      additionalNotes: request.additionalNotes,
      dateInput: dt.toISODate(),
      timeInput: dt.toFormat("HH:mm"),
    });
    setSelectedFile(null);
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      setRequests((prev) => prev.filter((req) => req.id !== id));
      alert("Request cancelled successfully!");
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      agentName: "",
      requestType: "Overtime",
      supervisor: "",
      reason: "",
      additionalNotes: "",
      dateInput: "",
      timeInput: "",
    });
    setSelectedFile(null);
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
        headerName: "TIME",
        field: "dateTime",
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params) => formatDisplayTime(params.value),
      },
      {
        headerName: "AGENT NAME",
        field: "agentName",
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        headerName: "REQUEST TYPE",
        field: "requestType",
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        headerName: "SUPERVISOR",
        field: "supervisor",
        sortable: true,
        filter: true,
        width: 120,
      },
      {
        headerName: "REASON",
        field: "reason",
        sortable: true,
        filter: true,
        width: 300,
        tooltipField: "reason",
      },
      {
        headerName: "STATUS",
        field: "status",
        sortable: true,
        filter: true,
        width: 120,
        cellRenderer: (params) => {
          const statusClass =
            params.value === "Approved"
              ? "bg-green-100 text-green-700"
              : params.value === "Rejected"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-600";
          return `<span class="px-4 py-2 rounded-xl text-sm font-semibold ${statusClass}">${params.value}</span>`;
        },
      },
    ],
    []
  );

  return (
    <div>
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Agent Request</h2>
        </div>
        <p className="text-light">
          Submit and track your requests here.
        </p>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* Create/Edit Request */}
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
                {isEditMode ? "Edit Request" : "Create New Request"}
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
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.agentName}
                onChange={(e) => handleInputChange("agentName", e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Request Type *
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) =>
                    handleInputChange("requestType", e.target.value)
                  }
                  className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
                >
                  <option value="Overtime">Overtime</option>
                  <option value="Undertime">Undertime</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Supervisor/Team Leader *
                </label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <input
                    type="text"
                    value={formData.supervisor}
                    onChange={(e) =>
                      handleInputChange("supervisor", e.target.value)
                    }
                    placeholder="Enter supervisor's name"
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>
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
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Reason *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Explain the reason for your request..."
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Choose File
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
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) =>
                  handleInputChange("additionalNotes", e.target.value)
                }
                placeholder="Add any extra details..."
                className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none text-sm sm:text-base"
              ></textarea>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {isEditMode ? "Update Request" : "Submit Request"}
            </button>
          </div>
        </div>

        {/* List of Requests */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Active Requests
              </h3>
            </div>
            <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {requests.length} Active
            </span>
          </div>
          {requests.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-150px)] pr-2">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`group p-4 sm:p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border ${
                    editingId === req.id
                      ? "border-red-300 ring-2 ring-red-100"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                          {req.requestType}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className="text-xs text-gray-500">
                            Filed: {formatDisplayDate(req.dateTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      Agent: <span className="font-medium">{req.agentName}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      Supervisor: <span className="font-medium">{req.supervisor}</span>
                    </p>
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                          Reason:
                        </span>{" "}
                        {req.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="flex-1 bg-white border-2 border-red-500 text-red-600 p-2 sm:p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEdit(req)}
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
              No active requests found.
            </div>
          )}
        </div>
      </div>
      
      {/* Request History with Table Component */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          Request History
        </h3>
        {requests && requests.length > 0 ? (
          <Table
            data={requests}
            columns={columns}
            pagination={{
              pageSize: 10,
            }}
          />
        ) : (
          <div className="flex items-center justify-center py-10 text-gray-500 italic">
            No request history found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeaderAgentRequest;