import React, { useState, useEffect } from "react";
import {
  X,
  Trophy,
  Calendar,
  Award,
  Crown,
  Zap,
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Download,
  FileText,
  Loader,
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

    console.log(`EmployeeHistoryModal - Employee:`, employee);
    console.log(`Logged-in user:`, loggedInUser);
    console.log(`Total posts available: ${posts.length}`);

    // If no specific employee is provided, show logged-in user's history
    const targetEmployee = employee || loggedInUser;
    
    if (!targetEmployee) {
      console.log("No employee or logged-in user found");
      setFilteredPosts([]);
      return;
    }

    // Filter posts for the target employee
    const employeePosts = posts.filter(post => {
      // Match by employee ID (most reliable)
      return post.employee?.employeeId === targetEmployee.employeeId;
    });

    console.log(`Filtered posts for ${targetEmployee.name}:`, employeePosts.length);

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
          icon: <Crown className="w-4 h-4" />,
          label: "Employee of Month",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50"
        };
      case "excellence_award":
        return {
          icon: <Award className="w-4 h-4" />,
          label: "Excellence Award",
          color: "text-purple-600",
          bgColor: "bg-purple-50"
        };
      case "innovation":
        return {
          icon: <Zap className="w-4 h-4" />,
          label: "Innovation Award",
          color: "text-blue-600",
          bgColor: "bg-blue-50"
        };
      case "team_player":
        return {
          icon: <Users className="w-4 h-4" />,
          label: "Team Player",
          color: "text-green-600",
          bgColor: "bg-green-50"
        };
      default:
        return {
          icon: <Trophy className="w-4 h-4" />,
          label: "Recognition",
          color: "text-gray-600",
          bgColor: "bg-gray-50"
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-md p-6">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No User Found</h3>
            <p className="text-gray-600 mb-4">Please log in to view recognition history.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {employee ? "Recognition History" : "My Recognition History"}
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                  {targetEmployee.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{targetEmployee.name}</h3>
                  <p className="text-sm text-gray-600">
                    {targetEmployee.position} {targetEmployee.department && `• ${targetEmployee.department}`}
                    {!employee && <span className="ml-2 text-blue-600 text-xs font-medium">(You)</span>}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3 text-center">
              <div className="text-sm text-red-600 font-medium">Total</div>
              <div className="text-xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-amber-100 border border-yellow-200 rounded-lg p-3 text-center">
              <div className="text-sm text-yellow-600 font-medium">Emp. of Month</div>
              <div className="text-xl font-bold text-gray-900">{stats.employeeOfMonth}</div>
            </div> 
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3 text-center">
              <div className="text-sm text-purple-600 font-medium">Excellence</div>
              <div className="text-xl font-bold text-gray-900">{stats.excellenceAwards}</div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center">
              <div className="text-sm text-blue-600 font-medium">Innovation</div>
              <div className="text-xl font-bold text-gray-900">{stats.innovationAwards}</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-sm text-green-600 font-medium">Team Player</div>
              <div className="text-xl font-bold text-gray-900">{stats.teamPlayerAwards}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("employee_of_month")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                filter === "employee_of_month"
                  ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Crown size={12} />
              Employee of Month
            </button>
            <button
              onClick={() => setFilter("excellence_award")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                filter === "excellence_award"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Award size={12} />
              Excellence
            </button>
            <button
              onClick={() => setFilter("innovation")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                filter === "innovation"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Zap size={12} />
              Innovation
            </button>
            <button
              onClick={() => setFilter("team_player")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1 ${
                filter === "team_player"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Users size={12} />
              Team Player
            </button>
          </div>

          {/* Recognition List */}
          {currentPosts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No recognitions found
              </h3>
              <p className="text-gray-600">
                {targetEmployee.name} {!employee && "(You) "}hasn't received any recognitions yet.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {currentPosts.map((post) => {
                  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
                  const isOwner = isOwnerOfPost(post);
                  const isDownloading = downloading[post._id];
                  
                  return (
                    <div
                      key={post._id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 ${typeInfo.bgColor} rounded-lg flex-shrink-0`}>
                          {React.cloneElement(typeInfo.icon, {
                            className: `w-4 h-4 ${typeInfo.color}`
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900">{post.title}</h4>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {post.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* View Certificate Button */}
                              <button
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-all ${
                                  isOwner
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                                onClick={() => handleViewCertificate(post)}
                                disabled={!isOwner || isDownloading}
                                title={isOwner ? "View Certificate" : "Only the recognized employee can view this certificate"}
                              >
                                <FileText size={10} />
                                View Certificate
                              </button>
                              
                              {/* Download Certificate Button */}
                              <button
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-all ${
                                  isOwner
                                    ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                } ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                onClick={() => handleDownloadCertificate(post)}
                                disabled={!isOwner || isDownloading}
                                title={isOwner ? "Download Certificate" : "Only the recognized employee can download this certificate"}
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader size={10} className="animate-spin" />
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <Download size={10} />
                                    Download
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {post.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="text-xs text-gray-500 italic">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Download All Button (only if user can view all) */}
              {filteredPosts.length > 0 && canViewHistory() && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <button
                      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto transition-all ${
                        filteredPosts.every(post => isOwnerOfPost(post))
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 cursor-pointer"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => {
                        if (filteredPosts.every(post => isOwnerOfPost(post))) {
                          // Download all certificates
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
                    <p className="text-xs text-gray-500 mt-2">
                      {filteredPosts.every(post => isOwnerOfPost(post)) 
                        ? "Download all your certificates in this list"
                        : "Only download certificates that belong to you"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistoryModal;