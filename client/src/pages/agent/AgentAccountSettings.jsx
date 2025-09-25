import React, { useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import {
  Upload,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Settings,
  Lock,
  Camera,
  X,
  Eye,
  EyeClosed,
  Key,
  Check,
  Flag,
  Star,
  Briefcase,
  Facebook,
  Linkedin,
} from "lucide-react";
import telex from "../../assets/logos/telex.svg";

const AccountSettings = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // global user from store
  const user = useStore((state) => state.user);

  // merged formData (DB values for profile, hardcoded for about)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    contactNumber: "",
    completeAddress: "",
    avatar: "",
    facebook: "",
    linkedin: "",
    vision:
      "TELEX’s Vision is to revolutionize the way businesses interact with their customers by providing cutting-edge technology and innovative solutions that create seamless and personalized experiences.",
    mission:
      "Our mission is to provide innovative customer service that solves problems in a fast and reliable way, contributing to global development of the service industry.",
    values: [
      "To Provide jobs and a friendly work environment where employees can hone their skills.",
      "To Contribute to the worldwide development of the service industry through commitment.",
      "To Pursue total quality and customer satisfaction, enabling growth for the company, employees, customers, partners, and community.",
      "To Grow and Prosper by creating opportunities and nurturing talent.",
    ],
    services: [
      {
        title: "24/7 Global Customer Service Solution",
        description:
          "We are a global customer support call center offering high-quality, personalized, and cost-effective services.",
      },
      {
        title: "Technical Support Call Center Services",
        description:
          "Our technical support call center services provide a comprehensive solution for all your customer support needs.",
      },
      {
        title: "Professional Sales Call Center Services",
        description:
          "Telex is the go-to solution for businesses looking for a professional sales call center.",
      },
      {
        title: "Market Survey and Lead Generation Solutions",
        description:
          "Telex helps streamline operational processes through BPO solutions.",
      },
      {
        title: "Social Media Management",
        description: "We manage your social media presence effectively.",
      },
    ],
    showPassword: false,
  });

  // sync DB user → formData
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        emailAddress: user.email || "",
        contactNumber: user.contactNumber || "",
        completeAddress: user.address || "",
        avatar: user.avatar || "",
        facebook: user.facebook || "",
        linkedin: user.linkedin || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saved data:", formData);
    setIsEditing(false);
    alert("Changes saved successfully!");
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Change Password", icon: Lock },
    { id: "preferences", label: "About", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Manage Account
          </h2>
          <p className="text-gray-600">
            Any updates will reflect on the admin account profile.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Settings Menu
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-red-900 to-red-900 text-white shadow-lg transform scale-105"
                          : "text-gray-600 hover:bg-red-50 hover:text-red-800"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-4">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Account Settings
                      </h2>
                      <p className="text-gray-600">
                        Manage your profile and contact information
                      </p>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 2xl:grid-cols-5 gap-12">
                    {/* Avatar */}
                    <div className="2xl:col-span-2 flex flex-col items-center">
                      <div className="relative w-70 h-70 bg-white rounded-2xl shadow-lg border-2 border-red-300 hover:border-red-500 transition-all duration-300 overflow-hidden cursor-pointer flex items-center justify-center">
                        <img
                          src={formData.avatar || telex}
                          alt="Avatar"
                          className="w-full h-full object-contain"
                        />

                        {/* Hidden File Input */}
                        <input
                          type="file"
                          accept="image/*"
                          id="avatarUpload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                handleInputChange("avatar", reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />

                        {isEditing && (
                          <button
                            className="absolute bottom-3 left-3 w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/70 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              document.getElementById("avatarUpload").click();
                            }}
                          >
                            <Upload className="w-5 h-5 text-red-600" />
                          </button>
                        )}

                        {isEditing && (
                          <button
                            className="absolute bottom-3 right-3 w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white/70 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAvatarModal(true);
                            }}
                          >
                            <Camera className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="2xl:col-span-3">
                      <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 border border-red-200/50 space-y-6">
                        {/* First & Last Name */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              disabled={!isEditing}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                          <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                              Last Name
                            </label>
                            <input
                              type="text"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              disabled={!isEditing}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="group">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                            <Mail size={16} />
                            <span>Email Address</span>
                          </label>
                          <input
                            type="email"
                            value={formData.emailAddress}
                            onChange={(e) =>
                              handleInputChange("emailAddress", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        {/* Contact */}
                        <div className="group">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                            <Phone size={16} />
                            <span>Contact Number</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.contactNumber}
                            onChange={(e) =>
                              handleInputChange(
                                "contactNumber",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        {/* Address */}
                        <div className="group">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                            <MapPin size={16} />
                            <span>Complete Address</span>
                          </label>
                          <textarea
                            value={formData.completeAddress}
                            onChange={(e) =>
                              handleInputChange(
                                "completeAddress",
                                e.target.value
                              )
                            }
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                          />
                        </div>

                        {/* Socials */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <Facebook size={16} />
                              <span>Facebook</span>
                            </label>
                            <input
                              type="url"
                              value={formData.facebook}
                              onChange={(e) =>
                                handleInputChange("facebook", e.target.value)
                              }
                              disabled={!isEditing}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                          <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <Linkedin size={16} />
                              <span>LinkedIn</span>
                            </label>
                            <input
                              type="url"
                              value={formData.linkedin}
                              onChange={(e) =>
                                handleInputChange("linkedin", e.target.value)
                              }
                              disabled={!isEditing}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-9 py-4 bg-red-700 text-white rounded-xl"
                      >
                        Cancel Changes
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-6 py-4 bg-white text-red-700 border-2 border-red-700 rounded-xl"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security and About remain the same */}
              {activeSection === "security" && (
                <div className="p-8">…</div>
              )}
              {activeSection === "preferences" && (
                <div className="p-8">…</div>
              )}
            </div>

            {showAvatarModal && (
              <div
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAvatarModal(false)}
              >
                <div
                  className="relative w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={formData.avatar || telex}
                    alt="Avatar"
                    className="w-full h-auto rounded-2xl object-contain shadow-2xl"
                  />
                  <button
                    className="absolute top-2 right-2 text-white p-2 bg-black/40 rounded-full"
                    onClick={() => setShowAvatarModal(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
