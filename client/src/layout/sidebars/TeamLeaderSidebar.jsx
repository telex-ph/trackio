import {
  LayoutGrid,
  Trophy,
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
  CalendarPlus,
  FileCheck,
  CalendarClock,
  Book,
  AlertTriangle,
  PlusCircle,
  FileText,
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const TeamLeaderSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadIR,
  unreadMyOffenses,
  unreadCoaching,
}) => {
  const totalUnread =
    (unreadIR || 0) + (unreadMyOffenses || 0) + (unreadCoaching || 0);

  return (
    <div className="space-y-1">
      <SidebarLink
        to="/team-leader/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/team-leader/recognition"
        icon={Trophy}
        label={"Recognition Wall"}
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
        to="/team-leader/courses"
        icon={Book}
        label="Courses"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/team-leader/ticket"
        icon={Ticket}
        label="Ticket"
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
          to={`/team-leader/createoffense`}
          icon={PlusCircle}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/team-leader/offenses`}
          icon={FileText}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadMyOffenses : 0}
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
          to="/team-leader/apply-leave"
          icon={CalendarPlus}
          label="Apply Leave"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/team-leader/my-team-requests`}
          icon={FileCheck}
          label="Team Requests"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>
    </div>
  );
};

export default TeamLeaderSidebar;
