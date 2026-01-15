import React, { useState, useEffect } from "react";
import {
  X, Trophy, Medal, Crown, Award, 
  Sparkles, TrendingUp, Star, Target, 
  ShieldCheck, ChevronRight, Calendar,
  Briefcase
} from "lucide-react";

const MyAchievementsModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  userAchievements = [],
  achievementCount = 0 
}) => {
  const [stats, setStats] = useState({
    total: 0,
    byType: {},
    recent: [],
    badges: []
  });

  useEffect(() => {
    if (isOpen && currentUser && userAchievements.length > 0) {
      calculateStats();
    }
  }, [isOpen, currentUser, userAchievements]);

  const calculateStats = () => {
    const byType = {};
    userAchievements.forEach(achievement => {
      const type = achievement.recognitionType || 'general';
      byType[type] = (byType[type] || 0) + 1;
    });

    const recent = [...userAchievements]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    const badges = calculateBadges(userAchievements);

    setStats({
      total: userAchievements.length,
      byType,
      recent,
      badges
    });
  };

  const calculateBadges = (achievements) => {
    const badges = [];
    if (achievements.length >= 1) {
      badges.push({ id: 'first', name: 'First Recognition', icon: <Star size={16} />, description: 'The journey begins!', color: 'bg-amber-500' });
    }
    if (achievements.length >= 5) {
      badges.push({ id: 'five', name: 'High Performer', icon: <TrendingUp size={16} />, description: '5+ Recognitions earned', color: 'bg-blue-600' });
    }
    if (achievements.length >= 10) {
      badges.push({ id: 'ten', name: 'Elite Contributor', icon: <Crown size={16} />, description: '10+ Milestone reached', color: 'bg-[#800000]' });
    }
    return badges;
  };

  const getRecognitionTypeInfo = (type) => {
    const types = {
      employee_of_month: { icon: <Crown size={16} />, color: "text-amber-600", bg: "bg-amber-50", label: "Employee of Month" },
      excellence_award: { icon: <Medal size={16} />, color: "text-purple-600", bg: "bg-purple-50", label: "Excellence" },
      innovation: { icon: <Sparkles size={16} />, color: "text-blue-600", bg: "bg-blue-50", label: "Innovation" },
      team_player: { icon: <Target size={16} />, color: "text-emerald-600", bg: "bg-emerald-50", label: "Team Player" },
      default: { icon: <Award size={16} />, color: "text-slate-600", bg: "bg-slate-50", label: "Recognition" }
    };
    return types[type] || types.default;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Compact Modal - Professional Corners */}
      <div className="relative bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl shadow-2xl flex flex-col border border-slate-200">
        
        {/* Maroon Accent Line */}
        <div className="h-1.5 w-full bg-[#800000] shrink-0" />

        {/* Header Section */}
        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#800000] rounded-md flex items-center justify-center shadow-md">
              <Trophy className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Wall of Fame</h2>
              <p className="text-xs text-slate-500 font-medium">Your milestones and professional honors</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-50 rounded-md transition-all text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="p-6 space-y-6">
            
            {/* User Profile Card */}
            {currentUser && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center p-5 gap-5">
                  <div className="w-16 h-16 rounded-lg bg-[#800000] flex items-center justify-center text-xl font-bold text-white shadow-sm">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 leading-tight truncate">{currentUser.name}</h3>
                    <p className="text-[11px] text-[#800000] font-bold mt-0.5">
                      {currentUser.position} {currentUser.department}
                    </p>
                  </div>
                  <div className="text-center px-4 py-2 border-l border-slate-100">
                    <span className="block text-2xl font-bold text-[#800000] leading-none">{achievementCount}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Awards</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mastery Badges Section */}
            {stats.badges.length > 0 && (
              <section>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 ml-1">Mastery Badges</h4>
                <div className="grid grid-cols-3 gap-3">
                  {stats.badges.map((badge) => (
                    <div key={badge.id} className="bg-white p-3 rounded-lg border border-slate-100 flex flex-col items-center text-center shadow-sm">
                      <div className={`w-8 h-8 rounded-md ${badge.color} flex items-center justify-center text-white mb-2 shadow-sm`}>
                        {badge.icon}
                      </div>
                      <h5 className="text-[10px] font-bold text-slate-800 leading-tight">{badge.name}</h5>
                      <p className="text-[9px] text-slate-500 mt-1 leading-tight">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Recognition Section */}
            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 ml-1">Recent Recognition</h4>
              <div className="space-y-2">
                {stats.recent.map((item) => {
                  const info = getRecognitionTypeInfo(item.recognitionType);
                  return (
                    <div key={item._id} className="group flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-100 hover:border-[#800000]/20 transition-all shadow-sm">
                      <div className={`w-10 h-10 shrink-0 rounded-md flex items-center justify-center ${info.bg} ${info.color}`}>
                        {info.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-[#800000] uppercase leading-none mb-1">{info.label}</span>
                            <h5 className="font-bold text-slate-800 text-sm truncate">{item.title}</h5>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate italic">"{item.description}"</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Empty State */}
            {achievementCount === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-100">
                <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Your journey starts here</h3>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto mt-1 mb-5">Receive your first recognition to unlock your Wall of Fame.</p>
                <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-md font-bold text-[10px] hover:bg-[#800000] transition-colors">
                  Got it!
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Footer Area */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#800000]" />
            <span className="text-[10px] font-bold text-slate-400">Verified system record</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#800000] text-white rounded-md text-[11px] font-bold hover:bg-[#600000] transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAchievementsModal;