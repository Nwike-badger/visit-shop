import React from 'react';
import { Video, Info, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../SharedUI';

export default function MediaGalleryCard({ media, mediaInput, setMediaInput, addMedia, removeMedia, setPrimary, inp }) {
  return (
    <Card>
      <CardHeader>Media</CardHeader>
      <CardBody className="space-y-4">

        {/* Thumbnails */}
        {media.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {media.map((m, i) => (
              <div
                key={i}
                onClick={() => m.type === 'IMAGE' && setPrimary(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
                  m.isPrimary
                    ? 'border-blue-500 shadow-md shadow-blue-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {m.type === 'VIDEO' ? (
                  <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center gap-1">
                    <Video size={18} className="text-white" />
                    <span className="text-[9px] text-slate-300 font-bold uppercase">Video</span>
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {m.isPrimary && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    Cover
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeMedia(i); }}
                  className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* URL input */}
        <form onSubmit={addMedia} className="flex gap-2">
          <input
            value={mediaInput}
            onChange={(e) => setMediaInput(e.target.value)}
            placeholder="Paste image URL or YouTube/Vimeo link…"
            className={`${inp} flex-1`}
          />
          <button
            type="submit"
            className="px-4 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors shrink-0"
          >
            Add
          </button>
        </form>

        <p className="text-[10px] text-slate-400 flex items-center gap-1">
          <Info size={10} /> Click an image to set it as the cover photo. YouTube/Vimeo links become
          video entries.
        </p>
      </CardBody>
    </Card>
  );
}