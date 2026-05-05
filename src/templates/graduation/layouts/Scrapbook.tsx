import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradScrapbook({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden pb-6 pt-5"
      style={{ backgroundColor: c.accent }}>
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `radial-gradient(circle, ${c.primary}1a 1px, transparent 1px)`, backgroundSize: '14px 14px' }} />

      <div className="pointer-events-none absolute right-5 top-5 text-[20px] opacity-40" style={{ color: c.secondary }}>⭐</div>
      <div className="pointer-events-none absolute left-4 top-20 text-[14px] opacity-30" style={{ color: c.secondary }}>✨</div>
      <div className="pointer-events-none absolute right-7 bottom-16 text-[16px] opacity-25">🌟</div>

      {/* Polaroid with washi tape */}
      <div className="relative z-10 mx-auto flex-shrink-0" style={{ transform: 'rotate(-2.5deg)' }}>
        <div className="absolute -top-3 left-1/2 h-5 w-16"
          style={{ transform: 'translateX(-50%) rotate(1deg)', background: `${c.secondary}88`, borderRadius: 2 }} />
        <div className="bg-white shadow-xl" style={{ padding: '8px 8px 24px 8px', borderRadius: 4 }}>
          <div className="overflow-hidden" style={{ width: 120, height: 130 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
              : <div className="flex h-full w-full items-center justify-center text-4xl"
                  style={{ background: '#f3f4f6' }}>📷</div>}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-4 rounded-full px-4 py-1.5"
        style={{ backgroundColor: c.secondary }}>
        <p className="text-[7px] font-black tracking-[0.3em] uppercase text-white">🎓 Tốt Nghiệp!</p>
      </div>

      <div className="relative z-10 mt-3 px-6 text-center">
        <p className="text-[19px] font-bold" style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.subtitle && (
          <p className="mt-0.5 text-[8px] opacity-50" style={{ color: c.primary }}>{data.subtitle}</p>
        )}
      </div>

      <div className="relative z-10 mx-6 mt-3 rounded-xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.72)', border: '1.5px dashed rgba(0,0,0,0.12)' }}>
        <p className="text-center text-[8px] leading-[1.75]" style={{ color: c.primary, opacity: 0.65 }}>
          {data.description || 'Congratulations! Wishing you all the best in your next adventure.'}
        </p>
      </div>

      {data.date && (
        <p className="relative z-10 mt-3 text-center text-[7.5px] font-semibold tracking-[0.2em] uppercase opacity-40"
          style={{ color: c.primary }}>{fmt(data.date)}</p>
      )}
    </div>
  );
}
