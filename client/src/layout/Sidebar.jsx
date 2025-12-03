import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import Role from "../constants/roles";
import AgentSidebar from "./sidebars/AgentSidebar";
import TeamLeaderSidebar from "./sidebars/TeamLeaderSidebar";
import OperationsAssociateSidebar from "./sidebars/OperationsAssociateSidebar";
import BackOfficeHeadSidebar from "./sidebars/BackOfficeHeadSidebar";
import ManagerSidebar from "./sidebars/ManagerSidebar";
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

  const fetchUnreadOffenses = useStore((state) => state.fetchUnreadOffenses);

  const unreadOffenses = useStore((state) => {
    if ([Role.HR, Role.ADMIN_HR_HEAD].includes(user.role))
      return state.unreadOffensesHR;
    if (![Role.HR, Role.ADMIN_HR_HEAD].includes(user.role))
      return state.unreadOffensesRespondent;
    return 0;
  });

  useEffect(() => {
    // --- Initial fetch ---
    if (user.role === Role.HR) {
      fetchUnreadOffenses({ role: "HR" });
    } else if (![Role.HR, Role.ADMIN_HR_HEAD].includes(user.role)) {
      fetchUnreadOffenses({ role: "RESPONDENT", employeeId: user.employeeId });
    }

    // --- Socket handlers ---
    const handleOffenseEvent = () => {
      if (user.role === Role.HR) {
        fetchUnreadOffenses({ role: "HR" });
      } else if (![Role.HR, Role.ADMIN_HR_HEAD].includes(user.role)) {
        fetchUnreadOffenses({
          role: "RESPONDENT",
          employeeId: user.employeeId,
        });
      }
    };

    const attachListeners = () => {
      socket.on("offenseAdded", handleOffenseEvent);
      socket.on("offenseUpdated", handleOffenseEvent);
      socket.on("offenseDeleted", handleOffenseEvent);
    };

    if (socket.connected) attachListeners();
    socket.on("connect", attachListeners);

    return () => {
      socket.off("offenseAdded", handleOffenseEvent);
      socket.off("offenseUpdated", handleOffenseEvent);
      socket.off("offenseDeleted", handleOffenseEvent);
      socket.off("connect", attachListeners);
    };
  }, [user.role, user.employeeId, fetchUnreadOffenses]);

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
      case Role.OPERATION_ASSOCIATE:
        return (
          <OperationsAssociateSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            unreadOffenses={unreadOffenses}
          />
        );
      case Role.BACK_OFFICE_HEAD:
        return (
          <BackOfficeHeadSidebar
            isCollapsed={isCollapsed}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            unreadOffenses={unreadOffenses}
          />
        );
      case Role.MANAGER:
        return (
          <ManagerSidebar
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
            unreadOffenses={unreadOffenses}
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
