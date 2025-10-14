import React from "react";
import { X } from "lucide-react";

const DeleteTeamMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-semibold">Delete Item</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove <b>{itemName}</b> from the team? This
          action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
            disabled={loading}
          >
            {loading ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTeamMemberModal;
