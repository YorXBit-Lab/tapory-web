'use client';
import type { LayoutProps } from '@/templates/types';

/**
 * Editor/view preview for the Stardust memory film. The real experience is a
 * WebGL site rendered outside tapory (NEXT_PUBLIC_STARDUST_URL/{cardId});
 * this layout is its poster: same palette, content summary, photo strip.
 */
export function StardustFilm({ data, c }: LayoutProps) {
  const photos = (data.photoUrls ?? []).slice(0, 6);
  const lines = (data.description ?? '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 3);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden px-4 py-6 text-center"
      style={{ background: 'radial-gradient(120% 90% at 50% 20%, #1a0f2e 0%, #0b0618 55%, #060312 100%)' }}
    >
      {/* star dust */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 18% 28%, #cdb8ff 50%, transparent 51%),' +
            'radial-gradient(1px 1px at 72% 14%, #ffd6ea 50%, transparent 51%),' +
            'radial-gradient(1.5px 1.5px at 84% 42%, #fff 50%, transparent 51%),' +
            'radial-gradient(1px 1px at 8% 64%, #ffd6ea 50%, transparent 51%),' +
            'radial-gradient(1px 1px at 56% 78%, #cdb8ff 50%, transparent 51%),' +
            'radial-gradient(1.5px 1.5px at 34% 50%, #fff 50%, transparent 51%)',
        }}
      />
      {/* letterbox */}
      <div className="absolute inset-x-0 top-0 h-3 bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-black" />

      <p className="relative z-10 mt-3 text-[7px] font-bold uppercase tracking-[0.32em]" style={{ color: `${c.primary}66` }}>
        ✦ a light film for {data.title || '…'} ✦
      </p>
      <h1
        className="relative z-10 mt-2 font-serif text-[19px] font-medium uppercase leading-tight tracking-[0.18em]"
        style={{ color: c.primary, textShadow: `0 0 18px ${c.secondary}88` }}
      >
        {data.mainGreeting || 'Chúc Mừng'}
      </h1>
      <p className="relative z-10 mt-1 text-[11px] italic" style={{ color: c.secondary }}>
        {data.bigWish || 'Happy Birthday'}
      </p>

      <div className="relative z-10 mt-4 space-y-1">
        {lines.map((line, i) => (
          <p key={i} className="text-[8.5px] leading-relaxed" style={{ color: `${c.primary}b8` }}>{line}</p>
        ))}
      </div>

      {/* photo strip */}
      <div className="relative z-10 mt-4 grid w-full grid-cols-3 gap-1.5 px-2">
        {photos.map((url, i) => (
          <div key={i} className="aspect-[4/5] overflow-hidden rounded-md ring-1" style={{ ['--tw-ring-color' as never]: `${c.secondary}55` }}>
            <img src={url} className="h-full w-full object-cover" alt="" />
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-3 rounded-lg border border-dashed py-5 text-[8px]" style={{ borderColor: `${c.secondary}44`, color: `${c.primary}55` }}>
            Thêm ảnh kỷ niệm để dựng phim ✦
          </div>
        )}
      </div>

      <div className="relative z-10 mt-auto pb-4">
        <p className="text-[8px] leading-relaxed" style={{ color: `${c.primary}88` }}>
          {(data.finalMessage || '').split('\n')[0]}
        </p>
        <p className="mt-2 text-[7px] uppercase tracking-[0.24em]" style={{ color: `${c.secondary}aa` }}>
          quét thẻ để xem bộ phim 3D đầy đủ ✦
        </p>
      </div>
    </div>
  );
}
