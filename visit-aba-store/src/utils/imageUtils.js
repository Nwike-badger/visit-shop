/**
 * imageUtils.js
 *
 * Centralised image URL optimiser.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  CURRENT:  Unsplash URLs (seeded in MongoDB)            │
 * │  FUTURE:   Cloudinary / any provider — drop-in ready    │
 * └─────────────────────────────────────────────────────────┘
 *
 * When you move to Cloudinary:
 *   1. Upload images and store the raw Cloudinary URL in MongoDB
 *      e.g. https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1234/products/shoe.jpg
 *   2. The `buildCloudinaryUrl` branch below automatically kicks in.
 *   3. No other code in the app needs to change.
 *
 * Supported providers
 *   • Unsplash  — rewrites ?w= and ?q= query params
 *   • Cloudinary — injects w_, q_, f_auto transformation segment
 *   • Imgix     — rewrites w=, q=, auto=format query params
 *   • (anything else) — returns URL unchanged; images still work, just not resized
 */

// ─── Provider detectors ───────────────────────────────────────────────────────

const isUnsplash   = (url) => url.includes('unsplash.com');
const isCloudinary = (url) => url.includes('res.cloudinary.com');
const isImgix      = (url) => url.includes('.imgix.net');

// ─── Per-provider builders ────────────────────────────────────────────────────

/**
 * Unsplash: rewrites existing ?w= / ?q= params in the seeded URL.
 * Works without touching MongoDB.
 */
const buildUnsplashUrl = (url, width, quality) => {
  let result = url;
  // replace existing w= or add it
  if (/[?&]w=\d+/.test(result)) {
    result = result.replace(/([?&]w=)\d+/, `$1${width}`);
  } else {
    result += (result.includes('?') ? '&' : '?') + `w=${width}`;
  }
  // replace existing q= or add it
  if (/[?&]q=\d+/.test(result)) {
    result = result.replace(/([?&]q=)\d+/, `$1${quality}`);
  } else {
    result += `&q=${quality}`;
  }
  // always request WebP if not already specified
  if (!/[?&]fm=/.test(result)) result += '&fm=webp';
  return result;
};

/**
 * Cloudinary: inserts a transformation segment right after /upload/
 * e.g. …/upload/v123/products/shoe.jpg
 *   → …/upload/w_400,q_75,f_auto/v123/products/shoe.jpg
 *
 * If your URLs already have a transformation segment (e.g. /upload/t_thumb/)
 * this replaces it so you always get the right size.
 */
const buildCloudinaryUrl = (url, width, quality) => {
  const transform = `w_${width},q_${quality},f_auto,c_fill`;
  // Remove any existing transformation segment then re-insert
  return url.replace(
    /\/upload\/((?:[a-z_,0-9]+\/)+)?/,
    `/upload/${transform}/`
  );
};

/**
 * Imgix: rewrites / adds w, q, auto=format query params.
 */
const buildImgixUrl = (url, width, quality) => {
  const u = new URL(url);
  u.searchParams.set('w', width);
  u.searchParams.set('q', quality);
  u.searchParams.set('auto', 'format');
  return u.toString();
};

// ─── Main optimiser ───────────────────────────────────────────────────────────

/**
 * optimizeUrl
 * @param {string|null|undefined} url   - raw image URL from MongoDB
 * @param {object} opts
 * @param {number} opts.width           - target pixel width  (default 400)
 * @param {number} opts.quality         - quality 1–100       (default 75)
 * @returns {string} optimised URL (or original if provider not recognised)
 */
export const optimizeUrl = (url, { width = 400, quality = 75 } = {}) => {
  if (!url || typeof url !== 'string') return url;

  try {
    if (isUnsplash(url))   return buildUnsplashUrl(url, width, quality);
    if (isCloudinary(url)) return buildCloudinaryUrl(url, width, quality);
    if (isImgix(url))      return buildImgixUrl(url, width, quality);
  } catch {
    // If URL parsing fails for any reason, return the original — never crash the UI
    return url;
  }

  // Unknown provider: return as-is; image still loads, just at original size
  return url;
};

// ─── Semantic presets ─────────────────────────────────────────────────────────
// Use these throughout the app instead of calling optimizeUrl with magic numbers.

/** Product cards, search results, wishlist thumbnails — 2-col mobile grid */
export const thumbUrl  = (url) => optimizeUrl(url, { width: 400, quality: 75 });

/** Product detail page main image, category banners */
export const mediumUrl = (url) => optimizeUrl(url, { width: 800, quality: 80 });

/** Full-width hero sections */
export const heroUrl   = (url) => optimizeUrl(url, { width: 1400, quality: 85 });

/** Tiny placeholder / blur-up (future use with CSS blur trick) */
export const tinyUrl   = (url) => optimizeUrl(url, { width: 40, quality: 30 });

/**
 * srcSet helper — returns a `srcset` string for responsive <img>
 * so the browser picks the best size automatically.
 *
 * Usage:
 *   <img src={thumbUrl(url)} srcSet={makeSrcSet(url)} sizes="(max-width:640px) 50vw, 20vw" />
 */
export const makeSrcSet = (url) => {
  if (!url) return undefined;
  return [
    `${optimizeUrl(url, { width: 300, quality: 70 })} 300w`,
    `${optimizeUrl(url, { width: 400, quality: 75 })} 400w`,
    `${optimizeUrl(url, { width: 600, quality: 80 })} 600w`,
    `${optimizeUrl(url, { width: 800, quality: 80 })} 800w`,
  ].join(', ');
};