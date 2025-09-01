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
        <SidebarItemGroup>
          <SidebarItem icon={LayoutGrid} as={NavLink} to="dashboard">
            Dashboard
          </SidebarItem>

          <SidebarCollapse icon={BookOpenText} label="Attendance">
            <SidebarItem as={NavLink} to="attendance/basic-logs">
              Basic Logs
            </SidebarItem>
            <SidebarItem as={NavLink} to="attendance/late">
              Late
            </SidebarItem>
            <SidebarItem as={NavLink} to="attendance/overtime">
              Overtime
            </SidebarItem>
            <SidebarItem as={NavLink} to="attendance/undertime">
              Undertime
            </SidebarItem>
          </SidebarCollapse>

          <SidebarItem icon={Bell} as={NavLink} to="schedule">
            Schedule
          </SidebarItem>

          <SidebarItem icon={NotebookTabs} as={NavLink} to="performance">
            Performance
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Side>
  );
};
