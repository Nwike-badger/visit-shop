import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Card, CardHeader, CardBody, Field } from '../SharedUI';
import { noSpin } from '../utils';

function StockDisplay({ stock }) {
  const num = parseInt(stock) || 0;
  if (num === 0) return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
      <p className="text-[11px] font-bold text-red-700">Out of stock — product hidden from purchase</p>
    </div>
  );
  if (num <= 10) return (
    <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
      <p className="text-[11px] font-bold text-amber-700">Low stock — only {num} unit{num !== 1 ? 's' : ''} left</p>
    </div>
  );
  return (
    <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2.5">
      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
      <p className="text-[11px] font-bold text-green-700">{num} units in stock</p>
    </div>
  );
}

export default function InventoryCard({ options, variants, directInventory, setDirectInventory, form, inp }) {
  const num = parseInt(directInventory.stock) || 0;

  const inc = () => setDirectInventory(d => ({ ...d, stock: String(num + 1) }));
  const dec = () => setDirectInventory(d => ({ ...d, stock: String(Math.max(0, num - 1)) }));

  return (
    <Card>
      <CardHeader>Inventory</CardHeader>
      <CardBody className="space-y-4">
        {options.length === 0 ? (
          <>
            <Field label="Stock Quantity" required hint="Units currently available to sell">
              <div className={`flex items-center rounded-xl border overflow-hidden h-11 transition-colors ${
                num === 0 ? 'border-red-200 bg-red-50'
                : num <= 10 ? 'border-amber-200 bg-amber-50'
                : 'border-slate-200 bg-white'
              }`}>
                <button
                  type="button"
                  onClick={dec}
                  className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors shrink-0"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min={0}
                  value={directInventory.stock}
                  onChange={e => setDirectInventory(d => ({ ...d, stock: e.target.value }))}
                  className={`flex-1 text-center text-base font-bold bg-transparent outline-none ${noSpin} ${
                    num === 0 ? 'text-red-700' : num <= 10 ? 'text-amber-800' : 'text-slate-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={inc}
                  className="w-10 h-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors shrink-0"
                >
                  <Plus size={14} />
                </button>
              </div>
            </Field>

            <StockDisplay stock={directInventory.stock} />

            <Field label="SKU (Stock Keeping Unit)" hint="Leave blank to auto-generate">
              <input
                type="text"
                value={directInventory.sku}
                onChange={e => setDirectInventory(d => ({ ...d, sku: e.target.value }))}
                className={`${inp} font-mono text-sm`}
                placeholder={`${(form.name || 'PRODUCT').split(/\s+/)[0].toUpperCase()}-DEFAULT`}
              />
            </Field>
          </>
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5">
              <p className="text-xs font-bold text-blue-900 mb-1">Managed per variant</p>
              <p className="text-[11px] text-blue-600 leading-relaxed">
                Set quantity for each variant in the Variants section above.
              </p>
            </div>
            {variants.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <p className="text-lg font-black text-slate-800">
                    {variants.reduce((s, v) => s + (parseInt(v.stockQuantity) || 0), 0)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold">Total units</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                  <p className="text-lg font-black text-slate-800">{variants.length}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Variants</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}