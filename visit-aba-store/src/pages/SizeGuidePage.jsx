import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Ruler, Scissors, ArrowRight,
  Info, ChevronDown, ChevronUp,
} from 'lucide-react';

// ⚠️  Adjust this path if your project structure differs.
//     From src/pages/SizeGuidePage.jsx → src/pages/product/custom/customDesignData.js
import {
  SIZE_CHARTS,
  MEASUREMENT_FIELDS,
  FITTING_PREFERENCES,
  CATEGORIES,
} from './product/custom/CustomDesignData';

/* ══════════════════════════════════════════════════════════════════
   STATIC DATA  (footwear has no entry in customDesignData.js)
══════════════════════════════════════════════════════════════════ */
const FOOTWEAR_SIZES = [
  { ng: '37', eu: '37', uk: '4',    usM: '5',    usW: '6.5', cm: '23.3' },
  { ng: '38', eu: '38', uk: '5',    usM: '6',    usW: '7.5', cm: '24.0' },
  { ng: '39', eu: '39', uk: '6',    usM: '7',    usW: '8.5', cm: '24.7' },
  { ng: '40', eu: '40', uk: '6.5',  usM: '7.5',  usW: '9',   cm: '25.3' },
  { ng: '41', eu: '41', uk: '7',    usM: '8',    usW: '9.5', cm: '25.9' },
  { ng: '42', eu: '42', uk: '8',    usM: '9',    usW: '10.5',cm: '26.6' },
  { ng: '43', eu: '43', uk: '9',    usM: '10',   usW: '11',  cm: '27.3' },
  { ng: '44', eu: '44', uk: '9.5',  usM: '10.5', usW: '11.5',cm: '27.9' },
  { ng: '45', eu: '45', uk: '10',   usM: '11',   usW: '12',  cm: '28.6' },
  { ng: '46', eu: '46', uk: '11',   usM: '12',   usW: '13',  cm: '29.3' },
];

/* ── Key measurements shown prominently in the "How to Measure" tab ── */
const KEY_FIELD_IDS = ['chest', 'bust', 'waist', 'hip', 'shoulder', 'sleeve', 'inseam'];

/* ── Group labels for the full measurement reference ─────────────── */
const GROUP_META = {
  upper:  { label: 'Upper Body',      emoji: '👕' },
  lower:  { label: 'Lower Body',      emoji: '👖' },
  length: { label: 'Garment Lengths', emoji: '📐' },
};

/* ══════════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════════ */

/** Check if a number falls inside a "36-38" style range string */
const inRange = (val, rangeStr) => {
  if (!val || !rangeStr) return false;
  const parts = rangeStr.split('-').map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) return false;
  return val >= parts[0] && val <= parts[1];
};

/** Group MEASUREMENT_FIELDS by their .group property */
const buildGroups = () => {
  const groups = { upper: [], lower: [], length: [] };
  Object.entries(MEASUREMENT_FIELDS).forEach(([id, field]) => {
    if (groups[field.group]) groups[field.group].push({ id, ...field });
  });
  return groups;
};

const GROUPED = buildGroups();

/* ══════════════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'men',      label: "Men's Sizes",    emoji: '👔' },
  { id: 'women',    label: "Women's Sizes",  emoji: '👗' },
  { id: 'measure',  label: 'How to Measure', emoji: '📏' },
  { id: 'footwear', label: 'Footwear',       emoji: '👞' },
  { id: 'fit',      label: 'Fit Guide',      emoji: '✂️'  },
];

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
const SizeGuidePage = () => {
  const [activeTab,   setActiveTab]   = useState('men');
  const [inputVal,    setInputVal]    = useState('');
  const [inputField,  setInputField]  = useState('chest');
  const [pinnedSize,  setPinnedSize]  = useState(null);
  const [expanded,    setExpanded]    = useState(new Set()); // for measure cards

  const numVal = inputVal ? parseFloat(inputVal) : null;

  const resetFinder = () => { setInputVal(''); setPinnedSize(null); };

  const toggleExpand = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const switchTab = (id) => { setActiveTab(id); resetFinder(); setExpanded(new Set()); };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white py-10 sm:py-14 px-4">
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-200">Size Guide</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/20 border border-green-500/30 flex items-center justify-center shrink-0">
              <Ruler size={20} className="text-green-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">Size Guide</h1>
          </div>
          <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
            All measurements are in <strong className="text-gray-200">inches (in)</strong> — the standard used
            by our Aba tailors. Use the charts below to find your size or learn how to take
            accurate measurements for a{' '}
            <Link to="/custom" className="text-green-400 hover:underline font-semibold">custom order</Link>.
          </p>
        </div>
      </div>

      {/* ── STICKY TAB NAV ───────────────────────────────────────── */}
      <div className="sticky top-[64px] sm:top-[80px] z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-2" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <span>{emoji}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* ════════════════════════════════════════════════════════
            MEN'S SIZES  — SIZE_CHARTS.men
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'men' && (
          <div className="space-y-6">
            <SectionHeader
              title="Men's Standard Sizes"
              subtitle="Body measurements in inches. These cover agbada, senator, suit, kaftan, shirt, and trousers."
            />

            <FinderBar
              value={inputVal} setValue={setInputVal}
              field={inputField} setField={setInputField}
              options={[
                { value: 'chest', label: 'Chest' },
                { value: 'waist', label: 'Waist' },
                { value: 'hip',   label: 'Hip'   },
                { value: 'neck',  label: 'Neck'  },
              ]}
              onClear={resetFinder}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wider">
                      <Th>Size</Th>
                      <Th>Chest (in)</Th>
                      <Th>Waist (in)</Th>
                      <Th>Hip (in)</Th>
                      <Th>Neck (in)</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SIZE_CHARTS.men.map((row) => {
                      const match  = numVal && inRange(numVal, row[inputField]);
                      const pinned = pinnedSize === row.size;
                      const hi     = match || pinned;
                      return (
                        <tr
                          key={row.size}
                          onClick={() => setPinnedSize(pinned ? null : row.size)}
                          className={`cursor-pointer transition-colors ${
                            pinned ? 'bg-green-600 text-white'
                            : match ? 'bg-green-50 text-green-900'
                            : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <SizeBadge label={row.size} active={hi} dark={pinned} />
                          </td>
                          <Td bold={inputField === 'chest' && hi}>{row.chest}</Td>
                          <Td bold={inputField === 'waist' && hi}>{row.waist}</Td>
                          <Td bold={inputField === 'hip'   && hi}>{row.hip}</Td>
                          <Td bold={inputField === 'neck'  && hi}>{row.neck}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Applies to */}
            <CategoryPills gender="men" />

            <NoteBox>
              Between sizes? Always size up — our Aba tailors cut a trim silhouette, and a
              slightly larger size gives you room to tailor it in. Or skip the guesswork and
              place a custom order.
            </NoteBox>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            WOMEN'S SIZES  — SIZE_CHARTS.women
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'women' && (
          <div className="space-y-6">
            <SectionHeader
              title="Women's Standard Sizes"
              subtitle="Body measurements in inches. These cover dresses, iro & buba, skirt & blouse, jumpsuits, and kaftan."
            />

            <FinderBar
              value={inputVal} setValue={setInputVal}
              field={inputField} setField={setInputField}
              options={[
                { value: 'bust',  label: 'Bust'  },
                { value: 'waist', label: 'Waist' },
                { value: 'hip',   label: 'Hip'   },
              ]}
              onClear={resetFinder}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wider">
                      <Th>Size</Th>
                      <Th>Bust (in)</Th>
                      <Th>Waist (in)</Th>
                      <Th>Hip (in)</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SIZE_CHARTS.women.map((row) => {
                      const match  = numVal && inRange(numVal, row[inputField]);
                      const pinned = pinnedSize === row.size;
                      const hi     = match || pinned;
                      return (
                        <tr
                          key={row.size}
                          onClick={() => setPinnedSize(pinned ? null : row.size)}
                          className={`cursor-pointer transition-colors ${
                            pinned ? 'bg-green-600 text-white'
                            : match ? 'bg-green-50 text-green-900'
                            : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <SizeBadge label={row.size} active={hi} dark={pinned} />
                          </td>
                          <Td bold={inputField === 'bust'  && hi}>{row.bust}</Td>
                          <Td bold={inputField === 'waist' && hi}>{row.waist}</Td>
                          <Td bold={inputField === 'hip'   && hi}>{row.hip}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <CategoryPills gender="women" />

            <NoteBox>
              Our women's garments are designed with a fitted silhouette. If you prefer a relaxed
              fit or have a larger frame, size up by one — or order custom for a perfect fit.
            </NoteBox>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            HOW TO MEASURE
            Key fields shown as rich cards, then full reference below
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'measure' && (
          <div className="space-y-8">
            <SectionHeader
              title="How to Take Your Measurements"
              subtitle="Use a soft fabric tape measure. Measure in inches. Ask someone to help for best accuracy."
            />

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
              <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>General rule:</strong> Wear fitted clothing or underwear only when measuring.
                Keep the tape snug but not tight — you should be able to slide one finger underneath.
                All measurements are in <strong>inches (in)</strong>.
              </p>
            </div>

            {/* ── Key measurements (prominent cards) ── */}
            <div>
              <h3 className="text-base font-black text-gray-900 mb-4">
                Key Measurements
                <span className="ml-2 text-[11px] font-medium text-gray-400 normal-case">
                  — the ones needed to find your standard size
                </span>
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {KEY_FIELD_IDS.map((id) => {
                  const field = MEASUREMENT_FIELDS[id];
                  if (!field) return null;
                  return (
                    <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-black text-gray-900 text-sm">{field.label}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full uppercase tracking-wider">
                          {field.unit}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">{field.guide}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Ruler size={11} className="text-green-500" />
                        <span>Typical range: <strong className="text-gray-600">{field.placeholder} in</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Full measurement reference (all MEASUREMENT_FIELDS) ── */}
            <div>
              <h3 className="text-base font-black text-gray-900 mb-1">
                Full Measurement Reference
                <span className="ml-2 text-[11px] font-medium text-gray-400 normal-case">
                  — all fields used in custom orders
                </span>
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Click any measurement to expand the full guide. These are the exact fields our tailors
                use when making custom garments.
              </p>

              {Object.entries(GROUPED).map(([groupKey, fields]) => (
                <div key={groupKey} className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span>{GROUP_META[groupKey].emoji}</span>
                    <h4 className="text-sm font-black text-gray-700 uppercase tracking-wider">
                      {GROUP_META[groupKey].label}
                    </h4>
                    <div className="flex-1 h-px bg-gray-200 ml-2" />
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fields.map(({ id, label, guide, placeholder, unit }) => {
                      const open = expanded.has(id);
                      return (
                        <div
                          key={id}
                          className={`bg-white rounded-xl border transition-all ${
                            open ? 'border-green-200 shadow-sm' : 'border-gray-100'
                          }`}
                        >
                          <button
                            onClick={() => toggleExpand(id)}
                            className="w-full flex items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">{label}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">
                                {unit}
                              </span>
                            </div>
                            {open
                              ? <ChevronUp size={14} className="text-green-600 shrink-0" />
                              : <ChevronDown size={14} className="text-gray-400 shrink-0" />
                            }
                          </button>

                          {open && (
                            <div className="px-4 pb-4 border-t border-gray-50">
                              <p className="text-xs text-gray-600 leading-relaxed mt-3 mb-2">{guide}</p>
                              <p className="text-[11px] text-gray-400">
                                Range: <strong className="text-gray-600">{placeholder} in</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Dark tip card */}
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white">
              <p className="font-black text-base mb-2">Measuring for a custom order?</p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                For the best result, have someone else take your measurements — it is difficult to
                measure yourself accurately, especially shoulder width and back length. Our tailors
                will use every measurement you provide, so accuracy matters.
              </p>
              <p className="text-gray-400 text-xs">
                Not sure which measurements your garment needs?{' '}
                <Link to="/custom" className="text-green-400 hover:underline font-semibold">
                  Start your custom order
                </Link>{' '}
                — the wizard will ask for exactly what it needs, step by step.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            FOOTWEAR
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'footwear' && (
          <div className="space-y-6">
            <SectionHeader
              title="Footwear Size Conversion"
              subtitle="Our leather shoes are sold in EU/Nigerian standard sizes. Use the chart to find your equivalent."
            />

            {/* Foot-length finder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 shrink-0">
                <Ruler size={16} className="text-green-600" />
                Find my size — enter foot length:
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number" min="22" max="32" step="0.1"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="e.g. 26.5"
                  className="w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all"
                />
                <span className="text-sm text-gray-500 font-medium">cm</span>
                {inputVal && (
                  <button onClick={resetFinder} className="text-xs text-gray-400 hover:text-gray-700 underline ml-1">
                    Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-snug max-w-xs sm:ml-auto">
                Place your foot on paper, mark your longest toe, measure from heel to mark.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 text-white text-xs font-bold uppercase tracking-wider">
                      <Th>NG / EU</Th>
                      <Th>UK</Th>
                      <Th>US Men</Th>
                      <Th>US Women</Th>
                      <Th>Foot Length (cm)</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {FOOTWEAR_SIZES.map((row) => {
                      const match  = numVal && Math.abs(parseFloat(row.cm) - numVal) < 0.4;
                      const pinned = pinnedSize === row.ng;
                      const hi     = match || pinned;
                      return (
                        <tr
                          key={row.ng}
                          onClick={() => setPinnedSize(pinned ? null : row.ng)}
                          className={`cursor-pointer transition-colors ${
                            pinned ? 'bg-green-600 text-white'
                            : match ? 'bg-green-50 text-green-900'
                            : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <SizeBadge label={row.ng} active={hi} dark={pinned} />
                          </td>
                          <Td>{row.uk}</Td>
                          <Td>{row.usM}</Td>
                          <Td>{row.usW}</Td>
                          <Td bold={hi}>{row.cm} cm</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <NoteBox>
              Our Aba leather shoes are true to EU size. If you are between sizes or have wider feet,
              go up by one. Brand-new leather molds to your foot within a few wears.
              Always measure in the evening when feet are at their largest.
            </NoteBox>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            FIT GUIDE  — FITTING_PREFERENCES + CATEGORIES
        ════════════════════════════════════════════════════════ */}
        {activeTab === 'fit' && (
          <div className="space-y-8">
            <SectionHeader
              title="Fit Guide"
              subtitle="Choose the silhouette that suits your style before placing a custom order."
            />

            {/* Fitting preferences from data */}
            <div className="grid sm:grid-cols-3 gap-5">
              {FITTING_PREFERENCES.map(({ id, name, desc }) => {
                const widthClass =
                  id === 'slim' ? 'w-14' : id === 'regular' ? 'w-20' : 'w-28';
                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center"
                  >
                    {/* Visual silhouette hint */}
                    <div className={`${widthClass} h-28 bg-gray-900 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden`}>
                      <div
                        className={`bg-green-500 rounded-lg absolute bottom-0 ${
                          id === 'slim'    ? 'w-6 h-20'
                          : id === 'regular' ? 'w-9 h-20'
                          : 'w-14 h-20'
                        }`}
                      />
                    </div>
                    <p className="font-black text-gray-900 mb-2">{name}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>

            {/* How to choose */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
              <Info size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>How to choose:</strong> When ordering custom, you will select your preferred fit.
                Our tailors will add the appropriate ease allowance on top of your body measurements.
                Slim fit adds 1–2 in of ease; Regular adds 2–3 in; Loose adds 4–5 in.
              </p>
            </div>

            {/* Garment categories by gender */}
            <div>
              <h3 className="text-base font-black text-gray-900 mb-4">Available Custom Garments</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {['men', 'women', 'unisex'].map((gender) => {
                  const cats = CATEGORIES.filter((c) => c.gender === gender);
                  if (!cats.length) return null;
                  const gLabel = gender === 'men' ? "Men's" : gender === 'women' ? "Women's" : 'Unisex';
                  return (
                    <div key={gender} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{gLabel}</p>
                      <div className="space-y-2">
                        {cats.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/custom/order/${cat.id}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-green-50 hover:border-green-100 border border-transparent transition-all group"
                          >
                            <div>
                              <p className="text-sm font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                                {cat.name}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{cat.tagline}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-[11px] font-bold text-gray-500">
                                From ₦{cat.priceFrom.toLocaleString()}
                              </p>
                              <p className="text-[10px] text-gray-400">{cat.leadTime}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── BOTTOM CTA ───────────────────────────────────────── */}
        <div className="mt-12 bg-green-600 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Scissors size={20} />
            </div>
            <div>
              <p className="font-black text-lg">Not finding your exact size?</p>
              <p className="text-green-100 text-sm mt-0.5 max-w-md leading-relaxed">
                Our Aba tailors will sew your garment to your exact measurements — no compromise on fit,
                no guessing between sizes.
              </p>
            </div>
          </div>
          <Link
            to="/custom"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-white text-green-700 font-black rounded-xl text-sm hover:bg-green-50 transition-all shadow-lg"
          >
            Order Custom <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════════ */

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-2">
    <h2 className="text-2xl font-black text-gray-900">{title}</h2>
    <p className="text-gray-500 text-sm mt-1 leading-relaxed max-w-2xl">{subtitle}</p>
  </div>
);

const Th = ({ children }) => (
  <th className="px-5 py-3.5 text-left whitespace-nowrap">{children}</th>
);

const Td = ({ children, bold }) => (
  <td className={`px-5 py-3.5 whitespace-nowrap ${bold ? 'font-bold' : ''}`}>{children}</td>
);

const SizeBadge = ({ label, active, dark }) => (
  <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-lg text-xs font-black transition-colors ${
    dark   ? 'bg-white text-green-700'
    : active ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-700'
  }`}>
    {label}
  </span>
);

/** Measurement finder bar for clothing tabs */
const FinderBar = ({ value, setValue, field, setField, options, onClear }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 shrink-0">
      <Ruler size={16} className="text-green-600" />
      Find my size:
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={field} onChange={(e) => setField(e.target.value)}
        className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 cursor-pointer transition-all"
      >
        {options.map(({ value: v, label }) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      <input
        type="number" min="24" max="60" step="0.5"
        value={value} onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. 38"
        className="w-28 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all"
      />
      <span className="text-sm text-gray-500 font-medium">in</span>
      {value && (
        <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-700 underline">
          Clear
        </button>
      )}
    </div>
    <p className="text-xs text-gray-400 sm:ml-auto leading-snug sm:text-right max-w-xs">
      Enter your body measurement in inches — the matching row highlights green.
    </p>
  </div>
);

/** Shows which categories a gender's sizes apply to */
const CategoryPills = ({ gender }) => {
  const cats = CATEGORIES.filter(
    (c) => c.gender === gender || c.gender === 'unisex'
  );
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        Applies to
      </p>
      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <Link
            key={c.id}
            to={`/custom/order/${c.id}`}
            className="px-3 py-1 bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-xs font-semibold transition-all"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

const NoteBox = ({ children }) => (
  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
    <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
    <p className="leading-relaxed">{children}</p>
  </div>
);

export default SizeGuidePage;