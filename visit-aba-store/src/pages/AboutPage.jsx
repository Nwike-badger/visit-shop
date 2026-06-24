import { Link } from 'react-router-dom';
import {
  ChevronRight, ArrowRight, MapPin, Star, Heart,
  Shield, Truck, Scissors, Package,
} from 'lucide-react';

/* ─── Data ───────────────────────────────────────────────────────────── */
const STATS = [
  { value: '500+',  label: 'Products Listed' },
  { value: '36',    label: 'States Delivered To' },
  { value: '100%',  label: 'Made in Aba' },
  { value: '24/7',  label: 'Customer Support' },
];

const CATEGORIES = [
  {
    emoji: '👞',
    label: 'Leather Shoes',
    desc:  "Handcrafted men's and women's footwear from Aba's finest cobblers.",
  },
  {
    emoji: '👜',
    label: 'Bags & Belts',
    desc:  'Genuine leather bags, wallets, and belts built to last for years.',
  },
  {
    emoji: '👗',
    label: 'Clothing & Natives',
    desc:  'Ready-to-wear Nigerian fashion, agbadas, and traditional attire.',
  },
  {
    emoji: '✂️',
    label: 'Custom Orders',
    desc:  'Bespoke clothing sewn to your exact measurements and personal style.',
  },
];

const VALUES = [
  {
    Icon:  Star,
    title: 'Authentic Quality',
    desc:  'Every product is sourced directly from skilled Aba artisans and verified manufacturers — no counterfeits, no shortcuts.',
  },
  {
    Icon:  Heart,
    title: 'Supporting Local',
    desc:  "When you shop with us, you invest directly in Nigerian craftsmanship and the families behind every piece.",
  },
  {
    Icon:  Shield,
    title: 'Trusted & Secure',
    desc:  'Secure payments via Paystack, clear policies, and a team that stands fully behind every order placed.',
  },
  {
    Icon:  Truck,
    title: 'Nationwide Reach',
    desc:  'From Lagos to Kano, Port Harcourt to Abuja — authentic Aba products delivered to every corner of Nigeria.',
  },
];

const STORY_CARDS = [
  {
    dark:  false,
    bg:    'bg-green-50 border border-green-100',
    emoji: '🏭',
    title: 'Ariaria Market',
    sub:   "Africa's largest market for locally manufactured goods",
  },
  {
    dark:  true,
    bg:    'bg-gray-900',
    emoji: '✂️',
    title: 'Custom Made',
    sub:   'Sewn to your exact measurements and style',
  },
  {
    dark:  true,
    bg:    'bg-green-600',
    emoji: '🚚',
    title: 'Nationwide',
    sub:   'Delivered to all 36 states across Nigeria',
  },
  {
    dark:  false,
    bg:    'bg-amber-50 border border-amber-100',
    emoji: '⭐',
    title: 'Quality First',
    sub:   'Verified products from trusted Aba manufacturers',
  },
];

/* ─── Page ───────────────────────────────────────────────────────────── */
const AboutPage = () => (
  <div className="min-h-screen bg-gray-50">

    {/* ══ HERO ══════════════════════════════════════════════════════════ */}
    <div className="relative bg-gray-900 text-white py-16 sm:py-24 px-4 overflow-hidden">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-500 opacity-[0.06] blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-400 opacity-[0.07] blur-3xl" />
      </div>

      <div className="relative max-w-[1440px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-200">About Us</span>
        </nav>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-xs font-bold mb-6">
          <MapPin size={12} /> Proudly Made in Aba, Nigeria
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-5 max-w-3xl">
          Nigeria's finest,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
            delivered to you.
          </span>
        </h1>

        <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl mb-10">
          ExploreAba connects you to the best of Aba's world-class craftsmanship — from handcrafted
          leather goods and fashion to fully custom-made clothing — delivered nationwide.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-900/40"
          >
            Shop Now <ArrowRight size={16} />
          </Link>
          <Link
            to="/custom"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-all"
          >
            <Scissors size={15} /> Order Custom
          </Link>
        </div>
      </div>
    </div>

    {/* ══ STATS BAR ═════════════════════════════════════════════════════ */}
    <div className="bg-green-600 text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl sm:text-4xl font-black">{value}</p>
              <p className="text-green-100 text-sm font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ══ MAIN CONTENT ══════════════════════════════════════════════════ */}
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 space-y-20">

      {/* ── OUR STORY ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-green-600">Our Story</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-6 leading-tight">
            Born from a belief in Nigerian excellence
          </h2>
          <div className="space-y-4 text-gray-600 text-[15px] leading-relaxed">
            <p>
              Aba has been Nigeria's manufacturing heartbeat for decades. From the leather workshops of
              Ariaria International Market to the tailoring studios dotted across the city, Aba's artisans
              have long produced goods that rival international brands in quality — yet struggled to reach
              buyers across Nigeria.
            </p>
            <p>
              ExploreAba was created to change that. We built a platform where the best of Aba's
              craftsmanship — leather shoes, bags, clothing, and custom fashion — can reach anyone,
              anywhere in Nigeria, with trust, transparency, and convenience.
            </p>
            <p>
              We are more than a marketplace. We are a bridge between the skilled hands that make these
              goods and the customers who deserve to own them.
            </p>
          </div>
        </div>

        {/* Story cards grid */}
        <div className="grid grid-cols-2 gap-4">
          {STORY_CARDS.map(({ dark, bg, emoji, title, sub }) => (
            <div key={title} className={`p-5 rounded-2xl ${bg}`}>
              <span className="text-2xl mb-3 block">{emoji}</span>
              <p className={`font-bold text-sm mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
              <p className={`text-xs leading-snug ${dark ? 'text-white/70' : 'text-gray-500'}`}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT WE OFFER ─────────────────────────────────────────── */}
      <div>
        <div className="text-center mb-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-green-600">What We Offer</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Aba made, for you</h2>
          <p className="text-gray-500 text-sm mt-3 max-w-md mx-auto">
            Four pillars of what Aba does best — all available to order online and delivered to your door.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map(({ emoji, label, desc }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-green-200 hover:shadow-md transition-all group cursor-default"
            >
              <span className="text-3xl block mb-4">{emoji}</span>
              <p className="font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{label}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── OUR VALUES ────────────────────────────────────────────── */}
      <div>
        <div className="text-center mb-10">
          <span className="text-[11px] font-black uppercase tracking-widest text-green-600">Our Values</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">What we stand for</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1.5">{title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── THE ABA ADVANTAGE (dark band) ─────────────────────── */}
      <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-green-500 opacity-[0.06] blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-2xl">
          <span className="text-[11px] font-black uppercase tracking-widest text-green-400">The Aba Advantage</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2 mb-5 leading-tight">
            Why Aba is Nigeria's manufacturing capital
          </h2>
          <div className="space-y-4 text-gray-300 text-[15px] leading-relaxed">
            <p>
              Aba, in Abia State, is home to Ariaria International Market — one of Africa's largest markets
              for locally manufactured goods. With over 100,000 artisans and manufacturers operating in the
              city, Aba produces an extraordinary range of products: leather shoes, bags, clothing, furniture,
              cosmetics, and more.
            </p>
            <p>
              Aba-made shoes and leather goods are known throughout West Africa for their durability and
              craftsmanship. The city's tailors have dressed generations of Nigerians in beautiful native wear
              and bespoke fashion. Yet for too long, Aba's products have been underrepresented online.
            </p>
            <p className="text-green-300 font-semibold">
              ExploreAba exists to change that narrative — one delivery at a time.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <div className="text-center py-6">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Ready to explore?</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          Browse hundreds of authentic Aba-made products, or place a custom order — made exactly to your
          measurements and style.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-green-200"
          >
            <Package size={16} /> Browse Products
          </Link>
          <Link
            to="/custom"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-green-300 text-gray-900 font-bold rounded-xl text-sm transition-all"
          >
            <Scissors size={16} /> Order Custom
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-green-300 text-gray-900 font-bold rounded-xl text-sm transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>

    </div>
  </div>
);

export default AboutPage;