'use client';
import { useMemo, useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos, spherePositions } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter } from './_chrome';

const R = 90;
const TILE = 54;

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
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={18} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      {/* Sphere stage */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 780, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <AlbumStageGlow c={c} pulse />
        {/* Vòng sáng xoay dưới chân quả cầu — gợi quỹ đạo, tạo chiều sâu */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 rounded-full"
          style={{ border: `1px solid ${c.secondary}40`, boxShadow: `0 0 22px ${c.secondary}33 inset`, animation: 'albRingSpin 18s linear infinite' }} />

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
                  border: `1px solid ${c.secondary}4d`,
                  boxShadow: `0 6px 18px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset`,
                  background: '#14141c',
                }}
              >
                {url ? (
                  <>
                    <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter, backfaceVisibility: 'hidden' }} draggable={false} />
                    <span className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.18), transparent 45%)` }} />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: '#3a3a48' }}>📷</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–10 ảnh để tạo quả cầu kỷ niệm' : 'Kéo để xoay · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={unique} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
