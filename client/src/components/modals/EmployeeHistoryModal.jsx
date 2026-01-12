import React, { useState, useEffect } from "react";
import {
  X, Trophy, Calendar, Award, Crown,
  Zap, Users, ChevronLeft, ChevronRight,
  Download, FileText, Loader,
  BarChart3, Filter, ShieldCheck, ExternalLink,
  Target, Star, Briefcase, GraduationCap, ChevronDown
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
  const postsPerPage = 6;

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
    const targetEmployee = employee || loggedInUser;
    if (!targetEmployee) { setFilteredPosts([]); return; }

    const employeePosts = posts.filter(post => post.employee?.employeeId === targetEmployee.employeeId);
    let filtered = employeePosts;
    if (filter !== "all") {
      filtered = employeePosts.filter(post => post.recognitionType === filter);
    }
    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [isOpen, employee, posts, filter, loggedInUser]);

  const getRecognitionTypeInfo = (type) => {
    const map = {
      employee_of_month: { icon: <Crown size={16} />, label: "Employee of the Month", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
      excellence_award: { icon: <Award size={16} />, label: "Excellence Award", color: "text-blue-800", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      innovation: { icon: <Zap size={16} />, label: "Innovation Lead", color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
      team_player: { icon: <Users size={16} />, label: "Team Player", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" }
    };
    return map[type] || { icon: <Trophy size={16} />, label: "Recognition", color: "text-slate-700", bgColor: "bg-slate-50", borderColor: "border-slate-200" };
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getStats = (employeePosts) => {
    return {
      total: employeePosts.length,
      eom: employeePosts.filter(p => p.recognitionType === "employee_of_month").length,
      excellence: employeePosts.filter(p => p.recognitionType === "excellence_award").length,
      innovation: employeePosts.filter(p => p.recognitionType === "innovation").length,
      team: employeePosts.filter(p => p.recognitionType === "team_player").length,
    };
  };

  const showCustomToast = (message, type = "success") => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 right-8 z-[100] ${type === "success" ? "bg-[#800000]" : "bg-red-800"} text-white px-5 py-3 rounded shadow-2xl text-sm font-bold animate-in fade-in slide-in-from-bottom-2`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
  };

  const isOwnerOfPost = (post) => currentUser && post.employee && (post.employee.employeeId === currentUser.employeeId || post.employee._id === currentUser._id);

  const handleDownloadCertificate = async (post) => {
    if (!isOwnerOfPost(post)) { showCustomToast("RESTRICTED ACCESS: PERSONAL RECORDS ONLY", "error"); return; }
    try {
      setDownloading(prev => ({ ...prev, [post._id]: true }));
      const response = await api.post('/recognition/generate-certificate', {
        recognitionId: post._id, employeeId: post.employee?._id || post.employee?.employeeId,
        type: post.recognitionType, title: post.title, employeeName: post.employee?.name || "Employee",
        date: post.createdAt, preview: false
      }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `record_${post._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) { showCustomToast("PROCESS FAILED: PLEASE TRY AGAIN", "error"); }
    finally { setDownloading(prev => ({ ...prev, [post._id]: false })); }
  };

  const handleViewCertificate = async (post) => {
    if (!isOwnerOfPost(post)) { showCustomToast("RESTRICTED ACCESS: PERSONAL RECORDS ONLY", "error"); return; }
    try {
      setDownloading(prev => ({ ...prev, [post._id]: true }));
      const response = await api.post('/recognition/generate-certificate', {
        recognitionId: post._id, employeeId: post.employee?._id || post.employee?.employeeId,
        type: post.recognitionType, title: post.title, employeeName: post.employee?.name || "Employee",
        date: post.createdAt, preview: true
      }, { responseType: 'blob' });
      window.open(window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' })), '_blank');
    } catch (error) { showCustomToast("PREVIEW FAILED: PLEASE TRY AGAIN", "error"); }
    finally { setDownloading(prev => ({ ...prev, [post._id]: false })); }
  };

  const employeePosts = (employee || loggedInUser) ? posts.filter(post => post.employee?.employeeId === (employee || loggedInUser).employeeId) : [];
  const stats = getStats(employeePosts);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  if (!isOpen) return null;
  const targetEmployee = employee || loggedInUser;

  const statItems = [
    { label: "Emp. of Month", count: stats.eom, icon: <Crown className="text-amber-500" size={18} /> },
    { label: "Excellence", count: stats.excellence, icon: <Award className="text-blue-500" size={18} /> },
    { label: "Innovation", count: stats.innovation, icon: <Zap className="text-purple-500" size={18} /> },
    { label: "Team Player", count: stats.team, icon: <Users className="text-emerald-500" size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-10">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #800000; }
        `}
      </style>
      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-[90rem] h-full md:h-auto md:max-h-[95vh] overflow-hidden md:rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] flex flex-col border border-slate-200 border-t-[8px] border-t-[#800000]">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-[#800000] rounded-xl shadow-lg">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {employee ? "Professional Portfolio" : "Employment Ledger"}
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Official Verified Records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={26} />
          </button>
        </div>

        {/* STATS */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1 bg-[#800000] rounded-xl p-5 flex flex-col justify-center items-center shadow-xl">
              <span className="text-white/70 text-[10px] font-black uppercase mb-1 tracking-widest">Total Merits</span>
              <div className="flex items-center gap-2">
                <Trophy size={24} className="text-amber-400" />
                <span className="text-4xl font-black text-white">{stats.total}</span>
              </div>
            </div>
            {statItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                <div className="flex items-center gap-2 mb-0.5">
                  {item.icon}
                  <span className="text-2xl font-black text-slate-800">{item.count}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-white">
          {/* SIDEBAR */}
          <div className="w-full md:w-72 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
            <div className="p-8 flex flex-col items-center border-b border-slate-200">
              <div className="w-20 h-20 rounded-2xl bg-[#800000] text-white flex items-center justify-center text-3xl font-black mb-4 shadow-xl border-4 border-white">
                {targetEmployee.name?.charAt(0)}
              </div>
              <h3 className="font-black text-slate-900 text-base text-center uppercase tracking-tight">{targetEmployee.name}</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest">{targetEmployee.position}</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <nav className="space-y-2">
                {["all", "employee_of_month", "excellence_award", "innovation", "team_player"].map((id) => (
                  <button
                    key={id}
                    onClick={() => setFilter(id)}
                    className={`w-full text-left px-5 py-3.5 text-[11px] font-black uppercase transition-all rounded-xl border-2 ${
                      filter === id
                        ? "bg-[#800000] border-[#800000] text-white shadow-lg"
                        : "border-transparent text-slate-500 hover:bg-white hover:border-slate-200"
                    }`}
                  >
                    {id.replace(/_/g, " ")}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* LIST AREA - Balanced Card Width */}
          <div className="flex-1 flex flex-col bg-slate-100/50 overflow-hidden">
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="flex flex-wrap gap-6 justify-start pb-10">
                {currentPosts.map((post) => {
                  const typeInfo = getRecognitionTypeInfo(post.recognitionType);
                  const isOwner = isOwnerOfPost(post);
                  const isDownloading = downloading[post._id];
                  
                  return (
                    <div 
                      key={post._id} 
                      className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.33%-1.5rem)] max-w-[400px]"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${typeInfo.borderColor} ${typeInfo.bgColor}`}>
                          <span className={typeInfo.color}>{typeInfo.icon}</span>
                          <span className={`text-[9px] font-black uppercase ${typeInfo.color}`}>{typeInfo.label}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400">{formatDate(post.createdAt)}</span>
                      </div>

                      <div className="p-6 flex-1 bg-white">
                        <h4 className="font-black text-slate-900 text-sm mb-3 uppercase tracking-tight">{post.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 border-[#800000]/20 pl-4">
                          "{post.description}"
                        </p>
                      </div>

                      <div className="px-5 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <ShieldCheck size={14} className="text-emerald-600" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewCertificate(post)}
                            disabled={!isOwner || isDownloading}
                            className="p-2 text-slate-400 hover:text-[#800000] transition-colors"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => handleDownloadCertificate(post)}
                            disabled={!isOwner || isDownloading}
                            className={`flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${
                              isOwner
                                ? "bg-[#800000] text-white hover:bg-[#600000]"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {isDownloading ? <Loader size={12} className="animate-spin" /> : <Download size={12} />}
                            CERTIFICATE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAGINATION */}
            <div className="px-8 py-5 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <Target size={18} className="text-[#800000]" /> Registry
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-5 py-2 rounded-full border border-slate-200">
                   BLOCK {currentPage} / {totalPages || 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 border border-slate-200 rounded-xl hover:border-[#800000] hover:text-[#800000] disabled:opacity-20 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2.5 border border-slate-200 rounded-xl hover:border-[#800000] hover:text-[#800000] disabled:opacity-20 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistoryModal;