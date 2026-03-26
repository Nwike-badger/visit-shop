// components/common/SectionHeader.jsx
import { ArrowRight } from 'lucide-react';

const SectionHeader = ({ title, actionText, onAction, align = "left" }) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right flex-row-reverse", 
  };

  return (
    <div className={`flex items-end justify-between mb-8 sm:mb-10 border-b border-gray-100 pb-4 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <div className={alignClass[align] || "text-left"}>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>
      
      {actionText && (
        <button 
          onClick={onAction}
          className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest whitespace-nowrap"
        >
          {actionText} 
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;