'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter, seeded } from './_chrome';

/**
 * Xuyên không — đường hầm thời gian: ảnh hiện ra từ sâu trong không gian rồi
 * lao qua vai người xem, kèm bụi sao bay cùng chiều tạo cảm giác tốc độ.
 * Mỗi ảnh một quỹ đạo lệch tâm riêng (tất định theo index). Chạm để phóng to.
 */
const KEYFRAMES = `
@keyframes albTunFly {
  0%   { transform: translate(-50%,-50%) translate3d(var(--tx), var(--ty), -1100px) rotate(var(--rz)); opacity: 0; }
  10%  { opacity: 1; }
  78%  { opacity: 1; }
  100% { transform: translate(-50%,-50%) translate3d(calc(var(--tx) * 2.6), calc(var(--ty) * 2.6), 300px) rotate(0deg); opacity: 0; }
}
@keyframes albTunStreak {
  0%   { transform: translate(-50%,-50%) translate3d(var(--tx), var(--ty), -1100px) rotate(var(--ang)); opacity: 0; }
  12%  { opacity: .85; }
  85%  { opacity: .5; }
  100% { transform: translate(-50%,-50%) translate3d(calc(var(--tx) * 2.6), calc(var(--ty) * 2.6), 320px) rotate(var(--ang)); opacity: 0; }
}
@keyframes albTunRing {
  0%   { transform: translate(-50%,-50%) translateZ(-1100px); opacity: 0; }
  16%  { opacity: .5; }
  80%  { opacity: .3; }
  100% { transform: translate(-50%,-50%) translateZ(300px); opacity: 0; }
}
.albtn-card { transition: filter .25s ease; }
.albtn-card:hover { filter: brightness(1.1); }`;

export function AlbumTunnel({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const count = Math.max(photos.length, 10);
  const DUR = 9;
  const [lb, setLb] = useState<number | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(70% 55% at 50% 46%, ${c.secondary}26, transparent 68%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Xuyên thời gian" />

      {/* Đường hầm 3D */}
      <div className="relative z-10 min-h-0 flex-1" style={{ perspective: 620 }}>
        {/* Ánh sáng cuối đường hầm */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(closest-side, ${c.secondary}66, transparent 72%)`, filter: 'blur(18px)', animation: 'albGlowPulse 3.2s ease-in-out infinite' }} />

        {/* Vòng warp đồng tâm lao qua — khung đường hầm */}
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={`r${i}`} className="pointer-events-none absolute left-1/2 top-1/2 rounded-full" style={{
            width: 200, height: 200,
            border: `1px solid ${c.secondary}4d`,
            boxShadow: `0 0 18px ${c.secondary}30, inset 0 0 18px ${c.secondary}22`,
            animation: `albTunRing ${DUR * 0.7}s linear ${-(i / 4) * DUR * 0.7}s infinite`,
          }} />
        ))}

        {/* Vệt tốc độ hướng tâm — kéo dài theo phương bay từ tâm ra */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = i * 2.399963 + 1.2;   // góc vàng lệch pha với ảnh — vệt sáng phủ đều quanh tâm
          const rad = 46 + ((i * 0.618034) % 1) * 70;
          const tx = Math.cos(a) * rad, ty = Math.sin(a) * rad * 0.8;
          const ang = Math.atan2(ty, tx) * (180 / Math.PI) + 90;
          return (
            <span key={`s${i}`} className="pointer-events-none absolute left-1/2 top-1/2 rounded-full" style={{
              ['--tx' as string]: `${tx}px`,
              ['--ty' as string]: `${ty}px`,
              ['--ang' as string]: `${ang}deg`,
              width: 2, height: 12 + seeded(i, 47) * 12,
              background: `linear-gradient(to bottom, transparent, ${c.secondary})`,
              boxShadow: `0 0 6px ${c.secondary}66`,
              animation: `albTunStreak ${DUR * 0.5}s linear ${-(i / 16) * DUR * 0.5}s infinite`,
            }} />
          );
        })}

        {/* Ảnh bay xuyên hầm */}
        {Array.from({ length: count }).map((_, i) => {
          const u = i % photos.length;
          const url = photos[u];
          // Góc vàng (~137.5°) — ảnh tỏa ĐỀU quanh tâm hầm như cánh hoa, không dồn về một phía
          const a = i * 2.399963;
          const rad = 34 + ((i * 0.618034) % 1) * 52;
          const w = 62 + seeded(i, 45) * 16;
          return (
            <button
              key={i}
              type="button"
              onClick={() => url && setLb(u)}
              className="albtn-card absolute left-1/2 top-1/2 overflow-hidden rounded-lg"
              style={{
                ['--tx' as string]: `${Math.cos(a) * rad}px`,
                ['--ty' as string]: `${Math.sin(a) * rad * 0.8}px`,
                ['--rz' as string]: `${-8 + seeded(i, 46) * 16}deg`,
                width: w, height: w * 1.22,
                border: `1px solid ${c.secondary}55`,
                background: '#12121c',
                boxShadow: `0 10px 26px rgba(0,0,0,0.55), 0 0 16px ${c.secondary}30`,
                animation: `albTunFly ${DUR}s linear ${-(i / count) * DUR}s infinite`,
              }}
            >
              {url ? (
                <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: `${c.secondary}66` }}>📷</div>
              )}
            </button>
          );
        })}
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để mở đường hầm thời gian' : 'Ảnh đang bay về phía bạn · chạm để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
