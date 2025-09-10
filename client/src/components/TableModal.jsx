import React, { useState } from "react";
import { X } from "lucide-react";
import { DateTime } from "luxon";

const TableModal = ({
  isOpen,
  onClose,
  title,
  children,
  recordedAt,
  editable = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const formattedDate = recordedAt
    ? DateTime.fromISO(recordedAt).toFormat("MMMM dd, yyyy • hh:mm a")
    : DateTime.now().toFormat("MMMM dd, yyyy • hh:mm a");

  const handleEditClick = () => {
    if (isEditing && onSave) {
      onSave();
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-gray-300">
        {/* Header */}
        <div className="bg-gradient-to-b from-white to-gray-50 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          {children(isEditing)}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Recorded on {formattedDate}
          </span>
          {editable && (
            <div className="flex justify-end gap-3">
              <button
                onClick={handleEditClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm"
              >
                {isEditing ? "Update Changes" : "Edit"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-semibold shadow-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableModal;
