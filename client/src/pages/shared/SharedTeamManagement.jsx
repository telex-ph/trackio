import React, { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import Table from "../../components/Table";
import TeamModal from "../../components/modals/TeamModal";
import { Pen, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SharedTeamManagement = () => {
  const user = useStore((state) => state.user);
  const [group, setGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();

  const fetchUserGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/group/get-groups/${user._id}`);
      setGroup(response.data);
    } catch (error) {
      console.error("Error fetching user group:", error);
      toast.error("Failed to load user group");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchUserGroup();
  }, [user._id]);

  const handleEditBtn = (row) => {
    setIsModalOpen(true);
    setSelectedTeam(row);
  };

  const handleViewBtn = (row) => {
    navigate(`/team-leader/team/${row._id}`);
  };

  const handleCancelBtn = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  const handleConfirmBtn = () => {
    fetchUserGroup();
  };

  const columns = useMemo(
    () => [
      { headerName: "Team Name", field: "name", flex: 1 },
      {
        headerName: "Created At",
        field: "createdAt",
        flex: 1,
        cellRenderer: (params) =>
          format(new Date(params.value), "MMM dd, yyyy"),
      },
      {
        headerName: "Number of accounts",
        field: "createdAt",
        flex: 1,
        cellRenderer: (params) => `${params.data.accounts.length} account(s)`,
      },
      {
        headerName: "Number of members",
        field: "createdAt",
        flex: 1,
        cellRenderer: (params) => `${params.data.agents.length} member(s)`,
      },
      {
        headerName: "Actions",
        flex: 1,
        cellRenderer: (params) => {
          return (
            <section className="flex items-center gap-5 justify-center h-full">
              <Pen
                className="w-4 h-4 cursor-pointer"
                onClick={() => handleEditBtn(params.data)}
              />
              <Eye
                className="w-4 h-4 cursor-pointer"
                onClick={() => handleViewBtn(params.data)}
              />
            </section>
          );
        },
      },
    ],
    []
  );

  const teamRef = useRef();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Team</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add Team
        </button>
      </div>

      <Table data={group} columns={columns} tableRef={teamRef} />

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

export default SharedTeamManagement;
