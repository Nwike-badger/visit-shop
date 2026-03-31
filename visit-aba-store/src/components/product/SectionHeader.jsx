import { ArrowRight } from 'lucide-react';

const SectionHeader = ({ title, actionText, onAction, align = "left" }) => {
  return (
    // ── KEY FIX: was `mb-8 sm:mb-10` — eating ~32-40px before products even showed.
    //    Now `mb-3 sm:mb-6` — products appear immediately on mobile like top apps do.
    <div
      className={`flex items-center justify-between mb-3 sm:mb-6 border-b border-gray-100 pb-3 sm:pb-4
        ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <div className={align === "center" ? "text-center flex-1" : align === "right" ? "text-right" : "text-left"}>
        <h2 className="text-base sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
      </div>

      {actionText && (
        <button
          onClick={onAction}
          className="group flex items-center gap-1 text-[10px] sm:text-xs font-bold
                     text-green-600 hover:text-green-800 transition-colors
                     uppercase tracking-widest whitespace-nowrap shrink-0 ml-4"
        >
          {actionText}
          <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default SectionHeader;