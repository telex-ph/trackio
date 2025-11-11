import React, { useState } from "react";
import { Label, TextInput } from "flowbite-react";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";

const TeamModal = ({ isOpen, onClose, onConfirm, selectedTeam }) => {
  const user = useStore((state) => state.user);
  const [teamName, setTeamName] = useState(selectedTeam?.name || "");
  const [loading, setLoading] = useState(false);

  console.log(selectedTeam);

  const handleInputChange = (e) => {
    setTeamName(e.target.value);
  };

  const handleConfirm = async () => {
    if (!teamName || !teamName.trim()) {
      toast.error("Team name cannot be empty");
      return;
    }

    try {
      setLoading(true);
      if (!selectedTeam) {
        await api.post("/group/add-group", {
          id: user._id,
          name: teamName.trim(),
        });
      } else {
        await api.patch("/group/update-group", {
          id: selectedTeam._id,
          name: teamName,
        });
      }

      onConfirm();
    } catch (error) {
      console.error("Error adding user group:", error);
      toast.error("Failed to add user group");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative bg-white rounded-md p-8 max-w-md w-full shadow-2xl border border-gray-200">
        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Team Name
        </h3>
        {/* Paragraph */}
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          Enter the team name below to create a new team. This will appear in
          your team management table.
        </p>

        {/* Flowbite Input Field */}
        <div className="mb-6">
          <Label htmlFor="teamName" className="text-gray-700 mb-2 block">
            Team Name
          </Label>
          <TextInput
            id="teamName"
            type="text"
            name="teamName"
            placeholder="Enter team name"
            required
            value={teamName}
            onChange={handleInputChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-md font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white p-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
