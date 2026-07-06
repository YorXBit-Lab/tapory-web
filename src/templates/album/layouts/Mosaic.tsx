'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter } from './_chrome';

// Tỉ lệ ô placeholder — tất định theo index để masonry so le tự nhiên (an toàn SSR).
const RATIOS = [1.35, 0.85, 1.1, 0.72, 1.25, 0.95, 1.5, 0.8];

export function AlbumMosaic({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const [lb, setLb] = useState<number | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 50% at 50% 0%, ${c.secondary}22, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
        <div style={{ columnCount: 2, columnGap: 8 }}>
          {photos.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => url && setLb(i)}
              className="mb-2 block w-full overflow-hidden rounded-xl"
              style={{
                breakInside: 'avoid',
                border: `1px solid ${c.secondary}33`,
                boxShadow: '0 6px 16px rgba(0,0,0,0.42)',
                background: '#14141c',
                animation: 'albStageIn .5s cubic-bezier(.2,.7,.2,1) both',
                animationDelay: `${i * 55}ms`,
              }}
            >
              {url ? (
                <div className="relative">
                  <img src={url} alt="" className="block w-full" style={{ filter: imgFilter, height: 'auto' }} draggable={false} />
                  <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.14), transparent 42%)' }} />
                </div>
              ) : (
                <div className="flex w-full items-center justify-center text-xl"
                  style={{ aspectRatio: String(RATIOS[i % RATIOS.length]), color: '#3a3a48' }}>📷</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 9–30 ảnh để tạo lưới kỷ niệm' : 'Cuộn để xem · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
