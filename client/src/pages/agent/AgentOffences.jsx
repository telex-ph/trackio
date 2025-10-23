import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  User,
  FileText,
  ChevronDown,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Eye,
  Hash // Import Hash
} from "lucide-react";
import { DateTime } from "luxon";
import api from "../../utils/axios";

// ... (Notification and ConfirmationModal components remain the same) ...
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
const AgentOffences = () => {
  // ... (state variables remain the same) ...
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offenses, setOffenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null); 

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
    offenseLevel: "", // <-- RENAMED from offenseSeverity
    dateOfOffense: "",
    status: "",
    actionTaken: "",
    remarks: "",
    evidence: [],
    isRead: false,
  });

  // ... (showNotification, fetchCurrentUser, fetchOffenses, useEffect remain the same) ...
  const showNotification = (message, type) => {
    setNotification({ message, type, isVisible: true });
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/get-auth-user");
      setCurrentUser(response.data);
      return response.data; 
    } catch (error) {
      console.error("Error fetching current user:", error);
      showNotification("Failed to load user data. Please log in again.", "error");
      return null;
    }
  };

  const fetchOffenses = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/offenses");
      setOffenses(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching offenses:", error);
      showNotification("Failed to load offenses. Please try again.", "error");
      return []; 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const fetchedUser = await fetchCurrentUser(); 
      const fetchedOffenses = await fetchOffenses(); 

      console.log("INITIAL Current User Data (after fetch):", fetchedUser); 
      console.log("INITIAL All Fetched Offenses (after fetch):", fetchedOffenses); 
    };
    loadData();
  }, []); 

  useEffect(() => {
      console.log("Current User State Updated:", currentUser);
  }, [currentUser]);

  useEffect(() => {
      console.log("Offenses State Updated:", offenses);
  }, [offenses]);

  const resetForm = () => {
    setFormData({
      agentName: "",
      offenseCategory: "",
      offenseType: "",
      offenseLevel: "", // <-- RENAMED
      dateOfOffense: "",
      status: "",
      actionTaken: "",
      remarks: "",
      evidence: [],
      isRead: false,
    });
    setIsViewMode(false);
    setEditingId(null);
  };

  const handleView = (off) => {
    setIsViewMode(true);
    setEditingId(off._id);
    setFormData({
      agentName: off.agentName,
      offenseCategory: off.offenseCategory,
      offenseType: off.offenseType,
      offenseLevel: off.offenseLevel || "", // <-- RENAMED
      dateOfOffense: off.dateOfOffense,
      status: off.status,
      actionTaken: off.actionTaken,
      remarks: off.remarks || "",
      evidence: off.evidence || [],
      isRead: off.isRead || false,
    });
  };

  // ... (handleMarkAsRead, formatDisplayDate remain the same) ...
  const handleMarkAsRead = async () => {
    if (!editingId) return;
    try {
      const payload = { isRead: true };
      await api.put(`/offenses/${editingId}`, payload);
      showNotification("Marked as read successfully!", "success");
      resetForm();
      fetchOffenses(); 
    } catch (error) {
      console.error("Error marking as read:", error);
      showNotification("Failed to mark as read. Please try again.", "error");
    }
  };

  const formatDisplayDate = (dateStr) =>
    dateStr
      ? DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
      : "";


  const filteredOffenses = offenses.filter(
    (off) =>
      currentUser && 
      off.employeeId === currentUser.employeeId && 
      !["Action Taken", "Escalated", "Closed"].includes(off.status) &&
      [
        off.offenseType,
        off.offenseCategory,
        off.offenseLevel || "", // <-- RENAMED
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
      currentUser && 
      off.employeeId === currentUser.employeeId && 
      ["Action Taken", "Escalated", "Closed"].includes(off.status)
  );

  console.log("Filtered 'Cases in Progress':", filteredOffenses);
  console.log("Filtered 'Case History':", resolvedOffenses);

  return (
    <div>
      {/* ... (Notification remains the same) ... */}
       {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      )}

      {/* ... (section header remains the same) ... */}
      <section className="flex flex-col mb-2">
        <div className="flex items-center gap-1">
          <h2>Offense Management</h2>
        </div>
        <p className="text-gray-600">View your disciplinary offenses.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 p-2 sm:p-6 md:p-3 gap-6 md:gap-10 mb-12 max-w-9xl mx-auto">
        {/* === View Offense Details Section === */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          {/* ... (header remains the same) ... */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Offense Details
              </h3>
            </div>
            {isViewMode && (
              <button
                onClick={resetForm}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {isViewMode ? (
            <div className="space-y-6">
              {/* ... (Agent Name, Category, Type remain the same) ... */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Agent Name
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                  {formData.agentName}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Offense Category
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formData.offenseCategory || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Offense Type
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formData.offenseType || "N/A"}
                  </p>
                </div>
              </div>

              {/* === ITO ANG BINAGO === */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Offense Level {/* Changed Label */}
                  </label>
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    {formData.offenseLevel || "N/A"} {/* Changed Field */}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Date of Offense
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
                    <p className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                      {formatDisplayDate(formData.dateOfOffense) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* === DULO NG PAGBABAGO === */}

              {/* ... (Status, Action Taken, Remarks, Evidence, Buttons remain the same) ... */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Status
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                  {formData.status || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Action Taken
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                  {formData.actionTaken || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Remarks
                </label>
                <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 sm:h-32 text-gray-800 text-sm sm:text-base overflow-y-auto">
                  {formData.remarks || "No remarks"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Evidence
                </label>
                {formData.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {formData.evidence.map((ev, idx) => (
                      <p
                        key={idx}
                        className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base underline cursor-pointer"
                      >
                        {ev.fileName}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl text-gray-800 text-sm sm:text-base">
                    No evidence
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 p-3 sm:p-4 rounded-2xl hover:bg-gray-300 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  Close
                </button>
                {!formData.isRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-center py-10 text-gray-500 italic">
              Select an offense from the list to view details.
            </div>
          )}
        </div>
        {/* === Offense Records List Section === */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          {/* ... (header and search bar remain the same, maybe update placeholder) ... */}
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
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by level, type, category..." // Updated placeholder
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
                  {/* ... (card header remains the same) ... */}
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
                          {off.isRead ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle className="w-4 h-4" /> Read
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
                              <Bell className="w-4 h-4" /> Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* === ITO ANG BINAGO === */}
                  <div className="space-y-3 mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                      Category:{" "}
                      <span className="font-medium">{off.offenseCategory}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                      <Hash className="w-3 h-3 sm:w-4 sm:h-4" /> {/* Changed Icon */}
                      Level:{" "}
                      <span className="font-medium">{off.offenseLevel || 'N/A'}</span> {/* Changed Text and Field */}
                    </p>
                  {/* === DULO NG PAGBABAGO === */}

                    <div className="bg-red-50 rounded-xl p-3 sm:p-4 border-l-4 border-red-500">
                      <p className="text-xs sm:text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">
                          Action Taken:
                        </span>{" "}
                        {off.actionTaken}
                      </p>
                    </div>

                    {/* ... (remarks and evidence remain the same) ... */}
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

                  {/* ... (buttons remain the same) ... */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleView(off)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white p-2 sm:p-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      View
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
      {/* === Case History Section === */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
        {/* ... (header remains the same) ... */}
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
                {/* === ITO ANG BINAGO === */}
                <tr className="border-b border-gray-200 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  <th className="p-4 whitespace-nowrap">Date</th>
                  {/* <th className="p-4 whitespace-nowrap">Agent</th> REMOVED since this is agent's own view */}
                  <th className="p-4 whitespace-nowrap">Offense Type</th>
                  <th className="p-4 whitespace-nowrap">Level</th> {/* Changed Header */}
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 whitespace-nowrap">Action Taken</th>
                  <th className="p-4 whitespace-nowrap">Remarks</th>
                </tr>
                {/* === DULO NG PAGBABAGO === */}
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
                    {/* <td className="p-4 text-sm text-gray-800 font-medium">
                      {off.agentName}
                    </td> REMOVED */}
                    <td className="p-4 text-sm text-gray-600">
                      {off.offenseType}
                    </td>
                    {/* === ITO ANG BINAGO === */}
                    <td className="p-4 text-sm text-gray-600">
                      {off.offenseLevel || 'N/A'} {/* Changed Field */}
                    </td>
                    {/* === DULO NG PAGBABAGO === */}
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

export default AgentOffences;