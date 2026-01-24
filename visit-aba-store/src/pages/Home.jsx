import { products } from "../api/products";
import { Link } from "react-router-dom";

const Home = () => (
  <div className="max-w-7xl mx-auto p-6">
    <h1 className="text-2xl font-bold mb-8">Featured Products</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div key={product.id} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
          <Link to={`/product/${product.id}`}>
            <img src={product.image} className="w-full h-64 object-cover group-hover:scale-105 transition-transform" />
          </Link>
          <div className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest">{product.category}</p>
            <Link to={`/product/${product.id}`} className="font-bold text-lg block mt-1 hover:text-blue-600">{product.name}</Link>
            <p className="text-xl font-black mt-2">${product.price.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default Home;