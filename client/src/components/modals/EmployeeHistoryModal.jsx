import React, { useState, useEffect } from "react";
import {
  X, Trophy, Calendar, Award, Crown, 
  Zap, Users, ChevronLeft, ChevronRight, 
  User, Download, FileText, Loader,
  Sparkles, TrendingUp, BarChart3, Filter
} from "lucide-react";
import api from "../../utils/axios";
import { useStore } from "../../store/useStore";

const EmployeeHistoryModal = ({ 
  isOpen, 
  onClose, 
  employee, 
  posts,
  currentUser 
}) => {
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [downloading, setDownloading] = useState({});
  const postsPerPage = 5;
  
  // Get logged-in user from store as fallback
  const storeUser = useStore((state) => state.user);
  const loggedInUser = currentUser || (storeUser ? {
    _id: storeUser._id || storeUser.id,
    employeeId: storeUser.employeeId,
    name: `${storeUser.firstName} ${storeUser.lastName}`,
    position: storeUser.position,
    department: storeUser.department,
  } : null);

  useEffect(() => {
    if (!isOpen || !posts) return;

    // If no specific employee is provided, show logged-in user's history
    const targetEmployee = employee || loggedInUser;
    
    if (!targetEmployee) {
      setFilteredPosts([]);
      return;
    }

    // Filter posts for the target employee
    const employeePosts = posts.filter(post => {
      return post.employee?.employeeId === targetEmployee.employeeId;
    });

    // Apply type filter
    let filtered = employeePosts;
    if (filter !== "all") {
      filtered = employeePosts.filter(post => post.recognitionType === filter);
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [isOpen, employee, posts, filter, loggedInUser]);

  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown size={16} />,
          label: "Employee of Month",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          gradient: "from-amber-400 to-orange-500"
        };
      case "excellence_award":
        return {
          icon: <Award size={16} />,
          label: "Excellence Award",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          gradient: "from-purple-500 to-indigo-600"
        };
      case "innovation":
        return {
          icon: <Zap size={16} />,
          label: "Innovation Award",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          gradient: "from-blue-400 to-cyan-500"
        };
      case "team_player":
        return {
          icon: <Users size={16} />,
          label: "Team Player",
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
          gradient: "from-emerald-400 to-green-500"
        };
      default:
        return {
          icon: <Trophy size={16} />,
          label: "Recognition",
          color: "text-slate-600",
          bgColor: "bg-slate-50",
          gradient: "from-slate-400 to-gray-500"
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStats = (employeePosts) => {
    const total = employeePosts.length;
    const employeeOfMonth = employeePosts.filter(p => p.recognitionType === "employee_of_month").length;
    const excellenceAwards = employeePosts.filter(p => p.recognitionType === "excellence_award").length;
    const innovationAwards = employeePosts.filter(p => p.recognitionType === "innovation").length;
    const teamPlayerAwards = employeePosts.filter(p => p.recognitionType === "team_player").length;

    return { total, employeeOfMonth, excellenceAwards, innovationAwards, teamPlayerAwards };
  };

  // Get all posts for the current employee (before filtering by type)
  const getEmployeePosts = () => {
    const targetEmployee = employee || loggedInUser;
    if (!targetEmployee || !posts) return [];
    
    return posts.filter(post => 
      post.employee?.employeeId === targetEmployee.employeeId
    );
  };

  // Custom toast function
  const showCustomToast = (message, type = "success") => {
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
    
    setTimeout(() => {
      toast.classList.add('animate-fadeOut');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // CHECK IF CURRENT USER IS THE OWNER OF THE POST
  const isOwnerOfPost = (post) => {
    return currentUser && post.employee && 
      (post.employee.employeeId === currentUser.employeeId || 
       post.employee._id === currentUser._id);
  };

  // CHECK IF CURRENT USER CAN VIEW THIS HISTORY (is viewing their own or is admin viewing someone else's)
  const canViewHistory = () => {
    const targetEmployee = employee || loggedInUser;
    if (!targetEmployee || !currentUser) return false;
    
    // User can view if:
    // 1. They are viewing their own history
    // 2. They are admin viewing someone else's history
    return targetEmployee.employeeId === currentUser.employeeId || 
           currentUser.role === "admin" || 
           currentUser.role === "hr";
  };

  // CERTIFICATE DOWNLOAD FUNCTION - WITH PERMISSION CHECK
  const handleDownloadCertificate = async (post) => {
    // Check if user can download this certificate
    if (!isOwnerOfPost(post)) {
      showCustomToast("You can only download your own certificates", "error");
      return;
    }

    try {
      setDownloading(prev => ({ ...prev, [post._id]: true }));
      
      if (post.certificateUrl) {
        window.open(post.certificateUrl, '_blank');
        return;
      }
      
      const response = await api.post('/recognition/generate-certificate', {
        recognitionId: post._id,
        employeeId: post.employee?._id || post.employee?.employeeId,
        type: post.recognitionType,
        title: post.title,
        employeeName: post.employee?.name || "Employee",
        date: post.createdAt,
        preview: false
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `certificate_${post.employee?.name || 'employee'}_${post._id.substring(0, 8)}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showCustomToast("Certificate downloaded successfully!", "success");
      
    } catch (error) {
      console.error("Error downloading certificate:", error);
      showCustomToast(
        error.response?.data?.message || "Failed to download certificate. Please try again.", 
        "error"
      );
    } finally {
      setDownloading(prev => ({ ...prev, [post._id]: false }));
    }
  };

  // CERTIFICATE VIEW FUNCTION - WITH PERMISSION CHECK
  const handleViewCertificate = async (post) => {
    // Check if user can view this certificate
    if (!isOwnerOfPost(post)) {
      showCustomToast("You can only view your own certificates", "error");
      return;
    }

    try {
      setDownloading(prev => ({ ...prev, [post._id]: true }));
      
      if (post.certificateUrl) {
        window.open(post.certificateUrl, '_blank');
        return;
      }
      
      const response = await api.post('/recognition/generate-certificate', {
        recognitionId: post._id,
        employeeId: post.employee?._id || post.employee?.employeeId,
        type: post.recognitionType,
        title: post.title,
        employeeName: post.employee?.name || "Employee",
        date: post.createdAt,
        preview: true
      }, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
    } catch (error) {
      console.error("Error viewing certificate:", error);
      showCustomToast(
        error.response?.data?.message || "Failed to view certificate. Please try again.", 
        "error"
      );
    } finally {
      setDownloading(prev => ({ ...prev, [post._id]: false }));
    }
  };

  const employeePosts = getEmployeePosts();
  const stats = getStats(employeePosts);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  if (!isOpen) return null;

  const targetEmployee = employee || loggedInUser;
  
  if (!targetEmployee) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn" onClick={onClose} />
        <div className="relative bg-slate-50 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No User Found</h3>
            <p className="text-slate-500 text-sm mb-6">Please log in to view recognition history.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-red-600 transition-colors shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-slate-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col animate-scaleUp">
        
        {/* Header Section */}
        <div className="p-8 bg-white flex justify-between items-center border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl shadow-lg shadow-blue-200">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {employee ? "Professional Timeline" : "My Recognition History"}
              </h2>
              <p className="text-slate-500 text-sm font-medium">
                {employee ? `${employee.name}'s achievement journey` : "Your complete recognition timeline"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <X className="text-slate-400 group-hover:text-slate-600" size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* User Profile Card */}
          <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-red-500 to-orange-400">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-slate-800">
                  {targetEmployee.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-xl font-bold text-slate-900">{targetEmployee.name}</h3>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">
                  {targetEmployee.position} • {targetEmployee.department}
                </p>
                {!employee && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-red-600">{stats.total}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Awards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 text-center">
              <div className="text-lg font-black text-red-600">{stats.employeeOfMonth}</div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Emp. of Month</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4 text-center">
              <div className="text-lg font-black text-purple-600">{stats.excellenceAwards}</div>
              <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Excellence</div>
            </div> 
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 text-center">
              <div className="text-lg font-black text-blue-600">{stats.innovationAwards}</div>
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Innovation</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 text-center">
              <div className="text-lg font-black text-emerald-600">{stats.teamPlayerAwards}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Team Player</div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-4 text-center">
              <div className="text-lg font-black text-slate-600">{stats.total}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">All Awards</div>
            </div>
          </div>

          {/* Filter Tabs - Modern Design */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Filter by Award Type</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <Sparkles size={12} />
                All Awards
              </button>
              <button
                onClick={() => setFilter("employee_of_month")}
                className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  filter === "employee_of_month"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:shadow-sm"
                }`}
              >
                <Crown size={12} />
                Employee of Month
              </button>
              <button
                onClick={() => setFilter("excellence_award")}
                className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  filter === "excellence_award"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm"
                }`}
              >
                <Award size={12} />
                Excellence
              </button>
              <button
                onClick={() => setFilter("innovation")}
                className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  filter === "innovation"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                <Zap size={12} />
                Innovation
              </button>
              <button
                onClick={() => setFilter("team_player")}
                className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  filter === "team_player"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm"
                }`}
              >
                <Users size={12} />
                Team Player
              </button>
            </div>
          </div>

          {/* Recognition Timeline */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Recognition Timeline {filter !== "all" && `• ${filteredPosts.length} ${filter.replace('_', ' ')} awards`}
              </span>
              {totalPages > 1 && (
                <span className="text-xs font-bold text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {currentPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">
                  {filter === "all" ? "No recognitions found" : "No awards in this category"}
                </h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                  {targetEmployee.name} {!employee && "(You) "}hasn't received any recognitions yet.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {currentPosts.map((post) => {
                    const typeInfo = getRecognitionTypeInfo(post.recognitionType);
                    const isOwner = isOwnerOfPost(post);
                    const isDownloading = downloading[post._id];
                    
                    return (
                      <div
                        key={post._id}
                        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.005]"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon with gradient background */}
                          <div className={`p-3 rounded-2xl ${typeInfo.bgColor} ${typeInfo.color} flex-shrink-0`}>
                            {typeInfo.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                                  {typeInfo.label}
                                </span>
                                <h4 className="font-bold text-slate-800 leading-tight line-clamp-1">
                                  {post.title}
                                </h4>
                              </div>
                              <span className="text-xs font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                <Calendar size={12} />
                                {formatDate(post.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-500 line-clamp-2 mb-3 italic">
                              "{post.description}"
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {post.tags && post.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="text-xs text-slate-400 italic bg-slate-50 px-2 py-1 rounded-full">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* View Certificate Button */}
                                <button
                                  className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                                    isOwner
                                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  }`}
                                  onClick={() => handleViewCertificate(post)}
                                  disabled={!isOwner || isDownloading}
                                  title={isOwner ? "View Certificate" : "Only the recognized employee can view this certificate"}
                                >
                                  <FileText size={12} />
                                  View
                                </button>
                                
                                {/* Download Certificate Button */}
                                <button
                                  className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                                    isOwner
                                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 cursor-pointer shadow-sm"
                                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                  } ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  onClick={() => handleDownloadCertificate(post)}
                                  disabled={!isOwner || isDownloading}
                                  title={isOwner ? "Download Certificate" : "Only the recognized employee can download this certificate"}
                                >
                                  {isDownloading ? (
                                    <>
                                      <Loader size={12} className="animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Download size={12} />
                                      Download
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-white border border-slate-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:shadow-sm transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-9 h-9 rounded-full font-medium text-sm transition-all ${
                                currentPage === pageNum
                                  ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md"
                                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-white border border-slate-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:shadow-sm transition-all"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}

                {/* Download All Button */}
                {filteredPosts.length > 0 && canViewHistory() && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="text-center">
                      <button
                        className={`px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 mx-auto transition-all ${
                          filteredPosts.every(post => isOwnerOfPost(post))
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 cursor-pointer shadow-lg hover:shadow-xl"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (filteredPosts.every(post => isOwnerOfPost(post))) {
                            filteredPosts.forEach(post => {
                              if (isOwnerOfPost(post)) {
                                handleDownloadCertificate(post);
                              }
                            });
                          } else {
                            showCustomToast("You can only download your own certificates", "error");
                          }
                        }}
                        disabled={!filteredPosts.every(post => isOwnerOfPost(post))}
                        title={filteredPosts.every(post => isOwnerOfPost(post)) ? "Download All Certificates" : "You can only download your own certificates"}
                      >
                        <Download size={16} />
                        Download All Certificates ({filteredPosts.length})
                      </button>
                      <p className="text-xs text-slate-400 mt-2">
                        {filteredPosts.every(post => isOwnerOfPost(post)) 
                          ? "Download all certificates in this list"
                          : "Only download certificates that belong to you"}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistoryModal;