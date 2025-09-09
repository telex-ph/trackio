import { NavLink } from "react-router-dom";
import {
  Sidebar as Side,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import {
  LayoutGrid,
  BookOpenText,
  Bell,
  NotebookTabs,
  Clock,
  LogOut,
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
} from "lucide-react";
import { useStore } from "../store/useStore";
import Role from "../enum/roles.enum";
import { useState } from "react";

// Custom Collapse with fixed icon size and arrow
const CustomCollapse = ({ icon, label, children, isCollapsed }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full"
      >
        <div className="flex items-center gap-2">
          {icon}
          {!isCollapsed && <span className="font-medium">{label}</span>}
        </div>

        {/* Arrow always visible */}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          open ? "max-h-screen mt-1" : "max-h-0"
        }`}
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
      `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
        isActive ? "bg-[#571A1A] text-white" : "text-gray-700 hover:bg-gray-100"
      }`
    }
  >
    <Icon className="w-5 h-5" />
    {!isCollapsed && <span className="font-medium">{label}</span>}
  </NavLink>
);

// Agent Sidebar
const AgentSidebar = ({ isCollapsed }) => (
  <SidebarItemGroup className="space-y-1">
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
  </SidebarItemGroup>
);

// Team Leader Sidebar
const TeamLeaderSidebar = ({ isCollapsed }) => (
  <SidebarItemGroup className="space-y-1">
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
      to="/team-leader/announcement"
      icon={Megaphone}
      label="Announcement"
      isCollapsed={isCollapsed}
    />
  </SidebarItemGroup>
);

// Admin Sidebar
const AdminSidebar = ({ isCollapsed }) => (
  <SidebarItemGroup className="space-y-1">
    <SidebarLink
      to="/admin/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />

    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Tracking"
      isCollapsed={isCollapsed}
    >
      {[
        { path: "time-in", label: "Time In", Icon: Sun },
        { path: "time-out", label: "Time Out", Icon: Moon },
        { path: "absentees", label: "Absentees", Icon: Users },
        { path: "employee-status", label: "Employee Status", Icon: UserCheck },
      ].map(({ path, label, Icon }) => (
        <SidebarLink
          key={path}
          to={`/admin/tracking/${path}`}
          icon={Icon}
          label={label}
          isCollapsed={isCollapsed}
        />
      ))}
    </CustomCollapse>

    <CustomCollapse
      icon={<Activity className="w-5 h-5" />}
      label="Monitoring"
      isCollapsed={isCollapsed}
    >
      {[
        { path: "late", label: "Late", Icon: AlertTriangle },
        { path: "on-break", label: "On Break", Icon: Coffee },
        { path: "on-lunch", label: "On Lunch", Icon: Sun },
        { path: "undertime", label: "Undertime", Icon: Clock },
        { path: "bio-break", label: "Bio Break", Icon: Moon },
        { path: "meeting", label: "Meeting", Icon: Video },
      ].map(({ path, label, Icon }) => (
        <SidebarLink
          key={path}
          to={`/admin/monitoring/${path}`}
          icon={Icon}
          label={label}
          isCollapsed={isCollapsed}
        />
      ))}
    </CustomCollapse>

    <SidebarLink
      to="/admin/history"
      icon={FileText}
      label="History"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/schedule"
      icon={Calendar}
      label="Schedule"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin/announcement"
      icon={Megaphone}
      label="Announcement"
      isCollapsed={isCollapsed}
    />
  </SidebarItemGroup>
);

// Main Sidebar
export const Sidebar = ({ isCollapsed }) => {
  const user = useStore((state) => state.user);

  const renderSidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        return <AgentSidebar isCollapsed={isCollapsed} />;
      case Role.TEAM_LEADER:
        return <TeamLeaderSidebar isCollapsed={isCollapsed} />;
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
      <Side collapsed={isCollapsed}>
        <SidebarItems>{renderSidebar()}</SidebarItems>
      </Side>

      {!isCollapsed && (
        <section className="bg-white border border-gray-200 m-2 p-3 text-center rounded-lg">
          <p className="font-semibold text-gray-800">Shift Schedule:</p>
          <p className="text-gray-600 text-sm">9:00 AM - 6:00 PM</p>
        </section>
      )}
    </aside>
  );
};
