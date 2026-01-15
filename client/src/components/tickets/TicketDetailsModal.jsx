import { X, MessageSquare, FileText, CheckCircle, Edit2, Shield, User, Tag, Clock, Star, Monitor, MessageCircle } from "lucide-react";
import { Spinner } from "flowbite-react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const bearerToken = "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47";

// --- SUB-COMPONENT: ATTACHMENT VIEWER ---
const AttachmentViewerModal = ({ isOpen, onClose, attachmentUrl }) => {
  if (!isOpen) return null;
  const ext = typeof attachmentUrl === "string" ? attachmentUrl.split("?")[0].split(".").pop()?.toLowerCase() : "";
  const isImage = ["jpg","jpeg","png","gif","webp","svg"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className={`bg-white rounded-lg w-full ${isPdf ? "max-w-6xl h-[90vh]" : "max-w-4xl max-h-[85vh]"} relative flex items-center justify-center shadow-2xl`} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-slate-300 transition-colors flex items-center gap-2 text-sm font-semibold">
          <X className="w-5 h-5" /> Close Preview
        </button>
        {isImage ? <img src={attachmentUrl} alt="Attachment" className="max-w-full max-h-full object-contain p-2" /> :
         isPdf ? <iframe src={attachmentUrl} title="Preview" className="w-full h-full rounded-b-lg" frameBorder="0" /> :
         <div className="text-center p-10">
           <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-[#800000] text-white rounded font-bold hover:bg-[#600000] transition-colors text-xs">
             Download Attachment
           </a>
         </div>}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: REUSABLE CARD ---
const Card = ({ title, children, className="", icon: Icon }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-5 transition-all shadow-sm ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
        {Icon && <Icon className="w-4 h-4 text-[#800000]" />}
        <p className="text-[11px] font-bold text-slate-500 uppercase">{title}</p>
      </div>
    )}
    {children}
  </div>
);

// --- SUB-COMPONENT: EDIT CONTROLS ---
const Controls = ({ save, cancel, saving }) => (
  <div className="flex gap-2 mt-3">
    <button onClick={save} disabled={saving} className="px-4 py-1.5 bg-[#800000] text-white text-[10px] font-bold rounded hover:bg-[#600000] disabled:opacity-50 transition-all">
      {saving ? "Saving..." : "Save"}
    </button>
    <button onClick={cancel} disabled={saving} className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-200 transition-all">
      Cancel
    </button>
  </div>
);

// --- SUB-COMPONENT: METRIC BOX ---
const MetricBox = ({ label, value, icon: Icon, colorClass = "text-slate-800" }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
    </div>
    <p className={`text-base font-bold uppercase ${colorClass}`}>{value}</p>
  </div>
);

// --- MAIN COMPONENT: TICKET DETAILS MODAL ---
const TicketDetailsModal = ({
  isOpen, onClose, ticketDetails, isLoading, onViewComments, onConfirmResolution, onRejectResolution, formatDate, userEmail, onTicketUpdate
}) => {
  const [edits, setEdits] = useState({ subject: false, station: false, desc: false });
  const [values, setValues] = useState({ subject: "", station: "", desc: "" });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  if (!isOpen) return null;

  const isResolved = ticketDetails?.status?.toLowerCase() === "resolved";
  const isClosed   = ticketDetails?.status?.toLowerCase() === "closed";
  const editable   = !isResolved && !isClosed;
  const canConfirm = isResolved && ticketDetails?.ticketNo && !ticketDetails?.agentConfirmed;

  const startEdit = field => {
    setValues(v => ({ ...v, [field]: ticketDetails[field === "desc" ? "description" : field] || "" }));
    setEdits(e => ({ ...e, [field === "desc" ? "desc" : field]: true }));
  };

  const cancel = () => setEdits({ subject: false, station: false, desc: false });

  const save = async () => {
    const payload = { email: userEmail, updateTicketNo: ticketDetails.ticketNo };
    if (edits.subject) payload.subject = values.subject.trim();
    if (edits.station) payload.stationNo = Number(values.station);
    if (edits.desc) payload.description = values.desc.trim();

    setSaving(true);
    try {
      await axios.patch("https://ticketing-system-2u0k.onrender.com/api/ittickets/trackio/updateTicket", payload, {
        headers: { "Content-Type": "application/json", Authorization: bearerToken }
      });
      toast.success("Updated");
      cancel();
      onTicketUpdate?.({ ...ticketDetails, ...payload });
    } catch (err) { 
      toast.error("Update failed"); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <>
      <style>
        {`
          .custom-scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar-thin::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 10px;
          }
          .custom-scrollbar-thin::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          .custom-scrollbar-thin {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f8fafc;
          }
        `}
      </style>

      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl flex flex-col overflow-hidden border-t-4 border-[#800000]" style={{ maxHeight: "92vh" }}>
          
          <div className="bg-white px-8 py-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <Shield className="w-5 h-5 text-[#800000]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 uppercase">Ticket Information</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Internal Support Protocol</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-[#800000] hover:bg-red-50 rounded transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-[#fafafa] custom-scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Spinner size="lg" className="fill-[#800000]" />
                <p className="text-xs font-bold text-slate-400 uppercase text-center">Authenticating Session...</p>
              </div>
            ) : ticketDetails ? (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Identification Details" icon={FileText}>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Incident Subject</span>
                          {editable && !edits.subject && <button onClick={() => startEdit("subject")} className="text-slate-300 hover:text-blue-600 transition-colors"><Edit2 className="w-3 h-3" /></button>}
                        </div>
                        {edits.subject ? (
                          <div className="w-full">
                            <input value={values.subject} onChange={e=>setValues(v=>({...v,subject:e.target.value}))} className="w-full p-2.5 text-sm font-bold border border-slate-300 rounded focus:ring-1 focus:ring-[#800000] outline-none" />
                            <Controls save={save} cancel={cancel} saving={saving} />
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50/50 rounded border border-slate-100">
                            <p className="text-sm font-bold text-gray-900">{ticketDetails.subject}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Station No</span>
                          {editable && !edits.station && <button onClick={() => startEdit("station")} className="text-slate-300 hover:text-blue-600 transition-colors"><Edit2 className="w-3 h-3" /></button>}
                        </div>
                        {edits.station ? (
                          <div className="w-full">
                            <input type="number" value={values.station} onChange={e=>setValues(v=>({...v,station:e.target.value}))} className="w-full p-2.5 text-sm font-bold border border-slate-300 rounded focus:ring-1 focus:ring-[#800000] outline-none" autoFocus />
                            <Controls save={save} cancel={cancel} saving={saving} />
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50/50 rounded border border-slate-100 flex items-center gap-3">
                            <Monitor className="w-4 h-4 text-[#800000]" />
                            <p className="text-sm font-bold text-slate-800">#{ticketDetails.stationNo || "---"}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card title="Documentation Narrative" icon={MessageSquare}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Details:</span>
                       {editable && <button onClick={() => startEdit("desc")} className="text-slate-300 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>}
                    </div>
                    {edits.desc ? (
                      <div className="w-full">
                        <textarea value={values.desc} onChange={e=>setValues(v=>({...v,desc:e.target.value}))} className="w-full h-32 p-3 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-[#800000] outline-none resize-none" />
                        <Controls save={save} cancel={cancel} saving={saving} />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700 leading-relaxed p-4 bg-slate-50/50 rounded border border-slate-100 min-h-[155px] whitespace-pre-wrap">
                        {ticketDetails.description || "No description provided."}
                      </div>
                    )}
                  </Card>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#800000] rounded-xl p-5 shadow-lg border-b-4 border-[#600000]">
                    <p className="text-[9px] font-bold text-red-100 uppercase mb-1">Ticket No</p>
                    <p className="text-2xl font-bold text-white italic leading-none">#{ticketDetails.ticketNo}</p>
                  </div>

                  <MetricBox 
                    label="Status" 
                    value={ticketDetails.status} 
                    icon={CheckCircle}
                    colorClass={ticketDetails.status?.toLowerCase() === "resolved" ? "text-emerald-600" : "text-blue-600"}
                  />
                  
                  <MetricBox 
                    label="Severity" 
                    value={ticketDetails.severity} 
                    icon={Shield}
                    colorClass="text-[#800000]"
                  />

                  <MetricBox 
                    label="Category" 
                    value={ticketDetails.category} 
                    icon={Tag}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Personnel Involved" icon={User}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white border border-slate-100 rounded shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Requester</p>
                        <p className="text-[11px] font-bold text-slate-800 truncate">{ticketDetails.requestee?.name || "Innovation Team"}</p>
                      </div>
                      <div className="p-3 bg-white border border-slate-100 rounded shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Assigned To</p>
                        <p className="text-[11px] font-bold text-slate-800 truncate">{ticketDetails.assignee?.name || "John Renz Sumawang"}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card title="Timeline History" icon={Clock}>
                    <div className="space-y-3">
                      {[
                        ["Created", ticketDetails.$createdAt],
                        ["Updated", ticketDetails.$updatedAt],
                        ["Resolved", ticketDetails.resolved_at],
                        ["Closed", ticketDetails.closed_at]
                      ].map(([lbl, val], i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1 last:border-0">
                          <span className="font-bold text-slate-400 uppercase">{lbl}</span>
                          <span className="font-bold text-slate-700">{val ? formatDate(val) : "--"}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Resolution Notes">
                    <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded text-sm text-gray-700 italic min-h-[100px] flex items-center whitespace-pre-wrap">
                      {ticketDetails.resolutionText || "Done"}
                    </div>
                  </Card>
                  <div className="space-y-4">
                    {ticketDetails.attachment?.length > 0 && (
                      <button onClick={() => setPreview(true)} className="flex items-center justify-between w-full p-5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded">
                            <FileText className="w-5 h-5 text-[#800000]" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Attachment</p>
                            <p className="text-xs font-bold text-slate-700 uppercase">View File</p>
                          </div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}
                    {ticketDetails.rating && (
                      <Card title="Feedback Analysis">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-800 leading-none">{ticketDetails.rating}</span>
                            <div className="flex text-amber-400">
                               {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`w-3.5 h-3.5 ${i < (ticketDetails.rating || 5) ? 'fill-current' : 'text-slate-200'}`} />
                               ))}
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 italic">"{ticketDetails.feedback || "No feedback provided."}"</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-4 mt-4">
                  <button onClick={onViewComments} className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-black transition-all flex items-center gap-2 shadow-lg">
                    <MessageCircle className="w-4 h-4" /> Case Discussions
                  </button>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {canConfirm && (
                      <div className="flex gap-2 w-full">
                        <button onClick={() => onConfirmResolution(ticketDetails)} className="flex-1 px-8 py-3 bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-800 transition-all shadow-md">Confirm</button>
                        <button onClick={() => onRejectResolution(ticketDetails)} className="flex-1 px-8 py-3 bg-[#800000] text-white text-[10px] font-bold uppercase rounded-lg hover:bg-red-900 transition-all shadow-md">Reject</button>
                      </div>
                    )}
                    <button onClick={onClose} className="w-full md:w-auto px-12 py-3 bg-white text-slate-500 text-[10px] font-bold border border-slate-200 uppercase rounded-lg hover:bg-slate-50 transition-all">Close Details</button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {ticketDetails?.attachment?.length > 0 && (
        <AttachmentViewerModal 
            isOpen={preview} 
            onClose={() => setPreview(false)} 
            attachmentUrl={Array.isArray(ticketDetails.attachment) ? ticketDetails.attachment[0] : ticketDetails.attachment} 
        />
      )}
    </>
  );
};

export default TicketDetailsModal;