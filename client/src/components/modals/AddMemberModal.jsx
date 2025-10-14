import React, { useState } from "react";
import { Label, TextInput, Radio } from "flowbite-react";
import { Search } from "lucide-react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/Table";

const AddMemberModal = ({ isOpen, onClose, onConfirm, teamId }) => {
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle text input changes
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
      const res = await api.get(`/user/get-users?search=${value}`);
      setSearchResults(res.data || []);
      if (res.data.length === 0) toast("No users found.");
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (userType === "existing") {
        if (!selectedUser) {
          toast.error("Please select a user from the search results");
          return;
        }

        await api.post("/group/add-member-existing", {
          teamId,
          userId: selectedUser._id,
        });
      } else {
        const { employeeId, firstName, lastName, email, phoneNumber } = form;
        if (!firstName || !lastName || !email) {
          toast.error("Please fill in all required fields");
          return;
        }

        const response = await api.post("/user/add-user", {
          teamId,
          employeeId,
          firstName,
          lastName,
          email,
          phoneNumber,
          role: "agent",
        });

        const id = response.data._id;
        await api.patch(`/group/add-member/${id}`, {
          teamId,
        });
      }

      toast.success("Member added successfully!");
      onConfirm();
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  // AG Grid columns for search results
  const columns = [
    { headerName: "First Name", field: "firstName", flex: 1 },
    { headerName: "Last Name", field: "lastName", flex: 1 },
    { headerName: "Email", field: "email", flex: 1 },
    { headerName: "Phone", field: "phoneNumber", flex: 1 },
    {
      headerName: "Team Assigned",
      field: "groupId",
      flex: 1,
      cellRenderer: (params) =>
        params.value ? "Has TL Assigned" : "No TL Assigned",
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

        {/* Radio selector */}
        <div className="flex gap-6 justify-center mb-6">
          <label className="flex items-center gap-2">
            <Radio
              id="existing"
              name="userType"
              checked={userType === "existing"}
              onChange={() => setUserType("existing")}
            />
            <span>Existing User</span>
          </label>

          <label className="flex items-center gap-2">
            <Radio
              id="new"
              name="userType"
              checked={userType === "new"}
              onChange={() => setUserType("new")}
            />
            <span>New User</span>
          </label>
        </div>

        {/* --- EXISTING USER MODE --- */}
        {userType === "existing" && (
          <div className="mb-4">
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

            {/* Table Results */}
            {searchResults.length > 0 && !selectedUser && (
              <div className="mt-4">
                <Table
                  data={searchResults}
                  columns={columns}
                  onRowClicked={(row) => setSelectedUser(row.data)}
                  loading={loading}
                />
              </div>
            )}

            {/* Selected user view */}
            {selectedUser && (
              <div className="mt-4 border rounded-md p-4 bg-gray-50">
                <h4 className="font-semibold text-lg mb-2">Selected Agent</h4>
                <p>
                  <strong>ID:</strong> {selectedUser._id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedUser.firstName}{" "}
                  {selectedUser.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phoneNumber}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedUser.groupId ? (
                    <span className="text-green-600 font-medium">
                      Assigned to TL
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Unassigned</span>
                  )}
                </p>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="mt-4 bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
                >
                  Back to Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- NEW USER MODE --- */}
        {userType === "new" && (
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="employeeId" value="Employee ID" />
              <TextInput
                id="employeeId"
                name="employeeId"
                placeholder="Employee ID (Optional)"
                value={form.employeeId}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" value="First Name" />
                <TextInput
                  id="firstName"
                  name="firstName"
                  placeholder="Harry"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" value="Last Name" />
                <TextInput
                  id="lastName"
                  name="lastName"
                  placeholder="Potter"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" value="Email" />
              <TextInput
                id="email"
                name="email"
                type="email"
                placeholder="harrypotter@telexph.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" value="Phone Number" />
              <TextInput
                id="phoneNumber"
                name="phoneNumber"
                type="number"
                placeholder="9972874560"
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* --- Footer Buttons --- */}
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
