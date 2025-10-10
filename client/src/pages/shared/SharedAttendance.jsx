import ServerTime from "../../components/ServerTime";
import WorkingTime from "../../components/WorkingTime";
import TimeBox from "../../components/TimeBox";
import { useStore } from "../../store/useStore";
import { useAttendance } from "../../hooks/useAttendance";
import { TIME_BOX_CONFIG } from "../../constants/attendance";
import Calendar from "../../components/Calendar";
import { useSchedule } from "../../hooks/useSchedule";
import { Alert } from "flowbite-react";
import { Info } from "lucide-react";

const SharedAttendance = () => {
  const user = useStore((state) => state.user);
  const { attendance, loading, addAttendance, updateAttendance } =
    useAttendance(user?._id);

  const { loading: scheduleLoading } = useSchedule({
    id: user?._id,
  });

  return (
    <div className="space-y-5">
      {/* Make this section stack vertically on small screens */}
      <section className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <WorkingTime
          timeIn={attendance?.timeIn}
          timeOut={attendance?.timeOut}
        />
        <ServerTime />
      </section>

      {/* Responsive grid: 1 col on small, 2 cols on md, up to 5 cols on xl */}
      <section>
        <Alert
          color="info"
          icon={Info}
          rounded
          className="border border-blue-200"
        >
          <span className="font-medium text-blue-900 text-sm">
            Upcoming Biometric Integration
          </span>
          <p className="text-sm text-blue-900">
            These five boxes will be replaced by the{" "}
            <strong>Biometric System</strong> once we move to the new office.
            After that, only <strong>duration data</strong> will be visible
            here.
          </p>
        </Alert>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {TIME_BOX_CONFIG.map((config) => (
          <TimeBox
            key={config.id}
            attendance={attendance}
            config={config}
            onTimeIn={addAttendance}
            onUpdate={updateAttendance}
            user={user}
          />
        ))}
      </section>

      <section>
        <Calendar loading={scheduleLoading} readOnly={true} />
      </section>
    </div>
  );
};

export default SharedAttendance;
