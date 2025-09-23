import React from "react";

const recentActivities = [
  {
    id: 1,
    employee: "John Rivera",
    department: "IT Department",
    action: "Started Break",
    time: "2:30 PM",
    timestamp: "5 mins ago",
    type: "break",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 2,
    employee: "Carlos Mendoza",
    department: "Customer Service",
    action: "Ended Break",
    time: "1:45 PM",
    timestamp: "20 mins ago",
    type: "break_end",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
  },
  {
    id: 3,
    employee: "Ana Reyes",
    department: "Customer Service",
    action: "Started Lunch",
    time: "12:00 PM",
    timestamp: "2 hours ago",
    type: "lunch",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
  },
  {
    id: 4,
    employee: "Mark Reyes",
    department: "Management",
    action: "Timed Out",
    time: "6:30 PM",
    timestamp: "30 mins ago",
    type: "timeout",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 5,
    employee: "Sarah Johnson",
    department: "HR",
    action: "Timed In",
    time: "8:05 AM",
    timestamp: "8 hours ago",
    type: "timein",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 6,
    employee: "Mike Chen",
    department: "Finance",
    action: "Ended Lunch",
    time: "1:00 PM",
    timestamp: "1 hour ago",
    type: "lunch_end",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
];

const ActivityMonitorList = () => {
  return (
    <div className="p-4 relative overflow-hidden bg-white border-light rounded-md h-full flex flex-col">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-full -translate-y-10 translate-x-10"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gray-100 rounded-full translate-y-8 -translate-x-8"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-1 h-4 bg-white rounded-full ml-1"></div>
          </div>
          <div>
            <span className="font-bold">Activity Monitor</span>
            <p className="text-sm text-gray-500">Employee time tracking</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Active</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="relative flex-1 overflow-y-auto z-10 space-y-3 pr-1">
        {recentActivities.map((activity, index) => (
          <div
            key={activity.id}
            className="group bg-gray-50/40 hover:bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 relative"
          >
            {/* Minimal status line */}
            <div
              className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${
                activity.type === "timein"
                  ? "bg-green-400"
                  : activity.type === "timeout"
                  ? "bg-red-400"
                  : activity.type === "break"
                  ? "bg-blue-400"
                  : activity.type === "break_end"
                  ? "bg-blue-300"
                  : activity.type === "lunch"
                  ? "bg-orange-400"
                  : activity.type === "lunch_end"
                  ? "bg-orange-300"
                  : "bg-gray-300"
              }`}
            />

            <div className="flex items-start space-x-4 ml-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={activity.avatar}
                  alt={activity.employee}
                  className="w-11 h-11 rounded-lg object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-shadow duration-200"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    activity.type === "timein"
                      ? "bg-green-400"
                      : activity.type === "timeout"
                      ? "bg-red-400"
                      : activity.type === "break" ||
                        activity.type === "break_end"
                      ? "bg-blue-400"
                      : activity.type === "lunch" ||
                        activity.type === "lunch_end"
                      ? "bg-orange-400"
                      : "bg-gray-400"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* Employee info */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {activity.employee}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {activity.department || "Customer Service"} •{" "}
                      {activity.position || "Representative"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
                      {activity.time}
                    </span>
                  </div>
                </div>

                {/* Action and status */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center space-x-2 text-xs font-medium px-2.5 py-1 rounded-md border ${
                      activity.type === "timein"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : activity.type === "timeout"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : activity.type === "break"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : activity.type === "break_end"
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : activity.type === "lunch"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : activity.type === "lunch_end"
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        activity.type === "timein"
                          ? "bg-green-400"
                          : activity.type === "timeout"
                          ? "bg-red-400"
                          : activity.type === "break" ||
                            activity.type === "break_end"
                          ? "bg-blue-400"
                          : activity.type === "lunch" ||
                            activity.type === "lunch_end"
                          ? "bg-orange-400"
                          : "bg-gray-400"
                      }`}
                    />
                    <span>{activity.action}</span>
                  </span>

                  <span className="text-xs text-gray-400 font-medium">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityMonitorList;
