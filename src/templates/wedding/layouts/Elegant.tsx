import { fmt } from '@/shared/utils/fmt';
import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

export function WedElegant({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'card';

  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center gap-0 overflow-hidden px-6 pb-6 pt-6"
      style={{ backgroundColor: '#fafaf8' }}>

      <div className="mb-4 flex w-full flex-col items-center gap-1.5">
        <div className="h-px w-24 opacity-55" style={{ backgroundColor: c.secondary }} />
        <p className="text-[9px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>— Wedding —</p>
        <div className="h-px w-24 opacity-55" style={{ backgroundColor: c.secondary }} />
      </div>

      {/* ── Full mode ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0 -mx-6" style={{ width: 'calc(100% + 48px)', height: 170 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: '#e9e6df' }}>💍</div>}
        </div>
      )}

      {/* ── Card mode (default) ── */}
      {mode === 'card' && (
        <div className="flex-shrink-0 p-2 shadow-lg"
          style={{ backgroundColor: '#f7f5ef', border: `2.5px solid ${c.secondary}` }}>
          <div className="overflow-hidden" style={{ width: 130, height: 112 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: '#e9e6df' }}>💍</div>}
          </div>
        </div>
      )}

      {/* ── Circle mode ── */}
      {mode === 'circle' && (
        <div style={{ width: 128, height: 128, borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${c.secondary}`, flexShrink: 0 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: '#e9e6df' }}>💍</div>}
        </div>
      )}

      <p className="mt-4 text-center font-light leading-tight"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên đôi'}
      </p>
      {data.date && (
        <p className="mt-1.5 text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: c.secondary }}>{fmt(data.date)}</p>
      )}
      <div className="my-4 h-px w-16 opacity-35" style={{ backgroundColor: c.secondary }} />
      <p className="text-center text-[10.5px] leading-[1.75] opacity-52" style={{ color: c.primary }}>
        {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
      </p>
    </div>
  );
}
