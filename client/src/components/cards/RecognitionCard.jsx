import React from "react";
import {
  Crown,
  Medal,
  Lightbulb,
  Heart,
  Award,
  ArrowUpRight,
  Calendar,
  Quote,
  ShieldCheck
} from "lucide-react";

const RecognitionCard = ({ post, onView }) => {
  const getRecognitionTypeInfo = (type) => {
    switch (type) {
      case "employee_of_month":
        return {
          icon: <Crown className="w-7 h-7" />,
          label: "Employee of Month",
          color: "from-yellow-500 to-amber-500",
          ribbonColor: "bg-gradient-to-b from-orange-500 via-orange-600 to-red-700",
          shadowColor: "#7f1d1d" 
        };
      case "excellence_award":
        return {
          icon: <Medal className="w-7 h-7" />,
          label: "Excellence Award",
          color: "from-purple-500 to-indigo-500",
          ribbonColor: "bg-gradient-to-b from-purple-600 via-indigo-600 to-indigo-800",
          shadowColor: "#1e1b4b"
        };
      default:
        return {
          icon: <Award className="w-7 h-7" />,
          label: "Recognition",
          color: "from-blue-500 to-cyan-500",
          ribbonColor: "bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800",
          shadowColor: "#172554"
        };
    }
  };

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={() => onView(post)}
      /* Nilagyan natin ng z-10 ang card para ma-isolate ang stacking context. 
         Inalis ang overflow-hidden sa main div para lumabas ang ribbon fold sa itaas.
      */
      className="group relative z-10 w-full h-[480px] bg-slate-950 rounded-[3rem] cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[0.98]"
    >
      {/* 1. THE VERTICAL MEDAL RIBBON (Folded over the top) */}
      {/* Ginawa nating z-30 para hindi ito lumampas sa modal (na karaniwang z-50+) */}
      <div className="absolute top-0 left-10 z-30 pointer-events-none flex flex-col items-center">
        
        {/* Ang Fold/Pasobra (Upper shadow) */}
        <div 
          className="absolute -top-3 w-full h-3 z-10"
          style={{ 
            backgroundColor: typeInfo.shadowColor,
            clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)' 
          }}
        />

        {/* Ribbon Body */}
        <div 
          className={`relative w-24 h-30 ${typeInfo.ribbonColor} shadow-2xl flex flex-col items-center pt-5 transition-all duration-500 group-hover:h-36`}
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%)' 
          }}
        >
          {/* Subtle Fabric Texture */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_45%,rgba(0,0,0,0.5)_50%,transparent_55%)] bg-[length:10px_100%]" />
          
          <div className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110">
            {typeInfo.icon}
          </div>
          
          <span className="relative z-10 text-[8px] font-black text-white/90 uppercase tracking-tighter mt-2 px-2 text-center leading-tight">
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* 2. IMAGE WRAPPER (Ito ang may overflow-hidden para sa portrait) */}
      <div className="absolute inset-0 z-0 rounded-[3rem] overflow-hidden">
        {post.images?.[0] ? (
          <img
            src={post.images[0].url || post.images[0]}
            alt={post.employee?.name}
            className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-60 transition-all duration-700 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${typeInfo.color} opacity-20`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
      </div>

      {/* 3. HERO CONTENT */}
      <div className="absolute inset-x-0 bottom-0 p-8 z-10">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-44">
          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShieldCheck size={14} className="text-red-500" />
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Verified Achievement</span>
          </div>
          <h4 className="text-white text-3xl font-black tracking-tighter leading-none mb-2">
            {post.employee?.name}
          </h4>
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.2em]">
            {post.employee?.position}
          </p>
        </div>

        <div className="absolute inset-x-8 bottom-8 opacity-0 group-hover:opacity-100 translate-y-10 group-hover:translate-y-0 transition-all duration-500 delay-75">
          <div className="relative mb-6">
            <Quote className="absolute -top-3 -left-2 text-white/10 w-8 h-8 rotate-12" />
            <p className="text-white/80 text-sm leading-relaxed line-clamp-3 pl-3 border-l-2 border-white/20">
              {post.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest">
              <Calendar size={12} />
              {formatTime(post.createdAt)}
            </div>
            
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-black text-[10px] uppercase tracking-wider hover:bg-red-700 hover:text-white transition-all shadow-lg">
              View Details <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Premium Border Overlay */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-[3rem] transition-colors z-30 pointer-events-none" />
    </div>
  );
};

export default RecognitionCard;