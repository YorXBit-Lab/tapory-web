import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function BdayMinimal({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col justify-between px-6 pb-7 pt-7"
      style={{ backgroundColor: c.accent }}>
      <div>
        <div className="mb-3 h-[3px] w-8 rounded" style={{ backgroundColor: c.secondary }} />
        <p className="text-[8.5px] font-semibold tracking-[0.3em] uppercase" style={{ color: c.secondary }}>Happy Birthday</p>
        <p className="mt-1.5 text-[28px] font-bold leading-none" style={{ color: c.primary }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.date && (
          <p className="mt-1 text-[9px] opacity-45" style={{ color: c.primary }}>{fmt(data.date)}</p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl shadow-sm" style={{ height: 132 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
          : <div className="flex h-full w-full items-center justify-center text-4xl opacity-15"
              style={{ background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)' }}>📷</div>}
      </div>

      <div>
        <div className="mb-2.5 h-px w-full rounded opacity-10" style={{ backgroundColor: c.primary }} />
        <p className="text-[8.5px] leading-[1.75] opacity-48" style={{ color: c.primary }}>
          {data.description || 'Chúc mừng sinh nhật! Mong bạn luôn hạnh phúc và thành công.'}
        </p>
      </div>
    </div>
  );
}
