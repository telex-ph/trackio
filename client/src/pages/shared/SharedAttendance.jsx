import React from 'react';
import ServerTime from "../../components/ServerTime";
import WorkingTime from "../../components/WorkingTime";
import TimeBox from "../../components/TimeBox";
import { useStore } from "../../store/useStore";
import { useAttendance } from "../../hooks/useAttendance";
import { TIME_BOX_CONFIG } from "../../constants/attendance";
import Calendar from "../../components/Calendar";
import { useSchedule } from "../../hooks/useSchedule";
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
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        <section className="flex flex-col px-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-black tracking-tight">
                Attendance
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                Monitor your daily logs, working hours, and system time.
              </p>
            </div>
          </div>
        </section>

        {/* Primary Indicators - High Contrast */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <WorkingTime
              timeIn={attendance?.timeIn}
              timeOut={attendance?.timeOut}
            />
          </div>
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <ServerTime />
          </div>
        </section>

        {/* Action Grid - Clean Borders & No Extra Spacing */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TIME_BOX_CONFIG.map((config, index) => {
            // Logic to integrate Stopwatch within the grid flow
            if (index === 0) {
              return (
                <React.Fragment key={config.id}>
                  <div className="bg-white border border-slate-200 shadow-sm transition-all hover:border-[#800000]/30">
                    <TimeBox
                      attendance={attendance}
                      config={config}
                      onTimeIn={addAttendance}
                      onUpdate={updateAttendance}
                      user={user}
                      fetchUserAttendance={fetchUserAttendance}
                    />
                  </div>
                  <div className="bg-white border border-slate-200 shadow-sm transition-all hover:border-[#800000]/30">
                    <Stopwatch
                      attendance={attendance}
                      fetchUserAttendance={fetchUserAttendance}
                    />
                  </div>
                </React.Fragment>
              );
            }
            
            return (
              <div key={config.id} className="bg-white border border-slate-200 shadow-sm transition-all hover:border-[#800000]/30">
                <TimeBox
                  attendance={attendance}
                  config={config}
                  onTimeIn={addAttendance}
                  onUpdate={updateAttendance}
                  user={user}
                  fetchUserAttendance={fetchUserAttendance}
                />
              </div>
            );
          })}
        </section>

        {/* Calendar and Schedule - Professional Table Style */}
        <section className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#800000] uppercase">Reporting</span>
              <span className="text-slate-300">|</span>
              <h3 className="text-xs font-bold text-slate-600 uppercase">Weekly Schedule</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              READ-ONLY MODE
            </div>
          </div>
          <div className="p-6">
            <Calendar loading={scheduleLoading} readOnly={true} />
          </div>
        </section>

      </div>
    </div>
  );
};

export default SharedAttendance;