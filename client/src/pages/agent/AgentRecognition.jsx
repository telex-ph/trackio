import React, { useState } from 'react';
import UnderContruction from '../../assets/illustrations/UnderContruction';

const AgentRecognition = () => {
  const [timeFrame, setTimeFrame] = useState('month');

  // Leaderboard data
  const leaderboardData = [
    { id: 1, name: "Seligiha Dutta", department: "Marketing", rank: 4, points: 2450, isCurrentUser: false },
    { id: 2, name: "Aeethi Bilgisi", department: "Cortings", rank: 2, points: 3200, isCurrentUser: false },
    { id: 3, name: "Sarebey Gaha", department: "Design", rank: 5, points: 1980, isCurrentUser: false },
    { id: 4, name: "Kongkora Das", department: "Engineering", rank: 1, points: 3850, isCurrentUser: false },
    { id: 5, name: "Himadri Nath", department: "Marketing", rank: 6, points: 1750, isCurrentUser: false },
    { id: 6, name: "Rutha Sarmah", department: "Sales", rank: 3, points: 2750, isCurrentUser: false },
    { id: 7, name: "Kongkora Bayan", department: "Operations", rank: 7, points: 1620, isCurrentUser: false },
    { id: 8, name: "Hemanga Bhar...", department: "HR", rank: 8, points: 1480, isCurrentUser: false },
    { id: 9, name: "My Banking", department: "Finance", rank: 9, points: 1250, isCurrentUser: false },
    { id: 10, name: "You", department: "Development", rank: 10, points: 980, isCurrentUser: true },
    { id: 11, name: "Gilbert Raux", department: "Support", rank: 11, points: 750, isCurrentUser: false },
  ];

  // Sort by rank
  const sortedData = [...leaderboardData].sort((a, b) => a.rank - b.rank);

  // Get rank badge color
  const getRankBadgeClass = (rank) => {
    switch(rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-200 text-gray-700";
      case 3: return "bg-gradient-to-r from-amber-600 to-amber-500 text-amber-100";
      default: return "bg-gradient-to-r from-blue-50 to-white text-gray-700 border border-gray-200";
    }
  };

  // Handle time frame change
  const handleTimeFrameChange = (frame) => {
    setTimeFrame(frame);
    // In a real app, you would fetch data for the selected time frame here
  };

    return (
    <section className="h-full">
      <UnderContruction />
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600 text-lg">
            Check latest rankings based on rewards, recognition and employee engagement.
          </p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side - Leaderboard cards */}
          <div className="lg:w-2/3">
            {/* Time frame selector */}
            <div className="mb-8 flex flex-wrap gap-4">
              <button 
                onClick={() => handleTimeFrameChange('month')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${timeFrame === 'month' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                This Month
              </button>
              <button 
                onClick={() => handleTimeFrameChange('quarter')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${timeFrame === 'quarter' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                This Quarter
              </button>
              <button 
                onClick={() => handleTimeFrameChange('year')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${timeFrame === 'year' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
              >
                This Year
              </button>
            </div>

            {/* Leaderboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Top 3 cards */}
              {sortedData.slice(0, 3).map((employee) => (
                <div 
                  key={employee.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${
                    employee.rank === 1 ? 'border-yellow-400' : 
                    employee.rank === 2 ? 'border-gray-300' : 
                    'border-amber-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`rank-badge ${getRankBadgeClass(employee.rank)} w-12 h-12 flex items-center justify-center rounded-xl font-bold text-xl`}>
                      {employee.rank}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Points</div>
                      <div className="text-2xl font-bold text-gray-800">{employee.points}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{employee.name}</h3>
                    <p className="text-gray-600 mb-4">{employee.department}</p>
                    {employee.rank === 1 && (
                      <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-crown"></i>
                        <span>Top Performer</span>
                      </div>
                    )}
                    {employee.rank === 2 && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-medal"></i>
                        <span>Runner Up</span>
                      </div>
                    )}
                    {employee.rank === 3 && (
                      <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                        <i className="fas fa-award"></i>
                        <span>Third Place</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Full leaderboard list */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Full Rankings</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedData.map((employee) => (
                  <div 
                    key={employee.id}
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                      employee.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rank-badge ${getRankBadgeClass(employee.rank)} w-10 h-10 flex items-center justify-center rounded-lg font-bold`}>
                        {employee.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {employee.name}
                            {employee.isCurrentUser && (
                              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">You</span>
                            )}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500">{employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{employee.points}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Stats & Info */}
          <div className="lg:w-1/3">
            {/* Stats card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white mb-8">
              <h3 className="text-xl font-bold mb-6">Leaderboard Stats</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-200">Total Participants</span>
                    <span className="font-bold">48</span>
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
                  <div className="relative rounded-2xl overflow-hidden">
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
                      <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color} backdrop-blur-sm border ${typeInfo.color.replace('text', 'border')} border-opacity-30`}>
                        {typeInfo.label}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 h-64 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${typeInfo.gradient} flex items-center justify-center mb-3 shadow-lg mx-auto`}>
                        {React.cloneElement(typeInfo.icon, { className: "w-8 h-8 text-white" })}
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">{typeInfo.label}</h3>
                      <p className="text-gray-600 text-sm mt-1">No images available</p>
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="text-gray-600 italic text-sm bg-gray-100 px-2 py-1 rounded-lg">
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

              {/* Enhanced Sidebar */}
              <div className="space-y-6">
                {/* Employee Card with Badges and History */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Group size={15} />
                    Recognized Employee
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {post.employee?.name ? post.employee.name.charAt(0).toUpperCase() : 'E'}
                    </div>
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

                  {/* Employee Badges Summary */}
                  <div className="mb-5 p-3 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-700">Achievements</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Employee */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Certificate button - Only show download if current user is recipient */}
                    {isCurrentUserRecipient ? (
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="flex items-center justify-center gap-2 p-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all duration-300 text-sm font-medium group/cert"
                      >
                        <FileText size={14} className="group-hover/cert:scale-110 transition-transform" />
                        Certificate
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 p-2.5 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed text-sm font-medium"
                        title="Certificate download available only for recipient"
                      >
                        <FileText size={14} />
                        Certificate
                      </button>
                    )}
                    <button
                      onClick={() => setShowHistory(true)}
                      disabled={!hasHistory}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all duration-300 text-sm font-medium group/hist ${
                        hasHistory 
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <History size={14} className="group-hover/hist:scale-110 transition-transform" />
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
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Recognition ID</span>
                      <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {post._id?.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Certificate Access</span>
                      <span className={`text-sm font-medium ${isCurrentUserRecipient ? 'text-green-600' : 'text-gray-600'}`}>
                        {isCurrentUserRecipient ? 'Available' : 'Recipient Only'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions - UPDATED: Only show download certificate if user is recipient */}
                <div className="space-y-3">
                  {isCurrentUserRecipient ? (
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md hover:shadow-lg group/cert-dl"
                    >
                      <Download size={18} className="group-hover/cert-dl:animate-bounce" />
                      Download Certificate
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gray-200 text-gray-500 rounded-xl font-medium cursor-not-allowed"
                      title="Certificate download available only for recipient"
                    >
                      <Shield size={18} />
                      Recipient Only
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(true)}
                    disabled={!hasHistory}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${
                      hasHistory 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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

      {/* Certificate Modal - Only shown for recipient */}
      {showCertificate && isCurrentUserRecipient && (
        <Certificate 
          post={post} 
          onClose={() => setShowCertificate(false)} 
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <RecognitionHistory 
          employee={post.employee}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

// Enhanced Recognition Card
const RecognitionCard = ({ post, onView }) => {
  const getRecognitionTypeInfo = (type) => {
    switch(type) {
      case 'employee_of_month': 
        return { 
          icon: <Crown className="text-yellow-600" size={18} />, 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          label: 'Employee of Month',
          gradient: 'from-yellow-500 to-amber-500'
        };
      case 'excellence_award': 
        return { 
          icon: <Medal className="text-purple-600" size={18} />, 
          color: 'text-purple-600', 
          bgColor: 'bg-purple-50',
          label: 'Excellence Award',
          gradient: 'from-purple-500 to-indigo-500'
        };
      case 'innovation': 
        return { 
          icon: <Lightbulb className="text-blue-600" size={18} />, 
          color: 'text-blue-600', 
          bgColor: 'bg-blue-50',
          label: 'Innovation Award',
          gradient: 'from-blue-500 to-cyan-500'
        };
      case 'team_player': 
        return { 
          icon: <Heart className="text-green-600" size={18} />, 
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

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
  const avatarInitials = post.employee?.name 
    ? post.employee.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'EE';

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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' • ' + formatTime(dateString);
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-light overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
      onClick={() => onView(post)}
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
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color} backdrop-blur-sm border ${typeInfo.color.replace('text', 'border')} border-opacity-30`}>
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
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {post.title}
        </h3>
        
        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-gray-600 italic text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-gray-500 text-xs italic">+{post.tags.length - 3} more</span>
            )}
          </div>
        )}
        
        {/* Description Preview */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {post.description}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4 group-hover:bg-gray-100 transition-colors">
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

        {/* Card Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-light">
          <div className="text-xs text-gray-500">
            {formatDateTime(post.createdAt)}
          </div>
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center gap-1.5 hover:shadow-lg group/view">
            <span>View Details</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AgentRecognition Component - VIEW ONLY
const AgentRecognition = () => {
  const [activeCategory, setActiveCategory] = useState('Recent posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [currentUserId, setCurrentUserId] = useState(null);
  const postsPerPage = 8;

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setCurrentUserId(response.data.user.employeeId);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const showCustomToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

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
      showCustomToast("New recognition added", "success");
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
      showCustomToast("Recognition archived", "success");
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

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchRecognitions();
    // Request refresh from socket
    socket.emit("getAgentRecognitionData");
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

  // Get current month for highlights
  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Loading state
  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Toast Component */}
      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
      
      {/* Post Details Modal */}
      <PostDetailsModal 
        post={selectedPost}
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
        }}
        currentUserId={currentUserId}
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
              {/* Badges Button - Now opens My Achievements Modal */}
              <EmployeeBadges 
                currentUserId={currentUserId}
                allPosts={posts}
              />
      
              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 bg-white border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 rounded-xl font-medium transition-all flex items-center gap-2 hover:shadow-md"
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
                  setCurrentPage(1); 
                }}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                  activeCategory === category.name
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
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
              <div className="text-center py-12 bg-white rounded-2xl border border-light shadow-sm">
                <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recognitions found</h3>
                <p className="text-gray-600">No published recognitions available for this category.</p>
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
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-red-600 text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
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

          {/* Right Column */}
          <div className="space-y-8">
            {/* Monthly Highlights Card */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-2" size={22} />
                {getCurrentMonth()} Highlights
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
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Badge size={14} />
                    </div>
                    <span>Badges Awarded</span>
                  </div>
                  <span className="font-bold text-lg">{posts.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-light shadow-sm p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="mr-2" size={20} />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (posts.length > 0) {
                      handleViewPost(posts[0]);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all group/action"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-full flex items-center justify-center shadow-sm">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Latest Recognition</div>
                      <div className="text-xs text-gray-600">View most recent award</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400 group-hover/action:text-red-600 transition-colors" />
                </button>

                <button
                  onClick={() => {
                    // Find employee with most recognitions
                    const employeeMap = {};
                    posts.forEach(post => {
                      if (post.employee?.employeeId) {
                        if (!employeeMap[post.employee.employeeId]) {
                          employeeMap[post.employee.employeeId] = {
                            employee: post.employee,
                            count: 0
                          };
                        }
                        employeeMap[post.employee.employeeId].count++;
                      }
                    });
                    
                    const topEmployee = Object.values(employeeMap).sort((a, b) => b.count - a.count)[0];
                    if (topEmployee) {
                      const topPost = posts.find(post => post.employee?.employeeId === topEmployee.employee.employeeId);
                      if (topPost) {
                        handleViewPost(topPost);
                      }
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 rounded-xl transition-all group/action"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Top Performer</div>
                      <div className="text-xs text-gray-600">View employee with most awards</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400 group-hover/action:text-yellow-600 transition-colors" />
                </button>

                <button
                  onClick={handleRefresh}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all group/action"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Refresh Data</div>
                      <div className="text-xs text-gray-600">Update with latest recognitions</div>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-400 group-hover/action:text-blue-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-light text-center">
          <div className="flex flex-wrap gap-6 justify-center mb-4">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.name);
                  setCurrentPage(1);
                }}
                className="text-gray-600 hover:text-red-600 text-sm font-medium transition-colors hover:underline"
              >
                {category.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Celebrate excellence • Recognize achievements • Download certificates • View history
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentRecognition;