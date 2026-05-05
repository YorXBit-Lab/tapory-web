import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function AnniClassic({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center px-5 pb-6 pt-6"
      style={{ backgroundColor: c.accent }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: `radial-gradient(${c.primary} 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />

      <span className="relative z-10 text-[22px]">💕</span>
      <p className="relative z-10 mt-1 text-[8px] font-semibold tracking-[0.32em] uppercase opacity-50"
        style={{ color: c.primary }}>Anniversary</p>

      <div className="relative z-10 mt-3 flex-shrink-0 p-1.5 shadow-lg"
        style={{ backgroundColor: '#fffdf8', border: `2px solid ${c.secondary}` }}>
        <div className="overflow-hidden" style={{ width: 126, height: 92 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: '#f5f1e8' }}>📷</div>}
        </div>
      </div>

      <p className="relative z-10 mt-4 text-center text-[19px] font-bold leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
        {data.title || 'Tên đôi'}
      </p>
      {data.date && (
        <p className="relative z-10 mt-1 text-[8.5px] font-medium"
          style={{ color: c.secondary }}>{fmt(data.date)}</p>
      )}

      <div className="relative z-10 my-3 h-px w-20"
        style={{ background: `linear-gradient(to right, transparent, ${c.secondary}, transparent)` }} />

      <p className="relative z-10 text-center text-[8.5px] leading-[1.75] opacity-52" style={{ color: c.primary }}>
        {data.description || 'Cảm ơn bạn đã ở bên tôi trong những năm tháng tuyệt vời nhất của cuộc đời.'}
      </p>
    </div>
  );
}
