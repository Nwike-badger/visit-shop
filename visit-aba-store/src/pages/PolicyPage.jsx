import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Shield, RotateCcw, Cookie, ChevronRight } from 'lucide-react';

const SECTIONS = [
  {
    id: 'terms',
    label: 'Terms & Conditions',
    icon: FileText,
    lastUpdated: 'January 15, 2025',
    content: [
      {
        heading: 'Acceptance of Terms',
        body: `By accessing and using ExploreAba ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access or use the Platform.`,
      },
      {
        heading: 'Use of the Platform',
        body: `You may use the Platform only for lawful purposes and in accordance with these Terms. You agree not to use the Platform in any way that violates applicable local, national, or international law or regulation. You must not transmit any unsolicited or unauthorized advertising or promotional material, or engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Platform.`,
      },
      {
        heading: 'Account Registration',
        body: `To access certain features of the Platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your password and for all activities that occur under your account.`,
      },
      {
        heading: 'Product Listings & Pricing',
        body: `ExploreAba connects buyers with vendors across Nigeria. Prices are displayed in Nigerian Naira (₦) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to modify prices at any time. All orders are subject to product availability. In the event that a product becomes unavailable after your order is placed, we will notify you promptly.`,
      },
      {
        heading: 'Intellectual Property',
        body: `The Platform and its original content, features, and functionality are and will remain the exclusive property of ExploreAba and its licensors. Our trademarks may not be used in connection with any product or service without the prior written consent of ExploreAba.`,
      },
      {
        heading: 'Limitation of Liability',
        body: `In no event shall ExploreAba, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, goodwill, or other intangible losses, resulting from your access to or use of (or inability to access or use) the Platform.`,
      },
      {
        heading: 'Changes to Terms',
        body: `We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice of significant changes by updating the date at the top of this page. Your continued use of the Platform after any changes constitutes acceptance of the new Terms.`,
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: Shield,
    lastUpdated: 'January 15, 2025',
    content: [
      {
        heading: 'Information We Collect',
        body: `We collect information you provide directly, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, phone number, delivery address, and payment information. We also collect information automatically when you use the Platform, including your IP address, browser type, referring URLs, and pages viewed.`,
      },
      {
        heading: 'How We Use Your Information',
        body: `We use the information we collect to process your orders and payments, send you order confirmations and shipping updates, respond to your questions and support requests, send you marketing communications (where you have opted in), improve and personalize your experience on the Platform, and comply with our legal obligations.`,
      },
      {
        heading: 'Information Sharing',
        body: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except to trusted partners who assist us in operating the Platform, conducting our business, or servicing you — provided that those parties agree to keep this information confidential. We may also release information when required by law or to protect ours or others' rights.`,
      },
      {
        heading: 'Data Security',
        body: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
      },
      {
        heading: 'Data Retention',
        body: `We retain your personal information for as long as your account is active or as needed to provide you with services. You may request deletion of your data at any time by contacting us. We will respond to your request within 30 days, subject to any legal obligations that require us to retain certain information.`,
      },
      {
        heading: 'Your Rights',
        body: `You have the right to access the personal information we hold about you, correct inaccurate data, request deletion of your data, object to processing of your data, and request that we restrict processing of your data. To exercise any of these rights, please contact us at privacy@exploreaba.com.`,
      },
    ],
  },
  {
    id: 'returns',
    label: 'Returns Policy',
    icon: RotateCcw,
    lastUpdated: 'January 15, 2025',
    content: [
      {
        heading: 'Return Eligibility',
        body: `Most items purchased on ExploreAba can be returned within 14 days of delivery. To be eligible for a return, the item must be unused, in the same condition that you received it, and in its original packaging with all tags attached. Certain categories — including personal care items, undergarments, and perishables — are not eligible for return for hygiene reasons.`,
      },
      {
        heading: 'How to Initiate a Return',
        body: `To initiate a return, log into your account and navigate to Orders, select the order containing the item you wish to return, and click "Request Return." You will receive a confirmation email with return instructions and a pre-paid return label within 24 hours. Pack the item securely and drop it off at any designated courier location.`,
      },
      {
        heading: 'Refund Processing',
        body: `Once we receive and inspect your returned item, we will notify you by email about the status of your refund. If approved, your refund will be processed within 5–7 business days and applied to your original payment method. Bank transfer refunds may take an additional 3–5 business days to appear in your account depending on your bank.`,
      },
      {
        heading: 'Damaged or Defective Items',
        body: `If you receive an item that is damaged or defective, please contact us within 48 hours of delivery with photos of the damage. We will arrange a free return pickup and either send you a replacement at no cost or issue a full refund, including original shipping charges. Damaged items reported after 48 hours may be subject to standard return procedures.`,
      },
      {
        heading: 'Non-Returnable Items',
        body: `The following items cannot be returned: downloadable software or digital products, gift cards, items marked as "Final Sale," personal care and beauty products that have been opened, custom or personalized items made to your specifications, and perishable goods such as food and flowers.`,
      },
      {
        heading: 'Exchange Policy',
        body: `We currently do not process direct exchanges. If you would like a different size, color, or item, please return the original item for a refund and place a new order. This ensures the fastest processing time and that you get the exact item you want.`,
      },
    ],
  },
  {
    id: 'cookies',
    label: 'Cookie Policy',
    icon: Cookie,
    lastUpdated: 'January 15, 2025',
    content: [
      {
        heading: 'What Are Cookies',
        body: `Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies help us recognize your device and remember your preferences, making your experience more personalized and efficient.`,
      },
      {
        heading: 'How We Use Cookies',
        body: `We use cookies for several purposes: essential cookies to make the Platform work correctly (including keeping you logged in and remembering your cart), preference cookies to remember your settings and language preferences, analytics cookies to understand how visitors interact with the Platform so we can improve it, and marketing cookies to deliver relevant advertisements.`,
      },
      {
        heading: 'Types of Cookies We Use',
        body: `Session cookies are temporary cookies that expire when you close your browser. They are used to keep you logged in during your visit. Persistent cookies remain on your device for a set period and are used to remember your preferences across visits. Third-party cookies are set by our partners for analytics and advertising purposes.`,
      },
      {
        heading: 'Managing Cookies',
        body: `You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or delete them. However, blocking certain cookies may impact your experience on our Platform — for example, you may not be able to stay logged in or add items to your cart. You can also opt out of marketing cookies at any time through our cookie preference center.`,
      },
      {
        heading: 'Third-Party Services',
        body: `We use Google Analytics to understand how our Platform is used. Google Analytics uses cookies to collect anonymous information such as the number of visitors and the pages they visit. This data helps us improve the Platform. You can opt out of Google Analytics by installing the Google Analytics opt-out browser add-on. We also use Paystack cookies for secure payment processing.`,
      },
    ],
  },
];

const PolicyPage = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('terms');
  const sectionRefs = useRef({});

  // Sync hash to active section on load/navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && SECTIONS.find(s => s.id === hash)) {
      setActiveSection(hash);
      setTimeout(() => {
        sectionRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  const section = SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="bg-gray-50/30 min-h-screen pb-24 font-sans">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav className="flex items-center gap-1.5 mb-5 text-xs font-bold text-gray-500">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-white">Legal</span>
          </nav>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
            Legal & Policies
          </h1>
          <p className="text-gray-400 text-sm">
            Transparency is at the heart of everything we do.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">

          {/* ── SIDEBAR NAV ─────────────────────────────────────── */}
          <aside className="lg:col-span-3 mb-6 lg:mb-0">
            <div className="lg:sticky lg:top-[100px]">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setActiveSection(id);
                      window.history.replaceState(null, '', `#${id}`);
                      sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shrink-0 lg:w-full text-left
                      ${activeSection === id
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-100 text-gray-600 hover:border-gray-300 hover:text-gray-900'}`}
                  >
                    <Icon size={15} className={activeSection === id ? 'text-green-400' : 'text-gray-400'} />
                    {label}
                  </button>
                ))}
              </nav>

              {/* Contact prompt */}
              <div className="hidden lg:block mt-6 p-5 bg-green-50 border border-green-100 rounded-2xl">
                <p className="text-sm font-bold text-gray-900 mb-1">Have a question?</p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Our legal team is happy to clarify any of our policies.
                </p>
                <Link
                  to="/contact"
                  className="text-xs font-bold text-green-700 hover:text-green-800 flex items-center gap-1"
                >
                  Contact us <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </aside>

          {/* ── CONTENT ─────────────────────────────────────────── */}
          <main className="lg:col-span-9">
            <div
              ref={el => sectionRefs.current[section.id] = el}
              className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Section header */}
              <div className="px-6 sm:px-10 py-8 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0">
                    <section.icon size={20} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{section.label}</h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Last updated: {section.lastUpdated}</p>
                  </div>
                </div>
              </div>

              {/* Section body */}
              <div className="px-6 sm:px-10 py-8 space-y-8">
                {section.content.map(({ heading, body }) => (
                  <div key={heading}>
                    <h3 className="text-base font-black text-gray-900 mb-3 tracking-tight">{heading}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>

              {/* Section footer */}
              <div className="px-6 sm:px-10 py-6 bg-gray-50/50 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  If you have any questions about this policy, please{' '}
                  <Link to="/contact" className="text-green-600 font-bold hover:underline">
                    contact us
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Other sections quick-nav */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SECTIONS.filter(s => s.id !== activeSection).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveSection(id);
                    window.history.replaceState(null, '', `#${id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-all text-left"
                >
                  <Icon size={15} className="text-gray-400 shrink-0" />
                  {label}
                  <ChevronRight size={13} className="ml-auto text-gray-300" />
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;