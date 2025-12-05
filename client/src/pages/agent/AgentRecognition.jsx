import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Trophy, 
  Star, 
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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import api from '../../utils/axios';
import socket from '../../utils/socket';

// Post Details Modal without engagement features
const PostDetailsModal = ({ post, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && post) {
      // Reset image index when modal opens
      setCurrentImageIndex(0);
    }
  }, [isOpen, post]);

  // Image carousel navigation
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

  const getRecognitionTypeInfo = (type) => {
    switch(type) {
      case 'employee_of_month': 
        return { 
          icon: <Trophy className="w-5 h-5" />, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          label: 'Employee of the Month',
          gradient: 'from-yellow-500 to-amber-500'
        };
      case 'excellence_award': 
        return { 
          icon: <Award className="w-5 h-5" />, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          label: 'Excellence Award',
          gradient: 'from-purple-500 to-indigo-500'
        };
      case 'innovation': 
        return { 
          icon: <Star className="w-5 h-5" />, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          label: 'Innovation Award',
          gradient: 'from-blue-500 to-cyan-500'
        };
      case 'team_player': 
        return { 
          icon: <Users className="w-5 h-5" />, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          label: 'Team Player Award',
          gradient: 'from-green-500 to-emerald-500'
        };
      default: 
        return { 
          icon: <Award className="w-5 h-5" />, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          label: 'Recognition',
          gradient: 'from-gray-500 to-slate-500'
        };
    }
  };

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);

  // Check if there are images
  const hasImages = post.images && post.images.length > 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
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
              <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
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
                <div className="relative rounded-xl overflow-hidden">
                  {/* Main Image */}
                  <img 
                    src={post.images[currentImageIndex].data || post.images[currentImageIndex].url} 
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
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                      </button>
                      
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all group"
                        aria-label="Next image"
                      >
                        <ChevronRightIcon size={20} className="group-hover:translate-x-0.5 transition-transform" />
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
                                ? 'bg-white w-6' 
                                : 'bg-white/50 hover:bg-white/70'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Recognition Type Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color} backdrop-blur-sm`}>
                      {typeInfo.label}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center mb-3 shadow-lg mx-auto`}>
                      {React.cloneElement(typeInfo.icon, { className: "w-8 h-8 text-white" })}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{typeInfo.label}</h3>
                    <p className="text-gray-600 text-sm mt-1">No images available</p>
                  </div>
                </div>
              )}

              {/* Hashtags (Italic) */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-gray-600 italic text-sm">
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
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Group size={15} />
                  Recognized Employee
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{post.employee?.name || 'Employee'}</h4>
                        <div className="text-sm text-gray-600">
                          {post.employee?.position && (
                            <div className="text-gray-500">{post.employee.position}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card - Simplified without engagement stats */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} />
                  Recognition Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type</span>
                    <span className="font-bold text-gray-900">{typeInfo.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium text-gray-900">
                      {new Date(post.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Simplified */}
              <div className="space-y-3">
                <div className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium">
                  <Eye size={18} />
                  View Only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AgentRecognition Component
const AgentRecognition = () => {
  const [activeCategory, setActiveCategory] = useState('Recent posts');
  const [posts, setPosts] = useState([]);
  // const [topRanking, setTopRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 8;

  // Categories for navigation
  const categories = [
    { id: 'recent', name: "Recent posts" },
    { id: 'all', name: "All Awards" },
    { id: 'employee_of_month', name: "Employee of Month" },
    { id: 'excellence_award', name: "Excellence Award" },
    { id: 'innovation', name: "Innovation Award" },
    { id: 'team_player', name: "Team Player Award" }
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
      setLoading(false);
    });

    // Listen for new recognition posts
    socket.on("newRecognition", (newPost) => {
      console.log("🆕 New recognition from socket:", newPost.title);
      setPosts(prev => {
        const exists = prev.some(post => post._id === newPost._id);
        if (exists) {
          return prev.map(post => post._id === newPost._id ? newPost : post);
        }
        return [newPost, ...prev];
      });
    });

    // Listen for updated recognition posts
    socket.on("recognitionUpdated", (updatedPost) => {
      console.log("📝 Recognition updated from socket:", updatedPost.title);
      setPosts(prev => 
        prev.map(post => post._id === updatedPost._id ? updatedPost : post)
      );
    });

    // Listen for archived recognitions
    socket.on("recognitionArchived", (data) => {
      console.log("🗄️ Recognition archived from socket:", data.recognitionId);
      setPosts(prev => prev.filter(post => post._id !== data.recognitionId));
    });

    // Listen for restored recognitions
    socket.on("recognitionRestored", (data) => {
      console.log("♻️ Recognition restored from socket:", data.recognitionId);
      // Refresh data to get the restored post
      socket.emit("getAgentRecognitionData");
    });

    // Listen for refresh requests
    socket.on("refreshRecognitionData", () => {
      console.log("🔄 Refresh requested via socket");
      fetchRecognitions();
    });

    // Listen for errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
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

  // // Fetch top performers separately
  // useEffect(() => {
  //   fetchTopPerformers();
  // }, []);

  const fetchRecognitions = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      let params = {
        status: 'published',
        page: currentPage,
        limit: postsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Adjust params based on selected category
      switch(activeCategory) {
        case 'Employee of Month':
          params.recognitionType = 'employee_of_month';
          break;
        case 'Excellence Award':
          params.recognitionType = 'excellence_award';
          break;
        case 'Innovation Award':
          params.recognitionType = 'innovation';
          break;
        case 'Team Player Award':
          params.recognitionType = 'team_player';
          break;
        // For 'Recent posts' and 'All Awards', use default params
      }

      const response = await api.get('/recognition', { params });
      
      if (response.data.success) {
        setPosts(response.data.data || []);
        
        // Calculate total pages from API response
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 1);
        } else {
          const totalCount = response.data.total || response.data.count || posts.length;
          setTotalPages(Math.ceil(totalCount / postsPerPage));
        }
      } else {
        setPosts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching recognitions:', error);
      setPosts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // const fetchTopPerformers = async () => {
  //   try {
  //     const response = await api.get('/recognition/top-performers');
  //     if (response.data.success) {
  //       setTopRanking(response.data.data || []);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching top performers:', error);
  //     setTopRanking([]);
  //   }
  // };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchRecognitions();
    // fetchTopPerformers();
    // Request refresh from socket
    socket.emit("getAgentRecognitionData");
  };

  // Get recognition type icon and color
  const getRecognitionTypeInfo = (type) => {
    switch(type) {
      case 'employee_of_month': 
        return { 
          icon: <Trophy className="text-yellow-600" size={18} />, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          label: 'Employee of the Month',
          gradient: 'from-yellow-500 to-amber-500'
        };
      case 'excellence_award': 
        return { 
          icon: <Award className="text-purple-600" size={18} />, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          label: 'Excellence Award',
          gradient: 'from-purple-500 to-indigo-500'
        };
      case 'innovation': 
        return { 
          icon: <Star className="text-blue-600" size={18} />, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          label: 'Innovation Award',
          gradient: 'from-blue-500 to-cyan-500'
        };
      case 'team_player': 
        return { 
          icon: <Users className="text-green-600" size={18} />, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          label: 'Team Player Award',
          gradient: 'from-green-500 to-emerald-500'
        };
      default: 
        return { 
          icon: <Award className="text-gray-600" size={18} />, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          label: 'Recognition',
          gradient: 'from-gray-500 to-slate-500'
        };
    }
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

  // Format time
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
      return 'Just now';
    }
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' • ' + formatTime(dateString);
  };

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-8 h-8">
            </div>
          </div>
          <p className="text-gray-600 mt-2">Loading recognitions...</p>
        </div>
      </div>
    );
  }

  // // Get current top performers
  // const currentTopPerformers = topRanking.length > 0 
  //   ? topRanking 
  //   : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
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
                Celebrating outstanding achievements and excellence in performance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 bg-white border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow"
                title="Refresh"
              >
                {refreshing ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Top Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.name);
                  setCurrentPage(1); // Reset to page 1 when category changes
                }}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  activeCategory === category.name
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
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
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
            
            {/* RECENT POSTS - CARD GRID */}
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recognitions found</h3>
                <p className="text-gray-600">No published recognitions available for this category.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post) => {
                    const typeInfo = getRecognitionTypeInfo(post.recognitionType);
                    const avatarInitials = post.employee?.name 
                      ? post.employee.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                      : 'EE';
                    
                    return (
                      <div 
                        key={post._id} 
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                        onClick={() => handleViewPost(post)}
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
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color} backdrop-blur-sm`}>
                                {typeInfo.label}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`h-48 ${typeInfo.bgColor} relative`}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                                {React.cloneElement(typeInfo.icon, { className: "w-8 h-8 text-white" })}
                              </div>
                              <h3 className="text-lg font-bold text-gray-800 text-center">{typeInfo.label}</h3>
                            </div>
                          </div>
                        )}
                        
                        <div className="p-5">
                          {/* 1. Title (Bold) */}
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {post.title}
                          </h3>
                          
                          {/* 2. Hashtags (Italic, below title) */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="text-gray-600 italic text-xs">
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="text-gray-500 text-xs italic">+{post.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                          
                          {/* 3. Description Preview */}
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                            {post.description}
                          </p>

                          {/* 4. Author Info */}
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4 group-hover:bg-gray-100 transition-colors">
                            <div className={`w-10 h-10 bg-gradient-to-r ${typeInfo.gradient} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
                              {avatarInitials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold text-gray-900 truncate">{post.employee?.name || 'Employee'}</h4>
                                  <p className="text-xs text-gray-600 truncate">
                                    {post.employee?.position || 'Employee'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer - Date with Time */}
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              {formatDateTime(post.createdAt)}
                            </div>
                            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-1.5 shadow-md hover:shadow-lg group/view">
                              <span>View Details</span>
                              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                      className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRightIcon size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Top Ranking
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Trophy className="mr-2" size={22} />
                  Top Performers
                </h3>
              </div>
              
              <div className="space-y-3">
                {currentTopPerformers.length > 0 ? (
                  currentTopPerformers.map((person, index) => (
                    <div key={person.id || person._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white font-bold shadow-sm">
                            {person.name ? person.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??'}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{person.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-600 truncate">{person.position || 'Employee'}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No top performers data available</p>
                  </div>
                )}
              </div>
            </div> */}

            {/* Weekly Stats Card */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-2" size={22} />
                This Week's Highlights
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
                    {new Set(posts.map(post => post.employee?.name).filter(Boolean)).size}
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
                    {new Set(posts.map(post => post.recognitionType).filter(Boolean)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex flex-wrap gap-6 justify-center mb-4">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.name);
                  setCurrentPage(1);
                }}
                className="text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            Celebrating excellence across the organization • Showing {posts.length} recognitions
          </p>
        </div>

      </div>
    </div>
  );
};

export default AgentRecognition;