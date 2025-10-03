import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AlarmClockCheck,
  Clock,
  AlarmClockMinus,
  AlertTriangle,
  Coffee,
  UserCheck,
  ChevronRight,
  Logs,
  ClockPlus,
} from "lucide-react";
import Roles from "../constants/roles";

const TrackingLayout = ({ role }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const trackingIndex = segments.indexOf("tracking");
    let tab = trackingIndex !== -1 ? segments[trackingIndex + 1] : null;

    if (tab) {
      tab = tab
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    setActiveTab(tab);
  }, [location]);

  const generateLinks = () => {
    switch (role) {
      case Roles.ADMIN:
        return (
          <nav className="flex gap-2 justify-end flex-1">
            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/time-in"
            >
              <AlarmClockCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Time In</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/time-out"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Time Out</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/late"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Late</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/undertime"
            >
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Undertime</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/absentees"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Absentees</span>
            </NavLink>
          </nav>
        );
      case Roles.OM:
        return (
          <nav className="flex gap-2 justify-end flex-1">
            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/time-in"
            >
              <AlarmClockCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Time In</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/time-out"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Time Out</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/late"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Late</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/undertime"
            >
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Undertime</span>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/absentees"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Absentees</span>
            </NavLink>
          </nav>
        );

      case Roles.TEAM_LEADER:
        return (
          <nav className="flex gap-2 justify-end flex-1">
            <NavLink
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                  isActive ? "underline" : ""
                }`
              }
              to="list/basic-logs"
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
              to="list/late"
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
              to="list/overtime"
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
              to="list/undertime"
            >
              <AlarmClockMinus className="h-4 w-4" />
              <span className="hidden sm:inline">Undertime</span>
            </NavLink>
          </nav>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <section className="flex flex-col gap-2 items-start lg:flex-row lg:items-center lg:justify-between mb-2">
        <div className="basis-2/5">
          <div className="flex items-center gap-1">
            <h2>Tracking</h2> <ChevronRight className="w-6 h-6" />
            <h2>{activeTab || ""}</h2>
          </div>
          <p className="text-light">
            View employee attendance for the selected date range.
          </p>
        </div>

        {/* <nav className="flex gap-2 justify-end flex-1">
          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="time-in"
          >
            <AlarmClockCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Time In</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="time-out"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Time Out</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="late"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Late</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="undertime"
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">Undertime</span>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `px-4 py-2 rounded-md flex items-center text-black gap-2 bg-white border-light ${
                isActive ? "underline" : ""
              }`
            }
            to="absentees"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Absentees</span>
          </NavLink>
        </nav> */}
        <main>{generateLinks()}</main>
      </section>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TrackingLayout;
