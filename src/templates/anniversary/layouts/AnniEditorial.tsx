import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function AnniEditorial({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: c.accent }}>
      <div className="flex-shrink-0 px-5 pb-4 pt-6"
        style={{ borderBottom: `2.5px solid ${c.secondary}` }}>
        <p className="text-[7px] font-black tracking-[0.5em] uppercase" style={{ color: c.secondary }}>Anniversary</p>
        <p className="mt-0.5 text-[24px] font-light leading-tight"
          style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
          {data.title || 'Tên đôi'}
        </p>
        {data.date && (
          <p className="mt-1 text-[8.5px] tracking-widest uppercase opacity-42"
            style={{ color: c.primary }}>{fmt(data.date)}</p>
        )}
      </div>

      <div className="relative w-full flex-shrink-0" style={{ height: 144 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
          : <div className="flex h-full w-full items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' }}>📷</div>}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.06) 0%, transparent 50%)' }} />
      </div>

      <div className="flex-1 px-5 pt-4">
        <div className="mb-2 h-px w-8 rounded opacity-55" style={{ backgroundColor: c.secondary }} />
        <p className="text-[8.5px] leading-[1.8] opacity-52" style={{ color: c.primary }}>
          {data.description || 'Cảm ơn bạn đã ở bên tôi trong những năm tháng tuyệt vời nhất.'}
        </p>
      </div>
    </div>
  );
}
