import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const PLATFORMS = [
  { key: 'facebookUrl'  as const, icon: '📘' },
  { key: 'instagramUrl' as const, icon: '📸' },
  { key: 'tiktokUrl'    as const, icon: '🎵' },
  { key: 'youtubeUrl'   as const, icon: '▶️' },
];

export function SocMinimal({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);

  const socials = PLATFORMS.filter(p => !!data[p.key]);
  const rows    = socials.length > 0 ? socials : PLATFORMS;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8 py-8"
      style={{ backgroundColor: '#ffffff' }}>

      <p className="mb-6 text-[7px] font-bold tracking-[0.5em] uppercase" style={{ color: c.secondary }}>PROFILE</p>

      {/* Avatar */}
      <div className="flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: 88, height: 88, border: `1.5px solid ${c.secondary}44` }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
          : <div className="flex h-full w-full items-center justify-center text-3xl"
              style={{ background: '#f9fafb' }}>👤</div>}
      </div>

      <p className="mt-4 text-center font-bold"
        style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên của bạn'}
      </p>
      <p className="mt-1 text-center text-[8.5px]" style={{ color: c.secondary }}>
        {data.subtitle || 'Bio / Tagline'}
      </p>

      <div className="my-5 flex w-full items-center gap-3">
        <div className="h-px flex-1 opacity-10" style={{ backgroundColor: c.primary }} />
        <span className="text-[9px]" style={{ color: c.secondary }}>✦</span>
        <div className="h-px flex-1 opacity-10" style={{ backgroundColor: c.primary }} />
      </div>

      {/* Social icons */}
      <div className="flex gap-4">
        {rows.map(({ key, icon }) => {
          const url = data[key] as string | undefined;
          const hasLink = !!url;
          const Tag = hasLink ? 'a' : 'div';
          return (
            <Tag key={key}
              {...(hasLink ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[12px]"
              style={{
                border: `1px solid ${c.secondary}${hasLink ? '44' : '1a'}`,
                backgroundColor: `${c.secondary}${hasLink ? '10' : '05'}`,
                opacity: hasLink ? 1 : 0.3,
                textDecoration: 'none',
                cursor: hasLink ? 'pointer' : 'default',
              }}>
              {icon}
            </Tag>
          );
        })}
      </div>

      {data.description && (
        <>
          <div className="my-4 h-px w-full opacity-[0.06]" style={{ backgroundColor: c.primary }} />
          <p className="text-center text-[8px] leading-[1.8] opacity-45" style={{ color: c.primary }}>
            {data.description}
          </p>
        </>
      )}
    </div>
  );
}
