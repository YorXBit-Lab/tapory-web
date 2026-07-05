'use client';
import { useMemo, useState } from 'react';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos, heart3DPositions } from './_shared';
import { useDragSpin } from './_hooks';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter } from './_chrome';

const R = 86;     // kích thước khối tim
const TILE = 38;

export function AlbumHeart({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const unique = photos;
  // Phủ kín cả 2 mặt tim (kể cả ruột giữa); ít ảnh thì lặp lại (tối thiểu ~56 ô).
  const count = Math.min(72, Math.max(unique.length, 56));
  const placed = useMemo(() => heart3DPositions(count, R), [count]);
  const [lb, setLb] = useState<number | null>(null);
  const spinRef = useDragSpin({ auto: 0.24, depth: true, onTap: (i) => { const u = i % unique.length; if (unique[u]) setLb(u); } });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(70% 55% at 50% 42%, ${c.secondary}33, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={16} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Yêu thương" />

      {/* Heart stage — khối tim 3D xoay được */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 760, animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <AlbumStageGlow c={c} pulse />

        {/* Lớp tim đập (scale) bao ngoài lớp xoay 3D */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', animation: 'albHeartbeat 2.4s ease-in-out infinite' }}>
          <div ref={spinRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d', touchAction: 'none', cursor: 'grab' }}>
            {placed.map((p, i) => {
              const url = unique[i % unique.length];
              return (
                <div
                  key={i}
                  data-idx={i % unique.length}
                  data-nx={p.n[0]} data-ny={p.n[1]} data-nz={p.n[2]}
                  className="absolute overflow-hidden rounded-lg"
                  style={{
                    width: TILE, height: TILE,
                    left: '50%', top: '50%',
                    marginLeft: -TILE / 2, marginTop: -TILE / 2,
                    transform: p.transform,
                    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                    border: `1px solid ${c.secondary}66`,
                    boxShadow: `0 5px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset`,
                    background: '#1f0d15',
                  }}
                >
                  {url ? (
                    <>
                      <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter, backfaceVisibility: 'hidden' }} draggable={false} />
                      <span className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18), transparent 45%)' }} />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-base" style={{ color: `${c.secondary}88` }}>📷</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–10 ảnh để tạo trái tim ảnh' : 'Kéo để xoay · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={unique} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
