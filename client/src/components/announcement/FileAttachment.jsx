import React from "react";
import { FileText, Image, Download, Eye, Paperclip } from "lucide-react";

const FileAttachment = ({ file, onDownload, onView }) => {
  const isImage = file.type?.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  const getFileIcon = () => {
    if (isImage) {
      return <Image className="w-4 h-4 text-green-600" />;
    }
    if (isPDF) {
      return <FileText className="w-4 h-4 text-red-600" />;
    }
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  const getFileTypeColor = () => {
    if (isImage) return "bg-green-50 border-green-200 text-green-700";
    if (isPDF) return "bg-red-50 border-red-200 text-red-700";
    return "bg-blue-50 border-blue-200 text-blue-700";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${getFileTypeColor()} group hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{file.type || "Unknown type"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {(isImage || isPDF) && (
          <button
            onClick={() => onView && onView(file)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview file"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDownload && onDownload(file)}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Download file"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FileAttachment;