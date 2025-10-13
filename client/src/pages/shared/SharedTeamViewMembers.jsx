import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import Table from "../../components/Table";
import TeamModal from "../../components/modals/TeamModal";
import { Pen, Eye } from "lucide-react";
import { useParams } from "react-router-dom";

const SharedTeamViewMembers = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeamMember = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/group/get-groups/${id}`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching user group:", error);
      toast.error("Failed to load user group");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTeamMember();
  }, [id]);

  const teamRef = useRef();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Team {">"} View Members</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add Member
        </button>
      </div>

      <Table data={members} tableRef={teamRef} />

      {isModalOpen && (
        <TeamModal
          isOpen={isModalOpen}
          onClose={handleCancelBtn}
          onConfirm={handleConfirmBtn}
          selectedTeam={selectedTeam}
        />
      )}
    </div>
  );
};

export default SharedTeamViewMembers;
