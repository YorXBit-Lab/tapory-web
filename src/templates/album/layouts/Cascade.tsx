'use client';
import { useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter } from './_chrome';

/**
 * Thác ảnh — 3 cột ảnh chảy dọc vô tận với tốc độ khác nhau, cột giữa chảy
 * ngược chiều tạo nhịp đan xen. Nội dung mỗi cột nhân đôi để vòng lặp liền mạch
 * (translateY -50%). Chạm ảnh để phóng to.
 */
const KEYFRAMES = `
@keyframes albCasFlow { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
.albcs-card { transition: filter .25s ease; }
.albcs-card:hover { filter: brightness(1.1); }`;

const SPEEDS = [34, 42, 28];  // giây / vòng cho từng cột

export function AlbumCascade({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const [lb, setLb] = useState<number | null>(null);

  // Chia ảnh vào 3 cột xoay vòng; cột ngắn quá thì lặp lại cho đủ dài để cuộn mượt.
  const cols: { url: string; idx: number }[][] = [[], [], []];
  photos.forEach((url, idx) => cols[idx % 3].push({ url, idx }));
  cols.forEach((col) => {
    if (col.length === 0) return;
    while (col.length < 4) col.push(...col.slice(0, 4 - col.length));
  });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 50% at 50% 0%, ${c.secondary}20, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Thác ảnh" />

      {/* 3 dòng thác */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-2 overflow-hidden px-4 py-2"
        style={{ animation: 'albFadeIn .7s ease both' }}>
        {/* Viền sáng mờ trên/dưới để dòng chảy tan vào nền */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8" style={{ background: `linear-gradient(to bottom, ${c.accent}, transparent)` }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8" style={{ background: `linear-gradient(to top, ${c.accent}, transparent)` }} />

        {cols.map((col, ci) => (
          <div key={ci} className="min-w-0 flex-1 overflow-hidden">
            <div style={{ animation: `albCasFlow ${SPEEDS[ci]}s linear infinite ${ci === 1 ? 'reverse' : 'normal'}` }}>
              {/* nhân đôi nội dung để -50% khớp đúng một chu kỳ */}
              {[0, 1].map((half) => (
                <div key={half} aria-hidden={half === 1}>
                  {col.map(({ url, idx }, i) => (
                    <button
                      key={`${half}-${i}`}
                      type="button"
                      tabIndex={half === 1 ? -1 : undefined}
                      onClick={() => url && setLb(idx)}
                      className="albcs-card mb-2 block w-full overflow-hidden rounded-xl"
                      style={{
                        aspectRatio: '3 / 4',
                        border: `1px solid ${c.secondary}33`,
                        background: '#14141c',
                        boxShadow: `0 6px 16px rgba(0,0,0,0.42)`,
                      }}
                    >
                      {url ? (
                        <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg" style={{ color: `${c.secondary}66` }}>📷</div>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 9–30 ảnh để dòng thác tuôn chảy' : 'Thác đang chảy · chạm một ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
