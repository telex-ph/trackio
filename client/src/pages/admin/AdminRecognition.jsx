import React, { useState, useEffect, useCallback } from "react";
import api from "../../utils/axios";
import socket from "../../utils/socket";
import {
  Plus,
  Edit,
  Eye,
  Trophy,
  Award,
  Users,
  Megaphone,
  Save,
  Clock,
  Check,
  X,
  Upload,
  Tag,
  Search,
  AlertCircle,
  ChevronLeft,
  Archive,
  ArchiveRestore,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  RefreshCw,
  FileText,
  Download,
  Crown,
  Heart,
  Lightbulb,
  Zap,
  Lock,
  Medal // ADDED THIS IMPORT
} from "lucide-react";

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

const SmallLoader = () => (
  <div className="flex items-center justify-center">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
  </div>
);

const uploadToServer = async (file) => {

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/upload/recognition", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      url: response.data.url || response.data.secure_url,
      secure_url: response.data.secure_url || response.data.url,
      public_id: response.data.public_id,
      name: file.name,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw new Error(`Failed to upload ${file.name}`);
  }
};

const PostDetailsModal = ({ post, isOpen, onClose, onArchive }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && post) {
      setCurrentImageIndex(0);
    }
  }, [isOpen, post]);

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
          icon: <Award className="w-5 h-5" />,
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

  const formatTime = (dateString) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEmployeeName = () => {
    return post.employee?.name || post.employeeName || "Employee";
  };

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
  const employeePosition = getEmployeePosition();
  const avatarInitials = getAvatarInitials(employeeName);
  const hasImages = post.images && post.images.length > 0;

return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="bg-white border-t-[4px] border-[#800000] w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl flex flex-col rounded-none">
        
        <div className="px-6 py-3 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gray-50 border border-gray-200 text-[#800000]">
              <Award size={14} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[#800000] text-[10px] font-bold uppercase tracking-wider mb-0">
                {typeInfo.label}
              </p>
              <h1 className="text-xs font-semibold text-gray-500">
                Recognition Details
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 text-gray-400 hover:text-red-700 transition-colors border border-transparent hover:border-gray-200"
          >
            <span className="text-[10px] font-medium">Close</span>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-7 space-y-5">
              
              <div className="bg-gray-50 border border-gray-200 p-1 rounded-none">
                {hasImages ? (
                  <div className="relative overflow-hidden flex items-center justify-center h-[300px] bg-white border border-gray-100">
                    <img
                      src={post.images[currentImageIndex].url || post.images[currentImageIndex].secure_url}
                      alt={post.title}
                      className="max-w-full max-h-full object-contain"
                    />

                    {post.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-2">
                        <button
                          onClick={prevImage}
                          className="w-7 h-7 bg-white/90 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#800000] hover:text-white transition-all shadow-sm"
                        >
                          <ChevronLeft size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="w-7 h-7 bg-white/90 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#800000] hover:text-white transition-all shadow-sm"
                        >
                          <ChevronRight size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 bg-gray-900/80 text-white px-2 py-0.5 text-[9px] font-medium">
                      {currentImageIndex + 1} / {post.images.length}
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200">
                    <FileText className="text-gray-300 mb-2" size={24} />
                    <p className="text-gray-400 text-[10px] font-medium">No images available</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {post.title}
                </h2>
                
                <div className="prose max-w-none">
                  <p className="text-gray-600 text-[12px] leading-relaxed whitespace-pre-line">
                    {post.description}
                  </p>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="text-[#800000] bg-red-50 px-2 py-0.5 text-[10px] font-medium border border-red-100">
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-5">
              
              <div className="border border-gray-200 rounded-none bg-white">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Users size={12} /> Recognized Employee
                  </h3>
                </div>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 border border-gray-200 text-[#800000] flex items-center justify-center font-bold text-lg shadow-inner">
                    {avatarInitials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {employeeName}
                    </h4>
                    <p className="text-[#800000] text-[11px] font-medium">
                      {employeePosition || "Staff Member"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 p-4 space-y-3 bg-white">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
                  <BarChart3 size={12} /> Data Summary
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500">Recognition Type</span>
                    <span className="text-[11px] font-semibold text-gray-800">{typeInfo.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500">Current Status</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 border ${
                      post.status === 'active' ? 'text-green-700 bg-green-50 border-green-100' : 'text-gray-600 bg-gray-50 border-gray-100'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500">Date Logged</span>
                    <span className="text-[11px] font-semibold text-gray-800">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  onClick={() => onArchive(post._id, post.status === "archived" ? "restore" : "archive")}
                  className={`w-full py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    post.status === "archived"
                      ? "bg-green-700 text-white border-green-800 hover:bg-green-800"
                      : "bg-[#800000] text-white border-red-900 hover:bg-black"
                  }`}
                >
                  {post.status === "archived" ? (
                    <><ArchiveRestore size={14} /> Restore Post</>
                  ) : (
                    <><Archive size={14} /> Archive Post</>
                  )}
                </button>
                
                <div className="text-[10px] text-gray-400 text-center">
                  <p className="font-medium italic border-t border-gray-100 pt-3">Digital Audit Record</p>
                  <p className="font-mono mt-1 opacity-60">REF: {post._id}</p>
                </div>
              </div>

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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingPost) {
        console.log("Loading editing post:", editingPost);
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
            position: editingPost.employee.position,
          });
        }

        if (editingPost.images && editingPost.images.length > 0) {
          const previews = editingPost.images.map((img) => ({
            id: img.public_id || Math.random().toString(),
            url: img.url || img.secure_url,
            public_id: img.public_id,
            name: img.name || "image",
            isExisting: true,
          }));
          setImagePreviews(previews);
        }
      } else {
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
    setSearchQuery("");
    setEmployeeSearchResults([]);
    setTagInput("");
    setErrors({});
    setUploadingImages([]);
  };

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!postForm.title.trim()) newErrors.title = "Title is required";
    if (!postForm.description.trim())
      newErrors.description = "Description is required";
    if (!postForm.employeeId) newErrors.employee = "Please select an employee";
    if (postForm.scheduleForLater) {
      if (!postForm.publishDate)
        newErrors.publishDate = "Schedule date is required";
      if (!postForm.publishTime)
        newErrors.publishTime = "Schedule time is required";
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
      if (response.data.success) setEmployeeSearchResults(response.data.data);
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
    if (value.length >= 2) searchEmployees(value);
    else setEmployeeSearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    if (errors.employee) setErrors((prev) => ({ ...prev, employee: "" }));
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

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagePreviews.length > 5) {
      showCustomToast("Maximum 5 images allowed", "error");
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        showCustomToast(`Invalid file type: ${file.name}`, "error");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        showCustomToast(`File too large: ${file.name}`, "error");
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const tempUrl = e.target.result;
        const tempId = Date.now() + Math.random().toString();

        setImagePreviews((prev) => [
          ...prev,
          {
            id: tempId,
            url: tempUrl,
            name: file.name,
            isExisting: false,
            isUploading: true,
          },
        ]);

        setUploadingImages((prev) => [...prev, tempId]);

        uploadToServer(file)
          .then((cloudinaryData) => {
            setImagePreviews((prev) =>
              prev.map((img) =>
                img.id === tempId
                  ? {
                      ...img,
                      url: cloudinaryData.url,
                      secure_url: cloudinaryData.secure_url,
                      public_id: cloudinaryData.public_id,
                      name: cloudinaryData.name,
                      isUploading: false,
                      isExisting: true,
                    }
                  : img
              )
            );

            setUploadingImages((prev) => prev.filter((id) => id !== tempId));
            showCustomToast(`Uploaded: ${file.name}`, "success");
          })
          .catch((error) => {
            console.error("❌ Upload failed:", error);

            setImagePreviews((prev) =>
              prev.map((img) =>
                img.id === tempId
                  ? { ...img, isUploading: false, isError: true }
                  : img
              )
            );

            setUploadingImages((prev) => prev.filter((id) => id !== tempId));
            showCustomToast(`Failed: ${file.name}`, "error");
          });
      };

      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const removeImage = (imageId) => {
    setImagePreviews((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async (action) => {
    if (!validateForm()) {
      showCustomToast("Please fix the errors in the form", "error");
      return;
    }

    if (uploadingImages.length > 0) {
      showCustomToast("Please wait for images to finish uploading", "error");
      return;
    }

    setUploading(true);
    try {
      const imagesData = imagePreviews
        .filter((img) => img.isExisting && !img.isUploading)
        .map((img) => ({
          url: img.url,
          secure_url: img.secure_url || img.url,
          public_id: img.public_id,
          name: img.name,
          uploadedAt: new Date(),
        }));

      const recognitionData = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        tags: postForm.tags,
        recognitionType: postForm.recognitionType,
        employeeId: postForm.employeeId,
        department: postForm.department,
        images: imagesData,
      };

      if (selectedEmployee) {
        recognitionData.employeeName = selectedEmployee.name;
        recognitionData.employeePosition = selectedEmployee.position;
      }

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
        const savedPost = response.data.data;

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
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* CSS to hide scrollbars globally for these elements */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="bg-white border-t-[6px] border-[#800000] w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-none shadow-2xl flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-normal">
              {editingPost
                ? "Edit Recognition Post"
                : "Create Recognition Post"}
            </h2>
            <p className="text-slate-500 text-sm mt-1 tracking-normal">
              Celebrate employee achievements
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border border-transparent hover:border-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Form Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-normal">
                  Post Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={postForm.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Employee of the Month - November 2023"
                  className={`w-full px-3 py-2.5 bg-white border rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] text-sm transition-all tracking-normal outline-none ${
                    errors.title ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-normal">
                  Recognition Description *
                </label>
                <textarea
                  name="description"
                  value={postForm.description}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Describe the achievement..."
                  className={`w-full px-3 py-2.5 bg-white border rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] text-sm resize-none transition-all tracking-normal outline-none ${
                    errors.description ? "border-red-500" : "border-slate-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-normal">
                  Select Employee *
                </label>
                <div className="relative mb-3">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search employees by name, ID, or department..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`w-full pl-9 pr-8 py-2.5 border rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] text-sm transition-all tracking-normal outline-none ${
                      errors.employee ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {loadingEmployees && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <SmallLoader />
                    </div>
                  )}
                </div>

                {selectedEmployee && (
                  <div className="mb-3 p-4 border border-[#800000] bg-slate-50 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#800000] text-white flex items-center justify-center font-bold text-sm">
                        {selectedEmployee.name?.charAt(0) || "E"}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm tracking-normal">
                          {selectedEmployee.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {selectedEmployee.department} • ID: {selectedEmployee.employeeId}
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
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {employeeSearchResults.length > 0 && (
                  <div className="border border-slate-200 bg-white max-h-48 overflow-y-auto no-scrollbar shadow-lg mt-1">
                    {employeeSearchResults.map((employee) => (
                      <div
                        key={employee.employeeId}
                        onClick={() => handleEmployeeSelect(employee)}
                        className="p-3 border-b border-slate-50 cursor-pointer transition-colors hover:bg-[#800000] hover:text-white group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 text-slate-600 group-hover:bg-[#600000] group-hover:text-white flex items-center justify-center font-bold text-xs">
                            {employee.name?.charAt(0) || "E"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate tracking-normal">
                              {employee.name}
                            </h4>
                            <p className="text-[10px] opacity-70 truncate tracking-normal font-medium">
                              {employee.department} • ID: {employee.employeeId}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.employee && (
                  <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.employee}</p>
                )}
              </div>
            </div>

            {/* Right Column: Settings & Media */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-normal border-b border-slate-100 pb-2">
                  Upload Images (Max 5)
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {imagePreviews.map((preview) => (
                      <div
                        key={preview.id}
                        className="relative aspect-square border border-slate-200 bg-slate-50 group"
                      >
                        <img
                          src={preview.url}
                          alt="Preview"
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(preview.id)}
                            className="p-1.5 bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {preview.isUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-[#800000] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={imagePreviews.length >= 5 || uploadingImages.length > 0}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed p-6 cursor-pointer transition-all ${
                    imagePreviews.length >= 5 || uploadingImages.length > 0
                      ? "border-slate-100 bg-slate-50 cursor-not-allowed text-slate-400"
                      : "border-slate-300 hover:border-[#800000] hover:bg-slate-50 text-slate-500 hover:text-[#800000]"
                  }`}
                >
                  <Upload size={20} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-normal">
                    {imagePreviews.length >= 5
                      ? "Maximum images reached"
                      : "Click to upload images"}
                  </span>
                  <span className="text-[10px] mt-1 font-medium italic text-slate-400">
                    PNG, JPG up to 5MB each
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-normal">
                    Recognition Type
                  </label>
                  <select
                    name="recognitionType"
                    value={postForm.recognitionType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none text-sm font-bold tracking-normal transition-all"
                  >
                    <option value="employee_of_month">🏆 Employee of the Month</option>
                    <option value="excellence_award">⭐ Excellence Award</option>
                    <option value="innovation">💡 Innovation Award</option>
                    <option value="team_player">🤝 Team Player Award</option>
                    <option value="other">🎖️ Other Recognition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-normal">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag and press Add"
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none text-sm tracking-normal"
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
                      className="px-4 py-2 bg-slate-100 hover:bg-[#800000] hover:text-white text-slate-900 border border-slate-300 text-xs font-bold uppercase transition-all tracking-normal"
                    >
                      Add
                    </button>
                  </div>
                  {postForm.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-slate-100 text-[#800000] border border-slate-200 px-3 py-1 text-[10px] font-bold flex items-center gap-2 uppercase tracking-normal"
                        >
                          <Tag size={10} /> {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-4">
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
                    className="w-4 h-4 focus:ring-[#800000] border-slate-300 rounded-none accent-[#800000]"
                  />
                  <label
                    htmlFor="scheduleForLater"
                    className="font-bold text-[#800000] text-xs uppercase flex items-center gap-2 cursor-pointer tracking-normal"
                  >
                    <Clock size={16} />
                    Schedule for later
                  </label>
                </div>

                {postForm.scheduleForLater && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Date *</label>
                      <input
                        type="date"
                        name="publishDate"
                        value={postForm.publishDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full px-3 py-2 border rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none text-sm tracking-normal ${
                          errors.publishDate ? "border-red-500" : "border-slate-300"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Time *</label>
                      <input
                        type="time"
                        name="publishTime"
                        value={postForm.publishTime}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-none focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none text-sm tracking-normal ${
                          errors.publishTime ? "border-red-500" : "border-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 p-8 border-t border-slate-100 bg-slate-50 sticky bottom-0 z-10">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={uploading || uploadingImages.length > 0}
            className="flex-1 bg-white border-2 border-[#800000] text-[#800000] font-bold py-3 px-4 rounded-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-normal hover:bg-[#800000] hover:text-white"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-slate-200 border-t-[#800000] rounded-full animate-spin"></div>
            ) : (
              <>
                <Save size={16} />
                <span>{editingPost ? "Update Draft" : "Save as Draft"}</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => handleSubmit("publish")}
            disabled={uploading || uploadingImages.length > 0}
            className="flex-1 bg-[#800000] hover:bg-[#600000] text-white font-bold py-3 px-4 rounded-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase tracking-normal shadow-md"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
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
  );
};

const RecognitionCard = ({ post, onArchive, onView, onEdit, activeTab }) => {
  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown className="w-4 h-4" />,
          label: "Employee of Month",
          color: "from-yellow-500 to-amber-500",
          bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50",
          textColor: "text-yellow-700",
        };
      case "excellence_award":
        return {
          icon: <Medal className="w-4 h-4" />, // FIXED: Now using Medal icon
          label: "Excellence Award",
          color: "from-purple-500 to-indigo-500",
          bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
          textColor: "text-purple-700",
        };
      case "innovation":
        return {
          icon: <Lightbulb className="w-4 h-4" />,
          label: "Innovation Award",
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
          textColor: "text-blue-700",
        };
      case "team_player":
        return {
          icon: <Heart className="w-4 h-4" />,
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

      if (diffDays > 0) return `${diffDays}d ago`;
      if (diffHours > 0) return `${diffHours}h ago`;
      if (diffMinutes > 0) return `${diffMinutes}m ago`;
      return "Just now";
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

  const getEmployeeName = () =>
    post.employee?.name || post.employeeName || "Employee";
  const getEmployeePosition = () => post.employee?.position;

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const employeeName = getEmployeeName();
  const employeePosition = getEmployeePosition();

  const handleView = () => onView(post);
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
        color: "bg-gray-100 text-gray-800 border border-light",
        label: "Archived",
        icon: "📁",
      },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const statusBadge = getStatusBadge(post.status);

return (
    <div className="group bg-white border border-zinc-200 transition-all duration-300 overflow-hidden h-full flex flex-col hover:shadow-md">
      
      {/* Media Section - Optimized for Full Image Visibility */}
      {post.images && post.images.length > 0 ? (
        <div className="relative h-48 overflow-hidden border-b border-zinc-100 shrink-0 bg-zinc-50 flex items-center justify-center p-2">
          <img
            src={post.images[0].url || post.images[0].secure_url}
            alt={post.title}
            /* Pinaka-importante: object-contain para buong image ang makita */
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none">
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge.color} flex items-center gap-1 shadow-sm`}>
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.label}</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeInfo.bgColor} ${typeInfo.textColor || 'text-black'} flex items-center gap-1 shadow-sm`}>
              {typeInfo.icon}
              <span>{typeInfo.label}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative h-48 ${typeInfo.bgColor} border-b border-zinc-100 flex flex-col items-center justify-center p-4 shrink-0`}>
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${typeInfo.color} flex items-center justify-center mb-2 shadow-sm`}>
            {React.cloneElement(typeInfo.icon, {
              className: "w-6 h-6 text-white",
            })}
          </div>
          <h3 className="text-xs font-bold text-gray-800 text-center uppercase tracking-tight">
            {typeInfo.label}
          </h3>
          <div className="absolute top-2 left-2">
            <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge.color} flex items-center gap-1`}>
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Content Section - Displaying Full Text */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="mb-3">
          <h3 className="font-bold text-black text-[13px] leading-snug mb-2 group-hover:text-[#800000] transition-colors">
            {post.title}
          </h3>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.tags.map((tag, index) => (
                <span key={index} className="text-zinc-600 italic text-[10px] font-medium">
                  #{tag.toLowerCase()}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-zinc-900 font-medium leading-relaxed mb-5 flex-1 whitespace-pre-line">
          {post.description}
        </p>

        {/* User Info Section */}
        <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 border border-zinc-100 mb-4">
          <div className={`w-9 h-9 bg-gradient-to-r ${typeInfo.color} shrink-0 flex items-center justify-center text-white font-bold text-xs`}>
            {getAvatarInitials(employeeName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start w-full">
              <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-bold text-black text-[11px] uppercase tracking-tight break-words">
                  {employeeName}
                </h4>
                <p className="text-[10px] text-zinc-600 font-bold uppercase break-words">
                  {employeePosition || "Staff member"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-bold text-black leading-none">
                  {getTimeAgo(post.createdAt)}
                </div>
                <div className="text-[9px] text-zinc-500 font-bold mt-1">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-auto">
          <div className="flex items-center gap-1">
            {activeTab !== "archived" && post.status !== "archived" && (
              <button
                onClick={handleArchive}
                className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                title="Archive"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
            {activeTab === "archived" && post.status === "archived" && (
              <button
                onClick={handleArchive}
                className="p-1.5 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                title="Restore"
              >
                <ArchiveRestore className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleEdit}
              className="p-1.5 text-zinc-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleView}
            className="bg-[#800000] text-white px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-black transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminRecognition = () => {
  const [activeTab, setActiveTab] = useState("published");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
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

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchRecognitions = useCallback(
    async (status = "published", page = 1) => {
      if (page === 1) setLoading(true);
      else setRefreshing(true);
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
          setFilteredPosts(response.data.data);
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
        setFilteredPosts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.limit]
  );

  // Filter posts based on active tab
  useEffect(() => {
    if (!posts.length) return;

    let filtered = [];
    switch (activeTab) {
      case "published":
        filtered = posts.filter((post) => post.status === "published");
        break;
      case "draft":
        filtered = posts.filter((post) => post.status === "draft");
        break;
      case "scheduled":
        filtered = posts.filter((post) => post.status === "scheduled");
        break;
      case "archived":
        filtered = posts.filter((post) => post.status === "archived");
        break;
      case "all":
        filtered = posts;
        break;
      default:
        filtered = posts.filter((post) => post.status === "published");
    }

    setFilteredPosts(filtered);
  }, [activeTab, posts]);

  useEffect(() => {
    // Join admin room
    socket.emit("joinAdminRoom");

    // Fetch initial data
    fetchRecognitions("all", 1);

    // Socket event handlers
    const handleRecognitionCreated = (newPost) => {
      console.log("🆕 New recognition created:", newPost.title);
      setPosts((prev) => {
        const exists = prev.some((post) => post._id === newPost._id);
        if (exists) {
          return prev.map((post) =>
            post._id === newPost._id ? newPost : post
          );
        }
        return [newPost, ...prev];
      });
      showCustomToast(`New recognition: ${newPost.title}`, "success");
    };

    const handleRecognitionUpdated = (updatedPost) => {
      console.log("📝 Recognition updated:", updatedPost.title);
      setPosts((prev) =>
        prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
      );
      showCustomToast(`Updated: ${updatedPost.title}`, "success");
    };

    const handleRecognitionStatusChanged = (data) => {
      console.log(
        "🔄 Status changed:",
        data.recognitionId,
        data.previousStatus,
        "→",
        data.newStatus
      );

      if (data.data) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === data.recognitionId ? data.data : post
          )
        );
      }
      showCustomToast(
        `Status changed: ${data.previousStatus} → ${data.newStatus}`,
        "success"
      );
    };

    const handleRecognitionArchived = (data) => {
      console.log("🗄️ Recognition archived:", data.recognitionId);

      setPosts((prev) =>
        prev.map((post) =>
          post._id === data.recognitionId
            ? { ...post, status: "archived" }
            : post
        )
      );

      showCustomToast(`Archived: ${data.title}`, "success");
    };

    const handleRecognitionRestored = (data) => {
      console.log("♻️ Recognition restored:", data.recognitionId);

      if (data.data) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === data.recognitionId ? data.data : post
          )
        );
      } else {
        fetchRecognitions(activeTab, pagination.page);
      }
      showCustomToast(`Restored: ${data.title}`, "success");
    };

    const handleRecognitionDeleted = (data) => {
      console.log("🗑️ Recognition deleted:", data.recognitionId);
      setPosts((prev) =>
        prev.filter((post) => post._id !== data.recognitionId)
      );
      showCustomToast(`Deleted: ${data.title}`, "success");
    };

    const handleRecognitionScheduled = (scheduledPost) => {
      console.log("⏰ Recognition scheduled:", scheduledPost.title);
      setPosts((prev) => {
        const exists = prev.some((post) => post._id === scheduledPost._id);
        if (exists) {
          return prev.map((post) =>
            post._id === scheduledPost._id ? scheduledPost : post
          );
        }
        return [scheduledPost, ...prev];
      });
      showCustomToast(`Scheduled: ${scheduledPost.title}`, "success");
    };

    const handleRefresh = () => {
      console.log("🔄 Refresh requested via socket");
      fetchRecognitions("all", pagination.page);
      showCustomToast("Data refreshed", "success");
    };

    const handleError = (error) => {
      console.error("Socket error:", error);
      showCustomToast("Socket connection error", "error");
    };

    // Register all socket events
    socket.on("adminRecognitionCreated", handleRecognitionCreated);
    socket.on("adminRecognitionUpdated", handleRecognitionUpdated);
    socket.on("adminRecognitionStatusChanged", handleRecognitionStatusChanged);
    socket.on("adminRecognitionArchived", handleRecognitionArchived);
    socket.on("adminRecognitionRestored", handleRecognitionRestored);
    socket.on("adminRecognitionDeleted", handleRecognitionDeleted);
    socket.on("adminRecognitionScheduled", handleRecognitionScheduled);
    socket.on("refreshRecognitionData", handleRefresh);
    socket.on("error", handleError);

    return () => {
      // Clean up all socket listeners
      socket.off("adminRecognitionCreated", handleRecognitionCreated);
      socket.off("adminRecognitionUpdated", handleRecognitionUpdated);
      socket.off(
        "adminRecognitionStatusChanged",
        handleRecognitionStatusChanged
      );
      socket.off("adminRecognitionArchived", handleRecognitionArchived);
      socket.off("adminRecognitionRestored", handleRecognitionRestored);
      socket.off("adminRecognitionDeleted", handleRecognitionDeleted);
      socket.off("adminRecognitionScheduled", handleRecognitionScheduled);
      socket.off("refreshRecognitionData", handleRefresh);
      socket.off("error", handleError);
    };
  }, [activeTab, pagination.page, fetchRecognitions]);

  const categories = [
    { id: "published", name: "Published" },
    { id: "draft", name: "Drafts" },
    { id: "scheduled", name: "Scheduled" },
    { id: "archived", name: "Archived" },
    { id: "all", name: "All Posts" },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSaveNewPost = (newPost) => {
    setPosts((prev) => {
      const exists = prev.some((post) => post._id === newPost._id);
      if (exists)
        return prev.map((post) => (post._id === newPost._id ? newPost : post));
      return [newPost, ...prev];
    });

    // Emit socket event based on status
    if (newPost.status === "published") {
      socket.emit("manualRecognitionPublished", newPost);
      showCustomToast("Recognition published successfully!", "success");
    } else if (newPost.status === "scheduled") {
      socket.emit("manualRecognitionScheduled", newPost);
      showCustomToast("Recognition scheduled successfully!", "success");
    } else {
      socket.emit("manualRecognitionDraftCreated", newPost);
      showCustomToast("Recognition saved as draft!", "success");
    }
  };

  const handleUpdatePost = (updatedPost) => {
    console.log("🔄 Updating post:", updatedPost.title);
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
    setEditingPost(null);

    // Emit socket event
    socket.emit("manualRecognitionUpdated", updatedPost);
    showCustomToast("Recognition updated successfully!", "success");
  };

  const handleArchivePost = async (postId, action) => {
    try {
      console.log(
        `📦 ${action === "archive" ? "Archiving" : "Restoring"} post:`,
        postId
      );
      const response = await api.patch(`/recognition/${postId}/archive`, {
        action: action,
      });

      if (response.data.success) {
        const updatedPost = response.data.data;

        // Update local state immediately
        setPosts((prev) =>
          prev.map((post) => (post._id === postId ? updatedPost : post))
        );

        // Emit socket event
        if (action === "archive") {
          socket.emit("manualRecognitionArchived", {
            recognitionId: postId,
            title: updatedPost.title,
            data: updatedPost,
          });
        } else {
          socket.emit("manualRecognitionRestored", {
            recognitionId: postId,
            title: updatedPost.title,
            data: updatedPost,
          });
        }

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
        `Error ${
          action === "archive" ? "archiving" : "restoring"
        } recognition: ${error.message}`,
        "error"
      );
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
    console.log("🔄 Manual refresh requested");
    fetchRecognitions("all", pagination.page);
    socket.emit("refreshRecognitions");
    showCustomToast("Refreshing data...", "success");
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
      if (post.status in counts) counts[post.status]++;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  if (loading && posts.length === 0) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-4 md:p-6">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      <PostDetailsModal
        post={selectedPost}
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
        }}
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
            <div className="bg-white px-6 py-3 rounded-xl border border-light min-w-[120px] whitespace-nowrap">
              <div className="text-xs text-gray-500 font-medium">
                Total Posts
              </div>
              <div className="text-2xl font-bold text-gray-900 truncate">
                {posts.length}
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-5 py-3 rounded-xl transition-all flex items-center gap-2 text-sm transform hover:-translate-y-0.5"
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
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white"
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
            <span className="font-semibold text-gray-900">
              {filteredPosts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">{posts.length}</span>{" "}
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
              onClick={() => fetchRecognitions("all", pagination.page)}
              className="text-xs font-medium text-yellow-700 hover:text-yellow-900 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
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
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 mx-auto text-sm"
          >
            <Plus size={16} />
            <span>Create First Recognition</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPosts.map((post) => (
            <RecognitionCard
              key={post._id}
              post={post}
              onArchive={handleArchivePost}
              onView={handleViewPost}
              onEdit={handleEditPost}
              activeTab={activeTab}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const typeInfo = getRecognitionTypeInfo(post.recognitionType);
            const getEmployeeName = () =>
              post.employee?.name || post.employeeName || "Employee";
            const getEmployeePosition = () => post.employee?.position;
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
            const employeePosition = getEmployeePosition();

            return (
              <div
                key={post._id}
                className="bg-white rounded-xl border border-light p-4 "
              >
                <div className="flex items-start gap-4">
                  {post.images && post.images.length > 0 ? (
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={post.images[0].url || post.images[0].secure_url}
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
                                  {employeePosition && ` ${employeePosition}`}
                                </div>
                              </div>
                              <div className="text-right ml-4 whitespace-nowrap">
                                <div className="text-xs font-medium text-gray-900">
                                  {getTimeAgo(post.createdAt)}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {new Date(post.createdAt).toLocaleDateString(
                                    "en-US",
                                    { month: "short", day: "numeric" }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {activeTab !== "archived" &&
                          post.status !== "archived" && (
                            <button
                              onClick={() =>
                                handleArchivePost(post._id, "archive")
                              }
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        {activeTab === "archived" &&
                          post.status === "archived" && (
                            <button
                              onClick={() =>
                                handleArchivePost(post._id, "restore")
                              }
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Restore"
                            >
                              <ArchiveRestore className="w-4 h-4" />
                            </button>
                          )}
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
                  onClick={() => fetchRecognitions("all", pageNum)}
                  className={`px-3 py-1.5 rounded-md font-medium text-sm ${
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

// This function needs to be declared at the top level, not inside the component
const getRecognitionTypeInfo = (type) => {
  switch (type) {
    case "employee_of_month":
      return {
        icon: <Crown className="w-4 h-4" />,
        label: "Employee of Month",
        color: "from-yellow-500 to-amber-500",
        bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50",
        textColor: "text-yellow-700",
      };
    case "excellence_award":
      return {
        icon: <Medal className="w-4 h-4" />, // FIXED: Now using Medal icon
        label: "Excellence Award",
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
        textColor: "text-purple-700",
      };
    case "innovation":
      return {
        icon: <Lightbulb className="w-4 h-4" />,
        label: "Innovation Award",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
        textColor: "text-blue-700",
      };
    case "team_player":
      return {
        icon: <Heart className="w-4 h-4" />,
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