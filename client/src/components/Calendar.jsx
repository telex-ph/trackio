import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash,
  Edit3,
  Clock,
  Info,
  Calendar as CalendarIcon,
  StickyNote,
  UserCheck,
  MousePointer2,
} from "lucide-react";
import { DateTime } from "luxon";
import useKeyboardKey from "../hooks/useKeyboardKey";
import { useStore } from "../store/useStore";
import { useParams } from "react-router-dom";
import { useSchedule } from "../hooks/useSchedule";

const Calendar = ({ handleBtnsClick, loading, readOnly = false }) => {
  const zone = "Asia/Manila";
  const [time, setTime] = useState(
    DateTime.now().setZone(zone).toFormat("HH:mm:ss")
  );
  const [fullDate, setFullDate] = useState(
    DateTime.now().setZone(zone).toFormat("cccc, dd LLL yyyy")
  );

  const {
    selectedDates,
    setSelectedDates,
    currentDate,
    setCurrentDate,
    user,
  } = useStore();
  const { isShiftPressed } = useKeyboardKey();
  const { id } = useParams();

  const [menuPos, setMenuPos] = useState(null);
  const [detail, setDetail] = useState(null);

  const { schedule: realSchedule } = useSchedule({
    id: readOnly ? user?._id : id,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = DateTime.now().setZone(zone);
      setTime(now.toFormat("HH:mm:ss"));
      setFullDate(now.toFormat("cccc, dd LLL yyyy"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const iconBase = "https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis";

  const colorScheme = {
    Work_Day: { bg: "#fed7aa", text: "#7c2d12", icon: `${iconBase}/Objects/Briefcase.png` },
    Rest_Day: { bg: "#cbd5e1", text: "#1e293b", icon: `${iconBase}/Travel%20and%20places/House.png` },
    Absent: { bg: "#fca5a5", text: "#7f1d1d", icon: `${iconBase}/Smileys/Expressionless%20Face.png` },
    Undertime: { bg: "#e9d5ff", text: "#581c87", icon: `${iconBase}/Objects/Hourglass%20Done.png` },
    Emergency_Leave: { bg: "#fec1c7", text: "#881337", icon: `${iconBase}/Symbols/Police%20Car%20Light.png` },
    Solo_Parent_Leave: { bg: "#ddd6fe", text: "#4c1d95", icon: `${iconBase}/People/Family.png` },
    Holiday: { bg: "#fef08a", text: "#713f12", icon: `${iconBase}/Activities/Party%20Popper.png` },
    Suspended: { bg: "#fecdd3", text: "#9f1239", icon: `${iconBase}/Symbols/Warning.png` },
    Reporting: { bg: "#bfdbfe", text: "#1e3a8a", icon: `${iconBase}/Objects/Memo.png` },
    Vacation_Leave: { bg: "#bbf7d0", text: "#064e3b", icon: `${iconBase}/Travel%20and%20places/Beach%20with%20Umbrella.png` },
    Maternity_Leave: { bg: "#fbcfe8", text: "#831843", icon: `${iconBase}/People/Baby.png` },
    Paternity_Leave: { bg: "#bae6fd", text: "#0c4a6e", icon: `${iconBase}/People/Man%20Feeding%20Baby.png` },
    Default: { bg: "#ffffff", text: "#64748b", icon: `${iconBase}/Objects/Calendar.png` },
  };

  const getStyle = (type) => {
    if (!type) return colorScheme.Default;
    const t = type.toLowerCase().replace(/_/g, " ").trim();
    if (t.includes("emergency")) return colorScheme.Emergency_Leave;
    if (t.includes("under")) return colorScheme.Undertime;
    if (t.includes("absent")) return colorScheme.Absent;
    if (t.includes("solo")) return colorScheme.Solo_Parent_Leave;
    if (t.includes("vacation")) return colorScheme.Vacation_Leave;
    if (t.includes("maternity")) return colorScheme.Maternity_Leave;
    if (t.includes("paternity")) return colorScheme.Paternity_Leave;
    if (t.includes("holiday")) return colorScheme.Holiday;
    if (t.includes("rest")) return colorScheme.Rest_Day;
    if (t.includes("suspended")) return colorScheme.Suspended;
    if (t.includes("reporting")) return colorScheme.Reporting;
    if (t.includes("work")) return colorScheme.Work_Day;
    return colorScheme.Default;
  };

  const schedules = useMemo(() => realSchedule || [], [realSchedule]);

  const getSchedule = (date) => {
    if (!date) return null;
    const key = date.toFormat("yyyy-MM-dd");
    return schedules.find((s) => DateTime.fromISO(s.date).toFormat("yyyy-MM-dd") === key) || null;
  };

  const toggleDate = (date) => {
    if (readOnly || !date) return;
    const sch = getSchedule(date);
    if (isShiftPressed) {
      const exists = selectedDates.some((d) => d.hasSame(date, "day"));
      setSelectedDates(exists ? selectedDates.filter((d) => !d.hasSame(date, "day")) : [...selectedDates, date]);
    } else {
      setSelectedDates([date]);
    }
    setDetail(sch);
  };

  const calendarData = useMemo(() => {
    const first = currentDate.startOf("month");
    const start = first.minus({ days: first.weekday % 7 });
    return Array.from({ length: 42 }).map((_, i) => ({
      date: start.plus({ days: i }),
      isCurrentMonth: start.plus({ days: i }).month === currentDate.month,
    }));
  }, [currentDate]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="p-4 bg-[#fcfcfc] h-screen text-slate-700 max-w-[1600px] mx-auto overflow-hidden flex flex-col relative" onClick={() => setMenuPos(null)} onContextMenu={(e) => e.preventDefault()}>
      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        body { overflow: hidden !important; height: 100vh; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}} />

      {!readOnly && menuPos && (
        <div 
          className="fixed z-[100] w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 animate-in zoom-in-95 duration-100"
          style={{ top: menuPos.y, left: menuPos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { handleBtnsClick?.("upsert"); setMenuPos(null); }} className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
            <Plus size={14} className="text-blue-600" /> Upsert Schedule
          </button>
          <button onClick={() => { handleBtnsClick?.("delete"); setMenuPos(null); }} className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
            <Trash size={14} /> Delete Schedule
          </button>
          <div className="h-px bg-slate-100 my-1" />
          <button onClick={() => setMenuPos(null)} className="w-full px-4 py-2.5 text-left text-[11px] font-black uppercase text-slate-400 hover:bg-slate-50 flex items-center gap-3 transition-colors">
            <X size={14} /> Cancel
          </button>
        </div>
      )}

      {/* Top Professional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-[#800000] shadow-md flex items-center gap-4">
          <div className="bg-[#800000]/5 p-3 rounded-xl text-[#800000]">
            <Clock size={24} />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">System Time</p>
              <span className="text-[10px] font-bold text-[#800000] bg-[#800000]/10 px-2 py-0.5 rounded">Live</span>
            </div>
            <p className="text-xl font-black text-slate-800 tabular-nums leading-none my-1">{time}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase">{fullDate}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-l-4 border-l-[#800000] shadow-md flex items-center gap-4">
          <div className="bg-[#800000]/5 p-3 rounded-xl text-[#800000]">
            <UserCheck size={24} />
          </div>
          <div className="flex-grow">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Planner Status</p>
            <p className="text-xl font-black text-[#800000] leading-none my-1">
              {selectedDates.length > 0 ? `${selectedDates.length} ${selectedDates.length > 1 ? 'Days' : 'Day'}` : "No Selection"}
            </p>
            <p className="text-[10px] font-medium text-slate-500 uppercase">
              {selectedDates.length > 0 ? "Ready for batch update" : "Select dates to manage"}
            </p>
          </div>
        </div>

        <div className="bg-[#800000] p-4 rounded-2xl shadow-lg flex items-center gap-4 text-white relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] opacity-10">
            <Info size={100} />
          </div>
          <div className="bg-white/20 p-3 rounded-xl shrink-0">
            <MousePointer2 size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-white/60 tracking-widest mb-1 text-white">Quick Guide</p>
            <div className="space-y-1">
              <p className="text-[10px] leading-tight font-bold flex items-center gap-2">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px]">SHIFT + CLICK</span> Multi-select days
              </p>
              <p className="text-[10px] leading-tight font-bold flex items-center gap-2">
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px]">RIGHT-CLICK</span> Actions Menu
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow overflow-hidden pb-4">
        <div className="flex-grow flex flex-col overflow-hidden min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-white p-2 rounded-xl border border-slate-200 shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                <button type="button" onClick={(e) => { e.stopPropagation(); setCurrentDate(currentDate.minus({ months: 1 })); }} className="p-1 hover:bg-white rounded transition-colors"><ChevronLeft size={18} /></button>
                <h3 className="px-4 text-[13px] font-black text-slate-800 uppercase tracking-tighter min-w-[130px] text-center">{currentDate.toFormat("MMMM yyyy")}</h3>
                <button type="button" onClick={(e) => { e.stopPropagation(); setCurrentDate(currentDate.plus({ months: 1 })); }} className="p-1 hover:bg-white rounded transition-colors"><ChevronRight size={18} /></button>
              </div>
              <button type="button" onClick={() => setCurrentDate(DateTime.now())} className="px-3 py-1.5 text-[10px] font-black uppercase bg-white border border-slate-200 rounded-lg hover:border-[#800000] hover:text-[#800000] transition-all">Today</button>
            </div>
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
              {months.map((m, idx) => (
                <button key={m} type="button" onClick={() => setCurrentDate(currentDate.set({ month: idx + 1 }))} className={`px-2 py-1 text-[9px] border rounded transition-all font-black uppercase ${currentDate.month === idx + 1 ? "bg-[#800000] text-white border-[#800000]" : "bg-white text-slate-400 border-transparent hover:text-slate-600"}`}>{m}</button>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col flex-grow">
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 shrink-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-grow bg-white">
              {calendarData.map(({ date, isCurrentMonth }) => {
                const sch = getSchedule(date);
                const style = getStyle(sch?.type);
                const isSel = selectedDates.some((sd) => sd.hasSame(date, "day"));
                const isToday = date.hasSame(DateTime.now(), "day");
                return (
                  <div 
                    key={date.toMillis()} 
                    onClick={() => isCurrentMonth && toggleDate(date)} 
                    onContextMenu={(e) => { 
                      e.preventDefault(); 
                      if (isCurrentMonth) { 
                        toggleDate(date); 
                        setMenuPos({ x: e.clientX, y: e.clientY }); 
                      } 
                    }} 
                    className={`relative border-b border-r border-slate-100 p-1.5 cursor-pointer transition-all bg-white 
                      ${isSel ? "ring-[1.5px] ring-inset ring-[#800000] z-10" : ""} 
                      ${!isCurrentMonth ? "opacity-20 pointer-events-none bg-slate-50/50" : "hover:bg-slate-50"}`}
                  >
                    <span className={`text-[10px] font-black ${isToday ? "bg-[#800000] text-white w-5 h-5 flex items-center justify-center rounded-full" : isSel ? "text-[#800000]" : "text-slate-900"}`}>{date.day}</span>
                    {isCurrentMonth && sch?.type && (
                      <div className="mt-1 px-1.5 py-1 rounded-md border-l-4 shadow-sm" style={{ backgroundColor: style.bg, borderLeftColor: style.text }}>
                        <span className="text-[6.5px] font-black uppercase block leading-tight whitespace-normal break-words" style={{ color: style.text }}>
                          {sch.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[300px] shrink-0 h-fit max-h-full">
          <div className="bg-white border border-slate-200 rounded-[24px] shadow-xl flex flex-col overflow-hidden">
            <div className="bg-[#800000] px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-white rounded-full" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Detail View</span>
              </div>
              {detail && <button type="button" onClick={() => setDetail(null)} className="text-white/70 hover:text-white transition-colors"><X size={16} /></button>}
            </div>
            
            <div className="p-5 flex flex-col overflow-y-auto max-h-[500px] no-scrollbar">
              {detail ? (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-center items-center py-4 relative">
                    <div className="absolute w-24 h-24 bg-slate-50 rounded-full blur-2xl" />
                    <img 
                      key={detail.type} 
                      src={getStyle(detail.type).icon} 
                      alt="Icon" 
                      className="w-20 h-20 object-contain relative z-10 animate-float"
                      onError={(e) => { e.target.src = `${iconBase}/Objects/Calendar.png`; }}
                    />
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="inline-block px-3 py-1 bg-[#800000]/5 rounded-full mb-1">
                      <span className="text-[9px] font-black text-[#800000] uppercase tracking-tighter">Current Assignment</span>
                    </div>
                    <h2 className="text-[15px] font-black text-slate-900 uppercase leading-tight">
                      {detail.type?.replace(/_/g, " ")}
                    </h2>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#800000] shrink-0"><Clock size={14} /></div>
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase">Shift Schedule</p>
                        <p className="text-[10px] font-black text-slate-700">
                          {detail.shiftStart ? `${DateTime.fromISO(detail.shiftStart).toFormat("hh:mm a")} - ${DateTime.fromISO(detail.shiftEnd).toFormat("hh:mm a")}` : "Whole Day Coverage"}
                        </p>
                      </div>
                    </div>

                    {detail.notes && (
                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#800000] shrink-0"><StickyNote size={14} /></div>
                        <div>
                          <p className="text-[7px] font-black text-slate-400 uppercase">Remarks / Notes</p>
                          <p className="text-[10px] font-black text-slate-700 leading-tight">
                            {detail.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {!readOnly && (
                    <button type="button" onClick={() => handleBtnsClick?.("upsert")} className="w-full py-3 bg-[#800000] text-white rounded-xl text-[10px] font-black uppercase shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-[#600000] active:scale-95">
                      <Edit3 size={12} /> Update Schedule
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100"><CalendarIcon size={24} className="text-slate-200" /></div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Select a date to view<br/>detailed information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;