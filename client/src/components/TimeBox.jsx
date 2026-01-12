import React, { useMemo, useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { Square, Clock, Activity, Fingerprint, Timer } from "lucide-react";
import { formatTime } from "../utils/formatDateTime";
import toast from "react-hot-toast";
import { calculateDuration, getButtonState } from "../utils/attendanceHelpers";

const TimeBox = ({
  attendance,
  config,
  onTimeIn,
  onUpdate,
  fetchUserAttendance,
}) => {
  const {
    title,
    isTwoBtn,
    fieldOne,
    fieldTwo,
    fieldOneStatus,
    fieldTwoStatus,
    bgColor,
    textColor,
    isSpecial,
  } = config;

  const startTime = attendance?.[fieldOne];
  const endTime = fieldTwo ? attendance?.[fieldTwo] : null;

  // state for ticking clock
  const [now, setNow] = useState(Date.now());

  // start ticking only if started and not ended
  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  const { isDisabled: isStartDisabled, errorMessage: startErrorMessage } =
    useMemo(
      () => getButtonState(attendance, fieldOne, isSpecial),
      [attendance, fieldOne, isSpecial]
    );

  const { isDisabled: isEndDisabled, errorMessage: endErrorMessage } = useMemo(
    () =>
      fieldTwo
        ? getButtonState(attendance, fieldTwo, false, true, fieldOne)
        : { isDisabled: true, errorMessage: null },
    [attendance, fieldTwo, fieldOne]
  );

  const duration = useMemo(() => {
    if (fieldOne === "timeOut") return "End Shift";
    if (fieldOne === "timeIn") return "Start Shift";
    if (!startTime) return "Start";
    if (fieldOne === "timeOut") {
      if (attendance?.timeIn && attendance?.timeOut) {
        return calculateDuration(attendance.timeIn, attendance.timeOut);
      }
      return "Not recorded";
    }
    if (fieldOne === "timeIn" && attendance?.timeOut) {
      return calculateDuration(startTime, attendance.timeOut);
    }
    return calculateDuration(startTime, endTime || now);
  }, [
    startTime,
    endTime,
    now,
    fieldOne,
    attendance?.timeOut,
    attendance?.timeIn,
  ]);

  const handleStartClick = async () => {
    if (isStartDisabled) {
      if (startErrorMessage) toast.error(startErrorMessage);
      return;
    }
    if (isSpecial) {
      onTimeIn();
    } else {
      onUpdate(fieldOne, fieldOneStatus);
    }
  };

  const handleEndClick = async () => {
    if (isEndDisabled) {
      if (endErrorMessage) toast.error(endErrorMessage);
      return;
    }
    onUpdate(fieldTwo, fieldTwoStatus);
  };

  return (
    <div className="group flex flex-col bg-white border border-slate-200 shadow-lg w-full h-full overflow-hidden rounded-2xl transition-all hover:shadow-xl">
      
      {/* Upper Accent Bar */}
      <div className="h-1.5 w-full bg-[#800000]" />

      {/* Header Section */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#800000]/5 rounded-xl text-[#800000]">
            <Fingerprint size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-wider leading-none mb-1.5">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <Timer size={12} className="text-slate-400" />
              <p className="text-[10px] font-bold text-[#800000] uppercase tracking-tight">
                {duration}
              </p>
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${startTime ? "bg-green-50 border-green-100" : "bg-slate-50 border-slate-100"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${startTime ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}></div>
          <span className={`text-[9px] font-black uppercase ${startTime ? "text-green-600" : "text-slate-400"}`}>
            {startTime ? "Active" : "Ready"}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 flex flex-col gap-5">
        
        <div className="flex gap-3 h-28">
          {/* Time Display Area */}
          <div 
            onClick={handleStartClick}
            className={`flex-[3] relative flex flex-col justify-center px-6 border-2 transition-all duration-300 rounded-2xl group/box
              ${startTime 
                ? "bg-slate-50 border-slate-100 shadow-inner" 
                : "bg-white border-dashed border-slate-300 hover:border-[#800000] hover:bg-[#800000]/5 cursor-pointer"}`}
          >
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Timestamp Log
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-black tabular-nums tracking-tighter ${startTime ? "text-slate-900" : "text-slate-200"}`}>
                {startTime ? formatTime(startTime) : "00:00:00"}
              </span>
              {startTime && <Activity size={16} className="text-[#800000] animate-pulse ml-2" />}
            </div>
            {!startTime && (
              <div className="absolute right-4 bottom-4 opacity-0 group-hover/box:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold text-[#800000] uppercase underline underline-offset-4 tracking-tighter">Click to record</span>
              </div>
            )}
          </div>

          {/* Action Button Section */}
          {isTwoBtn && (
            <button
              disabled={isEndDisabled}
              onClick={handleEndClick}
              className={`flex-1 flex flex-col items-center justify-center gap-3 border-2 transition-all duration-300 rounded-2xl font-black
                ${isEndDisabled
                  ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed"
                  : "bg-white text-[#800000] border-[#800000] hover:bg-[#800000] hover:text-white hover:shadow-lg active:scale-95 shadow-sm"
                }`}
            >
              <div className={`p-2 rounded-lg ${isEndDisabled ? "bg-slate-100" : "bg-current/10"}`}>
                <Square size={20} fill={isEndDisabled ? "none" : "currentColor"} strokeWidth={0} />
              </div>
              <span className="text-[10px] uppercase tracking-widest">Stop</span>
            </button>
          )}
        </div>

        {/* Footer Meta Info */}
        <div className="flex items-center justify-between px-1 pt-2">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-300" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Automated Attendance Tracking</span>
          </div>
          <span className="text-[9px] font-black text-slate-900/20 uppercase tracking-tighter italic">V.2026.1</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TimeBox);