'use client';
import { useRef, useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter } from './_chrome';

const CW = 132; // bề rộng thẻ ảnh
const CH = 176; // chiều cao thẻ ảnh
const GAP = 92; // khoảng dịch ngang giữa các thẻ

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
  const wheelAt = useRef(0);

  const go = (d: number) => setActive((a) => (a + d + n) % n);
  // Khoảng cách vòng tròn ngắn nhất từ thẻ i tới thẻ giữa → loop vô tận, không có "mép".
  const rel = (i: number) => {
    let d = (i - active) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

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
            go(dx < 0 ? 1 : -1);
            startX.current = e.clientX;
            moved.current = true;
          }
        }}
        onPointerUp={() => { startX.current = null; }}
        onPointerCancel={() => { startX.current = null; }}
        onWheel={(e) => {
          const now = Date.now();
          if (now - wheelAt.current < 320) return; // chống lướt quá nhanh
          wheelAt.current = now;
          go(e.deltaY > 0 ? 1 : -1);
        }}
      >
        <AlbumStageGlow c={c} />

        <div className="absolute left-1/2 top-1/2" style={{ transformStyle: 'preserve-3d' }}>
          {photos.map((url, i) => {
            const off = rel(i);
            const abs = Math.abs(off);
            if (abs > 3) return null; // chỉ dựng 7 thẻ quanh tâm
            const isCenter = off === 0;
            return (
              <div
                key={i}
                onClick={() => { if (moved.current) return; if (isCenter) { if (url) setLb(i); } else go(off); }}
                className="absolute overflow-hidden rounded-2xl"
                style={{
                  width: CW, height: CH,
                  marginLeft: -CW / 2, marginTop: -CH / 2,
                  // Coverflow chuẩn: thẻ giữa 100%, hai bên nghiêng 35°, scale .8
                  transform: `translateX(${off * GAP}px) translateZ(${-abs * 120}px) rotateY(${isCenter ? 0 : off < 0 ? 35 : -35}deg) scale(${isCenter ? 1 : 0.8})`,
                  transformOrigin: '50% 50%',
                  opacity: isCenter ? 1 : Math.max(0.25, 0.6 - (abs - 1) * 0.18),
                  zIndex: 100 - abs,
                  // Spring: cubic-bezier vượt nhẹ quá đích rồi nảy về
                  transition: 'transform .55s cubic-bezier(.34,1.56,.64,1), opacity .45s ease',
                  border: `1px solid ${c.secondary}${isCenter ? '88' : '44'}`,
                  boxShadow: isCenter
                    ? `0 22px 50px rgba(0,0,0,0.6), 0 0 26px ${c.secondary}44`
                    : '0 12px 28px rgba(0,0,0,0.5)',
                  background: '#101018',
                  cursor: 'pointer',
                  // Phản chiếu xuống sàn như mockup (Chromium/Safari; nơi khác tự bỏ qua)
                  WebkitBoxReflect: 'below 5px linear-gradient(to bottom, transparent 62%, rgba(255,255,255,0.22))',
                }}
              >
                {url ? (
                  <>
                    <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                    <span className="pointer-events-none absolute inset-0" style={{ background: isCenter ? 'linear-gradient(120deg, rgba(255,255,255,0.16), transparent 45%)' : 'rgba(4,4,8,0.35)' }} />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl" style={{ color: '#33333f' }}>📷</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mũi tên điều hướng — kính mờ */}
        {n > 1 && (
          <>
            <button type="button" aria-label="Ảnh trước" onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-base backdrop-blur-sm transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${c.secondary}44`, color: c.primary }}>‹</button>
            <button type="button" aria-label="Ảnh sau" onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-base backdrop-blur-sm transition-transform hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${c.secondary}44`, color: c.primary }}>›</button>
          </>
        )}
      </div>

      {/* Chỉ vị trí: ít ảnh dùng chấm, nhiều ảnh dùng bộ đếm cho gọn */}
      {!isPlaceholder && n > 1 && (
        n <= 12 ? (
          <div className="relative z-10 mb-1 flex items-center justify-center gap-1.5">
            {photos.map((_, i) => (
              <button key={i} type="button" aria-label={`Ảnh ${i + 1}`} onClick={() => setActive(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === active ? 16 : 6, background: i === active ? c.secondary : `${c.primary}59` }} />
            ))}
          </div>
        ) : (
          <p className="relative z-10 mb-1 text-center text-[9px] font-semibold tracking-widest" style={{ color: c.secondary }}>
            {active + 1} / {n}
          </p>
        )
      )}

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–20 ảnh để tạo băng chuyền' : 'Vuốt / lăn chuột / bấm mũi tên · chạm ảnh giữa để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
