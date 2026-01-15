import React, { useState, useEffect } from "react";
import { Award, Sparkles, ChevronRight } from "lucide-react";
import MyAchievementsModal from "./modals/MyAchievementsModal";

const EmployeeBadges = ({ allPosts, currentUser }) => {
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({ total: 0 });

  useEffect(() => {
    if (currentUser) {
      setCurrentUserData(currentUser);

      if (allPosts && allPosts.length > 0) {
        const userRecognitions = allPosts.filter((post) => {
          if (!post.employee) return false;
          
          const postEmployeeId = post.employee.employeeId || "";
          const postEmployeeMongoId = post.employee._id || "";
          const userEmployeeId = currentUser.employeeId || "";
          const userId = currentUser._id || "";
          
          return (
            userEmployeeId === postEmployeeId ||
            userId === postEmployeeMongoId
          );
        });

        const counts = {
          employee_of_month: 0,
          excellence_award: 0,
          innovation: 0,
          team_player: 0,
          total: userRecognitions.length,
        };

        userRecognitions.forEach((rec) => {
          if (counts[rec.recognitionType] !== undefined) {
            counts[rec.recognitionType]++;
          }
        });

        setBadgeCounts(counts);
      }
    }
  }, [currentUser, allPosts]);

  const handleOpenAchievements = () => {
    if (currentUser) {
      setShowAchievementsModal(true);
    }
  };

  if (!currentUserData) {
    return (
      <div className="h-14 w-48 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. Target lahat ng elements na pwedeng mag-scroll */
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }

        /* 2. Target para sa Firefox */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        /* 3. Force target sa div na tinukoy mo kanina */
        .overflow-y-auto {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          display: none !important;
        }
      `}} />

      <button
        onClick={handleOpenAchievements}
        className="relative flex items-center gap-4 p-1.5 pr-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <Award className="w-6 h-6 text-white" />
            </div>
            
            {badgeCounts.total > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                {badgeCounts.total}
              </span>
            )}
          </div>

          <div className="text-left relative z-10">
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-black text-indigo-500">
                Milestones
              </span>
              <Sparkles className="w-2.5 h-2.5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
            <div className="text-sm font-bold text-gray-800 leading-tight">
              {badgeCounts.total > 0
                ? `${badgeCounts.total} Achievements`
                : "No Awards Yet"}
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all ml-auto relative z-10" />
      </button>

      {showAchievementsModal && currentUserData && (
        <MyAchievementsModal
          isOpen={showAchievementsModal}
          onClose={() => setShowAchievementsModal(false)}
          allPosts={allPosts}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default EmployeeBadges;