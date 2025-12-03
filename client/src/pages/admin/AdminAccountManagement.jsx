import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../../utils/axios";
import Table from "../../components/Table";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import AddUserModal from "../../components/modals/AddUserModal";
import DeleteModal from "../../components/modals/DeleteModal";
import { Button } from "flowbite-react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AdminAccountManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const tableRef = useRef();

  const columns = useMemo(
    () => [
      { headerName: "Employee ID", field: "employeeId", flex: 1 },
      { headerName: "First Name", field: "firstName", flex: 1 },
      { headerName: "Last Name", field: "lastName", flex: 1 },
      { headerName: "Email", field: "email", flex: 1.5 },
      { headerName: "Accounts", field: "accountNames", flex: 1.5 },
      { headerName: "Phone Number", field: "phoneNumber", flex: 1 },
      { headerName: "Role", field: "role", flex: 1 },
      {
        headerName: "Created At",
        field: "createdAt",
        flex: 1.5,
        valueFormatter: (params) =>
          new Date(params.value).toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
      },
      {
        headerName: "Action",
        field: "action",
        flex: 1,
        cellRenderer: (params) => {
          const row = params.data;
          return (
            <section className="h-full flex items-center justify-center gap-4">
              <Edit2
                className="w-4 h-4 cursor-pointer"
                onClick={() => {
                  setSelectedUser(row);
                  setModalMode("edit");
                  setModalOpen(true);
                }}
              />
              <Trash2
                className="w-4 h-4 cursor-pointer"
                onClick={() => {
                  setSelectedUser(row);
                  setDeleteModalOpen(true);
                }}
              />
            </section>
          );
        },
      },
    ],
    []
  );

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/user/get-users?role=");
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const { data: users, isLoading: loading } = useQuery({
    queryKey: "users",
    queryFn: fetchUsers,
  });

  const handleAddClick = () => {
    setSelectedUser(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser?._id) return;

    try {
      await api.patch(`/user/delete-user/${selectedUser._id}`);
      toast.success(`User ${selectedUser.firstName} deleted successfully`);
      setDeleteModalOpen(false);
      queryClient.invalidateQueries(["users"]);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleAddConfirm = () => {
    queryClient.invalidateQueries(["users"]);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Account Management
          </h2>
          <p className="text-light">
            Manage all user accounts, roles, and related information.
          </p>
        </div>
        <Button onClick={handleAddClick} color="blue">
          <Plus className="w-4 h-4 mr-2" /> Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-600">
          <Loader2 className="animate-spin w-6 h-6 mr-2" />
          <span>Loading users...</span>
        </div>
      ) : (
        <Table data={users} columns={columns} tableRef={tableRef} />
      )}

      {/* Add/Edit User Modal */}
      <AddUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleAddConfirm}
        mode={modalMode}
        user={selectedUser}
      />

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.firstName} ${selectedUser?.lastName}? This action cannot be undone.`}
      />
    </section>
  );
};

export default AdminAccountManagement;
