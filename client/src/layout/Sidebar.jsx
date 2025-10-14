import { NavLink } from "react-router-dom";
import React from "react";
import {
  LayoutGrid,
  Bell,
  NotebookTabs,
  Clock,
  ChevronDown,
  Calendar,
  BarChart,
  Megaphone,
  Activity,
  Video,
  BookPlus,
  List,
  GalleryVerticalEnd,
  Users,
} from "lucide-react";
import { useStore } from "../store/useStore";
import Role from "../constants/roles";
import { useState } from "react";

// Custom Collapse (controlled from parent)
const CustomCollapse = ({
  icon,
  label,
  children,
  isCollapsed,
  open,
  onToggle,
}) => {
  return (
    <div className="flex flex-col w-full">
      <button
        onClick={onToggle}
        className={`flex items-center ${
          isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2"
        } rounded-lg transition-colors duration-200 w-full`}
      >
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, {
            className: `${isCollapsed ? "w-4 h-4" : "w-4 h-4"} flex-shrink-0`,
          })}
          {!isCollapsed && <span className="font-medium">{label}</span>}
        </div>

        {/* Arrow always visible */}
        {!isCollapsed && (
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </button>

      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          !isCollapsed && "pl-3"
        } ${open ? "max-h-screen mt-1" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
};

// Sidebar link component
const SidebarLink = ({ to, icon: Icon, label, isCollapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center ${
        isCollapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2"
      } rounded-md ${
        isActive
          ? "bg-(--primary-color) text-white"
          : "text-black hover:bg-gray-100"
      }`
    }
  >
    <Icon className={`${isCollapsed ? "w-4 h-4" : "w-4 h-4"} flex-shrink-0`} />
    {!isCollapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

// Agent Sidebar
const AgentSidebar = ({ isCollapsed }) => (
  <div className="space-y-1">
    <SidebarLink
      to="/agent/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/agent/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/agent/coaching"
      icon={NotebookTabs}
      label="Coaching"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/agent/offences"
      icon={Calendar}
      label="Incident Reports"
      isCollapsed={isCollapsed}
    />
  </div>
);

// Team Leader Sidebar
const TeamLeaderSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
}) => (
  <div className="space-y-1">
    <SidebarLink
      to="/team-leader/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/team-leader/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />

    <SidebarLink
      to="/team-leader/schedule"
      icon={Calendar}
      label="Schedule"
      isCollapsed={isCollapsed}
    />

    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Tracking"
      isCollapsed={isCollapsed}
      open={activeDropdown === "tracking"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "tracking" ? null : "tracking")
      }
    >
      <SidebarLink
        to={`/team-leader/tracking/list`}
        icon={List}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/team-leader/tracking/history`}
        icon={GalleryVerticalEnd}
        label="History"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>
    <SidebarLink
      to="/team-leader/team"
      icon={Users}
      label="Team"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/team-leader/coaching"
      icon={Video}
      label="Coaching"
      isCollapsed={isCollapsed}
    />

    <SidebarLink
      to="/team-leader/performance"
      icon={BarChart}
      label="Performance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/team-leader/agentrequest"
      icon={BookPlus}
      label="Agent Request"
      isCollapsed={isCollapsed}
    />
  </div>
);

const OMSidebar = ({ isCollapsed, activeDropdown, setActiveDropdown }) => (
  <div className="space-y-1">
    <SidebarLink
      to="/operation-manager/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/operation-manager/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/operation-manager/schedule"
      icon={BookPlus}
      label="Schedule"
      isCollapsed={isCollapsed}
    />
    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Tracking"
      isCollapsed={isCollapsed}
      open={activeDropdown === "tracking"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "tracking" ? null : "tracking")
      }
    >
      <SidebarLink
        to={`/operation-manager/tracking/list`}
        icon={List}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/operation-manager/tracking/history`}
        icon={GalleryVerticalEnd}
        label="History"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>
    <SidebarLink
      to="/operation-manager/monitoring"
      icon={Activity}
      label="Monitoring"
      isCollapsed={isCollapsed}
    />
  </div>
);

// Admin Sidebar
const AdminSidebar = ({ isCollapsed, activeDropdown, setActiveDropdown }) => (
  <div className="space-y-1">
    <SidebarLink
      to="/admin/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/schedule"
      icon={BookPlus}
      label="Schedule"
      isCollapsed={isCollapsed}
    />
    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Tracking"
      isCollapsed={isCollapsed}
      open={activeDropdown === "tracking"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "tracking" ? null : "tracking")
      }
    >
      <SidebarLink
        to={`/admin/tracking/list`}
        icon={List}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/admin/tracking/history`}
        icon={GalleryVerticalEnd}
        label="History"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>

    <SidebarLink
      to="/admin/monitoring"
      icon={Activity}
      label="Monitoring"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/offences"
      icon={Calendar}
      label="Employee Offenses"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/agentrequest"
      icon={BookPlus}
      label="Employee Request"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/announcement"
      icon={Megaphone}
      label="Announcement"
      isCollapsed={isCollapsed}
    />
  </div>
);

// Main Sidebar
export const Sidebar = ({ isCollapsed }) => {
  const user = useStore((state) => state.user);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const renderSidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        return <AgentSidebar isCollapsed={isCollapsed} />;
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
      case Role.ADMIN:
        return (
          <AdminSidebar
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
