import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function WedElegant({ data, c }: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-0 overflow-hidden px-6 pb-6 pt-6"
      style={{ backgroundColor: '#fafaf8' }}>
      <div className="mb-4 flex w-full flex-col items-center gap-1.5">
        <div className="h-px w-24 opacity-55" style={{ backgroundColor: c.secondary }} />
        <p className="text-[7px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>— Wedding —</p>
        <div className="h-px w-24 opacity-55" style={{ backgroundColor: c.secondary }} />
      </div>

      <div className="flex-shrink-0 p-2 shadow-lg"
        style={{ backgroundColor: '#f7f5ef', border: `2.5px solid ${c.secondary}` }}>
        <div className="overflow-hidden" style={{ width: 130, height: 112 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-4xl"
                style={{ background: '#e9e6df' }}>💍</div>}
        </div>
      </div>

      <p className="mt-4 text-center text-[21px] font-light leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.primary }}>
        {data.title || 'Tên đôi'}
      </p>
      {data.date && (
        <p className="mt-1.5 text-[8px] font-bold tracking-[0.3em] uppercase"
          style={{ color: c.secondary }}>{fmt(data.date)}</p>
      )}
      <div className="my-4 h-px w-16 opacity-35" style={{ backgroundColor: c.secondary }} />
      <p className="text-center text-[8.5px] leading-[1.75] opacity-52" style={{ color: c.primary }}>
        {data.description || 'Chúc hai bạn trăm năm hạnh phúc, mãi mãi yêu thương và gắn bó bên nhau.'}
      </p>
    </div>
  );
}
