import React from "react";
import {
  Trophy,
  Crown,
  RefreshCw,
  ArrowRight,
  Zap,
  Sparkles
} from "lucide-react";

const QuickActionsCard = ({ posts, onViewPost, onRefresh }) => {
  return (
    <div className="relative overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 transition-all duration-300">
      
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-xl">
            <Zap size={18} className="text-amber-600 fill-amber-600" />
          </div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
            Quick Actions
          </h3>
        </div>
        <Sparkles size={16} className="text-slate-300" />
      </div>

      <div className="space-y-3">
        {/* Latest Recognition Button */}
        <button
          onClick={() => posts.length > 0 && onViewPost(posts[0])}
          className="w-full group relative flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-[1.8rem] transition-all duration-300 border border-transparent hover:border-rose-100 hover:shadow-lg hover:shadow-rose-500/5 overflow-hidden"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border border-slate-100">
              <Trophy className="w-6 h-6 text-rose-500" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800 text-sm">Latest Recog</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Recent Award</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight size={14} className="text-rose-600" />
          </div>
        </button>

        {/* Top Performer Button */}
        <button
          onClick={() => {
            const employeeMap = {};
            posts.forEach((post) => {
              if (post.employee) {
                const key = post.employee.employeeId || post.employee._id;
                if (key) {
                  employeeMap[key] = {
                    employee: post.employee,
                    count: (employeeMap[key]?.count || 0) + 1,
                  };
                }
              }
            });
            const topEmployee = Object.values(employeeMap).sort((a, b) => b.count - a.count)[0];
            if (topEmployee) {
              const topPost = posts.find(p => (p.employee?.employeeId || p.employee?._id) === (topEmployee.employee.employeeId || topEmployee.employee._id));
              if (topPost) onViewPost(topPost);
            }
          }}
          className="w-full group relative flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-[1.8rem] transition-all duration-300 border border-transparent hover:border-amber-100 hover:shadow-lg hover:shadow-amber-500/5 overflow-hidden"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 border border-slate-100">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800 text-sm">Top Performer</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Most Awards</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight size={14} className="text-amber-600" />
          </div>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="w-full group relative flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-[1.8rem] transition-all duration-300 border border-transparent hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 overflow-hidden"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-180 transition-transform duration-500 border border-slate-100">
              <RefreshCw className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-800 text-sm">Sync Data</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Update Feed</div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight size={14} className="text-blue-600" />
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <p className="mt-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Select an action to begin
      </p>
    </div>
  );
};

export default QuickActionsCard;