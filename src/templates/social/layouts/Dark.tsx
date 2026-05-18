import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const PLATFORMS = [
  { key: 'facebookUrl'  as const, icon: '📘', label: 'FB' },
  { key: 'instagramUrl' as const, icon: '📸', label: 'IG' },
  { key: 'tiktokUrl'    as const, icon: '🎵', label: 'TK' },
  { key: 'youtubeUrl'   as const, icon: '▶️', label: 'YT' },
];

export function SocDark({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);

  const socials = PLATFORMS.filter(p => !!data[p.key]);
  const rows    = socials.length > 0 ? socials : PLATFORMS;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-5 pb-6"
      style={{ backgroundColor: c.accent }}>

      {/* Avatar with glow */}
      <div className="relative flex-shrink-0">
        <div className="pointer-events-none absolute -inset-6 rounded-full opacity-30"
          style={{ background: `radial-gradient(circle, ${c.primary}, transparent)`, filter: 'blur(20px)' }} />
        <div className="relative overflow-hidden rounded-full shadow-2xl"
          style={{ width: 92, height: 92, border: `2.5px solid ${c.primary}66` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-3xl"
                style={{ background: '#1a1a2e' }}>👤</div>}
        </div>
      </div>

      {/* Identity */}
      <div className="text-center">
        <p className="font-bold" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Tên của bạn'}
        </p>
        <p className="mt-0.5 text-[10.5px] opacity-60" style={{ color: c.secondary }}>
          {data.subtitle || 'Bio / Tagline'}
        </p>
      </div>

      {/* Social icons */}
      <div className="flex gap-3">
        {rows.map(({ key, icon, label }) => {
          const url = data[key] as string | undefined;
          const hasLink = !!url;
          const Tag = hasLink ? 'a' : 'div';
          return (
            <Tag key={key}
              {...(hasLink ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex flex-col items-center gap-0.5"
              style={{ textDecoration: 'none', cursor: hasLink ? 'pointer' : 'default' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-[13px]"
                style={{
                  backgroundColor: `${c.primary}${hasLink ? '1a' : '0a'}`,
                  border: `1.5px solid ${c.primary}${hasLink ? '33' : '18'}`,
                  opacity: hasLink ? 1 : 0.4,
                }}>
                {icon}
              </div>
              <span className="text-[8px] font-medium" style={{ color: c.secondary, opacity: hasLink ? 0.7 : 0.3 }}>{label}</span>
            </Tag>
          );
        })}
      </div>

      <div className="h-px w-20 rounded opacity-[0.12]" style={{ backgroundColor: c.primary }} />

      {data.description && (
        <p className="text-center text-[10px] leading-[1.75] opacity-40" style={{ color: '#ffffff' }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
