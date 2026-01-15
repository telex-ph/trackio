import React from "react";
import { BarChart3, Sparkles, Users, Award, Badge, Target } from "lucide-react";

const HighlightsCard = ({ posts, currentMonth }) => {
  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Data Calculations
  const totalRecognitions = posts.length;
  const featuredEmployees = new Set(
    posts.map((post) => post.employee?.name).filter(Boolean)
  ).size;
  const awardTypes = new Set(
    posts.map((post) => post.recognitionType).filter(Boolean)
  ).size;

  return (
    <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10">
     
      {/* Background Decorative Gradient */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />
     
      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            <Target size={14} className="animate-pulse" /> Performance
          </h3>
          <h4 className="text-xl font-black text-slate-800 tracking-tight">
            {currentMonth || getCurrentMonth()} Highlights
          </h4>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
          <BarChart3 size={24} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
       
        {/* Total Recognitions */}
        <div className="group p-4 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 transition-all hover:scale-[1.03]">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform">
            <Sparkles size={18} className="text-blue-500" />
          </div>
          <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-black text-slate-800 leading-none">{totalRecognitions}</p>
        </div>

        {/* Featured Employees */}
        <div className="group p-4 rounded-[1.5rem] bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/50 transition-all hover:scale-[1.03]">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:-rotate-6 transition-transform">
            <Users size={18} className="text-purple-500" />
          </div>
          <p className="text-[10px] font-bold text-purple-600/70 uppercase tracking-wider mb-1">Featured</p>
          <p className="text-2xl font-black text-slate-800 leading-none">{featuredEmployees}</p>
        </div>

        {/* Award Types */}
        <div className="group p-4 rounded-[1.5rem] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 transition-all hover:scale-[1.03]">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:rotate-6 transition-transform">
            <Award size={18} className="text-amber-500" />
          </div>
          <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-1">Types</p>
          <p className="text-2xl font-black text-slate-800 leading-none">{awardTypes}</p>
        </div>

        {/* Badges Awarded */}
        <div className="group p-4 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 transition-all hover:scale-[1.03]">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 group-hover:-rotate-6 transition-transform">
            <Badge size={18} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Badges</p>
          <p className="text-2xl font-black text-slate-800 leading-none">{totalRecognitions}</p>
        </div>

      </div>

      {/* Footer Insight */}
      <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
        <div className="flex -space-x-2">
            {[...Array(Math.min(featuredEmployees, 4))].map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200" />
            ))}
            {featuredEmployees > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                    +{featuredEmployees - 4}
                </div>
            )}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Real-time Updates
        </span>
      </div>
    </div>
  );
};

export default HighlightsCard;