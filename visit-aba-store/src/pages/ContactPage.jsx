import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Clock, Send, CheckCircle,
  ChevronRight, MessageSquare, Package, CreditCard, HelpCircle
} from 'lucide-react';

const TOPICS = [
  { id: 'order',    label: 'Order Issue',     icon: Package        },
  { id: 'payment',  label: 'Payment',          icon: CreditCard     },
  { id: 'return',   label: 'Returns',          icon: MessageSquare  },
  { id: 'other',    label: 'General Enquiry',  icon: HelpCircle     },
];

const ContactPage = () => {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-gray-50/30 min-h-screen pb-24 font-sans">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav className="flex items-center gap-1.5 mb-5 text-xs font-bold text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white">Contact</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-sm max-w-md">
            We're here to help. Reach out and our team will get back to you within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">

          {/* ── LEFT: INFO ──────────────────────────────────────── */}
          <aside className="lg:col-span-4 mb-8 lg:mb-0 space-y-4">

            {/* Contact details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-gray-900 mb-5 tracking-tight">Contact Details</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Phone,
                    label: 'Phone',
                    value: '+234 800 000 0000',
                    href: 'tel:+2348000000000',
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'hello@exploreaba.com',
                    href: 'mailto:hello@exploreaba.com',
                  },
                  {
                    icon: MapPin,
                    label: 'Address',
                    value: 'Ariaria International Market, Aba, Abia State, Nigeria',
                    href: null,
                  },
                  {
                    icon: Clock,
                    label: 'Hours',
                    value: 'Mon–Sat: 8am – 8pm WAT\nSun: 10am – 6pm WAT',
                    href: null,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={15} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-700 whitespace-pre-line">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-black text-gray-900 mb-4 tracking-tight">Quick Help</h2>
              <div className="space-y-2">
                {[
                  { label: 'Track your order',   to: '/orders'  },
                  { label: 'Returns & refunds',  to: '/legal#returns' },
                  { label: 'FAQs',               to: '/faq'     },
                  { label: 'Size guide',         to: '/size-guide' },
                ].map(({ label, to }) => (
                  <Link
                    key={label}
                    to={to}
                    className="flex items-center justify-between py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    {label}
                    <ChevronRight size={14} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ── RIGHT: FORM ─────────────────────────────────────── */}
          <main className="lg:col-span-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Message sent!</h2>
                  <p className="text-gray-500 text-sm max-w-sm mb-6">
                    Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name:'', email:'', phone:'', topic:'', message:'' }); }}
                    className="text-sm font-bold text-green-600 hover:text-green-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-6 sm:px-10 py-8 border-b border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Send us a message</h2>
                    <p className="text-sm text-gray-400 mt-1">We typically reply within a few hours.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-6">

                    {/* Topic selector */}
                    <div>
                      <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-3">
                        What's this about?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TOPICS.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setForm(p => ({ ...p, topic: id }))}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all
                              ${form.topic === id
                                ? 'bg-gray-900 border-gray-900 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'}`}
                          >
                            <Icon size={16} className={form.topic === id ? 'text-green-400' : 'text-gray-400'} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name + Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-2">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-2">
                          Email Address <span className="text-red-400">*</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-2">
                        Phone Number <span className="text-gray-400 font-medium normal-case tracking-normal">(optional)</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-xs font-black text-gray-900 uppercase tracking-widest block mb-2">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you…"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send size={15} /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;