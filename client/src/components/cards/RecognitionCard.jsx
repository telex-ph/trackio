import React from "react";
import {
  Crown,
  Medal,
  Lightbulb,
  Heart,
  Award,
  ArrowUpRight,
} from "lucide-react";

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
      {/* Post Image - Cloudinary URL */}
      {post.images && post.images.length > 0 ? (
        <div className="h-48 relative overflow-hidden">
          <img
            src={post.images[0].url || post.images[0]}
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

export default RecognitionCard;