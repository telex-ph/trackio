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
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const OMSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
    unreadIR,
  unreadCoaching,
}) => {
  const totalUnread = (unreadIR || 0) + (unreadCoaching || 0);

return(
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
      to="/operations-manager/ticket"
      icon={Ticket}
      label="Ticket"
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
      badge={totalUnread}
    >
      <SidebarLink
        to={`/operations-manager/createoffense`}
        icon={List}
        label="Create Offense"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/operations-manager/offenses`}
        icon={GalleryVerticalEnd}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnread : 0}
      />
    </CustomCollapse>
  </div>
);
}

export default OMSidebar;
