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
import SidebarLink from "./SidebarLink";
import CustomCollapse from "./CustomCollapse";

// Admin Sidebar
const ComplianceSidebar = ({
  isCollapsed,
  activeDropdown,
  setActiveDropdown,
  unreadOffenses
}) => (
  <div className="space-y-1">
    <SidebarLink
      to="/compliance/dashboard"
      icon={LayoutGrid}
      label="Dashboard"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance/recognition"
      icon={Trophy}
      label="Recognition Wall"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance/attendance"
      icon={Bell}
      label="Attendance"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance/schedule"
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
        to={`/compliance/tracking/list`}
        icon={List}
        label="List"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/compliance/tracking/history`}
        icon={GalleryVerticalEnd}
        label="History"
        isCollapsed={isCollapsed}
      />
    </CustomCollapse>

    <SidebarLink
      to="/compliance/monitoring"
      icon={Activity}
      label="Monitoring"
      isCollapsed={isCollapsed}
    />
    {/* <SidebarLink
      to="/compliance/offences"
      icon={Calendar}
      label="Employee Offenses"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance/agentrequest"
      icon={BookPlus}
      label="Employee Request"
      isCollapsed={isCollapsed}
    /> */}
    <SidebarLink
      to="/compliance/announcement"
      icon={Megaphone}
      label="Announcement"
      isCollapsed={isCollapsed}
    />
    <SidebarLink
      to="/compliance/ticket"
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
      badge={unreadOffenses}
    >
      <SidebarLink
        to={`/compliance/createoffense`}
        icon={List}
        label="Create Offense"
        isCollapsed={isCollapsed}
      />
      <SidebarLink
        to={`/compliance/offenses`}
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
    <SidebarLink
      to="/compliance/account-management"
      icon={Users2Icon}
      label="Account"
      isCollapsed={isCollapsed}
    />
  </div>
);

export default ComplianceSidebar;
