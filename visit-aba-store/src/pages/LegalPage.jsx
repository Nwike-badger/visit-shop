import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Mail, Phone, MapPin } from 'lucide-react';

/* ─── Page-level constants ───────────────────────────────────────────── */
const EFFECTIVE    = 'June 2026';
const EMAIL        = 'support@exploreaba.ng';
const PHONE        = '09061355240';
const ADDRESS      = 'Ariaria International Market, Aba, Abia State, Nigeria';
const WEBSITE      = 'www.exploreaba.ng';

const SECTIONS = [
  { id: 'terms',   label: 'Terms & Conditions', emoji: '📋' },
  { id: 'privacy', label: 'Privacy Policy',      emoji: '🔒' },
  { id: 'returns', label: 'Returns Policy',      emoji: '📦' },
  { id: 'refunds', label: 'Refund Policy',       emoji: '💳' },
  { id: 'cookies', label: 'Cookie Policy',       emoji: '🍪' },
];

/* ─── Scroll helper ──────────────────────────────────────────────────── */
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ─── Small reusable sub-components ─────────────────────────────────── */
const H3 = ({ children }) => (
  <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{children}</h3>
);

const Bullets = ({ items }) => (
  <ul className="mt-2 space-y-1.5">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed">
        <span className="text-green-500 shrink-0 mt-[3px] font-bold">›</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Steps = ({ steps }) => (
  <div className="mt-3 space-y-3">
    {steps.map(({ n, text }) => (
      <div key={n} className="flex gap-3 items-start">
        <span className="shrink-0 w-7 h-7 rounded-lg bg-green-600 text-white text-xs font-black flex items-center justify-center">{n}</span>
        <p className="text-sm text-gray-600 leading-relaxed pt-0.5">{text}</p>
      </div>
    ))}
  </div>
);

const InfoBox = ({ color = 'blue', children }) => {
  const colours = {
    blue:   'bg-blue-50 border-blue-100 text-blue-800',
    amber:  'bg-amber-50 border-amber-100 text-amber-800',
    green:  'bg-green-50 border-green-100 text-green-800',
    red:    'bg-red-50 border-red-100 text-red-800',
  };
  return (
    <div className={`p-4 border rounded-xl text-sm leading-relaxed ${colours[color]}`}>{children}</div>
  );
};

const ContactBox = () => (
  <div className="mt-2 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
    <p className="text-sm font-bold text-gray-800 mb-3">Contact Us</p>
    <div className="space-y-2 text-sm text-gray-600">
      <a href={`mailto:${EMAIL}`} className="flex items-center gap-2 hover:text-green-600 transition-colors">
        <Mail size={14} className="text-green-500 shrink-0" />
        <span>{EMAIL}</span>
      </a>
      <a href={`tel:${PHONE}`} className="flex items-center gap-2 hover:text-green-600 transition-colors">
        <Phone size={14} className="text-green-500 shrink-0" />
        <span>{PHONE}</span>
      </a>
      <span className="flex items-start gap-2">
        <MapPin size={14} className="text-green-500 shrink-0 mt-0.5" />
        <span>{ADDRESS}</span>
      </span>
    </div>
  </div>
);

const PolicyCard = ({ id, emoji, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <div className="flex items-center gap-3 mb-5">
      <span className="text-3xl leading-none">{emoji}</span>
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{title}</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">Effective: {EFFECTIVE}</p>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-7">
      {children}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════════════════════════════════════════ */
const LegalPage = () => {
  const { hash } = useLocation();
  const [active, setActive] = useState('terms');

  /* Jump to anchor when arriving via /legal#xxx link */
  useEffect(() => {
    const id = hash?.slice(1);
    if (id && SECTIONS.some((s) => s.id === id)) {
      setActive(id);
      setTimeout(() => scrollTo(id), 80);
    }
  }, [hash]);

  /* Highlight sidebar as user scrolls */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── PAGE HEADER ── */}
      <div className="bg-gray-900 text-white py-10 sm:py-14 px-4">
        <div className="max-w-[1440px] mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-green-400 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-gray-200">Legal &amp; Policies</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Legal &amp; Policies</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-md leading-relaxed">
            Our commitment to you — how we operate, protect your data, handle returns, and process refunds.
            Last updated {EFFECTIVE}.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:flex lg:gap-12">

          {/* ── DESKTOP STICKY SIDEBAR ── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-3">Policies</p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => { setActive(id); scrollTo(id); }}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      active === id
                        ? 'bg-green-50 text-green-700 font-bold border border-green-100'
                        : 'text-gray-500 font-medium hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    <span className="leading-snug">{label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <p className="text-xs font-bold text-green-900 mb-1">Need clarification?</p>
                <p className="text-[11px] text-green-700 leading-relaxed mb-2">Our support team is happy to explain any of our policies.</p>
                <a href={`mailto:${EMAIL}`} className="text-[11px] font-bold text-green-700 hover:text-green-800 underline break-all">{EMAIL}</a>
              </div>
            </div>
          </aside>

          {/* ── MOBILE HORIZONTAL TABS ── */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto mb-7">
            <div className="flex gap-2 w-max pb-1">
              {SECTIONS.map(({ id, label, emoji }) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); scrollTo(id); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    active === id
                      ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════
              POLICY SECTIONS
          ════════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* ── 1. TERMS & CONDITIONS ─────────────────────── */}
            <PolicyCard id="terms" emoji="📋" title="Terms & Conditions">
              <div>
                <H3>1. Introduction</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Welcome to ExploreAba ("we", "our", "us"). These Terms and Conditions govern your use of{' '}
                  <strong>{WEBSITE}</strong> and your purchase of products from us. By accessing our website or
                  placing an order, you agree to be bound by these Terms in full. If you do not agree, please
                  stop using our website.
                </p>
              </div>

              <div>
                <H3>2. About ExploreAba</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ExploreAba is a Nigerian e-commerce marketplace specialising in authentic, Aba-manufactured
                  products — including leather goods, footwear, clothing, accessories, and bespoke/custom-made
                  fashion. We are based at {ADDRESS}.
                </p>
              </div>

              <div>
                <H3>3. Eligibility</H3>
                <p className="text-sm text-gray-600">By using our website, you confirm that:</p>
                <Bullets items={[
                  'You are at least 18 years old, or are accessing the website under the supervision of a parent or legal guardian.',
                  'You are located in Nigeria or a country where purchasing from us is legally permitted.',
                  'All information you provide to us is accurate, complete, and truthful.',
                ]} />
              </div>

              <div>
                <H3>4. Products and Descriptions</H3>
                <p className="text-sm text-gray-600">We make every reasonable effort to display products accurately. However:</p>
                <Bullets items={[
                  "Colours may appear differently depending on your screen's display settings.",
                  'Product availability is subject to change without prior notice.',
                  'Custom/bespoke items are handcrafted to your specification and may have minor natural variations from reference samples.',
                  'Product images are for illustration; the finished item may differ slightly in texture or shade.',
                ]} />
              </div>

              <div>
                <H3>5. Pricing and Payment</H3>
                <Bullets items={[
                  'All prices are in Nigerian Naira (₦) and include applicable charges unless stated otherwise.',
                  'We may update prices at any time, but changes will not affect orders already confirmed.',
                  'Payments are processed securely through Paystack. We never store your full card details.',
                  'For custom orders, a deposit (agreed at the time of ordering) is required before production begins.',
                  'We accept Visa, Mastercard, and bank transfers via Paystack.',
                ]} />
              </div>

              <div>
                <H3>6. Order Confirmation</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Adding items to your cart does not constitute a confirmed order. Your order is confirmed only
                  when you receive an order confirmation from us. We reserve the right to refuse or cancel any
                  order — for example, due to pricing errors, stock unavailability, or suspected fraud. In such
                  cases, a full refund of any amount paid will be issued promptly.
                </p>
              </div>

              <div>
                <H3>7. Custom & Bespoke Orders</H3>
                <p className="text-sm text-gray-600 mb-2">Custom orders are produced specifically to your measurements, design, or instructions. Please read these terms carefully before placing a custom order:</p>
                <Bullets items={[
                  'A deposit (typically 50% of the total order value) is required before production begins. The exact amount will be confirmed when you place your order.',
                  'Production lead times are typically 7–21 business days depending on complexity. An estimated completion date will be communicated at the time of order.',
                  'You are responsible for providing accurate measurements and design details. We are not liable for fit or design issues arising from incorrect information you provide.',
                  'Changes to design or specifications cannot be made once production has started.',
                  'Custom orders are non-returnable and non-refundable once production has commenced, except in the case of a verified manufacturing defect on our part.',
                ]} />
              </div>

              <div>
                <H3>8. Delivery</H3>
                <Bullets items={[
                  'We deliver nationwide across Nigeria via third-party logistics partners.',
                  'Delivery timeframes are estimates, not guarantees. We are not liable for delays caused by logistics partners, weather, public holidays, or other factors outside our control.',
                  'Risk of loss or damage passes to you upon delivery to the address you provided.',
                  'It is your responsibility to ensure that someone is available to receive the delivery.',
                ]} />
              </div>

              <div>
                <H3>9. Intellectual Property</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  All content on our website — including text, images, logos, product photography, and branding —
                  belongs to ExploreAba or our licensed suppliers and is protected under applicable Nigerian and
                  international intellectual property laws. You may not reproduce, copy, distribute, or use our
                  content for any commercial or public purpose without our prior written consent.
                </p>
              </div>

              <div>
                <H3>10. Limitation of Liability</H3>
                <Bullets items={[
                  'To the fullest extent permitted by law, ExploreAba shall not be liable for indirect, incidental, consequential, or punitive damages arising from your use of our website or products.',
                  'Our total liability in relation to any specific order shall not exceed the amount you paid for that order.',
                  'We are not responsible for losses arising from your reliance on information on our website that you have not independently verified.',
                ]} />
              </div>

              <div>
                <H3>11. Governing Law</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be
                  subject to the exclusive jurisdiction of the courts of Abia State, Nigeria. We encourage you to
                  contact us first so we can resolve any issue amicably before formal proceedings are pursued.
                </p>
              </div>

              <div>
                <H3>12. Updates to These Terms</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We may revise these Terms at any time. The updated version will be published on this page with
                  a revised effective date. Your continued use of our website after changes are posted constitutes
                  acceptance of the revised Terms.
                </p>
              </div>

              <ContactBox />
            </PolicyCard>

            {/* ── 2. PRIVACY POLICY ─────────────────────────── */}
            <PolicyCard id="privacy" emoji="🔒" title="Privacy Policy">
              <InfoBox color="blue">
                ExploreAba is committed to protecting your personal data in compliance with the{' '}
                <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong> and the{' '}
                <strong>Nigeria Data Protection Act (NDPA) 2023</strong>.
              </InfoBox>

              <div>
                <H3>1. Data We Collect</H3>
                <p className="text-sm font-semibold text-gray-800 mb-1">Personal Information</p>
                <Bullets items={['Full name', 'Email address', 'Phone number', 'Delivery address']} />

                <p className="text-sm font-semibold text-gray-800 mt-4 mb-1">Order Information</p>
                <Bullets items={[
                  'Products purchased and order history',
                  'Payment transaction references (we never store full card numbers)',
                  'Support and communication history',
                ]} />

                <p className="text-sm font-semibold text-gray-800 mt-4 mb-1">Technical Information</p>
                <Bullets items={[
                  'IP address and browser type',
                  'Pages visited and time spent on site',
                  'Device type and operating system',
                ]} />
              </div>

              <div>
                <H3>2. How We Use Your Data</H3>
                <Bullets items={[
                  'To process and fulfil your orders, and send you confirmations and delivery updates',
                  'To handle your customer service enquiries promptly',
                  'To send marketing communications — only where you have given explicit consent',
                  'To improve our website and overall shopping experience',
                  'To detect and prevent fraud or abuse',
                  'To comply with legal and regulatory obligations under Nigerian law',
                ]} />
              </div>

              <div>
                <H3>3. Legal Basis for Processing</H3>
                <div className="mt-2 space-y-2">
                  {[
                    ['Contract',          'Necessary to fulfil the orders you place with us'],
                    ['Legitimate Interest','Improving our services and preventing fraud'],
                    ['Consent',           'Marketing communications — you may withdraw at any time by emailing us'],
                    ['Legal Obligation',  'Compliance with Nigerian law and regulatory requirements'],
                  ].map(([basis, reason]) => (
                    <div key={basis} className="flex gap-2 text-sm items-start">
                      <span className="font-bold text-gray-800 shrink-0 w-36">{basis}:</span>
                      <span className="text-gray-600">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <H3>4. Who We Share Your Data With</H3>
                <p className="text-sm text-gray-600 mb-2">
                  We <strong>do not sell</strong> your personal data. We may share it only where strictly necessary:
                </p>
                <Bullets items={[
                  'Paystack — for secure payment processing',
                  'Delivery and logistics partners — to arrange and track your shipment',
                  'Technology and hosting providers — who power our website and email systems',
                  'Nigerian law enforcement or regulatory bodies — where legally required',
                ]} />
                <p className="text-sm text-gray-600 mt-3">
                  All third parties are contractually required to keep your data secure and use it only for the agreed purpose.
                </p>
              </div>

              <div>
                <H3>5. Data Retention</H3>
                <Bullets items={[
                  'Order records: retained for 5 years for accounting and compliance purposes',
                  'Account data: retained until you request deletion or close your account',
                  'Marketing preferences: retained until you unsubscribe or withdraw consent',
                ]} />
              </div>

              <div>
                <H3>6. Your Rights</H3>
                <p className="text-sm text-gray-600 mb-2">Under the NDPR and NDPA, you have the right to:</p>
                <Bullets items={[
                  'Access the personal data we hold about you',
                  'Correct inaccurate or outdated information',
                  'Request deletion of your data (subject to legal retention requirements)',
                  'Object to or restrict certain types of processing',
                  'Withdraw your consent for marketing at any time',
                  'Lodge a complaint with the Nigeria Data Protection Commission (NDPC)',
                ]} />
                <p className="text-sm text-gray-600 mt-3">
                  To exercise any of these rights, email <strong>{EMAIL}</strong>. We will respond within 30 days.
                </p>
              </div>

              <div>
                <H3>7. Security</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use appropriate technical and organisational safeguards — including HTTPS encryption and
                  secure payment processing via Paystack — to protect your data. However, no internet
                  transmission is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <H3>8. Children's Privacy</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Our website is not intended for children under 16. We do not knowingly collect personal data
                  from children. If you believe we have done so inadvertently, contact us immediately and we
                  will delete it.
                </p>
              </div>

              <div>
                <H3>9. Changes to This Policy</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We may update this Privacy Policy as our practices or Nigerian law changes. We will notify
                  you of material changes via email or a prominent notice on our website.
                </p>
              </div>

              <ContactBox />
            </PolicyCard>

            {/* ── 3. RETURNS POLICY ─────────────────────────── */}
            <PolicyCard id="returns" emoji="📦" title="Returns Policy">
              <p className="text-sm text-gray-600 leading-relaxed">
                We want you to be delighted with every purchase from ExploreAba. If something isn't right,
                we offer a <strong>14-day return window</strong> from the confirmed delivery date, subject to
                the conditions below.
              </p>

              <div>
                <H3>1. Eligibility for Returns</H3>
                <p className="text-sm text-gray-600 mb-2">To qualify for a return, <strong>all</strong> of the following must be true:</p>
                <Bullets items={[
                  'Your return request is made within 14 days of the confirmed delivery date.',
                  'The item is in its original, unused, and unworn condition.',
                  'All original tags, labels, and packaging are intact and attached.',
                  'The item has not been washed, altered, perfumed, stained, or damaged after delivery.',
                  'You have your order number or proof of purchase.',
                ]} />
              </div>

              <div>
                <H3>2. Items That Cannot Be Returned</H3>
                <Bullets items={[
                  'Custom/bespoke orders — items made to your measurements, design instructions, or personal specifications (except in the case of a verified manufacturing defect)',
                  'Underwear, lingerie, or intimate apparel (for hygiene reasons)',
                  'Items marked as "Final Sale" or "Clearance" at the time of purchase',
                  'Items returned after the 14-day return window has closed',
                  'Items showing signs of wear, washing, alteration, staining, or damage caused by the customer',
                ]} />
              </div>

              <div>
                <H3>3. Defective or Incorrect Items</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If your item arrives defective, damaged (not by you), is significantly different from the
                  product listing, or is the wrong item entirely — contact us within{' '}
                  <strong>48 hours of delivery</strong> with clear photos and your order number. We will
                  arrange a free return, replacement, or full refund at no extra cost to you.
                </p>
              </div>

              <div>
                <H3>4. How to Return an Item</H3>
                <Steps steps={[
                  { n: '01', text: `Email ${EMAIL} with your order number, the item(s) you wish to return, and the reason for the return.` },
                  { n: '02', text: 'Our team will review your request within 2–3 business days and issue a return authorisation with packaging and shipping instructions.' },
                  { n: '03', text: 'Pack the item(s) securely and ship using a trackable courier. Return shipping costs are your responsibility unless the return is due to our error or a manufacturing defect.' },
                  { n: '04', text: 'Once we receive and inspect the returned item(s), we will process your refund or exchange within 5–7 business days.' },
                ]} />
              </div>

              <div>
                <H3>5. Exchanges</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We offer exchanges for the same product in a different size or colour, subject to stock
                  availability. Email us to check availability and arrange the exchange. The same eligibility
                  conditions apply as for returns.
                </p>
              </div>

              <div>
                <H3>6. Items Lost in Return Transit</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We strongly recommend using a trackable courier for all returns. ExploreAba is not
                  responsible for return parcels lost or damaged in transit. Please retain your proof of postage.
                </p>
              </div>

              <ContactBox />
            </PolicyCard>

            {/* ── 4. REFUND POLICY ──────────────────────────── */}
            <PolicyCard id="refunds" emoji="💳" title="Refund Policy">

              <div>
                <H3>1. When Refunds Are Issued</H3>
                <p className="text-sm text-gray-600 mb-2">You are entitled to a refund in the following situations:</p>
                <Bullets items={[
                  'You returned an eligible item within the 14-day window and it has passed our inspection.',
                  'We cannot fulfil your order (e.g. item out of stock, unable to deliver to your location).',
                  'You received a defective or incorrect item and have chosen a refund over a replacement.',
                  'Your standard order was cancelled before it was dispatched.',
                  'Your custom order was cancelled before production commenced (subject to the conditions in Section 5 below).',
                ]} />
              </div>

              <div>
                <H3>2. When Refunds Will NOT Be Issued</H3>
                <Bullets items={[
                  'For custom/bespoke orders once production has started.',
                  'For items returned outside the 14-day return window.',
                  'For items not meeting our return eligibility conditions (worn, washed, damaged, altered).',
                  'For change of mind on a custom order after production has commenced.',
                  'For the non-refundable portion of a custom order deposit (see Section 5).',
                  'For delivery/shipping fees, which are non-refundable except where the error is entirely ours.',
                ]} />
              </div>

              <div>
                <H3>3. Partial Refunds</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  In certain circumstances we may issue a partial refund — for example, if a returned item is
                  not in fully original condition, or a promotional discount was applied to the order. We will
                  always communicate clearly before processing a partial refund.
                </p>
              </div>

              <div>
                <H3>4. Refund Timeline</H3>
                <InfoBox color="amber">
                  <strong>⏱ How long will my refund take?</strong>
                  <br />
                  Approved refunds are typically received within <strong>7–14 business days</strong> from the
                  date of approval.
                </InfoBox>
                <Bullets items={[
                  'We process approved refunds on our end within 5–7 business days of approval.',
                  'The refund is sent back to your original payment method (card, bank account, or wallet).',
                  'Your bank or card provider may take a further 3–5 business days — this is outside our control.',
                  'You will receive an email notification once the refund has been initiated from our side.',
                ]} />
              </div>

              <div>
                <H3>5. Custom Order Cancellations & Refunds</H3>
                <Bullets items={[
                  'Cancelled before production begins: your deposit will be refunded minus a 10% administrative fee to cover processing costs.',
                  'Cancelled after production has started: the deposit is forfeited and no refund will be issued.',
                  'Order completed and ready for delivery: no refund is available, except in the case of a verified manufacturing defect or significant deviation from the agreed specifications.',
                  'Manufacturing defect (our fault): we will offer a free remake or a full refund — whichever you prefer.',
                ]} />
              </div>

              <div>
                <H3>6. Refund Method</H3>
                <Bullets items={[
                  'Refunds are always returned to the original payment method used for the purchase.',
                  'For bank transfer payments, you will need to supply your bank account details when requesting the refund.',
                  'We do not issue cash refunds.',
                  'Store credit may be offered as an alternative only if you expressly prefer it.',
                ]} />
              </div>

              <div>
                <H3>7. How to Request a Refund</H3>
                <p className="text-sm text-gray-600 mb-3">Email <strong>{EMAIL}</strong> with the following:</p>
                <Bullets items={[
                  'Your order number',
                  'A clear description of the reason for your refund request',
                  'Clear photos of the item (if defective or incorrect)',
                  'Your bank account details (if your original payment was a bank transfer)',
                ]} />
              </div>

              <ContactBox />
            </PolicyCard>

            {/* ── 5. COOKIE POLICY ──────────────────────────── */}
            <PolicyCard id="cookies" emoji="🍪" title="Cookie Policy">

              <div>
                <H3>1. What Are Cookies?</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cookies are small text files placed on your device when you visit a website. They help the
                  site recognise your device on return visits, remember your preferences, and improve your
                  overall browsing experience.
                </p>
              </div>

              <div>
                <H3>2. Types of Cookies We Use</H3>
                {[
                  {
                    type: '🔧 Essential Cookies',
                    desc: 'Strictly necessary for the website to function. These include session cookies that keep you logged in and maintain your shopping cart between pages. These cannot be disabled — without them, the site will not work correctly.',
                  },
                  {
                    type: '📊 Analytics Cookies',
                    desc: 'We use tools such as Google Analytics to understand how visitors use our site — which pages are most visited, how long people stay, and where they leave. All data is anonymised and does not identify you personally. This helps us improve the site.',
                  },
                  {
                    type: '⚙️ Preference Cookies',
                    desc: 'These remember your settings and browsing history on our site (such as recently viewed products) to make return visits easier and faster.',
                  },
                  {
                    type: '📣 Marketing Cookies',
                    desc: 'With your consent, these may be used to show you relevant advertisements on other platforms. You can opt out at any time through your browser settings or by contacting us.',
                  },
                ].map(({ type, desc }) => (
                  <div key={type} className="mt-4 first:mt-2">
                    <p className="text-sm font-bold text-gray-800 mb-1">{type}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <H3>3. Third-Party Cookies</H3>
                <p className="text-sm text-gray-600 mb-2">Some cookies on our site are set by third-party services we use:</p>
                <Bullets items={[
                  'Paystack — for secure payment processing',
                  'Google Analytics — for website traffic and behaviour analysis',
                ]} />
                <p className="text-sm text-gray-600 mt-3">
                  These third parties operate under their own privacy and cookie policies, which we recommend reviewing.
                </p>
              </div>

              <div>
                <H3>4. Managing Cookies</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  You can control and manage cookies through your browser's settings. Most browsers allow you
                  to refuse, delete, or selectively accept cookies. Note that disabling essential cookies may
                  prevent parts of our website from functioning correctly — for example, you may not be able
                  to log in or add items to your cart. For guidance, visit{' '}
                  <a
                    href="https://www.allaboutcookies.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    www.allaboutcookies.org
                  </a>.
                </p>
              </div>

              <div>
                <H3>5. Updates to This Policy</H3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We may update this Cookie Policy as our tools, partners, or legal requirements change.
                  Significant updates will be communicated via a notice on our website.
                </p>
              </div>

              <ContactBox />
            </PolicyCard>

          </div>{/* end content */}
        </div>{/* end flex */}
      </div>
    </div>
  );
};

export default LegalPage;