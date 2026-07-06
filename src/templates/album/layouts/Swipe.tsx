'use client';
import { useRef, useState } from 'react';
import type React from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter } from './_chrome';

const OUT = 480;       // quãng bay thêm ra ngoài mép (px)
const EXIT_MS = 400;   // thời lượng lá bài bay ra

// Kiểu chồng theo thứ hạng: rank 0 = trên cùng (kéo được), phía sau thu nhỏ & lùi xuống.
function stackStyle(rank: number): React.CSSProperties {
  return {
    transform: `translateY(${rank * 12}px) scale(${1 - rank * 0.06})`,
    opacity: rank > 2 ? 0 : 1,
    zIndex: 10 - rank,
    transition: 'transform .38s cubic-bezier(.2,.7,.2,1), opacity .38s ease',
  };
}

export function AlbumSwipe({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 6);
  const n = photos.length;

  const [offset, setOffset] = useState(0);
  const [lb, setLb] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, x0: 0, y0: 0, dx: 0, dy: 0 });
  const busy = useRef(false);

  // Chỉ dựng 3 lá trên cùng; lá bay ra rơi khỏi tập này nên tự biến mất.
  const visible = Math.min(n, 3);
  const order = Array.from({ length: visible }, (_, r) => (offset + r) % n);
  const frontPhoto = order[0];

  const setFront = (transform: string, transition: string, opacity = '1') => {
    const el = frontRef.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
    el.style.opacity = opacity;
  };

  // Cho lá trên cùng bay ra rồi đưa ảnh kế lên.
  const flingOut = (dir: 1 | -1, tiltY = 0) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const w = stageRef.current?.offsetWidth ?? 320;
    setFront(`translate(${dir * (w + OUT)}px, ${tiltY - 40}px) rotate(${dir * 24}deg)`, `transform ${EXIT_MS}ms ease-in, opacity ${EXIT_MS}ms ease-in`, '0');
    setTimeout(() => { setOffset((o) => (o + 1) % n); busy.current = false; }, EXIT_MS - 30);
  };

  const onDown = (e: React.PointerEvent) => {
    if (busy.current) return;
    drag.current = { down: true, moved: false, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0 };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    d.dx = e.clientX - d.x0;
    d.dy = e.clientY - d.y0;
    if (Math.abs(d.dx) + Math.abs(d.dy) > 4) d.moved = true;
    // Lá dính theo tay: dịch ngang + hơi dọc + nghiêng theo hướng kéo.
    setFront(`translate(${d.dx}px, ${d.dy * 0.35}px) rotate(${d.dx * 0.06}deg)`, 'none');
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (!d.moved) { if (photos[frontPhoto]) setLb(frontPhoto); return; }
    const w = stageRef.current?.offsetWidth ?? 320;
    const th = Math.min(96, w * 0.3);
    if (Math.abs(d.dx) > th) {
      flingOut(d.dx < 0 ? -1 : 1, d.dy * 0.35);
    } else {
      // Chưa đủ ngưỡng → thả về giữa (nảy lại).
      setFront('translate(0px, 0px) rotate(0deg)', 'transform .34s cubic-bezier(.2,.7,.2,1)');
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 55% at 50% 44%, ${c.secondary}22, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      {/* Sân khấu chồng bài */}
      <div ref={stageRef} className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-6" style={{ touchAction: 'pan-y' }}>
        <div className="relative" style={{ width: '90%', maxWidth: 270, aspectRatio: '3 / 4' }}>
          {order.map((photoIdx, rank) => {
            const url = photos[photoIdx];
            const isFront = rank === 0;
            return (
              <div
                key={photoIdx}
                ref={isFront ? frontRef : undefined}
                onPointerDown={isFront ? onDown : undefined}
                onPointerMove={isFront ? onMove : undefined}
                onPointerUp={isFront ? onUp : undefined}
                onPointerCancel={isFront ? onUp : undefined}
                className="absolute inset-0 overflow-hidden rounded-2xl"
                style={{
                  ...stackStyle(rank),
                  border: `1px solid ${c.secondary}${isFront ? '55' : '33'}`,
                  boxShadow: isFront
                    ? `0 26px 60px rgba(0,0,0,0.6), 0 0 24px ${c.secondary}2a`
                    : '0 14px 32px rgba(0,0,0,0.5)',
                  background: '#101018',
                  cursor: isFront ? 'grab' : 'default',
                  touchAction: 'none',
                }}
              >
                {url ? (
                  <>
                    <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                    <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(130deg, rgba(255,255,255,0.14), transparent 42%)' }} />
                    {isFront && (
                      <span className="pointer-events-none absolute right-2 top-2 rounded-full px-2 py-[3px] text-[9px] font-semibold text-white/90" style={{ background: 'rgba(0,0,0,0.4)' }}>
                        {frontPhoto + 1}/{n}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl" style={{ color: '#33333f' }}>📷</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–30 ảnh rồi kéo từng ảnh để lật' : 'Kéo ảnh sang trái/phải để bỏ qua · chạm để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
