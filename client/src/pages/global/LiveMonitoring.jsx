import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { DateTime, Duration } from "luxon";
import trackio from "../../assets/logos/trackio.svg";
import { STATUS } from "../../constants/status";
import liveMonitoring from "../../assets/background/live-monitoring.png";
import { formatDate } from "../../utils/formatDateTime";

const SOCKET_URL =
  import.meta.env.VITE_API_RENDER_BASE_URL || "http://localhost:3000";

export default function LiveBreaks() {
  const [onBreak, setOnBreaks] = useState([]);
  const [overBreaks, setOverBreaks] = useState([]);
  const [now, setNow] = useState(DateTime.now().setZone("Asia/Manila"));
  const maxBreakTime = 5400000;

  const calculatePercentage = (totalBreakTime = 0, currentBreakStart) => {
    const currentBreak = DateTime.fromISO(currentBreakStart, {
      zone: "Asia/Manila",
    });
    const currentBreakTime = now.diff(currentBreak, "milliseconds").milliseconds;
    const totalBreakDuration = currentBreakTime + totalBreakTime;
    return Math.min((totalBreakDuration / maxBreakTime) * 100, 100);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socket.on("on-break", (onBreak) => setOnBreaks(onBreak));
    socket.on("over-break", (overBreak) => setOverBreaks(overBreak));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now().setZone("Asia/Manila"));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatMilliseconds = (ms) => {
    const totalMinutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const hDisplay = hours > 0 ? `${hours}h ` : "";
    const mDisplay = minutes > 0 ? `${minutes}m` : "0m";
    return `${hDisplay}${mDisplay}`.trim();
  };

  const processRecords = (records) =>
    records
      .map((status) => {
        const breaksCount = status.breaks?.length - 1;
        const lastBreakStart = status.breaks[breaksCount]?.start;
        if (!lastBreakStart) return null;
        const percentage = calculatePercentage(status.totalBreakTime, lastBreakStart);
        const breakDurationMs = status.totalBreakTime + now.toMillis() - DateTime.fromISO(lastBreakStart).toMillis();
        if (isNaN(breakDurationMs)) return null;
        const duration = Duration.fromMillis(breakDurationMs).shiftTo("hours", "minutes");
        const formattedTime = `${Math.floor(duration.hours)}h ${Math.floor(duration.minutes)}m`;
        return { ...status, percentage, formattedTime };
      })
      .filter(Boolean)
      .sort((a, b) => b.percentage - a.percentage);

  const onBreakStatuses = processRecords(onBreak.filter((s) => s.status === STATUS.ON_BREAK));
  const overBreakStatuses = overBreaks.sort((a, b) => b.totalBreakTime - a.totalBreakTime);

  const getStatusColor = (percentage) => {
    if (percentage <= 50) return "bg-green-500";
    if (percentage <= 80) return "bg-orange-500";
    return "bg-red-700";
  };

  const getTextColor = (percentage) => {
    if (percentage <= 50) return "text-green-600";
    if (percentage <= 80) return "text-orange-600";
    return "text-red-700";
  };

  return (
    <section
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(110, 0, 0, 0.97), rgba(30, 0, 0, 0.99)), url(${liveMonitoring})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <header className="w-full bg-black/40 backdrop-blur-md px-8 py-4 flex items-center justify-between shrink-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <img
            src={trackio}
            alt="trackio"
            className="h-7 w-auto brightness-0 invert opacity-100 transition-all"
          />
          <span className="text-white/90 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            Live Monitoring
          </span>
        </div>
       
        <div className="flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-2"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
            System Active
          </span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-6 flex-1 min-h-0">
        <div className="flex-[1.5] flex flex-col min-h-0 bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
            <h2 className="text-sm font-black uppercase text-gray-700 tracking-tight">
              Live On Break
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Max: <span className="text-[#800000]">1hour30minutes</span>
              </div>
              <div className="h-3 w-[1px] bg-gray-200"></div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Count: <span className="text-red-700 text-sm">{onBreakStatuses.length}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
            <section className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {onBreakStatuses.map((status, index) => (
                  <motion.div
                    key={status._id + "on break"}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`relative bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between group transition-all border-l-4 shadow-sm ${
                        status.percentage > 80 ? "border-l-red-700" :
                        status.percentage > 50 ? "border-l-orange-500" : "border-l-green-500"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-[11px] font-black text-gray-500">{(index + 1).toString().padStart(2, '0')}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-gray-800 truncate">
                          {status.firstName} {status.lastName}
                        </h3>
                        <div className="w-full max-w-[180px] h-1 bg-gray-200 rounded-full mt-2 overflow-hidden hidden md:block">
                          <motion.div
                            className={`h-full ${getStatusColor(status.percentage)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${status.percentage}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 mt-3 md:mt-0">
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-gray-400 uppercase">Usage</p>
                        <p className={`text-xs font-black ${getTextColor(status.percentage)}`}>
                          {status?.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right min-w-[70px]">
                        <p className="text-[8px] font-bold text-gray-400 uppercase">Duration</p>
                        <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">
                          {status.formattedTime}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </section>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h2 className="text-sm font-black uppercase text-gray-700 tracking-tight">
              Live Over Break
            </h2>
            <div className="bg-red-800 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest leading-none">
              Live Feed
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {overBreakStatuses.map((status, index) => (
                <motion.div
                  key={status._id}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-100 rounded-xl hover:border-red-200 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-gray-500">{(index + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs leading-none">{status.firstName} {status.lastName}</h4>
                      <p className="text-[9px] text-red-600 font-bold uppercase mt-1 tracking-tighter">Log: {formatDate(status?.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-red-700 leading-none">
                      {formatMilliseconds(status?.totalBreakTime)}
                    </div>
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128, 0, 0, 0.2); border-radius: 10px; }
      `}</style>
    </section>
  );
}
