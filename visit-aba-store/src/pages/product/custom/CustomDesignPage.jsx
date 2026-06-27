import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ruler, Pencil, MessageCircle, ArrowRight, CheckCircle2,
  Clock, ShieldCheck, Sparkles, ChevronRight, Plus, Minus,
  Bookmark, Phone, Sparkle,
} from 'lucide-react';
import { CATEGORIES, STORAGE_KEYS, WHATSAPP_NUMBER } from './CustomDesignData';
import { useCustomCategories } from '../../../hooks/useCustomCategories';

// ═══════════════════════════════════════════════════════════════════════════
//  CustomDesignPage  ·  /custom
//  Product-first: tight header → sticky filter → grid → one reassurance strip → FAQ
// ═══════════════════════════════════════════════════════════════════════════

const CustomDesignPage = () => {
  return (
    <div className="custom-root min-h-screen bg-[#faf7f2] text-stone-900">
      <FontInjector />
      <ResumeDraftBanner />
      <CompactHeader />
      <CategorySection />
      <ReassuranceStrip />
      <SavedMeasurements />
      <FAQ />
      <FinalCTA />
      <FloatingWhatsApp />
    </div>
  );
};

export default CustomDesignPage;

// ───────────────────────────────────────────────────────────────────────────
//  Fonts + base CSS
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
        .custom-root { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
        .font-display-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-variation-settings: 'SOFT' 100; }
        @keyframes fade-up { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fade-up .45s ease-out both; }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};

// ───────────────────────────────────────────────────────────────────────────
//  Resume draft banner
// ───────────────────────────────────────────────────────────────────────────

const ResumeDraftBanner = () => {
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.draft);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.savedAt && Date.now() - d.savedAt < 14 * 24 * 60 * 60 * 1000) setDraft(d);
    } catch {}
  }, []);
  if (!draft) return null;
  const cat = CATEGORIES.find((c) => c.id === draft.categoryId);
  if (!cat) return null;
  return (
    <div className="bg-gradient-to-r from-emerald-700 to-green-800 text-emerald-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2.5 flex items-center gap-3 text-sm">
        <Bookmark className="w-4 h-4 shrink-0" />
        <span className="flex-1">
          You have a draft <span className="font-semibold">{cat.name}</span> order in progress.
        </span>
        <Link
          to={`/custom/order/${draft.categoryId}`}
          className="px-3 py-1.5 bg-white text-emerald-900 rounded-full text-xs font-semibold hover:bg-emerald-50 transition"
        >
          Resume
        </Link>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  Compact header — the only non-product thing above the fold
// ───────────────────────────────────────────────────────────────────────────

const CompactHeader = () => (
  <section className="border-b border-stone-200 bg-white">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-9 fade-up">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 border border-emerald-900/10 text-xs uppercase tracking-[0.18em] text-emerald-900 mb-4">
            <Sparkles className="w-3 h-3" />
            <span>Made-to-Measure</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.0] tracking-tight text-stone-900 mb-3">
            Tailored in Aba. <span className="font-display-italic text-emerald-800">Made for you.</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
            Pick a category, share your measurements (or use our size guide), choose a style — or send your own inspiration. We quote within 24 hours.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a href="#categories" className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-emerald-900 transition group">
              Browse Categories
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 rounded-full text-sm font-medium hover:bg-stone-50 transition">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              Chat with a tailor
            </a>
          </div>
        </div>

        <div className="flex gap-8 sm:gap-10 shrink-0">
          <Stat n="11" label="Categories" />
          <Stat n="24h" label="Quote response" />
          <Stat n="5-21d" label="Turnaround" />
        </div>
      </div>
    </div>
  </section>
);

const Stat = ({ n, label }) => (
  <div>
    <div className="font-display text-2xl sm:text-3xl text-stone-900 leading-none mb-1">{n}</div>
    <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-stone-500">{label}</div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
//  Category section — sticky filter + the product grid (the star)
// ───────────────────────────────────────────────────────────────────────────

const CategorySection = () => {
  const [filter, setFilter] = useState('all');
  const { categories, loading, error } = useCustomCategories();

  const filtered = categories.filter((c) =>
    filter === 'all' ? true : c.gender === filter || c.gender === 'unisex',
  );

  return (
    <section id="categories" className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-14">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3 bg-[#faf7f2]/90 backdrop-blur-md border-b border-stone-200 mb-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl sm:text-2xl text-stone-900">
            What would you like <span className="font-display-italic text-emerald-800">made?</span>
          </h2>
          <div className="flex gap-1 p-1 bg-stone-100 rounded-full">
            {[
              { id: 'all', label: 'All' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'unisex', label: 'Unisex' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${
                  filter === f.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px] text-stone-500 text-sm">Loading the atelier…</div>
      ) : error && categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px] text-center">
          <div>
            <div className="font-display text-2xl text-stone-900 mb-2">Couldn't load categories</div>
            <div className="text-sm text-stone-600">Please refresh. If it keeps happening, message us on WhatsApp.</div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px] text-stone-500 text-sm">No {filter} categories yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      )}
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  CategoryCard
// ───────────────────────────────────────────────────────────────────────────

const CategoryCard = ({ category }) => (
  <Link
    to={`/custom/order/${category.id}`}
    className="group relative overflow-hidden bg-white border border-stone-200 hover:border-stone-900 transition-all duration-300 rounded-sm flex flex-col"
  >
    <div
      className="relative aspect-[3/4] overflow-hidden flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${category.accent}10 0%, ${category.accent}05 100%)` }}
    >
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
      {category.coverImageUrl ? (
        <img
          src={category.coverImageUrl}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          loading="lazy"
        />
      ) : (
        <div className="relative transition-transform duration-700 group-hover:scale-110" style={{ color: category.accent }}>
          <CategorySilhouette path={category.silhouette} size={140} />
        </div>
      )}
      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.15em] text-stone-700 rounded-sm z-10">
        {category.gender}
      </div>
      <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/0 group-hover:bg-stone-900 flex items-center justify-center transition-all duration-300 z-10">
        <ArrowRight className="w-4 h-4 text-stone-900 group-hover:text-white transition-colors" />
      </div>
    </div>

    <div className="p-4 sm:p-5 flex-1 flex flex-col">
      <h3 className="font-display text-xl sm:text-2xl text-stone-900 leading-tight mb-1">{category.name}</h3>
      <p className="text-xs text-stone-500 mb-4 line-clamp-2">{category.tagline}</p>
      <div className="mt-auto flex items-center justify-between text-xs">
        <span className="text-stone-400">From</span>
        <span className="font-medium text-stone-900 tabular-nums">₦{Number(category.priceFrom).toLocaleString()}</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-400">
        <Clock className="w-3 h-3" />
        <span>{category.leadTime}</span>
      </div>
    </div>
  </Link>
);

// ───────────────────────────────────────────────────────────────────────────
//  Reassurance strip — How-it-works ribbon + trust badges, one calm band
// ───────────────────────────────────────────────────────────────────────────

const ReassuranceStrip = () => {
  const steps = [
    { n: '1', icon: Pencil, title: 'Pick a category', body: 'Choose your garment.' },
    { n: '2', icon: Ruler, title: 'Share your size', body: 'Size chart or exact measurements.' },
    { n: '3', icon: Sparkle, title: 'Pick or upload a style', body: 'Gallery or up to 4 references.' },
    { n: '4', icon: MessageCircle, title: 'Get a quote in 24h', body: 'Pay 50% to begin.' },
  ];
  const trust = [
    { icon: ShieldCheck, label: "Money-back if it doesn't fit" },
    { icon: CheckCircle2, label: 'Free adjustments after delivery' },
    { icon: Clock, label: 'Live updates on WhatsApp' },
    { icon: Phone, label: 'Talk to your tailor anytime' },
  ];

  return (
    <section className="border-t border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-14">
        {/* How it works — inline ribbon */}
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-5">How it works</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-700" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="font-display text-base text-stone-900 leading-tight">{s.title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{s.body}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-stone-100">
          {trust.map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={i} className="flex items-center gap-2.5 text-sm text-stone-700">
                <Icon className="w-5 h-5 text-emerald-700 shrink-0" strokeWidth={1.5} />
                <span>{it.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  Saved measurements — only renders if the user has profiles
// ───────────────────────────────────────────────────────────────────────────

const SavedMeasurements = () => {
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.measurements);
      if (raw) setProfiles(JSON.parse(raw) || []);
    } catch {}
  }, []);

  if (profiles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-14 grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-2">Your measurements</div>
        <h2 className="font-display text-2xl sm:text-3xl text-stone-900 leading-tight mb-3">
          Measure once. <span className="font-display-italic text-emerald-800">Order forever.</span>
        </h2>
        <p className="text-stone-600 leading-relaxed max-w-md text-sm">
          Reuse your saved measurements on every future order. No more re-typing, no more re-measuring.
        </p>
      </div>
      <div className="space-y-3">
        {profiles.slice(0, 3).map((p, i) => (
          <div key={i} className="bg-white border border-stone-200 p-4 rounded-sm flex items-center justify-between">
            <div>
              <div className="font-display text-lg text-stone-900">{p.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">{p.gender} · {Object.keys(p.values || {}).length} measurements</div>
            </div>
            <Bookmark className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />
          </div>
        ))}
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  FAQ — at the bottom, fully collapsed by default
// ───────────────────────────────────────────────────────────────────────────

const FAQ = () => {
  const items = [
    { q: 'How does pricing work?', a: 'Each category shows a starting price. After you submit, a tailor reviews your style and measurements and sends a final quote within 24 hours. Pay 50% deposit to start; balance on delivery.' },
    { q: "What if I can't take my own measurements?", a: 'Use our size chart (S–XL with chest/waist/hip ranges), or select "Have a tailor measure me" at checkout for a free visit within Aba.' },
    { q: 'Can I send a picture of a style I want?', a: 'Yes — the recommended way. Upload up to 4 reference images, or pick from our pre-loaded gallery.' },
    { q: 'How long does it take?', a: 'Typically 5-7 days for a shirt, 7-14 for a senator or dress, 14-21 for an agbada or full suit. Exact date confirmed in your quote.' },
    { q: "What if it doesn't fit?", a: "Free adjustments. If a fix isn't enough, we remake it at no charge — that's the bespoke promise." },
    { q: 'Do you deliver outside Aba?', a: 'Yes — anywhere in Nigeria. Delivery cost is added to your final quote based on your address.' },
  ];
  const [open, setOpen] = useState(-1);
  return (
    <section className="border-t border-stone-200 bg-white">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-2">Questions</div>
        <h2 className="font-display text-2xl sm:text-3xl text-stone-900 mb-6 leading-tight">
          Things people <span className="font-display-italic text-emerald-800">often ask.</span>
        </h2>
        <div className="divide-y divide-stone-200 border-t border-stone-200">
          {items.map((it, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full py-4 flex items-start justify-between gap-6 text-left hover:opacity-70 transition">
                <span className="font-display text-base sm:text-lg text-stone-900 leading-snug">{it.q}</span>
                <span className="shrink-0 mt-1">
                  {open === i ? <Minus className="w-4 h-4 text-emerald-800" strokeWidth={1.5} /> : <Plus className="w-4 h-4 text-stone-400" strokeWidth={1.5} />}
                </span>
              </button>
              {open === i && <div className="pb-4 -mt-1 text-sm text-stone-600 leading-relaxed">{it.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  Final CTA
// ───────────────────────────────────────────────────────────────────────────

const FinalCTA = () => (
  <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-16">
    <div className="relative overflow-hidden bg-stone-900 text-white rounded-lg py-14 sm:py-16 px-6 sm:px-10 text-center">
      <h2 className="font-display text-3xl sm:text-4xl leading-tight mb-3">
        Ready to be <span className="font-display-italic text-emerald-300">measured?</span>
      </h2>
      <p className="text-stone-300 max-w-xl mx-auto mb-7 leading-relaxed text-sm sm:text-base">
        Pick a category, share a few details, and we'll do the rest. No commitment until you accept the quote.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="#categories" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-emerald-500 text-stone-900 rounded-full font-semibold hover:bg-emerald-400 transition group">
          Start an order
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </a>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 border border-white/20 rounded-full font-medium hover:bg-white/10 transition">
          <MessageCircle className="w-4 h-4" />
          WhatsApp us instead
        </a>
      </div>
    </div>
  </section>
);

// ───────────────────────────────────────────────────────────────────────────
//  Floating WhatsApp
// ───────────────────────────────────────────────────────────────────────────

const FloatingWhatsApp = () => (
  <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with a tailor on WhatsApp" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 hover:scale-105 transition-all">
    <MessageCircle className="w-5 h-5" />
    <span className="hidden sm:inline text-sm font-semibold">Chat with a tailor</span>
  </a>
);

// ───────────────────────────────────────────────────────────────────────────
//  Reusable: silhouette SVG
// ───────────────────────────────────────────────────────────────────────────

const CategorySilhouette = ({ path, size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d={path} />
  </svg>
);