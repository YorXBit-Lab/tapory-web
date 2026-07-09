'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter, FloatingHearts, seeded } from './_chrome';

/**
 * Trái tim — ảnh xếp DỌC THEO ĐƯỜNG VIỀN trái tim (không dán kín thành khối):
 * mỗi tấm là một thẻ ảnh nhỏ bay từ ngoài vào ráp thành hình tim, cả đội hình
 * đập nhịp cùng nhau quanh chữ ♥ phát sáng ở giữa. Chạm ảnh để phóng to.
 */

const KEYFRAMES = `
.albht-card { transition: filter .25s ease; }
.albht-card:hover { filter: brightness(1.12); }`;

/** Điểm trên đường tim cổ điển → toạ độ % trong khung (đã căn giữa dọc/ngang). */
function heartPos(t: number) {
  const x = 16 * Math.sin(t) ** 3;
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { left: 50 + x * 2.2, top: 50 - (y + 2.64) * 2.2 };
}

export function AlbumHeart({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const [lb, setLb] = useState<number | null>(null);

  // Đủ thẻ để viền tim liền dáng; ít ảnh thì lặp lại. Nhiều thẻ thì thẻ nhỏ đi.
  const slots = Math.min(Math.max(photos.length, 12), 24);
  const size = slots <= 14 ? 46 : slots <= 20 ? 40 : 35;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(70% 55% at 50% 42%, ${c.secondary}33, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={12} />
      <FloatingHearts color={c.secondary} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Yêu thương" />

      {/* Đội hình trái tim — cả khối đập nhịp cùng nhau */}
      <div className="relative z-10 min-h-0 flex-1">
        <AlbumStageGlow c={c} pulse />
        <div className="absolute inset-0" style={{ animation: 'albHeartbeat 2.4s ease-in-out infinite' }}>
          {/* ♥ phát sáng giữa tim */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              fontSize: 46, color: c.secondary, lineHeight: 1,
              textShadow: `0 0 18px ${c.secondary}, 0 0 44px ${c.secondary}88`,
              animation: 'albHeartGlow 2.4s ease-in-out infinite',
            }}>♥</span>

          {photos.length > 0 && Array.from({ length: slots }).map((_, i) => {
            const u = i % photos.length;
            const url = photos[u];
            const { left, top } = heartPos((i / slots) * Math.PI * 2);
            return (
              <div key={i} className="absolute" style={{
                left: `${left}%`, top: `${top}%`,
                marginLeft: -size / 2, marginTop: -size / 2,
                zIndex: Math.round(top),
                // bay từ ngoài vào ráp thành tim
                ['--ax' as string]: `${(seeded(i, 81) - 0.5) * 320}px`,
                ['--ay' as string]: `${(seeded(i, 82) - 0.5) * 320}px`,
                ['--ar' as string]: `${(seeded(i, 83) - 0.5) * 160}deg`,
                animation: `albAssemble .85s cubic-bezier(.2,.7,.2,1) ${i * 65}ms backwards`,
              }}>
                <button
                  type="button"
                  onClick={() => url && setLb(u)}
                  className="albht-card block overflow-hidden rounded-lg"
                  style={{
                    width: size, height: size,
                    rotate: `${(seeded(i, 84) - 0.5) * 12}deg`,
                    border: `1px solid ${c.secondary}66`,
                    background: '#160a10',
                    boxShadow: `0 6px 16px rgba(0,0,0,0.5), 0 0 12px ${c.secondary}40`,
                    animation: `albFloatY ${3 + seeded(i, 85) * 2}s ease-in-out ${-seeded(i, 86) * 3}s infinite`,
                  }}
                >
                  {url ? (
                    <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm" style={{ color: `${c.secondary}77` }}>♥</div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 9–24 ảnh để xếp thành trái tim' : 'Trái tim đang đập · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
