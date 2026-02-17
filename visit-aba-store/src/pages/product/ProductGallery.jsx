import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

const ProductGallery = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [isZoomed, setIsZoomed] = useState(false);

  // Helper to check if url is a video
  const isVideo = (url) => url?.match(/\.(mp4|webm)$/i);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 sticky top-24">
      
      {/* 1. THUMBNAILS (Vertical on Desktop, Horizontal on Mobile) */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:h-[600px] scrollbar-hide py-2 lg:py-0 px-1">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`
              relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200
              ${activeImage === img ? 'border-blue-600 ring-2 ring-blue-50' : 'border-transparent hover:border-gray-300'}
            `}
          >
            {isVideo(img) ? (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                 <PlayCircle size={24} className="text-gray-600" />
              </div>
            ) : (
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            )}
          </button>
        ))}
      </div>

      {/* 2. MAIN DISPLAY */}
      <div 
        className="relative flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 aspect-square lg:aspect-auto lg:h-[600px] cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        {isVideo(activeImage) ? (
          <video 
            src={activeImage} 
            controls 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-contain"
          />
        ) : (
          <img 
            src={activeImage} 
            alt="Product View" 
            className={`w-full h-full object-contain transition-transform duration-700 ease-in-out ${isZoomed ? 'scale-150' : 'scale-100'}`}
          />
        )}

        {/* Zoom Badge */}
        {!isVideo(activeImage) && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-sm pointer-events-none">
            Hover to Zoom
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;