'use client';
import { useState } from 'react';
import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { getPhotos } from './_shared';
import { Lightbox } from './Lightbox';
import { ALBUM_KEYFRAMES, AlbumBackdrop, AlbumHeader, AlbumFooter, FloatingHearts } from './_chrome';

/**
 * Photobook — theo mockup: quyển album mở nằm nghiêng trong không gian 3D,
 * mỗi trang 2 ảnh, click mép phải/trái để lật trang (rotateY quanh gáy, 2 mặt giấy,
 * bóng cong trang, cạnh giấy dày), tim bay nền.
 * Lưu ý: id/layout vẫn là "photobooth" (giữ tương thích đơn cũ), chỉ đổi giao diện.
 */

const PW = 108;      // bề rộng 1 trang
const PH = 150;      // chiều cao 1 trang
const PER_PAGE = 2;  // số ảnh mỗi trang → 1 trang đôi 4 ảnh
const FLIP_MS = 750;

const KEYFRAMES = `
@keyframes albFlipF { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(-180deg); } }
@keyframes albFlipB { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }`;

const PAPER = '#f6f3ec';

/** Một mặt trang giấy: 2 ảnh xếp dọc trên nền giấy + bóng cong về phía gáy. */
function PageFace({ urls, imgFilter, spine, onZoom }: {
  urls: [string | undefined, string | undefined];
  imgFilter: string;
  /** Gáy sách nằm phía nào của trang này → đổ bóng cong về phía đó. */
  spine: 'left' | 'right';
  onZoom?: (slot: number) => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col gap-[6px] overflow-hidden p-[7px]" style={{ background: PAPER }}>
      {urls.map((url, s) => (
        <div key={s} className="relative min-h-0 flex-1 overflow-hidden" style={{ background: '#e7e2d6' }}>
          {url ? (
            <>
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: imgFilter }} draggable={false} />
              {onZoom && (
                <button type="button" aria-label="Phóng to ảnh"
                  onClick={(e) => { e.stopPropagation(); onZoom(s); }}
                  className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                  style={{ background: 'rgba(0,0,0,0.35)', color: '#fff' }}>⤢</button>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base" style={{ color: 'rgba(0,0,0,0.15)' }}>✦</div>
          )}
        </div>
      ))}
      {/* Bóng cong mép giấy về phía gáy */}
      <span className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to ${spine === 'left' ? 'right' : 'left'}, rgba(0,0,0,0.22), rgba(0,0,0,0.05) 14%, transparent 32%)` }} />
    </div>
  );
}

export function AlbumPhotobooth({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const { photos, isPlaceholder } = getPhotos(data, 8);
  const n = photos.length;
  const perSpread = PER_PAGE * 2; // 4 ảnh / trang đôi
  const spreads = Math.max(1, Math.ceil(n / perSpread));

  const [spread, setSpread] = useState(0);
  const [flip, setFlip] = useState<null | { dir: 1 | -1 }>(null);
  const [lb, setLb] = useState<number | null>(null);

  const canNext = spread < spreads - 1;
  const canPrev = spread > 0;

  const doFlip = (dir: 1 | -1) => {
    if (flip || (dir === 1 && !canNext) || (dir === -1 && !canPrev)) return;
    setFlip({ dir });
    setTimeout(() => { setSpread((s) => s + dir); setFlip(null); }, FLIP_MS - 30);
  };

  const at = (i: number) => (i >= 0 && i < n ? photos[i] : undefined);
  /** 2 ảnh của một trang: page = chỉ số trang đơn (0,1,2…), mỗi trang PER_PAGE ảnh. */
  const pageUrls = (page: number): [string | undefined, string | undefined] =>
    [at(page * PER_PAGE), at(page * PER_PAGE + 1)];

  // Trang đơn: spread s gồm trang trái 2s và trang phải 2s+1.
  // Đang lật tới: nền phải hiện sẵn trang phải MỚI (2(s+1)+1); lật lui: nền trái hiện trang trái MỚI.
  const leftPage  = flip?.dir === -1 ? (spread - 1) * 2 : spread * 2;
  const rightPage = flip?.dir === 1 ? (spread + 1) * 2 + 1 : spread * 2 + 1;

  const zoomOf = (page: number) => (slot: number) => {
    const idx = page * PER_PAGE + slot;
    if (at(idx)) setLb(idx);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: `radial-gradient(80% 60% at 50% 30%, ${c.secondary}22, transparent 70%), ${c.accent}` }}>
      <style>{ALBUM_KEYFRAMES}{KEYFRAMES}</style>
      <AlbumBackdrop c={c} />
      <FloatingHearts color={c.secondary} count={7} />

      <AlbumHeader data={data} c={c} font={font} titleSize={titleSize} kicker="Photobook" />

      {/* Quyển sách nằm nghiêng trong không gian 3D */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center" style={{ perspective: 1100 }}>
        <div style={{ transform: 'rotateX(22deg) rotateZ(-5deg)', transformStyle: 'preserve-3d', animation: 'albFloatY 4.5s ease-in-out infinite' }}>
          {/* Bìa sách */}
          <div className="rounded-md p-[7px]"
            style={{
              background: `linear-gradient(145deg, ${c.secondary}d9, #46101f)`,
              boxShadow: `0 30px 60px rgba(0,0,0,0.65), 0 0 26px ${c.secondary}33`,
              transformStyle: 'preserve-3d',
            }}>
            {/* Khối trang đôi */}
            <div className="relative flex" style={{ width: PW * 2, height: PH, transformStyle: 'preserve-3d' }}>
              {/* Cạnh giấy dày hai bên */}
              <span className="pointer-events-none absolute -left-[4px] top-[2px] bottom-[2px] w-[4px] rounded-l-[2px]"
                style={{ background: 'repeating-linear-gradient(to right, #f4f1e9 0 1px, #d9d4c6 1px 2px)' }} />
              <span className="pointer-events-none absolute -right-[4px] top-[2px] bottom-[2px] w-[4px] rounded-r-[2px]"
                style={{ background: 'repeating-linear-gradient(to right, #f4f1e9 0 1px, #d9d4c6 1px 2px)' }} />

              {/* Trang trái (nền) — div thay button vì bên trong còn nút ⤢ */}
              <div role="button" aria-label="Lật về trang trước" onClick={() => doFlip(-1)}
                className="relative h-full overflow-hidden rounded-l-[3px]"
                style={{ width: PW, cursor: canPrev ? 'grab' : 'default' }}>
                <PageFace urls={pageUrls(leftPage)} imgFilter={imgFilter} spine="right" onZoom={zoomOf(leftPage)} />
              </div>

              {/* Trang phải (nền) */}
              <div role="button" aria-label="Lật sang trang sau" onClick={() => doFlip(1)}
                className="relative h-full overflow-hidden rounded-r-[3px]"
                style={{ width: PW, cursor: canNext ? 'grab' : 'default' }}>
                <PageFace urls={pageUrls(rightPage)} imgFilter={imgFilter} spine="left" onZoom={zoomOf(rightPage)} />
              </div>

              {/* Gáy sách */}
              <span className="pointer-events-none absolute inset-y-0 left-1/2 w-[10px] -translate-x-1/2"
                style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3) 50%, transparent)' }} />

              {/* Tờ đang lật: 2 mặt giấy quay quanh gáy */}
              {flip && (
                <div className="absolute top-0 h-full"
                  style={{
                    width: PW,
                    left: flip.dir === 1 ? PW : 0,
                    transformStyle: 'preserve-3d',
                    transformOrigin: flip.dir === 1 ? 'left center' : 'right center',
                    animation: `${flip.dir === 1 ? 'albFlipF' : 'albFlipB'} ${FLIP_MS}ms cubic-bezier(.4,.1,.3,1) both`,
                    zIndex: 30,
                    filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.35))',
                  }}>
                  {/* Mặt trước của tờ */}
                  <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <PageFace imgFilter={imgFilter} spine={flip.dir === 1 ? 'left' : 'right'}
                      urls={pageUrls(flip.dir === 1 ? spread * 2 + 1 : spread * 2)} />
                  </div>
                  {/* Mặt sau của tờ (úp sẵn 180°) */}
                  <div className="absolute inset-0" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    <PageFace imgFilter={imgFilter} spine={flip.dir === 1 ? 'right' : 'left'}
                      urls={pageUrls(flip.dir === 1 ? (spread + 1) * 2 : (spread - 1) * 2 + 1)} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nhãn dưới bìa */}
          <p className="mt-2 truncate text-center text-[9px]" style={{ fontFamily: font, color: c.primary, opacity: 0.7 }}>
            {data.title || 'Kỷ niệm'}{data.date ? ` · ${fmt(data.date)}` : ''}
          </p>
        </div>
      </div>

      {/* Chấm chỉ trang đôi */}
      {spreads > 1 && (
        <div className="relative z-10 mb-1 flex justify-center gap-1.5">
          {Array.from({ length: spreads }).map((_, i) => (
            <button key={i} type="button" aria-label={`Trang ${i + 1}`}
              onClick={() => { if (!flip) setSpread(i); }}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === spread ? 16 : 6, background: i === spread ? c.secondary : `${c.primary}59` }} />
          ))}
        </div>
      )}

      <AlbumFooter data={data} c={c} font={font}
        hint={isPlaceholder ? 'Thêm ảnh để đóng quyển photobook' : 'Chạm trang phải/trái để lật · ⤢ để phóng to'} />

      {lb !== null && (
        <Lightbox photos={photos} index={lb} onIndex={setLb} onClose={() => setLb(null)} c={c} filter={imgFilter} title={data.title} description={data.description} date={data.date} />
      )}
    </div>
  );
}
