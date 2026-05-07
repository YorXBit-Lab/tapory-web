import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function BdayPastel({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-6 pb-7 pt-8"
      style={{ background: `linear-gradient(160deg, ${c.accent} 0%, #ffffff 55%, ${c.accent}88 100%)` }}>

      {/* ── Label ── */}
      <div className="mb-4 flex w-full flex-col items-center gap-1.5">
        <div className="h-px w-20 opacity-45" style={{ backgroundColor: c.secondary }} />
        <p className="text-[7px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>— Birthday —</p>
        <div className="h-px w-20 opacity-45" style={{ backgroundColor: c.secondary }} />
      </div>

      {/* ── Full mode: ảnh full-width ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 -mx-6 overflow-hidden"
          style={{ width: 'calc(100% + 48px)', height: 158 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-5xl"
                style={{ background: `linear-gradient(135deg, ${c.accent}, #fff8fb)` }}>🎀</div>}
        </div>
      )}

      {/* ── Circle mode (default): ảnh tròn double-ring ── */}
      {mode === 'circle' && (
        <div style={{
          width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          border: `3px solid ${c.secondary}`,
          boxShadow: `0 0 0 5px ${c.accent}, 0 0 0 8px ${c.secondary}44`,
        }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: `linear-gradient(135deg, ${c.accent}, #fff8fb)` }}>🎀</div>}
        </div>
      )}

      {/* ── Card mode: ảnh khung mềm ── */}
      {mode === 'card' && (
        <div className="flex-shrink-0 p-2 shadow-lg"
          style={{ backgroundColor: '#ffffff', border: `2px solid ${c.secondary}` }}>
          <div className="overflow-hidden" style={{ width: 124, height: 104 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: `linear-gradient(135deg, ${c.accent}, #fff8fb)` }}>🎀</div>}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <p className="mt-4 text-center font-bold leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>
      {data.date && (
        <p className="mt-1 text-[8px] font-semibold tracking-[0.2em]"
          style={{ color: c.secondary }}>{fmt(data.date)}</p>
      )}

      <div className="my-3 flex w-full items-center gap-2">
        <div className="h-px flex-1 rounded opacity-20" style={{ backgroundColor: c.primary }} />
        <span className="text-[11px]">🎀</span>
        <div className="h-px flex-1 rounded opacity-20" style={{ backgroundColor: c.primary }} />
      </div>

      <p className="text-center text-[8.5px] leading-[1.75] opacity-60" style={{ color: c.primary }}>
        {data.description || 'Chúc mừng sinh nhật! Chúc bạn luôn xinh đẹp, hạnh phúc và tràn đầy yêu thương.'}
      </p>
    </div>
  );
}
