// components/modals/MyAchievementsModal.js
import React, { useState, useEffect } from "react";
import {
  X, Trophy, Medal, Crown, Award, 
  Sparkles, TrendingUp, Star, Target, 
  ShieldCheck, ChevronRight
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
      badges.push({ id: 'first', name: 'First Recognition', icon: <Star />, description: 'The journey begins!', color: 'from-amber-400 to-orange-500' });
    }
    if (achievements.length >= 5) {
      badges.push({ id: 'five', name: 'High Performer', icon: <TrendingUp />, description: '5+ Recognitions earned', color: 'from-blue-400 to-indigo-600' });
    }
    if (achievements.length >= 10) {
      badges.push({ id: 'ten', name: 'Elite Contributor', icon: <Crown />, description: '10+ Milestone reached', color: 'from-purple-500 to-fuchsia-600' });
    }
    return badges;
  };

  const getRecognitionTypeInfo = (type) => {
    const types = {
      employee_of_month: { icon: <Crown size={18} />, color: "text-amber-600", bg: "bg-amber-50", label: "Employee of Month" },
      excellence_award: { icon: <Medal size={18} />, color: "text-purple-600", bg: "bg-purple-50", label: "Excellence" },
      innovation: { icon: <Sparkles size={18} />, color: "text-blue-600", bg: "bg-blue-50", label: "Innovation" },
      team_player: { icon: <Target size={18} />, color: "text-emerald-600", bg: "bg-emerald-50", label: "Team Player" },
      default: { icon: <Award size={18} />, color: "text-slate-600", bg: "bg-slate-50", label: "Recognition" }
    };
    return types[type] || types.default;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-slate-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col animate-scaleUp">
        
        {/* Header Section */}
        <div className="p-8 bg-white flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-200">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Wall of Fame</h2>
              <p className="text-slate-500 text-sm font-medium">Your milestones and professional honors</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <X className="text-slate-400 group-hover:text-slate-600" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* User Profile Card */}
          {currentUser && (
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="relative flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-red-500 to-orange-400">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-slate-800">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{currentUser.name}</h3>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                    {currentUser.position}  {currentUser.department}
                  </p>
                </div>
                <div className="flex gap-4">
                   <div className="text-center px-6 border-l border-slate-100">
                      <div className="text-3xl font-black text-red-600">{achievementCount}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awards</div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievement Badges Grid */}
          {stats.badges.length > 0 && (
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Mastery Badges</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.badges.map((badge) => (
                  <div key={badge.id} className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-red-200 transition-all hover:shadow-md">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                      {badge.icon}
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm mb-1">{badge.name}</h5>
                    <p className="text-slate-500 text-xs leading-relaxed">{badge.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Timeline of Achievements */}
          <section>
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Recent Recognition</h4>
             <div className="space-y-3">
                {stats.recent.map((item) => {
                  const info = getRecognitionTypeInfo(item.recognitionType);
                  return (
                    <div key={item._id} className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:scale-[1.01] transition-transform">
                      <div className={`p-3 rounded-2xl ${info.bg} ${info.color}`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{info.label}</span>
                            <h5 className="font-bold text-slate-800 leading-tight">{item.title}</h5>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1 italic">"{item.description}"</p>
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>

          {/* Empty State */}
          {achievementCount === 0 && (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">Your journey starts here</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2 mb-6">Receive your first recognition to unlock your Wall of Fame.</p>
              <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-red-600 transition-colors shadow-lg">
                Got it!
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MyAchievementsModal;