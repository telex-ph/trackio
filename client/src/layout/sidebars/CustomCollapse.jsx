import React from "react";
import { ChevronDown } from "lucide-react";

const CustomCollapse = ({
  icon,
  label,
  children,
  isCollapsed,
  open,
  onToggle,
}) => {
  return (
    <div className="flex flex-col w-full">
      <button
        onClick={onToggle}
        className={`flex items-center ${
          isCollapsed ? "justify-center px-2 py-3" : "justify-between px-3 py-2"
        } rounded-lg transition-colors duration-200 w-full`}
      >
        <div className="flex items-center gap-2">
          {React.cloneElement(icon, {
            className: `${isCollapsed ? "w-4 h-4" : "w-4 h-4"} flex-shrink-0`,
          })}
          {!isCollapsed && <span className="font-medium">{label}</span>}
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
