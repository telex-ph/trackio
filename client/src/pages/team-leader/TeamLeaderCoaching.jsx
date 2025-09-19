import React, { useState, useRef } from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  FileText,
  User,
  Edit,
} from "lucide-react";
import Table from "../../components/Table";
import TableAction from "../../components/TableAction";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl lg:max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TeamLeaderCoaching = () => {
  // Upcoming sessions
  const [sessions, setSessions] = useState([
    {
      id: "1",
      type: "COACHING",
      title: "You've been scheduled for coaching.",
      postedBy: "Facilitator Team Leader",
      date: "2024-03-23",
      time: "12:45",
      status: "Scheduled",
      attachment: null,
      priority: "Medium",
    },
    {
      id: "2",
      type: "HUDDLE",
      title: "You've been scheduled for coaching.",
      postedBy: "Facilitator Team Leader",
      date: "2024-03-23",
      time: "14:30",
      status: "Scheduled",
      attachment: null,
      priority: "Medium",
    },
    {
      id: "3",
      type: "COACHING",
      title: "Team meeting scheduled.",
      postedBy: "HR Department",
      date: "2024-03-24",
      time: "10:00",
      status: "Scheduled",
      attachment: null,
      priority: "Low",
    },
    {
      id: "4",
      type: "HUDDLE",
      title: "Performance review session.",
      postedBy: "Facilitator Team Leader",
      date: "2024-03-25",
      time: "14:00",
      status: "Scheduled",
      attachment: null,
      priority: "High",
    },
    {
      id: "5",
      type: "COACHING",
      title: "Training session planned.",
      postedBy: "Training Coordinator",
      date: "2024-03-26",
      time: "09:00",
      status: "Scheduled",
      attachment: null,
      priority: "Medium",
    },
    {
      id: "6",
      type: "HUDDLE",
      title: "Project update meeting.",
      postedBy: "Project Manager",
      date: "2024-03-27",
      time: "13:00",
      status: "Scheduled",
      attachment: null,
      priority: "Low",
    },
  ]);

  // Session history sample data
  const [sessionHistory, setSessionHistory] = useState([
    {
      date: "September 16, 2025",
      facilitator: "Anna Martinez",
      type: "Coaching",
      time: "10:00 A.M.",
      agenda: "Enhancing customer service skills for better engagement",
      status: "Completed",
      remarks: "Improved response time and empathy.",
      attachment: "service_guide.pdf",
    },
    {
      date: "September 15, 2025",
      facilitator: "John Reyes",
      type: "Huddle",
      time: "2:30 P.M.",
      agenda: "Weekly team alignment and project updates",
      status: "Completed",
      remarks: "Team set clear Q3 goals.",
      attachment: null,
    },
    {
      date: "September 14, 2025",
      facilitator: "Maria Santos",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda: "Quarterly performance review and feedback",
      status: "Cancelled",
      remarks: "Rescheduled due to conflict.",
      attachment: null,
    },
    {
      date: "September 13, 2025",
      facilitator: "Pedro Garcia",
      type: "Coaching",
      time: "11:00 A.M.",
      agenda: "Training on handling escalated customer complaints",
      status: "Completed",
      remarks: "Mastered de-escalation techniques.",
      attachment: "escalation_protocol.docx",
    },
    {
      date: "September 12, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Huddle",
      time: "1:00 P.M.",
      agenda: "Planning for new product launch support",
      status: "Completed",
      remarks: "Team ready for launch.",
      attachment: "launch_plan.pdf",
    },
    {
      date: "September 11, 2025",
      facilitator: "Ana Lopez",
      type: "Coaching",
      time: "9:30 A.M.",
      agenda: "Effective time management and task prioritization",
      status: "Completed",
      remarks: "Significant productivity gains.",
      attachment: null,
    },
    {
      date: "September 10, 2025",
      facilitator: "Carlos Mendez",
      type: "Meeting",
      time: "4:00 P.M.",
      agenda: "Q4 budget planning and resource allocation",
      status: "Cancelled",
      remarks: "-",
      attachment: null,
    },
    {
      date: "September 9, 2025",
      facilitator: "Sofia Hernandez",
      type: "Coaching",
      time: "10:30 A.M.",
      agenda: "Advanced technical troubleshooting techniques",
      status: "Completed",
      remarks: "Resolved issues 20% faster.",
      attachment: "troubleshoot_guide.pdf",
    },
    {
      date: "September 8, 2025",
      facilitator: "Luis Torres",
      type: "Huddle",
      time: "2:00 P.M.",
      agenda: "Team feedback and collaboration strategies",
      status: "Completed",
      remarks: "Positive team dynamics noted.",
      attachment: null,
    },
    {
      date: "September 7, 2025",
      facilitator: "Clara Villanueva",
      type: "Coaching",
      time: "11:00 A.M.",
      agenda: "Improving sales pitch delivery",
      status: "Cancelled",
      remarks: "Postponed due to client meeting.",
      attachment: null,
    },
  ]);

  // UI & form states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sessionHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sessionHistory.length / itemsPerPage);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // create/edit form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    type: "COACHING",
    title: "",
    date: "",
    time: "",
    postedBy: "",
    agenda: "",
    priority: "Medium",
  });

  // modal for viewing session history details & adding remarks/attachment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [remarkInput, setRemarkInput] = useState("");
  const [modalFile, setModalFile] = useState(null);

  // refs
  const sessionsContainerRef = useRef(null);

  // helpers
  const paginate = (n) => setCurrentPage(n);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.size <= 10 * 1024 * 1024) {
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

  const handleDragLeave = () => setIsDragOver(false);

  // Create or update session
  const handleSubmit = () => {
    if (
      !formData.type ||
      !formData.title ||
      !formData.date ||
      !formData.time ||
      !formData.postedBy ||
      !formData.agenda
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (isEditMode && editingId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                ...formData,
                attachment: selectedFile ? selectedFile.name : s.attachment,
                status: "Scheduled",
              }
            : s
        )
      );
      setIsEditMode(false);
      setEditingId(null);
    } else {
      const newSession = {
        id: Date.now().toString(),
        ...formData,
        attachment: selectedFile ? selectedFile.name : null,
        status: "Scheduled",
      };
      setSessions((prev) => [newSession, ...prev]);
    }

    // reset form
    setFormData({
      type: "COACHING",
      title: "",
      date: "",
      time: "",
      postedBy: "",
      agenda: "",
      priority: "Medium",
    });
    setSelectedFile(null);
  };

  const handleEdit = (session) => {
    setIsEditMode(true);
    setEditingId(session.id);
    setFormData({
      type: session.type || "COACHING",
      title: session.title || "",
      date: session.date || "",
      time: session.time || "",
      postedBy: session.postedBy || "",
      agenda: session.agenda || "",
      priority: session.priority || "Medium",
    });
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      type: "COACHING",
      title: "",
      date: "",
      time: "",
      postedBy: "",
      agenda: "",
      priority: "Medium",
    });
    setSelectedFile(null);
  };

  const handleCancelSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Formatters to match Announcement display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes(":")) {
      const [hStr, mStr] = timeStr.split(":");
      const h = parseInt(hStr, 10);
      const minute = mStr.padStart(2, "0");
      const hour12 = h % 12 || 12;
      const ampm = h >= 12 ? "pm" : "am";
      return `${hour12}:${minute} ${ampm}`;
    }
    return timeStr;
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

  // Modal handlers for session history
  const openModal = (row) => {
    setSelectedHistory(row);
    setRemarkInput(row.remarks || "");
    setModalFile(null);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
    setRemarkInput("");
    setModalFile(null);
    setIsEditing(false);
  };

  const handleModalFile = (file) => {
    if (!file) return;
    if (file.size <= 10 * 1024 * 1024) {
      setModalFile(file);
    } else {
      alert("File size must be less than 10MB");
    }
  };

  const handleUpdateHistory = () => {
    if (!selectedHistory) return;

    const updated = sessionHistory.map((row) =>
      row.date === selectedHistory.date &&
      row.facilitator === selectedHistory.facilitator &&
      row.type === selectedHistory.type &&
      row.time === selectedHistory.time
        ? {
            ...row,
            remarks: remarkInput || row.remarks,
            attachment: modalFile ? modalFile.name : row.attachment,
          }
        : row
    );

    setSessionHistory(updated);
    closeModal();
  };

  // Type colors for table and modal
  const typeColors = {
    Coaching: "bg-blue-100 text-blue-700 border-blue-200",
    Huddle: "bg-green-100 text-green-700 border-green-200",
    Meeting: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  // Status color for table and modal
  const getStatusColor = (status) => {
    return status === "Completed"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-600";
  };

  // Table columns with adjusted AGENDA and REMARKS rendering
  const columns = [
    {
      headerName: "DATE",
      field: "date",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "FACILITATOR",
      field: "facilitator",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "TYPE",
      field: "type",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params) => (
        <span
          className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${
            typeColors[params.value]
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "TIME",
      field: "time",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      headerName: "AGENDA",
      field: "agenda",
      sortable: true,
      filter: true,
      flex: 2,
      cellRenderer: (params) => (
        <span className="flex items-center justify-start p-1 text-xs sm:text-sm">
          {params.value.length > 30
            ? params.value.substring(0, 30) + "..."
            : params.value}
        </span>
      ),
    },
    {
      headerName: "STATUS",
      field: "status",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params) => (
        <span
          className={`px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-xs font-semibold ${getStatusColor(
            params.value
          )}`}
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "REMARKS",
      field: "remarks",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params) => (
        <span className="flex items-center justify-start p-1 text-xs sm:text-sm">
          {params.value.length > 20
            ? params.value.substring(0, 20) + "..."
            : params.value}
        </span>
      ),
    },
    {
      headerName: "ACTION",
      field: "action",
      flex: 1,
      cellRenderer: (params) => (
        <TableAction action={() => openModal(params.data)} />
      ),
      filter: false,
    },
  ];

  return (
    <div>
      {/* Header */}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Coaching and Huddle</h2>
        </div>
        <p className="text-light">Records of employees with late attendance.</p>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 p-3 gap-6 lg:gap-10 mb-16">
        {/* Create/Edit Session (left) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 ${
                  isEditMode ? "bg-red-100" : "bg-indigo-100"
                } rounded-lg`}
              >
                {isEditMode ? (
                  <Edit className="w-6 h-6 text-red-600" />
                ) : (
                  <Plus className="w-6 h-6 text-red-600" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Session" : "Create New Session"}
              </h3>
            </div>

            {isEditMode && (
              <button
                onClick={cancelEdit}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* Session Type + Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
              >
                <option value="COACHING">COACHING</option>
                <option value="HUDDLE">HUDDLE</option>
              </select>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 z-10" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
                />
              </div>

              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 z-10" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter session title"
                className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Facilitator *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 z-10" />
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) =>
                      handleInputChange("postedBy", e.target.value)
                    }
                    placeholder="Facilitator name or department"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Employee/s Involved
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
                >
                  <option value="Low">Agent 1</option>
                  <option value="Medium">Agent 2</option>
                  <option value="High">Agent 3</option>
                </select>
              </div>
            </div>

            {/* Attachment */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
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
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 text-sm">
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
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium text-sm">
                        Drop file or{" "}
                        <span className="text-red-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Agenda *
              </label>
              <textarea
                value={formData.agenda}
                onChange={(e) => handleInputChange("agenda", e.target.value)}
                placeholder="Describe the session agenda..."
                className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-32 focus:border-red-500 transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl"
            >
              {isEditMode ? "Update Session" : "Create Session"}
            </button>
          </div>
        </div>

        {/* Upcoming Sessions (right) */}
        <div
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 mt-1 lg:mt-0"
          ref={sessionsContainerRef}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Upcoming Sessions
            </h3>
            <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {sessions.length} Upcoming
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto h-[655px] pr-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border ${
                  editingId === s.id
                    ? "border-red-300 ring-2 ring-red-100"
                    : "border-gray-100"
                } ${
                  s.type === "COACHING" ? "border-red-200" : "border-green-200"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                        {s.type} • {s.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">
                          2 hours ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Facilitator:{" "}
                    <span className="font-medium">{s.postedBy}</span>
                  </p>

                  <div className="flex gap-6 text-sm text-gray-700">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      {formatDisplayDate(s.date)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      {formatDisplayTime(s.time)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-red-500">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-800">
                        Agenda:
                      </span>{" "}
                      {s.agenda || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleCancelSession(s.id)}
                    className="flex-1 bg-white border-2 border-red-500 text-red-600 p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEdit(s)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 w-full max-w-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
              Session History
            </h3>
          </div>
          <span className="sm:ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            {sessionHistory.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table columns={columns} data={currentItems} />
        </div>

        {/* Summary Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 rounded-2xl border border-gray-200">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-xs">
                Completed:{" "}
                {sessionHistory.filter((s) => s.status === "Completed").length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-xs">
                Cancelled:{" "}
                {sessionHistory.filter((s) => s.status === "Cancelled").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Session Details */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Session Details"
      >
        {selectedHistory && (
          <div className="sm:space-y-6 max-w-full">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Session Information
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span className="text-gray-600 font-medium">Type:</span>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-lg font-medium border text-xs sm:text-sm ${
                          typeColors[selectedHistory.type]
                        } w-fit`}
                      >
                        {selectedHistory.type}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span className="text-gray-600 font-medium">
                        Facilitator:
                      </span>
                      <span className="font-medium text-gray-800 break-words">
                        {selectedHistory.facilitator}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span className="text-gray-600 font-medium">Date:</span>
                      <span className="font-medium text-gray-800">
                        {selectedHistory.date}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span className="text-gray-600 font-medium">Time:</span>
                      <span className="font-medium text-gray-800">
                        {selectedHistory.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Status
                  </h3>
                  <span
                    className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold ${getStatusColor(
                      selectedHistory.status
                    )}`}
                  >
                    {selectedHistory.status}
                  </span>
                  {selectedHistory.remarks &&
                    selectedHistory.remarks !== "-" && (
                      <div className="mt-3">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
                          Remarks:
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 break-words">
                          {selectedHistory.remarks}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Full Agenda */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border-l-4 border-blue-500">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                Complete Agenda
              </h3>
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm break-words">
                {selectedHistory.agenda}
              </p>
            </div>

            {/* Remarks Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Remarks
              </label>
              <textarea
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
                placeholder="Add or edit remarks..."
                className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-32 focus:border-red-500 transition-all resize-none"
                disabled={!isEditing}
              />
            </div>

            {/* Attachment */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Attachment
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                  isDragOver
                    ? "border-red-400 bg-red-50"
                    : modalFile
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
                  onChange={(e) => handleModalFile(e.target.files[0])}
                  disabled={!isEditing}
                />
                <div className="text-center">
                  {modalFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium text-green-700 text-sm">
                          {modalFile.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                          disabled={!isEditing}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : selectedHistory.attachment ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-6 h-6 text-green-500" />
                      <p className="font-medium text-green-700 text-sm">
                        {selectedHistory.attachment}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium text-sm">
                        Drop file or{" "}
                        <span className="text-red-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 sm:gap-4 lg:gap-6 mt-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateHistory}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-white border-2 border-red-500 text-red-600 p-3 rounded-xl hover:bg-red-50 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamLeaderCoaching;