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
      <section className="flex gap-5">
        <WorkingTime timeIn={attendance?.timeIn} />
        <ServerTime />
      </section>

      <section className="grid grid-cols-5 gap-4">
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
