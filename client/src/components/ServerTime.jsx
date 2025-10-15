import { useEffect, useState, memo } from "react";
import { DateTime } from "luxon";
import api from "../utils/axios";

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
    <section className="flex flex-col md:flex-row md:items-center flex-1 p-5 border-light rounded-md">
      <div className="flex-1">
        <h1>SERVER TIME</h1>
      </div>

      <div className="flex items-center gap-1 font-mono text-3xl text-gray-800">
        <h1>{String(hours12).padStart(2, "0")}</h1>
        <h1 className="text-gray-500">:</h1>
        <h1>{minutes}</h1>
        <h1 className="text-gray-500">:</h1>
        <h1 className="ml-2 text-lg text-gray-600 font-semibold">{ampm}</h1>
      </div>
    </section>
  );
};

export default memo(ServerTime);
