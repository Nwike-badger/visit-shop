import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Instagram, Twitter, Facebook, Youtube,
  ArrowRight, Shield, Truck, RotateCcw, Headphones,
  CreditCard, Smartphone
} from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  const shopLinks = [
    { label: 'Natives',      to: '/category/men' },
    { label: 'Fabrics',  to: '/category/men' },
    { label: 'Leather',to: '/category/men' },
    { label: 'Sneakers',     to: '/category/footwear' },
    { label: 'All Products', to: '/products' },
  ];

  const companyLinks = [
    { label: 'About ExploreAba', to: '/about' },
    { label: 'Sell on ExploreAba', to: '/sell' },
    { label: 'Careers',          to: '/careers' },
    { label: 'Press',            to: '/press' },
  ];

  const helpLinks = [
    { label: 'Contact Us',    to: '/contact' },
    { label: 'Track Order',   to: '/orders' },
    { label: 'FAQs',          to: '/faq' },
    { label: 'Size Guide',    to: '/size-guide' },
  ];

  const legalLinks = [
    { label: 'Terms & Conditions', to: '/legal#terms' },
    { label: 'Privacy Policy',     to: '/legal#privacy' },
    { label: 'Returns Policy',     to: '/legal#returns' },
    { label: 'Cookie Policy',      to: '/legal#cookies' },
  ];

  return (
    <footer className="bg-gray-950 text-white">

      {/* ── TRUST BAR ──────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Truck,       title: 'Nationwide Delivery', sub: 'Fast & reliable' },
              { icon: RotateCcw,   title: 'Easy Returns',        sub: '14-day policy' },
              { icon: Shield,      title: 'Secure Payments',     sub: '256-bit encryption' },
              { icon: Headphones,  title: '24/7 Support',        sub: 'Always here for you' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER ────────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <span className="text-white font-black text-sm">E</span>
              </div>
              <span className="text-xl font-black tracking-tight">ExploreAba</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Africa's premier marketplace for authentic Aba-made products. Quality craftsmanship, delivered nationwide.
            </p>

            {/* Newsletter */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Stay in the loop</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500 focus:bg-white/8 transition-all min-w-0"
              />
              <button
                type="submit"
                className="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl transition-colors"
              >
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Socials */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: Twitter,   href: 'https://twitter.com',   label: 'Twitter'   },
                { icon: Facebook,  href: 'https://facebook.com',  label: 'Facebook'  },
                { icon: Youtube,   href: 'https://youtube.com',   label: 'YouTube'   },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-green-600 flex items-center justify-center transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { heading: 'Shop',    links: shopLinks    },
              { heading: 'Company', links: companyLinks },
              { heading: 'Help',    links: helpLinks    },
              { heading: 'Legal',   links: legalLinks   },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <p className="text-xs font-black text-white uppercase tracking-widest mb-4">{heading}</p>
                <ul className="space-y-3">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="text-sm text-gray-500 hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-10 pt-8 border-t border-white/5">
          <div className="flex flex-wrap gap-6 text-xs text-gray-600">
            <a href="tel:+2348000000000" className="flex items-center gap-2 hover:text-gray-400 transition-colors">
              <Phone size={13} /> +234 800 000 0000
            </a>
            <a href="mailto:hello@exploreaba.com" className="flex items-center gap-2 hover:text-gray-400 transition-colors">
              <Mail size={13} /> hello@exploreaba.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin size={13} /> Ariaria International Market, Aba, Abia State, Nigeria
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ─────────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {year} ExploreAba. All rights reserved. Made with ♥ in Aba, Nigeria.
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 mr-1">We accept</span>
            {['Visa', 'Mastercard', 'Paystack', 'Bank Transfer'].map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-gray-500 tracking-wide"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;