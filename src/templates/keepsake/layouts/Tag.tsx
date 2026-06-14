import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function KeepTag({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-8"
      style={{ backgroundColor: c.accent }}>

      {/* Kraft paper grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: `radial-gradient(${c.primary}0a 1px, transparent 1px)`, backgroundSize: '4px 4px' }} />
      {/* Edge vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 40%, transparent 55%, ${c.primary}14 100%)` }} />

      {/* Twine + punch hole */}
      <div className="relative z-10 flex-shrink-0" style={{ height: 30 }}>
        <svg width="40" height="30" viewBox="0 0 40 30" className="absolute left-1/2 top-0 -translate-x-1/2">
          <path d="M20 0 C 8 8, 32 14, 20 22" stroke={c.secondary} strokeWidth="1.5" fill="none" opacity="0.8" />
        </svg>
      </div>
      <div className="relative z-10 -mt-1 mb-2 flex-shrink-0 rounded-full"
        style={{ width: 16, height: 16, border: `2px solid ${c.secondary}`, background: c.accent,
          boxShadow: `inset 0 1px 2px ${c.primary}33` }} />

      {/* Dashed tag border */}
      <div className="pointer-events-none absolute"
        style={{ inset: 12, top: 40, border: `1.5px dashed ${c.secondary}88`, borderRadius: 14 }} />

      {/* Label */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="h-px w-6" style={{ background: `linear-gradient(to right, transparent, ${c.secondary})` }} />
        <p className="text-[8px] font-bold tracking-[0.42em] uppercase" style={{ color: c.secondary }}>Kỷ vật lưu giữ</p>
        <span className="h-px w-6" style={{ background: `linear-gradient(to left, transparent, ${c.secondary})` }} />
      </div>

      {/* Photo */}
      <div className="relative z-10 mt-4 flex-shrink-0">
        {mode === 'full' ? (
          <div className="overflow-hidden" style={{ width: 200, height: 132, borderRadius: 8, border: `4px solid ${c.accent}`, boxShadow: `0 6px 20px ${c.primary}33, 0 0 0 1.5px ${c.secondary}66` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.primary}10` }}>📷</div>}
          </div>
        ) : mode === 'circle' ? (
          <div className="overflow-hidden rounded-full" style={{ width: 116, height: 116, border: `4px solid ${c.accent}`, boxShadow: `0 6px 20px ${c.primary}33, 0 0 0 1.5px ${c.secondary}66` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.primary}10` }}>📷</div>}
          </div>
        ) : (
          <div className="overflow-hidden" style={{ width: 116, height: 138, borderRadius: 6, border: `4px solid ${c.accent}`, boxShadow: `0 6px 20px ${c.primary}33, 0 0 0 1.5px ${c.secondary}66` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.primary}10` }}>📷</div>}
          </div>
        )}
        <span className="absolute -right-3 -top-3 text-[20px]" style={{ transform: 'rotate(12deg)' }}>🎁</span>
      </div>

      {/* Title */}
      <p className="relative z-10 mt-4 px-7 text-center font-bold leading-snug"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên kỷ vật'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-1.5 px-7 text-center text-[9px] font-semibold tracking-[0.26em] uppercase"
          style={{ color: c.secondary }}>
          {data.subtitle}
        </p>
      )}

      {/* Divider */}
      <div className="relative z-10 mt-3 flex w-[56%] items-center gap-2">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}66)` }} />
        <span className="text-[8px]" style={{ color: c.secondary }}>✦</span>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}66)` }} />
      </div>

      {data.description && (
        <p className="relative z-10 mt-3 mx-9 text-center text-[10px] leading-[1.85]"
          style={{ color: c.primary, opacity: 0.66 }}>
          {data.description}
        </p>
      )}

      {/* Date stamp */}
      {data.date && (
        <div className="relative z-10 mt-4 -rotate-3 px-3.5 py-1"
          style={{ border: `1.5px solid ${c.secondary}99`, borderRadius: 4, background: `${c.secondary}12` }}>
          <p className="text-[8.5px] font-bold tracking-[0.28em] uppercase" style={{ color: c.secondary }}>
            ✦ {fmt(data.date)} ✦
          </p>
        </div>
      )}
    </div>
  );
}
