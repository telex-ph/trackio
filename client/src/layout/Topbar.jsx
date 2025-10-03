import telex from "../assets/logos/telex.svg";
import trackio from "../assets/logos/trackio.svg";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Menu, ChevronDown } from "lucide-react";
import api from "../utils/axios";
import Roles from "../constants/roles";

const Topbar = ({ toggleSidebar }) => {
  const navigator = useNavigate();
  const user = useStore((state) => state.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogoutBtn = async () => {
    try {
      const response = await api.get("/auth/delete-token");
      if (response.data.isLoggedOut) {
        navigator("/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAccountSettings = () => {
    setIsDropdownOpen(false);

    if (!user || !user.role) {
      navigator("/unauthorized");
      return;
    }

    switch (user.role) {
      case Roles.ADMIN:
        navigator("/admin/account-settings");
        break;
      case Roles.OM:
        navigator("/operation-manager/account-settings");
        break;
      case Roles.TEAM_LEADER:
        navigator("/team-leader/account-settings");
        break;
      case Roles.AGENT:
        navigator("/agent/account-settings");
        break;
      default:
        navigator("/unauthorized");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex h-full justify-between items-center p-5 relative z-50">
      {/* Left Section */}
      <div className="flex items-center">
        <img src={trackio} alt="TRACKIO" className="w-45 h-auto" />
        <button onClick={toggleSidebar} className="hidden md:block ml-6">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Section */}
      <div
        className="flex items-center gap-0 md:gap-2 relative"
        ref={dropdownRef}
      >
        <img src={telex} alt="TELEX" className="w-12 h-auto" />
        <div className="hidden sm:flex flex-col">
          <span className="font-bold">{user?.name || "TELEX"}</span>
          <span className="text-sm">
            {user?.role?.replace("-", " ").toUpperCase()}
          </span>
        </div>

        {/* Dropdown Toggle */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2 rounded hover:bg-[#6f2a2a] hover:[&>*]:text-white cursor-pointer"
          aria-label="Open Account Dropdown"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 bg-white text-black rounded-lg shadow-lg w-48 overflow-hidden">
            <button
              onClick={handleAccountSettings}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
            >
              Account Settings
            </button>
            <button
              onClick={handleLogoutBtn}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Topbar;
