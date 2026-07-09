'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumHeader, AlbumFooter, seeded } from './_chrome';

/**
 * Mưa ảnh — những tấm polaroid rơi lững lờ từ trên xuống, mỗi tấm một nhịp rơi,
 * độ nghiêng và độ sâu riêng (tất định theo index — an toàn SSR). Ảnh nhỏ hơn
 * nằm xa hơn: mờ, tối và rơi chậm hơn. Chạm một tấm để phóng to.
 */
const KEYFRAMES = `
@keyframes albRainFall { 0% { top: -32%; } 100% { top: 118%; } }
@keyframes albRainSway { 0%,100% { transform: translateX(-6px) rotate(var(--r0)); } 50% { transform: translateX(6px) rotate(var(--r1)); } }
@keyframes albRainStreak { 0% { top: -14%; opacity: 0; } 10% { opacity: .55; } 88% { opacity: .4; } 100% { top: 112%; opacity: 0; } }
@keyframes albRainTwinkle { 0%,100% { opacity: .12; transform: scale(.8); } 50% { opacity: .9; transform: scale(1.2); } }
.albrn-card { transition: filter .25s ease; }
.albrn-card:hover { filter: brightness(1.1) !important; }`;

export function AlbumRain({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const count = Math.max(photos.length, 10);
  const [lb, setLb] = useState<number | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 55% at 50% 0%, ${c.secondary}20, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={10} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Mưa ký ức" />

      {/* Bầu trời ảnh rơi */}
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
        {/* Màn mây mờ nơi ảnh rơi xuống — che điểm xuất phát cho tự nhiên */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10"
          style={{ background: `linear-gradient(to bottom, ${c.accent}, ${c.secondary}14 55%, transparent)` }} />

        {/* Vệt mưa sáng rơi nhanh phía sau ảnh */}
        {Array.from({ length: 12 }).map((_, i) => {
          const dur = 1.5 + seeded(i, 37) * 1.2;
          return (
            <span key={`rs${i}`} className="pointer-events-none absolute w-px" style={{
              left: `${3 + ((i * 0.618034) % 1) * 94}%`, top: '-14%',
              height: 22 + seeded(i, 39) * 20,
              background: `linear-gradient(to bottom, transparent, ${c.secondary}99)`,
              animation: `albRainStreak ${dur}s linear ${-seeded(i, 40) * dur}s infinite`,
            }} />
          );
        })}

        {/* Tia lấp lánh rải quanh khung */}
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={`tw${i}`} className="pointer-events-none absolute rounded-full" style={{
            left: `${6 + ((i * 0.618034) % 1) * 88}%`, top: `${8 + ((i * 0.381966 + 0.19) % 1) * 80}%`,
            width: 2.5, height: 2.5, background: c.primary,
            boxShadow: `0 0 8px ${c.secondary}`,
            animation: `albRainTwinkle ${2.4 + seeded(i, 49) * 2.2}s ease-in-out ${-seeded(i, 50) * 3}s infinite`,
          }} />
        ))}

        {Array.from({ length: count }).map((_, i) => {
          const u = i % photos.length;
          const url = photos[u];
          // Chuỗi tỉ lệ vàng — rải cột rơi & pha rơi ĐỀU khắp khung, không dồn cục như random thuần
          const left  = 2 + ((i * 0.618034) % 1) * 72;       // cột rơi (%) — chừa mép phải cho bề rộng ảnh
          const depth = seeded(i, 32);                       // 0 = xa, 1 = gần
          const w     = 44 + depth * 32;                     // gần thì to hơn
          const dur   = 14 - depth * 5.5;                    // gần rơi nhanh hơn
          const delay = -((i * 0.381966) % 1) * dur;         // pha rơi so le đều — vào cảnh là ảnh đã rải kín trời
          const r0    = -12 + seeded(i, 34) * 24;
          const r1    = r0 + (seeded(i, 35) > 0.5 ? 9 : -9);
          return (
            <div key={i} className="absolute" style={{
              left: `${left}%`, top: '-32%', zIndex: Math.round(depth * 10),
              animation: `albRainFall ${dur}s linear ${delay}s infinite`,
            }}>
              <button
                type="button"
                onClick={() => url && setLb(u)}
                className="albrn-card flex flex-col overflow-hidden rounded-[5px]"
                style={{
                  ['--r0' as string]: `${r0}deg`, ['--r1' as string]: `${r1}deg`,
                  width: w, height: w * 1.24, padding: 3, paddingBottom: 9,
                  background: '#fdfcf8',
                  boxShadow: `0 8px 20px rgba(0,0,0,0.5), 0 0 12px ${c.secondary}26`,
                  opacity: 0.55 + depth * 0.45,
                  // ảnh xa: tối + mờ nhẹ (depth of field)
                  filter: `brightness(${0.68 + depth * 0.36}) blur(${(1 - depth) * 0.8}px)`,
                  animation: `albRainSway ${3 + seeded(i, 36) * 2.4}s ease-in-out ${delay}s infinite`,
                }}
              >
                {url ? (
                  <img src={url} alt="" loading="lazy" className="min-h-0 w-full flex-1 rounded-[2px] object-cover" style={{ filter: imgFilter }} draggable={false} />
                ) : (
                  <div className="flex min-h-0 w-full flex-1 items-center justify-center rounded-[2px] text-sm" style={{ background: '#ece9e2', color: '#9a958a' }}>📷</div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để cơn mưa ký ức bắt đầu' : 'Ảnh đang rơi · chạm một tấm để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
