import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ruler, Pencil, MessageCircle, ArrowRight, CheckCircle2,
  Clock, ShieldCheck, Sparkles, ChevronRight, Plus, Minus,
  Bookmark, Phone,
} from 'lucide-react';
import { CATEGORIES, STORAGE_KEYS, WHATSAPP_NUMBER } from './CustomDesignData';

// ═══════════════════════════════════════════════════════════════════════════
//  CustomDesignPage  ·  /custom
//  Landing page. Browse categories → start an order.
// ═══════════════════════════════════════════════════════════════════════════

const CustomDesignPage = () => {
  return (
    <div className="custom-root min-h-screen bg-[#faf7f2] text-stone-900">
      <FontInjector />
      <ResumeDraftBanner />
      <Hero />
      <CategoryGrid />
      <HowItWorks />
      <TrustBar />
      <SavedMeasurements />
      <FAQ />
      <FinalCTA />
    </div>
  );
};

export default CustomDesignPage;

// ───────────────────────────────────────────────────────────────────────────
//  Font + base CSS
// ───────────────────────────────────────────────────────────────────────────

const FontInjector = () => {
  useEffect(() => {
    if (document.getElementById('custom-fonts')) return;
    const link = document.createElement('link');
    link.id = 'custom-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);

    if (document.getElementById('custom-styles')) return;
    const style = document.createElement('style');
    style.id = 'custom-styles';
    style.textContent = `
      .custom-root { font-family: 'DM Sans', system-ui, sans-serif; }
      .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
      .font-display-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-variation-settings: 'SOFT' 100; }
      @keyframes float-slow { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
      .float-slow { animation: float-slow 6s ease-in-out infinite; }
      @keyframes fade-up { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform:translateY(0); } }
      .fade-up { animation: fade-up .6s ease-out both; }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

// ───────────────────────────────────────────────────────────────────────────
//  Resume draft banner (if user has an in-progress order)
// ───────────────────────────────────────────────────────────────────────────

const ResumeDraftBanner = () => {
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.draft);
      if (!raw) return;
      const d = JSON.parse(raw);
      // only show if recent (within 14 days)
      if (d?.savedAt && Date.now() - d.savedAt < 14 * 24 * 60 * 60 * 1000) setDraft(d);
    } catch {}
  }, []);
  if (!draft) return null;
  const cat = CATEGORIES.find((c) => c.id === draft.categoryId);
  if (!cat) return null;
  return (
    <div className="bg-gradient-to-r from-emerald-700 to-green-800 text-emerald-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-3 text-sm">
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
//  Hero
// ───────────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className="relative overflow-hidden border-b border-stone-200">
    {/* Background ornaments */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 opacity-[0.06] float-slow">
        <CategorySilhouette path={CATEGORIES[0].silhouette} size={180} />
      </div>
      <div className="absolute top-40 right-16 opacity-[0.05] float-slow" style={{ animationDelay: '2s' }}>
        <CategorySilhouette path={CATEGORIES[7].silhouette} size={220} />
      </div>
      <div className="absolute bottom-20 left-1/3 opacity-[0.04] float-slow" style={{ animationDelay: '4s' }}>
        <CategorySilhouette path={CATEGORIES[3].silhouette} size={160} />
      </div>
    </div>

    <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
      <div className="max-w-3xl fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/5 border border-emerald-900/10 text-xs uppercase tracking-[0.18em] text-emerald-900 mb-8">
          <Sparkles className="w-3 h-3" />
          <span>Made-to-Measure</span>
        </div>
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-stone-900 mb-6">
          Tailored in Aba.
          <br />
          <span className="font-display-italic text-emerald-800">Made for you.</span>
        </h1>
        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl leading-relaxed mb-10">
          Pick a category, share your measurements (or use our size guide), choose a style — or send us your own inspiration. We quote within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="#categories"
            className="inline-flex items-center gap-2 px-7 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-emerald-900 transition group"
          >
            Browse Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-4 bg-white border border-stone-300 rounded-full font-medium hover:bg-stone-50 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            Chat with a tailor
          </a>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-16 max-w-2xl">
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
    <div className="font-display text-3xl sm:text-4xl text-stone-900 leading-none mb-2">{n}</div>
    <div className="text-xs uppercase tracking-[0.15em] text-stone-500">{label}</div>
  </div>
);

// ───────────────────────────────────────────────────────────────────────────
//  Category grid
// ───────────────────────────────────────────────────────────────────────────

const CategoryGrid = () => {
  const [filter, setFilter] = useState('all'); // all | men | women | unisex
  const filtered = CATEGORIES.filter((c) =>
    filter === 'all' ? true : c.gender === filter || c.gender === 'unisex',
  );

  return (
    <section id="categories" className="py-20 sm:py-28 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">01 — Choose</div>
            <h2 className="font-display text-4xl sm:text-5xl text-stone-900 max-w-xl leading-tight">
              What would you like <span className="font-display-italic text-emerald-800">made?</span>
            </h2>
          </div>
          <div className="flex gap-1 p-1 bg-stone-100 rounded-full self-start sm:self-end">
            {[
              { id: 'all', label: 'All' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'unisex', label: 'Unisex' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === f.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoryCard = ({ category }) => (
  <Link
    to={`/custom/order/${category.id}`}
    className="group relative overflow-hidden bg-white border border-stone-200 hover:border-stone-900 transition-all duration-300 rounded-sm flex flex-col"
  >
    {/* Visual */}
    <div
      className="relative aspect-[3/4] overflow-hidden flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${category.accent}10 0%, ${category.accent}05 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)',
        }}
      />
      <div className="relative transition-transform duration-700 group-hover:scale-110" style={{ color: category.accent }}>
        <CategorySilhouette path={category.silhouette} size={140} />
      </div>
      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.15em] text-stone-700 rounded-sm">
        {category.gender}
      </div>
      <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/0 group-hover:bg-stone-900 flex items-center justify-center transition-all duration-300">
        <ArrowRight className="w-4 h-4 text-stone-900 group-hover:text-white transition-colors" />
      </div>
    </div>

    {/* Info */}
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-display text-2xl text-stone-900 leading-tight mb-1">{category.name}</h3>
      <p className="text-xs text-stone-500 mb-4 line-clamp-2">{category.tagline}</p>
      <div className="mt-auto flex items-center justify-between text-xs">
        <span className="text-stone-400">From</span>
        <span className="font-medium text-stone-900 tabular-nums">
          ₦{category.priceFrom.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-400">
        <Clock className="w-3 h-3" />
        <span>{category.leadTime}</span>
      </div>
    </div>
  </Link>
);

// ───────────────────────────────────────────────────────────────────────────
//  How it works
// ───────────────────────────────────────────────────────────────────────────

const HowItWorks = () => {
  const steps = [
    {
      n: '01',
      icon: Pencil,
      title: 'Pick your category',
      body: 'Agbada, suit, dress, jumpsuit — find your garment from our 11 categories.',
    },
    {
      n: '02',
      icon: Ruler,
      title: 'Share your size',
      body: 'Use our size chart or enter exact measurements. Each field has a how-to-measure guide.',
    },
    {
      n: '03',
      icon: Sparkles,
      title: 'Choose or upload a style',
      body: 'Pick from our gallery or upload up to 4 reference images of the look you want.',
    },
    {
      n: '04',
      icon: MessageCircle,
      title: "We'll quote within 24h",
      body: 'A tailor reviews your order and sends you a final quote via WhatsApp. Pay 50% to start.',
    },
  ];
  return (
    <section className="bg-white border-y border-stone-200 py-20 sm:py-28 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">How it works</div>
          <h2 className="font-display text-4xl sm:text-5xl text-stone-900 max-w-2xl leading-tight">
            Four small steps. <span className="font-display-italic text-emerald-800">One perfect fit.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-stone-200 border border-stone-200">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="bg-white p-8 hover:bg-stone-50 transition group">
                <div className="flex items-start justify-between mb-8">
                  <div className="font-display text-5xl text-stone-200 group-hover:text-emerald-200 transition">{s.n}</div>
                  <Icon className="w-6 h-6 text-emerald-800" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl text-stone-900 mb-2 leading-tight">{s.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  Trust bar
// ───────────────────────────────────────────────────────────────────────────

const TrustBar = () => {
  const items = [
    { icon: ShieldCheck, label: 'Money-back if it doesn\'t fit' },
    { icon: CheckCircle2, label: 'Free adjustments after delivery' },
    { icon: Clock, label: 'Live order updates on WhatsApp' },
    { icon: Phone, label: 'Talk to your tailor anytime' },
  ];
  return (
    <section className="py-14 px-5 sm:px-8 bg-[#faf7f2]">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} className="flex items-center gap-3 text-sm text-stone-700">
              <Icon className="w-5 h-5 text-emerald-700 shrink-0" strokeWidth={1.5} />
              <span>{it.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  Saved measurements wallet
// ───────────────────────────────────────────────────────────────────────────

const SavedMeasurements = () => {
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.measurements);
      if (raw) setProfiles(JSON.parse(raw) || []);
    } catch {}
  }, []);

  return (
    <section className="py-20 sm:py-24 px-5 sm:px-8 border-t border-stone-200">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">Your measurements</div>
          <h2 className="font-display text-4xl sm:text-5xl text-stone-900 leading-tight mb-5">
            Measure once. <br />
            <span className="font-display-italic text-emerald-800">Order forever.</span>
          </h2>
          <p className="text-stone-600 leading-relaxed mb-6 max-w-md">
            Save your measurements with a name (Work, Wedding, Mom, Dad…) and reuse them on every future order. No more re-typing, no more re-measuring.
          </p>
          {profiles.length === 0 && (
            <p className="text-sm text-stone-500">
              You haven't saved any measurements yet. Start an order to save your first profile.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {profiles.length > 0 ? (
            profiles.slice(0, 3).map((p, i) => (
              <div key={i} className="bg-white border border-stone-200 p-5 rounded-sm flex items-center justify-between">
                <div>
                  <div className="font-display text-xl text-stone-900">{p.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {p.gender} · {Object.keys(p.values || {}).length} measurements
                  </div>
                </div>
                <Bookmark className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />
              </div>
            ))
          ) : (
            <div className="bg-stone-100 border border-dashed border-stone-300 rounded-sm p-10 text-center">
              <Ruler className="w-8 h-8 text-stone-400 mx-auto mb-3" strokeWidth={1.5} />
              <div className="text-sm text-stone-500">No saved profiles yet</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ───────────────────────────────────────────────────────────────────────────
//  FAQ
// ───────────────────────────────────────────────────────────────────────────

const FAQ = () => {
  const items = [
    {
      q: 'How does pricing work?',
      a: 'Each category shows a starting price. Once you submit your order, a tailor reviews your style and measurements and sends you a final quote within 24 hours. To start production, you pay 50% deposit; the balance is paid on delivery.',
    },
    {
      q: 'What if I don\'t know how to take my own measurements?',
      a: 'Two options: use our size chart (S, M, L, XL with corresponding chest/waist/hip ranges), or book a free home/shop visit by selecting "Have a tailor measure me" during checkout — we\'ll come to you within Aba.',
    },
    {
      q: 'Can I send a picture of a style I want?',
      a: 'Absolutely — that\'s the recommended way. You can upload up to 4 reference images (Pinterest, Instagram, magazine cuts, anything). You can also pick from our pre-loaded style gallery if you don\'t have a reference.',
    },
    {
      q: 'How long does it take?',
      a: 'Lead times vary by category — typically 5-7 days for a shirt, 7-14 days for a senator or dress, and 14-21 days for an agbada or full suit. The exact date is confirmed in your quote.',
    },
    {
      q: 'What if it doesn\'t fit?',
      a: 'Free adjustments. If a fix isn\'t enough, we\'ll remake it at no charge — that\'s the bespoke promise.',
    },
    {
      q: 'Do you deliver outside Aba?',
      a: 'Yes — anywhere in Nigeria. Delivery cost is added to your final quote based on your address.',
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white border-y border-stone-200 py-20 sm:py-28 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">Questions</div>
        <h2 className="font-display text-4xl sm:text-5xl text-stone-900 mb-12 leading-tight">
          Things people <span className="font-display-italic text-emerald-800">often ask.</span>
        </h2>
        <div className="divide-y divide-stone-200 border-t border-stone-200">
          {items.map((it, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full py-6 flex items-start justify-between gap-6 text-left hover:opacity-70 transition"
              >
                <span className="font-display text-xl text-stone-900 leading-snug">{it.q}</span>
                <span className="shrink-0 mt-1">
                  {open === i ? (
                    <Minus className="w-5 h-5 text-emerald-800" strokeWidth={1.5} />
                  ) : (
                    <Plus className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                  )}
                </span>
              </button>
              {open === i && (
                <div className="pb-6 -mt-2 text-stone-600 leading-relaxed max-w-3xl">{it.a}</div>
              )}
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
  <section className="relative overflow-hidden bg-stone-900 text-white py-24 sm:py-32 px-5 sm:px-8">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <pattern id="cta-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="0.5" fill="white" />
        </pattern>
        <rect width="100" height="100" fill="url(#cta-pattern)" />
      </svg>
    </div>
    <div className="relative max-w-4xl mx-auto text-center">
      <h2 className="font-display text-5xl sm:text-7xl leading-[0.95] mb-6">
        Ready to be <span className="font-display-italic text-emerald-300">measured?</span>
      </h2>
      <p className="text-lg text-stone-300 max-w-xl mx-auto mb-10 leading-relaxed">
        Pick a category, share a few details, and we'll do the rest. No commitment until you accept the quote.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="#categories"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 text-stone-900 rounded-full font-semibold hover:bg-emerald-400 transition group"
        >
          Start an order
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/20 rounded-full font-medium hover:bg-white/10 transition"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp us instead
        </a>
      </div>
    </div>
  </section>
);

// ───────────────────────────────────────────────────────────────────────────
//  Reusable: silhouette SVG
// ───────────────────────────────────────────────────────────────────────────

const CategorySilhouette = ({ path, size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d={path} />
  </svg>
);