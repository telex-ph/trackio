// pages/admin/AdminRecognition.jsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Plus, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye,
  Trophy,
  Award,
  Star,
  Gift,
  Users,
  Megaphone,
  Save,
  Clock,
  Check,
  X,
  Image,
  Upload,
  TrendingUp,
  Tag,
  User,
  Briefcase,
  Filter,
  Search,
  ChevronRight,
  MessageCircle,
  Heart
} from 'lucide-react';

// Create Post Modal Component
const CreatePostModal = ({ isOpen, onClose, onSave }) => {
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
      toast.error('Please fill in all required fields');
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                </div>
                <div>
                </div>
              </div>
            </div>


            <div className="space-y-4">
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

              {/* Schedule Options */}
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t mt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const AdminRecognition = () => {
  const [activeTab, setActiveTab] = useState('published');
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [categories] = useState([
    "Recent posts",
    "Popular", 
    "Most Discussed",
    "Top Performers",
    "All Awards"
  ]);

  // Sample posts data with images
  const samplePosts = [
    {
      id: 1,
      title: 'Employee of the Month - October 2023',
      description: 'John has consistently exceeded sales targets by 150% and received exceptional feedback from clients. His dedication and commitment to excellence have set a new standard for the entire sales team.',
      employee: { 
        id: 1, 
        name: 'John Michael Santos', 
        department: 'Sales',
        avatar: 'JM'
      },
      recognitionType: 'employee_of_month',
      rating: 99.7,
      status: 'published',
      publishDate: '2023-10-15',
      publishTime: '09:00',
      likes: 45,
      comments: 12,
      shares: 8,
      tags: ['top-performer', 'sales', 'award'],
      featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop&crop=entropy',
      createdBy: 'Admin User',
      createdAt: '2023-10-14T10:30:00Z',
      color: 'bg-blue-50 border-blue-100',
      authorColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      title: 'Customer Service Excellence Award',
      description: 'Maria received 98% customer satisfaction rating for 3 consecutive months. Her exceptional communication skills and problem-solving abilities have significantly improved our customer retention rates.',
      employee: { 
        id: 2, 
        name: 'Maria Cristina Reyes', 
        department: 'Customer Support',
        avatar: 'MC'
      },
      recognitionType: 'excellence_award',
      rating: 98.5,
      status: 'published',
      publishDate: '2023-11-01',
      publishTime: '08:00',
      likes: 32,
      comments: 8,
      shares: 5,
      tags: ['customer-service', 'excellence', 'support'],
      featuredImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop&crop=entropy',
      createdBy: 'Admin User',
      createdAt: '2023-10-28T14:20:00Z',
      color: 'bg-green-50 border-green-100',
      authorColor: 'bg-green-100 text-green-800'
    },
    {
      id: 3,
      title: 'Technical Innovation Recognition',
      description: 'Robert developed an automated tool that reduced ticket resolution time by 40%. This innovation has streamlined our technical support process and improved overall team efficiency.',
      employee: { 
        id: 3, 
        name: 'Robert Lim', 
        department: 'Technical Support',
        avatar: 'RL'
      },
      recognitionType: 'innovation',
      rating: 97.8,
      status: 'published',
      publishDate: '2023-11-05',
      publishTime: '10:00',
      likes: 28,
      comments: 15,
      shares: 6,
      tags: ['technical', 'innovation', 'automation'],
      featuredImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&crop=entropy',
      createdBy: 'Admin User',
      createdAt: '2023-10-29T11:45:00Z',
      color: 'bg-purple-50 border-purple-100',
      authorColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 4,
      title: 'Team Leadership Excellence',
      description: 'Sarah led her QA team to achieve zero critical bugs in the latest product release. Her leadership and attention to detail ensured the highest quality standards.',
      employee: { 
        id: 4, 
        name: 'Sarah Johnson', 
        department: 'Quality Assurance',
        avatar: 'SJ'
      },
      recognitionType: 'team_player',
      rating: 99.2,
      status: 'published',
      publishDate: '2023-11-10',
      publishTime: '11:00',
      likes: 38,
      comments: 10,
      shares: 7,
      tags: ['leadership', 'quality', 'teamwork'],
      featuredImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop&crop=entropy',
      createdBy: 'Admin User',
      createdAt: '2023-11-09T09:15:00Z',
      color: 'bg-red-50 border-red-100',
      authorColor: 'bg-red-100 text-red-800'
    },
  ];

  // Initialize data
  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 99) return "text-green-600";
    if (rating >= 96) return "text-yellow-600";
    return "text-red-600";
  };

  // Handle save new post
  const handleSaveNewPost = (postData) => {
    const newPost = {
      id: posts.length + 1,
      ...postData,
      employee: { 
        id: postData.employeeId, 
        name: postData.employeeId === 1 ? 'John Michael Santos' : 
               postData.employeeId === 2 ? 'Maria Cristina Reyes' :
               postData.employeeId === 3 ? 'Robert Lim' :
               postData.employeeId === 4 ? 'Sarah Johnson' :
               postData.employeeId === 5 ? 'David Chen' : 'Anna Rodriguez',
        department: postData.employeeId === 1 ? 'Sales' : 
                    postData.employeeId === 2 ? 'Customer Support' :
                    postData.employeeId === 3 ? 'Technical Support' :
                    postData.employeeId === 4 ? 'Quality Assurance' :
                    postData.employeeId === 5 ? 'Operations' : 'Training',
        avatar: postData.employeeId === 1 ? 'JM' : 
                postData.employeeId === 2 ? 'MC' :
                postData.employeeId === 3 ? 'RL' :
                postData.employeeId === 4 ? 'SJ' :
                postData.employeeId === 5 ? 'DC' : 'AR'
      },
      rating: 98 + Math.random() * 2,
      likes: 0,
      comments: 0,
      shares: 0,
      featuredImage: postData.featuredImagePreview || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop&crop=entropy',
      color: `bg-${['blue', 'green', 'purple', 'red'][Math.floor(Math.random() * 4)]}-50 border-${['blue', 'green', 'purple', 'red'][Math.floor(Math.random() * 4)]}-100`,
      authorColor: `bg-${['blue', 'green', 'purple', 'red'][Math.floor(Math.random() * 4)]}-100 text-${['blue', 'green', 'purple', 'red'][Math.floor(Math.random() * 4)]}-800`,
      createdBy: 'Admin User',
      createdAt: new Date().toISOString(),
      publishDate: postData.scheduleForLater ? postData.publishDate : new Date().toISOString().split('T')[0],
      publishTime: postData.scheduleForLater ? postData.publishTime : new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    setPosts([newPost, ...posts]);
    toast.success(`Post ${postData.status === 'draft' ? 'saved as draft' : postData.scheduleForLater ? 'scheduled' : 'published'} successfully!`);
  };

  // Handle delete post
  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    }
  };

  // Get recognition type icon
  const getRecognitionTypeInfo = (type) => {
    switch(type) {
      case 'employee_of_month': return { icon: <Trophy size={20} />, label: 'Employee of the Month' };
      case 'excellence_award': return { icon: <Award size={20} />, label: 'Excellence Award' };
      case 'innovation': return { icon: <Star size={20} />, label: 'Innovation Award' };
      case 'team_player': return { icon: <Users size={20} />, label: 'Team Player' };
      default: return { icon: <Award size={20} />, label: 'Recognition' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Create Post Modal */}
      <CreatePostModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveNewPost}
      />
      
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
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category.toLowerCase().replace(' ', '_'))}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === category.toLowerCase().replace(' ', '_')
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {posts.length} recognition posts
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
      </div>

      {/* Posts Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className={`${post.color} border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300`}>
              {/* Post Image */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <div className={`${post.authorColor} px-3 py-1 rounded-full text-sm font-medium`}>
                    {post.employee.department}
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="p-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getRecognitionTypeInfo(post.recognitionType).icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(post.publishDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-white/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {post.employee.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{post.employee.name}</h4>
                    <p className="text-sm text-gray-600">{post.employee.department}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="bg-white/70 text-gray-700 px-2 py-1 rounded text-xs border">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {post.shares}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={post.featuredImage} 
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
                          {post.employee.department}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.publishDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getRatingColor(post.rating)}`}>
                      {post.rating}%
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {post.employee.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{post.employee.name}</h4>
                      <div className="text-sm text-gray-500">{post.pointsAwarded} points</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {post.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Heart size={12} /> {post.likes}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MessageCircle size={12} /> {post.comments}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View More Button */}
      {posts.length > 0 && (
        <div className="flex justify-center mt-8">
          <button className="px-6 py-3 bg-white border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 rounded-lg font-medium transition-all flex items-center gap-2">
            View More
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <div className="flex flex-wrap gap-6 justify-center mb-6">
          {categories.slice(0, 4).map((category) => (
            <a
              key={category}
              href="#"
              className="text-gray-600 hover:text-red-600 text-sm"
            >
              {category}
            </a>
          ))}
        </div>
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Recognition Wall. Celebrating excellence across departments.
        </p>
      </div>
    </div>
  );
};

export default AdminRecognition;