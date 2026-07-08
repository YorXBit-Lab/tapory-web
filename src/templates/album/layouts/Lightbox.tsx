'use client';
import { useEffect, useRef } from 'react';
import { fmt } from '@/shared/utils/fmt';
import type { LayoutColors } from '@/templates/types';

const KEYFRAMES = `
@keyframes albLbIn { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes albLbImg { 0% { opacity: 0; transform: scale(0.94); } 100% { opacity: 1; transform: scale(1); } }`;

interface Props {
  photos: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  c: LayoutColors;
  filter: string;
  title?: string;
  description?: string;
  date?: string;
}

export function Lightbox({ photos, index, onIndex, onClose, c, filter, title, description, date }: Props) {
  const startX = useRef<number | null>(null);
  const url = photos[index];
  const n = photos.length;

  const go = (dir: number) => onIndex((index + dir + n) % n);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col"
      style={{ background: 'rgba(6,6,10,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', animation: 'albLbIn 0.22s ease-out both' }}
      onClick={onClose}
      onPointerDown={(e) => { startX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 36) { e.stopPropagation(); go(dx < 0 ? 1 : -1); }
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* top bar */}
      <div className="flex items-center justify-between px-4 pt-3" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/90" style={{ background: 'rgba(255,255,255,0.12)' }}>
          {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/90"
          style={{ background: 'rgba(255,255,255,0.14)' }}
          aria-label="Đóng"
        >✕</button>
      </div>

      {/* image */}
      <div className="relative flex flex-1 items-center justify-center px-3" onClick={(e) => e.stopPropagation()}>
        {url ? (
          <img
            key={index}
            src={url}
            alt=""
            className="max-h-full max-w-full rounded-xl object-contain"
            style={{ filter, boxShadow: `0 24px 70px ${c.secondary}40, 0 8px 24px rgba(0,0,0,0.5)`, animation: 'albLbImg 0.32s cubic-bezier(.2,.7,.2,1) both' }}
            draggable={false}
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-xl text-4xl text-white/30" style={{ background: 'rgba(255,255,255,0.06)' }}>📷</div>
        )}

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Trước"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white"
              style={{ background: 'rgba(255,255,255,0.16)' }}>‹</button>
            <button type="button" onClick={() => go(1)} aria-label="Sau"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white"
              style={{ background: 'rgba(255,255,255,0.16)' }}>›</button>
          </>
        )}
      </div>

      {/* caption */}
      <div className="px-5 pb-4 pt-2 text-center" onClick={(e) => e.stopPropagation()}>
        {index === 0 && title && (
          <p className="text-[13px] font-bold text-white">{title}</p>
        )}
        {date && index === 0 && (
          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.4em]" style={{ color: c.secondary }}>{fmt(date)}</p>
        )}
        {description && index === 0 && (
          <p className="mx-auto mt-1.5 max-w-[92%] text-[10px] italic leading-relaxed text-white/75">{description}</p>
        )}
        {/* dots */}
        {n > 1 && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            {photos.map((_, i) => (
              <button key={i} type="button" onClick={() => onIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === index ? 16 : 6, background: i === index ? c.secondary : 'rgba(255,255,255,0.35)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
