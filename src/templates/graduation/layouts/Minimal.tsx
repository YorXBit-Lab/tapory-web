import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradMinimal({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: c.accent }}>
      {/* Zone 1 — label */}
      <div className="flex-shrink-0 px-7 pt-8">
        <p className="text-[7px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>Graduation</p>
      </div>

      {/* Zone 2 — photo + name centered */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-7">
        <div className="overflow-hidden" style={{ width: 108, height: 108, borderRadius: 12 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: `${c.primary}0d` }}>📷</div>}
        </div>
        <div className="text-center">
          <p className="text-[22px] font-semibold leading-tight"
            style={{ color: c.primary, letterSpacing: '-0.01em' }}>
            {data.title || 'Tên người nhận'}
          </p>
          {data.subtitle && (
            <p className="mt-1 text-[8px] tracking-[0.2em] uppercase opacity-40" style={{ color: c.primary }}>
              {data.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Zone 3 — message */}
      <div className="flex-shrink-0 px-7 pb-8">
        <div className="mb-4 h-px opacity-10" style={{ backgroundColor: c.primary }} />
        <p className="text-[8px] leading-[1.85] opacity-45" style={{ color: c.primary }}>
          {data.description || 'Chúc mừng tốt nghiệp. Hành trình mới đang chờ bạn.'}
        </p>
        {data.date && (
          <p className="mt-3 text-[7px] font-medium tracking-[0.25em] uppercase opacity-30"
            style={{ color: c.primary }}>{fmt(data.date)}</p>
        )}
      </div>
    </div>
  );
}
