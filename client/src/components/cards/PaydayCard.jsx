import React, { useState, useEffect } from "react";

const PaydayCard = () => {
  const [nextPayday, setNextPayday] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    const calculatePayday = () => {
      const now = new Date();
      const currentDay = now.getDate();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let nextPaydayDate;

      if (currentDay < 5) {
      nextPaydayDate = new Date(
      currentYear, 
      currentMonth, 5);

      } else if (currentDay < 20) {
      nextPaydayDate = new Date(
      currentYear, 
      currentMonth, 20);

      } else {
      nextPaydayDate = new Date(
      currentYear, 
      currentMonth + 1, 5);
      }

      const timeDiff = nextPaydayDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      let totalDaysInPeriod;
      let daysPassedInPeriod;

      if (currentDay < 5) {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        totalDaysInPeriod = (daysInPrevMonth - 20 + 1) + 5;
        daysPassedInPeriod = (daysInPrevMonth - 20 + 1) + currentDay;
      } else if (currentDay < 20) {
        totalDaysInPeriod = 15;
        daysPassedInPeriod = currentDay - 5;
      } else {
        const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        totalDaysInPeriod = (daysInCurrentMonth - 20 + 1) + 5;
        daysPassedInPeriod = currentDay - 20;
      }

      const progressPercentage = Math.min(100, Math.max(0, 
      (daysPassedInPeriod / totalDaysInPeriod) * 100));

      const formattedDate = nextPaydayDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      setNextPayday(formattedDate);
      setDaysRemaining(daysRemaining);
      setProgressPercentage(progressPercentage);
    };

    calculatePayday();
    const interval = setInterval(calculatePayday, 3600000);
    return () => clearInterval(interval);
  }, []);

  const getPayPeriodInfo = () => {
    const now = new Date();
    const currentDay = now.getDate();
    
    if (currentDay < 5) {
      return "1st Cutoff (20th - 5th)";
    } else if (currentDay < 20) {
      return "2nd Cutoff (5th - 20th)";
    } else {
      return "1st Cutoff (20th - 5th)";
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white/80 via-red-50/60 
                    to-yellow-50/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl 
                    p-4 sm:p-6 shadow-2xl flex-1 overflow-hidden hover:shadow-3xl 
                    transition-all duration-500 transform hover:scale-[1.02] 
                    border border-white/40">

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 
                        via-transparent to-yellow-500/5 animate-pulse"></div>
        <div
          className="absolute top-3 sm:top-6 left-1/4 text-lg sm:text-2xl animate-bounce"
          style={{ animationDelay: "0s" }}
        >
          💰
        </div>
        <div
          className="absolute top-8 sm:top-16 right-1/3 text-base sm:text-xl animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          💸
        </div>
        <div
          className="absolute bottom-10 sm:bottom-20 left-1/5 text-sm sm:text-lg animate-bounce"
          style={{ animationDelay: "0.5s" }}
        >
          🤑
        </div>
      </div>

      
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex-1">
          <h3 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl 
                         lg:text-8xl font-black text-transparent 
                         bg-clip-text bg-gradient-to-r from-red-700 
                         via-red-500 to-yellow-400 drop-shadow-2xl 
                         hover:scale-105 transition-transform 
                         duration-300">PAYDAY</h3>

          <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
            
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
            
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              {nextPayday}
            </p>

            <span className="text-sm sm:text-lg">🎯</span>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 relative">
        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 
                        rounded-full h-4 sm:h-6 overflow-hidden shadow-inner 
                        border border-gray-300/50 relative">
          <div
            className="h-4 sm:h-6 rounded-full bg-gradient-to-r from-red-600 
                       via-red-500 to-yellow-500 transition-all duration-1000 
                       shadow-lg relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent 
                        via-white/30 to-transparent -skew-x-12 animate-pulse"></div>
          </div>
          <div className="absolute right-4 sm:right-6 top-0 w-4 sm:w-6 h-4 sm:h-6 
                        rounded-full bg-yellow-400 shadow-xl animate-ping border-2 border-white"></div>
        </div>
        <p className="text-xs sm:text-sm mt-2 sm:mt-3 text-gray-600 font-medium flex items-center gap-2">
          {progressPercentage.toFixed(0)}% of {getPayPeriodInfo()} completed
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-gradient-to-tr from-red-50 via-white/50 to-yellow-50 
                        rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center shadow-lg 
                        hover:scale-105 hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm">
          <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 font-medium mb-1 sm:mb-2">
            Next Payday
          </p>
          <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">
            {nextPayday.split(' ')[1]?.replace(',', '')} {nextPayday.split(' ')[0]}
          </p>
        </div>
        <div className="bg-gradient-to-tr from-red-50 via-white/50 to-yellow-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col items-center shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 border border-white/50 backdrop-blur-sm">
          <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 font-medium mb-1 sm:mb-2">
            Days Remaining
          </p>
          <p className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500">
            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaydayCard;