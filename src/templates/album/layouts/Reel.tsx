'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumHeader, AlbumFooter } from './_chrome';

/**
 * Cuộn phim 3D — theo mockup: dải phim uốn cong thành vòng tròn trong không gian,
 * hai mép có lỗ răng phim, tự quay (20s/vòng); rê chuột dừng, kéo để xoay, chạm phóng to.
 */

const FW = 76;  // bề rộng 1 khung phim
const FH = 96;  // chiều cao 1 khung (gồm 2 dải lỗ răng)

const KEYFRAMES = `
.albr-frame img { transition: transform .3s ease, filter .3s ease; }
.albr-frame:hover img { transform: scale(1.12); filter: brightness(1.05); }`;

// Nhiễu hạt phim (SVG fractalNoise) — phủ mờ cho chất film cổ.
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function AlbumReel({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const unique = photos;
  // Đủ khung để dải phim khép kín vòng tròn; ít ảnh thì lặp lại.
  const count = Math.max(unique.length, 10);
  const R = Math.max(118, Math.round((count * (FW + 2)) / (2 * Math.PI)));
  const step = 360 / count;
  const [lb, setLb] = useState<number | null>(null);
  // auto 0.3°/frame ≈ 20s/vòng (spec) · rê chuột dừng phim · kéo xoay tay
  const spinRef = useDragSpin({ auto: 0.3, initX: -10, depth: true, hoverPause: true, onTap: (i) => { const u = i % unique.length; if (unique[u]) setLb(u); } });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 55% at 50% 44%, ${c.secondary}1f, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={12} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Cuộn phim" />

      {/* Vòng phim 3D */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center" style={{ perspective: 1000, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        {/* Sàn phản chiếu mờ */}
        <div className="pointer-events-none absolute left-1/2 top-[70%] h-10 w-72 -translate-x-1/2 rounded-[50%]"
          style={{ background: `radial-gradient(closest-side, ${c.secondary}2a, transparent 72%)`, filter: 'blur(9px)' }} />

        <div ref={spinRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', touchAction: 'none', cursor: 'grab' }}>
          {Array.from({ length: count }).map((_, i) => {
            const url = unique[i % unique.length];
            const a = i * step * (Math.PI / 180);
            return (
              <div
                key={i}
                data-idx={i % unique.length}
                data-nx={Math.sin(a)} data-ny={0} data-nz={Math.cos(a)}
                className="albr-frame absolute flex flex-col overflow-hidden"
                style={{
                  width: FW, height: FH,
                  left: '50%', top: '50%',
                  marginLeft: -FW / 2, marginTop: -FH / 2,
                  // Không ẩn backface — khung phim nửa vòng sau vẫn hiện, mờ tối theo chiều sâu
                  transform: `rotateY(${i * step}deg) translateZ(${R}px)`,
                  background: '#100d06',
                  borderTop: `1px solid ${c.secondary}40`,
                  borderBottom: `1px solid ${c.secondary}40`,
                  boxShadow: `0 10px 26px rgba(0,0,0,0.5), 0 0 14px ${c.secondary}1f`,
                }}
              >
                {/* Lỗ răng phim mép trên */}
                <div className="h-[10px] w-full shrink-0"
                  style={{ background: `repeating-linear-gradient(to right, transparent 0 5px, ${c.secondary}59 5px 11px, transparent 11px 16px)`, backgroundSize: '16px 5px', backgroundPosition: 'center', backgroundRepeat: 'repeat-x' }} />
                {/* Khung ảnh */}
                <div className="relative min-h-0 flex-1 overflow-hidden rounded-[3px]" style={{ margin: '0 4px', background: '#171208' }}>
                  {url ? (
                    <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: `${c.secondary}66` }}>📷</div>
                  )}
                </div>
                {/* Lỗ răng phim mép dưới */}
                <div className="h-[10px] w-full shrink-0"
                  style={{ background: `repeating-linear-gradient(to right, transparent 0 5px, ${c.secondary}59 5px 11px, transparent 11px 16px)`, backgroundSize: '16px 5px', backgroundPosition: 'center', backgroundRepeat: 'repeat-x' }} />
              </div>
            );
          })}
        </div>

        {/* Nhiễu hạt phim nhẹ */}
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: NOISE, opacity: 0.055, mixBlendMode: 'overlay' }} />
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để cuộn phim chạy' : 'Phim tự quay · rê vào để dừng · kéo để xoay · chạm khung để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
