import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function BdayMinimal({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="flex h-full w-full flex-col justify-between px-6 pb-7 pt-7"
      style={{ backgroundColor: c.accent }}>

      {/* ── Header ── */}
      <div>
        <div className="mb-3 h-[3px] w-8 rounded" style={{ backgroundColor: c.secondary }} />
        <p className="text-[8.5px] font-semibold tracking-[0.3em] uppercase" style={{ color: c.secondary }}>Happy Birthday</p>
        <p className="mt-1.5 font-bold leading-none"
          style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.date && (
          <p className="mt-1 text-[9px] opacity-45" style={{ color: c.primary }}>{fmt(data.date)}</p>
        )}
      </div>

      {/* ── Full mode: ảnh full-width ── */}
      {mode === 'full' && (
        <div className="overflow-hidden rounded-2xl shadow-sm" style={{ height: 132 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-4xl opacity-25"
                style={{ background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)' }}>🎂</div>}
        </div>
      )}

      {/* ── Card mode: ảnh có khung viền ── */}
      {mode === 'card' && (
        <div className="flex justify-center">
          <div className="p-2 shadow-md" style={{ backgroundColor: '#ffffff', border: `2px solid ${c.secondary}` }}>
            <div className="overflow-hidden" style={{ width: 120, height: 100 }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-3xl opacity-25"
                    style={{ background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)' }}>🎂</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Circle mode: ảnh tròn ── */}
      {mode === 'circle' && (
        <div className="flex justify-center">
          <div style={{ width: 114, height: 114, borderRadius: '50%', overflow: 'hidden',
            border: `3px solid ${c.secondary}`, flexShrink: 0 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-3xl opacity-25"
                  style={{ background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)' }}>🎂</div>}
          </div>
        </div>
      )}

      {/* ── Description ── */}
      <div>
        <div className="mb-2.5 h-px w-full rounded opacity-10" style={{ backgroundColor: c.primary }} />
        <p className="text-[8.5px] leading-[1.75] opacity-48" style={{ color: c.primary }}>
          {data.description || 'Chúc mừng sinh nhật! Mong bạn luôn hạnh phúc và thành công.'}
        </p>
      </div>
    </div>
  );
}
