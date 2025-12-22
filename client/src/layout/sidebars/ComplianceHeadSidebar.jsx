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
  BarChart2,
  ClipboardList,
  Book,
  PlusCircle,
  FileText,
  TrendingUp,
  Eye,
  AlertTriangle,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import CustomCollapse from "./CustomCollapse";

// Admin Sidebar
const ComplianceHeadSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadIR,
  unreadMyOffenses,
  unreadEscalation,
  unreadCoaching,
}) => {
  const totalUnreadWithEscalation =
    (unreadIR || 0) +
    (unreadMyOffenses || 0) +
    (unreadEscalation || 0) +
    (unreadCoaching || 0);

  return (
    <div className="space-y-1">
      <SidebarLink
        to="/compliance-head/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance-head/recognition"
        icon={Trophy}
        label="Recognition Wall"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance-head/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance-head/schedule"
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
          to={`/compliance-head/tracking/list`}
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/compliance-head/tracking/history`}
          icon={GalleryVerticalEnd}
          label="History"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>

      <SidebarLink
        to="/compliance-head/monitoring"
        icon={Activity}
        label="Monitoring"
        isCollapsed={isCollapsed}
      />
      {/* <SidebarLink
      to="/compliance-head/offences"
      icon={Calendar}
      label="Employee Offenses"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance-head/agentrequest"
      icon={BookPlus}
      label="Employee Request"
      isCollapsed={isCollapsed}
    /> */}
      <SidebarLink
        to="/compliance-head/announcement"
        icon={Megaphone}
        label="Announcement"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/compliance-head/team"
        icon={Users2Icon}
        label="Team"
        isCollapsed={isCollapsed}
      />
      <CustomCollapse
        icon={<ClipboardList className="w-5 h-5" />}
        label="Ticket"
        isCollapsed={isCollapsed}
        open={activeDropdown === "tickets"}
        onToggle={() =>
          setActiveDropdown(activeDropdown === "tickets" ? null : "tickets")
        }
      >
        <SidebarLink
          to="/compliance-head/ticket/list"
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/compliance-head/ticket/analytics`}
          icon={BarChart2}
          label="Analytics"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>
      <SidebarLink
        to="/compliance-head/courses"
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
        badge={totalUnreadWithEscalation}
      >
        <SidebarLink
          to={`/compliance-head/createoffense`}
          icon={PlusCircle}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/compliance-head/offenses`}
          icon={FileText}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadMyOffenses : 0}
        />
        {/* <SidebarLink
          to={`/compliance-head/escalated-offenses`}
          icon={TrendingUp}
          label="Escalated Offenses"
          badge={!isCollapsed ? unreadEscalation : 0}
        /> */}
        <SidebarLink
          to={`/compliance-head/offenses-monitoring`}
          icon={Eye}
          label="Offense Monitoring"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>
      <SidebarLink
        to="/compliance-head/account-management"
        icon={Users2Icon}
        label="Account"
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default ComplianceHeadSidebar;
