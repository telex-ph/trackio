import React, { useState, useEffect } from "react";
import { Badge, Sparkles } from "lucide-react";
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
      <button className="px-4 py-3 bg-gray-300 text-gray-600 rounded-xl font-medium flex items-center gap-2 opacity-50">
        <Badge size={20} />
        <span>My Achievements</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleOpenAchievements}
        className="relative flex items-center gap-2 p-2.5 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all duration-300 group"
        title="View My Achievements"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Badge className="w-4 h-4 text-white group-hover:text-red-100" />
          </div>
          {badgeCounts.total > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-700 to-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-sm">
              {badgeCounts.total}
            </span>
          )}
        </div>
        <div className="text-left">
          <div className="text-xs text-red-700 font-medium">
            My Achievements
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {badgeCounts.total > 0
              ? `${badgeCounts.total} Awards`
              : "View Awards"}
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* My Achievements Modal */}
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