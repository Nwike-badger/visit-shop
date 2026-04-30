// ═══════════════════════════════════════════════════════════════════════════
//  customDesignData.js
//  Single source of truth for the custom order experience.
//  All measurements in INCHES (standard for tailoring in Nigeria).
//
//  To add a category, add an entry to CATEGORIES below.
//  To add admin styles, push images to a category's `adminStyles` array
//  (or load them from your backend and pass them into the components).
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
//  CATEGORIES
// ───────────────────────────────────────────────────────────────────────────
//  gender: 'men' | 'women' | 'unisex'
//  measurementSet: which measurements apply (keys reference MEASUREMENT_SETS)
//  priceFrom: hint shown on cards — admin confirms final via quote
//  leadTime: typical turnaround
//  silhouette: SVG path for the category card (will fill with currentColor)
// ───────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: 'agbada',
    name: 'Agbada',
    tagline: 'Flowing grandeur, ceremonial weight',
    description: 'The three-piece statement — outer robe, inner shirt, and trouser. For owambe, weddings, and arrival.',
    gender: 'men',
    priceFrom: 35000,
    leadTime: '14-21 days',
    accent: '#0d4d2a',
    silhouette: 'M50 20 Q40 22 35 30 L30 50 L20 60 L18 90 L25 95 L35 88 L40 95 L45 88 L50 95 L55 88 L60 95 L65 88 L75 95 L82 90 L80 60 L70 50 L65 30 Q60 22 50 20 Z',
    measurementSet: 'menFull',
    sampleStyles: [
      { id: 'agbada-classic', name: 'Classic Royal', tone: 'Cream / Gold embroidery' },
      { id: 'agbada-modern', name: 'Modern Slim', tone: 'Navy / Tonal stitching' },
      { id: 'agbada-emir', name: 'Emir Cut', tone: 'White / Heavy embroidery' },
      { id: 'agbada-minimal', name: 'Minimal Sheen', tone: 'Black / No embroidery' },
    ],
  },
  {
    id: 'senator',
    name: 'Senator',
    tagline: 'Tailored authority',
    description: 'Two-piece long-sleeve top and trouser. The everyday formal for Sundays, offices, and dinners.',
    gender: 'men',
    priceFrom: 22000,
    leadTime: '7-14 days',
    accent: '#1a3a52',
    silhouette: 'M50 20 Q40 22 38 30 L35 50 L25 55 L25 95 L40 95 L40 60 L60 60 L60 95 L75 95 L75 55 L65 50 L62 30 Q60 22 50 20 Z',
    measurementSet: 'menFull',
    sampleStyles: [
      { id: 'senator-classic', name: 'Mandarin Collar', tone: 'Charcoal' },
      { id: 'senator-piped', name: 'Piped Detail', tone: 'Navy / Cream piping' },
      { id: 'senator-buttoned', name: 'Full-button Front', tone: 'Olive' },
      { id: 'senator-short', name: 'Short Sleeve', tone: 'Beige' },
    ],
  },
  {
    id: 'suit',
    name: 'Suit',
    tagline: 'Sharp Western tailoring',
    description: 'Two or three-piece western suit. Single or double-breasted, made for you.',
    gender: 'men',
    priceFrom: 45000,
    leadTime: '14-21 days',
    accent: '#1c1c1c',
    silhouette: 'M50 22 L42 28 L36 50 L28 56 L28 92 L42 92 L42 60 L58 60 L58 92 L72 92 L72 56 L64 50 L58 28 L50 22 Z',
    measurementSet: 'menFull',
    sampleStyles: [
      { id: 'suit-2pc-2btn', name: 'Two-Button', tone: 'Charcoal' },
      { id: 'suit-3pc', name: 'Three-Piece', tone: 'Navy / Waistcoat' },
      { id: 'suit-double', name: 'Double-Breasted', tone: 'Black' },
      { id: 'suit-summer', name: 'Summer Linen', tone: 'Sand' },
    ],
  },
  {
    id: 'kaftan',
    name: 'Kaftan',
    tagline: 'Effortless and elevated',
    description: 'Long flowing top, often paired with matching trouser. Comfortable enough for home, sharp enough for events.',
    gender: 'unisex',
    priceFrom: 18000,
    leadTime: '7-10 days',
    accent: '#7a4419',
    silhouette: 'M50 20 Q42 22 38 32 L30 95 L40 95 L45 50 L55 50 L60 95 L70 95 L62 32 Q58 22 50 20 Z',
    measurementSet: 'unisexUpperLong',
    sampleStyles: [
      { id: 'kaftan-classic', name: 'Classic Long', tone: 'Mandarin collar' },
      { id: 'kaftan-vneck', name: 'V-Neck Embroidered', tone: 'Chest detail' },
      { id: 'kaftan-short', name: 'Knee Length', tone: 'Casual cut' },
      { id: 'kaftan-cape', name: 'Cape-Style', tone: 'Modern silhouette' },
    ],
  },
  {
    id: 'shirt',
    name: 'Shirt',
    tagline: 'Built for your shoulders',
    description: 'Formal or casual. Native style, mandarin, or full Western collar. Long or short sleeve.',
    gender: 'unisex',
    priceFrom: 12000,
    leadTime: '5-7 days',
    accent: '#2c5f7c',
    silhouette: 'M35 25 L50 22 L65 25 L72 35 L70 70 L60 70 L60 60 L40 60 L40 70 L30 70 L28 35 Z',
    measurementSet: 'unisexUpperShort',
    sampleStyles: [
      { id: 'shirt-classic', name: 'Classic Western', tone: 'Pointed collar' },
      { id: 'shirt-mandarin', name: 'Mandarin Collar', tone: 'No collar fold' },
      { id: 'shirt-native', name: 'Native Embroidered', tone: 'Chest detail' },
      { id: 'shirt-short', name: 'Short Sleeve', tone: 'Casual' },
    ],
  },
  {
    id: 'trouser',
    name: 'Trouser',
    tagline: 'The right break, the right rise',
    description: 'Western-cut trousers, native-cut, or cropped. Pleated or flat-front, your call.',
    gender: 'unisex',
    priceFrom: 10000,
    leadTime: '5-7 days',
    accent: '#4a3a2a',
    silhouette: 'M35 20 L65 20 L62 50 L58 95 L52 95 L50 50 L48 95 L42 95 L38 50 Z',
    measurementSet: 'unisexLower',
    sampleStyles: [
      { id: 'trouser-flat', name: 'Flat Front', tone: 'Slim taper' },
      { id: 'trouser-pleated', name: 'Pleated', tone: 'Classic break' },
      { id: 'trouser-cropped', name: 'Cropped Ankle', tone: 'Modern cut' },
      { id: 'trouser-wide', name: 'Wide Leg', tone: 'Relaxed' },
    ],
  },
  {
    id: 'dress',
    name: 'Dress',
    tagline: 'Made to your shape',
    description: 'Day, evening, or occasion. Ankara prints, lace, plain — long, midi, or mini.',
    gender: 'women',
    priceFrom: 18000,
    leadTime: '7-14 days',
    accent: '#7a2848',
    silhouette: 'M50 20 Q42 22 40 32 L35 50 L25 95 L40 92 L50 95 L60 92 L75 95 L65 50 L60 32 Q58 22 50 20 Z',
    measurementSet: 'womenFull',
    sampleStyles: [
      { id: 'dress-aline', name: 'A-Line Midi', tone: 'Flared from waist' },
      { id: 'dress-bodycon', name: 'Bodycon', tone: 'Fitted throughout' },
      { id: 'dress-mermaid', name: 'Mermaid', tone: 'Fitted then flared' },
      { id: 'dress-empire', name: 'Empire Waist', tone: 'Under-bust seam' },
    ],
  },
  {
    id: 'iro-buba',
    name: 'Iro & Buba',
    tagline: 'Heritage, perfectly cut',
    description: 'The wrapper and blouse pairing. Traditional elegance with custom embroidery options.',
    gender: 'women',
    priceFrom: 25000,
    leadTime: '10-14 days',
    accent: '#5c2d2d',
    silhouette: 'M50 22 L40 28 L35 45 L30 50 L70 50 L65 45 L60 28 Z M30 55 L70 55 L72 95 L28 95 Z',
    measurementSet: 'womenUpperLower',
    sampleStyles: [
      { id: 'irobuba-classic', name: 'Classic with Gele', tone: 'Aso-oke trim' },
      { id: 'irobuba-modern', name: 'Modern Cut', tone: 'Tailored buba' },
      { id: 'irobuba-embroidered', name: 'Heavy Embroidery', tone: 'Beaded neckline' },
      { id: 'irobuba-pleated', name: 'Pleated Iro', tone: 'Structured drape' },
    ],
  },
  {
    id: 'skirt-blouse',
    name: 'Skirt & Blouse',
    tagline: 'Your two pieces, your way',
    description: 'Mix and match. Pencil, A-line, or flared skirt with a blouse cut to your bust.',
    gender: 'women',
    priceFrom: 20000,
    leadTime: '7-14 days',
    accent: '#6a3a5a',
    silhouette: 'M50 22 L40 28 L35 50 L65 50 L60 28 Z M35 55 L65 55 L70 95 L30 95 Z',
    measurementSet: 'womenUpperLower',
    sampleStyles: [
      { id: 'skb-pencil', name: 'Pencil Skirt', tone: 'Fitted blouse' },
      { id: 'skb-aline', name: 'A-Line Skirt', tone: 'Peplum top' },
      { id: 'skb-flared', name: 'Flared Skirt', tone: 'Crop blouse' },
      { id: 'skb-midi', name: 'Midi + Off-shoulder', tone: 'Elegant' },
    ],
  },
  {
    id: 'jumpsuit',
    name: 'Jumpsuit',
    tagline: 'One piece, all power',
    description: 'Wide-leg, slim, or culotte. Sleeveless, capped, or full-sleeve — fit to your torso and inseam exactly.',
    gender: 'women',
    priceFrom: 22000,
    leadTime: '10-14 days',
    accent: '#3a4a6a',
    silhouette: 'M50 20 Q42 22 40 32 L35 50 L33 75 L48 95 L52 75 L52 95 L48 95 L52 75 L67 95 L65 75 L65 50 L60 32 Q58 22 50 20 Z',
    measurementSet: 'womenFull',
    sampleStyles: [
      { id: 'jumpsuit-wide', name: 'Wide Leg', tone: 'Belted waist' },
      { id: 'jumpsuit-slim', name: 'Slim Leg', tone: 'V-neck' },
      { id: 'jumpsuit-culotte', name: 'Culotte', tone: 'Cropped' },
      { id: 'jumpsuit-offshoulder', name: 'Off-Shoulder', tone: 'Statement' },
    ],
  },
];

// ───────────────────────────────────────────────────────────────────────────
//  MEASUREMENT FIELDS — every possible measurement, with how-to guide
// ───────────────────────────────────────────────────────────────────────────

export const MEASUREMENT_FIELDS = {
  // Universal upper body
  neck: {
    label: 'Neck',
    unit: 'in',
    group: 'upper',
    guide: 'Wrap the tape around the base of your neck where a collar would sit. Keep one finger between the tape and your skin for breathing room.',
    placeholder: '14-18',
  },
  shoulder: {
    label: 'Shoulder Width',
    unit: 'in',
    group: 'upper',
    guide: 'Measure across the back from the tip of one shoulder bone to the other. Keep the tape flat and straight.',
    placeholder: '16-20',
  },
  sleeve: {
    label: 'Sleeve Length',
    unit: 'in',
    group: 'upper',
    guide: 'From the shoulder seam (where your arm meets your shoulder) down to where you want the sleeve to end at your wrist. Arm slightly bent.',
    placeholder: '23-26',
  },
  bicep: {
    label: 'Bicep',
    unit: 'in',
    group: 'upper',
    guide: 'Wrap the tape around the fullest part of your upper arm. Keep your arm relaxed, not flexed.',
    placeholder: '11-16',
  },
  wrist: {
    label: 'Wrist',
    unit: 'in',
    group: 'upper',
    guide: 'Wrap the tape around your wrist where a watch or cuff would sit.',
    placeholder: '6-8',
  },
  backLength: {
    label: 'Back Length',
    unit: 'in',
    group: 'upper',
    guide: 'From the bone at the base of your neck (the one that sticks out when you tilt your head down) straight down to your natural waistline.',
    placeholder: '16-20',
  },

  // Men-specific
  chest: {
    label: 'Chest',
    unit: 'in',
    group: 'upper',
    guide: 'Wrap the tape around the fullest part of your chest, just under your armpits. Keep it level all the way around.',
    placeholder: '36-46',
  },

  // Women-specific
  bust: {
    label: 'Bust',
    unit: 'in',
    group: 'upper',
    guide: 'Wrap the tape around the fullest part of your bust, keeping it parallel to the floor. Wear a regular bra (not padded or push-up).',
    placeholder: '32-44',
  },
  underBust: {
    label: 'Under Bust',
    unit: 'in',
    group: 'upper',
    guide: 'Wrap the tape around your ribcage, directly under your bust where the bra band sits.',
    placeholder: '28-38',
  },
  shoulderToBust: {
    label: 'Shoulder to Bust Point',
    unit: 'in',
    group: 'upper',
    guide: 'From the top of your shoulder (where the strap sits) straight down to the fullest point of your bust.',
    placeholder: '9-12',
  },
  bustPointDistance: {
    label: 'Bust Point to Point',
    unit: 'in',
    group: 'upper',
    guide: 'The horizontal distance between the two fullest points of your bust. Used for accurate dart placement.',
    placeholder: '6-9',
  },
  frontLength: {
    label: 'Front Length',
    unit: 'in',
    group: 'upper',
    guide: 'From the base of your neck, down the front of your body, to your natural waistline.',
    placeholder: '14-18',
  },

  // Lower body — universal
  waist: {
    label: 'Natural Waist',
    unit: 'in',
    group: 'lower',
    guide: 'The narrowest part of your torso — usually about an inch above your belly button. Keep the tape level.',
    placeholder: '26-40',
  },
  hip: {
    label: 'Hip',
    unit: 'in',
    group: 'lower',
    guide: 'The fullest part of your hips and seat — usually about 7-9 inches below your natural waist. Keep the tape parallel to the floor.',
    placeholder: '34-46',
  },
  highHip: {
    label: 'High Hip',
    unit: 'in',
    group: 'lower',
    guide: 'About 4 inches below your natural waist — across the top of your hipbones.',
    placeholder: '32-44',
  },
  trouserWaist: {
    label: 'Trouser Waist',
    unit: 'in',
    group: 'lower',
    guide: 'Where you actually want your trousers to sit. Often slightly below the natural waist.',
    placeholder: '28-42',
  },
  inseam: {
    label: 'Inseam',
    unit: 'in',
    group: 'lower',
    guide: 'From the top of your inner thigh (crotch seam) straight down the inside of your leg to where you want the trouser to end.',
    placeholder: '28-34',
  },
  outseam: {
    label: 'Outseam',
    unit: 'in',
    group: 'lower',
    guide: 'From your trouser waist down the outside of your leg to where the trouser should end.',
    placeholder: '38-44',
  },
  thigh: {
    label: 'Thigh',
    unit: 'in',
    group: 'lower',
    guide: 'Around the fullest part of your upper thigh, near the crotch.',
    placeholder: '20-28',
  },
  knee: {
    label: 'Knee',
    unit: 'in',
    group: 'lower',
    guide: 'Around your knee, with leg slightly bent.',
    placeholder: '14-18',
  },
  ankle: {
    label: 'Trouser Bottom',
    unit: 'in',
    group: 'lower',
    guide: 'How wide you want the trouser opening at the ankle.',
    placeholder: '13-18',
  },

  // Garment lengths
  topLength: {
    label: 'Top Length',
    unit: 'in',
    group: 'length',
    guide: 'From the top of your shoulder straight down to where you want the top to end.',
    placeholder: '24-32',
  },
  dressLength: {
    label: 'Dress Length',
    unit: 'in',
    group: 'length',
    guide: 'From the top of your shoulder straight down to where you want the dress to end (mini, knee, midi, ankle, or floor).',
    placeholder: '36-58',
  },
  skirtLength: {
    label: 'Skirt Length',
    unit: 'in',
    group: 'length',
    guide: 'From your natural waist down to where you want the skirt to end.',
    placeholder: '18-40',
  },
  fullLength: {
    label: 'Full Garment Length',
    unit: 'in',
    group: 'length',
    guide: 'For agbada or long kaftans — from the top of your shoulder all the way down to where you want the hem (often ankle).',
    placeholder: '52-60',
  },
};

// ───────────────────────────────────────────────────────────────────────────
//  MEASUREMENT SETS — which fields each garment type needs
// ───────────────────────────────────────────────────────────────────────────

export const MEASUREMENT_SETS = {
  menFull: [
    'neck', 'chest', 'shoulder', 'sleeve', 'bicep', 'wrist',
    'waist', 'hip', 'trouserWaist', 'thigh', 'knee', 'ankle',
    'inseam', 'outseam', 'fullLength',
  ],
  unisexUpperLong: [
    'neck', 'chest', 'shoulder', 'sleeve', 'bicep', 'wrist',
    'waist', 'hip', 'fullLength',
  ],
  unisexUpperShort: [
    'neck', 'chest', 'shoulder', 'sleeve', 'bicep', 'wrist',
    'waist', 'topLength',
  ],
  unisexLower: [
    'trouserWaist', 'hip', 'thigh', 'knee', 'ankle',
    'inseam', 'outseam',
  ],
  womenFull: [
    'bust', 'underBust', 'shoulderToBust', 'bustPointDistance',
    'shoulder', 'sleeve', 'bicep', 'wrist',
    'waist', 'highHip', 'hip', 'frontLength', 'backLength',
    'thigh', 'knee', 'inseam', 'dressLength',
  ],
  womenUpperLower: [
    'bust', 'underBust', 'shoulderToBust',
    'shoulder', 'sleeve', 'bicep',
    'waist', 'hip', 'highHip',
    'topLength', 'skirtLength',
  ],
};

// ───────────────────────────────────────────────────────────────────────────
//  STANDARD SIZE CHARTS
// ───────────────────────────────────────────────────────────────────────────

export const SIZE_CHARTS = {
  men: [
    { size: 'S',   chest: '36-38', waist: '30-32', hip: '36-38', neck: '14-14.5' },
    { size: 'M',   chest: '38-40', waist: '32-34', hip: '38-40', neck: '15-15.5' },
    { size: 'L',   chest: '40-42', waist: '34-36', hip: '40-42', neck: '16-16.5' },
    { size: 'XL',  chest: '42-44', waist: '36-38', hip: '42-44', neck: '17-17.5' },
    { size: 'XXL', chest: '44-46', waist: '38-40', hip: '44-46', neck: '18-18.5' },
    { size: '3XL', chest: '46-48', waist: '40-42', hip: '46-48', neck: '19-19.5' },
  ],
  women: [
    { size: 'XS / 6',   bust: '32-33', waist: '24-25', hip: '34-35' },
    { size: 'S / 8',    bust: '34-35', waist: '26-27', hip: '36-37' },
    { size: 'M / 10',   bust: '36-37', waist: '28-29', hip: '38-39' },
    { size: 'L / 12',   bust: '38-39', waist: '30-31', hip: '40-41' },
    { size: 'XL / 14',  bust: '40-41', waist: '32-33', hip: '42-43' },
    { size: 'XXL / 16', bust: '42-43', waist: '34-35', hip: '44-45' },
    { size: '3XL / 18', bust: '44-46', waist: '36-38', hip: '46-48' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
//  FITTING PREFERENCES
// ───────────────────────────────────────────────────────────────────────────

export const FITTING_PREFERENCES = [
  { id: 'slim',    name: 'Slim Fit',    desc: 'Close to body, tapered through waist and arms.' },
  { id: 'regular', name: 'Regular Fit', desc: 'Classic comfortable fit with room to move.' },
  { id: 'loose',   name: 'Loose Fit',   desc: 'Relaxed and roomy. More flow, less structure.' },
];

// ───────────────────────────────────────────────────────────────────────────
//  HELPERS
// ───────────────────────────────────────────────────────────────────────────

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id);

export const getMeasurementsForCategory = (category) =>
  (MEASUREMENT_SETS[category?.measurementSet] || []).map((id) => ({
    id,
    ...MEASUREMENT_FIELDS[id],
  }));

// localStorage keys (kept centralized so backend swap is one-line)
export const STORAGE_KEYS = {
  draft: 'exploreaba_custom_order_draft',
  measurements: 'exploreaba_saved_measurements',
  orders: 'exploreaba_custom_orders',
};

// WhatsApp number for direct consultation (replace with real number)
export const WHATSAPP_NUMBER = '2348000000000';