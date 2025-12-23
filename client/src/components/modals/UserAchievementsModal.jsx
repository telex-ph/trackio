import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Crown, Medal, Heart, Lightbulb, Zap, Download, 
  FileText, Calendar, User, Building, Briefcase, X, Printer, 
  Share2, Star, CheckCircle, Clock, Tag, Image as ImageIcon, 
  RefreshCw, Users, ChevronRight 
} from 'lucide-react';
import api from '../../utils/axios';
import jsPDF from 'jspdf';

const AchievementCard = ({ achievement, onDownloadCertificate }) => {
  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown className="w-5 h-5" />,
          color: "from-yellow-400 to-amber-500",
          bgColor: "bg-gradient-to-r from-yellow-50 to-amber-50",
          label: "Employee of the Month",
          badgeColor: "bg-yellow-100 text-yellow-800"
        };
      case "excellence_award":
        return {
          icon: <Medal className="w-5 h-5" />,
          color: "from-purple-400 to-indigo-500",
          bgColor: "bg-gradient-to-r from-purple-50 to-indigo-50",
          label: "Excellence Award",
          badgeColor: "bg-purple-100 text-purple-800"
        };
      case "innovation":
        return {
          icon: <Lightbulb className="w-5 h-5" />,
          color: "from-blue-400 to-cyan-500",
          bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
          label: "Innovation Award",
          badgeColor: "bg-blue-100 text-blue-800"
        };
      case "team_player":
        return {
          icon: <Heart className="w-5 h-5" />,
          color: "from-green-400 to-emerald-500",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
          label: "Team Player",
          badgeColor: "bg-green-100 text-green-800"
        };
      default:
        return {
          icon: <Award className="w-5 h-5" />,
          color: "from-gray-400 to-slate-500",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
          label: "Recognition",
          badgeColor: "bg-gray-100 text-gray-800"
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const typeInfo = getRecognitionTypeInfo(achievement.recognitionType);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${typeInfo.bgColor}`}>
              {typeInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{achievement.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.badgeColor}`}>
                  {typeInfo.label}
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(achievement.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onDownloadCertificate(achievement)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Download Certificate"
          >
            <Download size={18} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{achievement.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building size={14} />
              {achievement.department || achievement.employee?.department || 'Department'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {achievement.employee?.position || 'Position'}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            {achievement.status === 'published' ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={12} />
                Published
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock size={12} />
                {achievement.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserAchievementsModal = ({ isOpen, onClose, currentUser }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setSelectedAchievement] = useState(null);
  const [ setDownloading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.employeeId) {
      fetchUserAchievements();
    }
  }, [isOpen, currentUser]);

  const fetchUserAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/recognition/employee/${currentUser.employeeId}`);
      
      if (response.data.success) {
        setAchievements(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (achievement) => {
    try {
      setDownloading(true);
      setSelectedAchievement(achievement);
      
      // In a real implementation, this would call your certificate API
      // For now, we'll use a simple alert
      alert(`Certificate for "${achievement.title}" would be generated here.`);
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadAllAchievements = async () => {
    if (achievements.length === 0) return;
    
    setExporting(true);
    try {
      const pdf = new jsPDF();
      const user = currentUser;
      
      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(40, 40, 40);
      pdf.text("My Achievements Portfolio", 20, 30);
      
      // User info
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
      
      if (user) {
        pdf.setFontSize(14);
        pdf.setTextColor(60, 60, 60);
        pdf.text(`Employee: ${user.firstName} ${user.lastName}`, 20, 55);
        pdf.text(`Employee ID: ${user.employeeId}`, 20, 65);
        pdf.text(`Department: ${user.department || 'N/A'}`, 20, 75);
      }
      
      let yPosition = 90;
      
      // Add each achievement
      achievements.forEach((achievement, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(220, 38, 38);
        pdf.text(`${index + 1}. ${achievement.title}`, 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(80, 80, 80);
        
        const typeLabel = achievement.recognitionType
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        pdf.text(`Award Type: ${typeLabel}`, 20, yPosition);
        yPosition += 7;
        
        pdf.text(`Date: ${new Date(achievement.createdAt).toLocaleDateString()}`, 20, yPosition);
        yPosition += 7;
        
        const description = achievement.description;
        const maxLength = 150;
        const truncatedDesc = description.length > maxLength 
          ? description.substring(0, maxLength) + '...'
          : description;
        
        pdf.text(`Description: ${truncatedDesc}`, 20, yPosition);
        yPosition += 15;
        
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition, 190, yPosition);
        yPosition += 10;
      });
      
      const fileName = `Achievements_Portfolio_${user?.employeeId || 'user'}_${Date.now()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error("Error exporting achievements:", error);
      alert("Error exporting achievements. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const getAchievementStats = () => {
    const typeCounts = {};
    const currentYear = new Date().getFullYear();
    let currentYearCount = 0;
    
    achievements.forEach(achievement => {
      const type = achievement.recognitionType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      
      const achievementYear = new Date(achievement.createdAt).getFullYear();
      if (achievementYear === currentYear) {
        currentYearCount++;
      }
    });
    
    const recentCount = achievements.filter(a => {
      const date = new Date(a.createdAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return date > thirtyDaysAgo;
    }).length;
    
    const statsItems = [
      {
        label: 'Total Achievements',
        value: achievements.length,
        icon: <Trophy className="w-5 h-5" />,
        color: 'from-red-500 to-red-600',
      },
      {
        label: 'Recent Awards',
        value: recentCount,
        icon: <Zap className="w-5 h-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        label: 'This Year',
        value: currentYearCount,
        icon: <Calendar className="w-5 h-5" />,
        color: 'from-blue-500 to-cyan-600',
      },
    ];

    return statsItems;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="text-red-600" />
                My Achievements
              </h2>
              <p className="text-gray-600 mt-1">
                View, download, and share your recognition certificates
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-4 mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <div className="flex items-center gap-4 text-gray-600 text-sm mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    ID: {currentUser.employeeId}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building size={14} />
                    {currentUser.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            {getAchievementStats().map((stat, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </div>
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                    {React.cloneElement(stat.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 300px)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                My Recognition Awards
                <span className="text-gray-500 font-normal text-sm ml-2">
                  ({achievements.length} awards)
                </span>
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={fetchUserAchievements}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              {achievements.length > 0 && (
                <button
                  onClick={downloadAllAchievements}
                  disabled={exporting}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      Export All as PDF
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your achievements...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                <Trophy size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No achievements yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                You haven't received any recognition awards yet. Keep up the great work!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement._id}
                  achievement={achievement}
                  onDownloadCertificate={generateCertificate}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        {achievements.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {achievements.length} achievements • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAchievementsModal;