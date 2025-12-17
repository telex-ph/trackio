import {
  LayoutGrid,
  Trophy,
  Bell,
  NotebookTabs,
  Clock,
  List,
  GalleryVerticalEnd,
  Ticket,
  CalendarPlus,
  Video,
  Book,
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

const AgentSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadIR,
  unreadCoaching,
}) => {
  const totalUnread = (unreadIR || 0) + (unreadCoaching || 0);

  return (
    <div className="space-y-1">
      <SidebarLink
        to="/agent/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/agent/recognition"
        icon={Trophy}
        label="Recognition Wall"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/agent/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/agent/courses"
        icon={Book}
        label="Courses"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/agent/coaching"
        icon={NotebookTabs}
        label="Coaching"
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
          to={`agent/createoffense`}
          icon={List}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/agent/offenses`}
          icon={GalleryVerticalEnd}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnread : 0}
        />
      </CustomCollapse>
      <SidebarLink
        to="/agent/ticket"
        icon={Ticket}
        label="Ticket"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/agent/apply-leave"
        icon={CalendarPlus}
        label="Apply Leave"
        isCollapsed={isCollapsed}
      />
      {/* <SidebarLink
        to="/agent/courses"
        icon={Video}
        label="Video Courses"
        isCollapsed={isCollapsed}
      /> */}
    </div>
  );
};

export default AgentSidebar;
