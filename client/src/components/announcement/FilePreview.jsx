import React from "react";
import { X, Download, ExternalLink, FileText, Image, File } from "lucide-react";

const FilePreview = ({ isOpen, onClose, file }) => {
  if (!isOpen || !file) return null;

  const isImage = file.type?.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const isText = file.type === "text/plain";

  const handleDownload = () => {
    try {
      if (!file.data) {
        console.error("File data not available");
        return;
      }

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

  const handleOpenInNewTab = () => {
    try {
      if (!file.data) {
        console.error("File data not available");
        return;
      }

      const newWindow = window.open();
      if (newWindow) {
        if (isImage) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { 
                    margin: 0; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 100vh;
                    background: #f5f5f5;
                  }
                  img { 
                    max-width: 100%; 
                    max-height: 100vh; 
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  }
                </style>
              </head>
              <body>
                <img src="${file.data}" alt="${file.name}" />
              </body>
            </html>
          `);
        } else if (isPDF) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { margin: 0; }
                  embed { width: 100%; height: 100vh; }
                </style>
              </head>
              <body>
                <embed src="${file.data}" type="application/pdf" width="100%" height="100%" />
              </body>
            </html>
          `);
        } else {
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.name}</title>
                <style>
                  body { 
                    margin: 20px; 
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                  }
                  pre { 
                    background: white; 
                    padding: 20px; 
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    white-space: pre-wrap;
                    word-wrap: break-word;
                  }
                </style>
              </head>
              <body>
                <pre>Preview not available for this file type. Please download to view.</pre>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error("Error opening file in new tab:", error);
    }
  };

  const getFileIcon = () => {
    if (isImage) return <Image className="w-8 h-8 text-green-500" />;
    if (isPDF) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {file.name}
              </h3>
              <p className="text-sm text-gray-600">
                {formatFileSize(file.size)} • {file.type || "Unknown type"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex items-center justify-center p-8 bg-gray-100 min-h-[400px] max-h-[calc(90vh-120px)] overflow-auto">
          {isImage ? (
            <img
              src={file.data}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : isPDF ? (
            <embed
              src={file.data}
              type="application/pdf"
              width="100%"
              height="600px"
              className="border rounded-lg shadow-lg"
            />
          ) : isText ? (
            <div className="w-full bg-white rounded-lg shadow-lg p-6">
              <pre className="whitespace-pre-wrap break-words text-sm font-mono text-gray-800 max-h-96 overflow-auto">
                {atob(file.data.split(",")[1])}
              </pre>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <File className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Preview not available</p>
              <p className="text-sm mb-4">
                This file type cannot be previewed in the browser.
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Download className="w-4 h-4" />
                Download to view
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <span className="font-medium">File size:</span> {formatFileSize(file.size)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Type:</span> {file.type || "Unknown"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;