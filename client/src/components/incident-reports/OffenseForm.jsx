import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Upload,
  X,
  Plus,
  Edit,
  FileText,
  Search,
  User,
  Hash,
  Eye,
  Download,
} from "lucide-react";
import api from "../../utils/axios";

// --- HELPER FUNCTION ---
// Converts Base64 data URL to a browser-readable Blob URL
// This fixes the "blank screen" issue when viewing PDFs
const base64ToBlobUrl = (base64, type) => {
  try {
    const base64Data = base64.split(",")[1];
    if (!base64Data) {
      console.error("Invalid Base64 string");
      return base64; // Fallback
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: type });
    const url = URL.createObjectURL(blob);
    return url;
  } catch (e) {
    console.error("Failed to convert Base64 to Blob URL:", e);
    return base64; // Fallback
  }
};
// --- END OF HELPER FUNCTION ---

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

const OffenseForm = ({
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  isDragOver,
  setIsDragOver,
  isEditMode,
  resetForm,
  handleSubmit,
  showNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const existingEvidence = formData.evidence || [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFormData((prev) => ({
      ...prev,
      agentName: query,
      employeeId: "",
      agentRole: "",
    }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (query.length > 0) {
        fetchEmployees(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
  };

  const fetchEmployees = async (query) => {
    setIsSearching(true);
    try {
      const response = await api.get(`/users?search=${query}`);
      setSuggestions(response.data || []);
      setShowSuggestions(response.data && response.data.length > 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response && error.response.status !== 401) {
        showNotification(
          "Failed to fetch employee suggestions. Please try again.",
          "error"
        );
      }
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectEmployee = (employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`;
    setFormData((prev) => ({
      ...prev,
      agentName: fullName,
      employeeId: employee.employeeId,
      agentRole: employee.role,
    }));
    setSearchQuery(fullName);
    setShowSuggestions(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidSuggestion = (emp) => {
    return (
      emp &&
      typeof emp === "object" &&
      emp._id &&
      emp.firstName &&
      emp.lastName
    );
  };

  // --- MODIFICATION: Kinukuha ang LOCAL date, hindi UTC ---
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-indexed kaya +1
  const day = String(date.getDate()).padStart(2, '0'); // Kukunin ang local date
  const today = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  // --- END OF MODIFICATION ---

  return (
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
        {/* Agent Name Search */}
        <div className="space-y-2" ref={searchRef}>
          <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Agent Name *
          </label>
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search and select agent..."
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
            />
            {showSuggestions && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-2xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                {isSearching ? (
                  <li className="p-3 text-gray-500 text-sm">Searching...</li>
                ) : suggestions.length > 0 ? (
                  suggestions.filter(isValidSuggestion).map((emp) => (
                    <li
                      key={emp._id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="p-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                    >
                      {emp.firstName} {emp.lastName}{" "}
                      {emp.employeeId ? `(${emp.employeeId})` : ""}
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-gray-500 text-sm">No matches found</li>
                )}
                {suggestions.length > 0 &&
                  suggestions.filter(isValidSuggestion).length !==
                    suggestions.length && (
                    <li className="p-3 text-gray-400 text-xs italic">
                      Some results might be hidden due to incomplete data.
                    </li>
                  )}
              </ul>
            )}
          </div>
          {(formData.employeeId || formData.agentRole) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <input
                type="text"
                value={formData.employeeId || "N/A"}
                readOnly
                placeholder="Employee ID"
                className="w-full p-3 sm:p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-600 text-sm sm:text-base"
              />
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.agentRole || "N/A"}
                  readOnly
                  placeholder="Role"
                  className="w-full pl-10 sm:pl-12 p-3 sm:p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-600 text-sm sm:text-base capitalize"
                />
              </div>
            </div>
          )}
        </div>

        {/* Offense Category / Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

        {/* Offense Level / Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Offense Level *
            </label>
            <select
              value={formData.offenseLevel}
              onChange={(e) =>
                handleInputChange("offenseLevel", e.target.value)
              }
              className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
            >
              <option value="">Select level</option>
              <option value="1st Offense">1st Offense</option>
              <option value="2nd Offense">2nd Offense</option>
              <option value="3rd Offense">3rd Offense</option>
              <option value="4th Offense">4th Offense</option>
              <option value="5th Offense+">5th Offense+</option>
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
                // Ito na yung TAMA. 'today' (Oct 24) ay kasama sa enabled.
                max={today}
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
            onChange={(e) => handleInputChange("actionTaken", e.target.value)}
            className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
          >
            <option value="">Select action</option>
            <option value="Coaching / Counseling">Coaching / Counseling</option>
            <option value="Verbal Warning">Verbal Warning</option>
            <option value="Written Warning">Written Warning</option>
            <option value="Final Written Warning">Final Written Warning</option>
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

        {/* Upload Evidence Section */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Upload Evidence
          </label>
          {selectedFile ? (
            <div className="border-2 border-dashed rounded-2xl p-4 border-green-400 bg-green-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                  <p className="font-medium text-green-700 text-xs sm:text-sm truncate">
                    {selectedFile.name}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : !selectedFile && existingEvidence.length > 0 ? (
            <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
              {existingEvidence.slice(0, 1).map((ev, idx) => {
                const viewUrl = base64ToBlobUrl(ev.data, ev.type);
                return (
                  <div key={idx} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                      <p className="font-medium text-blue-700 text-xs sm:text-sm truncate">
                        {ev.fileName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </a>
                      <a
                        href={ev.data}
                        download={ev.fileName}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, evidence: [] }));
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 text-xs font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                isDragOver
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-gray-50/30"
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <div className="text-center">
                <div>
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium text-xs sm:text-sm">
                    Drop file or <span className="text-red-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          {isEditMode ? "Update Offense" : "Submit Offense"}
        </button>
      </div>
    </div>
  );
};

export default OffenseForm;