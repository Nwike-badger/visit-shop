import { useState } from 'react';

// Full class strings so Tailwind's scanner picks them up
const TILE_COLORS = [
  'bg-green-600', 'bg-cyan-600', 'bg-violet-600',
  'bg-red-600', 'bg-orange-600', 'bg-sky-600',
];
const colorFor = (name) =>
  TILE_COLORS[(name ? name.charCodeAt(0) : 0) % TILE_COLORS.length];

const BrandLogo = ({ brand, className = 'w-16 h-16', textClassName = 'text-2xl' }) => {
  // Track WHICH url failed (not just "failed") so a new logo gets a fresh attempt
  const [failedUrl, setFailedUrl] = useState(null);
  const showImage = brand?.logoUrl && brand.logoUrl !== failedUrl;
  const initial = brand?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  if (showImage) {
    return (
      <div className={`${className} rounded-2xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0`}>
        <img
          src={brand.logoUrl}
          alt={`${brand.name || 'Brand'} logo`}
          loading="lazy"
          onError={() => setFailedUrl(brand.logoUrl)}
          className="w-full h-full object-contain p-1.5"
        />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl ${colorFor(brand?.name)} flex items-center justify-center shrink-0`}>
      <span className={`${textClassName} font-black text-white`}>{initial}</span>
    </div>
  );
};

export default BrandLogo;