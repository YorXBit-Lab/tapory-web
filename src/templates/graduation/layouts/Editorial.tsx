import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradEditorial({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: c.accent }}>
      {/* Full-bleed hero image */}
      <div className="relative w-full flex-shrink-0" style={{ height: '55%' }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
          : <div className="flex h-full w-full items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${c.primary}cc, ${c.primary}77)` }}>
              <span className="text-6xl opacity-20">📷</span>
            </div>}
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0) 30%, ${c.accent} 100%)` }} />
        <div className="absolute left-4 top-4">
          <div className="px-2 py-0.5" style={{ backgroundColor: c.secondary }}>
            <p className="text-[6px] font-black tracking-[0.4em] uppercase" style={{ color: c.primary }}>CLASS OF 2026</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-6 px-5">
        <p className="text-[26px] font-black leading-tight" style={{ color: c.primary, letterSpacing: '-0.02em' }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.subtitle && (
          <p className="mt-0.5 text-[8px] font-semibold tracking-[0.22em] uppercase opacity-50"
            style={{ color: c.primary }}>{data.subtitle}</p>
        )}
      </div>

      <div className="relative z-10 mx-5 my-3 h-px opacity-25" style={{ backgroundColor: c.primary }} />

      <p className="relative z-10 mx-5 text-[8px] leading-[1.8] opacity-55" style={{ color: c.primary }}>
        {data.description || 'Chúc mừng tốt nghiệp. Hành trình mới đang chờ bạn phía trước.'}
      </p>
      {data.date && (
        <p className="relative z-10 mx-5 mt-3 text-[7px] font-bold tracking-[0.3em] uppercase"
          style={{ color: c.secondary }}>— {fmt(data.date)} —</p>
      )}
    </div>
  );
}
