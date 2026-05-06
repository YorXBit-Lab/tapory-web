import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradMinimal({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Hairline top accent */}
      <div className="absolute inset-x-0 top-0 h-[1.5px]"
        style={{ background: `linear-gradient(to right, transparent, ${c.secondary}90, transparent)` }} />

      {/* Ambient glow — very subtle, top left */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-52 w-52 rounded-full opacity-[0.28]"
        style={{ background: `radial-gradient(circle, ${c.secondary}60, transparent 65%)`, filter: 'blur(28px)' }} />

      <div className="flex-shrink-0" style={{ height: 58 }} />

      {/* Top label */}
      <p className="relative z-10 px-8 text-[6.5px] font-bold tracking-[0.52em] uppercase"
        style={{ color: c.secondary, opacity: 0.72 }}>
        Graduation
      </p>

      {/* Photo — perfect circle with soft shadow */}
      <div className="relative z-10 mt-7 self-center flex-shrink-0">
        <div className="overflow-hidden rounded-full"
          style={{
            width: 104,
            height: 104,
            boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)`,
          }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ transform: 'scale(1.04)' }} />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: `${c.primary}0a` }}>📷</div>}
        </div>
        {/* Hairline ring */}
        <div className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 1px ${c.primary}10, 0 0 0 5px ${c.primary}04` }} />
      </div>

      {/* Name — hero typography */}
      <div className="relative z-10 mt-8 px-7">
        <p className="text-[24px] font-semibold leading-tight"
          style={{ color: c.primary, letterSpacing: '-0.02em' }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.subtitle && (
          <p className="mt-1.5 text-[8px] tracking-[0.2em] uppercase"
            style={{ color: c.primary, opacity: 0.36 }}>
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Hairline divider */}
      <div className="relative z-10 mt-6 px-7">
        <div className="h-px w-full" style={{ backgroundColor: c.primary, opacity: 0.08 }} />
      </div>

      {/* Description */}
      <div className="relative z-10 mt-5 flex-1 px-7">
        <p className="text-[8px] leading-[1.92]"
          style={{ color: c.primary, opacity: 0.4 }}>
          {data.description || 'Chúc mừng tốt nghiệp. Hành trình mới đang chờ bạn.'}
        </p>
      </div>

      {/* Date + bottom hairline */}
      <div className="relative z-10 px-7 pb-10">
        <div className="mb-5 h-px" style={{ backgroundColor: c.primary, opacity: 0.06 }} />
        {data.date
          ? <p className="text-[7px] font-medium tracking-[0.28em] uppercase"
              style={{ color: c.primary, opacity: 0.28 }}>
              {fmt(data.date)}
            </p>
          : <div className="h-px w-12 rounded-full" style={{ backgroundColor: c.secondary, opacity: 0.4 }} />}
      </div>
    </div>
  );
}
