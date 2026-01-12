import { useEffect, useState, useRef, memo } from "react";
import { DateTime } from "luxon";
import api from "../utils/axios";
import {
  Clock,
} from "lucide-react";

const WorkingTime = ({ timeIn, timeOut }) => {
  const [time, setTime] = useState({});
  const [offset, setOffset] = useState(0);
  const intervalRef = useRef(null);
  const lastSyncRef = useRef(Date.now());

  const target = DateTime.fromISO(timeIn, { zone: "utc" }).setZone(
    "Asia/Manila"
  );
  const end = timeOut
    ? DateTime.fromISO(timeOut, { zone: "utc" }).setZone("Asia/Manila")
    : null;

  // 🕒 Sync offset once initially
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const { data } = await api.get("/server/server-time");
        const serverNow = DateTime.fromISO(data.now, { zone: "utc" });
        const clientNow = DateTime.now().setZone("utc");
        const diff = serverNow.toMillis() - clientNow.toMillis();
        setOffset(diff);
        lastSyncRef.current = Date.now();
      } catch (err) {
        console.error("Failed to fetch server time:", err);
      }
    };

    fetchServerTime();
  }, []);

  // Main ticking + periodic resync logic
  useEffect(() => {
    const tick = async () => {
      try {
        const now = end
          ? end
          : DateTime.now()
              .plus({ milliseconds: offset })
              .setZone("Asia/Manila");

        const diff = now
          .diff(target, ["days", "hours", "minutes", "seconds"])
          .toObject();

        setTime(diff);

        if (Date.now() - lastSyncRef.current >= 30000) {
          const { data } = await api.get("/server/server-time");
          const serverNow = DateTime.fromISO(data.now, { zone: "utc" });
          const clientNow = DateTime.now().setZone("utc");
          const diff = serverNow.toMillis() - clientNow.toMillis();
          setOffset(diff);
          lastSyncRef.current = Date.now();
        }
      } catch (err) {
        console.error("Failed to sync with server:", err);
      }
    };

    tick(); // run immediately once
    intervalRef.current = setInterval(tick, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timeIn, timeOut, offset]);

  const formatTime = (num) => String(Math.floor(num || 0)).padStart(2, "0");

return (
    <section className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white border-l-4 border-l-[#800000] border-y border-r border-slate-200 shadow-sm overflow-hidden w-full h-full">
      
      {/* Label Section - Formal Slate Background */}
      <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border-r border-slate-200 min-w-[240px]">
        <div className="flex items-center justify-center w-10 h-10 bg-[#800000] text-white rounded-sm">
          <Clock size={20} strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#800000] uppercase">Attendance System</span>
          <h2 className="text-base font-bold text-slate-800 leading-none">Working Hours</h2>
        </div>
      </div>

      {/* Timer Section - Clean White Background */}
      <div className="flex flex-1 items-center justify-around sm:justify-start sm:gap-12 px-8 py-4">
        
        {/* Hours */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-slate-900 tabular-nums">
              {formatTime(time.hours)}
            </span>
            <span className="text-xs font-bold text-slate-400">H</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Hours</p>
        </div>

        {/* Separator Line */}
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

        {/* Minutes */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-light text-slate-900 tabular-nums">
              {formatTime(time.minutes)}
            </span>
            <span className="text-xs font-bold text-slate-400">M</span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Minutes</p>
        </div>

        {/* Separator Line */}
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

        {/* Seconds - Accent Highlight */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#800000] tabular-nums">
              {formatTime(time.seconds)}
            </span>
            <span className="text-xs font-bold text-[#800000]/60">S</span>
          </div>
          <p className="text-[9px] font-bold text-[#800000]/60 uppercase">Seconds</p>
        </div>

      </div>

      {/* Status Badge - Optional Formal Element */}
      <div className="hidden lg:flex items-center px-6 border-l border-slate-100">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase">Active</span>
        </div>
      </div>

    </section>
  );
};

export default memo(WorkingTime);