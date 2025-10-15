import { useEffect, useState, memo } from "react";
import { DateTime } from "luxon";
import api from "../utils/axios";

const WorkingTime = ({ timeIn, timeOut }) => {
  const [time, setTime] = useState({});
  const [offset, setOffset] = useState(0);

  const target = DateTime.fromISO(timeIn, { zone: "utc" }).setZone(
    "Asia/Manila"
  );
  const end = timeOut
    ? DateTime.fromISO(timeOut, { zone: "utc" }).setZone("Asia/Manila")
    : null;

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
      const now = end
        ? end
        : DateTime.now().plus({ milliseconds: offset }).setZone("Asia/Manila");
      const diff = now
        .diff(target, ["days", "hours", "minutes", "seconds"])
        .toObject();
      setTime(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timeIn, timeOut, offset]);

  const formatTime = (num) => String(Math.floor(num || 0)).padStart(2, "0");

  return (
    <section className="flex flex-col md:flex-row md:items-center flex-1 p-5 border-light rounded-md">
      <div className="flex-1">
        <h1>WORKING HOURS</h1>
      </div>
      <div className="flex items-center gap-1 font-mono text-3xl text-gray-800">
        <h1>{formatTime(time.hours)}</h1>
        <h1 className="text-gray-500">:</h1>
        <h1>{formatTime(time.minutes)}</h1>
        <h1 className="text-gray-500">:</h1>
        <h1>{formatTime(time.seconds)}</h1>
      </div>
    </section>
  );
};

export default WorkingTime;
