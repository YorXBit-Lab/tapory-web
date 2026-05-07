import type { LayoutProps } from '@/templates/types';

export function RedirectDefault({ data, c }: LayoutProps) {
  const url = data.website || '';
  const displayUrl = url.replace(/^https?:\/\//, '');

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-5 px-6"
      style={{ background: `linear-gradient(160deg, ${c.accent} 0%, #ffffff 100%)` }}
    >
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.secondary}28, transparent 70%)`, filter: 'blur(24px)' }}
      />

      {/* Icon */}
      <div
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
        style={{ background: `linear-gradient(135deg, ${c.secondary}, ${c.primary})` }}
      >
        🔗
      </div>

      {/* Label */}
      <div className="relative z-10 flex flex-col items-center gap-1 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40" style={{ color: c.primary }}>
          Chuyển hướng tới
        </p>
        <div
          className="mt-1 w-full max-w-[180px] rounded-xl px-4 py-3 text-center text-[9px] font-medium leading-relaxed break-all"
          style={{ background: `${c.secondary}12`, color: c.secondary, border: `1px solid ${c.secondary}22` }}
        >
          {displayUrl || 'https://example.com'}
        </div>
      </div>

      {/* Footer note */}
      <p className="relative z-10 text-[7.5px] opacity-35 text-center" style={{ color: c.primary }}>
        Người dùng sẽ được chuyển hướng ngay khi mở link
      </p>
    </div>
  );
}
