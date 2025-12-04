import {
  LayoutGrid,
  Trophy,
  Bell,
  Clock,
  Megaphone,
  Activity,
  BookPlus,
  List,
  GalleryVerticalEnd,
  Users2Icon,
  Ticket,
} from "lucide-react";
import SidebarLink from "../sidebars/SidebarLink";
import CustomCollapse from "../sidebars/CustomCollapse";

// Admin Sidebar
const AdminHRHeadSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadIR,
}) => {
  return (
    <div className="space-y-1">
      <SidebarLink
        to="/admin-hr-head/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin-hr-head/recognition"
        icon={Trophy}
        label="Recognition Wall"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin-hr-head/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin-hr-head/schedule"
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
          to={`/admin-hr-head/tracking/list`}
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/admin-hr-head/tracking/history`}
          icon={GalleryVerticalEnd}
          label="History"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>

      <SidebarLink
        to="/admin-hr-head/monitoring"
        icon={Activity}
        label="Monitoring"
        isCollapsed={isCollapsed}
      />
      {/* <SidebarLink
      to="/admin-hr-head/offences"
      icon={Calendar}
      label="Employee Offenses"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/admin-hr-head/agentrequest"
      icon={BookPlus}
      label="Employee Request"
      isCollapsed={isCollapsed}
    /> */}
      <SidebarLink
        to="/admin-hr-head/announcement"
        icon={Megaphone}
        label="Announcement"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin-hr-head/team"
        icon={Users2Icon}
        label="Team"
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
          to={`/admin-hr-head/createoffense`}
          icon={List}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/admin-hr-head/offenses`}
          icon={GalleryVerticalEnd}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadIR : 0}
        />
        <SidebarLink
          to={`/admin-hr-head/reported-ir`}
          icon={GalleryVerticalEnd}
          label="Reported IR"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? unreadIR : 0}
        />
      </CustomCollapse>
      <SidebarLink
        to="/admin-hr-head/ticket"
        icon={Ticket}
        label="Ticket"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin-hr-head/account-management"
        icon={Users2Icon}
        label="Account"
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default AdminHRHeadSidebar;
