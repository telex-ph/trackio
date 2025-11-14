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
import Stopwatch from "../../components/Stopwatch";

const SharedAttendance = () => {
  const user = useStore((state) => state.user);
  const {
    attendance,
    loading,
    addAttendance,
    updateAttendance,
    fetchUserAttendance,
  } = useAttendance(user?._id);

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
      <section>
        <Calendar loading={scheduleLoading} readOnly={true} />
      </section>
    </div>
  );
};

export default SharedAttendance;
