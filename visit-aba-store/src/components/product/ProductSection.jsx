// import useProducts from "../../hooks/useProducts";
// import ProductGrid from "./ProductGrid";
import SectionHeader from "./SectionHeader";


const ProductSection = ({ title, align, actionText, className, children }) => {
  return (
    <section className={`py-4 ${className}`}>
      {title && <SectionHeader title={title} align={align} actionText={actionText} />}
      {children}
    </section>
  );
};

export default ProductSection;
