import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Calendar,
  User,
  CheckCircle2,
  Copy,
  Share2,
  Mail,
  Fingerprint
} from "lucide-react";
import api from "../../utils/axios";
import { toast } from "react-hot-toast";
import { useStore } from "../../store/useStore";

const Modal = ({ children, onClose, maxWidth = "max-w-7xl" }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    onClick={onClose}
  >
    <div
      className={`relative w-full ${maxWidth} max-h-[90vh] mx-auto my-auto overflow-y-auto rounded-[2.5rem] scrollbar-hide animate-in fade-in zoom-in duration-300`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const CertificateModal = ({ course, user, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const userFromStore = useStore((state) => state.user);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("certificate id copied!");
  };

  const downloadCertificate = async () => {
    try {
      setDownloading(true);
      const userId = user?._id || userFromStore?._id;
      const { data } = await api.get(
        `/courses/${course._id}/certificate/download?userId=${userId}&userName=${encodeURIComponent("MAYBELLE CABALAR")}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_MAYBELLE_CABALAR.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-[1250px]">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: landscape; margin: 0; }
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area {
            position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
            display: flex !important; align-items: center; justify-content: center;
            background: white !important;
          }
          .cert-frame {
            width: 297mm !important; height: 210mm !important;
            padding: 0 !important; margin: 0 !important;
            box-shadow: none !important; border: none !important;
          }
          .no-print { display: none !important; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="flex flex-col lg:flex-row bg-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] printable-area">
        
        {/* CERTIFICATE CANVAS */}
        <div className="flex-1 p-4 lg:p-8 bg-zinc-200 flex items-center justify-center overflow-x-auto">
          <div 
            className="cert-frame relative w-full max-w-[900px] bg-white flex flex-col p-2 shadow-2xl"
            style={{ aspectRatio: '1.414 / 1' }}
          >
            <div className="absolute inset-4 border-[1px] border-[#800000]/10"></div>
            <div className="absolute inset-6 border-[4px] border-[#800000]"></div>
            
            <div className="absolute top-0 left-0 w-28 h-28 border-t-[12px] border-l-[12px] border-[#4a0000]"></div>
            <div className="absolute top-0 right-0 w-28 h-28 border-t-[12px] border-r-[12px] border-[#4a0000]"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 border-b-[12px] border-l-[12px] border-[#4a0000]"></div>
            <div className="absolute bottom-0 right-0 w-28 h-28 border-b-[12px] border-r-[12px] border-[#4a0000]"></div>

            <div className="relative z-20 flex-1 flex flex-col items-center justify-between py-10 px-16 text-center">
              <div className="space-y-1">
                <div className="flex justify-center mb-2">
                  <ShieldCheck className="w-12 h-12 text-[#800000]" />
                </div>
                <h1 className="text-4xl font-serif font-black text-black uppercase leading-none">
                  Certificate <span className="italic font-medium lowercase text-[#800000] font-sans text-3xl">of</span> Completion
                </h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase pt-1 tracking-tight">Professional Accreditation Authority</p>
              </div>

              <div className="w-full">
                <p className="text-zinc-500 font-sans italic text-sm mb-2">This is to officially certify that</p>
                <h2 className="text-5xl font-serif font-bold text-black border-b-2 border-zinc-100 inline-block px-8 pb-1 uppercase">
                    MAYBELLE CABALAR
                </h2>
                <p className="text-zinc-400 font-sans text-xs mt-2 font-medium">(m.cabalar@telexph.com)</p>
                <p className="text-zinc-500 font-sans text-[13px] mt-6 max-w-lg mx-auto leading-relaxed">
                  has successfully completed all required modules, practical applications, and rigorous assessments for
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-sans font-black text-[#800000] uppercase">
                    {course?.title || "Advanced System Administration"}
                </h3>
                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-zinc-400 uppercase pt-1">
                   <div className="flex items-center gap-1"><span>Issued On:</span> <span className="text-black">January 9, 2026</span></div>
                   <div className="w-1 h-1 bg-zinc-200 rounded-full"></div>
                   <div className="flex items-center gap-1"><span>Valid Until:</span> <span className="text-black">January 7, 2028</span></div>
                </div>
              </div>

              <div className="w-full flex justify-between items-end px-10">
                <div className="w-44 text-center">
                   <div className="h-[1.5px] bg-[#4a0000] w-full mb-1"></div>
                   <p className="text-[10px] font-black text-black uppercase">Compliance Head</p>
                </div>
                <div className="relative">
                   <div className="w-20 h-20 rounded-full border-[5px] border-[#800000] bg-white flex items-center justify-center shadow-lg">
                      <Award className="w-10 h-10 text-[#800000]" />
                   </div>
                   <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#800000] text-white text-[8px] px-2.5 py-0.5 rounded-full font-black uppercase whitespace-nowrap">
                      Verified & Active
                   </div>
                </div>
                <div className="w-44 text-center">
                   <div className="h-[1.5px] bg-[#4a0000] w-full mb-1"></div>
                   <p className="text-[10px] font-black text-black uppercase">President & CEO</p>
                </div>
              </div>

              <div className="w-full flex justify-center pt-6 border-t border-zinc-50">
                 <p className="text-[10px] font-bold text-zinc-400 uppercase">
                   Certificate ID: <span className="text-[#800000] font-mono">CERT-1767779871582-INTRHD</span>
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR MANAGEMENT PORTAL */}
        <div className="w-full lg:w-[350px] bg-white p-8 flex flex-col no-print border-l border-zinc-100">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-[#800000] rounded-full"></div>
              <h4 className="text-sm font-black text-zinc-800 uppercase tracking-tight">Management Portal</h4>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {/* User Profile Card */}
            <div className="p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100 relative overflow-hidden">
              <p className="text-[10px] font-black text-[#800000] uppercase mb-3">Certificate issued to:</p>
              <h5 className="text-xl font-black text-zinc-900 uppercase leading-none mb-1">Maybelle Cabalar</h5>
              <div className="flex items-center gap-2 text-zinc-500">
                <Mail className="w-3.5 h-3.5" />
                <p className="text-xs font-medium">m.cabalar@telexph.com</p>
              </div>
            </div>

            {/* Timeline & Status */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                  <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Issued On</p>
                  <p className="text-[11px] font-bold text-zinc-900">Jan 09, 2026</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                  <p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Valid Until</p>
                  <p className="text-[11px] font-bold text-zinc-900">Jan 07, 2028</p>
                </div>
              </div>

              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-black text-green-700 uppercase tracking-tight">Verified & Active</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* Main Actions */}
            <div className="space-y-3 pt-2">
              <button 
                onClick={downloadCertificate}
                className="w-full py-4 bg-[#800000] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-maroon-100 hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" /> Download Certificate (PDF)
              </button>
              <div className="grid grid-cols-2 gap-3">
                 <button className="py-3 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                   <Share2 className="w-4 h-4" /> Share
                 </button>
                 <button onClick={() => window.print()} className="py-3 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                   <Printer className="w-4 h-4" /> Print
                 </button>
              </div>
            </div>

            {/* VERIFICATION SECTION (WHITE BG CARD) */}
            <div className="pt-6 border-t border-zinc-100 mt-auto">
               <div className="flex items-center gap-2 mb-3">
                 <ShieldCheck className="w-4 h-4 text-zinc-300" />
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Certificate ID</p>
               </div>
               <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm group">
                  <code className="text-[11px] font-mono font-bold text-[#800000] flex-1 break-all leading-relaxed">
                    CERT-1767779871582-INTRHD
                  </code>
                  <button 
                    onClick={() => copyToClipboard("CERT-1767779871582-INTRHD")}
                    className="p-2 bg-zinc-50 text-zinc-400 hover:text-[#800000] hover:bg-maroon-50 rounded-xl transition-all border border-zinc-100"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateModal;