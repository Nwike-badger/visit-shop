import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Award, MapPin } from 'lucide-react';

const TrustSidebar = ({ seller }) => {
  return (
    <div className="space-y-4">
      
      {/* 1. Seller Card (Konga Style) */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Sold By</h3>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
            {seller.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{seller.name}</p>
            <p className="text-xs text-green-600 font-medium">{seller.years} Years Selling</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center bg-gray-50 p-3 rounded-lg mb-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{seller.rating}</p>
            <p className="text-[10px] text-gray-500 uppercase">Product Rating</p>
          </div>
          <div className="border-l border-gray-200">
            <p className="text-lg font-bold text-gray-900">{seller.successRate}</p>
            <p className="text-[10px] text-gray-500 uppercase">Delivery Rate</p>
          </div>
        </div>

        <button className="w-full text-sm font-semibold text-blue-600 border border-blue-600 rounded-lg py-2 hover:bg-blue-50 transition-colors">
          Visit Store
        </button>
      </div>

      {/* 2. Delivery & Returns (Temu Style) */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Delivery & Returns</h3>
        
        <ul className="space-y-5">
          <li className="flex gap-3">
            <Truck className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-gray-900">Free Delivery</p>
              <p className="text-xs text-gray-500 mt-0.5">On orders over ₦50,000. Arrives Feb 20 - Feb 25.</p>
            </div>
          </li>
          
          <li className="flex gap-3">
            <RotateCcw className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-gray-900">7-Day Return Policy</p>
              <p className="text-xs text-gray-500 mt-0.5">Not happy? Return it for a full refund. No questions asked.</p>
            </div>
          </li>

          <li className="flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-gray-900">Buyer Protection</p>
              <p className="text-xs text-gray-500 mt-0.5">Get a refund if the item arrives late or not as described.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TrustSidebar;