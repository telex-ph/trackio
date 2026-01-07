import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, Award, User } from "lucide-react";
import SmallLoader from "./SmallLoader";

const TopPerformersCard = ({ posts }) => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (posts && posts.length > 0) {
      calculateTopPerformers();
    } else {
      setTopPerformers([]);
      setLoading(false);
    }
  }, [posts]);

  const calculateTopPerformers = () => {
    setLoading(true);
    try {
      const employeeMap = {};
      posts.forEach((post) => {
        if (post?.employee?._id) {
          const key = post.employee._id;
          if (!employeeMap[key]) {
            employeeMap[key] = {
              employee: post.employee,
              count: 0,
              score: 0
            };
          }
          // Internal weight lang para sa ranking logic, hindi ipapakita sa UI
          let weight = post.recognitionType === "employee_of_month" ? 5 : 1;
          employeeMap[key].count++;
          employeeMap[key].score += weight;
        }
      });

      const performers = Object.values(employeeMap)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setTopPerformers(performers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRankTheme = (rank) => {
    switch (rank) {
      case 1:
        return {
          glow: "shadow-amber-200/50",
          border: "border-amber-200",
          trophy: "text-amber-500",
          rankBg: "bg-amber-500",
          accent: "bg-amber-50"
        };
      case 2:
        return {
          glow: "shadow-slate-200/50",
          border: "border-slate-200",
          trophy: "text-slate-400",
          rankBg: "bg-slate-400",
          accent: "bg-slate-50"
        };
      case 3:
        return {
          glow: "shadow-orange-200/50",
          border: "border-orange-200",
          trophy: "text-orange-500",
          rankBg: "bg-orange-500",
          accent: "bg-orange-50"
        };
      default: return {};
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center"><SmallLoader /></div>;
  if (topPerformers.length === 0) return null;

  return (
    <div className="p-4 space-y-8 max-w-sm mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-200">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
            Top Performers
          </h3>
        </div>
        <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                    <User size={12} className="text-slate-400" />
                </div>
            ))}
        </div>
      </div>

      {/* Performers List */}
      <div className="space-y-5">
        {topPerformers.map((performer, index) => {
          const rank = index + 1;
          const theme = getRankTheme(rank);

          return (
            <div key={performer.employee._id} className="group relative">
              {/* Main Pill Card */}
              <div className={`relative z-10 flex items-center w-full h-20 rounded-full border bg-white ${theme.border} ${theme.glow} transition-all duration-300 group-hover:scale-[1.02] shadow-sm`}>
                
                {/* Rank & Trophy Container */}
                <div className={`relative ml-1 w-[72px] h-[72px] rounded-full flex items-center justify-center ${theme.accent}`}>
                  <Trophy 
                    size={32} 
                    className={`${theme.trophy} drop-shadow-sm transition-transform group-hover:rotate-12 duration-500`}
                    fill="currentColor"
                    fillOpacity={0.15}
                  />
                  {/* Floating Rank Number */}
                  <div className={`absolute -top-1 -right-1 w-7 h-7 rounded-full ${theme.rankBg} border-2 border-white text-white flex items-center justify-center text-xs font-bold shadow-md`}>
                    {rank}
                  </div>
                </div>

                {/* Info Section */}
                <div className="ml-4 flex-1">
                  <h4 className="text-[15px] font-bold text-slate-800 leading-none truncate pr-2 tracking-tight">
                    {performer.employee.name}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                    {performer.employee.position}
                  </p>
                </div>

                {/* Award Count Badge (Minimalist) */}
                <div className="mr-6 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Award size={16} className="text-blue-500" />
                  <span className="text-sm font-black text-slate-700">{performer.count}</span>
                </div>

              </div>
              
              {/* Subtle Shadow Effect */}
              <div className="absolute inset-0 bg-slate-400/5 blur-xl rounded-full translate-y-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopPerformersCard;