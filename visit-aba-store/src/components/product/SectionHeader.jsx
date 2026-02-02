// components/common/SectionHeader.jsx
const SectionHeader = ({ title, actionText, onAction, align = "left" }) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right flex-row-reverse", // creative use for right align
  };

  return (
    <div className={`flex items-end mb-6 gap-4 ${align === "right" ? "justify-between flex-row-reverse" : "justify-between"}`}>
      <div className={alignClass[align] || "text-left"}>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {/* Optional decorative underline for emphasis */}
        <div className={`h-1 w-20 bg-blue-600 mt-2 rounded ${align === "center" ? "mx-auto" : ""}`}></div>
      </div>
      
      {actionText && (
        <button 
          onClick={onAction}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
        >
          {actionText} &rarr;
        </button>
      )}
    </div>
  );
};

export default SectionHeader;