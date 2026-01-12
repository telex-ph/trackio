import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../utils/axios";
import Spinner from "../assets/loaders/Spinner";
import { STATUS } from "../constants/status";
import { DateTime, Duration } from "luxon";
import {
  Clock,
} from "lucide-react";

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

  // Progress display
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
  <section className="bg-white border-t-4 border-t-[#800000] border-x border-b border-slate-300 shadow-sm w-full h-full flex flex-col overflow-hidden rounded-sm">
    
    {/* Header - Balanced Bold Weight */}
    <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-slate-200">
      <div className="flex flex-col">
        <h3 className="text-sm font-bold text-slate-900 uppercase leading-none mb-1">
          Break Time Monitoring
        </h3>
        <p className="text-[11px] font-semibold text-slate-500 uppercase leading-none">
          Max Limit: 01:30:00
        </p>
      </div>
      <div className="text-[#800000]">
        <Clock size={22} strokeWidth={2} />
      </div>
    </div>

    <div className="p-8 flex flex-col flex-1 justify-center gap-10">
      {attendance?.status === STATUS.OOF ? (
        /* End of Shift View - Darker but not extra bold */
        <div className="py-8 flex flex-col items-center justify-center border border-slate-200 rounded-sm bg-slate-50">
          <span className="text-xs font-bold text-slate-500 uppercase mb-3">Total Break Consumed</span>
          <h3 className="text-5xl font-bold text-slate-900 tabular-nums leading-none">
            {formatDuration(attendance.totalBreak || 0)}
          </h3>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Main Timer Display - Bold & Clear */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-900 uppercase mb-6">Current Session Timer</span>
            
            {loading ? (
              <div className="h-12 flex items-center justify-center"><Spinner /></div>
            ) : (
              <div className="flex items-center gap-6">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-bold text-slate-900 tabular-nums leading-none">{hours}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Hours</span>
                </div>
                
                <span className="text-3xl font-bold text-slate-300 -mt-6">:</span>
                
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-bold text-slate-900 tabular-nums leading-none">{minutes}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-2">Minutes</span>
                </div>
                
                <span className="text-3xl font-bold text-slate-300 -mt-6">:</span>
                
                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-bold text-[#800000] tabular-nums leading-none">{seconds}</span>
                  <span className="text-[10px] font-bold text-[#800000] uppercase mt-2">Seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Section - Formal Style */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 uppercase">Usage Progress</span>
              <span className="text-sm font-bold text-[#800000]">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-5 border border-slate-200 rounded-sm overflow-hidden">
              <div
                className="bg-[#800000] h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
);
}