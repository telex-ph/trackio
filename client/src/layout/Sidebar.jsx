import { NavLink } from "react-router-dom";
import React from "react";
import {
  LayoutGrid,
  BookOpenText,
  Bell,
  NotebookTabs,
  Clock,
  Coffee,
  Users,
  ChevronDown,
  Calendar,
  BarChart,
  Megaphone,
  FileText,
  Activity,
  AlertTriangle,
  UserCheck,
  Sun,
  Moon,
  Video,
  AlarmClockCheck,
  BookPlus,
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
        } rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full`}
      >
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, {
            className: `${isCollapsed ? "w-6 h-6" : "w-5 h-5"} flex-shrink-0`,
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
      } rounded-lg transition-colors duration-200 ${
        isActive ? "bg-[#571A1A] text-white" : "text-black hover:bg-gray-100"
      }`
    }
  >
    <Icon className={`${isCollapsed ? "w-5 h-5" : "w-5 h-5"} flex-shrink-0`} />
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
      label="Attendance/Logs"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/agent/coaching"
      icon={NotebookTabs}
      label="Meeting/Coaching"
      isCollapsed={isCollapsed}
    />
    {/* ➕ New Employee Request Link */}
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

    <CustomCollapse
      icon={<BookOpenText className="w-5 h-5" />}
      label="Attendance"
      isCollapsed={isCollapsed}
      open={activeDropdown === "attendance"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "attendance" ? null : "attendance")
      }
    >
      {[
        { path: "basic-logs", label: "Basic Logs", Icon: FileText },
        { path: "late", label: "Late", Icon: AlertTriangle },
        { path: "overtime", label: "Overtime", Icon: AlarmClockCheck },
        { path: "undertime", label: "Undertime", Icon: Clock },
      ].map(({ path, label, Icon }) => (
        <SidebarLink
          key={path}
          to={`/team-leader/attendance/${path}`}
          icon={Icon}
          label={label}
          isCollapsed={isCollapsed}
        />
      ))}
    </CustomCollapse>

    <SidebarLink
      to="/team-leader/coaching"
      icon={Video}
      label="Coaching"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/team-leader/schedule"
      icon={Calendar}
      label="Schedule"
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

// Admin Sidebar
const AdminSidebar = ({ isCollapsed }) => (
  <div className="space-y-1">
    <SidebarLink
      to="/admin/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/tracking/time-in"
      icon={Clock}
      label="Tracking"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/monitoring/status"
      icon={Activity}
      label="Monitoring"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/history"
      icon={FileText}
      label="History"
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
        return <OMSidebar isCollapsed={isCollapsed} />;
      case Role.ADMIN:
        return <AdminSidebar isCollapsed={isCollapsed} />;
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

      {/* Shift Schedule only for Agent */}
      {user.role === Role.AGENT && !isCollapsed && (
        <section className="bg-white border border-gray-200 m-2 p-3 text-center rounded-lg">
          <p className="font-semibold text-gray-800">Shift Schedule:</p>
          <p className="text-gray-600 text-sm">9:00 AM - 6:00 PM</p>
        </section>
      )}
    </aside>
  );
};
