import React from "react";
import {
  Trophy,
  Crown,
  RefreshCw,
  ArrowUpRight,
  Zap,
} from "lucide-react";

const QuickActionsCard = ({ posts, onViewPost, onRefresh }) => {
  return (
    <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <Zap className="mr-2" size={20} />
        Quick Actions
      </h3>
      <div className="space-y-3">
        <button
          onClick={() => {
            if (posts.length > 0) {
              onViewPost(posts[0]);
            }
          }}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all group/action"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Latest Recognition
              </div>
              <div className="text-xs text-gray-600">
                View most recent award
              </div>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="text-gray-400 group-hover/action:text-red-600 transition-colors"
          />
        </button>

        <button
          onClick={() => {
            // Find employee with most recognitions
            const employeeMap = {};
            posts.forEach((post) => {
              if (post.employee) {
                const employeeKey = post.employee.employeeId || post.employee._id;
                if (employeeKey) {
                  if (!employeeMap[employeeKey]) {
                    employeeMap[employeeKey] = {
                      employee: post.employee,
                      count: 0,
                    };
                  }
                  employeeMap[employeeKey].count++;
                }
              }
            });

            const topEmployee = Object.values(employeeMap).sort(
              (a, b) => b.count - a.count
            )[0];
            if (topEmployee) {
              const topPost = posts.find(
                (post) => {
                  if (!post.employee) return false;
                  const postEmployeeKey = post.employee.employeeId || post.employee._id;
                  const topEmployeeKey = topEmployee.employee.employeeId || topEmployee.employee._id;
                  return postEmployeeKey === topEmployeeKey;
                }
              );
              if (topPost) {
                onViewPost(topPost);
              }
            }
          }}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 rounded-xl transition-all group/action"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Top Performer
              </div>
              <div className="text-xs text-gray-600">
                View employee with most awards
              </div>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="text-gray-400 group-hover/action:text-yellow-600 transition-colors"
          />
        </button>

        <button
          onClick={onRefresh}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all group/action"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Refresh Data
              </div>
              <div className="text-xs text-gray-600">
                Update with latest recognitions
              </div>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="text-gray-400 group-hover/action:text-blue-600 transition-colors"
          />
        </button>
      </div>
    </div>
  );
};

export default QuickActionsCard;