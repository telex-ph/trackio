import { useState, useEffect, useRef } from "react";
import { useAttendance } from "../hooks/useAttendance";
import { useStore } from "../store/useStore";
import { STATUS } from "../constants/status";
import { ATTENDANCE_FIELDS } from "../constants/attendance";
import toast from "react-hot-toast";
import api from "../utils/axios";

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

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

  const user = useStore((state) => state.user);
  const handleStartPause = async () => {
    try {
      if (!isRunning) {
        // 🟢 START BREAK
        const res = await api.post("/attendance/start", {
          userId: user?._id,
        });
        toast.success("Break started!");
        console.log("Break started:", res.data);
      } else {
        // 🔴 END BREAK
        const res = await api.patch("/attendance/end", {
          userId: user?._id,
        });
        toast.success("Break ended!");
        console.log("Break ended:", res.data);
      }

      setIsRunning(!isRunning);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
    }
  };

  const maxTime = 90 * 60 * 1000;
  const progress = Math.min((time / maxTime) * 100, 100);

  // const user = useStore((state) => state.user);
  // const { attendance, loading, addAttendance, updateAttendance } =
  //   useAttendance(user?._id);

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
    </section>
  );
}
