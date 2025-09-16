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

const WorkingTime = ({ timeIn }) => {
  const [time, setTime] = useState({});

  const target = DateTime.fromISO(timeIn).setZone("Asia/Manila");

  useEffect(() => {
    const update = () => {
      const now = DateTime.now().setZone("Asia/Manila");
      const difference = now
        .diff(target, ["days", "hours", "minutes", "seconds"])
        .toObject();
      setTime(difference);
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [timeIn]);

  return (
    <section className="flex flex-col md:flex-row md:items-center flex-1 p-5 container-light border-light rounded-md">
      <div className="flex-1">
        <h1>WORKING HOURS</h1>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <TimeBox value={time.hours} label="Hours" />
        <TimeBox value={time.minutes} label="Minutes" />
        <TimeBox value={Math.floor(time.seconds)} label="Seconds" />
      </div>
    </section>
  );
};

export default WorkingTime;
