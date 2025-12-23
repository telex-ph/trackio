import React from "react";
import { History, Trophy, FileText, X, Award, Star, Users, Calendar, Image as ImageIcon } from "lucide-react";

const EmployeeHistoryModal = ({ isOpen, onClose, employee, posts }) => {
  if (!isOpen || !employee) return null;

  const employeePosts = posts.filter(
    (post) =>
      post.employee?._id === employee._id ||
      post.employee?.employeeId === employee.employeeId
  );

  const stats = [
    { label: "Total Awards", value: employeePosts.length, icon: Trophy, color: "text-blue-600", border: "border-blue-100", bg: "bg-blue-50/50" },
    { label: "Employee of Month", value: employeePosts.filter(p => p.recognitionType === 'employee_of_month').length, icon: Star, color: "text-yellow-600", border: "border-yellow-100", bg: "bg-yellow-50/50" },
    { label: "Excellence", value: employeePosts.filter(p => p.recognitionType === 'excellence_award').length, icon: Award, color: "text-purple-600", border: "border-purple-100", bg: "bg-purple-50/50" },
    { label: "Team Player", value: employeePosts.filter(p => p.recognitionType === 'team_player').length, icon: Users, color: "text-green-600", border: "border-green-100", bg: "bg-green-50/50" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fadeIn" onClick={onClose} />
      
      {/* Modal Main Container */}
      <div className="relative bg-[#F8FAFC] rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-slideUp border border-white">
        
        {/* Header Section (White Background) */}
        <div className="bg-white p-8 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {employee.name?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1.5 rounded-lg border-2 border-white shadow-sm">
                  <Trophy size={14} className="text-white" fill="currentColor" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{employee.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wider">
                    {employee.employeeId || "ID-104"}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">• {employee.department}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors group">
              <X size={20} className="text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, i) => (
              <div key={i} className={`${stat.bg} ${stat.border} border rounded-2xl p-4 transition-all hover:shadow-sm`}>
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={16} className={stat.color} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</span>
                </div>
                <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex items-center gap-2 mb-6">
            <History size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Recognition Timeline</h3>
          </div>

          {employeePosts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">No achievements yet</h4>
              <p className="text-gray-500 max-w-xs mx-auto mt-2">Great things take time! Recognition posts will appear here.</p>
            </div>
          ) : (
            /* Achievement Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employeePosts.map((post, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  {/* Image Holder */}
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {post.imageUrl ? (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={32} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase rounded shadow-sm text-indigo-600">
                        {post.recognitionType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      <Calendar size={12} />
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h4>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {post.description}
                    </p>
                    
                    {post.certificateUrl && (
                      <button 
                        onClick={() => window.open(post.certificateUrl, '_blank')}
                        className="w-full py-2 bg-gray-50 hover:bg-rose-50 text-rose-500 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText size={14} />
                        View Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistoryModal;