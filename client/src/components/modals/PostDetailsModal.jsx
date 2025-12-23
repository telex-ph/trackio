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
  Calendar,
  Medal,
  Crown,
  Lightbulb,
  Heart,
  Award,
  Badge,
} from "lucide-react";
import api from "../../utils/axios";

// CertificateModal - kailangan mo rin ito
const CertificateModal = ({ post, onClose, currentUser }) => {
  const [downloading, setDownloading] = useState(false);
  const [setShowAccessDenied] = useState(false);

  const checkIfUserOwnsPost = (post, currentUser) => {
    if (!currentUser || !post) return false;
    
    const currentUserEmployeeId = currentUser.employeeId || "";
    const currentUserId = currentUser._id || "";
    const postEmployeeId = post.employee?.employeeId || "";
    const postEmployeeMongoId = post.employee?._id || "";
    const postEmployeeMongoIdFromPost = post.employeeMongoId || "";
    
    return (
      (currentUserEmployeeId && postEmployeeId && currentUserEmployeeId === postEmployeeId) ||
      (currentUserId && postEmployeeMongoId && currentUserId.toString() === postEmployeeMongoId.toString()) ||
      (currentUserId && postEmployeeMongoIdFromPost && currentUserId.toString() === postEmployeeMongoIdFromPost.toString())
    );
  };

  const hasAccess = checkIfUserOwnsPost(post, currentUser);

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
    if (!hasAccess) {
      setShowAccessDenied(true);
      return;
    }

    setDownloading(true);
    try {
      const certificateData = {
        employeeName: post.employee?.name || "Employee",
        awardType: certificateInfo.title,
        achievementTitle: post.title,
        achievementDescription: post.description,
        dateAwarded: new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        recognitionId: post._id?.substring(0, 8).toUpperCase(),
        certificateType: post.recognitionType,
      };

      const response = await api.post(
        "/recognition/generate-certificate",
        certificateData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Certificate_${post.employee?.name.replace(/\s+/g, "_") || "Employee"}_${
          post.recognitionType
        }_${new Date().getTime()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert("Certificate downloaded successfully");
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Error downloading certificate");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Certificate Modal Content */}
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

          {/* Certificate content here */}
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p>Certificate preview would appear here</p>
          </div>

          <div className="mt-4">
            <button
              onClick={downloadCertificate}
              disabled={downloading || !hasAccess}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-medium"
            >
              {downloading ? "Downloading..." : "Download Certificate"}
            </button>
            {!hasAccess && (
              <p className="text-sm text-red-600 mt-2 text-center">
                You can only download your own certificates
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// RecognitionHistoryModal - simple version
const RecognitionHistoryModal = ({ employee, isOpen, onClose, allPosts }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen && employee) {
      // Simple filter from allPosts
      const employeeHistory = allPosts.filter((post) => {
        if (!post.employee) return false;
        const postEmployeeId = post.employee.employeeId || "";
        const postEmployeeMongoId = post.employee._id || "";
        const employeeId = employee.employeeId || "";
        const employeeMongoId = employee._id || "";
        return (
          postEmployeeId === employeeId ||
          postEmployeeMongoId === employeeMongoId
        );
      });
      setHistory(employeeHistory);
    }
  }, [isOpen, employee, allPosts]);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recognition History
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            {history.map((recognition, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-bold text-gray-900">{recognition.title}</h3>
                <p className="text-gray-600 text-sm">{recognition.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main PostDetailsModal Component
const PostDetailsModal = ({ post, isOpen, onClose, currentUser, allPosts }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [employeeRecognitions, setEmployeeRecognitions] = useState([]);

  useEffect(() => {
    if (isOpen && post) {
      setCurrentImageIndex(0);
      // Simple filter from allPosts
      const recognitions = allPosts.filter((p) => {
        if (!p.employee || !post.employee) return false;
        const pEmployeeId = p.employee.employeeId || "";
        const pEmployeeMongoId = p.employee._id || "";
        const postEmployeeId = post.employee.employeeId || "";
        const postEmployeeMongoId = post.employee._id || "";
        return (
          pEmployeeId === postEmployeeId ||
          pEmployeeMongoId === postEmployeeMongoId
        );
      });
      setEmployeeRecognitions(recognitions);
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

  const checkIfUserOwnsPost = (post, currentUser) => {
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

  const isOwner = checkIfUserOwnsPost(post, currentUser);
  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const hasImages = post.images && post.images.length > 0;
  const hasHistory = employeeRecognitions.length > 1;

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

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowCertificate(true)}
                      disabled={!isOwner}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                        isOwner
                          ? "bg-white border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FileText size={14} />
                      Certificate
                    </button>
                    <button
                      onClick={() => setShowHistory(true)}
                      disabled={!hasHistory || !isOwner}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                        isOwner && hasHistory
                          ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
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
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCertificate(true)}
                    disabled={!isOwner}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium ${
                      isOwner
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 cursor-pointer"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Download size={18} />
                    {isOwner ? "Download Certificate" : "Certificate Access Restricted"}
                  </button>
                  <button
                    onClick={() => setShowHistory(true)}
                    disabled={!hasHistory || !isOwner}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium ${
                      isOwner && hasHistory
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
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

      {/* Certificate Modal */}
      {showCertificate && (
        <CertificateModal 
          post={post} 
          onClose={() => setShowCertificate(false)} 
          currentUser={currentUser}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <RecognitionHistoryModal
          employee={post.employee}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          currentUser={currentUser}
          allPosts={allPosts}
        />
      )}
    </>
  );
};

export default PostDetailsModal;