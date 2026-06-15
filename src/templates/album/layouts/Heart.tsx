'use client';
import { useMemo, useState } from 'react';
import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos, heartPositions } from './_shared';
import { Lightbox } from './Lightbox';

const KEYFRAMES = `
@keyframes albHeartbeat { 0%,28%,100% { transform: scale(1); } 14% { transform: scale(1.07); } 21% { transform: scale(1.02); } }
@keyframes albHeartFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes albHeartGlow { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: .8; transform: scale(1.08); } }
@keyframes albStageIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }`;

const BOX_W = 200;
const BOX_H = 184;
const TILE = 30;

export function AlbumHeart({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const unique = photos;
  // Hiện tất cả ảnh; nếu ít thì lặp để viền trái tim liền mạch (tối thiểu ~22 ô).
  const count = Math.min(44, Math.max(unique.length, 22));
  const pts = useMemo(() => heartPositions(count, 5.6), [count]);
  const [lb, setLb] = useState<number | null>(null);

  const cx = BOX_W / 2;
  const cy = BOX_H / 2 - 6;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(70% 55% at 50% 42%, ${c.secondary}33, transparent 70%), ${c.accent}` }}>
      <style>{KEYFRAMES}</style>

      {/* Header */}
      <div className="relative z-10 px-5 pt-5 text-center">
        <p className="font-bold leading-tight" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Album kỷ niệm'}
        </p>
        {data.date && (
          <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.4em]" style={{ color: c.secondary }}>{fmt(data.date)}</p>
        )}
      </div>

      {/* Heart stage */}
      <div className="relative flex flex-1 items-center justify-center" style={{ animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <div className="pointer-events-none absolute h-32 w-32 rounded-full" style={{ background: `${c.secondary}44`, filter: 'blur(30px)', animation: 'albHeartGlow 2.4s ease-in-out infinite' }} />
        <div className="relative" style={{ width: BOX_W, height: BOX_H, animation: 'albHeartbeat 2.4s ease-in-out infinite' }}>
          {pts.map((p, i) => {
            const u = i % unique.length;
            const url = unique[u];
            return (
            <button
              key={i}
              type="button"
              onClick={() => url && setLb(u)}
              className="absolute"
              style={{ left: cx + p.x - TILE / 2, top: cy + p.y - TILE / 2, width: TILE, height: TILE, cursor: url ? 'pointer' : 'default' }}
            >
              <div className="h-full w-full overflow-hidden rounded-lg"
                style={{
                  border: `1.5px solid ${c.secondary}77`,
                  boxShadow: `0 3px 10px rgba(0,0,0,0.35)`,
                  animation: `albHeartFloat ${2.6 + (i % 4) * 0.4}s ease-in-out ${i * 0.18}s infinite`,
                  background: '#1f0d15',
                }}>
                {url ? (
                  <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm" style={{ color: `${c.secondary}88` }}>📷</div>
                )}
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-5 pb-4 text-center">
        {data.description && (
          <p className="mx-auto max-w-[92%] text-[9px] italic leading-relaxed" style={{ fontFamily: font, color: c.primary, opacity: 0.78 }}>
            {data.description}
          </p>
        )}
        <p className="mt-1.5 text-[8px]" style={{ color: c.primary, opacity: 0.5 }}>
          {isPlaceholder ? 'Thêm 5–10 ảnh để ghép thành trái tim' : 'Chạm ảnh để phóng to'}
        </p>
      </div>

      {lb !== null && (
        <Lightbox photos={unique} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
