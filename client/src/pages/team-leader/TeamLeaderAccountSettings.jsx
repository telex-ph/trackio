import React, { useState } from "react";
import {
  Upload,
  Trash2,
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
  const [formData, setFormData] = useState({
    companyName: "Telex Business Support Services Inc.",
    accountName: "TELEX",
    emailAddress: "telexphilippines@gmail.com",
    contactNumber: "912 345 6789",
    completeAddress: "Afan Salvador St., Guimba, Nueva Ecija, 3115",
    facebook: "https://facebook.com/telex",
    linkedin: "https://linkedin.com/company/telex",
    gmail: "telexphilippines@gmail.com",
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
                        Manage your organization profile and contact information
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
                      {/* Avatar Card */}
                      <div className="relative w-70 h-70 bg-white rounded-2xl shadow-lg border-2 border-red-300 hover:border-red-500 transition-all duration-300 overflow-hidden cursor-pointer flex items-center justify-center">
                        <img
                          src={formData.avatar || telex}
                          alt="TELEX"
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

                        {/* Left-side Upload Icon */}
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

                        {/* Right-side Camera Icon (Open Modal) */}
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

                    {/* Company Info */}
                    <div className="2xl:col-span-3">
                      <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 border border-red-200/50 space-y-6">
                        {/* Company Name */}
                        <div className="group">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                            <Building2 size={16} />
                            <span>Company Name</span>
                          </label>
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) =>
                              handleInputChange("companyName", e.target.value)
                            }
                            disabled={!isEditing}
                            className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        {/* Account Name & Email */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <User size={16} />
                              <span>Account Name</span>
                            </label>
                            <input
                              type="text"
                              value={formData.accountName}
                              onChange={(e) =>
                                handleInputChange("accountName", e.target.value)
                              }
                              disabled={!isEditing}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>

                          <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <Mail size={16} />
                              <span>Email Address</span>
                            </label>
                            <input
                              type="email"
                              value={formData.emailAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "emailAddress",
                                  e.target.value
                                )
                              }
                              disabled={!isEditing}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>

                        {/* Contact & Address */}
                        <div className="group">
                          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                            <Phone size={16} />
                            <span>Contact Number</span>
                          </label>
                          <div className="flex">
                            <div className="flex items-center px-6 py-4 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl">
                              <span className="text-gray-600 font-bold">
                                +63
                              </span>
                            </div>
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
                              className="flex-1 px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-r-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>

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
                            className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                          />
                        </div>

                        {/* Social Media */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-x-12">
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
                              className="w-full md:w-[250px] lg:w-[250px] px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
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
                              className="w-full md:w-[230px] lg:w-[230px] px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 flex items-center justify-center gap-3 px-9 py-4 bg-red-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                      >
                        Cancel Changes
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white text-red-700 border-2 border-red-700 rounded-xl transition-all duration-300 shadow-md hover:bg-red-50 hover:shadow-lg transform hover:-translate-y-1 font-semibold"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Change Password Section */}
              {activeSection === "security" && (
                <div className="p-8">
                  <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 border border-red-200/50 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Change Password
                    </h2>

                    {["CurrentPassword", "NewPassword", "ConfirmPassword"].map(
                      (field) => {
                        let Icon, placeholderText;
                        switch (field) {
                          case "CurrentPassword":
                            Icon = Lock;
                            placeholderText =
                              "Enter your current password here";
                            break;
                          case "NewPassword":
                            Icon = Key;
                            placeholderText = "Enter your new password here";
                            break;
                          case "ConfirmPassword":
                            Icon = Check;
                            placeholderText = "Confirm your new password";
                            break;
                          default:
                            Icon = Lock;
                            placeholderText = "";
                        }

                        return (
                          <div key={field} className="group relative">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <Icon size={16} />
                              <span>
                                {field.replace("Password", " Password")}
                              </span>
                            </label>
                            <input
                              type={formData.showPassword ? "text" : "password"}
                              placeholder={placeholderText}
                              className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300"
                            />
                            <button
                              type="button"
                              className="absolute top-[68%] right-10 -translate-y-1/2 text-gray-300 hover:text-red-600"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  showPassword: !prev.showPassword,
                                }))
                              }
                            >
                              {formData.showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                          </div>
                        );
                      }
                    )}

                    {/* Save Button aligned to the right */}
                    <div className="flex justify-end mt-6">
                      <button className="px-6 py-3 bg-white text-red-700 border-2 border-red-700 rounded-xl transition-all duration-300 shadow-md hover:bg-red-50 hover:shadow-lg transform hover:-translate-y-1 font-semibold">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Section / About Company */}
              {activeSection === "preferences" && (
                <div className="p-8 space-y-8">
                  <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-6 border border-red-200/50 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      About Company
                    </h2>

                    {/* Vision */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <Eye size={16} />
                        <span>Vision</span>
                      </label>
                      <textarea
                        value={formData.vision}
                        onChange={(e) =>
                          handleInputChange("vision", e.target.value)
                        }
                        rows={3}
                        className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Mission */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <Flag size={16} />
                        <span>Mission</span>
                      </label>
                      <textarea
                        value={formData.mission}
                        onChange={(e) =>
                          handleInputChange("mission", e.target.value)
                        }
                        rows={3}
                        className="w-full px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Core Values */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <Star size={16} />
                        <span>Core Values</span>
                      </label>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {formData.values.map((val, idx) => (
                          <li key={idx}>{val}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Services */}
                    <div className="group">
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                        <Briefcase size={16} />
                        <span>Services</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-4">
                        {formData.services.map((service, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <p className="text-center text-gray-800 text-sm font-medium">
                              {service.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save Button aligned to the right */}
                    <div className="flex justify-end mt-6">
                      <button className="px-6 py-3 bg-white text-red-700 border-2 border-red-700 rounded-xl transition-all duration-300 shadow-md hover:bg-red-50 hover:shadow-lg transform hover:-translate-y-1 font-semibold">
                        Save About Info
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Modal */}
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
                    src={telex}
                    alt="Avatar"
                    className="w-full h-auto rounded-2xl object-contain shadow-2xl"
                  />
                  <button
                    className="absolute top-2 right-2 text-white p-2 bg-black/40 rounded-full hover:bg-black/60 transition"
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
