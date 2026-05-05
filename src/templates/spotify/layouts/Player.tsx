import type { LayoutProps } from '@/templates/types';

export function SpotPlayer({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 pb-8 pt-8"
      style={{ backgroundColor: c.accent }}>
      <div className="flex h-[132px] w-[132px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-2xl"
        style={{ background: `linear-gradient(135deg, ${c.secondary}28, ${c.primary}18)`, border: `1px solid ${c.primary}20` }}>
        <span className="text-[52px]">🎵</span>
      </div>

      <div className="mt-5 w-full">
        <p className="text-center text-[13px] font-bold leading-tight" style={{ color: c.secondary }}>
          {data.title || 'Tên bài hát'}
        </p>
        <p className="mt-0.5 text-center text-[9.5px] opacity-42" style={{ color: c.secondary }}>
          {data.subtitle || 'Nghệ sĩ'}
        </p>
      </div>

      <div className="relative mt-5 w-full">
        <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${c.secondary}20` }}>
          <div className="h-full rounded-full" style={{ width: '40%', backgroundColor: c.primary }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[7.5px] opacity-28" style={{ color: c.secondary }}>
          <span>1:23</span><span>3:45</span>
        </div>
      </div>

      <div className="mt-5 flex w-full items-center justify-between px-4">
        <span className="text-[17px] opacity-38" style={{ color: c.secondary }}>⏮</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: c.primary }}>
          <span className="pl-0.5 text-[20px]" style={{ color: c.accent === '#191414' ? '#000' : '#fff' }}>▶</span>
        </div>
        <span className="text-[17px] opacity-38" style={{ color: c.secondary }}>⏭</span>
      </div>

      {data.description && (
        <p className="mt-5 text-center text-[8px] leading-[1.7] opacity-28" style={{ color: c.secondary }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
