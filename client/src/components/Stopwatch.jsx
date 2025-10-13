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
  const startRef = useRef(null); // Real start timestamp

  // Initialize time on attendance change
  useEffect(() => {
    if (!attendance) return;

    const latestBreak =
      attendance.breaks?.[attendance.breaks.length - 1] || null;

    let baseTime = attendance.totalBreak || 0;

    if (latestBreak && !latestBreak.end) {
      const start = DateTime.fromISO(latestBreak.start).setZone("Asia/Manila");
      const now = DateTime.now().setZone("Asia/Manila");
      baseTime += now.diff(start, "milliseconds").milliseconds;

      // set real start timestamp for accurate timer
      startRef.current = Date.now() - baseTime;
      setIsRunning(true);
    }

    setTime(baseTime);
  }, [attendance]);

  // Start/pause based on status
  useEffect(() => {
    if (attendance?.status === STATUS.ON_BREAK) {
      if (!isRunning) {
        startRef.current = Date.now() - time;
        setIsRunning(true);
      }
    } else {
      setIsRunning(false);
    }
  }, [attendance?.status]);

  // Accurate timer using real clock
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        setTime(now - startRef.current);
      }, 200); // update every 200ms for smooth seconds
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Format HH:MM:SS
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
        startRef.current = Date.now() - time;
        const res = await api.patch("/attendance/update-break-start", {
          docId: attendance._id,
          breaks: attendance.breaks || [],
          totalBreak: time,
        });
        toast.success("Break started!");
        console.log("Break started:", res.data);
      } else {
        const res = await api.patch("/attendance/update-break-pause", {
          docId: attendance._id,
          breaks: attendance.breaks || [],
          totalBreak: time,
        });
        toast.success("Break stopped!");
        console.log("Break ended:", res.data);
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

  const maxTime = 90 * 60 * 1000;
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
      {/* Progress Bar */}
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
          <div className="mb-4">
            <div className="w-full bg-white rounded-md h-3 overflow-hidden border-light">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-100"
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
              {/* Timer Display */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <h3 className="font-bold">{hours}</h3>
                <h3 className="font-bold">:</h3>
                <h3 className="font-bold">{minutes}</h3>
                <h3 className="font-bold">:</h3>
                <h3 className="font-bold">{seconds}</h3>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleStartPause}
                  className={`px-12 py-4 rounded-md font-semibold text-lg transition-all cursor-pointer ${
                    isRunning
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 bg-white"></span>
                      Pause
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></span>
                      Start
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
