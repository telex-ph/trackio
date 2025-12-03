import React, { useState } from "react";
import { Label, TextInput, Radio } from "flowbite-react";
import { Info, Search, TriangleAlert } from "lucide-react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import { Alert } from "flowbite-react";
import { useStore } from "../../store/useStore";

const AddMemberModal = ({ isOpen, onClose, onConfirm, teamId }) => {
  const user = useStore((state) => state.user);
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle text input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Search function
  const handleSearch = async (value) => {
    if (!value.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/user/get-users?search=${value}&role=`);
      setSearchResults(res.data || []);
      if (res.data.length === 0) toast("No users found.");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedUser.teamLeaderId) {
        toast.error("This user is already assigned to another team leader.");
        return;
      }

      if (!selectedUser) {
        toast.error("Please select a user from the search results");
        return;
      }

      await api.patch(`/group/add-member/${selectedUser._id}`, {
        teamId,
        teamLeaderId: user._id,
      });

      await api.patch(`/user/update-user/${selectedUser._id}`, {
        field: "groupId",
        newValue: teamId,
      });
      toast.success("Member added successfully!");
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // AG Grid columns
  const columns = [
    { headerName: "First Name", field: "firstName", flex: 1 },
    { headerName: "Last Name", field: "lastName", flex: 1 },
    { headerName: "Email", field: "email", flex: 1 },
    { headerName: "Phone", field: "phoneNumber", flex: 1 },
    {
      headerName: "Assigned To",
      field: "groupId",
      flex: 1,
      cellRenderer: (params) => {
        const data = params.data;
        return data.teamLeaderName;
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl p-10 max-w-6xl w-full shadow-2xl border border-gray-300 overflow-y-auto max-h-[90vh]"
      >
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
          Add New Member
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          Choose whether to add an existing user or create a new one manually.
        </p>

        <Alert
          color="info"
          icon={Info}
          rounded
          className="border border-blue-200 my-5"
        >
          <span className="font-medium text-blue-900 text-sm!">
            New Member Information
          </span>
          <p className="text-sm! text-blue-800 mt-1">
            If the member already has an <strong>assigned Team Leader</strong>,
            <strong>
              {" "}
              please notify the leader so they can remove the member
            </strong>{" "}
            from their current team. Once removed, you will be able to add the
            member to your team.
          </p>
        </Alert>

        <div className="mb-4">
          {/* Only show search if user not yet selected */}
          {!selectedUser && (
            <>
              <Label htmlFor="searchUser" value="Search Agents" />
              <div className="flex items-center gap-2">
                <TextInput
                  id="searchUser"
                  name="searchUser"
                  placeholder="Search by name or email..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => handleSearch(searchTerm)}
                  className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Search size={18} />
                </button>
              </div>
            </>
          )}

          {/* Table Results */}
          {!selectedUser && searchResults.length > 0 && (
            <div className="mt-4">
              <Table
                data={searchResults}
                columns={columns}
                loading={loading}
                onRowClicked={(row) => setSelectedUser(row.data)}
              />
            </div>
          )}

          {/* Selected user details */}
          {selectedUser && (
            <div className="mt-4 rounded-md p-4 ">
              <h4 className="font-semibold text-lg mb-2">Selected Agent</h4>
              <div className="space-y-1">
                <p>
                  <strong>ID:</strong>{" "}
                  <span className="text-light">{selectedUser._id}</span>
                </p>
                <p>
                  <strong>Name:</strong>{" "}
                  <span className="text-light">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <span className="text-light">{selectedUser.email}</span>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <span className="text-light">
                    {selectedUser.phoneNumber || "N/A"}
                  </span>
                </p>
                <div className="flex gap-1">
                  <strong>Status:</strong>{" "}
                  {selectedUser.groupId ? (
                    <div className="flex gap-2 text-red-600 font-medium">
                      <TriangleAlert className="w-5 h-5" />
                      <span>Already assigned to another TL</span>
                    </div>
                  ) : (
                    <span className="font-medium">Unassigned</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-md font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base cursor-pointer mt-4"
              >
                Back to Search
              </button>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-md font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 p-3 rounded-md font-medium text-sm sm:text-base cursor-pointer transition-colors ${
              loading
                ? "bg-blue-400 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Adding..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberModal;
