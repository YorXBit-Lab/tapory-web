'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumHeader, AlbumFooter } from './_chrome';

/**
 * Vòng xoắn — ảnh xếp thành chuỗi xoắn ốc (helix) quanh trục dọc, tự quay chậm;
 * kéo để xoay tay, ảnh phía sau mờ tối theo chiều sâu, chạm ảnh để phóng to.
 */
const W = 56;   // bề rộng 1 ảnh
const KEYFRAMES = `
.albhx-card img { transition: transform .3s ease, filter .3s ease; }
.albhx-card:hover img { transform: scale(1.1); filter: brightness(1.06); }`;

export function AlbumHelix({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const count = Math.max(photos.length, 12);
  const step = 360 / count;
  const R = Math.max(100, Math.round((count * (W + 8)) / (2 * Math.PI)));
  // Bước xuống của mỗi ảnh — giới hạn tổng chiều cao chuỗi xoắn để không tràn khung.
  const dy = Math.min(13, 170 / count);
  const [lb, setLb] = useState<number | null>(null);
  const spinRef = useDragSpin({ auto: 0.35, initX: -10, depth: true, hoverPause: true, onTap: (i) => { const u = i % photos.length; if (photos[u]) setLb(u); } });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 55% at 50% 44%, ${c.secondary}1f, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={12} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Vòng xoắn" />

      {/* Chuỗi xoắn 3D */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center"
        style={{ perspective: 900, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        {/* Trục sáng giữa chuỗi xoắn */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-3/4 w-px -translate-x-1/2 -translate-y-1/2"
          style={{ background: `linear-gradient(to bottom, transparent, ${c.secondary}66, transparent)` }} />
        <div className="pointer-events-none absolute left-1/2 top-[72%] h-9 w-56 -translate-x-1/2 rounded-[50%]"
          style={{ background: `radial-gradient(closest-side, ${c.secondary}2e, transparent 72%)`, filter: 'blur(9px)' }} />

        <div ref={spinRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', touchAction: 'none', cursor: 'grab' }}>
          {Array.from({ length: count }).map((_, i) => {
            const url = photos[i % photos.length];
            const a = i * step * (Math.PI / 180);
            const ty = (i - (count - 1) / 2) * dy;
            return (
              <div
                key={i}
                data-idx={i % photos.length}
                data-nx={Math.sin(a)} data-ny={0} data-nz={Math.cos(a)}
                className="albhx-card absolute overflow-hidden rounded-lg"
                style={{
                  width: W, height: W * 1.28,
                  left: '50%', top: '50%',
                  marginLeft: -W / 2, marginTop: -(W * 1.28) / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${R}px) translateY(${ty}px)`,
                  border: `1px solid ${c.secondary}4d`,
                  background: '#12121c',
                  boxShadow: `0 10px 26px rgba(0,0,0,0.5), 0 0 14px ${c.secondary}22`,
                }}
              >
                {url ? (
                  <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: `${c.secondary}66` }}>📷</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để dựng chuỗi xoắn ký ức' : 'Tự quay · kéo để xoay · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
