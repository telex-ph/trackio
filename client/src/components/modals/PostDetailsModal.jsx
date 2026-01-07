import React, { useState, useEffect } from "react";
import {
  X,
  BarChart3,
  Users as Group,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Download,
  FileText,
  History,
  Medal,
  Crown,
  Lightbulb,
  Heart,
  Award,
  Badge,
  Loader,
  Calendar,
  Trophy,
  AlertCircle,
  Check,
} from "lucide-react";
import api from "../../utils/axios";

// Simple Toast Component
const Toast = ({ message, type = "success", onClose }) => {
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

// Main PostDetailsModal Component
const PostDetailsModal = ({ post, isOpen, onClose, currentUser, allPosts }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [employeeRecognitions, setEmployeeRecognitions] = useState([]);

  useEffect(() => {
    if (isOpen && post) {
      setCurrentImageIndex(0);
      
      // Filter recognitions for this employee
      if (post.employee) {
        const recognitions = allPosts.filter((p) => {
          if (!p.employee) return false;
          
          // Check by employeeId or _id
          const postEmployeeId = post.employee.employeeId || "";
          const postEmployeeMongoId = post.employee._id || "";
          const pEmployeeId = p.employee.employeeId || "";
          const pEmployeeMongoId = p.employee._id || "";
          
          return (
            (postEmployeeId && pEmployeeId && postEmployeeId === pEmployeeId) ||
            (postEmployeeMongoId && pEmployeeMongoId && postEmployeeMongoId.toString() === pEmployeeMongoId.toString())
          );
        });
        setEmployeeRecognitions(recognitions);
      }
    }
  }, [isOpen, post, allPosts]);

  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown className="w-5 h-5" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          label: "Employee of the Month",
          gradient: "from-yellow-500 to-amber-500",
          borderColor: "border-yellow-200",
        };
      case "excellence_award":
        return {
          icon: <Medal className="w-5 h-5" />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          label: "Excellence Award",
          gradient: "from-purple-500 to-indigo-500",
          borderColor: "border-purple-200",
        };
      case "innovation":
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          label: "Innovation Award",
          gradient: "from-blue-500 to-cyan-500",
          borderColor: "border-blue-200",
        };
      case "team_player":
        return {
          icon: <Heart className="w-5 h-5" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          label: "Team Player Award",
          gradient: "from-green-500 to-emerald-500",
          borderColor: "border-green-200",
        };
      default:
        return {
          icon: <Award className="w-5 h-5" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          label: "Recognition",
          gradient: "from-gray-500 to-slate-500",
          borderColor: "border-gray-200",
        };
    }
  };

  // Check if current user owns this post
  const checkIfUserOwnsPost = () => {
    if (!currentUser || !post) return false;
    
    const currentUserEmployeeId = currentUser.employeeId || "";
    const currentUserId = currentUser._id || "";
    const postEmployeeId = post.employee?.employeeId || "";
    const postEmployeeMongoId = post.employee?._id || "";
    
    return (
      (currentUserEmployeeId && postEmployeeId && currentUserEmployeeId === postEmployeeId) ||
      (currentUserId && postEmployeeMongoId && currentUserId.toString() === postEmployeeMongoId.toString())
    );
  };

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // UPDATED: Certificate Download Function
  const handleDownloadCertificate = async () => {
    try {
      setDownloading(true);
      
      console.log('📥 Downloading certificate for post:', post._id);
      console.log('👤 Current user:', currentUser);
      
      // Check if user has access
      const isOwner = checkIfUserOwnsPost();
      if (!isOwner) {
        showCustomToast("You can only download your own certificates", "error");
        return;
      }
      
      // If certificate URL exists, download it directly
      if (post.certificateUrl) {
        console.log('🔗 Using existing certificate URL:', post.certificateUrl);
        window.open(post.certificateUrl, '_blank');
        showCustomToast("Certificate opened in new tab", "success");
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
        preview: false // Set to false for download
      }, {
        responseType: 'blob'
      });

      console.log('✅ Certificate response received');
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const employeeName = post.employee?.name || 'employee';
      const sanitizedName = employeeName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `certificate_${sanitizedName}_${post._id?.substring(0, 8) || Date.now()}.pdf`;
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
      console.error("❌ Error downloading certificate:", error);
      
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

  // NEW: View Certificate Function (opens in new tab)
  const handleViewCertificate = async () => {
    try {
      const isOwner = checkIfUserOwnsPost();
      if (!isOwner) {
        showCustomToast("You can only view your own certificates", "error");
        return;
      }
      
      setDownloading(true);
      
      console.log('👁️ Viewing certificate for post:', post._id);
      
      // If certificate URL exists, open it directly
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
      console.error("❌ Error viewing certificate:", error);
      showCustomToast(
        error.response?.data?.message || "Failed to view certificate. Please try again.", 
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  // Employee History Statistics
  const getEmployeeStats = () => {
    const stats = {
      total: employeeRecognitions.length,
      byType: {}
    };

    employeeRecognitions.forEach(rec => {
      const type = rec.recognitionType;
      if (!stats.byType[type]) {
        stats.byType[type] = 0;
      }
      stats.byType[type]++;
    });

    return stats;
  };

  const employeeStats = getEmployeeStats();
  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const hasImages = post.images && post.images.length > 0;
  const hasHistory = employeeRecognitions.length > 1;
  const isOwner = checkIfUserOwnsPost();

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

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

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
                        } backdrop-blur-sm border ${typeInfo.borderColor} border-opacity-30`}
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

                  {/* Employee Achievement Stats */}
                  <div className="mb-5 p-3 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Achievement Summary
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {employeeStats.total} total
                      </span>
                    </div>
                    
                    {employeeStats.total > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(employeeStats.byType).map(([type, count]) => {
                          const typeInfo = getRecognitionTypeInfo(type);
                          return (
                            <div key={type} className="flex items-center gap-1">
                              <div className={`w-3 h-3 rounded-full ${typeInfo.bgColor}`}></div>
                              <span className="text-xs text-gray-600">{typeInfo.label}</span>
                              <span className="text-xs font-bold text-gray-900 ml-auto">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleViewCertificate}
                      disabled={!isOwner || downloading}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium transition-all ${
                        isOwner && !downloading
                          ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {downloading ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <FileText size={14} />
                      )}
                      View Certificate
                    </button>
                    <button
                      onClick={() => {
                        // Simple history view - show count and latest achievements
                        alert(`${post.employee?.name || 'This employee'} has ${employeeStats.total} recognitions:\n\n${Object.entries(employeeStats.byType).map(([type, count]) => {
                          const typeInfo = getRecognitionTypeInfo(type);
                          return `• ${count} ${typeInfo.label}`;
                        }).join('\n')}`);
                      }}
                      disabled={!hasHistory}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                        hasHistory
                          ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <History size={14} />
                      History ({employeeStats.total})
                    </button>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={18} />
                    Recognition Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Award Type</span>
                      <span className="font-bold text-gray-900">
                        {typeInfo.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date Awarded</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Recognition ID</span>
                      <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {post._id?.substring(0, 8).toUpperCase() || "N/A"}
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

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadCertificate}
                    disabled={!isOwner || downloading}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      isOwner && !downloading
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 cursor-pointer"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {downloading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        {isOwner ? "Download Certificate" : "Restricted"}
                      </>
                    )}
                  </button>
                  
                  {!isOwner && currentUser && (
                    <div className="text-xs text-center text-gray-500 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      🔒 This certificate belongs to {post.employee?.name || "another employee"}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer Note */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Badge size={14} className="text-gray-400" />
                  <span>Recognition ID: {post._id?.substring(0, 12).toUpperCase() || "N/A"}</span>
                </div>
                <div>
                  {isOwner ? (
                    <span className="text-green-600 font-medium">✓ You own this recognition</span>
                  ) : (
                    <span className="text-gray-500">Viewing recognition</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostDetailsModal;