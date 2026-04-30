import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Check, Upload, X, Info,
  MessageCircle, Save, ShieldCheck, Phone, MapPin,
  CheckCircle2, Bookmark, Trash2, Ruler, Image as ImageIcon,
  Sparkles, Pencil, Calendar, AlertCircle, Copy, ArrowRight,
} from 'lucide-react';
import {
  CATEGORIES, getCategoryById, getMeasurementsForCategory,
  SIZE_CHARTS, FITTING_PREFERENCES, STORAGE_KEYS, WHATSAPP_NUMBER,
} from './CustomDesignData';

// ═══════════════════════════════════════════════════════════════════════════
//  CustomDesignerWizard  ·  /custom/order/:categoryId
//  Flow: [Gender →] Style → Size → Details → Contact → Review → Submit
// ═══════════════════════════════════════════════════════════════════════════

const CustomDesignerWizard = () => {
  const { categoryType, categoryId: paramId } = useParams();
  // Support both /custom/order/:categoryId and /custom/design/:garmentType
  const id = paramId || categoryType;
  const category = getCategoryById(id);
  const navigate = useNavigate();

  // ──────── State ────────
  const isGendered = category?.gender !== 'unisex';
  const initialOrder = useMemo(
    () => ({
      categoryId: id,
      gender: isGendered ? category?.gender : null,
      style: { selectedId: null, customImages: [], styleNotes: '' },
      size: { mode: 'chart', chartSize: '', measurements: {}, profileName: '', useTailor: false },
      details: { fitting: 'regular', fabric: '', color: '', occasion: '', needBy: '', notes: '' },
      contact: { name: '', phone: '', whatsapp: '', email: '', address: '', delivery: 'aba' },
    }),
    [id, isGendered, category],
  );
  const [order, setOrder] = useState(initialOrder);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(null);

  // ──────── Step config ────────
  const steps = useMemo(() => {
    const base = [
      { id: 'style',   label: 'Style' },
      { id: 'size',    label: 'Size' },
      { id: 'details', label: 'Details' },
      { id: 'contact', label: 'Contact' },
      { id: 'review',  label: 'Review' },
    ];
    return category?.gender === 'unisex' ? [{ id: 'gender', label: 'Who for' }, ...base] : base;
  }, [category]);

  // ──────── Load draft on mount ────────
  useEffect(() => {
    if (!category) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.draft);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.categoryId === id && d?.order) setOrder(d.order);
    } catch {}
  }, [id, category]);

  // ──────── Autosave ────────
  useEffect(() => {
    if (submitted) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.draft,
        JSON.stringify({ categoryId: id, order, savedAt: Date.now() }),
      );
    } catch {}
  }, [order, id, submitted]);

  // ──────── Updaters ────────
  const update = useCallback((section, patch) => {
    setOrder((o) => ({ ...o, [section]: { ...o[section], ...patch } }));
  }, []);
  const setGender = (g) => setOrder((o) => ({ ...o, gender: g }));

  const currentStep = steps[stepIndex];
  const isLastBeforeReview = currentStep?.id === 'contact';
  const isReview = currentStep?.id === 'review';

  // ──────── Validation per step ────────
  const canContinue = useMemo(() => {
    if (!currentStep) return false;
    switch (currentStep.id) {
      case 'gender':
        return !!order.gender;
      case 'style':
        return !!order.style.selectedId || order.style.customImages.length > 0;
      case 'size':
        if (order.size.useTailor) return true;
        if (order.size.mode === 'chart') return !!order.size.chartSize;
        // manual: at least 4 measurements filled
        return Object.values(order.size.measurements).filter(Boolean).length >= 4;
      case 'details':
        return true; // all optional
      case 'contact':
        return order.contact.name.trim() && (order.contact.phone.trim() || order.contact.whatsapp.trim());
      case 'review':
        return true;
      default:
        return false;
    }
  }, [currentStep, order]);

  const onContinue = () => {
    if (!canContinue) return;
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };
  const onBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else navigate('/custom');
  };

  // ──────── Submit ────────
  const handleSubmit = () => {
    const ref = generateReference();
    const orderRecord = {
      ref,
      categoryId: id,
      categoryName: category.name,
      submittedAt: Date.now(),
      ...order,
    };
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || '[]');
      existing.unshift(orderRecord);
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(existing));
    } catch {}
    // clear draft
    try { localStorage.removeItem(STORAGE_KEYS.draft); } catch {}
    setSubmitted(orderRecord);
  };

  // ──────── Empty / loading ────────
  if (!category) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-5">
        <div className="text-center">
          <div className="font-display text-3xl text-stone-900 mb-3">Category not found</div>
          <Link to="/custom" className="inline-flex items-center gap-2 text-emerald-800 hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to categories
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return <SuccessScreen order={submitted} category={category} />;
  }

  return (
    <div className="custom-flow min-h-screen bg-[#faf7f2] text-stone-900 pb-32">
      <FontInjector />
      <ProgressHeader steps={steps} stepIndex={stepIndex} setStepIndex={setStepIndex} category={category} />

      <main className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 pb-12">
        {currentStep.id === 'gender'  && <GenderStep  order={order} setGender={setGender} />}
        {currentStep.id === 'style'   && <StyleStep   order={order} update={update} category={category} />}
        {currentStep.id === 'size'    && <SizeStep    order={order} update={update} category={category} />}
        {currentStep.id === 'details' && <DetailsStep order={order} update={update} category={category} />}
        {currentStep.id === 'contact' && <ContactStep order={order} update={update} />}
        {currentStep.id === 'review'  && <ReviewStep  order={order} category={category} setStepIndex={setStepIndex} steps={steps} />}
      </main>

      <FlowFooter
        canContinue={canContinue}
        isReview={isReview}
        isLastBeforeReview={isLastBeforeReview}
        onBack={onBack}
        onContinue={onContinue}
        onSubmit={handleSubmit}
        backLabel={stepIndex === 0 ? 'Categories' : 'Back'}
        priceFrom={category.priceFrom}
      />
    </div>
  );
};

export default CustomDesignerWizard;

// ═══════════════════════════════════════════════════════════════════════════
//  HEADER + FOOTER
// ═══════════════════════════════════════════════════════════════════════════

const ProgressHeader = ({ steps, stepIndex, setStepIndex, category }) => (
  <header className="sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-stone-200">
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
      <Link to="/custom" className="text-stone-500 hover:text-stone-900 transition shrink-0">
        <ChevronLeft className="w-5 h-5" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-0.5">Custom order</div>
        <div className="font-display text-lg sm:text-xl text-stone-900 truncate leading-tight">{category.name}</div>
      </div>
      <div className="hidden sm:flex items-center gap-1">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => i <= stepIndex && setStepIndex(i)}
            disabled={i > stepIndex}
            className={`text-[11px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full transition ${
              i === stepIndex
                ? 'bg-stone-900 text-white'
                : i < stepIndex
                ? 'text-emerald-800 hover:bg-emerald-50'
                : 'text-stone-400'
            }`}
          >
            <span className="font-medium">{String(i + 1).padStart(2, '0')}</span>
            <span className="ml-1.5">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
    {/* Mobile progress bar */}
    <div className="sm:hidden h-1 bg-stone-200">
      <div
        className="h-full bg-emerald-700 transition-all duration-500"
        style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
      />
    </div>
  </header>
);

const FlowFooter = ({ canContinue, isReview, onBack, onContinue, onSubmit, backLabel, priceFrom }) => (
  <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200">
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 transition"
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </button>
      <div className="flex-1 hidden sm:flex items-center gap-2 text-xs text-stone-500">
        <span className="font-medium text-stone-700">From ₦{priceFrom.toLocaleString()}</span>
        <span className="text-stone-400">·</span>
        <span>Final quote within 24h</span>
      </div>
      {isReview ? (
        <button
          onClick={onSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-medium text-sm transition shadow-sm"
        >
          <Check className="w-4 h-4" />
          Submit for quote
        </button>
      ) : (
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition ${
            canContinue
              ? 'bg-stone-900 hover:bg-emerald-900 text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  </footer>
);

// ═══════════════════════════════════════════════════════════════════════════
//  STEP — GENDER (only for unisex categories)
// ═══════════════════════════════════════════════════════════════════════════

const GenderStep = ({ order, setGender }) => {
  return (
    <StepShell
      eyebrow="Step 01"
      title={<>Who is this <em className="font-display-italic text-emerald-800">for?</em></>}
      subtitle="We'll tailor the measurement fields and fit defaults accordingly."
    >
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {[
          { id: 'men',   name: 'For Him', desc: 'Men\'s cut, men\'s measurements' },
          { id: 'women', name: 'For Her', desc: 'Women\'s cut, includes bust & hip' },
        ].map((g) => {
          const active = order.gender === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGender(g.id)}
              className={`group relative overflow-hidden p-8 rounded-sm border-2 text-left transition ${
                active ? 'border-emerald-700 bg-emerald-50/40' : 'border-stone-200 bg-white hover:border-stone-400'
              }`}
            >
              <div className="font-display text-3xl text-stone-900 mb-1">{g.name}</div>
              <div className="text-sm text-stone-600">{g.desc}</div>
              {active && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </StepShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  STEP — STYLE
// ═══════════════════════════════════════════════════════════════════════════

const StyleStep = ({ order, update, category }) => {
  const fileRef = useRef(null);
  const customImages = order.style.customImages || [];

  const onUpload = (files) => {
    const fileArr = Array.from(files);
    if (customImages.length + fileArr.length > 4) {
      alert('Maximum 4 reference images.');
      return;
    }
    fileArr.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is over 5MB. Please use a smaller image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        update('style', {
          customImages: [...(order.style.customImages || []), { name: file.name, dataUrl: e.target.result }],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => {
    update('style', {
      customImages: customImages.filter((_, i) => i !== idx),
    });
  };

  return (
    <StepShell
      eyebrow={`Step · Style`}
      title={<>Pick a style, or <em className="font-display-italic text-emerald-800">show us yours.</em></>}
      subtitle="Choose from our gallery, upload reference images, or both. Sketches, screenshots, Pinterest pics — all welcome."
    >
      {/* Gallery */}
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-4">From our gallery</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {category.sampleStyles.map((s) => {
            const active = order.style.selectedId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => update('style', { selectedId: active ? null : s.id })}
                className={`group relative aspect-[3/4] rounded-sm overflow-hidden border-2 transition ${
                  active ? 'border-emerald-700' : 'border-stone-200 hover:border-stone-400'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${category.accent}15 0%, ${category.accent}05 100%)`,
                }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ color: category.accent }}
                >
                  <CategorySilhouette path={category.silhouette} size={90} />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-white via-white/95 to-transparent text-left">
                  <div className="font-medium text-xs text-stone-900 truncate">{s.name}</div>
                  <div className="text-[10px] text-stone-500 truncate">{s.tone}</div>
                </div>
                {active && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom uploads */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-1">Your inspiration</div>
            <div className="text-sm text-stone-700">Upload up to 4 reference images.</div>
          </div>
          <span className="text-xs text-stone-400">{customImages.length}/4</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {customImages.map((img, i) => (
            <div key={i} className="relative aspect-[3/4] rounded-sm overflow-hidden bg-stone-100 border border-stone-200">
              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-stone-900/80 hover:bg-stone-900 flex items-center justify-center transition"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
          {customImages.length < 4 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-[3/4] rounded-sm border-2 border-dashed border-stone-300 hover:border-emerald-700 hover:bg-emerald-50/40 transition flex flex-col items-center justify-center text-stone-500 hover:text-emerald-800"
            >
              <Upload className="w-6 h-6 mb-2" strokeWidth={1.5} />
              <span className="text-xs font-medium">Add image</span>
              <span className="text-[10px] text-stone-400 mt-0.5">JPG · PNG · max 5MB</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Style notes */}
      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">
          Style notes <span className="lowercase tracking-normal text-stone-400">(optional)</span>
        </label>
        <textarea
          value={order.style.styleNotes}
          onChange={(e) => update('style', { styleNotes: e.target.value })}
          placeholder="Anything specific? Embroidery placement, collar style, button color, sleeve length…"
          rows={3}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition resize-none"
        />
      </div>
    </StepShell>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  STEP — SIZE
// ═══════════════════════════════════════════════════════════════════════════

const SizeStep = ({ order, update, category }) => {
  const measurementFields = useMemo(() => getMeasurementsForCategory(category), [category]);
  const sizeChart = order.gender === 'women' ? SIZE_CHARTS.women : SIZE_CHARTS.men;
  const [guideField, setGuideField] = useState(null);
  const [showSaved, setShowSaved] = useState(false);

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.measurements);
      if (raw) setSavedProfiles(JSON.parse(raw) || []);
    } catch {}
  }, []);

  const setMode = (mode) => update('size', { mode, useTailor: false });

  const setMeasurement = (id, value) => {
    update('size', { measurements: { ...order.size.measurements, [id]: value } });
  };

  const useSavedProfile = (profile) => {
    update('size', {
      mode: 'manual',
      measurements: profile.values || {},
      profileName: profile.name,
      useTailor: false,
    });
    setShowSaved(false);
  };

  const saveProfile = () => {
    const name = order.size.profileName?.trim();
    if (!name) {
      alert('Give this profile a name (e.g., "My measurements", "Wedding outfit").');
      return;
    }
    if (Object.values(order.size.measurements).filter(Boolean).length < 4) {
      alert('Fill in at least 4 measurements before saving.');
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.measurements) || '[]');
      const filtered = existing.filter((p) => p.name !== name);
      filtered.push({ name, gender: order.gender, values: order.size.measurements, savedAt: Date.now() });
      localStorage.setItem(STORAGE_KEYS.measurements, JSON.stringify(filtered));
      setSavedProfiles(filtered);
      alert('Measurements saved. You can reuse them on future orders.');
    } catch {}
  };

  return (
    <StepShell
      eyebrow="Step · Size"
      title={<>Tell us your <em className="font-display-italic text-emerald-800">size.</em></>}
      subtitle="Use our size chart, type in exact measurements, or have a tailor measure you in person."
    >
      {/* Mode toggle */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
        <ModeButton active={order.size.mode === 'chart' && !order.size.useTailor} onClick={() => setMode('chart')} icon={Ruler} label="Size chart" sub="S/M/L/XL" />
        <ModeButton active={order.size.mode === 'manual' && !order.size.useTailor} onClick={() => setMode('manual')} icon={Pencil} label="Enter measurements" sub="Most accurate" />
        <ModeButton active={order.size.useTailor} onClick={() => update('size', { useTailor: true })} icon={MessageCircle} label="Tailor visit" sub="We measure you" />
      </div>

      {/* Saved profiles bar */}
      {!order.size.useTailor && savedProfiles.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowSaved((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-left hover:bg-emerald-100/60 transition"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-emerald-800 shrink-0" strokeWidth={1.5} />
              <span className="text-sm">
                You have <span className="font-semibold">{savedProfiles.length}</span> saved {savedProfiles.length === 1 ? 'profile' : 'profiles'}
              </span>
            </div>
            <ChevronRight className={`w-4 h-4 text-emerald-800 transition ${showSaved ? 'rotate-90' : ''}`} />
          </button>
          {showSaved && (
            <div className="mt-2 grid sm:grid-cols-2 gap-2">
              {savedProfiles.map((p, i) => (
                <button
                  key={i}
                  onClick={() => useSavedProfile(p)}
                  className="p-3 bg-white border border-stone-200 hover:border-emerald-700 rounded-sm text-left transition"
                >
                  <div className="font-medium text-sm text-stone-900">{p.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {p.gender} · {Object.keys(p.values || {}).length} measurements
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENT — varies by mode */}
      {order.size.useTailor ? (
        <TailorVisitCard />
      ) : order.size.mode === 'chart' ? (
        <SizeChartView
          chart={sizeChart}
          gender={order.gender}
          selected={order.size.chartSize}
          onSelect={(size) => update('size', { chartSize: size })}
        />
      ) : (
        <ManualMeasurements
          fields={measurementFields}
          values={order.size.measurements}
          onChange={setMeasurement}
          onShowGuide={(f) => setGuideField(f)}
          profileName={order.size.profileName}
          setProfileName={(name) => update('size', { profileName: name })}
          onSaveProfile={saveProfile}
        />
      )}

      {/* Measurement guide modal */}
      {guideField && <GuideModal field={guideField} onClose={() => setGuideField(null)} />}
    </StepShell>
  );
};

const ModeButton = ({ active, onClick, icon: Icon, label, sub }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-sm border-2 text-left transition ${
      active ? 'border-emerald-700 bg-emerald-50/40' : 'border-stone-200 bg-white hover:border-stone-400'
    }`}
  >
    <Icon className={`w-5 h-5 mb-2 ${active ? 'text-emerald-800' : 'text-stone-500'}`} strokeWidth={1.5} />
    <div className="font-medium text-sm text-stone-900 leading-tight">{label}</div>
    <div className="text-[11px] text-stone-500 mt-0.5">{sub}</div>
  </button>
);

const SizeChartView = ({ chart, gender, selected, onSelect }) => {
  const cols = gender === 'women' ? ['size', 'bust', 'waist', 'hip'] : ['size', 'chest', 'waist', 'hip', 'neck'];
  return (
    <div className="bg-white border border-stone-200 rounded-sm overflow-hidden">
      <div className="p-5 border-b border-stone-200 flex items-center justify-between">
        <div>
          <div className="font-display text-xl text-stone-900 leading-tight">Standard size chart</div>
          <div className="text-xs text-stone-500 mt-0.5">All measurements in inches. Tap a row to select.</div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{gender === 'women' ? 'Women' : 'Men'}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-[0.1em] text-stone-500">
            <tr>
              {cols.map((c) => (
                <th key={c} className="text-left px-5 py-3 font-medium">{c}</th>
              ))}
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {chart.map((row) => {
              const active = selected === row.size;
              return (
                <tr
                  key={row.size}
                  onClick={() => onSelect(row.size)}
                  className={`border-t border-stone-100 cursor-pointer transition ${
                    active ? 'bg-emerald-50' : 'hover:bg-stone-50'
                  }`}
                >
                  {cols.map((c) => (
                    <td key={c} className={`px-5 py-3.5 tabular-nums ${c === 'size' ? 'font-medium text-stone-900' : 'text-stone-600'}`}>
                      {row[c]}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-right">
                    {active ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 inline" strokeWidth={1.5} />
                    ) : (
                      <span className="w-5 h-5 inline-block rounded-full border border-stone-300" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
        Not sure between sizes? Pick the larger one — we always confirm with you before cutting fabric.
      </div>
    </div>
  );
};

const ManualMeasurements = ({ fields, values, onChange, onShowGuide, profileName, setProfileName, onSaveProfile }) => {
  const groups = {
    upper: { label: 'Upper Body', fields: fields.filter((f) => f.group === 'upper') },
    lower: { label: 'Lower Body', fields: fields.filter((f) => f.group === 'lower') },
    length: { label: 'Garment Length', fields: fields.filter((f) => f.group === 'length') },
  };

  return (
    <div className="space-y-8">
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-sm p-4 text-sm text-emerald-900 flex gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">All measurements in inches.</span>{' '}
          Tap the <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white border border-emerald-300 mx-0.5"><span className="text-[10px] text-emerald-700 leading-none">?</span></span>
          {' '}icon next to any field to see a how-to-measure guide.
        </div>
      </div>

      {Object.values(groups).map(
        (g) =>
          g.fields.length > 0 && (
            <div key={g.label}>
              <h4 className="text-xs uppercase tracking-[0.15em] text-stone-500 mb-3">{g.label}</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {g.fields.map((f) => (
                  <div key={f.id} className="relative">
                    <label className="absolute top-2.5 left-3 text-[10px] uppercase tracking-[0.1em] text-stone-500 font-medium pointer-events-none">
                      {f.label}
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={values[f.id] || ''}
                      onChange={(e) => onChange(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full pt-7 pb-3 pl-3 pr-16 bg-white border border-stone-200 rounded-sm text-base font-medium tabular-nums focus:outline-none focus:border-stone-900 transition"
                    />
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-xs text-stone-400">in</span>
                      <button
                        type="button"
                        onClick={() => onShowGuide(f)}
                        className="w-6 h-6 rounded-full bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 flex items-center justify-center text-stone-500 transition"
                        aria-label={`How to measure ${f.label}`}
                      >
                        <span className="text-xs font-medium">?</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
      )}

      {/* Save profile */}
      <div className="bg-white border border-stone-200 rounded-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <Save className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />
          <div>
            <div className="font-medium text-sm text-stone-900">Save these measurements</div>
            <div className="text-xs text-stone-500 mt-0.5">Reuse them on every future order.</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Name this profile (e.g., My measurements, Mom)"
            className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 focus:bg-white transition"
          />
          <button
            onClick={onSaveProfile}
            className="px-5 py-2.5 bg-stone-900 hover:bg-emerald-900 text-white text-sm font-medium rounded-sm transition"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
};

const TailorVisitCard = () => (
  <div className="bg-white border border-stone-200 rounded-sm p-8">
    <div className="flex items-start gap-4 mb-6">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <MessageCircle className="w-5 h-5 text-emerald-800" strokeWidth={1.5} />
      </div>
      <div>
        <div className="font-display text-2xl text-stone-900 leading-tight mb-1">A tailor will measure you</div>
        <div className="text-sm text-stone-600">
          Within Aba, this is free. Outside Aba, we coordinate via WhatsApp video call.
        </div>
      </div>
    </div>
    <ul className="space-y-2.5 text-sm text-stone-600 mb-6">
      <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={1.5} /> Free home or shop visit within Aba</li>
      <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={1.5} /> WhatsApp video appointment otherwise</li>
      <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={1.5} /> Scheduled around your availability</li>
      <li className="flex gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={1.5} /> Measurements saved to your profile</li>
    </ul>
    <div className="text-xs text-stone-500 leading-relaxed border-t border-stone-100 pt-4">
      Continue to the next step — we'll arrange the visit when we contact you with your quote.
    </div>
  </div>
);

const GuideModal = ({ field, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
    onClick={onClose}
  >
    <div
      className="bg-white w-full sm:max-w-md rounded-t-lg sm:rounded-sm shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6 border-b border-stone-200 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.15em] text-emerald-800 mb-1.5">How to measure</div>
          <div className="font-display text-2xl text-stone-900 leading-tight">{field.label}</div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6">
        <div className="aspect-video bg-emerald-50/60 rounded-sm mb-5 flex items-center justify-center text-emerald-800">
          <MeasureDiagram field={field.id} />
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">{field.guide}</p>
        <div className="mt-4 text-xs text-stone-500 bg-stone-50 p-3 rounded-sm border border-stone-100">
          <span className="font-medium text-stone-700">Typical range:</span> {field.placeholder} {field.unit}
        </div>
      </div>
    </div>
  </div>
);

// Tiny inline diagrams (icon-style, no external assets needed)
const MeasureDiagram = ({ field }) => {
  const stroke = 'currentColor';
  const dash = 'currentColor';
  // simple body silhouette + highlight stroke depending on field
  return (
    <svg viewBox="0 0 200 140" width="100%" height="100%">
      {/* Body outline */}
      <path
        d="M100 20 Q88 22 85 32 L78 50 L70 56 L70 110 L85 110 L86 70 L114 70 L115 110 L130 110 L130 56 L122 50 L115 32 Q112 22 100 20 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.35"
      />
      {/* Highlight per field */}
      {(field === 'neck') && <ellipse cx="100" cy="28" rx="14" ry="4" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'chest' || field === 'bust') && <ellipse cx="100" cy="48" rx="26" ry="6" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'underBust') && <ellipse cx="100" cy="56" rx="22" ry="5" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'waist') && <ellipse cx="100" cy="68" rx="18" ry="4" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'hip' || field === 'highHip') && <ellipse cx="100" cy="82" rx="24" ry="5" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'shoulder') && <line x1="78" y1="38" x2="122" y2="38" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'sleeve') && <line x1="124" y1="40" x2="142" y2="92" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'bicep') && <ellipse cx="128" cy="52" rx="6" ry="3" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'wrist') && <ellipse cx="142" cy="92" rx="4" ry="2" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'inseam') && <line x1="100" y1="74" x2="100" y2="124" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'outseam') && <line x1="125" y1="68" x2="125" y2="124" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'thigh') && <ellipse cx="92" cy="88" rx="7" ry="3" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'knee') && <ellipse cx="92" cy="100" rx="5" ry="2.5" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'ankle') && <ellipse cx="92" cy="118" rx="4" ry="2" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'trouserWaist') && <ellipse cx="100" cy="72" rx="20" ry="4" fill="none" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'backLength' || field === 'frontLength') && <line x1="100" y1="32" x2="100" y2="68" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'shoulderToBust') && <line x1="92" y1="36" x2="92" y2="50" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'bustPointDistance') && <line x1="88" y1="48" x2="112" y2="48" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'topLength') && <line x1="125" y1="32" x2="125" y2="80" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'dressLength' || field === 'fullLength') && <line x1="125" y1="32" x2="125" y2="124" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {(field === 'skirtLength') && <line x1="125" y1="68" x2="125" y2="120" stroke={dash} strokeWidth="2" strokeDasharray="3,2" />}
      {/* small tape symbol */}
      <text x="166" y="20" fontSize="9" fill={stroke} opacity="0.5" fontFamily="DM Sans">tape</text>
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  STEP — DETAILS
// ═══════════════════════════════════════════════════════════════════════════

const DetailsStep = ({ order, update }) => (
  <StepShell
    eyebrow="Step · Details"
    title={<>The little <em className="font-display-italic text-emerald-800">touches.</em></>}
    subtitle="All optional. The more you tell us, the better the quote we can give you."
  >
    <div className="space-y-8">
      {/* Fitting */}
      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-3">Fitting preference</label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {FITTING_PREFERENCES.map((f) => {
            const active = order.details.fitting === f.id;
            return (
              <button
                key={f.id}
                onClick={() => update('details', { fitting: f.id })}
                className={`p-4 rounded-sm border-2 text-left transition ${
                  active ? 'border-emerald-700 bg-emerald-50/40' : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="font-medium text-sm text-stone-900">{f.name}</div>
                <div className="text-[11px] text-stone-500 mt-1 leading-snug">{f.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fabric & Color (free-form for now) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldText
          label="Fabric preference"
          value={order.details.fabric}
          onChange={(v) => update('details', { fabric: v })}
          placeholder="e.g., Cashmere, Cotton, Aso-Oke, Lace"
          help="Or leave blank — we'll suggest options in the quote."
        />
        <FieldText
          label="Color preference"
          value={order.details.color}
          onChange={(v) => update('details', { color: v })}
          placeholder="e.g., Navy, Cream, Burgundy"
        />
      </div>

      {/* Occasion + Need by */}
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldText
          label="Occasion"
          value={order.details.occasion}
          onChange={(v) => update('details', { occasion: v })}
          placeholder="e.g., Wedding, Office, Owambe"
        />
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">Need by</label>
          <div className="relative">
            <input
              type="date"
              value={order.details.needBy}
              onChange={(e) => update('details', { needBy: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition"
            />
            <Calendar className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">Anything else?</label>
        <textarea
          value={order.details.notes}
          onChange={(e) => update('details', { notes: e.target.value })}
          placeholder="Anything we should know — allergies, preferences, special requests…"
          rows={4}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition resize-none"
        />
      </div>
    </div>
  </StepShell>
);

const FieldText = ({ label, value, onChange, placeholder, help }) => (
  <div>
    <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition"
    />
    {help && <div className="text-xs text-stone-500 mt-1.5">{help}</div>}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  STEP — CONTACT
// ═══════════════════════════════════════════════════════════════════════════

const ContactStep = ({ order, update }) => (
  <StepShell
    eyebrow="Step · Contact"
    title={<>How do we <em className="font-display-italic text-emerald-800">reach you?</em></>}
    subtitle="We'll send your quote to your WhatsApp or phone within 24 hours."
  >
    <div className="space-y-5">
      <FieldText
        label="Full name *"
        value={order.contact.name}
        onChange={(v) => update('contact', { name: v })}
        placeholder="Your name"
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldText
          label="WhatsApp number *"
          value={order.contact.whatsapp}
          onChange={(v) => update('contact', { whatsapp: v })}
          placeholder="+234..."
          help="We send quote and updates here."
        />
        <FieldText
          label="Phone number"
          value={order.contact.phone}
          onChange={(v) => update('contact', { phone: v })}
          placeholder="+234..."
        />
      </div>
      <FieldText
        label="Email (optional)"
        value={order.contact.email}
        onChange={(v) => update('contact', { email: v })}
        placeholder="you@example.com"
      />

      {/* Delivery */}
      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-3">Delivery</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { id: 'aba', label: 'Within Aba', sub: 'Free pickup or local delivery' },
            { id: 'nigeria', label: 'Outside Aba', sub: 'Nationwide shipping (cost in quote)' },
          ].map((d) => {
            const active = order.contact.delivery === d.id;
            return (
              <button
                key={d.id}
                onClick={() => update('contact', { delivery: d.id })}
                className={`p-4 rounded-sm border-2 text-left transition ${
                  active ? 'border-emerald-700 bg-emerald-50/40' : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="font-medium text-sm text-stone-900">{d.label}</div>
                <div className="text-xs text-stone-500 mt-1">{d.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-[0.15em] text-stone-500 mb-2">
          Delivery address {order.contact.delivery === 'nigeria' && <span className="text-red-700">*</span>}
        </label>
        <textarea
          value={order.contact.address}
          onChange={(e) => update('contact', { address: e.target.value })}
          placeholder={order.contact.delivery === 'aba' ? 'Aba address (or leave blank for shop pickup)' : 'Full delivery address'}
          rows={3}
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-sm text-sm focus:outline-none focus:border-stone-900 transition resize-none"
        />
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 text-xs text-stone-600 leading-relaxed flex gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          Submitting this is <span className="font-medium text-stone-900">not a payment</span>. We review and send a quote first. You only pay when you accept it (50% deposit to start, balance on delivery).
        </div>
      </div>
    </div>
  </StepShell>
);

// ═══════════════════════════════════════════════════════════════════════════
//  STEP — REVIEW
// ═══════════════════════════════════════════════════════════════════════════

const ReviewStep = ({ order, category, setStepIndex, steps }) => {
  const findStepIdx = (id) => steps.findIndex((s) => s.id === id);
  return (
    <StepShell
      eyebrow="Step · Review"
      title={<>One last <em className="font-display-italic text-emerald-800">look.</em></>}
      subtitle="Check everything below. You can still change anything before submitting."
    >
      <div className="space-y-3">
        <ReviewCard label="Garment" value={category.name} />
        {order.gender && <ReviewCard label="For" value={order.gender === 'men' ? 'Him' : 'Her'} onEdit={() => setStepIndex(findStepIdx('gender'))} />}

        <ReviewCard
          label="Style"
          onEdit={() => setStepIndex(findStepIdx('style'))}
          value={
            <div className="space-y-2">
              {order.style.selectedId && (
                <div className="text-stone-900">{category.sampleStyles.find((s) => s.id === order.style.selectedId)?.name || '—'}</div>
              )}
              {order.style.customImages.length > 0 && (
                <div className="flex gap-1.5">
                  {order.style.customImages.map((img, i) => (
                    <img key={i} src={img.dataUrl} alt={img.name} className="w-12 h-12 object-cover rounded-sm border border-stone-200" />
                  ))}
                </div>
              )}
              {order.style.styleNotes && <div className="text-xs text-stone-500 italic">"{order.style.styleNotes}"</div>}
            </div>
          }
        />

        <ReviewCard
          label="Size"
          onEdit={() => setStepIndex(findStepIdx('size'))}
          value={
            order.size.useTailor
              ? <span className="text-stone-900">Tailor will measure in person</span>
              : order.size.mode === 'chart'
              ? <span className="text-stone-900">Standard size: <span className="font-medium">{order.size.chartSize}</span></span>
              : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                  {Object.entries(order.size.measurements).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-stone-500">{k}</span>
                      <span className="text-stone-900 font-medium tabular-nums">{v}″</span>
                    </div>
                  ))}
                </div>
              )
          }
        />

        <ReviewCard
          label="Details"
          onEdit={() => setStepIndex(findStepIdx('details'))}
          value={
            <div className="text-xs space-y-1 text-stone-600">
              <div>Fitting: <span className="text-stone-900 font-medium">{FITTING_PREFERENCES.find((f) => f.id === order.details.fitting)?.name}</span></div>
              {order.details.fabric && <div>Fabric: <span className="text-stone-900">{order.details.fabric}</span></div>}
              {order.details.color && <div>Color: <span className="text-stone-900">{order.details.color}</span></div>}
              {order.details.occasion && <div>Occasion: <span className="text-stone-900">{order.details.occasion}</span></div>}
              {order.details.needBy && <div>Need by: <span className="text-stone-900">{order.details.needBy}</span></div>}
              {order.details.notes && <div className="italic">"{order.details.notes}"</div>}
            </div>
          }
        />

        <ReviewCard
          label="Contact"
          onEdit={() => setStepIndex(findStepIdx('contact'))}
          value={
            <div className="text-xs space-y-1 text-stone-600">
              <div className="text-stone-900 font-medium">{order.contact.name}</div>
              {order.contact.whatsapp && <div>WhatsApp: <span className="text-stone-900">{order.contact.whatsapp}</span></div>}
              {order.contact.phone && <div>Phone: <span className="text-stone-900">{order.contact.phone}</span></div>}
              {order.contact.email && <div>Email: <span className="text-stone-900">{order.contact.email}</span></div>}
              <div>Delivery: <span className="text-stone-900">{order.contact.delivery === 'aba' ? 'Within Aba' : 'Outside Aba'}</span></div>
              {order.contact.address && <div className="italic">{order.contact.address}</div>}
            </div>
          }
        />

        <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-5 mt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-sm text-emerald-900">
              <div className="font-medium mb-1">What happens next</div>
              <div className="text-emerald-900/80 leading-relaxed">
                Submit → A tailor reviews your order → Quote arrives via WhatsApp within 24h → Pay 50% deposit to start → Delivery in {category.leadTime} → Pay balance on receipt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  );
};

const ReviewCard = ({ label, value, onEdit }) => (
  <div className="bg-white border border-stone-200 rounded-sm p-5 flex items-start justify-between gap-4">
    <div className="flex-1 min-w-0">
      <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mb-1.5">{label}</div>
      <div className="text-sm">{value || <span className="text-stone-400">Not set</span>}</div>
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="text-xs text-emerald-800 hover:text-emerald-900 font-medium shrink-0 hover:underline"
      >
        Edit
      </button>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  SUCCESS SCREEN
// ═══════════════════════════════════════════════════════════════════════════

const SuccessScreen = ({ order, category }) => {
  const [copied, setCopied] = useState(false);
  const copyRef = () => {
    navigator.clipboard?.writeText(order.ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const waMessage = encodeURIComponent(
    `Hello! I just submitted a custom order on ExploreAba.\n\nReference: ${order.ref}\nGarment: ${category.name}\nName: ${order.contact?.name || ''}`,
  );
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-5 py-20">
      <FontInjector />
      <div className="max-w-xl w-full text-center fade-up">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="w-10 h-10 text-emerald-800" strokeWidth={2} />
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-800 mb-3">Order received</div>
        <h1 className="font-display text-5xl sm:text-6xl text-stone-900 leading-[0.95] mb-5">
          We're on it.
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed mb-10 max-w-md mx-auto">
          A tailor will review your <span className="font-medium text-stone-900">{category.name}</span> order and send you a quote on WhatsApp within 24 hours.
        </p>

        <div className="bg-white border border-stone-200 rounded-sm p-6 mb-8 text-left max-w-md mx-auto">
          <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mb-2">Reference number</div>
          <div className="flex items-center justify-between gap-3">
            <code className="font-display text-2xl text-stone-900 tabular-nums">{order.ref}</code>
            <button
              onClick={copyRef}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-sm text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="text-xs text-stone-500 mt-3">Save this — quote it when you reply.</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-medium transition"
          >
            <MessageCircle className="w-4 h-4" />
            Open WhatsApp now
          </a>
          <Link
            to="/custom"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white border border-stone-300 hover:bg-stone-50 rounded-full font-medium transition"
          >
            Back to categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  STEP SHELL  ·  shared layout for every step
// ═══════════════════════════════════════════════════════════════════════════

const StepShell = ({ eyebrow, title, subtitle, children }) => (
  <div className="fade-up">
    <div className="mb-10">
      <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">{eyebrow}</div>
      <h2 className="font-display text-4xl sm:text-5xl text-stone-900 leading-[1.05] mb-4">{title}</h2>
      {subtitle && <p className="text-stone-600 max-w-xl leading-relaxed">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const generateReference = () => {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EAB-CD-${date}-${rand}`;
};

const CategorySilhouette = ({ path, size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d={path} />
  </svg>
);

// ───────────────────────────────────────────────────────────────────────────
//  Font injector (shared with landing — duplicated so both can mount alone)
// ───────────────────────────────────────────────────────────────────────────

const FontInjector = () => {
  useEffect(() => {
    if (!document.getElementById('custom-fonts')) {
      const link = document.createElement('link');
      link.id = 'custom-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    if (!document.getElementById('custom-styles')) {
      const style = document.createElement('style');
      style.id = 'custom-styles';
      style.textContent = `
        .custom-flow { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
        .font-display-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-variation-settings: 'SOFT' 100; }
        @keyframes fade-up { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .5s ease-out both; }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};