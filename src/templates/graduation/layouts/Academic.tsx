import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradAcademic({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden pb-8 pt-5"
      style={{ backgroundColor: c.accent }}>
      {/* Corner ornaments */}
      {(['left-3 top-3', 'right-3 top-3', 'left-3 bottom-3', 'right-3 bottom-3'] as const).map((pos, i) => (
        <div key={pos} className={`pointer-events-none absolute ${pos} text-[18px] leading-none`}
          style={{ color: c.secondary, opacity: i < 2 ? 0.3 : 0.2 }}>✦</div>
      ))}

      {/* Diploma seal */}
      <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}44 0%, ${c.secondary}11 70%)`, border: `2px solid ${c.secondary}55` }}>
        <span className="text-[26px]">🎓</span>
        <div className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(from 0deg, transparent 0deg, ${c.secondary}33 15deg, transparent 30deg, ${c.secondary}22 45deg, transparent 60deg, ${c.secondary}33 75deg, transparent 90deg, ${c.secondary}22 105deg, transparent 120deg, ${c.secondary}33 135deg, transparent 150deg, ${c.secondary}22 165deg, transparent 180deg, ${c.secondary}33 195deg, transparent 210deg, ${c.secondary}22 225deg, transparent 240deg, ${c.secondary}33 255deg, transparent 270deg, ${c.secondary}22 285deg, transparent 300deg, ${c.secondary}33 315deg, transparent 330deg, ${c.secondary}22 345deg, transparent 360deg)` }} />
      </div>

      {/* Portrait photo with gold border */}
      <div className="relative z-10 flex-shrink-0"
        style={{ padding: 3, background: `linear-gradient(135deg, ${c.secondary}, ${c.secondary}88)`, borderRadius: 8 }}>
        <div className="overflow-hidden" style={{ width: 100, height: 120, borderRadius: 5 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: `${c.primary}22` }}>📷</div>}
        </div>
      </div>

      {/* Double divider */}
      <div className="relative z-10 my-3 flex w-3/4 flex-col items-center gap-0.5">
        <div className="h-px w-full opacity-40" style={{ backgroundColor: c.secondary }} />
        <div className="h-px w-3/4 opacity-20" style={{ backgroundColor: c.secondary }} />
      </div>

      <p className="relative z-10 text-[20px] font-bold leading-tight tracking-wide"
        style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>
      {data.subtitle && (
        <p className="relative z-10 mt-1 text-[7.5px] font-semibold tracking-[0.28em] uppercase opacity-60"
          style={{ color: c.secondary }}>{data.subtitle}</p>
      )}

      <div className="relative z-10 my-3 flex w-3/4 flex-col items-center gap-0.5">
        <div className="h-px w-3/4 opacity-20" style={{ backgroundColor: c.secondary }} />
        <div className="h-px w-full opacity-40" style={{ backgroundColor: c.secondary }} />
      </div>

      <p className="relative z-10 mx-6 text-center text-[8px] leading-[1.8] opacity-55" style={{ color: c.primary }}>
        {data.description || 'Chúc mừng tốt nghiệp! Chúc bạn luôn thành công và hạnh phúc trên mọi con đường phía trước.'}
      </p>
      {data.date && (
        <p className="relative z-10 mt-3 text-[7px] font-bold tracking-[0.35em] uppercase"
          style={{ color: c.secondary }}>{fmt(data.date)}</p>
      )}
    </div>
  );
}
