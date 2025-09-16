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
    <nav className="flex h-full justify-between items-center p-3 sm:p-4 lg:p-5 bg-[#571A1A] text-white relative z-50">
      {/* Left Section */}
      <div className="flex items-center">
        <img 
          src={trackio} 
          alt="TRACKIO" 
          className="w-32 h-auto sm:w-36 md:w-40 lg:w-45" 
        />
        <button 
          onClick={toggleSidebar} 
          className="p-1 sm:p-2 ml-2 sm:ml-4 lg:ml-6 hover:bg-[#6f2a2a] rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 relative" ref={dropdownRef}>
        <img 
          src={telex} 
          alt="TELEX" 
          className="w-8 h-auto sm:w-10 md:w-12 flex-shrink-0" 
        />
        
        {/* User Info - Hidden on very small screens */}
        <div className="hidden xs:flex flex-col min-w-0">
          <span className="font-bold text-sm sm:text-base truncate max-w-24 sm:max-w-32 md:max-w-none">
            {user?.name || "TELEX"}
          </span>
          <span className="text-xs sm:text-sm text-gray-200 truncate max-w-24 sm:max-w-32 md:max-w-none">
            {user?.role?.replace("-", " ") || "Employee Account"}
          </span>
        </div>

        {/* Dropdown Toggle */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="ml-1 sm:ml-2 p-1 sm:p-2 rounded hover:bg-[#6f2a2a] transition-colors flex-shrink-0"
          aria-label="Open Account Dropdown"
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 right-0 z-50 bg-white text-black rounded-lg shadow-lg w-44 sm:w-48 overflow-hidden">
            {/* Show user info in dropdown on very small screens */}
            <div className="xs:hidden px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="font-semibold text-sm truncate">
                {user?.name || "TELEX"}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {user?.role?.replace("-", " ") || "Employee Account"}
              </div>
            </div>
            
            <button
              onClick={handleAccountSettings}
              className="w-full text-left px-4 py-2 sm:py-3 hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Account Settings
            </button>
            <button
              onClick={handleLogoutBtn}
              className="w-full text-left px-4 py-2 sm:py-3 hover:bg-gray-100 text-red-600 transition-colors text-sm sm:text-base"
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