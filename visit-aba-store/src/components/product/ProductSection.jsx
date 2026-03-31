import SectionHeader from "./SectionHeader";

const ProductSection = ({ title, align, actionText, onAction, className = "", children }) => {
  return (
    // ── KEY FIX: was `py-4` on all breakpoints (wasted 16px top + bottom on mobile).
    //    Now `py-0 sm:py-4` — let the parent container control outer spacing instead.
    <section className={`py-0 sm:py-2 ${className}`}>
      {title && (
        <SectionHeader
          title={title}
          align={align}
          actionText={actionText}
          onAction={onAction}
        />
      )}
      {children}
    </section>
  );
};

export default ProductSection;