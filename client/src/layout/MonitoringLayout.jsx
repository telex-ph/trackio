import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ChevronRight,
  UserCheck,
  Coffee,
  Sun,
  Moon,
  Video,
} from "lucide-react";

const MonitoringLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const monitoringIndex = segments.indexOf("monitoring");
    let tab = monitoringIndex !== -1 ? segments[monitoringIndex + 1] : null;

    if (tab) {
      tab = tab
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    setActiveTab(tab);
  }, [location]);

  return (
    <div>
      {/* Page Header */}
      <section className="flex flex-col gap-2 items-start lg:flex-row lg:items-center lg:justify-between mb-2">
        <div className="basis-2/5">
          <div className="flex items-center gap-1">
            <h2>Monitoring</h2> <ChevronRight className="w-6 h-6" />
            <h2>{activeTab || ""}</h2>
          </div>
          <p className="text-light">
            Monitor employee within the selected date range.
          </p>
        </div>

        <nav className="flex gap-2 justify-end flex-1">
          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="status"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="on-break"
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">On Break</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="on-lunch"
          >
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">On Lunch</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="bio-break"
          >
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Bio Break</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="meeting"
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Meeting</span>
          </NavLink>
        </nav>
      </section>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MonitoringLayout;
