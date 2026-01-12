import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import { Pen, Trash2 } from "lucide-react";
import TeamModal from "../../components/modals/TeamModal";
import AddMemberModal from "../../components/modals/AddMemberModal";
import DeleteTeamMemberModal from "../../components/modals/DeleteTeamMemberModal";
import { Ticket } from "lucide-react";

const SharedTeamViewMembers = () => {
  const user = useStore((state) => state.user);
  const [members, setMembers] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [isTeamModal, setTeamModal] = useState(false);

  const teamRef = useRef();

  const fetchTeamMember = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/group/get-group/${user._id}`);

      if (!response.data) {
        setTeamModal(true);
      }

      setMembers(response?.data?.agents || []);
      setTeamName(response?.data?.name);
      setTeamId(response?.data?._id);
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

    try {
      setLoading(true);
      await api.patch(`/group/remove-member/${selectedMember._id}`, {
        groupId: teamId,
      });

      await api.patch(`/user/update-user/${selectedMember._id}`, {
        field: "groupId",
        newValue: null,
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

  const handleAddMember = () => {
    if (!teamId) {
      setTeamModal(true);
    } else {
      setIsModalOpen(true);
    }
  };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleConfirmAdd = () => {
    setIsModalOpen(false);
    fetchTeamMember();
  };

  const handleTeamModal = (value) => {
    setTeamModal(value);
  };

  // 📋 Table columns
  const columns = [
    { headerName: "ID", field: "employeeId", flex: 1 },
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
          <h2 className="text-xl font-semibold">{teamName || "My Team"}</h2>
          <p className="text-gray-500">
            Easily view, add, and manage your team members to keep everyone
            organized.
          </p>
        </div>

        <button
          onClick={handleAddMember}
          className="group flex items-center px-6 py-2.5 rounded-xl border border-red-900/30 bg-white text-[#800000] font-bold text-sm transition-all hover:bg-[#800000] hover:text-white active:scale-95 shadow-sm hover:shadow-[0_0_15px_rgba(128,0,0,0.2)] cursor-pointer"
        >
          < Ticket className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12 stroke-[2.5px]" />
          Add Member
        </button>
      </div>

      {!isTeamModal ? (
        <>
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
        </>
      ) : (
        <TeamModal
          isOpen={isTeamModal}
          onClose={() => handleTeamModal(false)}
          onConfirm={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default SharedTeamViewMembers;

