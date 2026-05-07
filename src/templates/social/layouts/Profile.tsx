import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const PLATFORMS = [
  { key: 'facebookUrl'  as const, icon: '📘' },
  { key: 'instagramUrl' as const, icon: '📸' },
  { key: 'tiktokUrl'    as const, icon: '🎵' },
  { key: 'youtubeUrl'   as const, icon: '▶️' },
];

export function SocProfile({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);

  const socials = PLATFORMS.filter(p => !!data[p.key]);
  const rows    = socials.length > 0 ? socials : PLATFORMS;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ backgroundColor: '#ffffff' }}>

      {/* Banner */}
      <div className="relative h-[72px] w-full flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${c.primary}55, ${c.secondary}38)` }}>
        <div className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.5) 4px, rgba(255,255,255,0.5) 5px)' }} />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4">
        {/* Avatar */}
        <div className="-mt-9 flex-shrink-0 overflow-hidden rounded-full border-[3.5px] border-white shadow-lg"
          style={{ width: 68, height: 68 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-2xl"
                style={{ background: '#f3f4f6' }}>👤</div>}
        </div>

        {/* Name + bio */}
        <p className="mt-2 font-bold" style={{ fontFamily: font, fontSize: titleSize, color: '#111827' }}>
          {data.title || 'Tên của bạn'}
        </p>
        <p className="mt-0.5 text-[8.5px]" style={{ color: c.secondary }}>
          {data.subtitle || 'Bio / Tagline'}
        </p>

        {/* Stats */}
        <div className="my-3 flex gap-5">
          {[['12', 'Bài viết'], ['340', 'Followers'], ['180', 'Following']].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className="text-[11px] font-bold" style={{ color: '#111827' }}>{n}</p>
              <p className="text-[7.5px]" style={{ color: '#9ca3af' }}>{l}</p>
            </div>
          ))}
        </div>

        <div className="mb-3 h-px w-full rounded opacity-[0.07]" style={{ backgroundColor: '#111827' }} />

        {/* Photo grid */}
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-sm"
              style={{ aspectRatio: '1', background: `${c.primary}${i % 2 === 0 ? '18' : '0d'}` }}>
              {i === 0 && data.imageUrl && (
                <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              )}
            </div>
          ))}
        </div>

        {/* Social icons */}
        <div className="mt-3 flex gap-2.5">
          {rows.map(({ key, icon }) => {
            const hasLink = !!data[key];
            return (
              <div key={key} className="flex h-7 w-7 items-center justify-center rounded-full text-[11px]"
                style={{
                  border: `1px solid ${c.secondary}${hasLink ? '44' : '1a'}`,
                  backgroundColor: `${c.secondary}${hasLink ? '10' : '05'}`,
                  opacity: hasLink ? 1 : 0.35,
                }}>
                {icon}
              </div>
            );
          })}
        </div>

        {data.description && (
          <p className="mt-2 text-[8px] leading-[1.7] opacity-50" style={{ color: '#111827' }}>
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
}
