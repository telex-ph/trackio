import React from "react";
import { BarChart3, Sparkles, Users, Award, Badge } from "lucide-react";

const HighlightsCard = ({ posts, currentMonth }) => {
  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <BarChart3 className="mr-2" size={22} />
        {currentMonth || getCurrentMonth()} Highlights
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles size={14} />
            </div>
            <span>Total Recognitions</span>
          </div>
          <span className="font-bold text-lg">{posts.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Users size={14} />
            </div>
            <span>Featured Employees</span>
          </div>
          <span className="font-bold text-lg">
            {
              new Set(
                posts.map((post) => post.employee?.name).filter(Boolean)
              ).size
            }
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Award size={14} />
            </div>
            <span>Award Types</span>
          </div>
          <span className="font-bold text-lg">
            {
              new Set(
                posts
                  .map((post) => post.recognitionType)
                  .filter(Boolean)
              ).size
            }
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Badge size={14} />
            </div>
            <span>Badges Awarded</span>
          </div>
          <span className="font-bold text-lg">{posts.length}</span>
        </div>
      </div>
    </div>
  );
};

export default HighlightsCard;