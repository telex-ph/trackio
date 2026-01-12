import { useEffect, useState, memo } from "react";
import { DateTime } from "luxon";
import api from "../utils/axios";
import {
  Globe,
} from "lucide-react";

const ServerTime = () => {
  const [time, setTime] = useState(DateTime.now().setZone("Asia/Manila"));
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const { data } = await api.get("/server/server-time");
        const serverNow = DateTime.fromISO(data.now, { zone: "utc" });
        const clientNow = DateTime.now().setZone("utc");
        const diff = serverNow.toMillis() - clientNow.toMillis();
        setOffset(diff);
      } catch (err) {
        console.error("Failed to fetch server time:", err);
      }
    };

    fetchServerTime();
  }, []);

  useEffect(() => {
    const update = () => {
      const now = DateTime.now()
        .plus({ milliseconds: offset })
        .setZone("Asia/Manila");
      setTime(now);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [offset]);

  const hours12 = time.hour % 12 || 12;
  const minutes = String(time.minute).padStart(2, "0");
  const ampm = time.hour >= 12 ? "PM" : "AM";

return (
    <section className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white border-l-4 border-l-[#800000] border-y border-r border-slate-200 shadow-sm overflow-hidden w-full h-full">
      
      {/* Label Section - Formal Gray Background */}
      <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-r border-slate-200 min-w-[240px]">
        <div className="flex items-center justify-center w-10 h-10 bg-[#800000] text-white rounded-sm">
          <Globe size={20} strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#800000] uppercase">Network Status</span>
          <h2 className="text-base font-bold text-slate-800 leading-none">Server Time</h2>
        </div>
      </div>

      {/* Time Display Section */}
      <div className="flex flex-1 items-center justify-around sm:justify-start sm:gap-12 px-8 py-4">
        
        {/* Hours */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-slate-900 tabular-nums">
              {String(hours12).padStart(2, "0")}
            </span>
            <span className="text-xs font-bold text-slate-400">H</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Hours</p>
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

        {/* Minutes */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-slate-900 tabular-nums">
              {minutes}
            </span>
            <span className="text-xs font-bold text-slate-400">M</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Minutes</p>
        </div>

        {/* Separator */}
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

        {/* AM/PM Period - Highlighted in Maroon */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#800000] tabular-nums">
              {ampm}
            </span>
          </div>
          <p className="text-[9px] font-bold text-[#800000]/60 uppercase">Period</p>
        </div>

      </div>

      {/* Sync Status Badge */}
      <div className="hidden lg:flex items-center px-6 border-l border-slate-100">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-[10px] font-bold uppercase">Synced</span>
        </div>
      </div>

    </section>
  );
};

export default memo(ServerTime);