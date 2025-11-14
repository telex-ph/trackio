import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import Role from "../constants/roles";
import AgentSidebar from "./sidebars/AgentSidebar";
import TeamLeaderSidebar from "./sidebars/TeamLeaderSidebar";
import OMSidebar from "./sidebars/OMSidebar";
import HRSidebar from "./sidebars/HRSidebar";
import AdminSidebar from "./sidebars/AdminSidebar";
import AdminHRHeadSidebar from "./sidebars/AdminHRHeadSidebar";
import ComplianceSidebar from "./sidebars/ComplianceSidebar";
import ComplianceHeadSidebar from "./sidebars/ComplianceHeadSidebar";
import socket from "../utils/socket";
import PresidentSidebar from "./sidebars/PresidentSidebar";

// Main Sidebar
export const Sidebar = ({ isCollapsed }) => {
  const user = useStore((state) => state.user);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fetchUnreadOffensesHR = useStore(
    (state) => state.fetchUnreadOffensesHR
  );
  const fetchUnreadOffensesRespondent = useStore(
    (state) => state.fetchUnreadOffensesRespondent
  );

  const unreadOffenses = useStore((state) => {
    if (user.role === Role.HR) return state.unreadOffensesHR;
    if ([Role.AGENT, Role.TEAM_LEADER].includes(user.role))
      return state.unreadOffensesRespondent;
    return 0;
  });

  useEffect(() => {
    // --- Initial fetch of unread offenses ---
    if (user.role === Role.HR) {
      fetchUnreadOffensesHR();
    } else if ([Role.AGENT, Role.TEAM_LEADER].includes(user.role)) {
      fetchUnreadOffensesRespondent(user.employeeId);
    }

    // --- Socket handlers for real-time updates ---
    const handleOffenseAdded = () => {
      if (user.role === Role.HR) fetchUnreadOffensesHR();
      else if ([Role.AGENT, Role.TEAM_LEADER].includes(user.role))
        fetchUnreadOffensesRespondent(user.employeeId);
    };

    const handleOffenseUpdated = () => {
      if (user.role === Role.HR) fetchUnreadOffensesHR();
      else if ([Role.AGENT, Role.TEAM_LEADER].includes(user.role))
        fetchUnreadOffensesRespondent(user.employeeId);
    };

    const handleOffenseDeleted = () => {
      if (user.role === Role.HR) fetchUnreadOffensesHR();
      else if ([Role.AGENT, Role.TEAM_LEADER].includes(user.role))
        fetchUnreadOffensesRespondent(user.employeeId);
    };

    const attachListeners = () => {
      socket.on("offenseAdded", handleOffenseAdded);
      socket.on("offenseUpdated", handleOffenseUpdated);
      socket.on("offenseDeleted", handleOffenseDeleted);
    };

    // Attach listeners immediately if socket is connected
    if (socket.connected) attachListeners();
    socket.on("connect", attachListeners);

    // Cleanup
    return () => {
      socket.off("offenseAdded", handleOffenseAdded);
      socket.off("offenseUpdated", handleOffenseUpdated);
      socket.off("offenseDeleted", handleOffenseDeleted);
      socket.off("connect", attachListeners);
    };
  }, [
    user.role,
    user.employeeId,
    fetchUnreadOffensesHR,
    fetchUnreadOffensesRespondent,
  ]);

  const renderSidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        return (
          <AgentSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            unreadOffenses={unreadOffenses}
          />
        );
      case Role.TEAM_LEADER:
        return (
          <TeamLeaderSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            unreadOffenses={unreadOffenses}
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
      case Role.COMPLIANCE:
        return (
          <ComplianceSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case Role.COMPLIANCE_HEAD:
        return (
          <ComplianceHeadSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
          />
        );
      case Role.PRESIDENT:
        return (
          <PresidentSidebar
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
