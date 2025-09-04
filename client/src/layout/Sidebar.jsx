import { NavLink } from "react-router-dom";
import {
  Sidebar as Side,
  SidebarCollapse,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { LayoutGrid, BookOpenText, Bell, NotebookTabs } from "lucide-react";
import { useStore } from "../store/useStore";
import Role from "../enum/roles.enum";

// Agent Sidebar
const AgentSidebar = ({ isCollapsed }) => {
  return (
    <SidebarItemGroup>
      <NavLink
        to="/agent/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <LayoutGrid
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Dashboard</span>}
      </NavLink>

      <NavLink
        to="/agent/attendance"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <Bell
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Attendance/Logs</span>}
      </NavLink>

      <NavLink
        to="/agent/coaching"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <NotebookTabs
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Meeting/Coaching</span>}
      </NavLink>
    </SidebarItemGroup>
  );
};

// Team Leader Sidebar
const TeamLeaderSidebar = ({ isCollapsed }) => {
  return (
    <SidebarItemGroup>
      <NavLink
        to="/team-leader/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <LayoutGrid
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Dashboard</span>}
      </NavLink>

      <SidebarCollapse
        icon={() => (
          <BookOpenText
            className={`transition-all duration-300 ${
              isCollapsed ? "w-7 h-7 ml-0" : "w-5 h-5 ml-1"
            }`}
          />
        )}
        label={!isCollapsed ? "Attendance" : ""}
      >
        <NavLink
          to="/team-leader/attendance/basic-logs"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Basic Logs
        </NavLink>
        <NavLink
          to="/team-leader/attendance/late"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Late
        </NavLink>
        <NavLink
          to="/team-leader/attendance/overtime"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Overtime
        </NavLink>
        <NavLink
          to="/team-leader/attendance/undertime"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
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
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <Bell
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Schedule</span>}
      </NavLink>

      <NavLink
        to="/team-leader/performance"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <NotebookTabs
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Performance</span>}
      </NavLink>
    </SidebarItemGroup>
  );
};

// Admin Sidebar
const AdminSidebar = ({ isCollapsed }) => {
  return (
    <SidebarItemGroup>
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <LayoutGrid
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Dashboard</span>}
      </NavLink>

      <SidebarCollapse
        icon={() => (
          <BookOpenText
            className={`transition-all duration-300 ${
              isCollapsed ? "w-7 h-7 ml-0" : "w-5 h-5 ml-1"
            }`}
          />
        )}
        label={!isCollapsed ? "Tracking" : ""}
      >
        <NavLink
          to="/admin/tracking/time-in"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Time In
        </NavLink>
        <NavLink
          to="/admin/tracking/time-out"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Time Out
        </NavLink>
        <NavLink
          to="/admin/tracking/absentees"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Absentees
        </NavLink>
        <NavLink
          to="/admin/tracking/employee-status"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-lg ${
              isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
            }`
          }
        >
          Employee Status
        </NavLink>
      </SidebarCollapse>

      <SidebarCollapse
        icon={() => (
          <BookOpenText
            className={`transition-all duration-300 ${
              isCollapsed ? "w-7 h-7 ml-0" : "w-5 h-5 ml-1"
            }`}
          />
        )}
        label={!isCollapsed ? "Monitoring" : ""}
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
                isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
              }`
            }
          >
            {!isCollapsed && label}
          </NavLink>
        ))}
      </SidebarCollapse>

      <NavLink
        to="/admin/history"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <Bell
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>History</span>}
      </NavLink>

      <NavLink
        to="/admin/schedule"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg ${
            isActive ? "bg-[#B37C7C] text-white" : "text-gray-700"
          }`
        }
      >
        <NotebookTabs
          className={`transition-all duration-300 ${
            isCollapsed ? "w-7 h-7" : "w-5 h-5"
          }`}
        />
        {!isCollapsed && <span>Schedule</span>}
      </NavLink>
    </SidebarItemGroup>
  );
};

// Sidebar Component
export const Sidebar = ({ isCollapsed }) => {
  const user = useStore((state) => state.user);

  const displaySidebar = () => {
    switch (user.role) {
      case Role.AGENT:
        return <AgentSidebar isCollapsed={isCollapsed} />;
      case Role.TEAM_LEADER:
        return <TeamLeaderSidebar isCollapsed={isCollapsed} />;
      case Role.ADMIN:
        return <AdminSidebar isCollapsed={isCollapsed} />;
      default:
        return <></>;
    }
  };

  return (
    <aside
      className={`flex flex-col h-full justify-between bg-[#ffffff] overflow-x-hidden transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <Side collapsed={isCollapsed}>
        <SidebarItems>{displaySidebar()}</SidebarItems>
      </Side>

      {!isCollapsed && (
        <section className="bg-white border border-gray-200 m-2 p-2 text-center rounded-md">
          <p className="font-bold">Shift Schedule:</p>
          <p className="text-gray-600">9:00 AM - 6:00 PM</p>
        </section>
      )}
    </aside>
  );
};
