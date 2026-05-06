import type { LayoutProps } from '@/templates/types';

export function SocDark({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-5 pb-6"
      style={{ backgroundColor: c.accent }}>
      <div className="relative flex-shrink-0">
        <div className="pointer-events-none absolute -inset-5 rounded-full opacity-28"
          style={{ background: `radial-gradient(circle, ${c.primary}, transparent)`, filter: 'blur(18px)' }} />
        <div className="relative overflow-hidden rounded-full shadow-2xl"
          style={{ width: 88, height: 88, border: `2.5px solid ${c.primary}55` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-3xl"
                style={{ background: '#1a1a2e' }}>👤</div>}
        </div>
      </div>

      <div className="text-center">
        <p className="text-[15px] font-bold" style={{ color: c.primary }}>
          {data.title || 'Tên của bạn'}
        </p>
        <p className="mt-0.5 text-[8.5px] opacity-65" style={{ color: c.secondary }}>
          {data.subtitle || 'Bio / Tagline'}
        </p>
      </div>

      <div className="flex gap-3">
        {['📘', '📸', '🎵', '▶️'].map((icon, i) => (
          <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full text-[14px]"
            style={{ backgroundColor: `${c.primary}18`, border: `1px solid ${c.primary}30` }}>
            {icon}
          </div>
        ))}
      </div>

      <div className="h-px w-24 rounded opacity-15" style={{ backgroundColor: c.primary }} />

      {data.description && (
        <p className="text-center text-[8px] leading-[1.7] opacity-38" style={{ color: '#ffffff' }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
