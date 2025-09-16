import ServerTime from "../../components/ServerTime";
import WorkingTime from "../../components/WorkingTime";
import TimeBox from "../../components/TimeBox";
import { useStore } from "../../store/useStore";
import { useAttendance } from "../../hooks/useAttendance";
import { TIME_BOX_CONFIG } from "../../constants/attendance";

const AgentAttendance = () => {
  const user = useStore((state) => state.user);
  const { attendance, loading, error, addAttendance, updateAttendance } =
    useAttendance(user?._id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Make this section stack vertically on small screens */}
      <section className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <WorkingTime timeIn={attendance?.timeIn} />
        <ServerTime />
      </section>

      {/* Responsive grid: 1 col on small, 2 cols on md, up to 5 cols on xl */}
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
    </div>
  );
};

export default AgentAttendance;
