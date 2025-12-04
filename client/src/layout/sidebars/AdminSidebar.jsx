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

const AdminSidebar = ({
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
        to="/admin/dashboard"
        icon={LayoutGrid}
        label="Dashboard"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin/recognition"
        icon={Trophy}
        label="Recognition Wall"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin/attendance"
        icon={Bell}
        label="Attendance"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin/schedule"
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
          to={`/admin/tracking/list`}
          icon={List}
          label="List"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/admin/tracking/history`}
          icon={GalleryVerticalEnd}
          label="History"
          isCollapsed={isCollapsed}
        />
      </CustomCollapse>

      <SidebarLink
        to="/admin/monitoring"
        icon={Activity}
        label="Monitoring"
        isCollapsed={isCollapsed}
      />

      <SidebarLink
        to="/admin/announcement"
        icon={Megaphone}
        label="Announcement"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to="/admin/ticket"
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
          to={`/admin/createoffense`}
          icon={List}
          label="Create Offense"
          isCollapsed={isCollapsed}
        />
        <SidebarLink
          to={`/admin/offenses`}
          icon={GalleryVerticalEnd}
          label="My Offenses"
          isCollapsed={isCollapsed}
          badge={!isCollapsed ? totalUnread : 0}
        />
      </CustomCollapse>

      <SidebarLink
        to="/admin/account-management"
        icon={Users2Icon}
        label="Account"
        isCollapsed={isCollapsed}
      />
    </div>
  );
};

export default AdminSidebar;
