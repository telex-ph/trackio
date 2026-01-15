import React, { useState, useEffect, useCallback } from "react";
import { Clock, TrendingUp, CheckCircle } from "lucide-react";

const FlipSegment = ({ value, label }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== currentValue) {
      setPreviousValue(currentValue);
      setIsFlipping(true);
     
      const timeout = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [value, currentValue]);
 
  const displayValue = String(currentValue).padStart(2, '0');
  const displayPrevious = String(previousValue).padStart(2, '0');

  const segmentTopBgColor = "bg-red-800";
  const segmentBottomBgColor = "bg-red-900";
  const textColor = "text-white";
  const shadowStyle = "shadow-lg shadow-red-900/50";
  const dividerStyle = "absolute left-1/2 top-1/2 w-0.5 h-10 bg-red-900/50 transform -translate-x-1/2 -translate-y-1/2 rounded-full";
  const labelColor = "text-gray-600";
 
  return (
    <div className="flex flex-col items-center select-none flex-1 min-w-0">
      {/* Container: Added flex-1 and max-width for fluid scaling */}
      <div className="relative w-full max-w-[120px] aspect-[3/4] sm:w-16 sm:h-30 lg:w-30 lg:h-40 rounded-xl border border-red-900/50 bg-white overflow-hidden">
       
        <div className={dividerStyle + " -left-2 sm:-left-4 lg:-left-6"} />
        <div className={dividerStyle + " right-2 sm:right-4 lg:right-6"} />

        {/* Top Half */}
        <div className={`absolute top-0 w-full h-1/2 overflow-hidden rounded-t-xl ${segmentTopBgColor} flex justify-center items-center ${shadowStyle}`}>
            <span className={`transform -translate-y-1/4 text-3xl sm:text-6xl lg:text-7xl font-extrabold ${textColor}`}>{displayValue}</span>
        </div>
       
        {/* Bottom Half */}
        <div className={`absolute bottom-0 w-full h-1/2 overflow-hidden rounded-b-xl ${segmentBottomBgColor} flex justify-center items-center ${shadowStyle} border-t border-red-900`}>
            <span className={`transform translate-y-1/4 text-3xl sm:text-6xl lg:text-7xl font-extrabold ${textColor}`}>{displayValue}</span>
        </div>

        {/* Animation Flip Top */}
        {isFlipping && (
            <div className={`absolute top-0 w-full h-1/2 overflow-hidden rounded-t-xl ${segmentBottomBgColor} flex justify-center items-center ${textColor}
                            origin-bottom z-20`}
                  style={{ animation: 'flipTop 0.5s ease-in-out forwards' }}
            >
                <span className={`transform -translate-y-1/4 text-3xl sm:text-6xl lg:text-7xl font-extrabold ${textColor}`}>{displayPrevious}</span>
            </div>
        )}

        {/* Animation Flip Bottom */}
        {isFlipping && (
            <div className={`absolute bottom-0 w-full h-1/2 overflow-hidden ${segmentTopBgColor} rounded-b-xl flex justify-center items-center ${textColor}
                            origin-top z-20`}
                  style={{ animation: 'flipBottom 0.5s ease-in-out forwards', opacity: 0 }}
            >
                <span className={`transform translate-y-1/4 text-3xl sm:text-6xl lg:text-7xl font-extrabold ${textColor}`}>{displayValue}</span>
            </div>
        )}

      </div>
      <p className={`mt-3 text-xs sm:text-base font-semibold ${labelColor} uppercase tracking-wider`}>
        {label}
      </p>
    </div>
  );
};

const PaydayCard = () => {
  const [nextPayday, setNextPayday] = useState('');
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [calendarDaysRemaining, setCalendarDaysRemaining] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isPayday, setIsPayday] = useState(false);
 
  const calculateCountdown = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let nextPaydayDate;

    if (currentDay < 5) {
      nextPaydayDate = new Date(currentYear, currentMonth, 5);
    } else if (currentDay < 20) {
      nextPaydayDate = new Date(currentYear, currentMonth, 20);
    } else {
      nextPaydayDate = new Date(currentYear, currentMonth + 1, 5);
    }

    let timeDiff = nextPaydayDate.getTime() - now.getTime();
   
    const totalDayMillis = 1000 * 3600 * 24;
    const calendarDays = Math.ceil(timeDiff / totalDayMillis);
    setCalendarDaysRemaining(Math.max(0, calendarDays));
   
    if (timeDiff <= 0) {
        setIsPayday(true);

        let nextPaydayForDisplay;
        if (currentDay === 5) {
             nextPaydayForDisplay = new Date(currentYear, currentMonth, 20);
        } else if (currentDay === 20) {
             nextPaydayForDisplay = new Date(currentYear, currentMonth + 1, 5);
        } else {
            if (currentDay > 5 && currentDay < 20) {
                nextPaydayForDisplay = new Date(currentYear, currentMonth, 20);
            } else if (currentDay > 20) {
                nextPaydayForDisplay = new Date(currentYear, currentMonth + 1, 5);
            } else {
                nextPaydayForDisplay = new Date(currentYear, currentMonth, 5);
            }
        }
       
        const nextFormattedDate = nextPaydayForDisplay.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        setNextPayday(nextFormattedDate);
        setDays(0); setHours(0); setMinutes(0); setSeconds(0);
        setCalendarDaysRemaining(0);
        setProgressPercentage(100);
        return;
    }

    setIsPayday(false);

    const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    const totalHours = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
    const totalMinutes = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));
    const totalSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    setDays(totalDays);
    setHours(totalHours);
    setMinutes(totalMinutes);
    setSeconds(totalSeconds);

    const formattedDate = nextPaydayDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    setNextPayday(formattedDate);
   
    let totalDaysInPeriod;
    let daysPassedInPeriod;

    if (currentDay < 5) {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
      totalDaysInPeriod = (daysInPrevMonth - 20) + 5;
      daysPassedInPeriod = (daysInPrevMonth - 20) + currentDay;
    } else if (currentDay < 20) {
      totalDaysInPeriod = 15;
      daysPassedInPeriod = currentDay - 5;
    } else {
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      totalDaysInPeriod = (daysInCurrentMonth - 20) + 5;
      daysPassedInPeriod = currentDay - 20;
    }

    let currentProgress = Math.min(100, Math.max(0, (daysPassedInPeriod / totalDaysInPeriod) * 100));
    setProgressPercentage(currentProgress);

  }, []);

  useEffect(() => {
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [calculateCountdown]);

  const getPayPeriodInfo = () => {
    return `Next Payday: ${nextPayday}`;
  };
 
  const getPaydayMessage = () => {
    if (isPayday) {
      return "Disbursement Complete! Time to start the next cutoff.";
    }
    return "Time until next payroll disbursement";
  }

  return (
    <div className="relative bg-white rounded-xl p-4 sm:p-8 shadow-2xl flex-1 border border-gray-200/80
                    transition-all duration-500 hover:shadow-gray-300/80 w-full max-w-full overflow-hidden">

      <div className="relative z-10 flex flex-col h-full">
       
        {/* Header: Added flex-wrap for small screens */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-800" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight text-center sm:text-left">
              Payday Countdown
            </h3>
          </div>
          <p className="text-xs sm:text-sm font-medium px-3 py-1 bg-red-800 text-white rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
            {getPayPeriodInfo()}
          </p>
        </div>

        <p className="text-sm sm:text-base font-light text-gray-500 mb-6 text-center">
            {getPaydayMessage()}
        </p>
           
        {isPayday ? (
            <div className="flex flex-col items-center justify-center py-4 flex-grow">
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mb-4 animate-pulse" />
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 text-center">
                    Payday is TODAY! 💵
                </p>
            </div>
        ) : (
            <>
                <div className="flex flex-col items-center justify-center py-4 sm:py-6 mb-8">
                    <p className="text-6xl sm:text-8xl lg:text-9xl 2xl:text-[10rem] font-extrabold text-red-800 leading-none">
                        {calendarDaysRemaining}
                    </p>
                    <p className="mt-2 text-sm sm:text-2xl font-semibold text-gray-500 uppercase tracking-wider">
                        {calendarDaysRemaining === 1 ? 'DAY REMAINING' : 'DAYS REMAINING'}
                    </p>
                </div>
               
                {/* Timer Row: Added px-2 and flex-grow handling */}
                <div className="flex justify-center items-end gap-2 sm:gap-3 lg:gap-4 flex-nowrap w-full px-1 sm:px-0">
                    <FlipSegment value={hours} label="HRS" />
                    <FlipSegment value={minutes} label="MINS" />
                    <FlipSegment value={seconds} label="SECS" />
                </div>
            </>
        )}

        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-800"/>
              Cutoff Progress
            </p>
            <p className={`text-xs sm:text-sm font-bold ${progressPercentage >= 100 ? 'text-green-500' : 'text-red-800'}`}>
              {progressPercentage.toFixed(2)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-800 transition-all duration-1000 shadow-md shadow-red-500/50"
              style={{ width: `${progressPercentage}%` }}>
            </div>
          </div>
         
          <p className="text-[10px] sm:text-sm font-medium mt-2 text-gray-500">
            {progressPercentage.toFixed(2)}% of current pay period completed
          </p>
        </div>

      </div>

      <style>{`
        @keyframes flipTop {
          0% { transform: perspective(900px) rotateX(0deg); opacity: 1; z-index: 20; }
          49% { transform: perspective(900px) rotateX(-90deg); opacity: 1; z-index: 20; }
          50% { opacity: 0; z-index: 10; }
          100% { opacity: 0; z-index: 10; }
        }
        @keyframes flipBottom {
          0% { transform: perspective(900px) rotateX(90deg); opacity: 0; }
          50% { transform: perspective(900px) rotateX(90deg); opacity: 0; }
          51% { opacity: 1; z-index: 20; }
          100% { transform: perspective(900px) rotateX(0deg); opacity: 1; z-index: 20; }
        }
      `}</style>
    </div>
  );
};

export default PaydayCard;
