'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumHeader, AlbumFooter } from './_chrome';

const KEYFRAMES = `
@keyframes albReelUp   { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
@keyframes albReelDown { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }`;

// Dải lỗ răng phim hai bên mép cuộn.
function Sprockets({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`pointer-events-none absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-[14px]`}
      style={{ background: '#0b0b0e' }}>
      <div className="absolute inset-y-0 left-1/2 w-[7px] -translate-x-1/2"
        style={{ background: 'repeating-linear-gradient(to bottom, transparent 0 6px, #2a2a30 6px 12px)' }} />
    </div>
  );
}

/** Một lane cuộn phim: danh sách ảnh nhân đôi để loop mượt, chạy vô tận. */
function Lane({
  items, dir, dur, imgFilter, secondary, onTap,
}: {
  items: { url: string; idx: number }[];
  dir: 'up' | 'down';
  dur: number;
  imgFilter: string;
  secondary: string;
  onTap: (i: number) => void;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="relative flex-1 overflow-hidden">
      <Sprockets side="left" />
      <Sprockets side="right" />
      <div className="absolute inset-x-[14px] top-0 flex flex-col"
        style={{ animation: `${dir === 'up' ? 'albReelUp' : 'albReelDown'} ${dur}s linear infinite` }}>
        {doubled.map((it, k) => (
          <button
            key={k}
            type="button"
            onClick={() => it.url && onTap(it.idx)}
            className="relative block w-full overflow-hidden rounded-[4px]"
            style={{ aspectRatio: '1 / 1', marginBottom: 8, border: `1px solid ${secondary}3a`, background: '#101018' }}
          >
            {it.url ? (
              <img src={it.url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: '#33333f' }}>📷</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AlbumReel({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const [lb, setLb] = useState<number | null>(null);

  const tagged = photos.map((url, idx) => ({ url, idx }));
  const left  = tagged.filter((_, i) => i % 2 === 0);
  const right = tagged.filter((_, i) => i % 2 === 1);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ background: c.accent }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Cuộn phim" />

      {/* Hai cuộn phim chạy ngược chiều */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-2 px-4 py-2">
        <Lane items={left}  dir="up"   dur={22} imgFilter={imgFilter} secondary={c.secondary} onTap={setLb} />
        {right.length > 0 && (
          <Lane items={right} dir="down" dur={26} imgFilter={imgFilter} secondary={c.secondary} onTap={setLb} />
        )}
        {/* Mờ dần trên/dưới để cuộn phim tan vào nền */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${c.accent} 0%, transparent 14%, transparent 86%, ${c.accent} 100%)` }} />
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 8–30 ảnh để cuộn phim chạy' : 'Cuộn phim tự chạy · chạm khung để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
