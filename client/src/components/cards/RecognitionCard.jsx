import React from "react";
import {
  Crown,
  Medal,
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
          icon: <Crown className="w-4 h-4" />,
          label: "E.O.M",
          accentColor: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200"
        };
      case "excellence_award":
        return {
          icon: <Medal className="w-4 h-4" />,
          label: "Excellence",
          accentColor: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      default:
        return {
          icon: <Award className="w-4 h-4" />,
          label: "Recognition",
          accentColor: "text-slate-600",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200"
        };
    }
  };

  const typeInfo = getRecognitionTypeInfo(post.recognitionType);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onClick={() => onView(post)}
      className="group relative w-full bg-white border border-zinc-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-zinc-400 flex flex-col h-full overflow-hidden"
    >
      {/* 1. IMAGE CONTAINER - Compact Height (220px) */}
      <div className="relative w-full h-[220px] bg-zinc-50 overflow-hidden flex items-center justify-center p-3 border-b border-zinc-100">
        {post.images?.[0] ? (
          <img
            src={post.images[0].url || post.images[0]}
            alt={post.employee?.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center text-zinc-300">
            <Award size={32} strokeWidth={1.5} />
            <span className="text-[8px] font-bold uppercase mt-2 text-zinc-400">No Portrait</span>
          </div>
        )}

        {/* Floating Badge - No letter spacing */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 border shadow-sm backdrop-blur-sm ${typeInfo.bgColor} ${typeInfo.borderColor} ${typeInfo.accentColor}`}>
          {typeInfo.icon}
          <span className="text-[10px] font-black uppercase">{typeInfo.label}</span>
        </div>
      </div>

      {/* 2. COMPACT CONTENT AREA - No Letter Spacing */}
      <div className="p-4 flex flex-col flex-1">
        {/* Verification & Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-700" />
            <span className="text-[10px] font-black text-zinc-900 uppercase">Official Record</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400 text-[9px] font-bold">
            <Calendar size={11} />
            {formatTime(post.createdAt)}
          </div>
        </div>

        {/* Employee Details */}
        <div className="mb-3">
          <h4 className="text-black text-lg font-bold leading-tight group-hover:text-[#800000] transition-colors truncate">
            {post.employee?.name}
          </h4>
          <p className="text-[#800000] text-[11px] font-black uppercase">
            {post.employee?.position}
          </p>
        </div>

        {/* Description */}
        <div className="relative mb-4 flex-1">
          <Quote className="absolute -top-1 -left-1 text-zinc-50 w-6 h-6 -z-10" />
          <p className="text-zinc-600 text-[12px] font-medium leading-snug italic pl-3 whitespace-pre-line">
            {post.description}
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex items-center justify-end border-t border-zinc-100 pt-3 mt-auto">
          <button className="flex items-center gap-2 text-zinc-900 font-black text-[11px] uppercase group-hover:text-[#800000] transition-all">
            View Profile <ArrowUpRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Accent Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-zinc-100 overflow-hidden">
        <div className="h-full w-0 group-hover:w-full transition-all duration-700 bg-[#800000]" />
      </div>
    </div>
  );
};

export default RecognitionCard;