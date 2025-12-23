import React, { useState, useEffect } from "react";
import {
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Check,
  AlertCircle,
  X,
  Badge,
  Users as Group,
  BarChart3,
  Download,
  FileText,
  History,
  Calendar,
  Medal,
  Crown,
  Lightbulb,
  Heart,
  Award,
  ArrowUpRight,
  RefreshCw,
  Zap,
  Users,
  Loader,
} from "lucide-react";
import api from "../../utils/axios";
import socket from "../../utils/socket";

// Import only components that exist
import RecognitionCard from "../../components/cards/RecognitionCard";
import TopPerformersCard from "../../components/cards/TopPerformersCard";
import HighlightsCard from "../../components/cards/HighlightsCard";
import QuickActionsCard from "../../components/cards/QuickActionsCard";
import MyAchievementsModal from "../../components/modals/MyAchievementsModal";
import EmployeeHistoryModal from "../../components/modals/EmployeeHistoryModal"; 

// Toast Component
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

// LoadingSpinner Component
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

// PostDetailsModal Component - WITH WORKING FUNCTIONALITIES
const PostDetailsModal = ({ post, isOpen, onClose, onViewEmployeeHistory }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  
  if (!isOpen || !post) return null;

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

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const hasImages = post.images && post.images.length > 0;

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

  // Custom toast function for PostDetailsModal
  const showCustomToast = (message, type = "success") => {
    // Create a temporary toast
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 animate-slideIn ${
      type === "success"
        ? "bg-gradient-to-r from-green-500 to-green-600"
        : "bg-gradient-to-r from-red-500 to-red-600"
    } text-white px-4 py-2 rounded-lg flex items-center gap-2`;
    
    toast.innerHTML = `
      ${type === "success" ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'}
      <span class="text-sm font-medium">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.add('animate-fadeOut');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // UPDATED CERTIFICATE DOWNLOAD FUNCTION
  const handleDownloadCertificate = async () => {
    try {
      setDownloading(true);
      
      console.log('Downloading certificate for post:', post._id);
      
      // If certificate URL exists, download it directly
      if (post.certificateUrl) {
        console.log('Using existing certificate URL:', post.certificateUrl);
        window.open(post.certificateUrl, '_blank');
        return;
      }
      
      // Generate certificate via API
      const response = await api.post('/recognition/generate-certificate', {
        recognitionId: post._id,
        employeeId: post.employee?._id || post.employee?.employeeId,
        type: post.recognitionType,
        title: post.title,
        employeeName: post.employee?.name || "Employee",
        date: post.createdAt,
        preview: false // Set to true for preview, false for download
      }, {
        responseType: 'blob'
      });

      console.log('Certificate response received:', response);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const filename = `certificate_${post.employee?.name || 'employee'}_${post._id.substring(0, 8)}.pdf`;
      link.setAttribute('download', filename);
      
      // Append to body and trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Show success message
      showCustomToast("Certificate downloaded successfully!", "success");
      
    } catch (error) {
      console.error("Error downloading certificate:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      
      showCustomToast(
        error.response?.data?.message || "Failed to download certificate. Please try again.", 
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  // UPDATED CERTIFICATE VIEW FUNCTION
  const handleViewCertificate = async () => {
    try {
      setDownloading(true);
      
      console.log('Viewing certificate for post:', post._id);
      
      // Check if certificate URL exists
      if (post.certificateUrl) {
        window.open(post.certificateUrl, '_blank');
        return;
      }
      
      // Generate certificate for preview
      const response = await api.post('/recognition/generate-certificate', {
        recognitionId: post._id,
        employeeId: post.employee?._id || post.employee?.employeeId,
        type: post.recognitionType,
        title: post.title,
        employeeName: post.employee?.name || "Employee",
        date: post.createdAt,
        preview: true // Set to true for preview
      }, {
        responseType: 'blob'
      });
      
      // Create blob and open in new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab for preview
      window.open(url, '_blank');
      
    } catch (error) {
      console.error("Error viewing certificate:", error);
      showCustomToast(
        error.response?.data?.message || "Failed to view certificate. Please try again.", 
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleViewEmployeeHistory = () => {
    if (onViewEmployeeHistory && post.employee) {
      onViewEmployeeHistory(post.employee);
      onClose(); // Close modal when navigating to history
    }
  };

  return (
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
                  <img
                    src={post.images[currentImageIndex]?.url || post.images[currentImageIndex]}
                    alt={`${post.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-64 object-cover"
                  />

                  {post.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all"
                      >
                        <ChevronRightIcon size={20} />
                      </button>

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {post.images.length}
                      </div>
                    </>
                  )}

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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Employee Card */}
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
                          {post.employee?.department && (
                            <div className="text-gray-500">
                              {post.employee.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - WITH FUNCTIONALITY */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-all"
                    onClick={handleViewCertificate}
                  >
                    <FileText size={14} />
                    View Certificate
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={handleViewEmployeeHistory}
                  >
                    <History size={14} />
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
                  {post.certificateId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Certificate ID</span>
                      <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {post.certificateId.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions - WITH FUNCTIONALITY */}
              <div className="space-y-3">
                <button
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 cursor-pointer transition-all ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleDownloadCertificate}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download Certificate
                    </>
                  )}
                </button>
                <button 
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-all"
                  onClick={handleViewEmployeeHistory}
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
  );
};

// EmployeeBadges Component
const EmployeeBadges = ({currentUser, onOpenAchievements }) => {
  console.log("EmployeeBadges - currentUser:", currentUser);
  console.log("EmployeeBadges - onOpenAchievements:", onOpenAchievements);
  
  return (
    <button
      onClick={onOpenAchievements}
      className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium flex items-center gap-2 hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
    >
      <Badge size={20} className="text-white" />
      <span className="font-semibold">My Achievements</span>
      <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full">
        0
      </span>
    </button>
  );
};

// Main Component
const AgentRecognition = () => {
  const [activeCategory, setActiveCategory] = useState("Recent posts");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [currentUser, setCurrentUser] = useState(null);
  const [allPosts, setAllPosts] = useState([]);

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      console.log("Fetching current user...");
      const response = await api.get("/auth/me");
      console.log("Auth response:", response.data);
      
      if (response.data.success) {
        console.log("Setting current user:", response.data.user);
        setCurrentUser(response.data.user);
      } else {
        console.error("Failed to fetch current user:", response.data.error);
        // Try alternative endpoint
        try {
          const altResponse = await api.get("/user/me");
          console.log("Alternative auth response:", altResponse.data);
          if (altResponse.data.success) {
            setCurrentUser(altResponse.data.user);
          }
        } catch (altError) {
          console.error("Alternative auth error:", altError);
        }
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      console.log("Setting dummy user for testing...");
      // Set a dummy user for testing
      setCurrentUser({
        _id: "dummy_user_123",
        employeeId: "EMP001",
        firstName: "Test",
        lastName: "User",
        position: "Employee",
        name: "Test User"
      });
    }
  };

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Handle view employee history
  const handleViewEmployeeHistory = (employee) => {
    setSelectedEmployee(employee);
    setShowHistoryModal(true);
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

    socket.emit("joinAgentRoom");
    socket.emit("getAgentRecognitionData");

    socket.on("initialAgentRecognitionData", (data) => {
      console.log("📥 Received initial agent recognition data:", data.length);
      setPosts(data);
      setAllPosts(data);
      setLoading(false);
    });

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
      
      setAllPosts((prev) => {
        const exists = prev.some((post) => post._id === newPost._id);
        if (exists) {
          return prev.map((post) =>
            post._id === newPost._id ? newPost : post
          );
        }
        return [newPost, ...prev];
      });
      
      showCustomToast("New recognition added", "success");
    });

    socket.on("recognitionUpdated", (updatedPost) => {
      console.log("📝 Recognition updated from socket:", updatedPost.title);
      setPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
      
      setAllPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
    });

    socket.on("recognitionArchived", (data) => {
      console.log("🗄️ Recognition archived from socket:", data.recognitionId);
      setPosts((prev) =>
        prev.filter((post) => post._id !== data.recognitionId)
      );
      
      setAllPosts((prev) =>
        prev.filter((post) => post._id !== data.recognitionId)
      );
      
      showCustomToast("Recognition archived", "success");
    });

    socket.on("recognitionRestored", (data) => {
      console.log("♻️ Recognition restored from socket:", data.recognitionId);
      fetchRecognitions();
    });

    socket.on("refreshRecognitionData", () => {
      console.log("🔄 Refresh requested via socket");
      fetchRecognitions();
    });

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
        limit: 8,
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
        setAllPosts(response.data.data || []);

        // Calculate total pages from API response
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 1);
        } else {
          const totalCount =
            response.data.total || response.data.count || posts.length;
          setTotalPages(Math.ceil(totalCount / 8));
        }
      } else {
        setPosts([]);
        setAllPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching recognitions:", error);
      setPosts([]);
      setAllPosts([]);
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
    socket.emit("getAgentRecognitionData");
  };

  // Handle view post details
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // Handle open achievements modal
  const handleOpenAchievements = () => {
    console.log("Opening achievements modal - currentUser:", currentUser);
    console.log("Opening achievements modal - allPosts count:", allPosts.length);
    setShowAchievementsModal(true);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Loading state
  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
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
        onViewEmployeeHistory={handleViewEmployeeHistory}
      />

      {/* Employee History Modal - NOW USING THE SEPARATE COMPONENT */}
      <EmployeeHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        employee={selectedEmployee}
        posts={allPosts}
      />

      {/* My Achievements Modal */}
      <MyAchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        allPosts={allPosts}
        currentUser={currentUser}
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
              <EmployeeBadges 
                currentUser={currentUser}
                onOpenAchievements={handleOpenAchievements}
              />
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
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
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

          <div className="space-y-6">
            <TopPerformersCard posts={posts} />
            <HighlightsCard posts={posts} />
            <QuickActionsCard 
              posts={posts} 
              onViewPost={handleViewPost}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRecognition;