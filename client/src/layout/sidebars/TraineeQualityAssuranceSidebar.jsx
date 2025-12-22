import {
  LayoutGrid,
  Trophy,
  Bell,
  NotebookTabs,
  Clock,
  List,
  GalleryVerticalEnd,
  Ticket,
  Book,
  AlertTriangle,
  PlusCircle,
  FileText,
} from "lucide-react";
import SidebarLink from "./SidebarLink";
import CustomCollapse from "./CustomCollapse";

const TraineeQualityAssuranceSidebar = ({
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
          to={`trainer-quality-assurance/createoffense`}
          icon={PlusCircle}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/trainer-quality-assurance/offenses`}
          icon={FileText}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadMyOffenses : 0}
        />
      </CustomCollapse>
      <SidebarLink
        to="/trainer-quality-assurance/ticket"
        icon={Ticket}
        label="Ticket"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/trainer-quality-assurance/courses"
        icon={Book}
        label="Courses"
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default TraineeQualityAssuranceSidebar;
