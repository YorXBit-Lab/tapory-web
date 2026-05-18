import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function BdayElegant({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'full';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>

      {/* ── Full mode: ảnh nền lớn phía trên ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: 290 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-5xl" style={{ background: '#1a1a1a' }}>🎂</div>}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
          <div className="absolute bottom-5 left-0 right-0 px-6 text-center">
            <p className="text-[9.5px] font-light tracking-[0.55em] uppercase" style={{ color: c.secondary }}>HAPPY BIRTHDAY</p>
            <p className="mt-1 font-bold leading-tight text-white" style={{ fontFamily: font, fontSize: titleSize }}>
              {data.title || 'Tên người nhận'}
            </p>
            {data.date && <p className="mt-1 text-[10px] font-light" style={{ color: c.secondary }}>{fmt(data.date)}</p>}
          </div>
        </div>
      )}

      {/* ── Circle mode: ảnh tròn trên nền tối ── */}
      {mode === 'circle' && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 pt-12 pb-4">
          <p className="text-[9.5px] font-light tracking-[0.55em] uppercase" style={{ color: c.secondary }}>HAPPY BIRTHDAY</p>
          <div style={{ width: 152, height: 152, borderRadius: '50%', overflow: 'hidden',
            border: `3px solid ${c.secondary}`, flexShrink: 0 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: '#1a1a1a' }}>🎂</div>}
          </div>
          <div className="text-center">
            <p className="font-bold leading-tight text-white" style={{ fontFamily: font, fontSize: titleSize }}>
              {data.title || 'Tên người nhận'}
            </p>
            {data.date && <p className="mt-1 text-[10px] font-light" style={{ color: c.secondary }}>{fmt(data.date)}</p>}
          </div>
        </div>
      )}

      {/* ── Card mode: ảnh khung vàng trên nền tối ── */}
      {mode === 'card' && (
        <div className="flex flex-col items-center justify-center gap-4 px-6 pt-12 pb-4">
          <p className="text-[9.5px] font-light tracking-[0.55em] uppercase" style={{ color: c.secondary }}>HAPPY BIRTHDAY</p>
          <div style={{ padding: 3, border: `2px solid ${c.secondary}` }}>
            <div style={{ width: 144, height: 110, overflow: 'hidden' }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: '#1a1a1a' }}>🎂</div>}
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold leading-tight text-white" style={{ fontFamily: font, fontSize: titleSize }}>
              {data.title || 'Tên người nhận'}
            </p>
            {data.date && <p className="mt-1 text-[10px] font-light" style={{ color: c.secondary }}>{fmt(data.date)}</p>}
          </div>
        </div>
      )}

      {/* ── Description ── */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-4 text-center">
        <span className="text-[18px]">🕯️</span>
        <p className="text-[10.5px] leading-[1.8]" style={{ color: 'rgba(255,255,255,0.52)' }}>
          {data.description || 'Chúc mừng sinh nhật! Mong mỗi ngày đều tràn đầy niềm vui và hạnh phúc.'}
        </p>
      </div>
    </div>
  );
}
