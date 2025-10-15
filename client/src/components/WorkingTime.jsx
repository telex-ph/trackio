import { memo, useEffect, useState } from "react";
import { DateTime } from "luxon";

const TimeBox = memo(({ value, label }) => (
  <span className="text-center">
    <h1 className="bg-white border-light text-light rounded-md">
      {value || 0}
    </h1>
    <span className="text-light">{label}</span>
  </span>
));

const WorkingTime = ({ timeIn, timeOut }) => {
  const [time, setTime] = useState({});

  const target = DateTime.fromISO(timeIn).setZone("Asia/Manila");
  const end = timeOut ? DateTime.fromISO(timeOut).setZone("Asia/Manila") : null;

  useEffect(() => {
    let frameId;
    let lastUpdate = 0;

    const update = () => {
      const now = end || DateTime.now().setZone("Asia/Manila");
      const diff = now
        .diff(target, ["days", "hours", "minutes", "seconds"])
        .toObject();
      setTime(diff);
    };

    const loop = (timestamp) => {
      if (timestamp - lastUpdate >= 1000) {
        lastUpdate = timestamp;
        update();
      }
      frameId = requestAnimationFrame(loop);
    };

    if (!end) {
      frameId = requestAnimationFrame(loop);
    } else {
      update();
    }

    return () => cancelAnimationFrame(frameId);
  }, [timeIn, timeOut]);

  return (
    <section className="flex flex-col md:flex-row md:items-center flex-1 p-5 border-light rounded-md">
      <div className="flex-1">
        <h1>WORKING HOURS</h1>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <TimeBox value={time.hours} label="Hours" />
        <TimeBox value={time.minutes} label="Minutes" />
        <TimeBox value={Math.floor(time.seconds || 0)} label="Seconds" />
      </div>
    </section>
  );
};

export default WorkingTime;
