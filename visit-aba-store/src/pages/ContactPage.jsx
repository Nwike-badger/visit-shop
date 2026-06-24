import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Mail, Phone, MapPin, Clock,
  Send, CheckCircle, MessageCircle, Instagram,
  Facebook, Twitter, ArrowRight, AlertCircle,
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────────── */
const SUPPORT_EMAIL  = 'support@exploreaba.ng';
const ENQUIRY_EMAIL  = 'exploreabanow@gmail.com';
const PHONE          = '09061355240';
const WHATSAPP       = 'https://wa.me/2349061355240';
const ADDRESS        = 'Ariaria International Market, Aba, Abia State, Nigeria';
const MAPS_LINK      = 'https://maps.google.com/?q=Ariaria+International+Market+Aba+Nigeria';

const SUBJECTS = [
  { value: 'general',  label: 'General Enquiry'  },
  { value: 'order',    label: 'Order Issue'       },
  { value: 'custom',   label: 'Custom Order'      },
  { value: 'returns',  label: 'Returns & Refunds' },
  { value: 'delivery', label: 'Delivery Query'    },
  { value: 'other',    label: 'Other'             },
];

const HOURS = [
  { days: 'Monday – Friday', time: '9:00 AM – 6:00 PM' },
  { days: 'Saturday',        time: '10:00 AM – 4:00 PM' },
  { days: 'Sunday',          time: 'Closed'             },
];

const FAQ_LINKS = [
  { label: 'How does a custom order work?',      to: '/custom'          },
  { label: 'What is your returns policy?',       to: '/legal#returns'   },
  { label: 'How long does delivery take?',       to: '/legal#terms'     },
  { label: 'When will I receive my refund?',     to: '/legal#refunds'   },
  { label: 'How do I track my order?',           to: '/orders'          },
];

/* ─── Small helpers ─────────────────────────────────────────────────── */
const Label = ({ htmlFor, children, optional }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider"
  >
    {children}{' '}
    {optional && <span className="text-gray-400 normal-case font-normal tracking-normal">(optional)</span>}
  </label>
);

const inputBase =
  'w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none transition-all focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 placeholder:text-gray-400';

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════════ */
const ContactPage = () => {
  const [form, setForm]   = useState({
    name: '', email: '', phone: '', subject: 'general', message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    /*
     * ── Wire up your backend here ─────────────────────────────────────
     * Example with fetch:
     *
     * try {
     *   const res = await fetch('/api/contact', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(form),
     *   });
     *   if (!res.ok) throw new Error('Server error');
     *   setStatus('success');
     * } catch {
     *   setStatus('error');
     * }
     *
     * Or use EmailJS / Formspree for a no-backend solution.
     * ─────────────────────────────────────────────────────────────────
     */

    // Simulated success for now — replace with real API call above
    setTimeout(() => setStatus('success'), 1400);
  };

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', subject: 'general', message: '' });
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <div className="bg-gray-900 text-white py-10 sm:py-14 px-4">
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-200">Contact Us</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Get in Touch</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-md leading-relaxed">
            Have a question, custom order enquiry, or need help with an existing order?
            We're here and we'll get back to you as quickly as we can.
          </p>
        </div>
      </div>

      {/* ══ MAIN CONTENT ════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">

          {/* ── LEFT: CONTACT FORM ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">

            {/* ── SUCCESS STATE ── */}
            {status === 'success' ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Message received!</h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-2">
                  Thank you for reaching out. Our team will review your message and
                  get back to you within <strong>1–2 business days</strong>.
                </p>
                <p className="text-gray-400 text-xs mb-8">
                  For urgent matters, call or WhatsApp us directly on{' '}
                  <a href={`tel:${PHONE}`} className="text-green-600 font-bold">{PHONE}</a>.
                </p>
                <button
                  onClick={resetForm}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-gray-900">Send us a message</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Fill in the form below and we'll respond within 1–2 business days.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name + Email row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@email.com"
                        className={inputBase}
                      />
                    </div>
                  </div>

                  {/* Phone + Subject row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="phone" optional>Phone Number</Label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="08012345678"
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <select
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className={`${inputBase} cursor-pointer`}
                      >
                        {SUBJECTS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Tell us how we can help — include your order number if relevant."
                      className={`${inputBase} resize-none leading-relaxed`}
                    />
                  </div>

                  {/* Error state */}
                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>
                        Something went wrong. Please try again or email us directly at{' '}
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline">{SUPPORT_EMAIL}</a>.
                      </span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-green-200 active:scale-[0.98]"
                  >
                    {status === 'loading' ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* ── RIGHT: CONTACT INFO + HOURS + FAQ ─────────────────── */}
          <div className="space-y-5">

            {/* Direct contacts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-4">Contact Details</h3>
              <div className="space-y-4">

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <Mail size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Support Email</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors break-all">{SUPPORT_EMAIL}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${ENQUIRY_EMAIL}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <Mail size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">General Enquiry</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors break-all">{ENQUIRY_EMAIL}</p>
                  </div>
                </a>

                <a
                  href={`tel:${PHONE}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <Phone size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{PHONE}</p>
                  </div>
                </a>

                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors leading-snug">{ADDRESS}</p>
                  </div>
                </a>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20bc5a] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-green-200"
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>

            {/* Business hours */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-green-600" />
                <h3 className="font-black text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-2.5">
                {HOURS.map(({ days, time }) => (
                  <div key={days} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{days}</span>
                    <span
                      className={`font-bold ${
                        time === 'Closed' ? 'text-red-400' : 'text-gray-900'
                      }`}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                Response times may vary during weekends and public holidays. For urgent order issues,
                please WhatsApp us directly.
              </p>
            </div>

            {/* Social links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-4">Follow Us</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com',  color: 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200'  },
                  { Icon: Facebook,  label: 'Facebook',  href: 'https://facebook.com',   color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'   },
                  { Icon: Twitter,   label: 'Twitter/X', href: 'https://twitter.com',    color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200'      },
                ].map(({ Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center gap-1.5 p-3 border border-gray-100 rounded-xl text-gray-500 transition-all text-xs font-bold ${color}`}
                  >
                    <Icon size={18} />
                    {label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── FAQ QUICK LINKS ────────────────────────────────────── */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Common Questions</h3>
              <p className="text-gray-500 text-sm mt-0.5">You might find the answer you need right here.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FAQ_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl text-sm font-medium text-gray-700 hover:text-green-700 transition-all group"
              >
                <span className="leading-snug">{label}</span>
                <ArrowRight size={14} className="shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;