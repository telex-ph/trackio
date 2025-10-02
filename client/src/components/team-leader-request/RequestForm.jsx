import React from "react";
import {
  Calendar,
  Clock,
  Upload,
  X,
  Plus,
  User,
  FileText,
  Edit,
} from "lucide-react";

const RequestForm = ({
  formData,
  isEditMode,
  selectedFile,
  isDragOver,
  handleInputChange,
  handleFileUpload,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleSubmit,
  resetForm,
}) => {
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
            {isEditMode ? "Edit Request" : "Create New Request"}
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

        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Supervisor/Team Leader *
          </label>
          <div className="relative">
            <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <input
              type="text"
              value={formData.supervisor}
              onChange={(e) => handleInputChange("supervisor", e.target.value)}
              placeholder="Enter supervisor's name"
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Request Type *
            </label>
            <select
              value={formData.requestType}
              onChange={(e) => handleInputChange("requestType", e.target.value)}
              className="w-full p-3 sm:p-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
            >
              <option value="Overtime">Overtime</option>
              <option value="Undertime">Undertime</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
              <input
                type="date"
                value={formData.dateInput}
                onChange={(e) => handleInputChange("dateInput", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Start Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              End Time *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-red-500 z-10" />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {formData.duration && (
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Duration (Auto-calculated)
            </label>
            <div className="p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
              <p className="text-blue-700 font-semibold text-sm sm:text-base">
                {formData.duration}
              </p>
            </div>
          </div>
        )}

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
                    Drop file or <span className="text-red-600">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          {isEditMode ? "Update Request" : "Submit Request"}
        </button>
      </div>
    </div>
  );
};

export default RequestForm;