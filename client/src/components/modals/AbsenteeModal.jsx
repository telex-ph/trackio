import {
  Users,
  XCircle,
  User,
  Hash,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Upload,
  Eye,
  Trash2,
  CheckCircle,
  XCircle as XMark,
  Pen,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";
import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios"; // Import api

const AbsenteeModal = ({ employee, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(employee);
  const [previewFile, setPreviewFile] = useState(null);
  const [notes, setNotes] = useState(employee.notes || "");
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const noteRef = useRef();

  // Focus textarea when edit mode is enabled
  useEffect(() => {
    if (isEdit && noteRef.current) {
      noteRef.current.focus();
    }
  }, [isEdit]);

  const handleOnClose = () => {
    if (onClose) onClose();
  };

  const handleEdit = () => {
    setEdit((prev) => !prev);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      url: URL.createObjectURL(file),
    }));

    // Update local state immediately for better UX
    setSelectedEmployee((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles],
    }));

    // Option 1: If you have an upload endpoint
    // Uncomment and adjust the endpoint URL as needed
    /*
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      const response = await api.post(
        `/absentees/${selectedEmployee._id}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Files uploaded successfully!");
      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to upload files");
      
      // Rollback the local state if upload fails
      setSelectedEmployee((prev) => ({
        ...prev,
        attachments: prev.attachments.filter(
          (att) => !newFiles.some((nf) => nf.name === att.name)
        ),
      }));
    } finally {
      setLoading(false);
    }
    */

    // Option 2: Store files locally (for now)
    // Remove this if you have a working upload endpoint
    toast.success(`${files.length} file(s) added successfully!`);
    console.log("Files added locally:", newFiles);
  };

  const handleNoteOnChange = (e) => {
    setNotes(e.target.value);
  };

  const handleDeleteFile = async (fileName) => {
    // Optimistically update UI
    const previousAttachments = selectedEmployee.attachments;
    setSelectedEmployee((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((f) => f.name !== fileName),
    }));

    toast.success("File removed successfully!");

    // Optional: Call API to delete from server if files are persisted
    /*
    try {
      await api.delete(`/absentees/${selectedEmployee._id}/files/${fileName}`);
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file from server");
      
      // Rollback on failure
      setSelectedEmployee((prev) => ({
        ...prev,
        attachments: previousAttachments,
      }));
    }
    */
  };

  const handleToggleValidity = () => {
    if (!isEdit) return; // Only allow toggle in edit mode

    setSelectedEmployee((prev) => ({
      ...prev,
      validationStatus: prev.validationStatus === "Valid" ? "Invalid" : "Valid",
    }));
  };

  const handleButtonSave = async () => {
    try {
      setLoading(true);

      // Prepare data to save
      const updatedData = {
        id: selectedEmployee.doc_id || selectedEmployee._id,
        notes: notes,
        validationStatus: selectedEmployee.validationStatus,
        attachments: selectedEmployee.attachments,
      };

      console.log("Saving absentee details:", updatedData);

      // Uncomment when you have the API endpoint ready
      /*
      const response = await api.patch(
        `/absentees/update`,
        updatedData
      );
      console.log("Save response:", response.data);
      */

      toast.success("Absentee details saved successfully!");
      setEdit(false);
    } catch (error) {
      console.error("Save failed:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60">
        <div className="relative bg-white rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl z-10">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Absentee Details
            </h3>
            <button
              onClick={handleOnClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Section - Employee Details */}
              <div className="col-span-4 space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedEmployee.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {selectedEmployee.role}
                  </p>
                </div>

                {/* Employee Info */}
                <div className="space-y-4">
                  {[
                    {
                      icon: User,
                      label: "Full Name",
                      value: selectedEmployee.name,
                    },
                    {
                      icon: Hash,
                      label: "ID",
                      value:
                        selectedEmployee.id?.toString().padStart(3, "0") ||
                        "001",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value:
                        selectedEmployee.email ||
                        `${selectedEmployee.name
                          .toLowerCase()
                          .replace(" ", ".")}@company.com`,
                    },
                    { icon: Phone, label: "Phone", value: "09123456789" },
                    {
                      icon: Building,
                      label: "Assigned Accounts",
                      value: "N/A",
                    },
                    {
                      icon: Briefcase,
                      label: "Position",
                      value: selectedEmployee.role,
                    },
                    {
                      icon: Users,
                      label: "Department",
                      value: selectedEmployee.department,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 tracking-wide">
                          {item.label}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validity Toggle */}
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Validation Status
                    </span>
                    <div
                      onClick={handleToggleValidity}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                        isEdit
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-60"
                      } ${
                        selectedEmployee.validationStatus === "Valid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedEmployee.validationStatus === "Valid" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XMark className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {selectedEmployee.validationStatus || "Invalid"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Work Details */}
              <div className="col-span-8 space-y-6">
                {/* Daily Notes */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                  <div className="flex items-center justify-between space-x-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        Notes
                      </h4>
                    </div>

                    <div>
                      <Pen
                        onClick={handleEdit}
                        className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <textarea
                      className="text-sm text-gray-700 w-full h-full p-3 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg disabled:cursor-not-allowed"
                      rows={4}
                      ref={noteRef}
                      value={notes}
                      onChange={handleNoteOnChange}
                      disabled={!isEdit}
                      placeholder="Enter notes here..."
                    />
                  </div>
                </div>

                {/* Upload Supporting Document */}
                {isEdit && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      Upload Supporting Document
                    </h4>

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">
                        Drag your file(s) or{" "}
                        <span className="text-blue-600">Browse files</span>
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,application/pdf"
                        multiple
                        disabled={loading}
                      />
                    </label>
                  </div>
                )}

                {/* View Supporting Document */}
                {selectedEmployee.attachments?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      Supporting Documents
                    </h4>
                    {selectedEmployee.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg mb-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="text-gray-700 font-medium">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setPreviewFile(file.url)}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Preview file"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {isEdit && (
                            <button
                              onClick={() => handleDeleteFile(file.name)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Delete file"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Recorded on:{" "}
              {dateFormatter(selectedEmployee.date, "MMMM dd, yyyy")}
            </div>
            <div className="flex space-x-3">
              {isEdit && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleButtonSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              )}
              <button
                onClick={handleOnClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center h-screen w-screen bg-black/80">
          <div className="relative bg-white rounded-lg w-[90vw] h-[80vh] overflow-hidden shadow-xl">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg z-10 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            {previewFile.endsWith(".pdf") ? (
              <iframe
                src={previewFile}
                className="w-full h-full rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewFile}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AbsenteeModal;
