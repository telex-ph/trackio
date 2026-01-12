import React from "react";
import {
  ChevronRight,
  UserCheck,
  Coffee,
  Moon,
  Video,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "../store/useStore";
import SharedMonitoring from "../pages/shared/SharedMonitoring";
import MONITORING_PAGES from "../constants/monitoringSubPages";
import formatPathName from "../utils/formatPathName";
import live from "../assets/shapes/live.png";

const MonitoringLayout = () => {
  const monitorPage = useStore((state) => state.monitorPage);
  const setMonitorPage = useStore((state) => state.setMonitorPage);

  const navItems = [
    { id: MONITORING_PAGES.STATUS, label: "Status", icon: UserCheck },
    { id: MONITORING_PAGES.ONBREAK, label: "On Break", icon: Coffee },
    { id: MONITORING_PAGES.BIOBREAK, label: "Bio Break", icon: Moon },
    { id: MONITORING_PAGES.MEETING, label: "Meeting", icon: Video },
  ];

  return (
    <div className="w-full overflow-hidden">
      {/* Page Header */}
      <section className="flex flex-col gap-2 items-start lg:flex-row lg:items-center lg:justify-between mb-2 p-1 lg:p-4">
        <div className="basis-2/5">
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold text-black uppercase tracking-tight">Monitoring</h2>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-[#800000] uppercase tracking-tight">
              {formatPathName(monitorPage) || ""}
            </h2>
          </div>
          <p className="text-[11px] text-gray-500 font-medium mt-1 leading-none">
            Monitor employee within the selected date range.
          </p>
        </div>

        {/* Navigation Section - Exactly same as Time In / Time Out Layout */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center bg-[#F8F9FA] p-0.5 rounded-lg border border-gray-200 shadow-sm flex-wrap lg:flex-nowrap justify-end">
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = monitorPage === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setMonitorPage(item.id)}
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

          {/* Live Button style kept consistent with the compact height */}
          <div
            onClick={() => window.open("/live-monitoring", "_blank")}
            className="group flex items-center gap-2 bg-white border border-gray-200 py-0.5 pl-1 pr-3 rounded-lg hover:border-[#800000] transition-all duration-300 shadow-sm cursor-pointer"
          >
            <div className="bg-gray-50 rounded-md p-0.5">
              <img src={live} alt="Live" className="h-6 w-auto object-contain" />
            </div>
            <div className="hidden md:flex flex-col justify-center border-l border-gray-100 pl-2 h-6">
               <span className="text-[8px] font-black text-gray-900 uppercase">Live View</span>
            </div>
          </div>
        </div>
      </section>

      <main className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <SharedMonitoring />
      </main>
    </div>
  );
};

export default MonitoringLayout;
