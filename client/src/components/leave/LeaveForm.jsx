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

const LeaveForm = ({
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  isDragOver,
  setIsDragOver,
  isEditMode,
  resetForm,
  handleLeaveSubmit,
  showNotification,
  isUploading,
}) => {
  const onFormChange = ({ target }) => {
    const updatedForm = { ...formData, [target.name]: target.value };

    // Clear dates if leaveType changes
    if (target.name === "leaveType") {
      updatedForm.startDate = "";
      updatedForm.endDate = "";
    }

    setFormData(updatedForm);
  };

  const existingLeave = formData.leave || [];

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

  return (
    <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
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
            {isEditMode ? "Edit Leave" : "Create Leave Application"}
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
        {/* Leave Type && Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Leave Type */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Leave Type *
            </label>
            <select
              name="leaveType"
              value={formData.leaveType || ""}
              onChange={(e) =>
                onFormChange({
                  target: { name: "leaveType", value: e.target.value },
                })
              }
              className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl
      focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800
      text-sm sm:text-base"
            >
              <option value="" disabled>
                Select a type
              </option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation Leave">Vacation Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Parental Leave">
                Parental Leave: Solo Parent
              </option>
              <option value="Leave Without Pay">Leave Without Pay</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Date Range *
            </label>
            <div
              className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl
        text-gray-800 text-sm sm:text-base cursor-pointer
        focus-within:border-red-500 transition-all duration-300 flex items-center justify-between"
            >
              <span>
                {formData.startDate
                  ? formData.endDate
                    ? `${formData.startDate} → ${formData.endDate}`
                    : formData.startDate
                  : "Select date range"}
              </span>
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Conditional textbox for "Other" */}
        {formData.leaveType === "Other" && (
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Please specify *
            </label>
            <input
              type="text"
              name="otherLeaveType"
              placeholder="Please specify"
              value={formData.otherLeaveType || ""}
              onChange={(e) =>
                onFormChange({
                  target: { name: "otherLeaveType", value: e.target.value },
                })
              }
              className="w-full p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl
        focus:border-red-500 focus:bg-white transition-all duration-300 text-gray-800
        text-sm sm:text-base"
            />
          </div>
        )}
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

        {/* Upload Leave Section */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Upload file
          </label>
          {selectedFile ? (
            <div className="border-2 border-dashed rounded-2xl p-4 border-green-400 bg-green-50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
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
          ) : !selectedFile && existingLeave.length > 0 ? (
            <div className="border-2 border-dashed rounded-2xl p-4 border-blue-400 bg-blue-50">
              {existingLeave.slice(0, 1).map((ev, idx) => {
                const viewUrl = ev.url;
                return (
                  <div key={idx} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 shrink-0" />
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
                        href={ev.url}
                        download={ev.fileName}
                        className="flex-1 flex items-center justify-center gap-1.5 p-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, leave: [] }));
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
          onClick={handleLeaveSubmit}
          disabled={isUploading}
          className="w-full bg-linear-to-r from-red-600 to-red-700 text-white p-3 sm:p-4 rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
        >
          {isUploading ? (
            <>
              <span className="loader border-white border-2 border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
              {isEditMode ? "Updating..." : "Submitting..."}
            </>
          ) : isEditMode ? (
            "Update Leave"
          ) : (
            "Submit Leave"
          )}
        </button>
      </div>
    </div>
  );
};

export default LeaveForm;
