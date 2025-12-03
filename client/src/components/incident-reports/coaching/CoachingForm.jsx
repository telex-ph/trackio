import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Upload,
  X,
  Plus,
  Edit,
  FileText,
  Eye,
  Download,
  Search,
} from "lucide-react";
import api from "../../../utils/axios";

const CoachingForm = ({
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  isDragOver,
  setIsDragOver,
  isEditMode,
  resetForm,
  handleCoachingSubmit,
  showNotification,
  isLoading,
}) => {
  const [searchField, setSearchField] = useState(""); // which field is currently being searched
  const [agentQuery, setAgentQuery] = useState("");
  const [coachQuery, setCoachQuery] = useState("");
  const [teamLeaderQuery, setTeamLeaderQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  const agentRef = useRef(null);
  const coachRef = useRef(null);
  const teamLeaderRef = useRef(null);

  const existingEvidence = formData.evidence || [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (field, e) => {
    const query = e.target.value;
    setSearchField(field);

    if (field === "agent") setAgentQuery(query);
    if (field === "coach") setCoachQuery(query);
    if (field === "teamLeader") setTeamLeaderQuery(query);

    setFormData((prev) => ({
      ...prev,
      [`${field}Name`]: query,
      [`${field}Id`]: "",
      [`${field}Role`]: "",
    }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (query.length > 0) fetchEmployees(query);
      else setShowSuggestions(false);
    }, 500);
  };

  const fetchEmployees = async (query) => {
    setIsSearching(true);
    try {
      const response = await api.get(`user/users?search=${query}`);
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
      [`${searchField}Name`]: fullName,
      [`${searchField}Id`]: employee._id,
      [`${searchField}Role`]: employee.role,
    }));

    if (searchField === "agent") setAgentQuery(fullName);
    if (searchField === "coach") setCoachQuery(fullName);
    if (searchField === "teamLeader") setTeamLeaderQuery(fullName);

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

  const renderSuggestions = () => (
    <div
      ref={searchRef}
      className="border border-gray-300 bg-white rounded-lg shadow-md mt-1 max-h-60 overflow-auto z-50 absolute w-full"
    >
      {suggestions.map((emp) => (
        <div
          key={emp._id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => handleSelectEmployee(emp)}
        >
          {emp.firstName} {emp.lastName} ({emp.role})
        </div>
      ))}
    </div>
  );

  const date = new Date();
  const today = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;

  const renderSearchInput = (label, field) => {
    let value = "";
    let ref = null;

    if (field === "agent") {
      value = agentQuery;
      ref = agentRef;
    } else if (field === "coach") {
      value = coachQuery;
      ref = coachRef;
    } else if (field === "teamLeader") {
      value = teamLeaderQuery;
      ref = teamLeaderRef;
    }

    return (
      <div className="relative space-y-2" ref={ref}>
        <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {label} *
        </label>
        <Search className="absolute left-3 sm:left-4 bottom-0.5 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => handleSearchChange(field, e)}
          placeholder={`Search and select ${label.toLowerCase()}...`}
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
        />
        {searchField === field && showSuggestions && renderSuggestions()}
      </div>
    );
  };

  return (
    <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 relative">
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
            {isEditMode ? "Edit Coaching Log" : "Create Coaching Log"}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {renderSearchInput("Agent Name", "agent")}
          {renderSearchInput("Coach / Supervisor Name", "coach")}
        </div>

        {/* Date of Mistake */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Date of Mistake *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 z-10" />
              <input
                type="date"
                value={formData.dateOfMistake || ""}
                onChange={(e) =>
                  handleInputChange("dateOfMistake", e.target.value)
                }
                max={today}
                className="w-full pl-10 pr-3 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Coaching Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 z-10" />
              <input
                type="date"
                value={formData.coachingDate || ""}
                onChange={(e) =>
                  handleInputChange("coachingDate", e.target.value)
                }
                min={today}
                className="w-full pl-10 pr-3 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Coaching Mistake */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Agent Mistake *
          </label>
          <textarea
            value={formData.coachingMistake || ""}
            onChange={(e) =>
              handleInputChange("coachingMistake", e.target.value)
            }
            placeholder="Describe the coaching mistake..."
            className="w-full p-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-24 focus:border-red-500 focus:bg-white transition-all duration-300 resize-none"
          />
        </div>

        {/* Evidence Upload */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Upload Evidence
          </label>
          {selectedFile ? (
            <div className="border-2 border-dashed rounded-2xl p-4 border-green-400 bg-green-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-green-500 shrink-0" />
                  <p className="font-medium text-green-700 text-xs truncate">
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
              {existingEvidence.map((ev, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="font-medium text-blue-700 text-xs truncate">
                      {ev.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                    <a
                      href={ev.url}
                      download={ev.fileName}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, evidence: [] }))
                      }
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 text-xs font-medium"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-4 ${
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
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium text-xs">
                  Drop file or <span className="text-red-600">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleCoachingSubmit}
          disabled={isLoading}
          className="w-full bg-red-600 text-white p-3 rounded-2xl hover:bg-red-700 font-semibold text-base shadow-xl"
        >
          {isEditMode ? "Update Coaching Log" : "Submit Coaching Log"}
        </button>
      </div>
    </div>
  );
};

export default CoachingForm;
