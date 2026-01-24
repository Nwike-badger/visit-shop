import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Your cart is empty</h2>
      <Link to="/" className="text-blue-600 mt-4 block underline">Go shopping</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4 bg-white p-4 border rounded-xl">
            <img src={item.image} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-grow">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-gray-600">${item.price}</p>
            </div>
            <div className="flex items-center gap-3 border rounded-lg px-2 py-1">
              <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16}/></button>
              <span className="font-bold w-4 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16}/></button>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-full"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <Link to="/checkout" className="block w-full bg-blue-600 text-white text-center py-4 rounded-xl mt-6 font-bold hover:bg-blue-700">
          Proceed to Checkout
        </Link>
        <button onClick={clearCart} className="w-full text-sm text-gray-500 mt-4 hover:underline">Clear all items</button>
      </div>
    </div>
  );
};
export default Cart;