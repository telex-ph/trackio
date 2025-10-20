import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { DateTime, Duration } from "luxon";
import ServerTime from "../../components/ServerTime";
import trackio from "../../assets/logos/trackio.svg";
import Happy from "../../assets/illustrations/Happy";

const SOCKET_URL =
  import.meta.env.VITE_API_RENDER_BASE_URL || "http://localhost:3000";

export default function LiveBreaks() {
  const [statuses, setStatuses] = useState([]);
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

    socket.on("statuses", (statuses) => {
      setStatuses(statuses);
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

  const processedStatuses = statuses
    .map((status) => {
      const lastBreakStart = status.breaks[status.breaks.length - 1]?.start;
      if (!lastBreakStart) return null;

      const percentage = calculatePercentage(
        status.totalBreakTime,
        lastBreakStart
      );

      const breakDurationMs =
        status.totalBreakTime +
        now.toMillis() -
        DateTime.fromISO(lastBreakStart).toMillis();

      const duration = Duration.fromMillis(breakDurationMs).shiftTo(
        "hours",
        "minutes"
      );
      const formattedTime = `${Math.floor(duration.hours)}h ${Math.floor(
        duration.minutes
      )}m`;

      return { ...status, percentage, formattedTime };
    })
    .filter(Boolean);

  const onBreakStatuses = processedStatuses
    .filter((s) => s.percentage < 100)
    .sort((a, b) => b.percentage - a.percentage);

  const overBreakStatuses = processedStatuses
    .filter((s) => s.percentage >= 100)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <section>
      <section className="flex items-center justify-between px-5 py-3">
        <img src={trackio} alt="Telex PH" className="w-40 h-auto" />
      </section>
      <section>
        <ServerTime />
      </section>

      <div className="flex gap-5 p-5 bg-gray-100 h-screen">
        {/* LEFT PANEL: ON BREAK */}
        <div className="flex-1 bg-white p-5 rounded-sm shadow">
          <h2 className="mb-4 text-gray-700">Live On Break (max: 1hr 30min)</h2>
          <section className="space-y-3">
            <AnimatePresence mode="popLayout">
              {onBreakStatuses.map((status, key) => (
                <motion.div
                  key={status._id + "on break"}
                  layout
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  className="h-20 relative border-blue-800 border-2 flex items-center justify-center rounded-lg text-gray-700"
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 rounded-r-sm"
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                  <div className="w-full flex items-center gap-2 px-7 relative z-10">
                    <div className="flex gap-3">
                      <h2>{key + 1})</h2>
                      <h2 className="flex-1 text-center">
                        {status.firstName} {status.lastName}
                      </h2>
                    </div>
                    {/* <h3 className="text-center flex-1">
                      {status.percentage.toFixed(1)}%
                    </h3> */}
                    <h3 className="text-center flex-1">
                      {status?.percentage <= 0
                        ? 0.0
                        : status?.percentage.toFixed(1)}
                      %
                    </h3>
                    <h3>{status.formattedTime}</h3>
                  </div>
                </motion.div>
              ))}
              {onBreakStatuses.length === 0 && <Happy />}
            </AnimatePresence>
          </section>
        </div>

        {/* RIGHT PANEL: OVER BREAK */}
        <div className="flex-1 bg-white p-5 rounded-sm shadow">
          <h2 className="mb-4 text-gray-700">Live Over Break</h2>
          <section className="space-y-3">
            <AnimatePresence mode="popLayout">
              {overBreakStatuses.map((status, key) => (
                <motion.div
                  key={status._id}
                  layout
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  className="h-20 relative bg-green-400 border-2 flex items-center justify-center rounded-lg text-gray-700"
                >
                  <div className="w-full flex items-center gap-2 px-7 relative z-10">
                    <div className="flex gap-3">
                      <h2>{key + 1})</h2>
                      <h2 className="flex-1 text-center">
                        {status.firstName} {status.lastName}
                      </h2>
                    </div>
                    <h3 className="text-center flex-1">
                      {status.percentage.toFixed(1)}%
                    </h3>
                    <h3>{status.formattedTime}</h3>
                  </div>
                </motion.div>
              ))}
              {overBreakStatuses.length === 0 && <Happy />}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </section>
  );
}
