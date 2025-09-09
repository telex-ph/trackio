import React, { useState, useRef } from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  FileText,
  User,
  Eye,
  Edit,
} from "lucide-react";

const TeamLeaderCoaching = () => {
  // Upcoming sessions (static sample content kept as you provided)
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

  // Session history (kept your history content)
  const [sessionHistory, setSessionHistory] = useState([
    {
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Coaching",
      time: "3:00 P.M.",
      agenda: "Incorrect ticket handling",
      status: "Completed",
      remarks: "Missed escalation step – discussed proper escalation flow.",
      attachment: null,
    },
    {
      date: "August 8, 2025",
      facilitator: "Juana Dela Cruz",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda: "Recognition of employee achievements",
      status: "Cancelled",
      remarks: "-",
      attachment: null,
    },
    {
      date: "August 7, 2025",
      facilitator: "Maria Santos",
      type: "Coaching",
      time: "10:00 A.M.",
      agenda: "Customer service training",
      status: "Completed",
      remarks: "Improved response time – great progress.",
      attachment: null,
    },
    {
      date: "August 7, 2025",
      facilitator: "Maria Santos",
      type: "Huddle",
      time: "2:00 P.M.",
      agenda: "Team coordination",
      status: "Completed",
      remarks: "Successful team alignment.",
      attachment: null,
    },
    {
      date: "August 6, 2025",
      facilitator: "Pedro Garcia",
      type: "Coaching",
      time: "11:00 A.M.",
      agenda: "Error handling",
      status: "Cancelled",
      remarks: "Rescheduled due to conflict.",
      attachment: null,
    },
    {
      date: "August 6, 2025",
      facilitator: "Pedro Garcia",
      type: "Huddle",
      time: "1:00 P.M.",
      agenda: "Project status",
      status: "Completed",
      remarks: "On track – no issues.",
      attachment: null,
    },
    {
      date: "August 5, 2025",
      facilitator: "Ana Lopez",
      type: "Coaching",
      time: "9:00 A.M.",
      agenda: "Sales techniques",
      status: "Completed",
      remarks: "Excellent performance boost.",
      attachment: null,
    },
    {
      date: "August 5, 2025",
      facilitator: "Ana Lopez",
      type: "Meeting",
      time: "3:00 P.M.",
      agenda: "Budget review",
      status: "Cancelled",
      remarks: "-",
      attachment: null,
    },
    {
      date: "August 4, 2025",
      facilitator: "Juan Reyes",
      type: "Coaching",
      time: "10:30 A.M.",
      agenda: "Technical skills",
      status: "Completed",
      remarks: "Improved coding skills.",
      attachment: null,
    },
    {
      date: "August 4, 2025",
      facilitator: "Juan Reyes",
      type: "Huddle",
      time: "2:30 P.M.",
      agenda: "Team feedback",
      status: "Completed",
      remarks: "Positive feedback received.",
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

  // create/edit form states (mirrors Announcement form exactly but fields fit sessions)
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
    // scroll to form (optional)
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
    // remove from upcoming sessions
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // Formatters to match Announcement display
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr; // if already formatted like "23 Mar 2024"
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "";
    // if time like "12:45" -> convert to 12-hour
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
    setRemarkInput("");
    setModalFile(null);
  };
  const closeModal = () => {
    setSelectedHistory(null);
    setRemarkInput("");
    setModalFile(null);
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Coaching & Huddle
          </h2>
          <p className="text-gray-600">All updates will be reflected on the admin profile.</p>
        </div>
      </div>

      {/* Two-Column Layout (mirrors Announcement layout exactly) */}
      <div className="grid grid-cols-2 gap-10 mb-16">
        {/* Create/Edit Session (left) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${isEditMode ? "bg-red-100" : "bg-indigo-100"} rounded-lg`}>
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
            <div className="grid grid-cols-3 gap-6">
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

            {/* Title + Posted By */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter session title"
                className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Facilitator *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500 z-10" />
                  <input
                    type="text"
                    value={formData.postedBy}
                    onChange={(e) => handleInputChange("postedBy", e.target.value)}
                    placeholder="Facilitator name or department"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Employee/s Involved</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 transition-all"
                >
                  <option value="Low">Agent 1</option>
                  <option value="Medium">Agent 2</option>
                  <option value="High">Agent 3</option>
                </select>
              </div>
            </div>

            {/* Attachment (drag & drop) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Attachment</label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                  isDragOver ? "border-red-400 bg-red-50" : selectedFile ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50/30"
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
                        <p className="font-medium text-green-700 text-sm">{selectedFile.name}</p>
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
                        Drop file or <span className="text-red-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Agenda *</label>
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
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20" ref={sessionsContainerRef}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Upcoming Sessions</h3>
            <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{sessions.length} Upcoming</span>
          </div>

          <div className="space-y-4 overflow-y-auto h-[655px] pr-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border ${
                  editingId === s.id ? "border-red-300 ring-2 ring-red-100" : "border-gray-100"
                } ${s.type === "COACHING" ? "border-red-200" : "border-green-200"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">{s.type} • {s.title}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Facilitator: <span className="font-medium">{s.postedBy}</span>
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
                      <span className="font-semibold text-gray-800">Agenda:</span> {s.agenda || "—"}
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

      {/* Session History (full width card matching Announcement style) */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          Session History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-md text-left text-gray-700 border-separate border-spacing-y-3">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold rounded-2xl">
              <tr>
                {["DATE", "FACILITATOR", "TYPE", "TIME", "AGENDA", "STATUS", "REMARKS", "ATTACHMENT", "ACTION"].map((col) => (
                  <th key={col} className="px-6 py-4 first:rounded-l-2xl last:rounded-r-2xl">{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {currentItems.map((row, i) => (
                <tr key={i} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <td className="px-6 py-4 rounded-l-2xl font-medium">{row.date}</td>
                  <td className="px-6 py-4">{row.facilitator}</td>
                  <td className="px-6 py-4">{row.type}</td>
                  <td className="px-6 py-4">{row.time}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{row.agenda}</td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${row.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{row.remarks}</td>
                  <td className="px-6 py-4">
                    {row.attachment ? <a href="#" className="text-red-600 hover:underline">{row.attachment}</a> : "-"}
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl">
                    <button className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium" onClick={() => openModal(row)}>
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination (same as Announcement) */}
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all duration-300 ${currentPage === number ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-2 border-red-200"}`}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal (mirrors Announcement modal but shows coaching details & allows remarks + file upload) */}
      {selectedHistory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-3xl w-full relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={closeModal}>
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">Session Details</h3>

            <div className="space-y-4">
              <p><strong>Date:</strong> {selectedHistory.date}</p>
              <p><strong>Facilitator:</strong> {selectedHistory.facilitator}</p>
              <p><strong>Type:</strong> {selectedHistory.type}</p>
              <p><strong>Time:</strong> {selectedHistory.time}</p>
              <p><strong>Agenda:</strong> {selectedHistory.agenda}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedHistory.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {selectedHistory.status}
                </span>
              </p>
              <p><strong>Remarks:</strong> {selectedHistory.remarks}</p>

              {selectedHistory.attachment && (
                <p>
                  <strong>Attachment:</strong>{" "}
                  <a href="#" className="text-red-600 hover:underline">{selectedHistory.attachment}</a>
                </p>
              )}

              {/* Add remarks + file upload */}
              <textarea value={remarkInput} onChange={(e) => setRemarkInput(e.target.value)} placeholder="Add remarks..." className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-red-500" />

              <input type="file" onChange={(e) => handleModalFile(e.target.files[0])} className="w-full p-2 border rounded-lg" />
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition font-medium shadow-md" onClick={handleUpdateHistory}>Save</button>
              <button className="flex-1 bg-gray-300 text-gray-800 p-3 rounded-lg hover:bg-gray-400 transition font-medium shadow-md" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeaderCoaching;
