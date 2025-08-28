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
import {
  BiSolidDashboard,
  BiSolidBookOpen,
  BiSolidBell,
  BiSolidBookBookmark,
} from "react-icons/bi";
import { IoIosArrowDropleftCircle } from "react-icons/io";

export const Sidebar = () => {
  return (
    <Side>
      <div className="flex items-start justify-center gap-2 pb-4 relative">
        <img src={eye} alt="Eye" className="w-8 h-auto" />
        <img src={peeply} alt="Peeply" className="w-28 h-auto" />
        <IoIosArrowDropleftCircle className="size-7 text-[#470905bc] absolute  right-0" />
      </div>
      <hr className="text-gray-200" />
      <SidebarItems className="pt-4">
        <SidebarItemGroup>
          <SidebarItem icon={BiSolidDashboard}>
            <NavLink to={"/dashboard"}>Dashboard</NavLink>
          </SidebarItem>
          <SidebarCollapse icon={BiSolidBookOpen} label="Attendance">
            <SidebarItem href="#">Basic Logs</SidebarItem>
            <SidebarItem>Late</SidebarItem>
            <SidebarItem>Overtime</SidebarItem>
            <SidebarItem>Undertime</SidebarItem>
          </SidebarCollapse>
          <SidebarItem icon={BiSolidBell}>
            <NavLink to={"/tracking"}>Schedule</NavLink>
          </SidebarItem>
          <SidebarItem icon={BiSolidBookBookmark}>
            <NavLink to={"/tracking"}>Performance</NavLink>
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Side>
  );
};
