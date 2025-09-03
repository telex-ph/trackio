import { memo, useEffect, useState } from "react";
import { DateTime } from "luxon";

const TimeBox = memo(({ value, label }) => (
  <span className="text-center">
    <h1 className="bg-white border-light text-light rounded-md">{value}</h1>
    <span className="text-light">{label}</span>
  </span>
));

const ServerTime = () => {
  const [time, setTime] = useState(DateTime.now().setZone("Asia/Manila"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(DateTime.now().setZone("Asia/Manila")); // ✅ keep using Luxon
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Luxon uses properties instead of getHours()
  const hours = String(time.hour).padStart(2, "0");
  const minutes = String(time.minute).padStart(2, "0");
  const seconds = String(time.second).padStart(2, "0");

  return (
    <section className="flex items-center flex-1 p-5 container-light border-light rounded-md">
      <div className="flex-1">
        <h1>SERVER TIME</h1>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <TimeBox value={hours} label="Hours" />
        <TimeBox value={minutes} label="Minutes" />
        <TimeBox value={seconds} label="Seconds" />
      </div>
    </section>
  );
};

export default ServerTime;
