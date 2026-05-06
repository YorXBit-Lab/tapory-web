import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradAcademic({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Edge vignette — linen paper feel */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 42%, rgba(0,0,0,0.07) 100%)' }} />

      {/* Diploma frame — outer */}
      <div className="pointer-events-none absolute"
        style={{ inset: 10, border: `1px solid ${c.secondary}68`, boxShadow: `inset 0 0 0 4px ${c.secondary}10` }} />
      {/* Diploma frame — inner hairline */}
      <div className="pointer-events-none absolute"
        style={{ inset: 15, border: `0.5px solid ${c.secondary}2a` }} />

      {/* Corner ornaments */}
      {(['top-[9px] left-[9px]', 'top-[9px] right-[9px]', 'bottom-[9px] left-[9px]', 'bottom-[9px] right-[9px]'] as const).map((pos, i) => (
        <span key={i} className={`pointer-events-none absolute ${pos} text-[10px] leading-none`}
          style={{ color: c.secondary, opacity: 0.75 }}>✦</span>
      ))}

      {/* Ambient gold glow — top center */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}48, transparent 68%)`, filter: 'blur(30px)' }} />

      <div className="flex-shrink-0" style={{ height: 52 }} />

      {/* Medallion seal */}
      <div className="relative z-10 flex-shrink-0">
        <div className="absolute -inset-4 rounded-full opacity-45"
          style={{ background: `radial-gradient(circle, ${c.secondary}55, transparent 65%)`, filter: 'blur(10px)' }} />
        <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(from 22deg, ${c.secondary}ff, ${c.secondary}cc, ${c.secondary}ff, ${c.secondary}88, ${c.secondary}ff, ${c.secondary}cc, ${c.secondary}ff)`,
            boxShadow: `0 0 0 1.5px ${c.secondary}50, 0 3px 14px ${c.secondary}60, inset 0 1.5px 0 rgba(255,255,255,0.42), inset 0 -1px 0 rgba(0,0,0,0.22)`,
          }}>
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full"
            style={{ background: `radial-gradient(circle at 38% 35%, ${c.secondary}f5, ${c.secondary}b5)` }}>
            <span className="text-[17px]">🎓</span>
          </div>
        </div>
      </div>

      {/* Certificate label */}
      <div className="relative z-10 mt-2.5 flex items-center gap-2">
        <div className="h-px w-9" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}68)` }} />
        <p className="text-[6px] font-bold tracking-[0.38em] uppercase" style={{ color: c.secondary, opacity: 0.82 }}>
          Certificate of Graduation
        </p>
        <div className="h-px w-9" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}68)` }} />
      </div>

      {/* Portrait — gold shimmer border */}
      <div className="relative z-10 mt-3.5 flex-shrink-0">
        <div className="absolute -inset-[3px] rounded-[11px]"
          style={{
            background: `linear-gradient(145deg, ${c.secondary}ff, ${c.secondary}55, ${c.secondary}ee, ${c.secondary}33, ${c.secondary}cc)`,
            filter: 'blur(1px)',
          }} />
        <div className="relative overflow-hidden"
          style={{
            width: 92,
            height: 110,
            borderRadius: 9,
            border: `1.5px solid ${c.secondary}aa`,
            boxShadow: `0 6px 22px rgba(0,0,0,0.16), inset 0 0 0 1px rgba(255,255,255,0.18)`,
          }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt=""
                style={{ transform: 'scale(1.04)' }} />
            : <div className="flex h-full w-full items-center justify-center text-3xl"
                style={{ background: `${c.primary}14` }}>📷</div>}
        </div>
      </div>

      {/* Divider — diamond */}
      <div className="relative z-10 mt-4 flex w-[66%] items-center gap-2.5">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}72)` }} />
        <div className="h-[5px] w-[5px] rotate-45" style={{ backgroundColor: c.secondary, opacity: 0.68 }} />
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}72)` }} />
      </div>

      {/* Name */}
      <p className="relative z-10 mt-3 px-5 text-center text-[21px] font-bold leading-snug"
        style={{ fontFamily: 'Georgia, serif', color: c.primary, letterSpacing: '0.01em' }}>
        {data.title || 'Tên người nhận'}
      </p>

      {data.subtitle && (
        <p className="relative z-10 mt-1.5 px-6 text-center text-[7px] font-semibold tracking-[0.32em] uppercase"
          style={{ color: c.secondary, opacity: 0.84 }}>
          {data.subtitle}
        </p>
      )}

      {/* Divider — lighter */}
      <div className="relative z-10 mt-3 flex w-[66%] items-center gap-2.5">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}42)` }} />
        <div className="h-[5px] w-[5px] rotate-45" style={{ backgroundColor: c.secondary, opacity: 0.38 }} />
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}42)` }} />
      </div>

      {/* Description */}
      <p className="relative z-10 mt-3 mx-9 text-center text-[7.5px] leading-[1.88]"
        style={{ color: c.primary, opacity: 0.5 }}>
        {data.description || 'Chúc mừng tốt nghiệp! Chúc bạn luôn thành công và hạnh phúc trên mọi con đường phía trước.'}
      </p>

      {data.date && (
        <div className="relative z-10 mt-4">
          <div className="px-3.5 py-1.5"
            style={{ border: `0.5px solid ${c.secondary}52`, background: `${c.secondary}0d`, borderRadius: 2 }}>
            <p className="text-[6.5px] font-bold tracking-[0.44em] uppercase" style={{ color: c.secondary }}>
              {fmt(data.date)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
