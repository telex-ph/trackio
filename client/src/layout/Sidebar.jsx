import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import Role from "../constants/roles";

import AgentSidebar from "./sidebars/AgentSidebar";
import TeamLeaderSidebar from "./sidebars/TeamLeaderSidebar";
import TraineeQualityAssuranceSidebar from "./sidebars/TraineeQualityAssuranceSidebar";
import OperationsAssociateSidebar from "./sidebars/OperationsAssociateSidebar";
import BackOfficeHeadSidebar from "./sidebars/BackOfficeHeadSidebar";
import ManagerSidebar from "./sidebars/ManagerSidebar";
import OMSidebar from "./sidebars/OMSidebar";
import HRSidebar from "./sidebars/HRSidebar";
import AdminSidebar from "./sidebars/AdminSidebar";
import AdminHRHeadSidebar from "./sidebars/AdminHRHeadSidebar";
import ComplianceSidebar from "./sidebars/ComplianceSidebar";
import ComplianceHeadSidebar from "./sidebars/ComplianceHeadSidebar";
import PresidentSidebar from "./sidebars/PresidentSidebar";

export const Sidebar = ({ isCollapsed }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  // User and badge counts from zustand
  const user = useStore((state) => state.user);
  const unreadIR = useStore((state) => state.unreadIR);
  const unreadMyOffenses = useStore((state) => state.unreadMyOffenses);
  const unreadEscalation = useStore((state) => state.unreadEscalation);
  const unreadCoaching = useStore((state) => state.unreadCoaching);

  // Functions to fetch badges and attach socket listeners
  const fetchUnreadOffenses = useStore((state) => state.fetchUnreadOffenses);
  const fetchUnreadEscalatedOffenses = useStore(
    (state) => state.fetchUnreadEscalatedOffenses
  );
  const fetchUnreadCoaching = useStore((state) => state.fetchUnreadCoaching);
  const attachOffenseSocketListeners = useStore(
    (state) => state.attachOffenseSocketListeners
  );
  const attachOffenseEscalatedSocketListeners = useStore(
    (state) => state.attachOffenseEscalatedSocketListeners
  );
  const attachCoachingSocketListeners = useStore(
    (state) => state.attachCoachingSocketListeners
  );
  const removeOffenseSocketListeners = useStore(
    (state) => state.removeOffenseSocketListeners
  );
  const removeCoachingSocketListeners = useStore(
    (state) => state.removeCoachingSocketListeners
  );

  // Fetch unread counts and attach socket listeners on mount
  useEffect(() => {
    if (!user?.employeeId) return;

    fetchUnreadOffenses(user);
    fetchUnreadEscalatedOffenses(user);
    fetchUnreadCoaching(user);
    attachOffenseSocketListeners();
    attachOffenseEscalatedSocketListeners();
    attachCoachingSocketListeners();

    return () => {
      removeOffenseSocketListeners();
      removeCoachingSocketListeners();
    };
  }, [
    user,
    fetchUnreadOffenses,
    fetchUnreadEscalatedOffenses,
    fetchUnreadCoaching,
    attachOffenseSocketListeners,
    attachOffenseEscalatedSocketListeners,
    attachCoachingSocketListeners,
    removeOffenseSocketListeners,
    removeCoachingSocketListeners,
  ]);

  // Prepare props to pass to all sidebars
  const sidebarProps = {
    isCollapsed,
    activeDropdown,
    setActiveDropdown,
    unreadMyOffenses
  };

  const renderSidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        return (
          <AgentSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.TRAINER_QUALITY_ASSURANCE:
        return (
          <TraineeQualityAssuranceSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.TEAM_LEADER:
        return (
          <TeamLeaderSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.OPERATION_ASSOCIATE:
        return (
          <OperationsAssociateSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.BACK_OFFICE_HEAD:
        return (
          <BackOfficeHeadSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.MANAGER:
        return (
          <ManagerSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.OM:
        return (
          <OMSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.HR:
        return (
          <HRSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
          />
        );
      case Role.ADMIN:
        return (
          <AdminSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.ADMIN_HR_HEAD:
        return (
          <AdminHRHeadSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.COMPLIANCE:
        return (
          <ComplianceSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadEscalation={unreadEscalation}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.COMPLIANCE_HEAD:
        return (
          <ComplianceHeadSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadEscalation={unreadEscalation}
            unreadCoaching={unreadCoaching}
          />
        );
      case Role.PRESIDENT:
        return (
          <PresidentSidebar
            {...sidebarProps}
            unreadIR={unreadIR}
            unreadCoaching={unreadCoaching}
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
