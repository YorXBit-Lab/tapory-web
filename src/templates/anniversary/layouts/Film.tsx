import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function AnniFilm({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 pb-5 pt-4"
      style={{ backgroundColor: '#0f0f0f' }}>
      <div className="relative w-full flex-shrink-0 overflow-hidden" style={{ height: 136, backgroundColor: '#181818' }}>
        <div className="absolute inset-y-0 left-0 flex w-5 flex-col justify-around px-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#000' }} />
          ))}
        </div>
        <div className="absolute inset-y-1.5 left-6 right-6 overflow-hidden">
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-3xl opacity-25">📷</div>}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(201,169,60,0.12) 0%, transparent 50%)' }} />
        </div>
        <div className="absolute inset-y-0 right-0 flex w-5 flex-col justify-around px-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#000' }} />
          ))}
        </div>
      </div>

      <div className="w-full text-center">
        <p className="text-[7.5px] font-bold tracking-[0.32em] uppercase" style={{ color: c.secondary }}>❤ Anniversary ❤</p>
        <p className="mt-1.5 text-[19px] font-bold" style={{ color: '#ffffff', fontFamily: 'Georgia, serif' }}>
          {data.title || 'Tên đôi'}
        </p>
        {data.date && (
          <p className="mt-1 text-[8px] tracking-widest opacity-45" style={{ color: c.secondary }}>{fmt(data.date)}</p>
        )}
        <div className="mx-auto my-2.5 h-px w-12 rounded opacity-18" style={{ backgroundColor: c.secondary }} />
        <p className="text-[8.5px] leading-[1.75]" style={{ color: 'rgba(255,255,255,0.42)' }}>
          {data.description || 'Những khoảnh khắc đẹp nhất luôn là những khoảnh khắc bên nhau.'}
        </p>
      </div>
    </div>
  );
}
