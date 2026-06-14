import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function KeepLetter({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-9"
      style={{ backgroundColor: c.accent }}>

      {/* Paper lines (faint ruled) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{ backgroundImage: `repeating-linear-gradient(${c.primary}0a 0px, ${c.primary}0a 1px, transparent 1px, transparent 26px)`, backgroundPositionY: 70 }} />
      {/* Warm top wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: `linear-gradient(to bottom, ${c.secondary}14, transparent)` }} />

      <div className="flex-shrink-0" style={{ height: 40 }} />

      {/* Heading */}
      <p className="relative z-10 text-[8px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>
        Lưu giữ kỷ niệm
      </p>
      <p className="relative z-10 mt-2 px-7 text-center font-bold leading-snug"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên kỷ vật'}
      </p>
      {data.subtitle && (
        <p className="relative z-10 mt-1 text-center text-[9.5px] italic" style={{ color: c.secondary }}>
          {data.subtitle}
        </p>
      )}

      {/* Wax-seal divider */}
      <div className="relative z-10 mt-3 flex items-center gap-2.5">
        <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}88)` }} />
        <div className="flex h-5 w-5 items-center justify-center rounded-full text-[9px]"
          style={{ background: `radial-gradient(circle at 38% 32%, ${c.secondary}, ${c.secondary}aa)`, color: c.accent, boxShadow: `0 1px 4px ${c.primary}44` }}>♥</div>
        <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}88)` }} />
      </div>

      {/* Photo */}
      <div className="relative z-10 mt-4 flex-shrink-0">
        {mode === 'full' ? (
          <div className="overflow-hidden" style={{ width: 204, height: 128, borderRadius: 3, border: `1px solid ${c.secondary}55`, boxShadow: `0 8px 22px ${c.primary}22` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-center" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.primary}0c` }}>📷</div>}
          </div>
        ) : mode === 'circle' ? (
          <div className="overflow-hidden rounded-full" style={{ width: 110, height: 110, border: `1px solid ${c.secondary}66`, boxShadow: `0 8px 22px ${c.primary}22` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.primary}0c` }}>📷</div>}
          </div>
        ) : (
          // card — taped photo
          <div className="relative">
            <span className="absolute -top-2 left-1/2 h-3.5 w-12 -translate-x-1/2 -rotate-2"
              style={{ background: `${c.secondary}33`, borderLeft: `1px solid ${c.secondary}22`, borderRight: `1px solid ${c.secondary}22` }} />
            <div className="overflow-hidden bg-white p-1.5" style={{ borderRadius: 2, boxShadow: `0 8px 22px ${c.primary}26` }}>
              <div className="overflow-hidden" style={{ width: 108, height: 126, borderRadius: 1 }}>
                {data.imageUrl
                  ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                  : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.primary}0c` }}>📷</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Story */}
      {data.description && (
        <div className="relative z-10 mx-9 mt-5">
          <span className="pointer-events-none absolute -left-1 -top-3 text-[26px] leading-none" style={{ color: `${c.secondary}88`, fontFamily: 'Georgia, serif' }}>❝</span>
          <p className="text-center text-[10.5px] leading-[1.95]" style={{ color: c.primary, opacity: 0.72 }}>
            {data.description}
          </p>
        </div>
      )}

      {/* Signature line + date */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <div className="h-px w-24" style={{ backgroundColor: `${c.secondary}66` }} />
        {data.date && (
          <p className="mt-1.5 text-[9px] font-medium tracking-[0.2em]" style={{ color: c.secondary }}>
            {fmt(data.date)}
          </p>
        )}
      </div>
    </div>
  );
}
