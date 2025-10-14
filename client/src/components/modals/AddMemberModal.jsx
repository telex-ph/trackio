import React, { useState } from "react";
import { Label, TextInput, Radio } from "flowbite-react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

const AddMemberModal = ({ isOpen, onClose, onConfirm, teamId }) => {
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("new");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/users/search?query=${value}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dark background (no blur) */}
      <div className="absolute inset-0 bg-black/50"></div>

      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl p-10 max-w-2xl w-full shadow-2xl border border-gray-300"
      >
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
          Add New Member
        </h3>
        <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
          Choose whether to add an existing user or create a new one manually.
        </p>

        {/* Radio selection */}
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

        {/* Existing User Search */}
        {userType === "existing" && (
          <div className="mb-4">
            <Label htmlFor="searchUser" value="Search User by Name or Email" />
            <TextInput
              id="searchUser"
              name="searchUser"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} // prevent accidental submit
            />
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-2 cursor-pointer hover:bg-blue-50 ${
                      selectedUser?._id === user._id
                        ? "bg-blue-100"
                        : "bg-white"
                    }`}
                  >
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New User Manual Form */}
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
