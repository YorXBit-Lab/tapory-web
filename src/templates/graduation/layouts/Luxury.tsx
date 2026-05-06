import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradLuxury({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden pb-8 pt-6"
      style={{ backgroundColor: '#0f0f0f' }}>
      <div className="pointer-events-none absolute -top-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-[0.18]"
        style={{ background: `radial-gradient(circle, ${c.secondary}, transparent 68%)`, filter: 'blur(24px)' }} />

      <div className="relative z-10 mb-5 flex w-4/5 flex-col items-center gap-1">
        <div className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${c.secondary}, transparent)` }} />
        <div className="h-px w-1/2 opacity-40"
          style={{ background: `linear-gradient(to right, transparent, ${c.secondary}, transparent)` }} />
      </div>

      <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ border: `1.5px solid ${c.secondary}66`, background: `${c.secondary}11` }}>
        <p className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: c.secondary }}>GR</p>
      </div>

      <div className="relative z-10 flex-shrink-0"
        style={{ padding: 2.5, background: `linear-gradient(135deg, ${c.secondary}, ${c.secondary}55, ${c.secondary})`, borderRadius: 9 }}>
        <div className="overflow-hidden" style={{ width: 112, height: 132, borderRadius: 7 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: '#1a1a1a' }}>📷</div>}
        </div>
      </div>

      <p className="relative z-10 mt-4 text-[22px] font-bold leading-tight tracking-wide"
        style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>
      {data.subtitle && (
        <p className="relative z-10 mt-1 text-[7.5px] font-semibold tracking-[0.35em] uppercase"
          style={{ color: c.secondary, opacity: 0.7 }}>{data.subtitle}</p>
      )}

      <div className="relative z-10 my-4 flex w-4/5 flex-col items-center gap-1">
        <div className="h-px w-1/2 opacity-40"
          style={{ background: `linear-gradient(to right, transparent, ${c.secondary}, transparent)` }} />
        <div className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${c.secondary}, transparent)` }} />
      </div>

      <p className="relative z-10 mx-7 text-center text-[7.5px] leading-[1.9]"
        style={{ color: c.primary, opacity: 0.55 }}>
        {data.description || '"Chúc mừng tốt nghiệp. Tương lai rực rỡ đang chờ đón bạn."'}
      </p>
      {data.date && (
        <p className="relative z-10 mt-4 text-[6.5px] font-bold tracking-[0.4em] uppercase"
          style={{ color: c.secondary, opacity: 0.5 }}>{fmt(data.date)}</p>
      )}
    </div>
  );
}
