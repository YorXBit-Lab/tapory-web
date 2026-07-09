'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter, seeded } from './_chrome';

export function AlbumMosaic({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const [lb, setLb] = useState<number | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 50% at 50% 0%, ${c.secondary}22, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{`
        @keyframes albMosUp { 0% { opacity:0; transform: translateY(40px); } 100% { opacity:1; transform: translateY(0); } }
        .albm-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
        .albm-card:hover { transform: scale(1.04); box-shadow: 0 14px 34px rgba(0,0,0,.55), 0 0 20px ${c.secondary}55; border-color: ${c.secondary}aa !important; }
        .albm-card:hover img { filter: brightness(1.05); }
      `}</style>
      <AlbumBackdrop c={c} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Album" />

      {/* Lưới masonry: ảnh giữ đúng tỉ lệ gốc, xếp gạch theo cột như Pinterest */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
        <div style={{ columns: 3, columnGap: 8 }}>
          {photos.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => url && setLb(i)}
              className="albm-card relative mb-2 block w-full overflow-hidden rounded-xl"
              style={{
                breakInside: 'avoid',
                border: `1px solid ${c.secondary}33`,
                boxShadow: '0 6px 16px rgba(0,0,0,0.42)',
                background: '#14141c',
                // fill "backwards": xong animation thì thả transform để hover scale hoạt động
                animation: `albMosUp .55s cubic-bezier(.2,.7,.2,1) ${i * 55}ms backwards`,
              }}
            >
              {url ? (
                <>
                  <img src={url} alt="" loading="lazy" className="block h-auto w-full" style={{ filter: imgFilter, transition: 'filter .3s ease' }} draggable={false} />
                  <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.14), transparent 42%)' }} />
                </>
              ) : (
                // ô chờ cao thấp so le cho có dáng masonry
                <div className="flex w-full items-center justify-center text-xl" style={{ aspectRatio: String(0.72 + seeded(i, 71) * 0.6), color: '#3a3a48' }}>📷</div>
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
