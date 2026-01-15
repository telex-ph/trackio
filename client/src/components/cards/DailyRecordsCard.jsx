import React from "react";
import {
  Clock,
  Coffee,
  Activity,
  LogIn,
  Utensils,
  LogOut,
  Construction,
  MonitorCheck,
  User,
} from "lucide-react";

const DailyRecordsCard = () => {
  const PRIMARY_MAROON_HEX = "#850909";
  const LIGHT_MAROON_HEX = "#fbe6e6";
  const PRIMARY_BLACK = "text-gray-900";
 
  const shadowLift = "shadow-2xl";
 
  const textSubtle = "text-gray-500";
 
  const statsContainerBg = "bg-white";
  const statsAccentText = "text-gray-900";
  const statsAccentIcon = PRIMARY_MAROON_HEX;
  const customDarkShadow = `shadow-lg shadow-[${PRIMARY_MAROON_HEX}40]`;
 
  const labelStyle = `text-[9px] sm:text-xs font-medium tracking-wide ${textSubtle} uppercase`;
  const valueStyle = `text-lg xl:text-xl font-bold ${statsAccentText} leading-tight`;

  const pendingColor = "text-yellow-600";
  const pendingBg = "bg-yellow-100";
 
  const validationStatusColor = "text-orange-700";
  const validationStatusBg = "bg-orange-50";

  return (
    <div className={`w-full max-w-md bg-white rounded-3xl ${shadowLift} p-4 sm:p-6 relative border border-gray-100`}>
     
      <div className="relative z-10 h-full flex flex-col">
       
        <div className={`mb-4 pb-2 border-b border-gray-100 flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white border border-gray-200 rounded-full shadow-sm flex-shrink-0 relative`}
                style={{ color: PRIMARY_MAROON_HEX }}>
              <User className={`w-5 h-5 sm:w-6 sm:h-6`} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                <Construction className="w-1.5 h-1.5 text-white" />
              </div>
            </div>
           
            <div className="flex-1 min-w-0">
              <h2 className={`font-semibold text-xs sm:text-sm ${PRIMARY_BLACK} tracking-tight leading-none`}>
                Employee Daily Log
              </h2>
              <p className={`text-xs ${textSubtle} font-normal mt-0.5`}>
                Record validation pending
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 mb-2 flex-grow">
         
          <div className={`rounded-xl p-3 sm:p-4 border border-gray-200 ${customDarkShadow} ${statsContainerBg}`}>
            <div className="grid grid-cols-3 text-center">
              {[
                { label: "WORKED", icon: Clock },
                { label: "BREAKS", icon: Coffee },
                { label: "STATUS", icon: Activity }
              ].map((stat, i) => (
                <div key={i} className="group cursor-not-allowed px-1">
                  <div className={`transition-all duration-300`}>
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-1">
                        <stat.icon className={`w-4 h-4`} style={{ color: statsAccentIcon }} />
                      </div>
                      <p className={labelStyle}>
                        {stat.label}
                      </p>
                      <p className={valueStyle}>
                        --
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 mt-4">
            {[
              { label: "TIME IN", icon: LogIn },
              { label: "LUNCH BREAK", icon: Utensils },
              { label: "TIME OUT", icon: LogOut }
            ].map((record, i) => (
              <div key={i} className="group cursor-not-allowed">
                <div className={`rounded-lg py-2 transition-all duration-300 relative bg-white`}>
                  <div className="flex items-start gap-3 relative">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
                        style={{ backgroundColor: LIGHT_MAROON_HEX, color: PRIMARY_MAROON_HEX }}>
                      <record.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[9px] sm:text-xs font-medium tracking-wide ${textSubtle} uppercase`}>
                        {record.label}
                      </p>
                      <p className={`text-base sm:text-lg font-bold`} style={{ color: PRIMARY_MAROON_HEX }}>
                        --:--
                      </p>
                    </div>

                    <div className={`px-2 py-0.5 rounded-full ${pendingBg} ${pendingColor} text-[9px] sm:text-xs font-bold uppercase flex-shrink-0 self-center`}>
                      PENDING
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex-1 flex flex-col justify-end">
            <div className={`p-4 sm:p-5 rounded-xl ${validationStatusBg} border border-orange-200`}>
                <div className="flex items-start gap-3">
                    <Construction className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-amber-600`} />
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-semibold mb-1 text-amber-700`}>
                            Development in Progress
                        </p>
                        <p className={`text-xs sm:text-sm ${textSubtle}`}>
                            This section is currently under development. Data shown are placeholders and not yet final.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex-grow min-h-[10px] my-2 h-4 sm:h-6"></div>
          </div>
         
        </div>

        <div className={`mt-auto flex-shrink-0`}>
          <button className={`w-full py-3 sm:py-4 text-white font-semibold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90`}
              style={{ backgroundColor: PRIMARY_MAROON_HEX, boxShadow: `0 4px 6px -1px ${PRIMARY_MAROON_HEX}40, 0 2px 4px -2px ${PRIMARY_MAROON_HEX}40` }}>
            <Construction className="w-4 h-4 text-white" />
            <span className="text-sm">Feature Under Development</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyRecordsCard;
