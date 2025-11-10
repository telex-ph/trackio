import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios";
import { Label, TextInput, Button, Alert } from "flowbite-react";
import { Info, X } from "lucide-react";
import Roles from "../../constants/roles";

const AddUserModal = ({
  open,
  onClose,
  onSuccess,
  mode = "add",
  user = null,
}) => {
  const [data, setData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  // Pre-fill fields when editing
  useEffect(() => {
    if (user && mode === "edit") {
      setData({
        employeeId: user.employeeId || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
      });
    } else if (mode === "add") {
      // Reset form for adding new user
      setData({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        role: "",
      });
    }
  }, [user, mode, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.firstName || !data.lastName || !data.email || !data.role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (mode === "add") {
        await api.post("/user/add-user", data);
        toast.success("User added successfully!");
      } else {
        await api.patch(`/user/update-details/${user._id}`, { updates: data });
        toast.success("User updated successfully!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error.response?.data?.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-5">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName" className="text-light mb-2 block">
              First Name <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="firstName"
              name="firstName"
              value={data.firstName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName" className="text-light mb-2 block">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="lastName"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-light mb-2 block">
              Email <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Employee ID (optional) */}
          <div>
            <Label htmlFor="employeeId" className="text-light mb-2 block">
              Employee ID (must match the one in Biometrics)
            </Label>
            <TextInput
              id="employeeId"
              name="employeeId"
              value={data.employeeId}
              onChange={handleChange}
            />
          </div>

          {/* Phone Number (optional) */}
          <div>
            <Label htmlFor="phoneNumber" className="text-light mb-2 block">
              Phone Number (optional)
            </Label>
            <TextInput
              id="phoneNumber"
              name="phoneNumber"
              value={data.phoneNumber}
              onChange={handleChange}
            />
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-light mb-2 block">
              Role <span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              name="role"
              value={data.role}
              onChange={handleChange}
              required
              className="w-full border border-light container-light rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a role</option>
              {Object.values(Roles).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Info alert only in add mode */}
          {mode === "add" && (
            <section>
              <Alert
                color="info"
                icon={Info}
                rounded
                className="border border-blue-200"
              >
                <span className="font-medium text-blue-900 text-sm!">
                  New Member Information
                </span>
                <p className="text-sm! text-blue-800 mt-1">
                  New members should request a new password by clicking{" "}
                  <strong>"Forgot Password"</strong> on the login page to
                  securely access their account.
                </p>
              </Alert>
            </section>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : mode === "add"
                  ? "Add User"
                  : "Update User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
