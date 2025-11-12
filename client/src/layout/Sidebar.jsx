import { useEffect } from "react";
import { useStore } from "../store/useStore";
import Role from "../constants/roles";
import { useState } from "react";
import AgentSidebar from "./sidebars/AgentSidebar";
import TeamLeaderSidebar from "./sidebars/TeamLeaderSidebar";
import OMSidebar from "./sidebars/OMSidebar";
import HRSidebar from "./sidebars/HRSidebar";
import AdminSidebar from "./sidebars/AdminSidebar";
import AdminHRHeadSidebar from "./sidebars/AdminHRHeadSidebar";

// Main Sidebar
export const Sidebar = ({ isCollapsed }) => {
  const user = useStore((state) => state.user);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const unreadOffenses = useStore((state) => state.unreadOffenses);
  const fetchUnreadOffenses = useStore((state) => state.fetchUnreadOffenses);

  useEffect(() => {
    if (user.role === Role.HR) {
      fetchUnreadOffenses();
    }
  }, [user.role, fetchUnreadOffenses]);

  const renderSidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        // --- FIX 2: Ipinasa ang state pababa sa AgentSidebar ---
        return (
          <AgentSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case Role.TEAM_LEADER:
        return (
          <TeamLeaderSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case Role.OM:
        return (
          <OMSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case Role.HR:
        return (
          <HRSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            unreadOffenses={unreadOffenses}
          />
        );
      case Role.ADMIN:
        return (
          <AdminSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case Role.ADMIN_HR_HEAD:
        return (
          <AdminHRHeadSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside
      className={`flex flex-col h-full justify-between bg-white shadow-sm transition-all duration-300 overflow-y-auto ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <nav className="flex-1 m-4">{renderSidebar()}</nav>
    </aside>
  );
};
