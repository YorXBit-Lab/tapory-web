import type { LayoutProps } from '@/templates/types';

export function SocLinktree({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden px-5 pb-6 pt-8"
      style={{ background: `linear-gradient(145deg, ${c.accent} 0%, #ffffff 100%)` }}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full opacity-22"
        style={{ background: `radial-gradient(circle, ${c.primary}, transparent)`, filter: 'blur(22px)' }} />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-36 w-36 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, ${c.secondary}, transparent)`, filter: 'blur(18px)' }} />

      <div className="relative z-10 flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: 80, height: 80, border: '3.5px solid white', boxShadow: '0 4px 22px rgba(0,0,0,0.14)' }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
          : <div className="flex h-full w-full items-center justify-center text-3xl"
              style={{ background: '#e5e7eb' }}>👤</div>}
      </div>

      <p className="relative z-10 mt-3 text-[15px] font-bold" style={{ color: c.primary }}>
        {data.title || 'Tên của bạn'}
      </p>
      <p className="relative z-10 mt-0.5 text-center text-[8.5px]" style={{ color: c.secondary }}>
        {data.subtitle || 'Bio / Tagline'}
      </p>

      <div className="relative z-10 mt-5 flex w-full flex-col gap-2">
        {[['📘', 'Facebook'], ['📸', 'Instagram'], ['🎵', 'TikTok'], ['▶️', 'YouTube']].map(([icon, label], i) => (
          <div key={i} className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[10px] font-semibold shadow-sm"
            style={{
              backgroundColor: i === 0 ? c.primary : `${c.primary}12`,
              color: i === 0 ? '#fff' : c.primary,
              border: `1.5px solid ${c.primary}20`,
            }}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
