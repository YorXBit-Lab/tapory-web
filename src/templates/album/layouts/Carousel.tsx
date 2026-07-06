'use client';
import { useRef, useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter } from './_chrome';

const CW = 132; // bề rộng thẻ ảnh
const CH = 176; // chiều cao thẻ ảnh
const GAP = 96; // khoảng dịch ngang giữa các thẻ

export function AlbumCarousel({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 7);
  const n = photos.length;

  const [active, setActive] = useState(0);
  const [lb, setLb] = useState<number | null>(null);
  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  const clamp = (i: number) => Math.max(0, Math.min(n - 1, i));

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 55% at 50% 44%, ${c.secondary}26, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={14} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      {/* Sân khấu coverflow */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        style={{ perspective: 900, touchAction: 'pan-y' }}
        onPointerDown={(e) => { startX.current = e.clientX; moved.current = false; }}
        onPointerMove={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 46) {
            setActive((a) => clamp(a + (dx < 0 ? 1 : -1)));
            startX.current = e.clientX;
            moved.current = true;
          }
        }}
        onPointerUp={() => { startX.current = null; }}
        onPointerCancel={() => { startX.current = null; }}
      >
        <AlbumStageGlow c={c} />

        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d' }}>
          {photos.map((url, i) => {
            const off = i - active;                       // vị trí tương đối với thẻ giữa
            const abs = Math.abs(off);
            if (abs > 3) return null;                      // chỉ dựng 7 thẻ quanh tâm
            const isCenter = off === 0;
            return (
              <div
                key={i}
                onClick={() => { if (moved.current) return; if (isCenter) { url && setLb(i); } else setActive(clamp(i)); }}
                className="absolute overflow-hidden rounded-xl"
                style={{
                  width: CW, height: CH,
                  marginLeft: -CW / 2, marginTop: -CH / 2,
                  transform: `translateX(${off * GAP}px) translateZ(${-abs * 120}px) rotateY(${off * -32}deg) scale(${isCenter ? 1 : 0.9})`,
                  transformOrigin: '50% 50%',
                  opacity: 1 - abs * 0.18,
                  zIndex: 100 - abs,
                  transition: 'transform .45s cubic-bezier(.2,.7,.2,1), opacity .45s ease',
                  border: `1px solid ${c.secondary}${isCenter ? '88' : '44'}`,
                  boxShadow: isCenter
                    ? `0 22px 50px rgba(0,0,0,0.6), 0 0 26px ${c.secondary}44`
                    : '0 12px 28px rgba(0,0,0,0.5)',
                  background: '#101018',
                  cursor: 'pointer',
                }}
              >
                {url ? (
                  <>
                    <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                    <span className="pointer-events-none absolute inset-0" style={{ background: isCenter ? 'linear-gradient(120deg, rgba(255,255,255,0.16), transparent 45%)' : 'rgba(4,4,8,0.35)' }} />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl" style={{ color: '#33333f' }}>📷</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chấm chỉ vị trí */}
      {!isPlaceholder && n > 1 && (
        <div className="relative z-10 mb-1 flex items-center justify-center gap-1.5">
          {photos.map((_, i) => (
            <button key={i} type="button" aria-label={`Ảnh ${i + 1}`} onClick={() => setActive(i)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === active ? 16 : 6, background: i === active ? c.secondary : `${c.primary}59` }} />
          ))}
        </div>
      )}

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–20 ảnh để tạo băng chuyền' : 'Vuốt ngang để lướt · chạm ảnh giữa để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
