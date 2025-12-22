import {
  LayoutGrid,
  Trophy,
  Bell,
  Clock,
  Megaphone,
  Activity,
  BookPlus,
  List,
  GalleryVerticalEnd,
  Users2Icon,
  Ticket,
  Book,
  AlertTriangle,
  PlusCircle,
  ListChecks,
  TrendingUp,
  FileText,
  Eye,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import CustomCollapse from "./CustomCollapse";

// Admin Sidebar
const ComplianceSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadEscalation,
  unreadMyOffenses,
  unreadMyCoaching,
}) => {
  const totalUnread =
    +(unreadMyOffenses || 0) + (unreadEscalation || 0) + (unreadMyCoaching || 0);
  const totalUnreadMyOffense =
    (unreadMyOffenses || 0) + (unreadMyCoaching || 0);

  return (
    <div className="space-y-1">
      <SidebarLink
        to="/compliance/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance/recognition"
        icon={Trophy}
        label="Recognition Wall"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance/schedule"
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
          to={`/compliance/tracking/list`}
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/compliance/tracking/history`}
          icon={GalleryVerticalEnd}
          label="History"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>

      <SidebarLink
        to="/compliance/monitoring"
        icon={Activity}
        label="Monitoring"
        isCollapsed={isCollapsed}
      />
      {/* <SidebarLink
      to="/compliance/offences"
      icon={Calendar}
      label="Employee Offenses"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance/agentrequest"
      icon={BookPlus}
      label="Employee Request"
      isCollapsed={isCollapsed}
    /> */}
      <SidebarLink
        to="/compliance/announcement"
        icon={Megaphone}
        label="Announcement"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance/ticket"
        icon={Ticket}
        label="Ticket"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance/courses"
        icon={Book}
        label="Courses"
        isCollapsed={isCollapsed}
      />
      <CustomCollapse
        icon={<AlertTriangle className="w-5 h-5" />}
        label="Offenses"
        isCollapsed={isCollapsed}
        open={activeDropdown === "offenses"}
        onToggle={() =>
          setActiveDropdown(activeDropdown === "offenses" ? null : "offenses")
        }
        badge={totalUnread}
      >
        <SidebarLink
          to={`/compliance/createoffense`}
          icon={PlusCircle}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/compliance/offenses`}
          icon={FileText}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnreadMyOffense : 0}
        />
        <SidebarLink
          to={`/compliance/escalated-offenses`}
          icon={TrendingUp}
          label="Escalated Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadEscalation : 0}
        />
        <SidebarLink
          to={`/compliance/offenses-monitoring`}
          icon={Eye}
          label="Offense Monitoring"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>
      <SidebarLink
        to="/compliance/account-management"
        icon={Users2Icon}
        label="Account"
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ComplianceSidebar;
