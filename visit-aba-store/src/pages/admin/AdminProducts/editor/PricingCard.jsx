import React from 'react';
import { Tag } from 'lucide-react';
import { Card, CardHeader, CardBody, Field } from '../SharedUI';
import { fmt, noSpin } from '../utils';

export default function PricingCard({ form, setF, hasVariants, inp }) {
  const discountedPrice =
    form.discount && form.basePrice
      ? Math.round(parseFloat(form.basePrice) * (1 - parseFloat(form.discount) / 100))
      : null;

  return (
    <Card>
      <CardHeader>Pricing</CardHeader>
      <CardBody className="space-y-4">

        {/* Base price */}
        <Field
          label="Base Price"
          required
          hint={hasVariants ? 'Reference price — each variant can override this' : 'Displayed price on the storefront'}
        >
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">₦</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.basePrice}
              onChange={e => setF({ basePrice: e.target.value })}
              className={`${inp} pl-8 ${noSpin}`}
              placeholder="0"
            />
          </div>
          {form.basePrice > 0 && (
            <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
              ₦{fmt(parseFloat(form.basePrice))}
            </p>
          )}
        </Field>

        {/* Sale pricing divider */}
        <div className="border-t border-dashed border-slate-100 pt-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Tag size={10} /> Sale pricing — choose one
          </p>

          {/* Method A */}
          <div className={`rounded-xl border-2 p-3.5 mb-2.5 transition-all cursor-pointer ${
            !form.discount ? 'border-slate-300 bg-slate-50' : 'border-slate-100 bg-white opacity-50 pointer-events-none'
          }`}>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              A — Set original price
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">₦</span>
              <input
                type="number"
                min={0}
                value={form.compareAtPrice}
                onChange={e => setF({ compareAtPrice: e.target.value, discount: '' })}
                disabled={!!form.discount}
                className={`${inp} pl-8 disabled:cursor-not-allowed ${noSpin}`}
                placeholder="Was price (shown as strikethrough)"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Shows as "was ₦X" — you set both prices manually.
            </p>
          </div>

          {/* Method B */}
          <div className={`rounded-xl border-2 p-3.5 transition-all ${
            form.discount ? 'border-blue-300 bg-blue-50/50' : 'border-slate-100 bg-white opacity-50 pointer-events-none'
          } ${!!form.compareAtPrice ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              B — Discount percentage
            </p>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={form.discount}
                onChange={e => setF({ discount: e.target.value, compareAtPrice: '' })}
                disabled={!!form.compareAtPrice}
                className={`${inp} pr-8 disabled:cursor-not-allowed ${noSpin}`}
                placeholder="e.g. 15"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold select-none">%</span>
            </div>
            {discountedPrice ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-black text-emerald-700">
                  ₦{fmt(discountedPrice)}
                </span>
                <span className="text-[11px] text-slate-400 line-through">₦{fmt(parseFloat(form.basePrice))}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                  -{form.discount}%
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1.5">
                Server computes the final price automatically.
              </p>
            )}
          </div>

          {/* Clear sale button */}
          {(form.discount || form.compareAtPrice) && (
            <button
              onClick={() => setF({ discount: '', compareAtPrice: '' })}
              className="mt-2 text-[10px] text-slate-400 hover:text-red-500 font-semibold transition-colors"
            >
              ✕ Remove sale pricing
            </button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}