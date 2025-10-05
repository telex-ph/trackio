import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  ChevronRight,
  UserCheck,
  Coffee,
  Sun,
  Moon,
  Video,
} from "lucide-react";
import { useStore } from "../store/useStore";
import SharedMonitoring from "../pages/shared/SharedMonitoring";
import MONITORING_PAGES from "../constants/monitoringSubPages";

const MonitoringLayout = () => {
  const monitorPage = useStore((state) => state.monitorPage);
  const setMonitorPage = useStore((state) => state.setMonitorPage);

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
      {/* monitorPage Header */}
      <section className="flex flex-col gap-2 items-start lg:flex-row lg:items-center lg:justify-between mb-2">
        <div className="basis-2/5">
          <div className="flex items-center gap-1">
            <h2>Monitoring</h2> <ChevronRight className="w-6 h-6" />
            <h2>{monitorPage || ""}</h2>
          </div>
          <p className="text-light">
            Monitor employee within the selected date range.
          </p>
        </div>

        <nav className="flex gap-2 justify-end flex-1">
          <div
            className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
              monitorPage === MONITORING_PAGES.STATUS && "underline"
            }`}
            onClick={() => setMonitorPage(MONITORING_PAGES.STATUS)}
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </div>

          <div
            className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
              monitorPage === MONITORING_PAGES.ONBREAK && "underline"
            }`}
            onClick={() => setMonitorPage(MONITORING_PAGES.ONBREAK)}
          >
            <Coffee className="h-4 w-4" />
            <span className="hidden sm:inline">On Break</span>
          </div>

          <div
            className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
              monitorPage === MONITORING_PAGES.ONLUNCH && "underline"
            }`}
            onClick={() => setMonitorPage(MONITORING_PAGES.ONLUNCH)}
          >
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">On Lunch</span>
          </div>

          <div
            className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
              monitorPage === MONITORING_PAGES.BIOBREAK && "underline"
            }`}
            onClick={() => setMonitorPage(MONITORING_PAGES.BIOBREAK)}
          >
            <Moon className="h-4 w-4" />
            <span className="hidden sm:inline">Bio Break</span>
          </div>

          <div
            className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
              monitorPage === MONITORING_PAGES.MEETING && "underline"
            }`}
            onClick={() => setMonitorPage(MONITORING_PAGES.MEETING)}
          >
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Meeting</span>
          </div>
        </nav>
      </section>

      <main>
        <SharedMonitoring />
      </main>
    </div>
  );
};

export default MonitoringLayout;
