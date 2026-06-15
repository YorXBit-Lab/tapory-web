'use client';
import { useMemo, useState } from 'react';
import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos, spherePositions } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';

const KEYFRAMES = `@keyframes albStageIn { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }`;
const R = 84;
const TILE = 50;

export function AlbumSphere({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const unique = photos;
  // Hiện tất cả ảnh; nếu ít thì lặp để phủ kín mặt cầu (tối thiểu ~24 ô).
  const count = Math.min(48, Math.max(unique.length, 24));
  const placed = useMemo(() => spherePositions(count, R), [count]);
  const [lb, setLb] = useState<number | null>(null);
  const spinRef = useDragSpin({ auto: 0.26, depth: true, onTap: (i) => { const u = i % unique.length; if (unique[u]) setLb(u); } });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(75% 55% at 50% 40%, ${c.secondary}30, transparent 70%), ${c.accent}` }}>
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

      {/* Sphere stage */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 760, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <div className="pointer-events-none absolute h-28 w-28 rounded-full" style={{ background: `${c.secondary}55`, filter: 'blur(36px)' }} />
        <div ref={spinRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', touchAction: 'none', cursor: 'grab' }}>
          {placed.map((p, i) => {
            const url = unique[i % unique.length];
            return (
              <div
                key={i}
                data-idx={i % unique.length}
                data-nx={p.n[0]} data-ny={p.n[1]} data-nz={p.n[2]}
                className="absolute overflow-hidden rounded-lg"
                style={{
                  width: TILE, height: TILE,
                  left: '50%', top: '50%',
                  marginLeft: -TILE / 2, marginTop: -TILE / 2,
                  transform: p.transform,
                  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  border: `1px solid ${c.primary}33`,
                  boxShadow: `0 4px 14px rgba(0,0,0,0.45)`,
                  background: '#14141c',
                }}
              >
                {url ? (
                  <img src={url} alt="" className="h-full w-full object-cover" style={{ backfaceVisibility: 'hidden' }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: '#3a3a48' }}>📷</div>
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
          {isPlaceholder ? 'Thêm 5–10 ảnh để tạo quả cầu kỷ niệm' : 'Kéo để xoay · chạm ảnh để phóng to'}
        </p>
      </div>

      {lb !== null && (
        <Lightbox photos={unique} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
