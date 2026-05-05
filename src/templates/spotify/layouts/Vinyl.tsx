import type { LayoutProps } from '@/templates/types';

export function SpotVinyl({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-5 pb-6"
      style={{ backgroundColor: c.accent }}>
      <div className="relative flex-shrink-0">
        <div className="pointer-events-none absolute -inset-4 rounded-full opacity-22"
          style={{ background: `radial-gradient(circle, ${c.primary}, transparent)`, filter: 'blur(10px)' }} />
        <div className="relative flex h-[144px] w-[144px] items-center justify-center rounded-full shadow-2xl"
          style={{ background: 'repeating-radial-gradient(circle, #2a2a2a 0px, #2a2a2a 1.5px, #1a1a1a 2px, #1a1a1a 6px)' }}>
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full shadow-inner"
            style={{ backgroundColor: c.primary }}>
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#0a0a0a' }} />
          </div>
          <div className="pointer-events-none absolute right-5 top-5 h-7 w-7 rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle at 30% 30%, white, transparent)' }} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-[13px] font-bold" style={{ color: c.primary }}>
          {data.title || 'Tên bài hát'}
        </p>
        <p className="mt-0.5 text-[9px] opacity-48" style={{ color: c.secondary }}>
          {data.subtitle || 'Nghệ sĩ'}
        </p>
      </div>

      {data.description && (
        <p className="text-center text-[8.5px] leading-[1.7] opacity-38" style={{ color: c.secondary }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
