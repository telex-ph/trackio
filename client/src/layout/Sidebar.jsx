import { NavLink } from "react-router-dom";
import {
  Sidebar as Side,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { LayoutGrid, BookOpenText, Bell, NotebookTabs } from "lucide-react";
import { useStore } from "../store/useStore";
import Role from "../enum/roles.enum";

const AgentSidebar = () => {
  return (
    <SidebarItemGroup>
      <NavLink
        to="/agent/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <LayoutGrid className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/agent/attendance"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <Bell className="w-5 h-5" />
        <span>Attendance</span>
      </NavLink>

      <NavLink
        to="/agent/coaching"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <NotebookTabs className="w-5 h-5" />
        <span>Coaching</span>
      </NavLink>
    </SidebarItemGroup>
  );
};

const TeamLeaderSidebar = () => {
  return (
    <SidebarItemGroup>
      <NavLink
        to="/team-leader/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <LayoutGrid className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>

      <SidebarCollapse
        icon={() => <BookOpenText className="w-5 h-5 ml-1" />}
        label="Attendance"
      >
        <NavLink
          to="/team-leader/attendance/basic-logs"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Basic Logs
        </NavLink>
        <NavLink
          to="/team-leader/attendance/late"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Late
        </NavLink>
        <NavLink
          to="/team-leader/attendance/overtime"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Overtime
        </NavLink>
        <NavLink
          to="/team-leader/attendance/undertime"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Undertime
        </NavLink>
      </SidebarCollapse>

      <NavLink
        to="/team-leader/schedule"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <Bell className="w-5 h-5" />
        <span>Schedule</span>
      </NavLink>

      <NavLink
        to="/team-leader/performance"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <NotebookTabs className="w-5 h-5" />
        <span>Performance</span>
      </NavLink>
    </SidebarItemGroup>
  );
};

const AdminSidebar = () => {
  return (
    <SidebarItemGroup>
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <LayoutGrid className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>

      <SidebarCollapse
        icon={() => <BookOpenText className="w-5 h-5 ml-1" />}
        label="Tracking"
      >
        <NavLink
          to="/admin/tracking/time-in"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Time In
        </NavLink>
        <NavLink
          to="/admin/tracking/time-out"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Time Out
        </NavLink>
        <NavLink
          to="/admin/tracking/absentees"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Absentees
        </NavLink>
        <NavLink
          to="/admin/tracking/employee-status"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive
                ? "bg-[#B37C7C] text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          Employee Status
        </NavLink>
      </SidebarCollapse>

      <SidebarCollapse
        icon={() => <BookOpenText className="w-5 h-5 ml-1" />}
        label="Monitoring"
      >
        {[
          ["late", "Late"],
          ["on-break", "On Break"],
          ["on-lunch", "On Lunch"],
          ["undertime", "Undertime"],
          ["bio-break", "Bio Break"],
          ["meeting", "Meeting"],
        ].map(([path, label]) => (
          <NavLink
            key={path}
            to={`/admin/monitoring/${path}`}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive
                  ? "bg-[#B37C7C] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </SidebarCollapse>

      <NavLink
        to="/admin/history"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <Bell className="w-5 h-5" />
        <span>History</span>
      </NavLink>

      <NavLink
        to="/admin/schedule"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive
              ? "bg-[#B37C7C] text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        <NotebookTabs className="w-5 h-5" />
        <span>Schedule</span>
      </NavLink>
    </SidebarItemGroup>
  );
};

export const Sidebar = () => {
  const user = useStore((state) => state.user);

  // Display the sidebar base on the role
  const displaySidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        return <AgentSidebar />;
      case Role.TEAM_LEADER:
        return <TeamLeaderSidebar />;
      case Role.ADMIN:
        return <AdminSidebar />;
      default:
        return <></>;
    }
  };

  return (
    <aside className="flex flex-col h-full justify-between container-light overflow-x-hidden">
      <Side>
        <SidebarItems>
          {/* Agents' Sidebar */}
          {/* <AgentSidebar /> */}
          {/* Team Leaders' Sidebar */}
          {/* <TeamLeaderSidebar /> */}
          {/* Admin' Sidebar */}
          {/* <AdminSidebar /> */}
          {displaySidebar()}
        </SidebarItems>
      </Side>
      <section className="bg-white border-light m-5 p-4 text-center rounded-md">
        <p className="font-bold">Shift Schedule:</p>
        <p className="text-light">9:00 AM. - 6:00 PM.</p>
      </section>
    </aside>
  );
};
