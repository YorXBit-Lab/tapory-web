'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter } from './_chrome';

const R = 150;
const TW = 62;
const TH = 86;
const D2R = Math.PI / 180;

export function AlbumOrbit({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  // Giữ vòng thưa (≤12 ô) để mỗi ảnh có khoảng thở, không chen/méo; lightbox vẫn duyệt hết.
  const ring = photos.slice(0, 12);
  const step = 360 / Math.max(1, ring.length);
  const [lb, setLb] = useState<number | null>(null);
  const spinRef = useDragSpin({ auto: 0.3, initX: -6, depth: true, onTap: (i) => photos[i] && setLb(i) });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(85% 55% at 50% 46%, ${c.secondary}26, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={16} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      {/* Orbit stage */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 1000, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <AlbumStageGlow c={c} />
        {/* Mặt sàn phát sáng tĩnh + bóng phản chiếu — neo vòng ảnh, không quay rối mắt */}
        <div className="pointer-events-none absolute left-1/2 top-[64%] h-12 w-64 -translate-x-1/2 rounded-[50%]"
          style={{ background: `radial-gradient(closest-side, ${c.secondary}33, transparent 72%)`, filter: 'blur(8px)' }} />

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
                  border: `1px solid ${c.secondary}66`,
                  boxShadow: `0 14px 34px rgba(0,0,0,0.55), 0 0 18px ${c.secondary}22`,
                  background: '#101018',
                }}
              >
                {url ? (
                  <>
                    <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter, backfaceVisibility: 'hidden' }} draggable={false} />
                    <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.16), transparent 42%)' }} />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl" style={{ color: '#33333f' }}>📷</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–10 ảnh để tạo vòng xoay ảnh' : 'Kéo để xoay · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
