// components/product/ProductSection.jsx
import SectionHeader from "./SectionHeader";

const ProductSection = ({ title, align, actionText, onAction, className = "", children }) => {
  return (
    <section className={`py-4 ${className}`}>
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