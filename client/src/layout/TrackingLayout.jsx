import {
  AlarmClockCheck,
  Clock,
  AlertTriangle,
  Coffee,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import TRACKING_PAGES from "../constants/trackingSubPages";
import formatPathName from "../utils/formatPathName";

const TrackingLayout = ({ role }) => {
  const { pathname } = useLocation();
  const page = pathname.split("/").pop();

  const trackPage = useStore((state) => state.trackPage);
  const setTrackPage = useStore((state) => state.setTrackPage);

  const navItems = [
    { id: TRACKING_PAGES.TIMEIN, label: "Time In", icon: AlarmClockCheck },
    { id: TRACKING_PAGES.TIMEOUT, label: "Time Out", icon: Clock },
    { id: TRACKING_PAGES.LATE, label: "Late", icon: AlertTriangle },
    { id: TRACKING_PAGES.UNDERTIME, label: "Undertime", icon: Coffee },
    { id: TRACKING_PAGES.ABSENTEES, label: "Absentees", icon: UserCheck },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Page Header */}
      <section className="flex flex-col gap-2 items-start lg:flex-row lg:items-center lg:justify-between mb-2">
        <div className="basis-2/5">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold">{page.charAt(0).toUpperCase() + page.slice(1)}</h2>{" "}
            {page == "list" && (
              <>
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-[#800000]">{formatPathName(trackPage) || ""}</h2>
              </>
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            View employee attendance for the selected date range.
          </p>
        </div>

        {/* Navigation Section - Compact & No Scrollbar */}
        {page == "list" && (
          <nav className="flex items-center bg-[#F8F9FA] p-0.5 rounded-lg border border-gray-200 shadow-sm flex-wrap lg:flex-nowrap justify-end">
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = trackPage === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setTrackPage(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-300 font-bold text-[9px] uppercase tracking-wider cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#800000] text-white shadow-sm scale-105 z-10"
                        : "text-[#547594] hover:text-[#800000] hover:bg-white"
                    }`}
                  >
                    <Icon
                      className={`w-3 h-3 transition-colors ${
                        isActive ? "text-white" : "text-gray-400"
                      }`}
                    />
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </nav>
        )}
      </section>

      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default TrackingLayout;
