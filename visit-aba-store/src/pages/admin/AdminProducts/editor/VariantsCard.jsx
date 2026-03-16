import React, { useState } from 'react';
import { Plus, Trash2, Zap, CheckCircle, EyeOff, X, ArrowDown, Minus, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../SharedUI';
import { fmt, noSpin } from '../utils';

// ─── Stock Stepper — replaces bare number input ───────────────────────────────
function StockStepper({ value, onChange }) {
  const num = parseInt(value) || 0;
  const inc = () => onChange(String(num + 1));
  const dec = () => onChange(String(Math.max(0, num - 1)));

  const color =
    num === 0 ? 'border-red-200 bg-red-50'
    : num <= 5 ? 'border-amber-200 bg-amber-50'
    : 'border-slate-200 bg-white';

  const textColor =
    num === 0 ? 'text-red-600'
    : num <= 5 ? 'text-amber-700'
    : 'text-slate-800';

  return (
    <div className={`inline-flex items-center rounded-xl border ${color} overflow-hidden h-9`}>
      <button
        type="button"
        onClick={dec}
        className="w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors h-full shrink-0"
      >
        <Minus size={13} />
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-12 text-center text-sm font-bold bg-transparent outline-none ${textColor} ${noSpin}`}
      />
      <button
        type="button"
        onClick={inc}
        className="w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors h-full shrink-0"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

// ─── Price Input — no spinners, shows formatted preview ──────────────────────
function PriceInput({ value, onChange, placeholder = '0', dim = false }) {
  const formatted = value && parseFloat(value) > 0
    ? `₦${fmt(parseFloat(value))}`
    : null;

  return (
    <div>
      <div className={`flex items-center border rounded-xl overflow-hidden h-9 transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${dim ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'}`}>
        <span className={`pl-3 text-sm font-bold select-none ${dim ? 'text-slate-300' : 'text-slate-400'}`}>₦</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-2 py-2 text-sm font-semibold bg-transparent outline-none ${noSpin} ${dim ? 'text-slate-400 placeholder:text-slate-300' : 'text-slate-800 placeholder:text-slate-300'}`}
        />
      </div>
      {formatted && (
        <p className={`text-[10px] font-bold mt-1 ${dim ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
          {formatted}
        </p>
      )}
    </div>
  );
}

// ─── Single Variant Card ──────────────────────────────────────────────────────
function VariantCard({ v, i, imageOptions, updateVariant, removeVariant }) {
  const stockNum = parseInt(v.stockQuantity) || 0;

  const stockLabel =
    stockNum === 0 ? { text: 'Out of stock', cls: 'bg-red-50 text-red-600 border-red-200' }
    : stockNum <= 5 ? { text: `Low — ${stockNum} left`, cls: 'bg-amber-50 text-amber-700 border-amber-200' }
    : null;

  return (
    <div className={`rounded-2xl border transition-all ${
      v.isActive
        ? 'border-slate-200 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]'
        : 'border-slate-100 bg-slate-50/80 opacity-70'
    }`}>
      {/* Card top bar — attributes + controls */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {Object.entries(v.attributes).map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
            >
              <span className="text-slate-400 font-normal text-[10px] uppercase tracking-wide">{key}</span>
              {val}
            </span>
          ))}
          {stockLabel && (
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-lg border ${stockLabel.cls}`}>
              {stockLabel.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Visibility toggle */}
          <button
            type="button"
            onClick={() => updateVariant(i, { isActive: !v.isActive })}
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
              v.isActive
                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {v.isActive ? <><CheckCircle size={11} /> Active</> : <><EyeOff size={11} /> Hidden</>}
          </button>
          <button
            type="button"
            onClick={() => removeVariant(i)}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove this variant"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Card body — the inputs */}
      <div className="px-4 py-4 space-y-4">
        {/* Row 1: Price | Was Price | Stock */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Price *
            </label>
            <PriceInput
              value={v.price}
              onChange={val => updateVariant(i, { price: val })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Was (compare)
            </label>
            <PriceInput
              value={v.compareAtPrice || ''}
              onChange={val => updateVariant(i, { compareAtPrice: val })}
              placeholder="—"
              dim
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Stock *
            </label>
            <StockStepper
              value={v.stockQuantity}
              onChange={val => updateVariant(i, { stockQuantity: val })}
            />
          </div>
        </div>

        {/* Row 2: SKU | Image */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              SKU / Product Code
            </label>
            <input
              value={v.sku}
              onChange={e => updateVariant(i, { sku: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[12px] font-mono text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
              placeholder="Auto-generated"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
              <ImageIcon size={9} /> Variant Image
            </label>
            <select
              value={v.imageUrl || ''}
              onChange={e => updateVariant(i, { imageUrl: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="">Use product gallery</option>
              {imageOptions.map((m, idx) => (
                <option key={idx} value={m.url}>Photo {idx + 1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function VariantsCard({
  options, variants, form,
  bulkPrice, bulkStock, setBulkPrice, setBulkStock,
  imageOptions, hasVariants, totalUnits,
  addOption, updateOptionName,
  addOptionValue, removeOptionValue, removeOption,
  syncVariants,
  updateVariant, removeVariant, applyBulk,
  inp,
}) {
  const [inputVals, setInputVals] = useState({});

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = (inputVals[i] || '').trim();
      if (val) { addOptionValue(i, val); setInputVals({ ...inputVals, [i]: '' }); }
    }
  };
  const handleBlur = (i) => {
    const val = (inputVals[i] || '').trim();
    if (val) { addOptionValue(i, val); setInputVals({ ...inputVals, [i]: '' }); }
  };

  const validOptions = options.filter(o => o.name.trim() && o.values.length > 0);
  const potentialCount = validOptions.length > 0
    ? validOptions.reduce((acc, o) => acc * o.values.length, 1)
    : 0;

  return (
    <Card>
      <CardHeader
        subtitle="Define options like Size or Color, then set per-item pricing & stock."
      >
        Product Variants
      </CardHeader>

      <CardBody className="space-y-8">

        {/* ════ STEP 1: DEFINE OPTIONS ════ */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
              <div>
                <p className="text-sm font-bold text-slate-800">Product Options</p>
                <p className="text-[11px] text-slate-400">Does this come in different sizes, colors, or styles?</p>
              </div>
            </div>
            {options.length > 0 && (
              <button
                onClick={addOption}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={12} /> Add option
              </button>
            )}
          </div>

          {options.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-11 h-11 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap size={18} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600">No variants needed</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Leave blank if this is a single standard product. Add an option to create size/color variants.
              </p>
              <button
                onClick={addOption}
                className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Plus size={12} /> Add an option (e.g. Size, Color)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Left accent */}
                  <div className="flex">
                    <div className="w-1 bg-blue-500 shrink-0" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Option name */}
                        <div className="w-44 shrink-0">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Option name
                          </label>
                          <input
                            value={opt.name}
                            onChange={e => updateOptionName(i, e.target.value)}
                            className={inp}
                            placeholder="e.g. Size, Color"
                          />
                        </div>

                        {/* Tag chip input */}
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Available values
                            <span className="font-normal text-slate-400 normal-case ml-1">(type & press Enter)</span>
                          </label>
                          <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] bg-white border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            {opt.values.map((val, vIdx) => (
                              <span
                                key={vIdx}
                                className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg"
                              >
                                {val}
                                <X
                                  size={11}
                                  className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors"
                                  onClick={() => removeOptionValue(i, vIdx)}
                                />
                              </span>
                            ))}
                            <input
                              className="flex-1 outline-none text-sm min-w-[100px] bg-transparent text-slate-700 placeholder:text-slate-300"
                              placeholder={opt.values.length === 0 ? `e.g. ${opt.name?.toLowerCase().includes('color') ? 'Red, Blue…' : opt.name?.toLowerCase().includes('size') ? 'S, M, L…' : 'Option 1…'}` : ''}
                              value={inputVals[i] || ''}
                              onChange={e => setInputVals({ ...inputVals, [i]: e.target.value })}
                              onKeyDown={e => handleKeyDown(e, i)}
                              onBlur={() => handleBlur(i)}
                            />
                          </div>
                        </div>

                        {/* Delete option */}
                        <button
                          onClick={() => removeOption(i)}
                          className="mt-5 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          title="Remove this option"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Value count hint */}
                      {opt.values.length > 0 && (
                        <p className="text-[10px] text-slate-400 pl-0.5">
                          {opt.values.length} value{opt.values.length !== 1 ? 's' : ''} defined
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Generate button */}
              {potentialCount > 0 && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={addOption}
                    className="text-xs text-slate-400 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} /> Add another option
                  </button>

                  <button
                    onClick={syncVariants}
                    className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25"
                  >
                    <ArrowDown size={14} />
                    Generate {potentialCount} variant{potentialCount !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ════ STEP 2: VARIANT INVENTORY ════ */}
        {hasVariants && (
          <section className="border-t border-slate-100 pt-8">
            {/* Section header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">Pricing & Inventory</p>
                  <p className="text-[11px] text-slate-400">{variants.length} variant{variants.length !== 1 ? 's' : ''} · {totalUnits} total units in stock</p>
                </div>
              </div>

              {/* Bulk apply */}
              <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3.5 py-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Bulk set:</span>
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">₦</span>
                    <input
                      type="number"
                      placeholder="Price"
                      value={bulkPrice}
                      onChange={e => setBulkPrice(e.target.value)}
                      className={`w-24 bg-white/10 border border-white/10 text-white placeholder-slate-500 rounded-lg pl-5 pr-2 py-1.5 text-[11px] font-semibold outline-none focus:bg-white/15 focus:border-white/30 transition-colors ${noSpin}`}
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={bulkStock}
                    onChange={e => setBulkStock(e.target.value)}
                    className={`w-16 bg-white/10 border border-white/10 text-white placeholder-slate-500 rounded-lg px-2 py-1.5 text-[11px] font-semibold outline-none focus:bg-white/15 focus:border-white/30 transition-colors ${noSpin}`}
                  />
                  <button
                    onClick={applyBulk}
                    className="bg-white text-slate-900 text-[11px] font-black px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                  >
                    Apply all
                  </button>
                </div>
              </div>
            </div>

            {/* Variant cards */}
            <div className="space-y-3">
              {variants.map((v, i) => (
                <VariantCard
                  key={i}
                  v={v}
                  i={i}
                  imageOptions={imageOptions}
                  updateVariant={updateVariant}
                  removeVariant={removeVariant}
                />
              ))}
            </div>

            {/* Re-sync hint */}
            {options.length > 0 && (
              <p className="text-[10px] text-slate-400 mt-4 text-center">
                Added new options above?{' '}
                <button onClick={syncVariants} className="text-blue-500 font-bold hover:text-blue-700 transition-colors">
                  Re-sync variants
                </button>
                {' '}— existing prices & stock are preserved.
              </p>
            )}
          </section>
        )}

      </CardBody>
    </Card>
  );
}