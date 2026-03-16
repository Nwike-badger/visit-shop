// ─── Shared UI primitives ─────────────────────────────────────────────────────

export const Field = ({ label, hint, required, children }) => (
  <div>
    {label && (
      <div className="mb-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {hint && <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
    )}
    {children}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden ${className}`}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, action, subtitle }) => (
  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
    <div>
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{children}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

// A subtle divider with optional label
export const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-slate-100" />
    {label && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>}
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

// Pill badge helper used in multiple cards
export const Badge = ({ color = 'slate', children }) => {
  const colors = {
    green:  'bg-green-50  text-green-700  border-green-200',
    red:    'bg-red-50    text-red-600    border-red-200',
    amber:  'bg-amber-50  text-amber-700  border-amber-200',
    blue:   'bg-blue-50   text-blue-700   border-blue-200',
    slate:  'bg-slate-100 text-slate-600  border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};