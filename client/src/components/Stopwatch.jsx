import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../utils/axios";
import Spinner from "../assets/loaders/Spinner";
import { STATUS } from "../constants/status";
import { DateTime, Duration } from "luxon";

export default function Stopwatch({ attendance, fetchUserAttendance }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Calculate base time on mount or attendance update
  useEffect(() => {
    const calculateTime = async () => {
      if (attendance?.breaks?.length > 0) {
        const latestBreak = attendance.breaks[attendance.breaks.length - 1];
        let baseTime = attendance.totalBreak || 0;

        // If user is on an ongoing break
        if (latestBreak && !latestBreak.end) {
          const start = DateTime.fromISO(latestBreak.start).setZone(
            "Asia/Manila"
          );
          const { data } = await api.get("/server/server-time");
          const now = DateTime.fromISO(data.now, { zone: "utc" });
          const ongoingMs = now.diff(start, "milliseconds").milliseconds;
          baseTime += ongoingMs;
        }

        setTime(baseTime);
      }
    };
    calculateTime();
  }, [attendance]);

  // Track whether the timer should be running
  useEffect(() => {
    if (attendance?.status === STATUS.ON_BREAK) {
      setIsRunning(true);
    } else if (attendance?.status === STATUS.WORKING) {
      setIsRunning(false);
    }
  }, [attendance?.status]);

  // Hybrid ticking system (local + server resync)
  useEffect(() => {
    if (isRunning && attendance?.breaks?.length > 0) {
      const latestBreak = attendance.breaks[attendance.breaks.length - 1];
      const start = DateTime.fromISO(latestBreak.start).setZone("Asia/Manila");

      let offset = 0; // ms difference between server & local time
      let lastSync = Date.now();

      const syncWithServer = async () => {
        try {
          const { data } = await api.get("/server/server-time");
          const serverNow = DateTime.fromISO(data.now, { zone: "utc" });
          const localNow = DateTime.now();
          offset = serverNow.toMillis() - localNow.toMillis();
          lastSync = localNow.toMillis();
        } catch (err) {
          console.error("Failed to sync with server:", err);
        }
      };

      const tick = () => {
        const localNow = DateTime.now().plus({ milliseconds: offset });
        const elapsed =
          localNow.diff(start, "milliseconds").milliseconds +
          (attendance.totalBreak || 0);
        setTime(elapsed);
      };

      // Initial sync then start ticking
      syncWithServer().then(() => {
        tick();
        intervalRef.current = setInterval(() => {
          const now = Date.now();
          tick();

          // Resync with server every 30 seconds
          if (now - lastSync >= 30000) {
            syncWithServer();
          }
        }, 1000);
      });

      return () => clearInterval(intervalRef.current);
    }
  }, [isRunning, attendance]);

  //  Format time for display
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  };

  const { hours, minutes, seconds } = formatTime(time);

  // Handle start/pause logic
  const handleStartPause = async () => {
    if (!attendance) {
      toast.error("Please time in first before starting your break.");
      return;
    }

    if (attendance.timeOut) {
      toast.error("You have already timed out for today.");
      return;
    }

    try {
      setLoading(true);
      if (!isRunning) {
        await api.patch("/attendance/update-break-start", {
          docId: attendance._id,
          breaks: attendance.breaks || [],
          totalBreak: time,
        });
        toast.success("Break started!");
      } else {
        await api.patch("/attendance/update-break-pause", {
          docId: attendance._id,
          breaks: attendance.breaks || [],
          totalBreak: time,
        });
        toast.success("Break stopped!");
      }

      setIsRunning(!isRunning);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      await fetchUserAttendance();
      setLoading(false);
    }
  };

  // 📊 Progress display
  const maxTime = 90 * 60 * 1000; // 1 hour 30 mins
  const progress = Math.min((time / maxTime) * 100, 100);

  const formatDuration = (ms) => {
    if (!ms || ms <= 0) return "0h 0m 0s";

    const dur = Duration.fromMillis(ms);
    const hours = Math.floor(dur.as("hours"));
    const minutes = Math.floor(dur.as("minutes") % 60);
    const seconds = Math.floor(dur.as("seconds") % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <section className="container-light border-light rounded-md p-5 w-full">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-black">
            Break Time:{" "}
            <span className="text-light font-light">
              (max 1 hour 30 minutes)
            </span>
          </h3>
        </div>
      </div>

      {attendance?.status === STATUS.OOF ? (
        <h3 className="text-black text-center p-7">
          Overall Break Duration: {formatDuration(attendance.totalBreak || 0)}
        </h3>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-white rounded-md h-3 overflow-hidden border-light">
              <div
                className="bg-(--primary-color) h-full rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              {progress.toFixed(1)}% of 1:30:00
            </div>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* Timer display */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <h3 className="font-bold">{hours}</h3>
                <h3 className="font-bold">:</h3>
                <h3 className="font-bold">{minutes}</h3>
                <h3 className="font-bold">:</h3>
                <h3 className="font-bold">{seconds}</h3>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
