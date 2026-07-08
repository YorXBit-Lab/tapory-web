import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function KeepCapsule({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden pb-9"
      style={{ backgroundColor: c.accent }}>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}30, transparent 65%)`, filter: 'blur(36px)' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.5) 100%)` }} />

      <div className="flex-shrink-0" style={{ height: 46 }} />

      {/* Label */}
      <div className="relative z-10 flex items-center gap-2">
        <span className="h-px w-7" style={{ background: `linear-gradient(to right, transparent, ${c.secondary})` }} />
        <p className="text-[7.5px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>Kỷ vật · Time Capsule</p>
        <span className="h-px w-7" style={{ background: `linear-gradient(to left, transparent, ${c.secondary})` }} />
      </div>

      {/* Photo with gold ring */}
      <div className="relative z-10 mt-5 flex-shrink-0">
        <div className="absolute -inset-2 rounded-full opacity-60"
          style={{ background: `radial-gradient(circle, ${c.secondary}44, transparent 70%)`, filter: 'blur(10px)' }} />
        {mode === 'full' ? (
          <div className="relative overflow-hidden" style={{ width: 196, height: 132, borderRadius: 12, border: `1.5px solid ${c.secondary}aa`, boxShadow: `0 0 26px ${c.secondary}33, 0 14px 40px rgba(0,0,0,0.5)` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.secondary}18` }}>📷</div>}
          </div>
        ) : mode === 'card' ? (
          <div className="relative overflow-hidden" style={{ width: 116, height: 140, borderRadius: 10, border: `1.5px solid ${c.secondary}aa`, boxShadow: `0 0 26px ${c.secondary}33, 0 14px 40px rgba(0,0,0,0.5)` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.secondary}18` }}>📷</div>}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-full" style={{ width: 124, height: 124, border: `1.5px solid ${c.secondary}aa`, boxShadow: `0 0 26px ${c.secondary}33, 0 14px 40px rgba(0,0,0,0.5)` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.secondary}18` }}>📷</div>}
          </div>
        )}
      </div>

      {/* Title */}
      <p className="relative z-10 mt-5 px-7 text-center font-bold leading-snug"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary, textShadow: `0 2px 12px rgba(0,0,0,0.4)` }}>
        {data.title || 'Tên kỷ vật'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-1.5 px-7 text-center text-[9px] font-semibold tracking-[0.28em] uppercase"
          style={{ color: c.secondary }}>
          {data.subtitle}
        </p>
      )}

      {data.date && (
        <p className="relative z-10 mt-2 text-[8.5px] tracking-[0.2em]" style={{ color: c.primary, opacity: 0.45 }}>
          Lưu giữ từ {fmt(data.date)}
        </p>
      )}

      {/* Story card */}
      {data.description && (
        <div className="relative z-10 mx-7 mt-4 rounded-2xl px-5 py-4"
          style={{ background: `${c.secondary}12`, border: `1px solid ${c.secondary}33`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
          <p className="text-center text-[10px] leading-[1.9]" style={{ color: c.primary, opacity: 0.8 }}>
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
}
