import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axios";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Trophy,
  Award,
  Star,
  Users,
  Megaphone,
  Save,
  Clock,
  Check,
  X,
  Upload,
  Tag,
  Search,
  MessageCircle,
  Heart,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  Calendar,
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  Sparkles,
  Zap,
  ExternalLink,
  ArrowRight,
  Loader,
} from "lucide-react";

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
      } text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X size={14} />
      </button>
    </div>
  );
};

// Loading Component with Trophy
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <div className="absolute -top-2 -right-2 w-8 h-8">
          <div className="w-full h-full border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        </div>
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

// Post Details Modal Component
const PostDetailsModal = ({ post, isOpen, onClose, onLike, onArchive }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && post) {
      // Fetch comments for this post
      fetchComments();

      // Check if user already liked this post
      const likedPosts = JSON.parse(
        localStorage.getItem("likedRecognitionPosts") || "[]"
      );
      setLiked(likedPosts.includes(post._id));

      // Reset image index when modal opens
      setCurrentImageIndex(0);
    }
  }, [isOpen, post]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/recognition/${post._id}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Trophy className="w-5 h-5" />,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          label: "Employee of the Month",
          gradient: "from-yellow-500 to-amber-500",
        };
      case "excellence_award":
        return {
          icon: <Award className="w-5 h-5" />,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          label: "Excellence Award",
          gradient: "from-purple-500 to-indigo-500",
        };
      case "innovation":
        return {
          icon: <Star className="w-5 h-5" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          label: "Innovation Award",
          gradient: "from-blue-500 to-cyan-500",
        };
      case "team_player":
        return {
          icon: <Users className="w-5 h-5" />,
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // FIXED: Get employee name from different sources
  const getEmployeeName = () => {
    return post.employee?.name || post.employeeName || "Employee";
  };

  // FIXED: Get employee department from different sources
  const getEmployeeDepartment = () => {
    return post.employee?.department || post.department || "Department";
  };

  // FIXED: Get employee position if available
  const getEmployeePosition = () => {
    return post.employee?.position;
  };

  const getAvatarInitials = (name) => {
    if (!name) return "EE";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLike = async () => {
    try {
      await onLike(post._id);
      setLiked(!liked);

      // Update localStorage
      const likedPosts = JSON.parse(
        localStorage.getItem("likedRecognitionPosts") || "[]"
      );
      if (!liked) {
        likedPosts.push(post._id);
      } else {
        const index = likedPosts.indexOf(post._id);
        if (index > -1) {
          likedPosts.splice(index, 1);
        }
      }
      localStorage.setItem("likedRecognitionPosts", JSON.stringify(likedPosts));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setCommenting(true);
    try {
      const response = await api.post(`/recognition/${post._id}/comments`, {
        content: newComment.trim(),
      });

      if (response.data.success) {
        setComments((prev) => [response.data.data, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommenting(false);
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
  const employeeName = getEmployeeName();
  const employeeDepartment = getEmployeeDepartment();
  const employeePosition = getEmployeePosition();
  const avatarInitials = getAvatarInitials(employeeName);
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

                      {/* Right Navigation Button */}
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all group"
                        aria-label="Next image"
                      >
                        <ChevronRight
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

                  {/* Department Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900 shadow-sm">
                      {employeeDepartment}
                    </div>
                  </div>

                  {/* Recognition Type Badge */}
                  <div className="absolute top-3 left-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color} backdrop-blur-sm`}
                    >
                      {typeInfo.label}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 h-64 flex items-center justify-center">
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
                  <Users size={18} />
                  Recognized Employee
                </h3>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${typeInfo.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {avatarInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {employeeName}
                        </h4>
                        <div className="text-sm text-gray-600">
                          <div>{employeeDepartment}</div>
                          {employeePosition && (
                            <div className="text-gray-500">
                              {employeePosition}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatTime(post.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={18} />
                  Engagement Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Likes</span>
                    <span className="font-bold text-gray-900">
                      {post.engagement?.likes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Comments</span>
                    <span className="font-bold text-gray-900">
                      {post.engagement?.comments || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Views</span>
                    <span className="font-bold text-gray-900">
                      {post.engagement?.views || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published</span>
                    <span className="font-medium text-gray-900">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleLike}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    liked
                      ? "bg-red-50 text-red-600 border border-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  {liked ? "Liked" : "Like this Post"}
                </button>

                <div className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-lg font-medium">
                  <Eye size={18} />
                  {post.engagement?.views || 0} Views
                </div>

                {onArchive && (
                  <button
                    onClick={() =>
                      onArchive(
                        post._id,
                        post.status === "archived" ? "restore" : "archive"
                      )
                    }
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                      post.status === "archived"
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                    }`}
                  >
                    {post.status === "archived" ? (
                      <>
                        <ArchiveRestore size={18} />
                        Restore Post
                      </>
                    ) : (
                      <>
                        <Archive size={18} />
                        Archive Post
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle size={18} />
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            <div className="mb-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={commenting || !newComment.trim()}
                  className="self-end px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {commenting ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                        {comment.author?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {comment.author?.name || "User"}
                            </h4>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-2 opacity-50"
                  />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatePostModal = ({
  isOpen,
  onClose,
  onSave,
  editingPost,
  onUpdate,
}) => {
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    recognitionType: "employee_of_month",
    employeeId: "",
    tags: [],
    status: "draft",
    scheduleForLater: false,
    publishDate: "",
    publishTime: "",
    department: "",
    images: [],
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingPost) {
        console.log("Loading editing post:", editingPost);

        // Format schedule date
        let scheduleDate = "";
        let scheduleTime = "";
        if (editingPost.scheduleDate) {
          try {
            const date = new Date(editingPost.scheduleDate);
            scheduleDate = date.toISOString().split("T")[0];
            scheduleTime = date.toTimeString().slice(0, 5);
          } catch (error) {
            console.error("Error parsing schedule date:", error);
          }
        }

        setPostForm({
          title: editingPost.title || "",
          description: editingPost.description || "",
          recognitionType: editingPost.recognitionType || "employee_of_month",
          employeeId: editingPost.employeeId || "",
          tags: editingPost.tags || [],
          status: editingPost.status || "draft",
          scheduleForLater: !!editingPost.scheduleDate,
          publishDate: scheduleDate,
          publishTime: scheduleTime,
          department: editingPost.department || "",
          images: editingPost.images || [],
        });

        if (editingPost.employee) {
          setSelectedEmployee({
            name: editingPost.employee.name,
            department: editingPost.employee.department,
            employeeId: editingPost.employee.employeeId,
          });
        }

        // Set image previews
        if (editingPost.images && editingPost.images.length > 0) {
          const previews = editingPost.images.map((img) => ({
            id: img.id || img._id || Math.random().toString(),
            url: img.data || img.url,
            name: img.name || "image",
            isExisting: true,
            data: img.data,
          }));
          setImagePreviews(previews);
          setSelectedImages(editingPost.images);
        }
      } else {
        // Reset form for new post
        resetForm();
      }
    }
  }, [editingPost, isOpen]);

  const resetForm = () => {
    setPostForm({
      title: "",
      description: "",
      recognitionType: "employee_of_month",
      employeeId: "",
      tags: [],
      status: "draft",
      scheduleForLater: false,
      publishDate: "",
      publishTime: "",
      department: "",
      images: [],
    });
    setSelectedEmployee(null);
    setImagePreviews([]);
    setSelectedImages([]);
    setSearchQuery("");
    setEmployeeSearchResults([]);
    setTagInput("");
    setErrors({});
  };

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!postForm.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!postForm.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!postForm.employeeId) {
      newErrors.employee = "Please select an employee";
    }

    if (postForm.scheduleForLater) {
      if (!postForm.publishDate) {
        newErrors.publishDate = "Schedule date is required";
      }
      if (!postForm.publishTime) {
        newErrors.publishTime = "Schedule time is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchEmployees = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setEmployeeSearchResults([]);
      return;
    }

    setLoadingEmployees(true);
    try {
      const response = await api.get(`/recognition/employees/search`, {
        params: { search: query },
      });
      if (response.data.success) {
        setEmployeeSearchResults(response.data.data);
      }
    } catch (error) {
      console.error("Error searching employees:", error);
      setEmployeeSearchResults([]);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length >= 2) {
      searchEmployees(value);
    } else {
      setEmployeeSearchResults([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setPostForm((prev) => ({
      ...prev,
      employeeId: employee.employeeId,
      department: employee.department,
    }));
    setEmployeeSearchResults([]);
    setSearchQuery("");

    if (errors.employee) {
      setErrors((prev) => ({ ...prev, employee: "" }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !postForm.tags.includes(tagInput.trim())) {
      setPostForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPostForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedImages.length > 5) {
      showCustomToast("Maximum 5 images allowed", "error");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showCustomToast(`Invalid file type: ${file.name}`, "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showCustomToast(`File too large: ${file.name}. Max 5MB.`, "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        const newImage = {
          id: Date.now() + Math.random().toString(),
          data: base64Image,
          name: file.name,
          size: file.size,
          type: file.type,
        };

        setSelectedImages((prev) => [...prev, newImage]);
        setImagePreviews((prev) => [
          ...prev,
          {
            id: newImage.id,
            url: base64Image,
            name: file.name,
            isExisting: false,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
    setImagePreviews((prev) => prev.filter((img) => img.id !== id));

    // Also remove from postForm if editing
    if (editingPost) {
      setPostForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== id && img._id !== id),
      }));
    }
  };

  const prepareImageData = () => {
    // Keep existing images
    const existingImages = editingPost
      ? (postForm.images || []).filter((img) =>
          imagePreviews.some(
            (preview) =>
              preview.id === (img.id || img._id) && preview.isExisting
          )
        )
      : [];

    // Add new images as base64 strings
    const newImages = selectedImages
      .filter((img) => !img.isExisting)
      .map((img) => img.data);

    return [...existingImages, ...newImages];
  };

  const handleSubmit = async (action) => {
    if (!validateForm()) {
      showCustomToast("Please fix the errors in the form", "error");
      return;
    }

    setUploading(true);
    try {
      const imagesData = prepareImageData();

      const recognitionData = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        tags: postForm.tags,
        recognitionType: postForm.recognitionType,
        employeeId: postForm.employeeId,
        department: postForm.department,
        images: imagesData,
      };

      // Add employee name if we have it from selected employee
      if (selectedEmployee) {
        recognitionData.employeeName = selectedEmployee.name;
        recognitionData.employeePosition = selectedEmployee.position;
      }

      // Set status based on action
      if (action === "publish") {
        if (
          postForm.scheduleForLater &&
          postForm.publishDate &&
          postForm.publishTime
        ) {
          const scheduleDate = new Date(
            `${postForm.publishDate}T${postForm.publishTime}`
          );
          recognitionData.scheduleDate = scheduleDate.toISOString();
          recognitionData.status = "scheduled";
        } else {
          recognitionData.status = "published";
        }
      } else {
        recognitionData.status = "draft";
      }

      let response;
      if (editingPost) {
        response = await api.put(
          `/recognition/${editingPost._id}`,
          recognitionData
        );
      } else {
        response = await api.post("/recognition", recognitionData);
      }

      if (response.data.success) {
        showCustomToast(response.data.message, "success");

        // Ensure the response data has employee info
        const savedPost = response.data.data;

        // If API doesn't return employee object, add it from our form
        if (!savedPost.employee && selectedEmployee) {
          savedPost.employee = {
            name: selectedEmployee.name,
            department: selectedEmployee.department,
            employeeId: selectedEmployee.employeeId,
            position: selectedEmployee.position,
          };
        }

        if (editingPost) {
          onUpdate(savedPost);
        } else {
          onSave(savedPost);
        }

        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error saving recognition:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error saving recognition";
      showCustomToast(errorMessage, "error");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingPost
                  ? "Edit Recognition Post"
                  : "Create Recognition Post"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Celebrate employee achievements
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={postForm.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Employee of the Month - November 2023"
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Recognition Description *
                </label>
                <textarea
                  name="description"
                  value={postForm.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the achievement..."
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Employee *
                </label>
                <div className="relative mb-2">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search employees by name, ID, or department..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`w-full pl-9 pr-8 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                      errors.employee ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {loadingEmployees && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <SmallLoader />
                    </div>
                  )}
                </div>

                {selectedEmployee && (
                  <div className="mb-2 p-3 border border-green-500 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {selectedEmployee.name?.charAt(0) || "E"}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            {selectedEmployee.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {selectedEmployee.department} • ID:{" "}
                            {selectedEmployee.employeeId}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedEmployee(null);
                          setPostForm((prev) => ({
                            ...prev,
                            employeeId: "",
                            department: "",
                          }));
                        }}
                        className="text-gray-500 hover:text-red-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {employeeSearchResults.length > 0 && (
                  <div className="space-y-1 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-1">
                    {employeeSearchResults.map((employee) => (
                      <div
                        key={employee.employeeId}
                        onClick={() => handleEmployeeSelect(employee)}
                        className="p-2 border rounded cursor-pointer transition-colors hover:bg-red-50 hover:border-red-200"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {employee.name?.charAt(0) || "E"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {employee.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="truncate">
                                {employee.department}
                              </span>
                              <span>•</span>
                              <span>ID: {employee.employeeId}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.employee && (
                  <p className="mt-1 text-xs text-red-600">{errors.employee}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Images (Max 5)
                </label>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {imagePreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className="relative rounded-lg overflow-hidden border border-gray-200 group"
                      >
                        <img
                          src={preview.url}
                          alt="Preview"
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(preview.id)}
                            className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transform hover:scale-110 transition-transform"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        {preview.isExisting && (
                          <div className="absolute top-1 left-1">
                            <span className="px-1 py-0.5 bg-blue-600 text-white text-xs rounded">
                              Existing
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={imagePreviews.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
                      imagePreviews.length >= 5
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 hover:border-red-400 hover:bg-red-50"
                    }`}
                  >
                    <Upload
                      size={20}
                      className={`mb-1 ${
                        imagePreviews.length >= 5
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        imagePreviews.length >= 5
                          ? "text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {imagePreviews.length >= 5
                        ? "Maximum 5 images reached"
                        : "Click to upload images"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB each
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Recognition Type
                </label>
                <select
                  name="recognitionType"
                  value={postForm.recognitionType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="employee_of_month">
                    🏆 Employee of the Month
                  </option>
                  <option value="excellence_award">⭐ Excellence Award</option>
                  <option value="innovation">💡 Innovation Award</option>
                  <option value="team_player">🤝 Team Player Award</option>
                  <option value="other">🎖️ Other Recognition</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag and press Add"
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag();
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>

                {postForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {postForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 group"
                      >
                        <Tag size={10} />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-900 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="scheduleForLater"
                    checked={postForm.scheduleForLater}
                    onChange={(e) =>
                      setPostForm((prev) => ({
                        ...prev,
                        scheduleForLater: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="scheduleForLater"
                    className="font-medium text-gray-900 text-sm flex items-center gap-1.5"
                  >
                    <Clock size={14} />
                    Schedule for later
                  </label>
                </div>

                {postForm.scheduleForLater && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        name="publishDate"
                        value={postForm.publishDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                          errors.publishDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.publishDate && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.publishDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Time *
                      </label>
                      <input
                        type="time"
                        name="publishTime"
                        value={postForm.publishTime}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-white border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm ${
                          errors.publishTime
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.publishTime && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.publishTime}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 mt-6 border-t">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={uploading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save size={16} />
                  <span>{editingPost ? "Update Draft" : "Save as Draft"}</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleSubmit("publish")}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Megaphone size={16} />
                  <span>
                    {editingPost
                      ? "Update Post"
                      : postForm.scheduleForLater
                      ? "Schedule Post"
                      : "Publish Now"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecognitionCard = ({ post, onArchive, onLike, onView, onEdit }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.engagement?.likes || 0);

  useEffect(() => {
    const likedPosts = JSON.parse(
      localStorage.getItem("likedRecognitionPosts") || "[]"
    );
    if (likedPosts.includes(post._id)) {
      setLiked(true);
    }
  }, [post._id]);

  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Trophy className="w-4 h-4" />,
          label: "Employee of Month",
          color: "from-yellow-500 to-amber-500",
          bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50",
          textColor: "text-yellow-700",
        };
      case "excellence_award":
        return {
          icon: <Award className="w-4 h-4" />,
          label: "Excellence Award",
          color: "from-purple-500 to-indigo-500",
          bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
          textColor: "text-purple-700",
        };
      case "innovation":
        return {
          icon: <Star className="w-4 h-4" />,
          label: "Innovation Award",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
          textColor: "text-blue-700",
        };
      case "team_player":
        return {
          icon: <Users className="w-4 h-4" />,
          label: "Team Player",
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
          textColor: "text-green-700",
        };
      default:
        return {
          icon: <Award className="w-4 h-4" />,
          label: "Recognition",
          color: "from-gray-500 to-slate-500",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          textColor: "text-gray-700",
        };
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Unknown date";
    }
  };

  const getTimeAgo = (dateString) => {
    try {
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
    } catch {
      return "Recently";
    }
  };

  const getAvatarInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // FIXED: Get employee name from different possible sources
  const getEmployeeName = () => {
    return post.employee?.name || post.employeeName || "Employee";
  };

  // FIXED: Get employee department from different possible sources
  const getEmployeeDepartment = () => {
    return post.employee?.department || post.department || "Department";
  };

  // FIXED: Get employee position if available
  const getEmployeePosition = () => {
    return post.employee?.position;
  };

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const employeeName = getEmployeeName();
  const employeeDepartment = getEmployeeDepartment();
  const employeePosition = getEmployeePosition();

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    // Update localStorage
    const likedPosts = JSON.parse(
      localStorage.getItem("likedRecognitionPosts") || "[]"
    );
    if (newLikedState) {
      likedPosts.push(post._id);
    } else {
      const index = likedPosts.indexOf(post._id);
      if (index > -1) {
        likedPosts.splice(index, 1);
      }
    }
    localStorage.setItem("likedRecognitionPosts", JSON.stringify(likedPosts));

    try {
      await onLike(post._id);
    } catch (error) {
      console.log("Like error", error);
      setLiked(!newLikedState);
      setLikeCount((prev) => (newLikedState ? prev - 1 : prev + 1));
    }
  };

  const handleView = () => {
    onView(post);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(post);
  };

  const handleArchive = async (e) => {
    e.stopPropagation();
    const action = post.status === "archived" ? "restore" : "archive";
    await onArchive(post._id, action);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: {
        color: "bg-green-100 text-green-800 border border-green-200",
        label: "Published",
        icon: "✅",
      },
      draft: {
        color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Draft",
        icon: "📝",
      },
      scheduled: {
        color: "bg-blue-100 text-blue-800 border border-blue-200",
        label: "Scheduled",
        icon: "⏰",
      },
      archived: {
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        label: "Archived",
        icon: "📁",
      },
    };

    return statusConfig[status] || statusConfig.draft;
  };

  const statusBadge = getStatusBadge(post.status);

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col transform hover:-translate-y-1">
      {post.images && post.images.length > 0 ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.images[0].data || post.images[0].url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color} flex items-center gap-1.5 backdrop-blur-sm`}
            >
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.label}</span>
            </div>

            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.bgColor} ${typeInfo.textColor} flex items-center gap-1.5 backdrop-blur-sm`}
            >
              {typeInfo.icon}
              <span>{typeInfo.label}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative h-48 ${typeInfo.bgColor}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-r ${typeInfo.color} flex items-center justify-center mb-3`}
            >
              {React.cloneElement(typeInfo.icon, {
                className: "w-8 h-8 text-white",
              })}
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">
              {typeInfo.label}
            </h3>
          </div>

          <div className="absolute top-3 left-3 right-3 flex justify-between">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.color} flex items-center gap-1.5`}
            >
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.label}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
            {post.title}
          </h3>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="text-gray-600 italic text-xs">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="text-gray-500 text-xs italic">
                  +{post.tags.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
          {post.description}
        </p>

        {/* Employee Info with Time on right side */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3 group-hover:bg-gray-100 transition-colors">
          <div
            className={`w-10 h-10 bg-gradient-to-r ${typeInfo.color} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}
          >
            {getAvatarInitials(employeeName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center w-full">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">
                  {employeeName}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {employeeDepartment}
                  {employeePosition && ` • ${employeePosition}`}
                </p>
              </div>
              {/* Time display - Right beside the name */}
              <div className="text-right ml-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getTimeAgo(post.createdAt)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-gray-600 text-xs hover:text-red-600 transition-colors group/views">
              <Eye className="w-3.5 h-3.5 group-hover/views:scale-110 transition-transform" />
              <span className="font-medium">{post.engagement?.views || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-600 text-xs hover:text-blue-600 transition-colors group/comments">
              <MessageCircle className="w-3.5 h-3.5 group-hover/comments:scale-110 transition-transform" />
              <span className="font-medium">
                {post.engagement?.comments || 0}
              </span>
            </div>

            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-xs hover:text-red-600 transition-colors group/like"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  liked
                    ? "text-red-500 fill-current animate-pulse"
                    : "text-gray-500 group-hover/like:text-red-500"
                }`}
                fill={liked ? "currentColor" : "none"}
              />
              <span
                className={`font-medium ${
                  liked ? "text-red-500" : "text-gray-600"
                }`}
              >
                {likeCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 round-full">
            <button
              onClick={handleArchive}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group/archive"
              title={post.status === "archived" ? "Restore" : "Archive"}
            >
              {post.status === "archived" ? (
                <ArchiveRestore className="w-4 h-4 group-hover/archive:text-green-600" />
              ) : (
                <Archive className="w-4 h-4 group-hover/archive:text-yellow-600" />
              )}
            </button>
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group/edit"
              title="Edit"
            >
              <Edit className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleView}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-1.5 shadow-md hover:shadow-lg group/view">
              <span> Views</span>
               <ArrowUpRight className="w-4 h-4 group-hover/readmore:translate-x-0.5 group-hover/readmore:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminRecognition = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const categories = [
    { id: "published", name: "Published" },
    { id: "draft", name: "Drafts" },
    { id: "scheduled", name: "Scheduled" },
    { id: "archived", name: "Archived" },
    { id: "all", name: "All Posts" },
  ];

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchRecognitions = useCallback(
    async (status = "published", page = 1) => {
      if (page === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const params = {
          status: status === "all" ? "" : status,
          page,
          limit: pagination.limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        const response = await api.get("/recognition", { params });

        if (response.data.success) {
          setPosts(response.data.data);
          setPagination(
            response.data.pagination || {
              page,
              limit: pagination.limit,
              total: response.data.data.length,
              pages: 1,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching recognitions:", error);
        setError(
          "Failed to load recognitions: " +
            (error.response?.data?.message || error.message)
        );
        setPosts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchRecognitions("published", 1);
  }, [fetchRecognitions]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    fetchRecognitions(tabId, 1);
  };

  const handleSaveNewPost = (newPost) => {
    setPosts((prev) => {
      const exists = prev.some((post) => post._id === newPost._id);
      if (exists) {
        return prev.map((post) => (post._id === newPost._id ? newPost : post));
      }
      return [newPost, ...prev];
    });
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
    setEditingPost(null);
  };

  const handleArchivePost = async (postId, action) => {
    try {
      const response = await api.patch(`/recognition/${postId}/archive`, {
        action: action,
      });

      if (response.data.success) {
        const newStatus = action === "archive" ? "archived" : "published";
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, status: newStatus } : post
          )
        );

        showCustomToast(
          `Recognition ${
            action === "archive" ? "archived" : "restored"
          } successfully!`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error archiving recognition:", error);
      showCustomToast(
        `Error ${action === "archive" ? "archiving" : "restoring"} recognition`,
        "error"
      );
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.patch(`/recognition/${postId}/like`);
    } catch (error) {
      console.error("Error liking recognition:", error);
    }
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPost(null);
  };

  const handleRefresh = () => {
    fetchRecognitions(activeTab, pagination.page);
  };

  const getCategoryCounts = () => {
    const counts = {
      published: 0,
      draft: 0,
      scheduled: 0,
      archived: 0,
      all: posts.length,
    };

    posts.forEach((post) => {
      if (post.status in counts) {
        counts[post.status]++;
      }
    });

    return counts;
  };

  const categoryCounts = getCategoryCounts();

  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
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
        onLike={handleLikePost}
        onArchive={handleArchivePost}
      />

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleSaveNewPost}
        editingPost={editingPost}
        onUpdate={handleUpdatePost}
      />

      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Recognition Wall
            </h1>
            <p className="text-gray-600">
              Celebrate and acknowledge outstanding employee achievements
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-3 rounded-xl border border-gray-200 shadow-sm min-w-[120px] whitespace-nowrap">
              <div className="text-xs text-gray-500 font-medium">
                Total Posts
              </div>
              <div className="text-2xl font-bold text-gray-900 truncate">
                {pagination.total}
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-5 py-3 rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>New Recognition</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleTabChange(category.id)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === category.id
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              <span>{category.name}</span>
              {categoryCounts[category.id] > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === category.id ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {categoryCounts[category.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">{posts.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {pagination.total}
            </span>{" "}
            posts
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              {refreshing ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
              ) : (
                <RefreshCw size={18} />
              )}
            </button>
            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-red-100 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid View"
              >
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        viewMode === "grid" ? "bg-red-600" : "bg-gray-400"
                      } rounded-sm`}
                    ></div>
                  ))}
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-red-100 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <div className="space-y-0.5 w-5 h-5">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-0.5 ${
                        viewMode === "list" ? "bg-red-600" : "bg-gray-400"
                      } rounded-full`}
                    ></div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => fetchRecognitions(activeTab, pagination.page)}
              className="text-xs font-medium text-yellow-700 hover:text-yellow-900 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <Trophy size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No recognitions found
          </h3>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            {activeTab === "published"
              ? "No published recognitions yet. Create one to celebrate achievements!"
              : activeTab === "draft"
              ? "No draft recognitions. Start creating one to save for later."
              : activeTab === "scheduled"
              ? "No scheduled recognitions. Schedule a post for future publication."
              : activeTab === "archived"
              ? "No archived recognitions. Archived posts will appear here."
              : "No recognitions found in the system."}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 mx-auto text-sm shadow-md hover:shadow-lg"
          >
            <Plus size={16} />
            <span>Create First Recognition</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <RecognitionCard
              key={post._id}
              post={post}
              onArchive={handleArchivePost}
              onLike={handleLikePost}
              onView={handleViewPost}
              onEdit={handleEditPost}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const typeInfo = getRecognitionTypeInfo(post.recognitionType);

            // FIXED: Helper functions for list view
            const getEmployeeName = () => {
              return post.employee?.name || post.employeeName || "Employee";
            };

            const getEmployeeDepartment = () => {
              return (
                post.employee?.department || post.department || "Department"
              );
            };

            const getEmployeePosition = () => {
              return post.employee?.position;
            };

            const getTimeAgo = (dateString) => {
              const date = new Date(dateString);
              const now = new Date();
              const diffMs = now - date;
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffMinutes = Math.floor(diffMs / (1000 * 60));

              if (diffDays > 0) return `${diffDays}d ago`;
              if (diffHours > 0) return `${diffHours}h ago`;
              if (diffMinutes > 0) return `${diffMinutes}m ago`;
              return "Just now";
            };

            const getAvatarInitials = (name) => {
              if (!name) return "?";
              return name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);
            };

            const employeeName = getEmployeeName();
            const employeeDepartment = getEmployeeDepartment();
            const employeePosition = getEmployeePosition();

            return (
              <div
                key={post._id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  {post.images && post.images.length > 0 ? (
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={post.images[0].data || post.images[0].url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-20 h-20 flex-shrink-0 ${typeInfo.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      {React.cloneElement(typeInfo.icon, {
                        className: "w-8 h-8 text-gray-600",
                      })}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-red-600 transition-colors">
                          {post.title}
                        </h3>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="text-gray-600 italic text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${typeInfo.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}
                          >
                            {getAvatarInitials(employeeName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">
                                  {employeeName}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {employeeDepartment}
                                  {employeePosition && ` • ${employeePosition}`}
                                </div>
                              </div>
                              {/* Time display - Right beside the name */}
                              <div className="text-right ml-4 whitespace-nowrap">
                                <div className="text-xs font-medium text-gray-900">
                                  {getTimeAgo(post.createdAt)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {new Date(post.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleArchivePost(
                              post._id,
                              post.status === "archived" ? "restore" : "archive"
                            )
                          }
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title={
                            post.status === "archived" ? "Restore" : "Archive"
                          }
                        >
                          {post.status === "archived" ? (
                            <ArchiveRestore className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewPost(post)}
                          className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-1 bg-white rounded-lg border border-gray-300 p-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => fetchRecognitions(activeTab, pageNum)}
                  className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
                    pagination.page === pageNum
                      ? "bg-red-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getRecognitionTypeInfo = (type) => {
  switch (type) {
    case "employee_of_month":
      return {
        icon: <Trophy className="w-4 h-4" />,
        label: "Employee of Month",
        color: "from-yellow-500 to-amber-500",
        bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50",
        textColor: "text-yellow-700",
      };
    case "excellence_award":
      return {
        icon: <Award className="w-4 h-4" />,
        label: "Excellence Award",
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
        textColor: "text-purple-700",
      };
    case "innovation":
      return {
        icon: <Star className="w-4 h-4" />,
        label: "Innovation Award",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
        textColor: "text-blue-700",
      };
    case "team_player":
      return {
        icon: <Users className="w-4 h-4" />,
        label: "Team Player",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
        textColor: "text-green-700",
      };
    default:
      return {
        icon: <Award className="w-4 h-4" />,
        label: "Recognition",
        color: "from-gray-500 to-slate-500",
        bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
        textColor: "text-gray-700",
      };
  }
};

export default AdminRecognition;
