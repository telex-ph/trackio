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
      <hr className="text-gray-2s00" />
      <SidebarItems className="pt-4">
        <SidebarItemGroup>
          <SidebarItem icon={BiSolidDashboard}>
            <NavLink to={"/dashboard"}>Dashboard</NavLink>
          </SidebarItem>
          <SidebarCollapse icon={BiSolidBookOpen} label="Attendance">
            <SidebarItem href="#">
              <NavLink to={"/attendance/basic-logs"}>Basic Logs</NavLink>
            </SidebarItem>
            <SidebarItem>
              <NavLink to={"/attendance/late"}>Late</NavLink>
            </SidebarItem>
            <SidebarItem>
              <NavLink to={"/attendance/overtime"}>Overtime</NavLink>
            </SidebarItem>
            <SidebarItem>
              <NavLink to={"/attendance/undertime"}>Undertime</NavLink>
            </SidebarItem>
          </SidebarCollapse>
          <SidebarItem icon={BiSolidBell}>
            <NavLink to={"/schedule"}>Schedule</NavLink>
          </SidebarItem>
          <SidebarItem icon={BiSolidBookBookmark}>
            <NavLink to={"/performance"}>Performance</NavLink>
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Side>
  );
};
