'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumHeader, AlbumFooter, seeded } from './_chrome';

/**
 * Đèn trời — mỗi tấm ảnh là một chiếc đèn hoa đăng viền sáng ấm, thả từ đáy
 * khung bay chầm chậm lên trời, đung đưa nhẹ theo gió. Chạm đèn để phóng to.
 */
const KEYFRAMES = `
@keyframes albDriftUp { 0% { top: 112%; } 100% { top: -36%; } }
@keyframes albDriftSway { 0%,100% { transform: translateX(-7px) rotate(var(--r0)); } 50% { transform: translateX(7px) rotate(var(--r1)); } }
@keyframes albDriftTwinkle { 0%,100% { opacity: .12; } 50% { opacity: .8; } }
@keyframes albDriftFlicker { 0%,100% { opacity: .5; } 38% { opacity: .95; } 55% { opacity: .38; } 76% { opacity: .8; } }
.albdr-card { transition: filter .25s ease; }
.albdr-card:hover { filter: brightness(1.1) !important; }`;

export function AlbumDrift({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const count = Math.max(photos.length, 9);
  const [lb, setLb] = useState<number | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(90% 60% at 50% 100%, ${c.secondary}24, transparent 68%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={18} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Đèn trời" />

      {/* Bầu trời hoa đăng */}
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
        {/* Vầng trăng treo góc trên — quầng sáng ấm */}
        <div className="pointer-events-none absolute right-[9%] top-[5%] h-11 w-11 rounded-full" style={{
          background: `radial-gradient(circle at 36% 34%, #fff8e6, ${c.secondary}cc 78%)`,
          boxShadow: `0 0 24px ${c.secondary}66, 0 0 58px ${c.secondary}33`,
          opacity: 0.9,
        }} />

        {/* Sao nhấp nháy — chỉ rải nửa trên bầu trời */}
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={`st${i}`} className="pointer-events-none absolute rounded-full" style={{
            left: `${3 + ((i * 0.618034) % 1) * 92}%`, top: `${3 + ((i * 0.381966 + 0.13) % 1) * 52}%`,
            width: 1.6 + seeded(i, 58) * 1.6, height: 1.6 + seeded(i, 58) * 1.6,
            background: '#fff6e0',
            boxShadow: `0 0 6px ${c.secondary}aa`,
            animation: `albDriftTwinkle ${2.6 + seeded(i, 59) * 2.6}s ease-in-out ${-seeded(i, 60) * 4}s infinite`,
          }} />
        ))}

        {Array.from({ length: count }).map((_, i) => {
          const u = i % photos.length;
          const url = photos[u];
          // Chuỗi tỉ lệ vàng — rải cột bay & pha bay ĐỀU khắp khung, không dồn cục
          const left  = 3 + ((i * 0.618034) % 1) * 74;      // chừa mép phải cho bề rộng đèn
          const depth = seeded(i, 52);                      // 0 = xa, 1 = gần
          const w     = 42 + depth * 30;
          const dur   = 24 - depth * 8;                     // đèn gần trôi nhanh hơn
          const delay = -((i * 0.381966) % 1) * dur;        // pha bay so le đều — vào cảnh trời đã đầy đèn
          const r0    = -5 + seeded(i, 54) * 6;
          return (
            <div key={i} className="absolute" style={{
              left: `${left}%`, top: '112%', zIndex: Math.round(depth * 10),
              animation: `albDriftUp ${dur}s linear ${delay}s infinite`,
            }}>
              <button
                type="button"
                onClick={() => url && setLb(u)}
                className="albdr-card relative overflow-hidden rounded-lg"
                style={{
                  ['--r0' as string]: `${r0}deg`, ['--r1' as string]: `${-r0}deg`,
                  width: w, height: w * 1.3,
                  border: `1px solid ${c.secondary}88`,
                  background: '#14100a',
                  boxShadow: `0 0 18px ${c.secondary}55, 0 8px 20px rgba(0,0,0,0.45)`,
                  opacity: 0.5 + depth * 0.5,
                  filter: `brightness(${0.68 + depth * 0.36})`,
                  animation: `albDriftSway ${4 + seeded(i, 55) * 3}s ease-in-out ${delay}s infinite`,
                }}
              >
                {url ? (
                  <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: `${c.secondary}77` }}>🏮</div>
                )}
                {/* Ánh lửa ấm hắt từ đáy đèn — lập lòe như lửa thật */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                  style={{ background: `linear-gradient(to top, ${c.secondary}66, transparent)`, animation: `albDriftFlicker ${2.6 + seeded(i, 61) * 1.8}s ease-in-out ${-seeded(i, 62) * 3}s infinite` }} />
                {/* Đốm lửa sáng giữa đáy đèn */}
                <span className="pointer-events-none absolute bottom-[5%] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                  style={{ background: '#fff2d0', boxShadow: `0 0 8px ${c.secondary}, 0 0 16px ${c.secondary}88`, animation: `albDriftFlicker ${2.2 + seeded(i, 63) * 1.6}s ease-in-out ${-seeded(i, 64) * 3}s infinite` }} />
              </button>
            </div>
          );
        })}
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để thả những chiếc đèn ký ức' : 'Đèn đang bay lên · chạm một chiếc để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
