import type { LayoutProps } from '@/templates/types';

export function SpotLight({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-5 pb-6"
      style={{ backgroundColor: '#ffffff' }}>
      <div className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-xl"
        style={{ background: `linear-gradient(135deg, ${c.primary}16, ${c.secondary}10)`, border: `1px solid ${c.primary}0e` }}>
        <span className="text-[48px]">🎵</span>
      </div>

      <div className="w-full text-center">
        <p className="text-[13px] font-bold" style={{ color: '#111827' }}>
          {data.title || 'Tên bài hát'}
        </p>
        <p className="mt-0.5 text-[9.5px]" style={{ color: c.primary }}>{data.subtitle || 'Nghệ sĩ'}</p>
      </div>

      <div className="w-full rounded-2xl px-4 py-3.5 shadow-sm"
        style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}>
        <div className="h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#e5e7eb' }}>
          <div className="h-full rounded-full" style={{ width: '35%', backgroundColor: c.primary }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[7.5px]" style={{ color: '#9ca3af' }}>
          <span>0:58</span><span>3:20</span>
        </div>
        <div className="mt-2.5 flex items-center justify-center gap-6">
          <span className="text-[15px] opacity-42" style={{ color: '#6b7280' }}>⏮</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: c.primary }}>
            <span className="pl-0.5 text-[14px] text-white">▶</span>
          </div>
          <span className="text-[15px] opacity-42" style={{ color: '#6b7280' }}>⏭</span>
        </div>
      </div>

      {data.description && (
        <p className="text-center text-[8px] leading-[1.7] opacity-42" style={{ color: c.secondary }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
