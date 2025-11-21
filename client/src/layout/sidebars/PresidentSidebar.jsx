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
  BarChart,
  Video,
  Calendar,
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const PresidentSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadOffenses,
}) => (
  <div className="space-y-1">
    <SidebarLink
      to="/president/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/president/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/president/schedule"
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
        to={`/president/tracking/list`}
        icon={List}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/president/tracking/history`}
        icon={GalleryVerticalEnd}
        label="History"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>
    <SidebarLink
      to="/president/monitoring"
      icon={Activity}
      label="Monitoring"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/president/announcement"
      icon={Megaphone}
      label="Announcement"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/president/team"
      icon={Users2Icon}
      label="Team"
      isCollapsed={isCollapsed}
    />
    {/* <SidebarLink
      to="/president/ticket"
      icon={Ticket}
      label="Ticket"
      isCollapsed={isCollapsed}
    /> */}
    {/* <SidebarLink
      to="/president/performance"
      icon={BarChart}
      label="Performance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/president/coaching"
      icon={Video}
      label="Coaching"
      isCollapsed={isCollapsed}
    />
      */}
    {/* <SidebarLink
      to="/president/agentrequest"
      icon={Calendar}
      label="Agent Request"
      isCollapsed={isCollapsed}
    /> */}

    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Offenses"
      isCollapsed={isCollapsed}
      open={activeDropdown === "offenses"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "offenses" ? null : "offenses")
      }
    >
      <SidebarLink
        to="/president/offenses"
        icon={Calendar}
        label="Create Offense"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/president/createoffense`}
        icon={List}
        label="Report Offense"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/president/reported-ir`}
        icon={GalleryVerticalEnd}
        label="Reported IR"
        isCollapsed={isCollapsed}
        badge={unreadOffenses}
      />
    </CustomCollapse>
    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Ticket"
      isCollapsed={isCollapsed}
      open={activeDropdown === "tickets"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "tickets" ? null : "tickets")
      }
    >
      <SidebarLink
        to="/president/ticket/list"
        icon={Calendar}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/president/ticket/analytics`}
        icon={List}
        label="Analytics"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>
    <SidebarLink
      to="/president/account-management"
      icon={Users2Icon}
      label="Account"
      isCollapsed={isCollapsed}
    />
  </div>
);

export default PresidentSidebar;
