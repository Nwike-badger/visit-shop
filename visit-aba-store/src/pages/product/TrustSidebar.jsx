import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Store } from 'lucide-react';

// ── Dynamic delivery date (5-8 business days from today) ─────────────────────
const getDeliveryWindow = () => {
  const addBusinessDays = (date, days) => {
    const d = new Date(date);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  };
  const fmt = (d) => d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  const from = addBusinessDays(new Date(), 3);
  const to = addBusinessDays(new Date(), 7);
  return `${fmt(from)} – ${fmt(to)}`;
};

const TrustSidebar = ({ seller }) => {
  const deliveryWindow = getDeliveryWindow();

  return (
    <div className="space-y-4">

      {/* ── Seller card ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Sold By</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-gray-900 text-white rounded-full flex items-center justify-center font-black text-base uppercase">
              {seller.name.charAt(0)}
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">{seller.name}</p>
              <p className="text-[11px] text-green-600 font-bold">{seller.years}+ years selling</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3 mb-4 text-center">
            <div>
              <p className="text-base font-black text-gray-900">{seller.rating}</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">Rating</p>
            </div>
            <div className="border-l border-gray-200">
              <p className="text-base font-black text-gray-900">{seller.successRate}</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">Delivery</p>
            </div>
          </div>

          <button className="w-full text-xs font-black text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-1.5">
            <Store size={13} /> Visit Store
          </button>
        </div>
      </div>

      {/* ── Delivery & returns ───────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Delivery & Returns</p>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <Truck size={15} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">Fast Delivery</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                Free on orders over ₦50,000.<br />
                Est. arrival: <span className="font-bold text-gray-700">{deliveryWindow}</span>
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
              <RotateCcw size={15} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">7-Day Returns</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Not satisfied? Return for a full refund.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">Buyer Protection</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Full refund if item is late or misrepresented.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TrustSidebar;