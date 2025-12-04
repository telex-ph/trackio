import {
  LayoutGrid,
  Trophy,
  Bell,
  Clock,
  Calendar,
  Activity,
  BookPlus,
  List,
  GalleryVerticalEnd,
  Users2Icon,
  Ticket,
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const HRSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadIR,
}) => (
  <div className="space-y-1">
    <SidebarLink
      to="/human-resources/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/human-resources/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/human-resources/schedule"
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
        to={`/human-resources/tracking/list`}
        icon={List}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/human-resources/tracking/history`}
        icon={GalleryVerticalEnd}
        label="History"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>

    <SidebarLink
      to="/human-resources/monitoring"
      icon={Activity}
      label="Monitoring"
      isCollapsed={isCollapsed}
    />

    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Offenses"
      isCollapsed={isCollapsed}
      open={activeDropdown === "offenses"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "offenses" ? null : "offenses")
      }
      badge={unreadIR}
    >
      <SidebarLink
        to={`/human-resources/createoffense`}
        icon={List}
        label="Create Offense"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/human-resources/offenses`}
        icon={GalleryVerticalEnd}
        label="My Offenses"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/human-resources/reported-ir`}
        icon={GalleryVerticalEnd}
        label="Reported IR"
        isCollapsed={isCollapsed}
        badge={!isCollapsed ? unreadIR : 0}
      />
    </CustomCollapse>

    <SidebarLink
      to="/human-resources/team"
      icon={Users2Icon}
      label="Team"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/human-resources/ticket"
      icon={Ticket}
      label="Ticket"
      isCollapsed={isCollapsed}
    />
  </div>
);

export default HRSidebar;
