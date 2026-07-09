'use client';
import { useState } from 'react';
import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter, FloatingHearts } from './_chrome';

/**
 * Photobooth — dải ảnh photobooth kinh điển: dải giấy trắng dọc, 4 ảnh xếp
 * chồng, phần đuôi trống in tiêu đề/ngày. Nhiều ảnh thì thành nhiều dải,
 * kéo ngang để xem; mỗi dải nghiêng nhẹ so le. Chạm ảnh để phóng to.
 */

const PER_STRIP = 4;
const STRIP_W = 92;

const KEYFRAMES = `
@keyframes albPbIn { 0% { opacity: 0; transform: translateY(20px) rotate(var(--rot)); } 100% { opacity: 1; transform: translateY(0) rotate(var(--rot)); } }
.albpb-cell img { transition: transform .3s ease, filter .3s ease; }
.albpb-cell:hover img { transform: scale(1.08); filter: brightness(1.05); }`;

export function AlbumPhotobooth({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 4);
  const [lb, setLb] = useState<number | null>(null);

  // Chia ảnh thành từng dải 4 tấm; dải cuối thiếu thì để ô trống cho đủ dáng dải.
  const strips: { url: string; idx: number }[][] = [];
  for (let i = 0; i < photos.length; i += PER_STRIP) {
    const strip = photos.slice(i, i + PER_STRIP).map((url, s) => ({ url, idx: i + s }));
    while (strip.length < PER_STRIP) strip.push({ url: '', idx: -1 });
    strips.push(strip);
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 60% at 50% 30%, ${c.secondary}22, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <FloatingHearts color={c.secondary} count={7} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Photobooth" />

      {/* Các dải photobooth */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center gap-4 overflow-x-auto px-7 py-3"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory', justifyContent: strips.length <= 2 ? 'center' : 'flex-start' }}>
        {strips.map((strip, si) => (
          <div
            key={si}
            className="flex h-full shrink-0 flex-col"
            style={{
              ['--rot' as string]: `${si % 2 ? 1.8 : -1.8}deg`,
              width: STRIP_W, scrollSnapAlign: 'center',
              padding: '7px 7px 0',
              background: '#fdfcf8',
              boxShadow: `0 14px 30px rgba(0,0,0,0.5), 0 0 18px ${c.secondary}26`,
              animation: `albPbIn .6s cubic-bezier(.2,.7,.2,1) ${si * 130}ms both`,
            }}
          >
            {strip.map(({ url, idx }, s) => (
              <button
                key={s}
                type="button"
                onClick={() => url && setLb(idx)}
                className="albpb-cell relative mb-[6px] min-h-0 w-full flex-1 overflow-hidden"
                style={{ background: '#e9e5da' }}
              >
                {url ? (
                  <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm" style={{ color: 'rgba(0,0,0,0.16)' }}>✦</div>
                )}
              </button>
            ))}
            {/* Đuôi dải — chỗ trống in chữ như máy photobooth */}
            <div className="flex h-[30px] shrink-0 flex-col items-center justify-center">
              <p className="max-w-full truncate px-1 text-[7px] font-semibold" style={{ fontFamily: font, color: '#4a4438' }}>
                {data.title || 'our memories'} <span style={{ color: c.secondary }}>♥</span>
              </p>
              {data.date && (
                <p className="text-[6px] uppercase tracking-[0.3em]" style={{ color: '#a39b88' }}>{fmt(data.date)}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 4–30 ảnh để in dải photobooth' : `Chạm ảnh để phóng to${strips.length > 2 ? ' · kéo ngang xem dải khác' : ''}`} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
