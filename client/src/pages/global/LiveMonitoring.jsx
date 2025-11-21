import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { DateTime, Duration } from "luxon";
import ServerTime from "../../components/ServerTime";
import trackio from "../../assets/logos/trackio.svg";
import Happy from "../../assets/illustrations/Happy";
import { STATUS } from "../../constants/status";
import liveMonitoring from "../../assets/background/live-monitoring.png";

const SOCKET_URL =
  import.meta.env.VITE_API_RENDER_BASE_URL || "http://localhost:3000";

export default function LiveBreaks() {
  const [onBreak, setOnBreaks] = useState([]);
  const [overBreaks, setOverBreaks] = useState([]); // ⬅ NEW
  const [now, setNow] = useState(DateTime.now().setZone("Asia/Manila"));
  const maxBreakTime = 5400000; // 1hr 30min in ms

  // Calculate percentage of break completed
  const calculatePercentage = (totalBreakTime = 0, currentBreakStart) => {
    const currentBreak = DateTime.fromISO(currentBreakStart, {
      zone: "Asia/Manila",
    });
    const currentBreakTime = now.diff(
      currentBreak,
      "milliseconds"
    ).milliseconds;
    const totalBreakDuration = currentBreakTime + totalBreakTime;

    return Math.min((totalBreakDuration / maxBreakTime) * 100, 100);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.on("on-break", (onBreak) => {
      console.log("on-break: ", onBreak);
      setOnBreaks(onBreak);
    });

    socket.on("over-break", (overBreak) => {
      console.log("over-break: ", overBreak);
      setOverBreaks(overBreak);
    });

    return () => {
      socket.disconnect();
    };
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
    const mDisplay = minutes > 0 ? `${minutes}m` : "";

    return `${hDisplay}${mDisplay}`.trim();
  };

  // Shared processor for both panels
  const processRecords = (records) =>
    records
      .map((status) => {
        const breaksCount = status.breaks?.length - 1;
        const lastBreakStart = status.breaks[breaksCount]?.start;

        if (!lastBreakStart) return null;

        const percentage = calculatePercentage(
          status.totalBreakTime,
          lastBreakStart
        );

        const breakDurationMs =
          status.totalBreakTime +
          now.toMillis() -
          DateTime.fromISO(lastBreakStart).toMillis();

        if (isNaN(breakDurationMs)) return null;

        const duration = Duration.fromMillis(breakDurationMs).shiftTo(
          "hours",
          "minutes"
        );

        const formattedTime = `${Math.floor(duration.hours)}h ${Math.floor(
          duration.minutes
        )}m`;

        return { ...status, percentage, formattedTime };
      })
      .filter(Boolean)
      .sort((a, b) => b.percentage - a.percentage);

  // Process on-break and overbreak records
  const onBreakStatuses = processRecords(
    onBreak.filter((s) => s.status === STATUS.ON_BREAK)
  );

  return (
    <section
      style={{
        backgroundImage: `url(${liveMonitoring})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex gap-5 p-5 h-screen">
        <div className="flex-1 p-5 rounded-sm">
          <h2 className="mb-4 text-gray-700 border p-2 border-light bg-gray-50 rounded-md">
            Live On Break (max: 1hr 30min)
          </h2>
          <section className="grid grid-cols-4 grid-rows-10 grid-flow-col gap-3">
            <AnimatePresence mode="popLayout">
              {onBreakStatuses.map((status, key) => (
                <motion.div
                  key={status._id + "on break"}
                  layout
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  className="h-20 relative flex items-center justify-center text-gray-700 border p-2 border-light bg-gray-50 rounded-md"
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-gray-200 rounded-lg"
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                  <div className="w-full flex items-center gap-2 px-7 relative z-10">
                    <div className="flex gap-3">
                      <h4>{key + 1}</h4>
                      <h4 className="flex-1 text-center">
                        {status.firstName} {status.lastName}
                      </h4>
                    </div>
                    <h4 className="text-center flex-1">
                      {status?.percentage <= 0
                        ? 0.0
                        : status?.percentage.toFixed(1)}
                      %
                    </h4>
                    <h4>{status.formattedTime}</h4>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </div>

        <div className="flex-1 p-5 rounded-sm overflow-y-scroll">
          <h2 className="mb-4 text-gray-700 border p-2 border-light bg-gray-50 rounded-md">
            Live Over Break
          </h2>
          <section className="grid grid-cols-4 grid-rows-10 grid-flow-col gap-3">
            <AnimatePresence mode="popLayout">
              {overBreaks.map((status, key) => (
                <motion.div
                  key={status._id}
                  layout
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  className="h-20 relative flex items-center justify-center text-gray-700 border p-2 border-light bg-gray-50 rounded-md"
                >
                  <div className="w-full flex items-center gap-2 px-7 relative z-10">
                    <div className="flex gap-3">
                      <h4>{key + 1})</h4>
                      <h4 className="flex-1 text-center">
                        {status.firstName} {status.lastName}
                      </h4>
                    </div>
                    <h4>{formatMilliseconds(status?.totalBreakTime)}</h4>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </section>
  );
}
