import { XCircle, Upload, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios";
import Spinner from "../../assets/loaders/Spinner";

const AbsenteeDocumentsModal = ({ employee, onClose }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(employee);
  const [previewFile, setPreviewFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOnClose = () => {
    if (onClose) onClose();
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

    // Optimistically update UI for better UX
    setSelectedEmployee((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...newFiles],
    }));

    // Option 1: Upload to backend
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      const response = await api.post(`/media/upload-media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Files uploaded successfully!");
      console.log("Upload response:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to upload files");

      // Rollback UI if upload fails
      setSelectedEmployee((prev) => ({
        ...prev,
        attachments: prev.attachments.filter(
          (att) => !newFiles.some((nf) => nf.name === att.name)
        ),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    const previousAttachments = selectedEmployee.attachments;

    // Optimistic update
    setSelectedEmployee((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((f) => f.name !== fileName),
    }));

    toast.success("File removed successfully!");

    // Optional: Delete from server if files are persisted
    /*
    try {
      await api.delete(`/absentees/${selectedEmployee._id}/files/${fileName}`);
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file from server");
      // Rollback
      setSelectedEmployee((prev) => ({
        ...prev,
        attachments: previousAttachments,
      }));
    }
    */
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/60">
        <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-xl z-10">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Supporting Documents
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                Upload Supporting Documents
              </h4>

              {loading ? (
                <Spinner />
              ) : (
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
              )}
            </div>

            {/* List of Uploaded Files */}
            {selectedEmployee.attachments?.length > 0 ? (
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3">
                  Uploaded Files
                </h4>
                {selectedEmployee.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg mb-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="text-gray-700 font-medium">{file.name}</p>
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
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm">
                No documents uploaded yet.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end items-center p-6 border-t border-gray-200 bg-gray-50">
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

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center h-screen w-screen bg-black/80">
          <div className="relative bg-white rounded-lg  h-[80vh] overflow-hidden shadow-xl">
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

export default AbsenteeDocumentsModal;
