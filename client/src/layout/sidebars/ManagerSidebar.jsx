import {
  LayoutGrid,
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
  FileText,
  FileCheck,
  CalendarPlus,
  CalendarClock,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import CustomCollapse from "./CustomCollapse";

// manager Sidebar
const ManagerSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadCreatedCoaching,
  unreadMyOffenses,
  unreadMyCoaching,
}) => {
  const totalUnread =
    (unreadCreatedCoaching || 0) +
    (unreadMyOffenses || 0) +
    (unreadMyCoaching || 0);
  const totalUnreadMyOffense =
    (unreadMyOffenses || 0) + (unreadMyCoaching || 0);

  return (
    <div className="space-y-1">
      <SidebarLink
        to="/manager/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/manager/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/manager/schedule"
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
          to={`/manager/tracking/list`}
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/manager/tracking/history`}
          icon={GalleryVerticalEnd}
          label="History"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>

      <SidebarLink
        to="/manager/monitoring"
        icon={Activity}
        label="Monitoring"
        isCollapsed={isCollapsed}
      />
      {/* <SidebarLink
      to="/manager/offences"
      icon={Calendar}
      label="Employee Offenses"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/manager/agentrequest"
      icon={BookPlus}
      label="Employee Request"
      isCollapsed={isCollapsed}
    /> */}
      <SidebarLink
        to="/manager/announcement"
        icon={Megaphone}
        label="Announcement"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/manager/ticket"
        icon={Ticket}
        label="Ticket"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/manager/courses"
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
          to={`/manager/createoffense`}
          icon={PlusCircle}
          label="Create Offense"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadCreatedCoaching : 0}
        />
        <SidebarLink
          to={`/manager/offenses`}
          icon={FileText}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnreadMyOffense : 0}
        />
      </CustomCollapse>
      <CustomCollapse
        icon={<CalendarClock className="w-5 h-5" />}
        label="Leave"
        isCollapsed={isCollapsed}
        open={activeDropdown === "leave"}
        onToggle={() =>
          setActiveDropdown(activeDropdown === "leave" ? null : "leave")
        }
        badge={totalUnread}
      >
        <SidebarLink
          to="/manager/apply-leave"
          icon={CalendarPlus}
          label="Apply Leave"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/manager/my-team-requests`}
          icon={FileCheck}
          label="Team Requests"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>
    </div>
  );
};

export default ManagerSidebar;
