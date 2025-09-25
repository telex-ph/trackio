import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Logs,
  Clock,
  ClockPlus,
  AlarmClockMinus,
} from "lucide-react";

const AttendanceLayout = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const attendanceIndex = segments.indexOf("attendance");
    let tab = attendanceIndex !== -1 ? segments[attendanceIndex + 1] : null;

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
            <h2>Attendance</h2> <ChevronRight className="w-6 h-6" />
            <h2>{activeTab || ""}</h2>
          </div>
          <p className="text-light">
            View and manage employee attendance within the selected date range.
          </p>
        </div>
        <nav className="flex gap-2 justify-end flex-1">
          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="basic-logs"
          >
            <Logs className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="late"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Late</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="overtime"
          >
            <ClockPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Overtime</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="undertime"
          >
            <AlarmClockMinus className="h-4 w-4" />
            <span className="hidden sm:inline">Undertime</span>
          </NavLink>
        </nav>
      </section>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AttendanceLayout;
