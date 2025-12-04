import {
  LayoutGrid,
  Trophy,
  Bell,
  NotebookTabs,
  Clock,
  List,
  GalleryVerticalEnd,
  Ticket,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import CustomCollapse from "./CustomCollapse";

const TraineeQualityAssuranceSidebar = ({
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
        to="/trainer-quality-assurance/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/trainer-quality-assurance/recognition"
        icon={Trophy}
        label="Recognition Wall"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/trainer-quality-assurance/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/trainer-quality-assurance/coaching"
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
          to={`trainer-quality-assurance/createoffense`}
          icon={List}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/trainer-quality-assurance/offenses`}
          icon={GalleryVerticalEnd}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnread : 0}
        />
      </CustomCollapse>
      <SidebarLink
        to="/trainer-quality-assurance/ticket"
        icon={Ticket}
        label="Ticket"
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default TraineeQualityAssuranceSidebar;
