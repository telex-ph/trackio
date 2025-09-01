import { NavLink } from "react-router-dom";
import peeply from "../assets/logos/peeply.svg";
import eye from "../assets/logos/eye.svg";
import {
  Sidebar as Side,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { LayoutGrid, BookOpenText, Bell, NotebookTabs } from "lucide-react";

const AgentSidebar = () => {
  return (
    <SidebarItemGroup>
      <SidebarItem icon={LayoutGrid} as={NavLink} to="/agent/dashboard">
        Dashboard
      </SidebarItem>

      <SidebarItem icon={Bell} as={NavLink} to="/agent/attendance">
        Attendance
      </SidebarItem>

      <SidebarItem icon={NotebookTabs} as={NavLink} to="/agent/coaching">
        Coaching
      </SidebarItem>
    </SidebarItemGroup>
  );
};

const TeamLeaderSidebar = () => {
  return (
    <SidebarItemGroup>
      <SidebarItem icon={LayoutGrid} as={NavLink} to="/team-leader/dashboard">
        Dashboard
      </SidebarItem>

      <SidebarCollapse icon={BookOpenText} label="Attendance">
        <SidebarItem as={NavLink} to="/team-leader/attendance/basic-logs">
          Basic Logs
        </SidebarItem>
        <SidebarItem as={NavLink} to="/team-leader/attendance/late">
          Late
        </SidebarItem>
        <SidebarItem as={NavLink} to="/team-leader/attendance/overtime">
          Overtime
        </SidebarItem>
        <SidebarItem as={NavLink} to="/team-leader/attendance/undertime">
          Undertime
        </SidebarItem>
      </SidebarCollapse>

      <SidebarItem icon={Bell} as={NavLink} to="/team-leader/schedule">
        Schedule
      </SidebarItem>

      <SidebarItem
        icon={NotebookTabs}
        as={NavLink}
        to="/team-leader/performance"
      >
        Performance
      </SidebarItem>
    </SidebarItemGroup>
  );
};

const AdminSidebar = () => {
  return (
    <SidebarItemGroup>
      <SidebarItem icon={LayoutGrid} as={NavLink} to="/admin/dashboard">
        Dashboard
      </SidebarItem>

      <SidebarCollapse icon={BookOpenText} label="Tracking">
        <SidebarItem as={NavLink} to="/admin/tracking/time-in">
          Time In
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/tracking/time-out">
          Time Out
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/tracking/absentees">
          Absentees
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/tracking/employee-status">
          Employee Status
        </SidebarItem>
      </SidebarCollapse>

      <SidebarCollapse icon={BookOpenText} label="Monitoring">
        <SidebarItem as={NavLink} to="/admin/monitoring/late">
          Late
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/monitoring/on-break">
          On Break
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/monitoring/on-lunch">
          On Lunch
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/monitoring/undertime">
          Undertime
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/monitoring/bio-break">
          Bio Break
        </SidebarItem>
        <SidebarItem as={NavLink} to="/admin/monitoring/meeting">
          Meeting
        </SidebarItem>
      </SidebarCollapse>

      <SidebarItem icon={Bell} as={NavLink} to="/admin/history">
        History
      </SidebarItem>

      <SidebarItem icon={NotebookTabs} as={NavLink} to="/admin/schedule">
        Schedule
      </SidebarItem>
    </SidebarItemGroup>
  );
};

export const Sidebar = () => {
  return (
    <Side>
      <div className="flex items-start justify-center gap-2 pb-4 relative">
        <img src={eye} alt="Eye" className="w-8 h-auto" />
        <img src={peeply} alt="Peeply" className="w-28 h-auto" />
        <IoIosArrowDropleftCircle className="size-7 text-[#470905bc] absolute  right-0" />
      </div>
      <hr className="text-gray-2s00" />
      <SidebarItems className="pt-4">
        {/* Agents' Sidebar */}
        <AgentSidebar />
        {/* Team Leaders' Sidebar */}
        <TeamLeaderSidebar />
        {/* Admin' Sidebar */}
        <AdminSidebar />
      </SidebarItems>
    </Side>
  );
};
