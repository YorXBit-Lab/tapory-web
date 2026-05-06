import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function WedRomantic({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col" style={{ backgroundColor: c.accent }}>
      <div className="relative w-full flex-shrink-0" style={{ height: 224 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
          : <div className="flex h-full w-full items-center justify-center text-5xl"
              style={{ background: 'linear-gradient(135deg, #fce7f3, #fdf2f8)' }}>💍</div>}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 30%, rgba(253,245,248,0.88) 78%, #fdf5f8 100%)' }} />
        <div className="absolute top-5 left-0 right-0 flex justify-center">
          <p className="text-[8px] font-light tracking-[0.5em] uppercase"
            style={{ color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 10px rgba(0,0,0,0.25)' }}>WEDDING</p>
        </div>
      </div>

      <div className="relative z-10 -mt-10 flex flex-col items-center px-6 pb-6 text-center">
        <span className="text-[22px]">💍</span>
        <p className="mt-1.5 text-[21px] font-bold leading-tight"
          style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
          {data.title || 'Tên đôi'}
        </p>
        {data.date && (
          <p className="mt-1 text-[8.5px] font-medium tracking-[0.22em]"
            style={{ color: c.secondary }}>{fmt(data.date)}</p>
        )}
        <div className="my-3 flex w-full items-center gap-2">
          <div className="h-px flex-1 rounded opacity-20" style={{ backgroundColor: c.primary }} />
          <span className="text-[11px]">💕</span>
          <div className="h-px flex-1 rounded opacity-20" style={{ backgroundColor: c.primary }} />
        </div>
        <p className="text-[8.5px] leading-[1.75] opacity-60" style={{ color: c.primary }}>
          {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
        </p>
      </div>
    </div>
  );
}
