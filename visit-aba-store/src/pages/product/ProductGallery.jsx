import React, { useState, useRef, useCallback } from 'react';
import { PlayCircle, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

const isVideo = (url) => Boolean(url?.match(/\.(mp4|webm|ogg)$/i));

const ProductGallery = ({ images = [] }) => {
  const safeImages = images.length > 0 ? images : [null]; // guard: always at least one slot
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const mainRef = useRef(null);

  // ── Mouse-tracking zoom (follows cursor) ────────────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const rect = mainRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setZoom({ active: false, x: 50, y: 50 });
  }, []);

  // ── Touch/swipe on mobile ───────────────────────────────────────────────────
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const prev = () => setActiveIdx(i => (i - 1 + safeImages.length) % safeImages.length);
  const next = () => setActiveIdx(i => (i + 1) % safeImages.length);

  const activeUrl = safeImages[activeIdx];
  const isActiveVideo = isVideo(activeUrl);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 sticky top-24">

      {/* ── Thumbnails ─────────────────────────────────────────────────────── */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[580px] pb-1 lg:pb-0 lg:pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {safeImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`
              relative flex-shrink-0 w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-xl overflow-hidden
              border-2 transition-all duration-200 group
              ${activeIdx === idx
                ? 'border-gray-900 shadow-md'
                : 'border-gray-100 hover:border-gray-300'}
            `}
          >
            {img === null ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">?</div>
            ) : isVideo(img) ? (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <PlayCircle size={20} className="text-white opacity-80" />
              </div>
            ) : (
              <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
            )}
            {activeIdx === idx && (
              <div className="absolute inset-0 bg-gray-900/5 rounded-xl" />
            )}
          </button>
        ))}
      </div>

      {/* ── Main Display ───────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-0">
        <div
          ref={mainRef}
          onMouseMove={!isActiveVideo ? handleMouseMove : undefined}
          onMouseLeave={!isActiveVideo ? handleMouseLeave : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`
            relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100
            aspect-square lg:aspect-auto lg:h-[580px] select-none
            ${!isActiveVideo ? 'cursor-crosshair' : ''}
          `}
        >
          {activeUrl === null ? (
            // Empty state
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
              <ZoomIn size={40} strokeWidth={1} />
              <p className="text-xs mt-2 font-medium">No image</p>
            </div>
          ) : isActiveVideo ? (
            <video
              key={activeUrl}
              src={activeUrl}
              controls autoPlay muted loop
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              key={activeUrl}
              src={activeUrl}
              alt="Product"
              className="w-full h-full object-contain transition-opacity duration-300"
              style={zoom.active ? {
                transform: 'scale(2.2)',
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
                transition: 'transform 0s',
              } : {
                transform: 'scale(1)',
                transition: 'transform 0.4s ease',
              }}
            />
          )}

          {/* Image counter pill */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest pointer-events-none">
              {activeIdx + 1} / {safeImages.length}
            </div>
          )}

          {/* Zoom hint — desktop only, hide when zooming */}
          {!isActiveVideo && !zoom.active && (
            <div className="hidden lg:flex absolute top-4 right-4 bg-white/80 backdrop-blur-sm text-gray-500 text-[10px] font-bold px-2.5 py-1.5 rounded-lg items-center gap-1.5 pointer-events-none shadow-sm">
              <ZoomIn size={11} /> Hover to zoom
            </div>
          )}

          {/* Mobile prev/next arrows */}
          {safeImages.length > 1 && (
            <>
              <button onClick={prev} className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md text-gray-700 active:scale-95 transition-transform">
                <ChevronLeft size={16} />
              </button>
              <button onClick={next} className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md text-gray-700 active:scale-95 transition-transform">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Mobile dot indicators */}
        {safeImages.length > 1 && (
          <div className="flex lg:hidden justify-center gap-1.5 mt-3">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-5 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;