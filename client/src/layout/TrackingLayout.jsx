import {
  AlarmClockCheck,
  Clock,
  AlertTriangle,
  Coffee,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { useStore } from "../store/useStore";
import TRACKING_PAGES from "../constants/trackingSubPages";

const TrackingLayout = () => {
  const trackPage = useStore((state) => state.trackPage);
  const setTrackPage = useStore((state) => state.setTrackPage);

  return (
    <div>
      {/* Page Header */}
      <section className="flex flex-col gap-2 items-start lg:flex-row lg:items-center lg:justify-between mb-2">
        <div className="basis-2/5">
          <div className="flex items-center gap-1">
            <h2>Tracking</h2> <ChevronRight className="w-6 h-6" />
            <h2>{trackPage || ""}</h2>
          </div>
          <p className="text-light">
            View employee attendance for the selected date range.
          </p>
        </div>
        <main>
          <nav className="flex gap-2 justify-end flex-1">
            <div
              className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
                trackPage === TRACKING_PAGES.TIMEIN && "underline"
              }`}
              onClick={() => setTrackPage(TRACKING_PAGES.TIMEIN)}
            >
              <AlarmClockCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Time In</span>
            </div>

            <div
              className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
                trackPage === TRACKING_PAGES.TIMEOUT && "underline"
              }`}
              onClick={() => setTrackPage(TRACKING_PAGES.TIMEOUT)}
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Time Out</span>
            </div>

            <div
              className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
                trackPage === TRACKING_PAGES.LATE && "underline"
              }`}
              onClick={() => setTrackPage(TRACKING_PAGES.LATE)}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Late</span>
            </div>

            <div
              className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
                trackPage === TRACKING_PAGES.UNDERTIME && "underline"
              }`}
              onClick={() => setTrackPage(TRACKING_PAGES.UNDERTIME)}
            >
              <Coffee className="h-4 w-4" />
              <span className="hidden sm:inline">Undertime</span>
            </div>

            <div
              className={`flex px-4 py-2 rounded-md items-center text-black gap-2 bg-white border-light cursor-pointer ${
                trackPage === TRACKING_PAGES.ABSENTEES && "underline"
              }`}
              onClick={() => setTrackPage(TRACKING_PAGES.ABSENTEES)}
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Absentees</span>
            </div>
          </nav>
        </main>
      </section>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default TrackingLayout;
