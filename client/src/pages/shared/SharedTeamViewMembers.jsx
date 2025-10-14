import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import { Pen, Trash2 } from "lucide-react";
import AddMemberModal from "../../components/modals/AddMemberModal";
import DeleteTeamMemberModal from "../../components/modals/DeleteTeamMemberModal";

const SharedTeamViewMembers = () => {
  const user = useStore((state) => state.user);
  const [members, setMembers] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const teamRef = useRef();

  const fetchTeamMember = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/group/get-group/${user._id}`);
      setMembers(response.data.agents || []);
      setTeamId(response.data._id);
    } catch (error) {
      console.error("Error fetching user group:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user._id) fetchTeamMember();
  }, [user._id]);

  const handleDelete = async () => {
    if (!selectedMember) return;

    console.log(selectedMember._id);
    console.log(teamId);

    try {
      setLoading(true);
      await api.patch(`/group/remove-member/${selectedMember._id}`, {
        groupId: teamId,
      });
      toast.success(`${selectedMember.firstName} has been removed`);
      fetchTeamMember();
      setDeleteOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBtn = (member) => {
    toast(`Edit feature for ${member.firstName} coming soon!`);
  };

  const handleAddMember = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleConfirmAdd = () => {
    setIsModalOpen(false);
    fetchTeamMember();
  };

  // 📋 Table columns
  const columns = [
    { headerName: "ID", field: "_id", flex: 1 },
    { headerName: "First Name", field: "firstName", flex: 1 },
    { headerName: "Last Name", field: "lastName", flex: 1 },
    { headerName: "Email", field: "email", flex: 1 },
    {
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <section className="flex items-center gap-5 justify-center h-full">
          <Pen
            className="w-4 h-4 cursor-pointer"
            onClick={() => handleEditBtn(params.data)}
          />
          <Trash2
            className="w-4 h-4 cursor-pointer"
            onClick={() => {
              setSelectedMember(params.data);
              setDeleteOpen(true);
            }}
          />
        </section>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Team</h2>
          <p className="text-gray-500">
            Easily view, add, and manage your team members to keep everyone
            organized.
          </p>
        </div>

        <button
          onClick={handleAddMember}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add Member
        </button>
      </div>

      <Table
        data={members}
        tableRef={teamRef}
        columns={columns}
        loading={loading}
      />

      {isModalOpen && (
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAdd}
          teamId={teamId}
        />
      )}

      {isDeleteOpen && (
        <DeleteTeamMemberModal
          isOpen={isDeleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          itemName={`${
            selectedMember?.firstName + " " + selectedMember?.lastName ||
            "this member"
          }`}
          loading={loading}
        />
      )}
    </div>
  );
};

export default SharedTeamViewMembers;
