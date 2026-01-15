import { useState } from "react";
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
  Globe,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import telex from "../../assets/logos/telex.svg";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useStore } from "../../store/useStore";
import validatePassword from "../../utils/validatePassword";

const SharedSettings = () => {
  const user = useStore((state) => state.user);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "Telex Business Support Services Inc.",
    accountName: "TELEX",
    emailAddress: "telexphilippines@gmail.com",
    contactNumber: "912 345 6789",
    completeAddress: "Afan Salvador St., Guimba, Nueva Ecija, 3115",
    facebook: "https://facebook.com/telex",
    linkedin: "https://linkedin.com/company/telex",
    gmail: "telexphilippines@gmail.com",
    avatar: null,
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saved data:", formData);
    setIsEditing(false);
    toast.success("Changes saved successfully!");
  };

  const handlePasswordUpdate = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        toast.error("Please fill in all password fields.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation do not match.");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("New password must be at least 8 characters long.");
        return;
      }

      const isStrongPassword = validatePassword(newPassword);
      if (!isStrongPassword.valid) {
        toast.error(isStrongPassword.message);
        return;
      }

      setIsSubmitting(true);

      const response = await api.post("/auth/change-password", {
        id: user._id,
        password: currentPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { id: "profile", label: "General Profile", icon: User, desc: "Organization details and contact info" },
    { id: "security", label: "Security & Privacy", icon: ShieldCheck, desc: "Password and account security" },
    { id: "preferences", label: "Company Profile", icon: Building2, desc: "Mission, Vision, and Services" },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-left">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Manage Account
          </h2>
          <p className="text-gray-600">
            Any updates will reflect on the your account profile.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0 text-left">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm sticky top-8">
              <div className="p-5 bg-slate-50 border-b border-slate-200">
                <span className="text-[10px] font-bold text-[#800000] uppercase tracking-[0.2em]">Account Settings</span>
              </div>
              <nav className="p-3 space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex flex-col items-start p-4 rounded-lg transition-all duration-300 group ${
                        isActive
                          ? "bg-[#800000] text-white shadow-lg shadow-maroon-100"
                          : "text-slate-600 hover:bg-maroon-50 hover:text-[#800000]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-[#800000]"} />
                        <span className="text-sm font-bold">{section.label}</span>
                      </div>
                      <span className={`text-[11px] mt-1 ml-7 leading-tight ${isActive ? "text-maroon-100" : "text-slate-400"}`}>
                        {section.desc}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[750px] flex flex-col overflow-hidden">
             
              {/* Profile Section */}
              {activeSection === "profile" && (
                <div className="p-8 lg:p-12 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-8 border-b border-slate-100 gap-4">
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-slate-900">Organization Identity</h2>
                      <p className="text-sm text-slate-500 mt-1">Update your primary business contact and identity information.</p>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#800000] text-white rounded-lg text-sm font-bold hover:bg-[#600000] transition-all shadow-md active:scale-95"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                    {/* Avatar Upload Container */}
                    <div className="lg:col-span-4 flex flex-col items-center">
                      <div className="relative group">
                        <div className="w-52 h-52 bg-white rounded-full border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center p-6 ring-1 ring-slate-200">
                          <img
                            src={formData.avatar || telex}
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        {isEditing && (
                          <div className="absolute inset-0 bg-[#800000]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 rounded-full">
                            <button
                              className="p-3 bg-white text-[#800000] rounded-full hover:scale-110 transition-transform shadow-xl"
                              onClick={() => document.getElementById("maroonUpload").click()}
                            >
                              <Upload size={20} />
                            </button>
                            <button
                                className="p-3 bg-white text-[#800000] rounded-full hover:scale-110 transition-transform shadow-xl"
                                onClick={() => setShowAvatarModal(true)}
                            >
                              <Camera size={20} />
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          id="maroonUpload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => handleInputChange("avatar", reader.result);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="mt-6 text-center">
                        <span className="px-3 py-1 bg-maroon-50 text-[#800000] text-[10px] font-bold rounded-full border border-maroon-100 uppercase tracking-widest">Official Logo</span>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="lg:col-span-8 space-y-8">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Building2 size={14} className="text-[#800000]" /> Company Name
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-maroon-50 focus:border-[#800000] outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>

                      {/* Account Name & Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <User size={14} className="text-[#800000]" /> Account Name
                          </label>
                          <input
                            type="text"
                            value={formData.accountName}
                            onChange={(e) => handleInputChange("accountName", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-5 py-4 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#800000] outline-none transition-all disabled:bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail size={14} className="text-[#800000]" /> Email Address
                          </label>
                          <input
                            type="email"
                            value={formData.emailAddress}
                            onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-5 py-4 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#800000] outline-none transition-all disabled:bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Contact Number & Facebook */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone size={14} className="text-[#800000]" /> Contact Number
                          </label>
                          <input
                            type="tel"
                            value={formData.contactNumber}
                            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-5 py-4 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#800000] outline-none transition-all disabled:bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Facebook size={14} className="text-[#800000]" /> Facebook
                          </label>
                          <input
                            type="text"
                            value={formData.facebook}
                            onChange={(e) => handleInputChange("facebook", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-5 py-4 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#800000] outline-none transition-all disabled:bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* LinkedIn & Complete Address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Linkedin size={14} className="text-[#800000]" /> LinkedIn
                          </label>
                          <input
                            type="text"
                            value={formData.linkedin}
                            onChange={(e) => handleInputChange("linkedin", e.target.value)}
                            disabled={!isEditing}
                            className="w-full px-5 py-4 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#800000] outline-none transition-all disabled:bg-slate-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={14} className="text-[#800000]" /> Complete Address
                          </label>
                          <div className="relative">
                            {/* textarea with auto-height logic via 'h-auto overflow-hidden' combined with rows or manual styling */}
                            <textarea
                              value={formData.completeAddress}
                              onChange={(e) => handleInputChange("completeAddress", e.target.value)}
                              disabled={!isEditing}
                              rows={1}
                              style={{ height: 'auto', minHeight: '54px' }}
                              className="w-full px-5 py-4 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#800000] outline-none transition-all disabled:bg-slate-50 resize-none overflow-hidden"
                              onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end items-center gap-4 mt-16 pt-10 border-t border-slate-100">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-10 py-3 bg-[#800000] text-white rounded-xl text-sm font-black hover:bg-[#600000] shadow-xl shadow-maroon-100 transition-all active:scale-95"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <div className="flex-1 flex flex-col p-8 items-center justify-center animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-full max-w-md bg-slate-50/50 p-10 rounded-3xl border border-slate-100">
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl mb-6 shadow-sm border border-slate-100 ring-4 ring-maroon-50/50">
                        <Lock className="text-[#800000]" size={32} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900">Security Gate</h2>
                      <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold">Encrypted Password Update</p>
                    </div>

                    <div className="space-y-6 text-left">
                      {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                        <div key={field} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            {field.replace(/([A-Z])/g, " $1")}
                          </label>
                          <div className="relative">
                            <input
                              type={formData.showPassword ? "text" : "password"}
                              value={passwordData[field]}
                              onChange={(e) => handlePasswordChange(field, e.target.value)}
                              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#800000] focus:ring-4 focus:ring-maroon-50 outline-none transition-all pr-12"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-[#800000]"
                              onClick={() => setFormData(p => ({ ...p, showPassword: !p.showPassword }))}
                            >
                              {formData.showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={isSubmitting}
                        className="w-full mt-6 py-4 bg-[#800000] text-white rounded-xl text-sm font-black hover:bg-[#600000] transition-all shadow-xl shadow-maroon-200 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        <ShieldCheck size={18} />
                        {isSubmitting ? "UPDATING..." : "UPDATE CREDENTIALS"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Profile Section */}
              {activeSection === "preferences" && (
                <div className="p-8 lg:p-12 text-left animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-12 pb-6 border-b-2 border-slate-50">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Company Profile</h2>
                      <p className="text-sm text-slate-400 mt-1 italic">Vision, Mission and Service Catalog</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-maroon-50 flex items-center justify-center">
                       <Globe size={20} className="text-[#800000]" />
                    </div>
                  </div>

                  <div className="space-y-12">
                    {/* Vision & Mission */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-maroon-50 rounded-lg"><Eye size={18} className="text-[#800000]" /></div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600">Company Vision</span>
                        </div>
                        <textarea
                          value={formData.vision}
                          onChange={(e) => handleInputChange("vision", e.target.value)}
                          rows={6}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] leading-relaxed text-slate-700 focus:bg-white focus:border-[#800000] outline-none transition-all shadow-inner resize-none"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-maroon-50 rounded-lg"><Flag size={18} className="text-[#800000]" /></div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-600">Company Mission</span>
                        </div>
                        <textarea
                          value={formData.mission}
                          onChange={(e) => handleInputChange("mission", e.target.value)}
                          rows={6}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] leading-relaxed text-slate-700 focus:bg-white focus:border-[#800000] outline-none transition-all shadow-inner resize-none"
                        />
                      </div>
                    </div>

                    {/* Core Values */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-l-4 border-[#800000] pl-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-800">Operational Core Values</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {formData.values.map((val, idx) => (
                          <div key={idx} className="group flex gap-5 p-6 bg-white border border-slate-100 rounded-2xl hover:border-maroon-200 transition-all hover:shadow-lg shadow-sm">
                            <div className="flex-shrink-0 w-10 h-10 bg-[#800000] text-white rounded-xl flex items-center justify-center text-sm font-black italic">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services Catalog */}
                    <div className="space-y-6">
                       <div className="flex items-center gap-3 border-l-4 border-[#800000] pl-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-800">Solutions Portfolio</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {formData.services.map((service, idx) => (
                          <div key={idx} className="group p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-maroon-100 hover:shadow-xl transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-maroon-50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-all flex items-start justify-end p-2">
                                <ChevronRight size={16} className="text-[#800000]" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-3 pr-6 leading-tight uppercase tracking-tight">
                              {service.title}
                            </h4>
                            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{service.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-12">
                      <button
                        onClick={handleSave}
                        className="px-12 py-4 bg-[#800000] text-white rounded-xl text-sm font-black hover:bg-[#600000] transition-all shadow-2xl shadow-maroon-100 uppercase tracking-[0.2em]"
                      >
                        Publish Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Maroon Image Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl border-8 border-maroon-50/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <span className="text-xs font-black text-[#800000] uppercase tracking-widest">Brand Assets / Logo Preview</span>
              <button
                className="p-2 bg-slate-50 hover:bg-maroon-50 rounded-full text-slate-400 hover:text-[#800000] transition-all"
                onClick={() => setShowAvatarModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-16 flex items-center justify-center bg-[#fafafa]">
              <img
                src={formData.avatar || telex}
                alt="Enlarged view"
                className="max-h-[50vh] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedSettings;