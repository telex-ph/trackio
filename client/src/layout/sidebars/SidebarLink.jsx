import { NavLink } from "react-router-dom";

const SidebarLink = ({ to, icon: Icon, label, isCollapsed, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center ${
        isCollapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2"
      } 
      rounded-md transition-colors duration-200 ${
        isActive
          ? "bg-(--primary-color) text-white"
          : "text-black hover:bg-gray-100"
      }`
    }
  >
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </div>

    {badge ? (
      isCollapsed ? (
        <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
      ) : (
        <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )
    ) : null}
  </NavLink>
);

export default SidebarLink;
