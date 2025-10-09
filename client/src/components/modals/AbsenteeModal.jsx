import {
  Users,
  Clock,
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
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const AbsenteeModal = ({ employee, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(employee);
  const [previewFile, setPreviewFile] = useState(null);
  const [notes, setNotes] = useState(employee.notes || "");
  const noteRef = useRef();

  const handleOnClose = () => {
    if (onClose) onClose();
  };

  const handleEdit = () => {
    setEdit((prev) => !prev);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    const newFiles = files.map((file) => ({
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      url: URL.createObjectURL(file),
    }));

    setSelectedEmployee((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles],
    }));

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await api.post(
        `/employees/${selectedEmployee._id}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Files uploaded successfully!");
      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files");
    }
  };
  const handleNoteOnChange = (e) => {
    setNotes(e.target.value);
  };

  const handleDeleteFile = (fileName) => {
    setSelectedEmployee((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((f) => f.name !== fileName),
    }));
  };

  const handleToggleValidity = () => {
    setSelectedEmployee((prev) => ({
      ...prev,
      validationStatus: prev.validationStatus === "Valid" ? "Invalid" : "Valid",
    }));
  };

  const handleButtonSave = () => {
    console.log("Saved employee details:", selectedEmployee);
    toast.success("Absentee details saved successfully!");
    setEdit(false);
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
              className="text-gray-400 hover:text-gray-600"
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
                      className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer ${
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
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <textarea
                      className="text-sm text-gray-700 w-full h-full p-3"
                      rows={4}
                      ref={noteRef}
                      value={notes}
                      onChange={handleNoteOnChange}
                    ></textarea>
                  </div>
                </div>

                {/* Upload Supporting Document */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 ">
                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    Upload Supporting Document
                  </h4>

                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <Upload className="w-6 h-6 text-light mb-2" />
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
                    />
                  </label>
                </div>

                {/* View Supporting Document */}
                {selectedEmployee.attachments?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      Supporting Document
                    </h4>
                    {selectedEmployee.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg mb-2 border-light container-light"
                      >
                        <div>
                          <p className="text-light">{file.name}</p>
                          <p className="text-xs text-light">{file.size}</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setPreviewFile(file.url)}>
                            <Eye className="w-5 h-5" />
                          </button>
                          {isEdit && (
                            <button onClick={() => handleDeleteFile(file.name)}>
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
            <div className="text-sm text-light">
              Recorded on:{" "}
              {dateFormatter(selectedEmployee.date, "MMMM dd, yyyy")}
            </div>
            <div className="flex space-x-3">
              {isEdit && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                  onClick={handleButtonSave}
                >
                  Save
                </button>
              )}
              <button
                onClick={handleOnClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60">
          <div className="relative bg-white rounded-lg h-[80vh] overflow-hidden shadow-xl z-10">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 text-light hover:text-gray-700"
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
