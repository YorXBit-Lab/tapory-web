'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumParticles, AlbumStageGlow, AlbumHeader, AlbumFooter, FloatingHearts } from './_chrome';

// three.js chỉ tải ở client khi layout này hiển thị — không phình bundle các template khác.
const HeartScene = dynamic(() => import('./HeartScene').then(m => m.HeartScene), { ssr: false });

export function AlbumHeart({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 9);
  const [lb, setLb] = useState<number | null>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(70% 55% at 50% 42%, ${c.secondary}33, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <AlbumParticles c={c} count={12} />
      <FloatingHearts color={c.secondary} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Yêu thương" />

      {/* Heart stage — WebGL (three.js) */}
      <div className="relative flex-1" style={{ animation: 'albStageIn 0.7s cubic-bezier(.2,.7,.2,1) both' }}>
        <AlbumStageGlow c={c} pulse />
        <HeartScene photos={photos} isPlaceholder={isPlaceholder}
          secondary={c.secondary} accent={c.accent} filter={imgFilter}
          onTap={(i) => setLb(i)} />
      </div>

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm 5–10 ảnh để tạo trái tim ảnh' : 'Kéo để xoay · chạm ảnh để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
