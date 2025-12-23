import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  X,
  RefreshCw,
  Loader,
  Download,
  Calendar,
  Clock,
  Check,
  Crown,
  Medal,
  Lightbulb,
  Heart,
  Badge as BadgeIcon,
  Shield,
  Filter,
  ArrowUpRight,
} from "lucide-react";

const MyAchievementsModal = ({ isOpen, onClose, allPosts, currentUser }) => {
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (currentUser) {
        setUserData(currentUser);
        fetchUserAchievements();
      }
    }
  }, [isOpen, filterType, sortBy, allPosts, currentUser]);

  const fetchUserAchievements = () => {
    setLoading(true);

    if (!currentUser) {
      setUserAchievements([]);
      setLoading(false);
      return;
    }

    let achievements = allPosts.filter((post) => {
      if (!post.employee) return false;
      
      const currentUserEmployeeId = currentUser.employeeId || "";
      const currentUserId = currentUser._id || "";
      const postEmployeeId = post.employee.employeeId || "";
      const postEmployeeMongoId = post.employee._id || "";
      
      return (
        currentUserEmployeeId === postEmployeeId ||
        currentUserId === postEmployeeMongoId
      );
    });

    if (filterType !== "all") {
      achievements = achievements.filter(
        (ach) => ach.recognitionType === filterType
      );
    }

    achievements.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "award_type":
          return a.recognitionType.localeCompare(b.recognitionType);
        default:
          return dateB - dateA;
      }
    });

    setUserAchievements(achievements);
    setLoading(false);
  };

  const getAchievementTypeInfo = (type) => {
    const types = {
      employee_of_month: {
        icon: <Crown className="w-5 h-5" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        label: "Employee of Month",
        gradient: "from-yellow-500 to-amber-500",
      },
      excellence_award: {
        icon: <Medal className="w-5 h-5" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        label: "Excellence Award",
        gradient: "from-purple-500 to-indigo-500",
      },
      innovation: {
        icon: <Lightbulb className="w-5 h-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "Innovation Award",
        gradient: "from-blue-500 to-cyan-500",
      },
      team_player: {
        icon: <Heart className="w-5 h-5" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Team Player Award",
        gradient: "from-green-500 to-emerald-500",
      },
    };

    return (
      types[type] || {
        icon: <Award className="w-5 h-5" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        label: "Recognition",
        gradient: "from-gray-500 to-slate-500",
      }
    );
  };

  const getStats = () => {
    const total = userAchievements.length;
    const types = {};

    userAchievements.forEach((ach) => {
      if (!types[ach.recognitionType]) {
        types[ach.recognitionType] = 0;
      }
      types[ach.recognitionType]++;
    });

    return { total, types };
  };

  const stats = getStats();

  const filterTypes = [
    {
      id: "all",
      label: "All Awards",
      icon: <Trophy size={16} />,
      color: "from-red-500 to-red-600",
    },
    {
      id: "employee_of_month",
      label: "Employee of Month",
      icon: <Crown size={16} />,
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "excellence_award",
      label: "Excellence Award",
      icon: <Medal size={16} />,
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "innovation",
      label: "Innovation Award",
      icon: <Lightbulb size={16} />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "team_player",
      label: "Team Player",
      icon: <Heart size={16} />,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const sortOptions = [
    { id: "newest", label: "Newest First", icon: <ArrowUpRight size={14} /> },
    {
      id: "oldest",
      label: "Oldest First",
      icon: <ArrowUpRight size={14} className="rotate-180" />,
    },
    { id: "award_type", label: "By Award Type", icon: <Filter size={14} /> },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                  <BadgeIcon className="w-5 h-5 text-white" />
                </div>
                <span>My Achievements</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Your personal recognition gallery
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* User Profile Card */}
          {userData && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {userData.firstName
                    ? userData.firstName.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-xl">
                    {userData.firstName} {userData.lastName}
                  </h3>
                  <p className="text-gray-600">
                    {userData.position || userData.role || "Employee"}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Trophy size={14} className="text-red-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {stats.total} Achievements
                      </span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                      <Shield size={14} className="text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Achievement Dashboard
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Employee ID</div>
                  <div className="font-mono font-bold text-gray-900">
                    {userData.employeeId || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Awards</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </div>
                </div>
              </div>
            </div>

            {filterTypes.slice(1).map((filter) => {
              const count = stats.types[filter.id] || 0;
              return (
                <div
                  key={filter.id}
                  className={`border rounded-xl p-4 ${
                    count > 0
                      ? `bg-gradient-to-r ${filter.color} bg-opacity-10`
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-r ${filter.color} flex items-center justify-center`}
                    >
                      <div className="text-white">
                        {React.cloneElement(filter.icon, {
                          className: "w-5 h-5",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        {filter.label}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {count}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Filter by Award Type
              </div>
              <div className="flex flex-wrap gap-2">
                {filterTypes.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterType(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      filterType === filter.id
                        ? `bg-gradient-to-r ${filter.color} text-white shadow-md`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.icon}
                    <span className="text-sm font-medium">
                      {filter.label}
                    </span>
                    {filter.id !== "all" && stats.types[filter.id] && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          filterType === filter.id
                            ? "bg-white/30"
                            : "bg-gray-300"
                        }`}
                      >
                        {stats.types[filter.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full md:w-48">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Sort By
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-center mb-4">
                <Loader size={24} className="animate-spin text-red-600" />
              </div>
              <p className="text-gray-600">Loading your achievements...</p>
            </div>
          ) : userAchievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Achievements Yet
              </h3>
              <p className="text-gray-600 mb-6">
                {filterType === "all"
                  ? "You haven't received any recognitions yet. Keep up the great work!"
                  : `No ${
                      filterTypes.find((f) => f.id === filterType)?.label
                    } recognitions found.`}
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Start earning achievements today!
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userAchievements.map((achievement, index) => {
                const typeInfo = getAchievementTypeInfo(
                  achievement.recognitionType
                );
                const achievementDate = new Date(achievement.createdAt);
                const isNew =
                  new Date() - achievementDate < 7 * 24 * 60 * 60 * 1000;

                return (
                  <div
                    key={achievement._id}
                    className="group border border-gray-200 rounded-2xl p-5 hover:border-red-300 hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    <div className="flex gap-4">
                      {/* Badge */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className={`w-20 h-20 rounded-xl bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <div className="text-white">
                            {React.cloneElement(typeInfo.icon, {
                              className: "w-10 h-10",
                            })}
                          </div>
                        </div>
                        {isNew && (
                          <div className="absolute -top-2 -right-2">
                            <div className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                              NEW
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-bold ${typeInfo.bgColor} ${typeInfo.color} border ${typeInfo.borderColor}`}
                              >
                                {typeInfo.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{index + 1}
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors">
                              {achievement.title}
                            </h4>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {achievement.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {achievementDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {achievementDate.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            ID:{" "}
                            {achievement._id?.substring(0, 6).toUpperCase()}
                          </div>
                        </div>

                        {/* Validation Badge */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-green-600">
                            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                              <Check size={10} />
                            </div>
                            <span>Validated by management</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Certificate No.{" "}
                            {achievement._id?.substring(18, 24).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-5 rounded-b-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-red-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Achievements Dashboard
                  </div>
                  <div className="text-xs text-gray-600">
                    Track your recognition progress
                  </div>
                </div>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="text-sm text-gray-700">
                <span className="font-bold">{stats.total}</span> achievement
                {stats.total !== 1 ? "s" : ""} •
                <span className="font-bold ml-1">
                  {Object.keys(stats.types).length}
                </span>{" "}
                category{Object.keys(stats.types).length !== 1 ? "ies" : ""}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <button
                onClick={() => fetchUserAchievements()}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAchievementsModal;