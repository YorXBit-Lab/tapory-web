'use client';
import { useState } from 'react';
import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';

const KEYFRAMES = `@keyframes albStageIn { 0% { opacity: 0; transform: scale(0.72); } 100% { opacity: 1; transform: scale(1); } }`;
const R = 122;
const TW = 64;
const TH = 86;
const D2R = Math.PI / 180;

export function AlbumOrbit({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  // Vòng giữ số ô vừa phải cho dễ nhìn; lightbox vẫn duyệt hết ảnh.
  const ring = photos.slice(0, 16);
  const step = 360 / Math.max(1, ring.length);
  const [lb, setLb] = useState<number | null>(null);
  const spinRef = useDragSpin({ auto: 0.3, initX: -8, depth: true, onTap: (i) => photos[i] && setLb(i) });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(85% 55% at 50% 46%, ${c.secondary}26, transparent 70%), ${c.accent}` }}>
      <style>{KEYFRAMES}</style>

      {/* Header */}
      <div className="relative z-10 px-5 pt-5 text-center">
        <p className="text-[7px] font-bold uppercase tracking-[0.55em]" style={{ color: c.secondary, opacity: 0.8 }}>Album</p>
        <p className="mt-1 font-bold leading-tight" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Album kỷ niệm'}
        </p>
        {data.date && (
          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.4em]" style={{ color: c.secondary }}>{fmt(data.date)}</p>
        )}
      </div>

      {/* Orbit stage */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 720, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <div className="pointer-events-none absolute h-24 w-44 rounded-full" style={{ background: `${c.secondary}33`, filter: 'blur(32px)' }} />
        <div ref={spinRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', touchAction: 'none', cursor: 'grab' }}>
          {ring.map((url, i) => {
            const a = i * step * D2R;
            return (
              <div
                key={i}
                data-idx={i}
                data-nx={Math.sin(a)} data-ny={0} data-nz={Math.cos(a)}
                className="absolute overflow-hidden rounded-xl"
                style={{
                  width: TW, height: TH,
                  left: '50%', top: '50%',
                  marginLeft: -TW / 2, marginTop: -TH / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${R}px)`,
                  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  border: `1px solid ${c.secondary}55`,
                  boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                  background: '#101018',
                }}
              >
                {url ? (
                  <img src={url} alt="" className="h-full w-full object-cover" style={{ backfaceVisibility: 'hidden' }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl" style={{ color: '#33333f' }}>📷</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-5 pb-4 text-center">
        {data.description && (
          <p className="mx-auto max-w-[92%] text-[9px] italic leading-relaxed" style={{ fontFamily: font, color: c.primary, opacity: 0.72 }}>
            {data.description}
          </p>
        )}
        <p className="mt-1.5 text-[8px]" style={{ color: c.primary, opacity: 0.45 }}>
          {isPlaceholder ? 'Thêm 5–10 ảnh để tạo vòng xoay ảnh' : 'Kéo để xoay · chạm ảnh để phóng to'}
        </p>
      </div>

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
