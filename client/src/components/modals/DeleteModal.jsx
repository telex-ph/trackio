import React from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "flowbite-react";

const DeleteModal = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4 text-red-600">
          <AlertTriangle className="w-12 h-12" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
          {title || "Confirm Deletion"}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 text-sm">
          {message ||
            "Are you sure you want to delete this item? This action cannot be undone."}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <Button color="failure" onClick={onConfirm}>
            Yes, Delete
          </Button>
          <Button color="red" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
