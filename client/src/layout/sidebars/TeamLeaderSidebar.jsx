import {
  LayoutGrid,
  Bell,
  Clock,
  Calendar,
  BarChart,
  Video,
  BookPlus,
  List,
  GalleryVerticalEnd,
  Users2Icon,
  Ticket,
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const TeamLeaderSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadOffenses,
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
      icon={Users2Icon}
      label="Team"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/team-leader/ticket"
      icon={Ticket}
      label="Ticket"
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

    <CustomCollapse
      icon={<Clock className="w-5 h-5" />}
      label="Offenses"
      isCollapsed={isCollapsed}
      open={activeDropdown === "offenses"}
      onToggle={() =>
        setActiveDropdown(activeDropdown === "offenses" ? null : "offenses")
      }
      badge={unreadOffenses}
    >
      <SidebarLink
        to={`/team-leader/createoffense`}
        icon={List}
        label="Create Offense"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/team-leader/offenses`}
        icon={GalleryVerticalEnd}
        label={
          <>
            My Offenses
            {!isCollapsed && unreadOffenses > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadOffenses}
              </span>
            )}
          </>
        }
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>
  </div>
);

export default TeamLeaderSidebar;
