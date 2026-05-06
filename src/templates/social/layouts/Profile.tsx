import type { LayoutProps } from '@/templates/types';

export function SocProfile({ data, c }: LayoutProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      <div className="h-[70px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${c.primary}44, ${c.secondary}30)` }} />

      <div className="flex flex-1 flex-col px-5 pb-4">
        <div className="-mt-9 flex-shrink-0 overflow-hidden rounded-full border-[3.5px] border-white shadow-lg"
          style={{ width: 68, height: 68 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" />
            : <div className="flex h-full w-full items-center justify-center text-2xl"
                style={{ background: '#f3f4f6' }}>👤</div>}
        </div>

        <p className="mt-2 text-[13px] font-bold" style={{ color: '#111827' }}>
          {data.title || 'Tên của bạn'}
        </p>
        <p className="mt-0.5 text-[8.5px]" style={{ color: c.secondary }}>{data.subtitle || 'Bio / Tagline'}</p>

        <div className="my-3 flex gap-5">
          {[['12', 'Bài'], ['340', 'Followers'], ['180', 'Following']].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-[11px] font-bold" style={{ color: '#111827' }}>{n}</p>
              <p className="text-[7.5px]" style={{ color: '#9ca3af' }}>{l}</p>
            </div>
          ))}
        </div>

        <div className="mb-3 h-px w-full rounded opacity-[0.08]" style={{ backgroundColor: '#111827' }} />

        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-sm"
              style={{ aspectRatio: '1', background: `${c.primary}${i % 2 === 0 ? '16' : '0c'}` }}>
              {i === 0 && data.imageUrl && (
                <img src={data.imageUrl} className="h-full w-full object-cover" alt="" />
              )}
            </div>
          ))}
        </div>

        {data.description && (
          <p className="mt-3 text-[8px] leading-[1.7] opacity-48" style={{ color: '#111827' }}>{data.description}</p>
        )}
      </div>
    </div>
  );
}
