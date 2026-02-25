import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();

  if (!cartItems || cartItems.length === 0) return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-bold">Your cart is empty</h2>
      <Link to="/" className="text-blue-600 mt-4 block underline">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-black mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.variantId} className="flex gap-4 bg-white p-4 border rounded-xl relative">
              <img src={item.imageUrl || "https://via.placeholder.com/100"} className="w-24 h-24 object-cover rounded-lg" />
              <div>
                <h3 className="font-bold">{item.productName}</h3>
                <p className="text-sm text-gray-500">{item.quantity} x ₦{(item.unitPrice || 0).toLocaleString()}</p>
                <p className="font-black text-lg mt-1">₦{(item.subTotal || 0).toLocaleString()}</p>
              </div>
              <button onClick={() => removeFromCart(item.variantId)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-red-500 text-sm">Clear Cart</button>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl h-fit">
          <div className="flex justify-between text-xl font-black mb-6">
            <span>Total</span>
            <span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <Link to="/checkout" className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl font-bold">
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Cart;