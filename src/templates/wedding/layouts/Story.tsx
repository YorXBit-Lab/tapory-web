import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function WedStory({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="relative w-full flex-shrink-0" style={{ height: 264 }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
          : <div className="flex h-full w-full items-center justify-center text-5xl"
              style={{ background: '#1c1c1c' }}>💍</div>}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.78) 100%)' }} />
        <div className="absolute bottom-5 left-0 right-0 px-6 text-center">
          <p className="text-[7.5px] font-light tracking-[0.55em] uppercase" style={{ color: c.secondary }}>WEDDING DAY</p>
          <p className="mt-1 text-[22px] font-bold leading-tight text-white" style={{ fontFamily: 'Georgia, serif' }}>
            {data.title || 'Tên đôi'}
          </p>
          {data.date && <p className="mt-1 text-[8px] font-light" style={{ color: c.secondary }}>{fmt(data.date)}</p>}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-5 text-center">
        <span className="text-[18px]">💕</span>
        <p className="text-[8.5px] leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
        </p>
      </div>
    </div>
  );
}
