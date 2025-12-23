import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Users,
  X,
  BarChart3,
  Users as Group,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Loader,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Download,
  Badge,
  FileText,
  History,
  Calendar,
  Medal,
  Crown,
  Zap,
  Lightbulb,
  Heart,
  Clock,
  Check,
  AlertCircle,
  Shield,
  Filter,
} from "lucide-react";
import api from "../../utils/axios";
import socket from "../../utils/socket";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper function to get user from localStorage
const getCurrentUserFromStorage = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user;
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }
  return null;
};

// Custom Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 animate-slideIn ${
        type === "success"
          ? "bg-gradient-to-r from-green-500 to-green-600"
          : "bg-gradient-to-r from-red-500 to-red-600"
      } text-white px-4 py-2 rounded-lg flex items-center gap-2`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X size={14} />
      </button>
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
      </div>
      <p className="text-gray-600 text-sm mt-2">Loading recognitions...</p>
    </div>
  </div>
);

// Small Loading Indicator
const SmallLoader = () => (
  <div className="flex items-center justify-center">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
  </div>
);

// Top Performers Component
const TopPerformers = ({ posts }) => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (posts && posts.length > 0) {
      calculateTopPerformers();
    } else {
      setTopPerformers([]);
      setLoading(false);
    }
  }, [posts]);

  const calculateTopPerformers = () => {
    setLoading(true);

    try {
      const employeeMap = {};

      posts.forEach((post) => {
        if (post && post.employee && post.employee.employeeId) {
          const employeeId = post.employee.employeeId;
          const employeeName = post.employee.name || "Unknown Employee";
          const employeePosition = post.employee.position || "Employee";

          if (!employeeMap[employeeId]) {
            employeeMap[employeeId] = {
              employee: {
                ...post.employee,
                name: employeeName,
                position: employeePosition,
              },
              count: 0,
              totalScore: 0,
              awards: [],
            };
          }

          let awardScore = 1;
          const type = post.recognitionType;
          switch (type) {
            case "employee_of_month":
              awardScore = 5;
              break;
            case "excellence_award":
              awardScore = 4;
              break;
            case "innovation":
              awardScore = 3;
              break;
            case "team_player":
              awardScore = 2;
              break;
            default:
              awardScore = 1;
          }

          employeeMap[employeeId].count++;
          employeeMap[employeeId].totalScore += awardScore;
          employeeMap[employeeId].awards.push({
            type: type,
            title: post.title,
            date: post.createdAt,
          });
        }
      });

      const performersArray = Object.values(employeeMap);
      performersArray.sort((a, b) => b.totalScore - a.totalScore);

      const top5 = performersArray.slice(0, 5);
      setTopPerformers(top5);
    } catch (error) {
      console.error("Error calculating top performers:", error);
      setTopPerformers([]);
    } finally {
      setLoading(false);
    }
  };

  const getAwardTypeIcon = (type) => {
    switch (type) {
      case "employee_of_month":
        return <Crown className="w-3 h-3 text-yellow-600" />;
      case "excellence_award":
        return <Medal className="w-3 h-3 text-purple-600" />;
      case "innovation":
        return <Lightbulb className="w-3 h-3 text-blue-600" />;
      case "team_player":
        return <Heart className="w-3 h-3 text-green-600" />;
      default:
        return <Award className="w-3 h-3 text-gray-600" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "from-yellow-500 to-amber-500";
      case 2:
        return "from-gray-400 to-gray-500";
      case 3:
        return "from-amber-700 to-amber-800";
      case 4:
        return "from-blue-500 to-blue-600";
      case 5:
        return "from-green-500 to-green-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      case 4:
        return "4th";
      case 5:
        return "5th";
      default:
        return `${rank}th`;
    }
  };

  const getAwardTypeDisplay = (type) => {
    if (!type) return "Award";

    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
        <div className="flex items-center justify-center h-32">
          <SmallLoader />
        </div>
      </div>
    );
  }

  if (topPerformers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy size={30} />
          Top Performers
        </h3>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No top performers data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy size={20} />
        Top Performers
      </h3>

      <div className="space-y-3">
        {topPerformers.map((performer, index) => {
          const rank = index + 1;
          const awardTypes = performer.awards
            ? [...new Set(performer.awards.map((a) => a.type).filter(Boolean))]
            : [];

          const employeeName = performer.employee?.name || "Unknown Employee";
          const employeePosition = performer.employee?.position || "Employee";

          return (
            <div
              key={performer.employee?.employeeId || index}
              className="group p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-pointer hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRankColor(
                    rank
                  )} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                >
                  {getRankBadge(rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {employeeName}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-bold text-gray-700">
                        {performer.count} award
                        {performer.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 truncate mb-2">
                    {employeePosition}
                  </p>

                  {awardTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {awardTypes.slice(0, 3).map((type, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-gray-200"
                        >
                          {getAwardTypeIcon(type)}
                          <span className="text-xs text-gray-700">
                            {getAwardTypeDisplay(type)}
                          </span>
                        </div>
                      ))}
                      {awardTypes.length > 3 && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          +{awardTypes.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// My Achievements Modal Component - OPEN TO ALL
const MyAchievementsModal = ({ isOpen, onClose, currentUserId, allPosts }) => {
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (isOpen && currentUserId) {
      fetchUserData();
      fetchUserAchievements();
    }
  }, [isOpen, currentUserId, filterType, sortBy, allPosts]);

  const fetchUserData = () => {
    const user = getCurrentUserFromStorage();
    if (user) {
      setUserData(user);
    }
  };

  const fetchUserAchievements = () => {
    setLoading(true);

    let achievements = allPosts.filter((post) => {
      const postEmployeeId = post.employee?.employeeId || post.employee?._id;
      return postEmployeeId === currentUserId;
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

  const handleDownloadCertificate = (achievement) => {
    setSelectedAchievement(achievement);
    setShowCertificate(true);
  };

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
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center">
                    <Badge className="w-5 h-5 text-white" />
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

                          {/* Action Buttons - ALWAYS ENABLED */}
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleDownloadCertificate(achievement)
                              }
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold hover:from-red-700 hover:to-red-800 transition-all hover:shadow-md group/dl"
                            >
                              <Download
                                size={16}
                                className="group-hover/dl:animate-bounce"
                              />
                              Download Certificate
                            </button>
                            <button
                              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2"
                              title="View achievement details"
                            >
                              <Award size={14} />
                              <span className="hidden sm:inline">View</span>
                            </button>
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

      {/* Certificate Modal - OPEN TO ALL */}
      {showCertificate && selectedAchievement && (
        <Certificate
          post={selectedAchievement}
          onClose={() => {
            setShowCertificate(false);
            setSelectedAchievement(null);
          }}
        />
      )}
    </>
  );
};

// Employee Badges Component
const EmployeeBadges = ({ allPosts }) => {
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [badgeCounts, setBadgeCounts] = useState({ total: 0 });

  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUserData(user);

          if (allPosts && allPosts.length > 0) {
            const userRecognitions = allPosts.filter((post) => {
              const postEmployeeId = post.employee?.employeeId || post.employee?._id;
              const userEmployeeId = user.employeeId || user._id;
              return postEmployeeId === userEmployeeId;
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
        } else {
          console.log("No user data in localStorage");
        }
      } catch (error) {
        console.error("Error fetching current user from localStorage:", error);
      }
    };

    fetchCurrentUser();
  }, [allPosts]);

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
        onClick={() => {
          setShowAchievementsModal(true);
        }}
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

      {/* My Achievements Modal - OPEN TO ALL */}
      {showAchievementsModal && (
        <MyAchievementsModal
          isOpen={showAchievementsModal}
          onClose={() => setShowAchievementsModal(false)}
          currentUserId={currentUserData.employeeId || currentUserData._id}
          allPosts={allPosts}
        />
      )}
    </>
  );
};

// Certificate Component - OPEN TO ALL
const Certificate = ({ post, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  const getCertificateData = () => {
    const typeInfo = {
      employee_of_month: {
        title: "Employee of the Month",
        subTitle: "Certificate of Excellence",
        borderColor: "#F59E0B",
        accentColor: "#D97706",
        gradient: "from-yellow-400 via-yellow-500 to-amber-500",
        icon: <Crown className="w-12 h-12" />,
      },
      excellence_award: {
        title: "Excellence Award",
        subTitle: "Certificate of Outstanding Performance",
        borderColor: "#8B5CF6",
        accentColor: "#7C3AED",
        gradient: "from-purple-400 via-purple-500 to-indigo-500",
        icon: <Medal className="w-12 h-12" />,
      },
      innovation: {
        title: "Innovation Award",
        subTitle: "Certificate of Creative Excellence",
        borderColor: "#3B82F6",
        accentColor: "#2563EB",
        gradient: "from-blue-400 via-blue-500 to-cyan-500",
        icon: <Lightbulb className="w-12 h-12" />,
      },
      team_player: {
        title: "Team Player Award",
        subTitle: "Certificate of Collaboration",
        borderColor: "#10B981",
        accentColor: "#059669",
        gradient: "from-green-400 via-green-500 to-emerald-500",
        icon: <Heart className="w-12 h-12" />,
      },
    };

    return (
      typeInfo[post.recognitionType] || {
        title: "Recognition Award",
        subTitle: "Certificate of Achievement",
        borderColor: "#6B7280",
        accentColor: "#4B5563",
        gradient: "from-gray-400 via-gray-500 to-slate-500",
        icon: <Award className="w-12 h-12" />,
      }
    );
  };

  const certificateInfo = getCertificateData();

  const downloadCertificate = async () => {
    setDownloading(true);
    try {
      const certificateElement = document.getElementById("certificate-content");

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const employeeName = post.employee?.name || "Employee";
      const fileName = `Certificate_${employeeName.replace(/\s+/g, "_")}_${
        post.recognitionType
      }_${new Date().getTime()}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Error downloading certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-red-600" />
                Certificate of Recognition
              </h2>
              <p className="text-gray-600 mt-1">
                Download and share this certificate
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Enhanced Certificate Design */}
          <div
            id="certificate-content"
            className="relative bg-gradient-to-br from-white to-gray-50 border-8 rounded-2xl overflow-hidden mb-6 shadow-lg"
            style={{ borderColor: certificateInfo.borderColor }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-5">
              <div
                className={`absolute top-8 left-8 w-16 h-16 rounded-full bg-gradient-to-r ${certificateInfo.gradient}`}
              ></div>
              <div
                className={`absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-r ${certificateInfo.gradient}`}
              ></div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 rotate-180">
              <div
                className={`absolute top-8 left-8 w-16 h-16 rounded-full bg-gradient-to-r ${certificateInfo.gradient}`}
              ></div>
              <div
                className={`absolute top-4 left-4 w-8 h-8 rounded-full bg-gradient-to-r ${certificateInfo.gradient}`}
              ></div>
            </div>

            {/* Certificate Header */}
            <div className="relative h-40 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center border-b border-gray-200">
              <div className="absolute top-4 left-4 opacity-10">
                <div className="text-6xl font-black text-gray-800 tracking-wider">
                  AWARD
                </div>
              </div>
              <div className="text-center relative z-10">
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${certificateInfo.gradient} flex items-center justify-center shadow-lg`}
                >
                  <div className="text-white">
                    {React.cloneElement(certificateInfo.icon, {
                      className: "w-10 h-10",
                    })}
                  </div>
                </div>
                <h1
                  className="text-4xl font-bold text-gray-900 mb-2"
                  style={{ color: certificateInfo.accentColor }}
                >
                  {certificateInfo.title}
                </h1>
                <p className="text-gray-600 text-lg">
                  {certificateInfo.subTitle}
                </p>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-10">
              <div className="text-center mb-10">
                <p className="text-gray-600 text-xl mb-8 font-medium">
                  This certificate is proudly presented to
                </p>
                <h2
                  className="text-5xl font-bold text-gray-900 mb-6 py-4 px-8 rounded-xl inline-block"
                  style={{
                    backgroundColor: `${certificateInfo.accentColor}15`,
                    borderLeft: `4px solid ${certificateInfo.accentColor}`,
                    borderRight: `4px solid ${certificateInfo.accentColor}`,
                  }}
                >
                  {post.employee?.name || "Employee Name"}
                </h2>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div
                    className="w-24 h-1 rounded-full"
                    style={{ backgroundColor: certificateInfo.accentColor }}
                  ></div>
                  <div className="text-gray-400">✦</div>
                  <div
                    className="w-24 h-1 rounded-full"
                    style={{ backgroundColor: certificateInfo.accentColor }}
                  ></div>
                </div>
                <p className="text-xl text-gray-700 mb-10 font-medium">
                  in recognition of outstanding achievement and dedication
                </p>
              </div>

              <div className="mb-10">
                <p className="text-lg text-gray-700 text-center mb-6">
                  For exceptional performance in:{" "}
                  <span
                    className="font-bold text-lg"
                    style={{ color: certificateInfo.accentColor }}
                  >
                    {post.title}
                  </span>
                </p>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-700 text-lg italic text-center leading-relaxed">
                    "{post.description}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Date Awarded
                  </div>
                  <div className="font-bold text-gray-900 text-xl">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Award Type
                  </div>
                  <div
                    className="font-bold text-xl"
                    style={{ color: certificateInfo.accentColor }}
                  >
                    {certificateInfo.title}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-10 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Presented by
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    Company Leadership
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Trackio Recognition System
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2 font-medium">
                    Recognition ID
                  </div>
                  <div className="font-mono font-bold text-gray-900 text-lg bg-gray-100 px-3 py-1 rounded-lg">
                    {post._id?.substring(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-8xl font-black text-gray-800 mb-4">
                    ✦
                  </div>
                  <div className="text-4xl font-black text-gray-800 tracking-widest">
                    EXCELLENCE
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons - ALWAYS ENABLED */}
          <div className="flex gap-3">
            <button
              onClick={downloadCertificate}
              disabled={downloading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {downloading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download Certificate (PDF)</span>
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white border-2 border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-700 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <FileText size={18} />
              <span>Print Certificate</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Certificate will be downloaded as a professional PDF document
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Recognition History Component - OPEN TO ALL
const RecognitionHistory = ({ employee, isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      fetchRecognitionHistory();
    }
  }, [isOpen, employee]);

  const fetchRecognitionHistory = async () => {
    if (!employee?.employeeId) return;

    setLoading(true);
    try {
      const response = await api.get(
        `/recognition/employee/${employee.employeeId}/history`
      );
      if (response.data.success) {
        setHistory(response.data.data || []);
      } else {
        // Fallback: filter from localStorage or context
        const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
        const employeeHistory = allPosts.filter(
          (post) => post.employee?.employeeId === employee.employeeId
        );
        setHistory(employeeHistory);
      }
    } catch (error) {
      console.error("Error fetching recognition history:", error);
      // Fallback
      const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
      const employeeHistory = allPosts.filter(
        (post) => post.employee?.employeeId === employee.employeeId
      );
      setHistory(employeeHistory);
    } finally {
      setLoading(false);
    }
  };

  const getRecognitionTypeInfo = (type) => {
    const types = {
      employee_of_month: {
        icon: <Crown className="w-4 h-4" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        label: "Employee of Month",
        gradient: "from-yellow-400 to-amber-500",
      },
      excellence_award: {
        icon: <Medal className="w-4 h-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        label: "Excellence Award",
        gradient: "from-purple-400 to-indigo-500",
      },
      innovation: {
        icon: <Lightbulb className="w-4 h-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "Innovation Award",
        gradient: "from-blue-400 to-cyan-500",
      },
      team_player: {
        icon: <Heart className="w-4 h-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Team Player",
        gradient: "from-green-400 to-emerald-500",
      },
    };

    return (
      types[type] || {
        icon: <Award className="w-4 h-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        label: "Recognition",
        gradient: "from-gray-400 to-slate-500",
      }
    );
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-red-600" />
                Recognition History
              </h2>
              <p className="text-gray-600 mt-1">
                Previous recognitions for {employee.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Enhanced Employee Info */}
          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {employee.name ? employee.name.charAt(0).toUpperCase() : "E"}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-xl">
                {employee.name}
              </h3>
              <p className="text-gray-600">{employee.position}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Badge className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {history.length}{" "}
                    {history.length === 1 ? "recognition" : "recognitions"}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">
                    Recognition History
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* History List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-50 to-red-100 flex items-center justify-center mb-4">
                <Loader size={24} className="animate-spin text-red-600" />
              </div>
              <p className="text-gray-600">Loading recognition history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                <History className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Recognition History
              </h3>
              <p className="text-gray-600 mb-6">
                No previous recognitions found for this employee
              </p>
              <div className="text-sm text-gray-500 px-6">
                Recognitions will appear here once they are awarded to the
                employee
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  Previous Recognitions
                </h4>
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Sorted by date
                </div>
              </div>

              {history.map((recognition, index) => {
                const typeInfo = getRecognitionTypeInfo(
                  recognition.recognitionType
                );
                return (
                  <div
                    key={recognition._id || index}
                    className="group p-4 bg-white border border-light rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Badge */}
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}
                      >
                        <div className="text-white">
                          {React.cloneElement(typeInfo.icon, {
                            className: "w-6 h-6",
                          })}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                              {recognition.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.color} border ${typeInfo.borderColor}`}
                              >
                                {typeInfo.label}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={10} />
                                {new Date(
                                  recognition.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{index + 1}
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {recognition.description}
                        </p>

                        {recognition.tags && recognition.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {recognition.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Post Details Modal - OPEN TO ALL
const PostDetailsModal = ({ post, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [employeeRecognitions, setEmployeeRecognitions] = useState([]);

  useEffect(() => {
    if (isOpen && post) {
      setCurrentImageIndex(0);
      fetchEmployeeRecognitions();
    }
  }, [isOpen, post]);

  const fetchEmployeeRecognitions = async () => {
    if (!post.employee?.employeeId) return;

    try {
      const response = await api.get(
        `/recognition/employee/${post.employee.employeeId}`
      );
      if (response.data.success) {
        setEmployeeRecognitions(response.data.data || []);
      } else {
        // Fallback
        const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
        const recognitions = allPosts.filter(
          (p) => p.employee?.employeeId === post.employee.employeeId
        );
        setEmployeeRecognitions(recognitions);
      }
    } catch (error) {
      console.error("Error fetching employee recognitions:", error);
      // Fallback
      const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
      const recognitions = allPosts.filter(
        (p) => p.employee?.employeeId === post.employee.employeeId
      );
      setEmployeeRecognitions(recognitions);
    }
  };

  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown className="w-5 h-5" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          label: "Employee of the Month",
          gradient: "from-yellow-500 to-amber-500",
        };
      case "excellence_award":
        return {
          icon: <Medal className="w-5 h-5" />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          label: "Excellence Award",
          gradient: "from-purple-500 to-indigo-500",
        };
      case "innovation":
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          label: "Innovation Award",
          gradient: "from-blue-500 to-cyan-500",
        };
      case "team_player":
        return {
          icon: <Heart className="w-5 h-5" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          label: "Team Player Award",
          gradient: "from-green-500 to-emerald-500",
        };
      default:
        return {
          icon: <Award className="w-5 h-5" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          label: "Recognition",
          gradient: "from-gray-500 to-slate-500",
        };
    }
  };

  const nextImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === post.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (post.images && post.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? post.images.length - 1 : prevIndex - 1
      );
    }
  };

  if (!isOpen || !post) return null;

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const hasImages = post.images && post.images.length > 0;
  const hasHistory = employeeRecognitions.length > 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 ${typeInfo.bgColor} rounded-lg`}>
                    {typeInfo.icon}
                  </div>
                  <span className={`text-sm font-medium ${typeInfo.color}`}>
                    {typeInfo.label}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {post.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Post Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Featured Image with Carousel */}
                {hasImages ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* Main Image */}
                    <img
                      src={
                        post.images[currentImageIndex].data ||
                        post.images[currentImageIndex].url
                      }
                      alt={`${post.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-64 object-cover"
                    />

                    {/* Navigation Buttons - Show only if there are multiple images */}
                    {post.images.length > 1 && (
                      <>
                        {/* Left Navigation Button */}
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all group"
                          aria-label="Previous image"
                        >
                          <ChevronLeft
                            size={20}
                            className="group-hover:-translate-x-0.5 transition-transform"
                          />
                        </button>

                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all group"
                          aria-label="Next image"
                        >
                          <ChevronRightIcon
                            size={20}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                          {currentImageIndex + 1} / {post.images.length}
                        </div>

                        {/* Image Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {post.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? "bg-white w-6"
                                  : "bg-white/50 hover:bg-white/70"
                              }`}
                              aria-label={`Go to image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Recognition Type Badge */}
                    <div className="absolute top-3 left-3">
                      <div
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          typeInfo.bgColor
                        } ${
                          typeInfo.color
                        } backdrop-blur-sm border ${typeInfo.color.replace(
                          "text",
                          "border"
                        )} border-opacity-30`}
                      >
                        {typeInfo.label}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center mb-3 shadow-lg mx-auto`}
                      >
                        {React.cloneElement(typeInfo.icon, {
                          className: "w-8 h-8 text-white",
                        })}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {typeInfo.label}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        No images available
                      </p>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-gray-600 italic text-sm bg-gray-100 px-2 py-1 rounded-lg"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                <div className="prose max-w-none pt-2">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Employee Card with Badges and History */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Group size={15} />
                    Recognized Employee
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {post.employee?.name
                        ? post.employee.name.charAt(0).toUpperCase()
                        : "E"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {post.employee?.name || "Employee"}
                          </h4>
                          <div className="text-sm text-gray-600">
                            {post.employee?.position && (
                              <div className="text-gray-500">
                                {post.employee.position}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employee Badges Summary */}
                  <div className="mb-5 p-3 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Achievements
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {employeeRecognitions.length} total
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons for Employee - ALWAYS ENABLED */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="flex items-center justify-center gap-2 p-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-300 text-sm font-medium group/cert"
                    >
                      <FileText
                        size={14}
                        className="group-hover/cert:scale-110 transition-transform"
                      />
                      Certificate
                    </button>
                    <button
                      onClick={() => setShowHistory(true)}
                      disabled={!hasHistory}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all duration-300 text-sm font-medium group/hist ${
                        hasHistory
                          ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <History
                        size={14}
                        className="group-hover/hist:scale-110 transition-transform"
                      />
                      History
                    </button>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white border border-light rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={18} />
                    Recognition Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Type</span>
                      <span className="font-bold text-gray-900">
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Published</span>
                      <span className="font-medium text-gray-900">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Recognition ID</span>
                      <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {post._id?.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Certificate Access</span>
                      <span className="text-sm font-medium text-green-600">
                        Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions - ALWAYS ENABLED */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg group/cert-dl"
                  >
                    <Download
                      size={18}
                      className="group-hover/cert-dl:animate-bounce"
                    />
                    Download Certificate
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    disabled={!hasHistory}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                      hasHistory
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <History size={18} />
                    View Recognition History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal - OPEN TO ALL */}
      {showCertificate && (
        <Certificate post={post} onClose={() => setShowCertificate(false)} />
      )}

      {/* History Modal */}
      {showHistory && (
        <RecognitionHistory
          employee={post.employee}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

// Enhanced Recognition Card
const RecognitionCard = ({ post, onView }) => {
  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown className="text-yellow-600" size={18} />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          label: "Employee of Month",
          gradient: "from-yellow-500 to-amber-500",
        };
      case "excellence_award":
        return {
          icon: <Medal className="text-purple-600" size={18} />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          label: "Excellence Award",
          gradient: "from-purple-500 to-indigo-500",
        };
      case "innovation":
        return {
          icon: <Lightbulb className="text-blue-600" size={18} />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          label: "Innovation Award",
          gradient: "from-blue-500 to-cyan-500",
        };
      case "team_player":
        return {
          icon: <Heart className="text-green-600" size={18} />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          label: "Team Player Award",
          gradient: "from-green-500 to-emerald-500",
        };
      default:
        return {
          icon: <Award className="text-gray-600" size={18} />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          label: "Recognition",
          gradient: "from-gray-500 to-slate-500",
        };
    }
  };

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const avatarInitials = post.employee?.name
    ? post.employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "EE";

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return "Just now";
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      formatTime(dateString)
    );
  };

  return (
    <div
      className="bg-white rounded-2xl border border-light overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={() => onView(post)}
    >
      {/* Post Image */}
      {post.images && post.images.length > 0 ? (
        <div className="h-48 relative overflow-hidden">
          <img
            src={post.images[0].data || post.images[0].url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-3">
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                typeInfo.bgColor
              } ${
                typeInfo.color
              } backdrop-blur-sm border ${typeInfo.color.replace(
                "text",
                "border"
              )} border-opacity-30`}
            >
              {typeInfo.label}
            </div>
          </div>
        </div>
      ) : (
        <div className={`h-48 ${typeInfo.bgColor} relative`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center mb-3 shadow-lg`}
            >
              {React.cloneElement(typeInfo.icon, {
                className: "w-8 h-8 text-white",
              })}
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">
              {typeInfo.label}
            </h3>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {post.title}
        </h3>

        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-gray-600 italic text-xs bg-gray-100 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-gray-500 text-xs italic">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Description Preview */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {post.description}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4 group-hover:bg-gray-100 transition-colors">
          <div
            className={`w-10 h-10 bg-gradient-to-r ${typeInfo.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}
          >
            {avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-900 truncate">
                  {post.employee?.name || "Employee"}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {post.employee?.position || "Employee"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4">
          <div className="text-xs text-gray-500">
            {formatDateTime(post.createdAt)}
          </div>
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-1.5 hover:shadow-lg group/view">
            <span>View Details</span>
            <ArrowUpRight
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AgentRecognition Component
const AgentRecognition = () => {
  const [activeCategory, setActiveCategory] = useState("Recent posts");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [ setCurrentUserId] = useState(null);
  const postsPerPage = 8;

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUserId(user.employeeId || user._id);
          
          // Store user data for easy access
          localStorage.setItem("currentUser", JSON.stringify(user));
        } else {
          console.log("No user data in localStorage");
        }
      } catch (error) {
        console.error("Error fetching current user from localStorage:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Categories for navigation
  const categories = [
    { id: "recent", name: "Recent posts" },
    { id: "all", name: "All Awards" },
    { id: "employee_of_month", name: "Employee of Month" },
    { id: "excellence_award", name: "Excellence Award" },
    { id: "innovation", name: "Innovation Award" },
    { id: "team_player", name: "Team Player Award" },
  ];

  // Initialize Socket.io
  useEffect(() => {
    console.log("🔌 Initializing Socket.io connection for Agent...");

    // Join agent room for real-time updates
    socket.emit("joinAgentRoom");

    // Request initial data
    socket.emit("getAgentRecognitionData");

    // Listen for initial data
    socket.on("initialAgentRecognitionData", (data) => {
      console.log("📥 Received initial agent recognition data:", data.length);
      setPosts(data);
      // Store in localStorage for history component fallback
      localStorage.setItem("allRecognitionPosts", JSON.stringify(data));
      setLoading(false);
    });

    // Listen for new recognition posts
    socket.on("newRecognition", (newPost) => {
      console.log("🆕 New recognition from socket:", newPost.title);
      setPosts((prev) => {
        const exists = prev.some((post) => post._id === newPost._id);
        if (exists) {
          return prev.map((post) =>
            post._id === newPost._id ? newPost : post
          );
        }
        return [newPost, ...prev];
      });
      
      // Update localStorage
      const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
      const exists = allPosts.some((post) => post._id === newPost._id);
      if (exists) {
        const updated = allPosts.map((post) =>
          post._id === newPost._id ? newPost : post
        );
        localStorage.setItem("allRecognitionPosts", JSON.stringify(updated));
      } else {
        localStorage.setItem("allRecognitionPosts", JSON.stringify([newPost, ...allPosts]));
      }
      
      showCustomToast("New recognition added", "success");
    });

    // Listen for updated recognition posts
    socket.on("recognitionUpdated", (updatedPost) => {
      console.log("📝 Recognition updated from socket:", updatedPost.title);
      setPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
      
      // Update localStorage
      const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
      const updated = allPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      );
      localStorage.setItem("allRecognitionPosts", JSON.stringify(updated));
    });

    // Listen for archived recognitions
    socket.on("recognitionArchived", (data) => {
      console.log("🗄️ Recognition archived from socket:", data.recognitionId);
      setPosts((prev) =>
        prev.filter((post) => post._id !== data.recognitionId)
      );
      
      // Update localStorage
      const allPosts = JSON.parse(localStorage.getItem("allRecognitionPosts") || "[]");
      const filtered = allPosts.filter((post) => post._id !== data.recognitionId);
      localStorage.setItem("allRecognitionPosts", JSON.stringify(filtered));
      
      showCustomToast("Recognition archived", "success");
    });

    // Listen for restored recognitions
    socket.on("recognitionRestored", (data) => {
      console.log("♻️ Recognition restored from socket:", data.recognitionId);
      // Refresh data to get the restored post
      fetchRecognitions();
    });

    // Listen for refresh requests
    socket.on("refreshRecognitionData", () => {
      console.log("🔄 Refresh requested via socket");
      fetchRecognitions();
    });

    // Listen for errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
      showCustomToast("Socket connection error", "error");
    });

    // Cleanup on unmount
    return () => {
      socket.off("initialAgentRecognitionData");
      socket.off("newRecognition");
      socket.off("recognitionUpdated");
      socket.off("recognitionArchived");
      socket.off("recognitionRestored");
      socket.off("refreshRecognitionData");
      socket.off("error");
    };
  }, []);

  // Fetch data on component mount and when category or page changes
  useEffect(() => {
    fetchRecognitions();
  }, [activeCategory, currentPage]);

  const fetchRecognitions = async () => {
    try {
      if (!refreshing) setLoading(true);

      let params = {
        status: "published",
        page: currentPage,
        limit: postsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      // Adjust params based on selected category
      switch (activeCategory) {
        case "Employee of Month":
          params.recognitionType = "employee_of_month";
          break;
        case "Excellence Award":
          params.recognitionType = "excellence_award";
          break;
        case "Innovation Award":
          params.recognitionType = "innovation";
          break;
        case "Team Player Award":
          params.recognitionType = "team_player";
          break;
        // For 'Recent posts' and 'All Awards', use default params
      }

      const response = await api.get("/recognition", { params });

      if (response.data.success) {
        setPosts(response.data.data || []);
        
        // Store in localStorage for history component fallback
        localStorage.setItem("allRecognitionPosts", JSON.stringify(response.data.data || []));

        // Calculate total pages from API response
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 1);
        } else {
          const totalCount =
            response.data.total || response.data.count || posts.length;
          setTotalPages(Math.ceil(totalCount / postsPerPage));
        }
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching recognitions:", error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchRecognitions();
    // Request refresh from socket
    socket.emit("getAgentRecognitionData");
  };

  // Handle view post details
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get current month for highlights
  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Loading state
  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Toast Component */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Post Details Modal */}
      <PostDetailsModal
        post={selectedPost}
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Recognition Wall
              </h1>
              <p className="text-gray-600">
                Celebrating outstanding achievements and excellence in
                performance
              </p>
            </div>

            <div className="flex items-center gap-3">
              <EmployeeBadges allPosts={posts} />
            </div>
          </div>

          {/* Top Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.name);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeCategory === category.name
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Posts Grid */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Sparkles className="mr-2" size={24} />
                {activeCategory}
              </h2>
              {totalPages > 1 && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>

            {/* RECENT POSTS - CARD GRID */}
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-light shadow-sm">
                <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No recognitions found
                </h3>
                <p className="text-gray-600">
                  No published recognitions available for this category.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => (
                    <RecognitionCard
                      key={post._id}
                      post={post}
                      onView={handleViewPost}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors hover:shadow-sm"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        // Show first page, last page, current page, and pages around current page
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 &&
                            pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === pageNum
                                  ? "bg-red-600 text-white shadow-md"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors hover:shadow-sm"
                    >
                      <ChevronRightIcon size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Performers Component */}
            <TopPerformers posts={posts} />
            
            <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-2" size={22} />
                {getCurrentMonth()} Highlights
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

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2" size={20} />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (posts.length > 0) {
                      handleViewPost(posts[0]);
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
                      if (post.employee?.employeeId) {
                        if (!employeeMap[post.employee.employeeId]) {
                          employeeMap[post.employee.employeeId] = {
                            employee: post.employee,
                            count: 0,
                          };
                        }
                        employeeMap[post.employee.employeeId].count++;
                      }
                    });

                    const topEmployee = Object.values(employeeMap).sort(
                      (a, b) => b.count - a.count
                    )[0];
                    if (topEmployee) {
                      const topPost = posts.find(
                        (post) =>
                          post.employee?.employeeId ===
                          topEmployee.employee.employeeId
                      );
                      if (topPost) {
                        handleViewPost(topPost);
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
                  onClick={handleRefresh}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRecognition;