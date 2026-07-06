'use client';
import { useEffect, useState } from 'react';
import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop } from './_chrome';

const FRAMES = 4;      // số khung trong 1 dải
const PAGE_MS = 3000;  // thời gian mỗi dải trước khi đổi

export function AlbumPhotobooth({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 4);
  const n = photos.length;
  const pages = Math.max(1, Math.ceil(n / FRAMES));

  const [page, setPage] = useState(0);
  const [lb, setLb] = useState<number | null>(null);

  useEffect(() => {
    if (isPlaceholder || pages < 2 || lb !== null) return;
    const t = setInterval(() => setPage((p) => (p + 1) % pages), PAGE_MS);
    return () => clearInterval(t);
  }, [isPlaceholder, pages, lb]);

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ background: `radial-gradient(80% 60% at 50% 28%, ${c.secondary}22, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />

      <div className="relative z-10 pt-5 text-center">
        <p className="text-[7px] font-bold uppercase tracking-[0.55em]" style={{ color: c.secondary }}>✦ Photobooth ✦</p>
      </div>

      {/* Dải ảnh trắng */}
      <div className="relative z-10 flex flex-1 items-center justify-center">
        <div className="flex flex-col gap-2 rounded-[6px] bg-white p-2.5 pb-3"
          style={{ boxShadow: '0 22px 50px rgba(0,0,0,0.6)', transform: 'rotate(-2deg)', animation: 'albFloatY 4s ease-in-out infinite' }}>
          {Array.from({ length: FRAMES }).map((_, f) => {
            const idx = page * FRAMES + f;
            const url = idx < n ? photos[idx] : '';
            return (
              <button key={f} type="button" onClick={() => idx < n && url && setLb(idx)}
                className="overflow-hidden bg-[#e9e6df]" style={{ width: 100, height: 68 }}>
                {url ? (
                  <img key={`${page}-${f}`} src={url} alt="" className="h-full w-full object-cover"
                    style={{ filter: imgFilter, animation: 'albFadeIn .5s ease-out both' }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg text-black/20">📷</div>
                )}
              </button>
            );
          })}
          <p className="mt-0.5 truncate px-1 text-center text-[9px]" style={{ fontFamily: font, color: '#3a352c' }}>
            {data.title || 'Kỷ niệm'}{data.date ? ` · ${fmt(data.date)}` : ''}
          </p>
        </div>
      </div>

      {pages > 1 && (
        <div className="relative z-10 mb-2 flex gap-1.5">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} type="button" aria-label={`Dải ${i + 1}`} onClick={() => setPage(i)}
              className="h-1.5 rounded-full transition-all" style={{ width: i === page ? 16 : 6, background: i === page ? c.secondary : `${c.primary}59` }} />
          ))}
        </div>
      )}

      <p className="relative z-10 mb-4 text-[8px]" style={{ color: c.primary, opacity: 0.5 }}>
        {isPlaceholder ? 'Thêm ảnh để in dải photobooth' : 'Dải ảnh tự đổi · chạm để phóng to'}
      </p>

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
