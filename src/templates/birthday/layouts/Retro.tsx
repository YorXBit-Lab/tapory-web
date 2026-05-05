import { fmt } from '@/shared/utils/fmt';
import type { LayoutProps } from '@/templates/types';

export function BdayRetro({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-5 pb-5 pt-4"
      style={{ backgroundColor: '#fff9f0', backgroundImage: 'radial-gradient(#00000009 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      <div className="flex w-full flex-col items-center rounded-2xl px-5 py-5"
        style={{ border: `3px solid ${c.primary}` }}>
        <p className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: c.secondary }}>★ Happy Birthday ★</p>

        <div className="mt-3 flex-shrink-0 p-2 pb-6 shadow-md"
          style={{ backgroundColor: '#ffffff', transform: 'rotate(-1.5deg)' }}>
          <div className="overflow-hidden" style={{ width: 92, height: 92 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
              : <div className="flex h-full w-full items-center justify-center text-3xl"
                  style={{ background: '#f3f4f6' }}>📷</div>}
          </div>
        </div>

        <p className="mt-3 text-[17px] font-black uppercase tracking-wide" style={{ color: c.primary }}>
          {data.title || 'Tên người nhận'}
        </p>
        {data.date && (
          <p className="mt-0.5 text-[8.5px] font-bold" style={{ color: c.secondary }}>{fmt(data.date)}</p>
        )}

        <div className="my-2.5 flex justify-center gap-1.5">
          {['★', '★', '★'].map((s, i) => (
            <span key={i} className="text-[11px]" style={{ color: c.secondary }}>{s}</span>
          ))}
        </div>

        <p className="text-center text-[8.5px] leading-[1.7]" style={{ color: c.primary, opacity: 0.65 }}>
          {data.description || 'Happy Birthday! Chúc bạn luôn hạnh phúc và tràn đầy năng lượng.'}
        </p>
      </div>
    </div>
  );
}
