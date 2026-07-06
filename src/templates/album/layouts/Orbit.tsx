'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter } from './_chrome';

const D2R = Math.PI / 180;

// Vòng quỹ đạo ảnh.
const OUTER = { r: 152, w: 56, h: 78 };

interface RingItem { url: string; idx: number }

/** Một vòng quỹ đạo: các ô đặt đều trên vòng tròn 3D quanh tâm. */
function Ring({ items, r, w, h, phase, secondary, imgFilter }: {
  items: RingItem[]; r: number; w: number; h: number; phase: number; secondary: string; imgFilter: string;
}) {
  const step = 360 / Math.max(1, items.length);
  return (
    <>
      {items.map((it, i) => {
        const deg = phase + i * step;
        const a = deg * D2R;
        return (
          <div
            key={it.idx}
            data-idx={it.idx}
            data-nx={Math.sin(a)} data-ny={0} data-nz={Math.cos(a)}
            className="albo-tile absolute overflow-hidden rounded-xl"
            style={{
              width: w, height: h,
              left: '50%', top: '50%',
              marginLeft: -w / 2, marginTop: -h / 2,
              // Không ẩn backface — ảnh nửa vòng sau vẫn hiện, mờ tối dần theo chiều sâu
              transform: `rotateY(${deg}deg) translateZ(${r}px)`,
              border: `1px solid ${secondary}66`,
              boxShadow: `0 14px 34px rgba(0,0,0,0.55), 0 0 18px ${secondary}22`,
              background: '#101018',
            }}
          >
            {it.url ? (
              <>
                <img src={it.url} alt="" loading="lazy" className="albo-img h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.16), transparent 42%)' }} />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl" style={{ color: '#33333f' }}>📷</div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function AlbumOrbit({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);

  // Một vòng quỹ đạo duy nhất — giữ ≤12 ảnh cho thoáng; lightbox vẫn duyệt hết.
  const ring: RingItem[] = photos.slice(0, 12).map((url, i) => ({ url, idx: i }));

  const [lb, setLb] = useState<number | null>(null);
  // auto 0.3°/frame ≈ 20s/vòng (spec) · hover dừng quỹ đạo · kéo để xoay tay
  const spinRef = useDragSpin({ auto: 0.3, initX: -6, depth: true, hoverPause: true, onTap: (i) => photos[i] && setLb(i) });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(85% 55% at 50% 46%, ${c.secondary}26, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{`
        .albo-img { transition: transform .3s ease, filter .3s ease; }
        .albo-tile:hover .albo-img { transform: scale(1.15); filter: brightness(1.05); }
        .albo-tile { transition: box-shadow .3s ease; }
        .albo-tile:hover { box-shadow: 0 18px 42px rgba(0,0,0,.6), 0 0 26px ${c.secondary}55; }
      `}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={16} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      {/* Orbit stage */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 1000, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <AlbumStageGlow c={c} />
        {/* Mặt sàn phát sáng tĩnh — neo vòng ảnh, không quay rối mắt */}
        <div className="pointer-events-none absolute left-1/2 top-[66%] h-12 w-64 -translate-x-1/2 rounded-[50%]"
          style={{ background: `radial-gradient(closest-side, ${c.secondary}33, transparent 72%)`, filter: 'blur(8px)' }} />

        <div ref={spinRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', touchAction: 'none', cursor: 'grab' }}>
          {/* Vành quỹ đạo phát sáng — nằm trong khối xoay nên quay cùng vòng ảnh (mockup) */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: OUTER.r * 2 + 36, height: OUTER.r * 2 + 36,
              marginLeft: -(OUTER.r + 18), marginTop: -(OUTER.r + 18),
              transform: 'rotateX(90deg)',
              border: `2px solid ${c.secondary}66`,
              boxShadow: `0 0 24px ${c.secondary}55, 0 0 46px ${c.secondary}2e inset`,
            }} />
          <Ring items={ring} r={OUTER.r} w={OUTER.w} h={OUTER.h} phase={0} secondary={c.secondary} imgFilter={imgFilter} />
        </div>

      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–10 ảnh để tạo vòng xoay ảnh' : 'Kéo để xoay · rê vào để dừng · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
