import React, { useState } from "react";
import { Label, TextInput } from "flowbite-react";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";
import toast from "react-hot-toast";
import {
  Users,
  X,
  ArrowRight,
} from "lucide-react";

const TeamModal = ({ isOpen, onClose, onConfirm, selectedTeam }) => {
  const user = useStore((state) => state.user);
  const [teamName, setTeamName] = useState(selectedTeam?.name || "");
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-[5px] w-full bg-[#800000]"></div>
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-[#800000] mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Team Name
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Enter the team name below to create a new team. This will appear in your team management table.
            </p>
          </div>

          <div className="mb-8">
            <Label htmlFor="teamName" className="text-gray-700 mb-2 block font-medium">
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
              theme={{
                field: {
                  input: {
                    base: "block w-full border border-gray-200 bg-gray-50 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] p-3 text-sm transition-all",
                  }
                }
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 order-1 sm:order-2 bg-[#800000] text-white py-3 rounded-xl font-semibold hover:bg-[#600000] transition-all shadow-lg shadow-red-900/20 active:scale-95 cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
