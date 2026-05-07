import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function WedRomantic({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col" style={{ backgroundColor: c.accent }}>

      {/* ── Full mode: ảnh full-width phía trên ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: 258 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-5xl"
                style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>💍</div>}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, transparent 25%, rgba(253,245,248,0.75) 88%, #fdf5f8 100%)' }} />
          <div className="absolute top-[48px] left-0 right-0 flex justify-center">
            <p className="text-[8px] font-light tracking-[0.5em] uppercase"
              style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}>WEDDING</p>
          </div>
        </div>
      )}

      {/* ── Card mode: ảnh portrait có khung viền ── */}
      {mode === 'card' && (
        <div className="flex flex-col items-center px-6 pt-12 pb-2">
          <p className="mb-5 text-[8px] font-light tracking-[0.5em] uppercase"
            style={{ color: c.primary, opacity: 0.55 }}>WEDDING</p>
          <div style={{ padding: 3, border: `2px solid ${c.secondary}` }}>
            <div style={{ width: 134, height: 162, overflow: 'hidden' }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-5xl"
                    style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>💍</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Circle mode: ảnh tròn căn giữa ── */}
      {mode === 'circle' && (
        <div className="flex flex-col items-center px-6 pt-12 pb-2">
          <p className="mb-5 text-[8px] font-light tracking-[0.5em] uppercase"
            style={{ color: c.primary, opacity: 0.55 }}>WEDDING</p>
          <div style={{ width: 138, height: 138, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${c.secondary}`, flexShrink: 0 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>💍</div>}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className={`relative z-10 flex flex-col items-center px-6 pb-6 text-center ${mode === 'full' ? '-mt-4' : 'mt-3'}`}>
        {mode === 'full' && <span className="text-[22px]">💍</span>}
        <p className={`${mode === 'full' ? 'mt-1.5' : ''} font-bold leading-tight`}
          style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Tên đôi'}
        </p>
        {data.date && (
          <p className="mt-1 text-[8.5px] font-medium tracking-[0.22em]"
            style={{ color: c.secondary }}>{fmt(data.date)}</p>
        )}
        <div className="my-3 flex w-full items-center gap-2">
          <div className="h-px flex-1 rounded opacity-20" style={{ backgroundColor: c.primary }} />
          <span className="text-[11px]">💕</span>
          <div className="h-px flex-1 rounded opacity-20" style={{ backgroundColor: c.primary }} />
        </div>
        <p className="text-[8.5px] leading-[1.75] opacity-60" style={{ color: c.primary }}>
          {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
        </p>
      </div>
    </div>
  );
}
