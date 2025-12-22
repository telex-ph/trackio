import {
  LayoutGrid,
  Bell,
  Clock,
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
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const OMSidebar = ({
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
        to="/operations-manager/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/operations-manager/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/operations-manager/schedule"
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
          to={`/operations-manager/tracking/list`}
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/operations-manager/tracking/history`}
          icon={GalleryVerticalEnd}
          label="History"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>
      <SidebarLink
        to="/operations-manager/monitoring"
        icon={Activity}
        label="Monitoring"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/operations-manager/team"
        icon={Users2Icon}
        label="Team"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/operations-manager/courses"
        icon={Book}
        label="Courses"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/operations-manager/ticket"
        icon={Ticket}
        label="Ticket"
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
          to={`/operations-manager/createoffense`}
          icon={PlusCircle}
          label="Create Offense"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadCreatedCoaching : 0}
        />
        <SidebarLink
          to={`/operations-manager/offenses`}
          icon={FileText}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnreadMyOffense : 0}
        />
      </CustomCollapse>
    </div>
  );
};

export default OMSidebar;
