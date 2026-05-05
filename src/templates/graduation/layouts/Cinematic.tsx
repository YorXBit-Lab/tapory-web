import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradCinematic({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="relative w-full flex-shrink-0" style={{ height: 280 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
          : <div className="flex h-full w-full items-center justify-center"
              style={{ background: 'linear-gradient(160deg, #1a1a2e, #0d0d1a)' }}>
              <span className="text-6xl opacity-10">📷</span>
            </div>}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.05) 35%, rgba(10,10,10,0.7) 75%, #0a0a0a 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(0,0,0,0.55) 100%)' }} />
      </div>

      <div className="relative z-10 -mt-10 flex flex-col px-6 pb-8">
        <p className="mb-2 text-[8px] font-bold tracking-[0.45em] uppercase"
          style={{ color: c.secondary, opacity: 0.7 }}>✦ Graduation ✦</p>
        <p className="text-[24px] font-bold leading-tight"
          style={{ fontFamily: 'Georgia, serif', color: '#f5f0e8' }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.subtitle && (
          <p className="mt-1 text-[8px] tracking-[0.18em] uppercase"
            style={{ color: c.secondary, opacity: 0.65 }}>{data.subtitle}</p>
        )}
        <div className="my-3 h-px w-16 opacity-30" style={{ backgroundColor: c.secondary }} />
        <p className="text-[8px] leading-[1.85] italic" style={{ color: c.secondary, opacity: 0.75 }}>
          {data.description || '"Cuối cùng cũng đến ngày này. Chúc mừng bạn đã hoàn thành hành trình."'}
        </p>
        {data.date && (
          <p className="mt-4 text-[7px] font-semibold tracking-[0.3em] uppercase" style={{ color: '#666' }}>
            {fmt(data.date)}
          </p>
        )}
      </div>
    </div>
  );
}
