'use client';

import React, {
  useState, useEffect, useMemo, useRef, useCallback,
} from 'react';
import {
  Star, StarHalf, Minus, Plus, ShoppingBag, CheckCircle,
  AlertTriangle, Heart, Share2, Truck, RotateCcw, ChevronDown,
  Shield, Zap,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

/* ═══════════════════════════════════════════════════════════════
   FONT + CSS INJECTION
   Injected once into <head> — safe to re-render many times.
═══════════════════════════════════════════════════════════════ */
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap';

const INJECTED_CSS = `
  /* ── root vars ── */
  .pi {
    --c-ink:     #0b0b0b;
    --c-ink2:    #444;
    --c-ink3:    #888;
    --c-border:  #e8e5e1;
    --c-surface: #f9f8f6;
    --c-green:   #16a34a;
    --c-green-l: #dcfce7;
    --c-amber:   #d97706;
    --c-red:     #dc2626;
    --c-red-l:   #fee2e2;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: var(--c-ink);
  }
  .pi *, .pi *::before, .pi *::after { box-sizing: border-box; }
  .pi-serif { font-family: 'Playfair Display', Georgia, serif; }

  /* ── keyframes ── */
  @keyframes pi-fade-up {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes pi-spin { to { transform:rotate(360deg); } }
  @keyframes pi-pop {
    0%   { transform:scale(1);    }
    45%  { transform:scale(1.22); }
    100% { transform:scale(1);    }
  }
  @keyframes pi-bar-in {
    from { transform:translateY(100%); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
  }
  @keyframes pi-bar-out {
    from { transform:translateY(0);    opacity:1; }
    to   { transform:translateY(100%); opacity:0; }
  }
  @keyframes pi-toast-in {
    from { transform:translate(-50%,12px); opacity:0; }
    to   { transform:translate(-50%,0);    opacity:1; }
  }

  .pi-fade-up { animation: pi-fade-up .38s ease both; }

  /* ── swatch ── */
  .pi-swatch {
    position:relative; border-radius:50%;
    cursor:pointer; flex-shrink:0;
    transition: transform .2s cubic-bezier(.34,1.56,.64,1),
                box-shadow .15s;
    display:flex; align-items:center; justify-content:center;
  }
  .pi-swatch:hover:not(.pi-swatch--off)  { transform:scale(1.1); }
  .pi-swatch--on  { transform:scale(1.14)!important; box-shadow:0 0 0 2px #fff,0 0 0 3.5px var(--c-ink); }
  .pi-swatch--off { opacity:.28; cursor:not-allowed; }

  /* ── pill ── */
  .pi-pill {
    position:relative; cursor:pointer; white-space:nowrap;
    border-radius:10px; border:1.5px solid var(--c-border);
    background:#fff; color:var(--c-ink2);
    font-family:'DM Sans',system-ui,sans-serif;
    font-weight:600; font-size:12px; letter-spacing:.04em;
    padding:9px 18px;
    transition:border-color .14s,background .14s,color .14s;
  }
  .pi-pill:hover:not(.pi-pill--off) { border-color:var(--c-ink); color:var(--c-ink); background:var(--c-surface); }
  .pi-pill--on  { border-color:var(--c-ink); background:var(--c-ink); color:#fff; }
  .pi-pill--off { opacity:.3; cursor:not-allowed;
    text-decoration:line-through; text-decoration-color:#aaa; }

  /* ── accordion ── */
  .pi-acc-body {
    overflow:hidden;
    transition:max-height .36s cubic-bezier(.4,0,.2,1), opacity .25s;
  }
  .pi-acc-body--open   { max-height:1000px; opacity:1; }
  .pi-acc-body--closed { max-height:0;      opacity:0; }

  /* ── ATC button ── */
  .pi-atc {
    position:relative; overflow:hidden;
    transition:transform .15s, box-shadow .15s, background .25s;
  }
  .pi-atc:not(:disabled):hover  { transform:translateY(-1px); box-shadow:0 8px 26px rgba(11,11,11,.22); }
  .pi-atc:not(:disabled):active { transform:translateY(0); }
  .pi-atc::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(rgba(255,255,255,.07),transparent);
    pointer-events:none;
  }

  /* ── sticky bar ── */
  .pi-bar {
    position:fixed; bottom:0; left:0; right:0; z-index:999;
    background:#fff;
    border-top:1px solid var(--c-border);
    padding:10px 16px;
    padding-bottom: max(14px, env(safe-area-inset-bottom));
    box-shadow:0 -6px 24px rgba(0,0,0,.07);
  }
  .pi-bar--in  { animation:pi-bar-in  .3s cubic-bezier(.22,1,.36,1) both; }
  .pi-bar--out { animation:pi-bar-out .22s ease both; pointer-events:none; }

  /* hide sticky bar on md+ */
  @media (min-width:768px) { .pi-bar { display:none!important; } }
  /* compensate page scroll area on mobile */
  @media (max-width:767px) { .pi-page-pad { padding-bottom:80px; } }

  /* ── qty stepper ── */
  .pi-qty-btn {
    width:40px; height:100%;
    display:flex; align-items:center; justify-content:center;
    background:none; border:none; cursor:pointer;
    color:var(--c-ink2); transition:color .12s, background .12s;
  }
  .pi-qty-btn:hover:not(:disabled) { color:var(--c-ink); background:var(--c-surface); }
  .pi-qty-btn:disabled { opacity:.35; cursor:not-allowed; }

  /* ── stock bar fill ── */
  .pi-stock-fill {
    height:100%; border-radius:99px;
    transition:width .8s cubic-bezier(.4,0,.2,1);
  }

  /* ── spinner ── */
  .pi-spin { animation:pi-spin .7s linear infinite; border-radius:50%; }

  /* ── wish pop ── */
  .pi-pop { animation:pi-pop .28s cubic-bezier(.36,.07,.19,.97) both; }

  /* ── toast ── */
  .pi-toast {
    position:fixed; left:50%; z-index:1001; white-space:nowrap;
    background:#111; color:#fff;
    padding:10px 22px; border-radius:99px;
    font-family:'DM Sans',system-ui,sans-serif;
    font-size:13px; font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,.22);
    pointer-events:none;
    transition:opacity .25s, transform .25s;
  }
  .pi-toast--vis  {
    bottom:90px; opacity:1;
    transform:translate(-50%,0);
    animation:pi-toast-in .3s cubic-bezier(.22,1,.36,1) both;
  }
  .pi-toast--hide { bottom:90px; opacity:0; transform:translate(-50%,10px); }

  /* ── trust pill ── */
  .pi-trust {
    display:flex; align-items:center; gap:8px;
    padding:10px 14px;
    background:var(--c-surface);
    border:1px solid var(--c-border);
    border-radius:12px;
  }
`;

function injectAssets() {
  if (typeof document === 'undefined') return;
  if (!document.querySelector('[data-pi-font]')) {
    const link = Object.assign(document.createElement('link'), {
      rel: 'stylesheet', href: FONT_URL,
    });
    link.setAttribute('data-pi-font', '1');
    document.head.appendChild(link);
  }
  if (!document.querySelector('[data-pi-css]')) {
    const style = document.createElement('style');
    style.setAttribute('data-pi-css', '1');
    style.textContent = INJECTED_CSS;
    document.head.appendChild(style);
  }
}

/* ═══════════════════════════════════════════════════════════════
   COLOR UTILITIES
═══════════════════════════════════════════════════════════════ */
const COLOR_MAP = {
  black:'#0a0a0a', white:'#ffffff', red:'#ef4444', blue:'#3b82f6',
  green:'#22c55e', yellow:'#facc15', orange:'#f97316', purple:'#a855f7',
  pink:'#ec4899', brown:'#92400e', grey:'#9ca3af', gray:'#9ca3af',
  beige:'#d4b896', cream:'#fffdd0', ivory:'#fffff0', tan:'#d2b48c',
  navy:'#1e3a5f', maroon:'#800000', burgundy:'#800020', wine:'#722f37',
  coral:'#ff6b6b', salmon:'#fa8072', peach:'#ffcba4', mint:'#98ff98',
  teal:'#14b8a6', cyan:'#06b6d4', indigo:'#6366f1', violet:'#8b5cf6',
  lavender:'#e6e6fa', lilac:'#c8a2c8', magenta:'#ff00ff', fuchsia:'#d946ef',
  gold:'#fbbf24', silver:'#94a3b8', bronze:'#cd7f32', copper:'#b87333',
  'off-white':'#faf9f6','off white':'#faf9f6','sky blue':'#87ceeb',
  'baby blue':'#89cff0','royal blue':'#4169e1','light blue':'#add8e6',
  'dark blue':'#00008b','light green':'#90ee90','dark green':'#006400',
  'olive green':'#6b8e23', olive:'#808000','forest green':'#228b22',
  khaki:'#c3b091', camel:'#c19a6b', mustard:'#e1ad01', lemon:'#fff44f',
  lime:'#84cc16','rose gold':'#b76e79', nude:'#e8c5a0', blush:'#f4c2c2',
  charcoal:'#36454f', slate:'#708090','ash grey':'#b2beb5', ash:'#b2beb5',
  denim:'#1560bd','cherry red':'#dc143c', scarlet:'#ff2400', crimson:'#dc143c',
  emerald:'#50c878', turquoise:'#40e0d0', aqua:'#00ffff', cobalt:'#0047ab',
  chocolate:'#7b3f00', mocha:'#967969', coffee:'#6f4e37','off-black':'#0d0d0d',
  multicolor:'linear-gradient(135deg,#f43f5e,#f97316,#facc15,#4ade80,#3b82f6,#a855f7)',
  multi:'linear-gradient(135deg,#f43f5e,#f97316,#facc15,#4ade80,#3b82f6,#a855f7)',
  pattern:'repeating-linear-gradient(45deg,#e5e7eb 0,#e5e7eb 4px,#fff 0,#fff 8px)',
  print:'repeating-linear-gradient(45deg,#fde68a 0,#fde68a 4px,#fff 0,#fff 8px)',
};

const resolveColor = (v) => {
  const key = v.toLowerCase().trim();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  try {
    const el = document.createElement('div');
    el.style.color = key;
    document.body.appendChild(el);
    const c = window.getComputedStyle(el).color;
    document.body.removeChild(el);
    if (c && c !== 'rgba(0, 0, 0, 0)') return key;
  } catch {}
  return null;
};

const isColorAttr = (n) => /colou?r|shade|hue|tint|finish/i.test(n);

const luminance = (css) => {
  if (!css || css.includes('gradient')) return 0;
  try {
    const c = css.replace('#','');
    if (c.length !== 6) return 0;
    return (parseInt(c.slice(0,2),16)*299 + parseInt(c.slice(2,4),16)*587 + parseInt(c.slice(4,6),16)*114)/1000;
  } catch { return 0; }
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* Stars ──────────────────────────────────── */
const Stars = ({ rating = 0, count = 0 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.4;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ display:'flex', gap:2 }}>
        {[...Array(5)].map((_,i) => (
          <span key={i}>
            {i < full
              ? <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
              : i === full && half
                ? <StarHalf size={12} fill="#f59e0b" stroke="#f59e0b" />
                : <Star size={12} fill="none" stroke="#ddd" />}
          </span>
        ))}
      </div>
      {count > 0 && (
        <span style={{ fontSize:11, color:'#888', fontWeight:500 }}>
          {rating.toFixed(1)} · {count.toLocaleString()} reviews
        </span>
      )}
    </div>
  );
};

/* Spinner ────────────────────────────────── */
const Spinner = ({ size = 15, color = 'rgba(255,255,255,.35)', tip = '#fff' }) => (
  <div className="pi-spin" style={{
    width:size, height:size,
    border:`2px solid ${color}`,
    borderTopColor:tip,
  }} />
);

/* Color Swatch ───────────────────────────── */
const ColorSwatch = ({ value, isSelected, isUnavailable, onClick }) => {
  const css  = resolveColor(value) || '#e5e7eb';
  const lum  = luminance(css);
  const lite = ['white','ivory','cream','off-white','off white','lemon'];
  const needsBorder = lite.includes(value.toLowerCase().trim());
  const checkDark   = lum > 180 || css.includes('gradient');

  return (
    <button
      onClick={onClick}
      disabled={isUnavailable}
      title={value}
      className={`pi-swatch ${isSelected ? 'pi-swatch--on' : ''} ${isUnavailable ? 'pi-swatch--off' : ''}`}
      style={{
        width:38, height:38,
        background:css,
        border: needsBorder ? '1.5px solid #ddd' : 'none',
      }}
    >
      {isUnavailable && (
        <div style={{ position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden' }}>
          <div style={{
            position:'absolute', top:'50%', left:'-10%', right:'-10%',
            height:1.5, background:'rgba(80,80,80,.55)',
            transform:'rotate(45deg) translateY(-50%)',
          }} />
        </div>
      )}
      {isSelected && !isUnavailable && (
        <CheckCircle size={13} strokeWidth={2.5} color={checkDark ? '#fff' : '#111'} />
      )}
    </button>
  );
};

/* Variant Pill ───────────────────────────── */
const VariantPill = ({ value, isSelected, isUnavailable, onClick }) => (
  <button
    onClick={onClick}
    disabled={isUnavailable}
    className={`pi-pill ${isSelected ? 'pi-pill--on' : ''} ${isUnavailable ? 'pi-pill--off' : ''}`}
  >
    {value}
  </button>
);

/* Accordion Section ──────────────────────── */
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop:'1px solid var(--c-border)' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width:'100%', display:'flex', alignItems:'center',
          justifyContent:'space-between', padding:'15px 0',
          background:'none', border:'none', cursor:'pointer',
        }}
      >
        <span style={{
          fontSize:10, fontWeight:700, letterSpacing:'.14em',
          textTransform:'uppercase', color:'var(--c-ink3)',
        }}>
          {title}
        </span>
        <ChevronDown
          size={14} color="var(--c-ink3)"
          style={{ transition:'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div className={`pi-acc-body ${open ? 'pi-acc-body--open' : 'pi-acc-body--closed'}`}>
        <div style={{ paddingBottom:18 }}>{children}</div>
      </div>
    </div>
  );
};

/* Toast ──────────────────────────────────── */
const Toast = ({ message, visible }) => (
  <div className={`pi-toast ${visible ? 'pi-toast--vis' : 'pi-toast--hide'}`}>
    {message}
  </div>
);

/* Sticky Mobile ATC Bar ──────────────────── */
const StickyBar = ({
  price, onAddToCart, cartState, isOutOfStock, canAddToCart,
  quantity, setQuantity, currentStock, show,
}) => {
  const [everShown, setEverShown] = useState(false);
  useEffect(() => { if (show) setEverShown(true); }, [show]);
  if (!everShown) return null;

  const bg = isOutOfStock ? '#e0e0e0'
    : cartState === 'success' ? 'var(--c-green)'
    : cartState === 'error'   ? 'var(--c-red)'
    : 'var(--c-ink)';

  return (
    <div className={`pi-bar ${show ? 'pi-bar--in' : 'pi-bar--out'}`}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {/* Qty stepper */}
        <div style={{
          display:'flex', alignItems:'center', height:46,
          border:'1.5px solid var(--c-border)', borderRadius:12,
          overflow:'hidden', flexShrink:0,
          opacity: canAddToCart ? 1 : 0.4,
          pointerEvents: canAddToCart ? 'auto' : 'none',
        }}>
          <button className="pi-qty-btn" onClick={() => setQuantity(q => Math.max(1,q-1))} disabled={quantity<=1}>
            <Minus size={13} />
          </button>
          <span style={{ width:28, textAlign:'center', fontWeight:800, fontSize:14, fontVariantNumeric:'tabular-nums' }}>
            {quantity}
          </span>
          <button className="pi-qty-btn" onClick={() => setQuantity(q => Math.min(currentStock,q+1))} disabled={quantity>=currentStock}>
            <Plus size={13} />
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={onAddToCart}
          disabled={!canAddToCart || cartState === 'loading'}
          className="pi-atc"
          style={{
            flex:1, height:46, borderRadius:12, border:'none', cursor:'pointer',
            fontFamily:'DM Sans,system-ui,sans-serif',
            fontWeight:800, fontSize:11, letterSpacing:'.09em', textTransform:'uppercase',
            display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            background: bg, color: isOutOfStock ? '#999' : '#fff',
          }}
        >
          {isOutOfStock           ? 'Out of Stock'
            : cartState==='loading' ? <><Spinner size={13}/> Adding…</>
            : cartState==='success' ? <><CheckCircle size={14}/> Added!</>
            : cartState==='error'   ? 'Failed — retry'
            : <><ShoppingBag size={14}/> Add to Cart · ₦{Number(price||0).toLocaleString()}</>}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN — ProductInfo
═══════════════════════════════════════════════════════════════ */
const ProductInfo = ({ product }) => {
  useEffect(() => { injectAssets(); }, []);

  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity]     = useState(1);
  const [cartState, setCartState]   = useState('idle');
  const [wished, setWished]         = useState(false);
  const [wishToast, setWishToast]   = useState(false);
  const [wishMsg, setWishMsg]       = useState('');
  const [showBar, setShowBar]       = useState(false);
  const atcRef = useRef(null);

  /* ── IntersectionObserver: show sticky bar when ATC scrolls out ── */
  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setShowBar(!e.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── derived variant data ── */
  const activeVariants = useMemo(
    () => (product.variants || []).filter(v => v.active !== false),
    [product.variants]
  );

  const hasRealVariants = useMemo(
    () => activeVariants.some(v => v.attributes && Object.keys(v.attributes).length > 0),
    [activeVariants]
  );

  const availableAttributes = useMemo(() => {
    if (!hasRealVariants) return {};
    const attrs = {};
    activeVariants.forEach(v => {
      if (!v.attributes) return;
      Object.entries(v.attributes).forEach(([k, val]) => {
        if (!attrs[k]) attrs[k] = new Set();
        attrs[k].add(val);
      });
    });
    return Object.fromEntries(Object.entries(attrs).map(([k,s]) => [k, Array.from(s)]));
  }, [activeVariants, hasRealVariants]);

  const activeVariant = useMemo(() => {
    if (!hasRealVariants) return activeVariants[0] || null;
    if (!Object.keys(selectedOptions).length) return null;
    return activeVariants.find(v =>
      Object.entries(selectedOptions).every(([k,val]) => v.attributes?.[k] === val)
    ) || null;
  }, [selectedOptions, activeVariants, hasRealVariants]);

  const getOptionMeta = useCallback((attrName) => {
    const others = Object.fromEntries(
      Object.entries(selectedOptions).filter(([k]) => k !== attrName)
    );
    const hasOthers = !!Object.keys(others).length;
    return (availableAttributes[attrName] || []).reduce((acc, opt) => {
      const test = { ...others, [attrName]: opt };
      const match = activeVariants.find(v =>
        Object.entries(test).every(([k,val]) => v.attributes?.[k] === val)
      );
      acc[opt] = { available: !hasOthers || !!match };
      return acc;
    }, {});
  }, [selectedOptions, availableAttributes, activeVariants]);

  /* ── auto-select first in-stock ── */
  useEffect(() => {
    if (hasRealVariants && !Object.keys(selectedOptions).length) {
      const best = activeVariants.find(v => v.stockQuantity > 0) || activeVariants[0];
      if (best?.attributes) setSelectedOptions(best.attributes);
    }
  }, [hasRealVariants, activeVariants]);

  useEffect(() => { setQuantity(1); }, [selectedOptions]);

  const handleOptionSelect = useCallback((attrName, value) => {
    const next = { ...selectedOptions, [attrName]: value };
    const exact = activeVariants.some(v =>
      Object.entries(next).every(([k,val]) => v.attributes?.[k] === val)
    );
    if (exact) {
      setSelectedOptions(next);
    } else {
      const fb = activeVariants.find(v => v.attributes?.[attrName] === value);
      if (fb?.attributes) setSelectedOptions(fb.attributes);
    }
  }, [selectedOptions, activeVariants]);

  /* ── computed display values ── */
  const displayPrice        = activeVariant?.price        ?? (product.minPrice || product.price || product.basePrice || 0);
  const displayComparePrice = activeVariant?.compareAtPrice ?? product.originalPrice;
  const currentStock        = activeVariant
    ? (activeVariant.stockQuantity || 0)
    : (product.totalStock || product.stockQuantity || 0);
  const onSale              = !!(activeVariant?.activeCampaignId || product.activeCampaignId);
  const discountPct         = displayComparePrice > displayPrice
    ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100) : 0;

  const stockStatus = useMemo(() => {
    if (currentStock === 0)  return { label:'Out of stock',               color:'var(--c-red)',   width:'0%',                             show:true  };
    if (currentStock <= 3)   return { label:`Only ${currentStock} left`,  color:'var(--c-red)',   width:'8%',                             show:true  };
    if (currentStock <= 10)  return { label:`${currentStock} left`,       color:'var(--c-amber)', width:`${(currentStock/20)*100}%`,       show:true  };
    if (currentStock <= 20)  return { label:`${currentStock} available`,  color:'var(--c-green)', width:`${(currentStock/30)*100}%`,       show:true  };
    return                          { label:'In Stock',                   color:'var(--c-green)', width:'100%',                           show:false };
  }, [currentStock]);

  /* ── add to cart ── */
  const isOutOfStock = currentStock === 0;
  const canAddToCart = !isOutOfStock && (hasRealVariants ? activeVariant !== null : true);

  const handleAddToCart = useCallback(async () => {
    const variantId = activeVariant?.id || product.id;
    if (!variantId) return;
    setCartState('loading');
    const ok = await addToCart(variantId, quantity, activeVariant?.attributes || {});
    if (ok) {
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2500);
    } else {
      setCartState('error');
      setTimeout(() => setCartState('idle'), 2000);
    }
  }, [activeVariant, product.id, quantity, addToCart]);

  /* ── wishlist ── */
  const toggleWish = () => {
    const next = !wished;
    setWished(next);
    setWishMsg(next ? '❤️ Saved to wishlist' : '💔 Removed from wishlist');
    setWishToast(true);
    setTimeout(() => setWishToast(false), 2200);
  };

  /* ── ATC button appearance ── */
  const atcBg = isOutOfStock        ? '#e0e0e0'
    : cartState === 'success' ? 'var(--c-green)'
    : cartState === 'error'   ? 'var(--c-red)'
    : 'var(--c-ink)';

  /* ═══════════════════════════════
     RENDER
  ═══════════════════════════════ */
  return (
    <div className="pi pi-fade-up pi-page-pad" style={{ position:'relative' }}>

      {/* ── HEADER ───────────────────────────────── */}
      <div style={{ marginBottom:20 }}>
        {product.brandName && (
          <p style={{
            fontSize:10, fontWeight:800, color:'var(--c-green)',
            letterSpacing:'.2em', textTransform:'uppercase', marginBottom:8,
          }}>
            {product.brandName}
          </p>
        )}

        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          <h1 className="pi-serif" style={{
            flex:1, margin:0,
            fontSize:'clamp(20px,5.5vw,28px)',
            fontWeight:700, lineHeight:1.22, color:'var(--c-ink)',
          }}>
            {product.name}
          </h1>

          {/* Wishlist + Share */}
          <div style={{ display:'flex', gap:6, flexShrink:0, paddingTop:2 }}>
            <button
              onClick={toggleWish}
              aria-label="Save to wishlist"
              style={{
                width:36, height:36, borderRadius:'50%',
                border:`1.5px solid ${wished ? '#fecaca' : '#e5e7eb'}`,
                background: wished ? '#fef2f2' : '#f7f7f7',
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', transition:'all .2s',
              }}
            >
              <Heart
                size={14}
                fill={wished ? '#ef4444' : 'none'}
                color={wished ? '#ef4444' : '#aaa'}
                className={wished ? 'pi-pop' : ''}
              />
            </button>
            <button
              onClick={() => navigator.share?.({ title:product.name, url:window.location.href })}
              aria-label="Share"
              style={{
                width:36, height:36, borderRadius:'50%',
                border:'1.5px solid #e5e7eb', background:'#f7f7f7',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              }}
            >
              <Share2 size={14} color="#aaa" />
            </button>
          </div>
        </div>

        {/* Rating row */}
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:10, marginTop:12 }}>
          <Stars rating={product.averageRating || 0} count={product.reviewCount || 0} />
          {onSale && (
            <span style={{
              background:'var(--c-red-l)', color:'var(--c-red)',
              fontSize:9, padding:'3px 9px', borderRadius:99,
              fontWeight:800, letterSpacing:'.14em', textTransform:'uppercase',
            }}>
              Sale
            </span>
          )}
        </div>
      </div>

      {/* ── PRICE ────────────────────────────────── */}
      <div style={{
        display:'flex', alignItems:'flex-end', flexWrap:'wrap', gap:10,
        padding:'16px 0',
        borderTop:'1px solid var(--c-border)',
        borderBottom:'1px solid var(--c-border)',
        marginBottom:20,
      }}>
        <span className="pi-serif" style={{
          fontSize:'clamp(26px,8vw,34px)', fontWeight:700,
          color:'var(--c-ink)', lineHeight:1, fontVariantNumeric:'tabular-nums',
        }}>
          ₦{Number(displayPrice || 0).toLocaleString()}
        </span>
        {displayComparePrice > displayPrice && (
          <>
            <span style={{ fontSize:15, color:'#bbb', textDecoration:'line-through', marginBottom:2 }}>
              ₦{Number(displayComparePrice).toLocaleString()}
            </span>
            <span style={{
              background:'var(--c-ink)', color:'#fff',
              fontSize:10, padding:'4px 11px', borderRadius:99,
              fontWeight:700, letterSpacing:'.06em', marginBottom:2,
            }}>
              {discountPct}% OFF
            </span>
          </>
        )}
      </div>

      {/* ── STOCK INDICATOR ──────────────────────── */}
      {stockStatus.show && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
            {currentStock > 0
              ? <Zap size={11} color={stockStatus.color} fill={stockStatus.color} style={{ flexShrink:0 }} />
              : <AlertTriangle size={11} color={stockStatus.color} style={{ flexShrink:0 }} />}
            <span style={{
              fontSize:10, fontWeight:800, letterSpacing:'.12em',
              textTransform:'uppercase', color:stockStatus.color,
            }}>
              {stockStatus.label}
            </span>
          </div>
          {currentStock > 0 && (
            <div style={{ height:3, background:'#f0ede8', borderRadius:99, overflow:'hidden' }}>
              <div className="pi-stock-fill" style={{ width:stockStatus.width, background:stockStatus.color }} />
            </div>
          )}
        </div>
      )}

      {/* ── VARIANT SELECTORS ────────────────────── */}
      {hasRealVariants && !!Object.keys(availableAttributes).length && (
        <div style={{ marginBottom:24 }}>
          {Object.entries(availableAttributes).map(([attrName, opts]) => {
            const isColor  = isColorAttr(attrName);
            const optMeta  = getOptionMeta(attrName);
            const selVal   = selectedOptions[attrName];
            const lowStock = activeVariant?.stockQuantity > 0 && activeVariant?.stockQuantity <= 5;

            return (
              <div key={attrName} style={{ marginBottom:20 }}>
                {/* label row */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{
                    fontSize:10, fontWeight:700, letterSpacing:'.15em',
                    textTransform:'uppercase', color:'var(--c-ink3)',
                  }}>
                    {attrName}:
                  </span>
                  {selVal && (
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--c-ink)' }}>
                      {selVal}
                    </span>
                  )}
                  {lowStock && (
                    <span style={{
                      marginLeft:'auto', fontSize:9, fontWeight:700,
                      color:'var(--c-amber)', background:'#fef3c7',
                      padding:'2px 9px', borderRadius:99, letterSpacing:'.04em',
                    }}>
                      only {activeVariant.stockQuantity} left
                    </span>
                  )}
                </div>

                {/* options */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {opts.map(opt => {
                    const isSel  = selectedOptions[attrName] === opt;
                    const isOff  = !optMeta[opt]?.available;
                    return isColor
                      ? <ColorSwatch key={opt} value={opt} isSelected={isSel} isUnavailable={isOff}
                          onClick={() => !isOff && handleOptionSelect(attrName, opt)} />
                      : <VariantPill key={opt} value={opt} isSelected={isSel} isUnavailable={isOff}
                          onClick={() => !isOff && handleOptionSelect(attrName, opt)} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── QUANTITY + ADD TO CART ───────────────── */}
      <div ref={atcRef} style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:10 }}>

          {/* Qty stepper */}
          <div style={{
            display:'flex', alignItems:'center', height:52, flexShrink:0,
            border:'1.5px solid var(--c-border)', borderRadius:14, overflow:'hidden',
            opacity: canAddToCart ? 1 : 0.4,
            pointerEvents: canAddToCart ? 'auto' : 'none',
          }}>
            <button className="pi-qty-btn" onClick={() => setQuantity(q => Math.max(1,q-1))} disabled={quantity<=1}>
              <Minus size={14} />
            </button>
            <span style={{
              width:36, textAlign:'center', fontWeight:800, fontSize:15,
              color:'var(--c-ink)', fontVariantNumeric:'tabular-nums',
            }}>
              {quantity}
            </span>
            <button className="pi-qty-btn" onClick={() => setQuantity(q => Math.min(currentStock,q+1))} disabled={quantity>=currentStock}>
              <Plus size={14} />
            </button>
          </div>

          {/* Main CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || cartState === 'loading'}
            className="pi-atc"
            style={{
              flex:1, height:52, borderRadius:14, border:'none', cursor:'pointer',
              fontFamily:'DM Sans,system-ui,sans-serif',
              fontWeight:800, fontSize:12, letterSpacing:'.1em', textTransform:'uppercase',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              background: atcBg,
              color: isOutOfStock ? '#999' : '#fff',
              boxShadow: !isOutOfStock && cartState === 'idle'
                ? '0 4px 18px rgba(11,11,11,.18)' : 'none',
            }}
          >
            {isOutOfStock           ? 'Out of Stock'
              : cartState==='loading' ? <><Spinner/> Adding…</>
              : cartState==='success' ? <><CheckCircle size={16}/> Added to Bag</>
              : cartState==='error'   ? 'Failed — try again'
              : <><ShoppingBag size={16}/> Add to Cart</>}
          </button>
        </div>

        {/* Max qty warning */}
        {canAddToCart && quantity >= currentStock && currentStock > 0 && (
          <p style={{
            display:'flex', alignItems:'center', gap:5, marginTop:8,
            fontSize:10, fontWeight:700, color:'var(--c-amber)',
            letterSpacing:'.06em', textTransform:'uppercase',
          }}>
            <AlertTriangle size={10} /> Maximum available quantity selected
          </p>
        )}
      </div>

      {/* ── TRUST PILLS ──────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24 }}>
        {[
          { icon:Truck,      text:'Nationwide Delivery' },
          { icon:RotateCcw,  text:'Easy Returns'        },
          { icon:Shield,     text:'Secure Checkout',  full:true },
        ].map(({ icon:Icon, text, full }, i) => (
          <div
            key={text}
            className="pi-trust"
            style={full ? { gridColumn:'1/-1' } : undefined}
          >
            <Icon size={13} color="var(--c-green)" style={{ flexShrink:0 }} />
            <span style={{ fontSize:11, fontWeight:600, color:'var(--c-ink2)' }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* ── DESCRIPTION (accordion) ───────────────── */}
      {product.description && (
        <Accordion title="Description" defaultOpen>
          <p style={{ margin:0, fontSize:13.5, color:'var(--c-ink2)', lineHeight:1.75 }}>
            {product.description}
          </p>
        </Accordion>
      )}

      {/* ── SPECIFICATIONS (accordion) ────────────── */}
      {product.specifications && !!Object.keys(product.specifications).length && (
        <Accordion title="Specifications">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' }}>
            {Object.entries(product.specifications).map(([k, v]) => (
              <div key={k} style={{ paddingBottom:8, borderBottom:'1px solid var(--c-surface)' }}>
                <div style={{
                  fontSize:10, color:'var(--c-ink3)', fontWeight:600,
                  letterSpacing:'.08em', textTransform:'uppercase', marginBottom:2,
                }}>
                  {k}
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--c-ink)' }}>{v}</div>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* ── STICKY MOBILE BAR ────────────────────── */}
      <StickyBar
        price={displayPrice}
        onAddToCart={handleAddToCart}
        cartState={cartState}
        isOutOfStock={isOutOfStock}
        canAddToCart={canAddToCart}
        quantity={quantity}
        setQuantity={setQuantity}
        currentStock={currentStock}
        show={showBar}
      />

      {/* ── WISH TOAST ───────────────────────────── */}
      <Toast message={wishMsg} visible={wishToast} />
    </div>
  );
};

export default ProductInfo;