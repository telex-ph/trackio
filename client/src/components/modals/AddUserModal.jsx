import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../utils/axios";
import { Label, TextInput, Button, Alert } from "flowbite-react";
import { Info, X, UserPlus, Fingerprint, Phone, Mail, ShieldCheck } from "lucide-react";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-3xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100 transform transition-all">
        <div className="h-2 w-full bg-[#800000]" />
        <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-2xl text-[#800000]">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {mode === "add" ? "Create User Account" : "Edit User Profile"}
              </h2>
              <p className="text-sm text-gray-500">
                System Management & Access Control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-all rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
           
            {/* Personal Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
             
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-[#800000]">
                  <span className="text-xs font-bold uppercase tracking-widest">Personal Details</span>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>
               
                <div className="space-y-1">
                  <Label htmlFor="firstName" className="text-xs font-bold text-gray-600 ml-1 uppercase">First Name</Label>
                  <TextInput
                    id="firstName"
                    name="firstName"
                    value={data.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    className="shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="lastName" className="text-xs font-bold text-gray-600 ml-1 uppercase">Last Name</Label>
                  <TextInput
                    id="lastName"
                    name="lastName"
                    value={data.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              {/* Identification & Contact Group */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 text-[#800000]">
                  <span className="text-xs font-bold uppercase tracking-widest">Identification</span>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="employeeId" className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1 uppercase">
                    <Fingerprint size={12} /> Employee ID
                  </Label>
                  <TextInput
                    id="employeeId"
                    name="employeeId"
                    value={data.employeeId}
                    onChange={handleChange}
                    placeholder="ID Number"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phoneNumber" className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1 uppercase">
                    <Phone size={12} /> Phone Number
                  </Label>
                  <TextInput
                    id="phoneNumber"
                    name="phoneNumber"
                    value={data.phoneNumber}
                    onChange={handleChange}
                    placeholder="09xx xxx xxxx"
                  />
                </div>
              </div>

              {/* Account Settings Group */}
              <div className="md:col-span-2 space-y-4 mt-2">
                <div className="flex items-center gap-2 mb-2 text-[#800000]">
                  <span className="text-xs font-bold uppercase tracking-widest">Account & Role</span>
                  <div className="h-px flex-1 bg-gray-100"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1 uppercase">
                      <Mail size={12} /> Work Email
                    </Label>
                    <TextInput
                      id="email"
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="email@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs font-bold text-gray-600 ml-1 flex items-center gap-1 uppercase">
                      <ShieldCheck size={12} /> System Role
                    </Label>
                    <select
                      id="role"
                      name="role"
                      value={data.role}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#800000] focus:border-[#800000] block p-2.5 transition-all outline-none"
                    >
                      <option value="">Choose a role...</option>
                      {Object.values(Roles).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruction Banner */}
            {mode === "add" && (
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex gap-4 items-start">
                <div className="mt-1 p-2 bg-white rounded-lg shadow-sm border border-red-100">
                  <Info className="w-4 h-4 text-[#800000]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#800000]">Setup Notice</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Account security is mandatory. New users should use the <span className="font-bold underline text-[#800000]">Forgot Password</span> link
                    on the login portal to finalize their secure credentials.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-all active:scale-95"
              disabled={loading}
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-[#800000] hover:bg-[#600000] text-white text-sm font-bold rounded-xl shadow-lg shadow-red-900/10 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                mode === "add" ? "Create Account" : "Update Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
