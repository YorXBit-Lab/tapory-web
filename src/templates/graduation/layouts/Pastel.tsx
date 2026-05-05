import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function GradPastel({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden pb-7 pt-6"
      style={{ background: 'linear-gradient(160deg, #fce7f3 0%, #ede9fe 45%, #dbeafe 100%)' }}>
      <div className="pointer-events-none absolute -left-8 -top-8 h-48 w-48 rounded-full opacity-50"
        style={{ background: 'radial-gradient(circle, #fbcfe8, transparent 65%)', filter: 'blur(22px)' }} />
      <div className="pointer-events-none absolute -right-6 top-20 h-40 w-40 rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, #ddd6fe, transparent 65%)', filter: 'blur(18px)' }} />
      <div className="pointer-events-none absolute bottom-12 left-4 h-32 w-32 rounded-full opacity-35"
        style={{ background: 'radial-gradient(circle, #bfdbfe, transparent 65%)', filter: 'blur(16px)' }} />

      <div className="relative z-10 flex-shrink-0">
        <div className="absolute -inset-2 rounded-2xl opacity-60"
          style={{ background: 'conic-gradient(from 0deg, #f9a8d4, #c4b5fd, #93c5fd, #6ee7b7, #f9a8d4)', filter: 'blur(7px)' }} />
        <div className="relative overflow-hidden rounded-2xl"
          style={{ width: 108, height: 126, border: '3px solid rgba(255,255,255,0.9)' }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: 'rgba(255,255,255,0.5)' }}>📷</div>}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex items-center gap-2">
        <div className="h-px w-8 opacity-30" style={{ backgroundColor: c.primary }} />
        <span className="text-[10px]">🌸</span>
        <div className="h-px w-8 opacity-30" style={{ backgroundColor: c.primary }} />
      </div>

      <p className="relative z-10 mt-2 text-[21px] font-bold"
        style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
        {data.title || 'Tên người nhận'}
      </p>
      {data.subtitle && (
        <p className="relative z-10 mt-0.5 text-center text-[8px] opacity-50"
          style={{ color: c.primary }}>{data.subtitle}</p>
      )}

      <div className="relative z-10 mx-5 mt-4 rounded-2xl px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(14px)', border: '1.5px solid rgba(255,255,255,0.8)' }}>
        <p className="text-center text-[8px] leading-[1.8]" style={{ color: c.primary, opacity: 0.7 }}>
          {data.description || 'Chúc mừng tốt nghiệp! Wishing you a future as bright and beautiful as you are.'}
        </p>
      </div>

      {data.date && (
        <p className="relative z-10 mt-3 text-[7.5px] font-semibold tracking-[0.22em] uppercase opacity-45"
          style={{ color: c.primary }}>{fmt(data.date)}</p>
      )}
    </div>
  );
}
