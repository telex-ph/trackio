import React from "react";
import { X, FileText, Download, Eye } from "lucide-react";

const FileViewModal = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const renderFilePreview = () => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={file.data}
          alt={file.name}
          className="max-w-full max-h-[80vh] object-contain mx-auto"
        />
      );
    } else if (file.type === "application/pdf") {
      return (
        <embed
          src={file.data}
          type="application/pdf"
          className="w-full h-[80vh]"
        />
      );
    } else if (file.type.startsWith("text/")) {
      const base64Data = file.data.split(",")[1];
      const decodedText = atob(base64Data);
      return (
        <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-[80vh] text-sm text-gray-800">
          {decodedText}
        </pre>
      );
    } else {
      return (
        <div className="p-6 text-center text-gray-600">
          <p className="text-lg font-semibold mb-2">
            File Preview Not Available
          </p>
          <p>This file type cannot be previewed in the browser.</p>
        </div>
      );
    }
  };

  const handleDownload = () => {
    try {
      const base64Data = file.data.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-[90%] sm:w-[80%] lg:w-[70%] max-h-[90%] bg-white rounded-xl shadow-2xl overflow-hidden p-4">
        <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h4 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {file.name}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-center items-center">
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
};

export default FileViewModal;