'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumHeader, AlbumFooter } from './_chrome';

/**
 * Sóng ảnh — dải ảnh trôi ngang vô tận, từng tấm nhấp nhô lệch pha nhau tạo
 * thành đường sóng. Dải nhân đôi để vòng lặp liền mạch (translateX -50%).
 * Chạm ảnh để phóng to.
 */
const BOB = 3.6;   // chu kỳ nhấp nhô (s)
const KEYFRAMES = `
@keyframes albWvX { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
@keyframes albWvBob { 0%,100% { transform: translateY(-9px) rotate(-2.5deg); } 50% { transform: translateY(9px) rotate(2.5deg); } }
.albwv-card { transition: filter .25s ease; }
.albwv-card:hover { filter: brightness(1.1); }`;

export function AlbumWave({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const [lb, setLb] = useState<number | null>(null);
  // Đủ dày để dải phủ kín bề ngang; ít ảnh thì lặp lại.
  const count = Math.max(photos.length, 8);
  const items = Array.from({ length: count }, (_, i) => i % photos.length);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(90% 55% at 50% 60%, ${c.secondary}20, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={12} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Sóng ký ức" />

      {/* Dải sóng trôi ngang */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center overflow-hidden"
        style={{ animation: 'albFadeIn .7s ease both' }}>
        {/* Mặt nước loang sáng dưới dải ảnh */}
        <div className="pointer-events-none absolute inset-x-6 top-[68%] h-10 rounded-[50%]"
          style={{ background: `radial-gradient(closest-side, ${c.secondary}30, transparent 72%)`, filter: 'blur(10px)' }} />

        <div className="flex w-max items-center" style={{ animation: `albWvX ${count * 3.2}s linear infinite` }}>
          {[0, 1].map((half) => (
            <div key={half} className="flex items-center" aria-hidden={half === 1}>
              {items.map((u, i) => (
                <div key={`${half}-${i}`} className="px-1.5" style={{ animation: `albWvBob ${BOB}s ease-in-out ${-(i * 0.55)}s infinite` }}>
                  <button
                    type="button"
                    tabIndex={half === 1 ? -1 : undefined}
                    onClick={() => photos[u] && setLb(u)}
                    className="albwv-card block h-[92px] w-[72px] overflow-hidden rounded-lg"
                    style={{
                      border: `1px solid ${c.secondary}44`,
                      background: '#12121c',
                      boxShadow: `0 10px 24px rgba(0,0,0,0.5), 0 0 14px ${c.secondary}26`,
                    }}
                  >
                    {photos[u] ? (
                      <img src={photos[u]} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: `${c.secondary}66` }}>📷</div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để con sóng ký ức trôi' : 'Sóng đang trôi · chạm một ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
