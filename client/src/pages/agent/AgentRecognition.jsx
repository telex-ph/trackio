// pages/agent/AgentRecognition.jsx
import React, { useState } from 'react';
import { ChevronRight, Eye, MessageCircle, Heart, Trophy, Star, ChevronDown, ChevronUp, Award, Users, Gift, Plus, Calendar, Edit, Trash2, Megaphone, Save, Clock, Check, X, Upload, Search } from 'lucide-react';

// Create Post Modal Component for Agent (if they have permission)
const CreatePostModal = ({ isOpen, onClose, onSave, isAdmin = false }) => {
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    recognitionType: 'employee_of_month',
    employeeId: '',
    rewardType: 'cash_bonus',
    rewardAmount: '',
    pointsAwarded: 100,
    publishDate: '',
    publishTime: '',
    tags: [],
    status: 'draft',
    featuredImage: null,
    featuredImagePreview: null,
    scheduleForLater: false,
  });

  const [employees] = useState([
    { id: 1, name: 'John Michael Santos', department: 'Sales', position: 'Senior Sales Agent', avatar: 'JM' },
    { id: 2, name: 'Maria Cristina Reyes', department: 'Customer Support', position: 'Support Lead', avatar: 'MC' },
    { id: 3, name: 'Robert Lim', department: 'Technical Support', position: 'Technical Specialist', avatar: 'RL' },
    { id: 4, name: 'Sarah Johnson', department: 'Quality Assurance', position: 'QA Analyst', avatar: 'SJ' },
    { id: 5, name: 'David Chen', department: 'Operations', position: 'Operations Manager', avatar: 'DC' },
    { id: 6, name: 'Anna Rodriguez', department: 'Training', position: 'Training Specialist', avatar: 'AR' },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setPostForm(prev => ({
      ...prev,
      employeeId: employee.id
    }));
  };

  const handleAddTag = (tag) => {
    if (tag && !postForm.tags.includes(tag)) {
      setPostForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPostForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostForm(prev => ({
          ...prev,
          featuredImage: file,
          featuredImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (status) => {
    if (!postForm.title || !postForm.description || !postForm.employeeId) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      ...postForm,
      status: status === 'publish' ? (postForm.scheduleForLater ? 'scheduled' : 'published') : 'draft'
    });

    // Reset form
    setPostForm({
      title: '',
      description: '',
      recognitionType: 'employee_of_month',
      employeeId: '',
      publishDate: '',
      publishTime: '',
      tags: [],
      status: 'draft',
      featuredImage: null,
      featuredImagePreview: null,
      scheduleForLater: false,
    });
    setSelectedEmployee(null);
    onClose();
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Recognition Post</h2>
              <p className="text-gray-600">Celebrate employee achievements</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              {/* Title */}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Recognition Description *
                </label>
                <textarea
                  name="description"
                  value={postForm.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Describe the achievement and why this employee deserves recognition..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Employee *
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {filteredEmployees.map(employee => (
                    <div
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                        selectedEmployee?.id === employee.id 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {employee.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{employee.name}</h4>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                      </div>
                      {selectedEmployee?.id === employee.id && (
                        <Check className="ml-auto text-red-600" size={18} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recognition & Reward Type - Only show if admin */}
              {isAdmin && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Recognition Type
                    </label>
                    <select
                      name="recognitionType"
                      value={postForm.recognitionType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="employee_of_month">Employee of the Month</option>
                      <option value="excellence_award">Excellence Award</option>
                      <option value="innovation">Innovation Award</option>
                      <option value="team_player">Team Player Award</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Reward Type
                    </label>
                    <select
                      name="rewardType"
                      value={postForm.rewardType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="cash_bonus">Cash Bonus</option>
                      <option value="gift_voucher">Gift Voucher</option>
                      <option value="extra_leave">Extra Leave</option>
                      <option value="certificate">Certificate</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Reward Details - Only show if admin */}
              {isAdmin && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Points Awarded
                    </label>
                    <input
                      type="number"
                      name="pointsAwarded"
                      value={postForm.pointsAwarded}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Reward Amount
                    </label>
                    <input
                      type="text"
                      name="rewardAmount"
                      value={postForm.rewardAmount}
                      onChange={handleInputChange}
                      placeholder="₱5,000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Additional Options */}
            <div className="space-y-4">
              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Featured Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                  {postForm.featuredImagePreview ? (
                    <div className="relative">
                      <img 
                        src={postForm.featuredImagePreview} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setPostForm(prev => ({ ...prev, featuredImage: null, featuredImagePreview: null }))}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="text-3xl text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">Click to upload image</p>
                      <label className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg cursor-pointer transition-colors">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {postForm.tags.map((tag, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-900">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Schedule Options - Only show if admin */}
              {isAdmin && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="scheduleForLater"
                      checked={postForm.scheduleForLater}
                      onChange={(e) => setPostForm(prev => ({ ...prev, scheduleForLater: e.target.checked }))}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="scheduleForLater" className="font-medium text-gray-900 flex items-center gap-2">
                      <Clock size={16} />
                      Schedule for later
                    </label>
                  </div>

                  {postForm.scheduleForLater && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Publish Date
                        </label>
                        <input
                          type="date"
                          name="publishDate"
                          value={postForm.publishDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Publish Time
                        </label>
                        <input
                          type="time"
                          name="publishTime"
                          value={postForm.publishTime}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleSubmit('draft')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={() => handleSubmit('publish')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Megaphone size={18} />
                  <span>{postForm.scheduleForLater ? 'Schedule Post' : 'Publish Now'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleSubmit('submit')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>Submit for Review</span>
              </button>
            )}
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [postsLimit, setPostsLimit] = useState(4);
  const [topRankingLimit, setTopRankingLimit] = useState(5);
  
  // Check if user is admin (for demo purposes)
  const isAdmin = false; // Set to true to see admin features

  // Categories for navigation
  const categories = [
    "Recent posts",
    "Popular", 
    "Most Discussed",
    "Top Performers",
    "Employee of Month",
    "All Awards"
  ];
 
  // Post images for cards
  const postImages = [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop&crop=entropy",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop&crop=entropy",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&crop=entropy",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop&crop=entropy",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=entropy",
    "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&h=400&fit=crop&crop=entropy"
  ];

  // All recent posts data
  const allRecentPosts = [
    {
      id: 1,
      title: "Employee of the Month - November 2023",
      author: "John Michael Santos",
      department: "Sales",
      time: "2 hours ago",
      views: "1,245",
      comments: 42,
      likes: 156,
      postImage: postImages[0],
      color: "bg-blue-50 border-blue-100",
      authorColor: "bg-blue-100 text-blue-800",
      recognitionType: "employee_of_month"
    },
    {
      id: 2,
      title: "Customer Service Excellence Award",
      author: "Maria Cristina Reyes", 
      department: "Customer Support",
      time: "4 hours ago",
      views: "987",
      comments: 28,
      likes: 128,
      postImage: postImages[1],
      color: "bg-green-50 border-green-100",
      authorColor: "bg-green-100 text-green-800",
      recognitionType: "excellence_award"
    },
    {
      id: 3,
      title: "Technical Innovation Recognition",
      author: "Robert Lim",
      department: "Technical Support",
      time: "1 day ago",
      views: "1,543",
      comments: 35,
      likes: 142,
      postImage: postImages[2],
      color: "bg-purple-50 border-purple-100",
      authorColor: "bg-purple-100 text-purple-800",
      recognitionType: "innovation"
    },
    {
      id: 4,
      title: "Team Leadership Excellence",
      author: "Sarah Johnson",
      department: "Quality Assurance",
      time: "2 days ago",
      views: "876",
      comments: 22,
      likes: 98,
      postImage: postImages[3],
      color: "bg-red-50 border-red-100",
      authorColor: "bg-red-100 text-red-800",
      recognitionType: "team_player"
    },
    {
      id: 5,
      title: "Digital Marketing Innovation",
      author: "David Chen",
      department: "Marketing",
      time: "3 days ago",
      views: "1,120",
      comments: 56,
      likes: 210,
      postImage: postImages[4],
      color: "bg-orange-50 border-orange-100",
      authorColor: "bg-orange-100 text-orange-800",
      recognitionType: "innovation"
    },
    {
      id: 6,
      title: "Training Excellence Award",
      author: "Anna Rodriguez",  
      department: "Training",
      time: "4 days ago",
      views: "945",
      comments: 31,
      likes: 178,
      postImage: postImages[5],
      color: "bg-indigo-50 border-indigo-100",
      authorColor: "bg-indigo-100 text-indigo-800",
      recognitionType: "excellence_award"
    }
  ];

  // Top ranking with profile images
  const allTopRanking = [
    { 
      id: 1, 
      name: "John Michael Santos", 
      department: "Sales",
    },
    { 
      id: 2, 
      name: "Maria Cristina Reyes", 
      rating: 99.7, 
      department: "Customer Support",
    },
    { 
      id: 3, 
      name: "Robert Lim", 
      department: "Technical Support",
   
    },
    { 
      id: 4, 
      name: "Sarah Johnson", 
      department: "Quality Assurance",
   
    },
    { 
      id: 5, 
      name: "David Chen", 
      department: "Operations",
   
    },
    { 
      id: 6, 
      name: "Anna Rodriguez", 
      department: "Training",
    
    }
  ];


  // Initialize data
  useState(() => {
    setPosts(allRecentPosts);
  }, []);

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 99) return "text-green-600";
    if (rating >= 96) return "text-yellow-600";
    return "text-red-600";
  };

  // Get recognition type icon and color
  const getRecognitionTypeInfo = (type) => {
    switch(type) {
      case 'employee_of_month': 
        return { 
          icon: <Trophy className="text-yellow-600" size={18} />, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          label: 'Employee of the Month' 
        };
      case 'excellence_award': 
        return { 
          icon: <Award className="text-purple-600" size={18} />, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          label: 'Excellence Award' 
        };
      case 'innovation': 
        return { 
          icon: <Star className="text-blue-600" size={18} />, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          label: 'Innovation Award' 
        };
      case 'team_player': 
        return { 
          icon: <Users className="text-green-600" size={18} />, 
          color: 'text-green-600', 
          bgColor: 'bg-green-50',
          label: 'Team Player Award' 
        };
      default: 
        return { 
          icon: <Award className="text-gray-600" size={18} />, 
          color: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          label: 'Recognition' 
        };
    }
  };

  // Handle save new post
  const handleSaveNewPost = (postData) => {
    const colors = ['blue', 'green', 'purple', 'red', 'orange', 'indigo'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const employeeData = {
      1: { 
        name: 'John Michael Santos', 
        department: 'Sales', 
  
      },
      2: { 
        name: 'Maria Cristina Reyes', 
        department: 'Customer Support', 
        
      },
      3: { 
        name: 'Robert Lim', 
        department: 'Technical Support', 
      
      },
      4: { 
        name: 'Sarah Johnson', 
        department: 'Quality Assurance', 
      
      },
      5: { 
        name: 'David Chen', 
        department: 'Operations', 
      
      },
      6: { 
        name: 'Anna Rodriguez', 
        department: 'Training', 
       
      }
    };

    const newPost = {
      id: posts.length + 1,
      title: postData.title,
      description: postData.description,
      author: employeeData[postData.employeeId]?.name || 'Anonymous',
      department: employeeData[postData.employeeId]?.department || 'General',
      time: 'Just now',
      views: '0',
      comments: 0,
      likes: 0,
      postImage: postData.featuredImagePreview || postImages[Math.floor(Math.random() * postImages.length)],
      color: `bg-${randomColor}-50 border-${randomColor}-100`,
      authorColor: `bg-${randomColor}-100 text-${randomColor}-800`,   
      recognitionType: postData.recognitionType || 'excellence_award',
      tags: postData.tags || []
    };

    setPosts([newPost, ...posts]);
    alert(`Post ${postData.status === 'draft' ? 'saved as draft' : postData.scheduleForLater ? 'scheduled' : 'published'} successfully!`);
  };

  // Handle delete post (only for admin or own posts)
  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      alert('Post deleted successfully!');
    }
  };

  // Handle like post
  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  // Handle comment post
  const handleCommentPost = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
  };

  // Toggle functions for view more
  const toggleRecentPosts = () => {
    setPostsLimit(postsLimit === 4 ? allRecentPosts.length : 4);
  };

  const toggleTopRanking = () => {
    setTopRankingLimit(topRankingLimit === 5 ? allTopRanking.length : 5);
  };

  // Slice arrays based on current limits
  const recentPosts = allRecentPosts.slice(0, postsLimit);
  const topRanking = allTopRanking.slice(0, topRankingLimit);


  return (
    <div className="min-h-screen bg-white p-4 md:p-6 font-sans">
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveNewPost}
        isAdmin={isAdmin}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header with New Post Button for Admins */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Recognition Wall
            </h1>
            <p className="text-gray-600">
              Celebrating outstanding achievements and excellence in performance
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-500">Total Posts</div>
                <div className="font-bold text-gray-900">{posts.length}</div>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                <span>New Post</span>
              </button>
            </div>
          )}
        </div>

        {/* Top Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Toggle for Admins */}
        {isAdmin && (
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Showing {recentPosts.length} of {allRecentPosts.length} recognition posts
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <div className="grid grid-cols-2 gap-1 w-5 h-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`${viewMode === 'grid' ? 'bg-red-600' : 'bg-gray-400'} rounded-sm`}></div>
                  ))}
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <div className="space-y-1 w-5 h-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`h-1 ${viewMode === 'list' ? 'bg-red-600' : 'bg-gray-400'} rounded-full`}></div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Recent Posts Grid with Images */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2">📰</span>
                Recent posts
              </h2>
              <button 
                onClick={toggleRecentPosts}
                className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                {postsLimit === 4 ? 'View All Posts' : 'View Less'}
                {postsLimit === 4 ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>
            
            {/* RECENT POSTS - CARD GRID WITH IMAGES */}
            {viewMode === 'grid' || !isAdmin ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className={`${post.color} border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300`}
                  >
                    {/* Post Image */}
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={post.postImage} 
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <div className={`${post.authorColor} px-3 py-1 rounded-full text-sm font-medium`}>
                          {post.department}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 ${getRecognitionTypeInfo(post.recognitionType).bgColor} rounded-lg`}>
                              {getRecognitionTypeInfo(post.recognitionType).icon}
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                              {getRecognitionTypeInfo(post.recognitionType).label}
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                            {post.title}
                          </h3>
                        </div>
                        <div className={`text-2xl font-bold ${getRatingColor(post.rating)}`}>
                          {post.rating}%
                        </div>
                      </div>

                      {/* Author Info with Profile Image */}
                      <div className="flex items-center gap-3 mb-4 p-3 bg-white/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img 
                            src={post.profileImage} 
                            alt={post.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{post.author}</div>
                          <div className="text-sm text-gray-500">{post.time}</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-lg font-bold text-gray-900">{post.pointsAwarded}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        Exceptional performance in quarterly review with outstanding results and team leadership. This achievement sets a new benchmark for excellence.
                      </p>

                      {/* Reward Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg">
                          <Gift size={16} />
                          <span className="font-medium">{post.rewardAmount}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.pointsAwarded} points awarded
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="bg-white/70 text-gray-700 px-2 py-1 rounded text-xs border">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1 hover:text-red-600 transition-colors"
                          >
                            <Heart size={14} />
                            {post.likes}
                          </button>
                          <button 
                            onClick={() => handleCommentPost(post.id)}
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          >
                            <MessageCircle size={14} />
                            {post.comments}
                          </button>
                          <span className="flex items-center gap-1">
                            <Eye size={14} />
                            {post.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <>
                              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          <button className="text-gray-700 hover:text-red-600 font-medium flex items-center gap-1">
                            Read more
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View for Admins */
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={post.postImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{post.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs ${post.authorColor} px-2 py-0.5 rounded-full`}>
                                {post.department}
                              </span>
                              <span className="text-xs text-gray-500">{post.time}</span>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${getRatingColor(post.rating)}`}>
                            {post.rating}%
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img 
                              src={post.profileImage} 
                              alt={post.author}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{post.author}</h4>
                            <div className="text-sm text-gray-500">{post.pointsAwarded} points</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          Exceptional performance in quarterly review with outstanding results...
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleLikePost(post.id)}
                              className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                            >
                              <Heart size={12} /> {post.likes}
                            </button>
                            <button 
                              onClick={() => handleCommentPost(post.id)}
                              className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                              <MessageCircle size={12} /> {post.comments}
                            </button>
                          </div>
                          <div className="flex gap-2">
                            {isAdmin && (
                              <>
                                <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Top Ranking with Profile Images */}
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">🏆</span>
                  Top ranking
                </h3>
                <button 
                  onClick={toggleTopRanking}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  {topRankingLimit === 5 ? 'View All' : 'View Less'}
                  {topRankingLimit === 5 ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>
              
              <div className="space-y-4">
                {topRanking.map((person, index) => (
                  <div key={person.id} className="flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={person.profileImage} 
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{person.name}</div>
                        <div className="text-sm text-gray-600">{person.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getRatingColor(person.rating)}`}>
                        {person.rating}%
                      </div>
                      <div className="text-xs text-gray-500">{person.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Trophy className="mr-2" size={22} />
                Monthly Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Recognitions</span>
                  <span className="font-bold">{allRecentPosts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg Performance</span>
                  <span className="font-bold">97.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Departments</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Points Awarded</span>
                  <span className="font-bold">3,200</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                This Week
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">New Posts</div>
                  <div className="text-2xl font-bold text-gray-900">12</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Engagements</div>
                  <div className="text-2xl font-bold text-gray-900">856</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600">Comments</div>
                  <div className="text-2xl font-bold text-gray-900">243</div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="text-sm text-amber-600">New Awards</div>
                  <div className="text-2xl font-bold text-gray-900">8</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* View More Button */}
        {allRecentPosts.length > 4 && postsLimit === 4 && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={toggleRecentPosts}
              className="px-6 py-3 bg-white border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              View More Posts
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex flex-wrap gap-6 justify-center mb-6">
            {categories.slice(0, 6).map((category) => (
              <a
                key={category}
                href="#"
                className="text-gray-600 hover:text-red-600 text-sm"
              >
                {category}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AgentRecognition;