import React from "react";
import { ChevronDown } from "lucide-react";

const CustomCollapse = ({
  icon,
  label,
  children,
  isCollapsed,
  open,
  onToggle,
  badge,
}) => {
  return (
    <div className="flex flex-col w-full">
      <button
        onClick={onToggle}
        className={`flex items-center ${
          isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2"
        } rounded-lg transition-colors duration-200 w-full`}
      >
        <div className="flex items-center gap-2 relative">
          {React.cloneElement(icon, {
            className: "w-4 h-4 flex-shrink-0",
          })}

          {isCollapsed && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
          )}

          {!isCollapsed && <span className="font-medium">{label}</span>}
          {!isCollapsed && !open && badge > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </button>

      <div
        className={`flex flex-col overflow-hidden transition-all duration-300 ${
          !isCollapsed && "pl-3"
        } ${open ? "max-h-screen mt-1" : "max-h-0"}`}
      >
        {children}
      </div>
    </div>
  );
};

export default CustomCollapse;
