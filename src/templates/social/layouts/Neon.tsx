import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const PLATFORMS = [
  { key: 'facebookUrl'  as const, icon: '📘', label: 'FB' },
  { key: 'instagramUrl' as const, icon: '📸', label: 'IG' },
  { key: 'tiktokUrl'    as const, icon: '🎵', label: 'TK' },
  { key: 'youtubeUrl'   as const, icon: '▶️', label: 'YT' },
];

export function SocNeon({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);

  const socials = PLATFORMS.filter(p => !!data[p.key]);
  const rows    = socials.length > 0 ? socials : PLATFORMS;

  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center gap-4 overflow-hidden px-5 pb-6"
      style={{ backgroundColor: '#06060f' }}>

      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)' }} />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }} />

      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="pointer-events-none absolute -inset-4 rounded-full opacity-55"
          style={{ background: `radial-gradient(circle, ${c.primary}88, transparent)`, filter: 'blur(14px)' }} />
        <div className="relative overflow-hidden rounded-full"
          style={{ width: 90, height: 90, border: `2.5px solid ${c.primary}`,
            boxShadow: `0 0 18px ${c.primary}66, 0 0 40px ${c.primary}22` }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: '#0d0d1f' }}>👤</div>}
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-bold" style={{ fontFamily: font, fontSize: titleSize, color: '#ffffff',
          textShadow: `0 0 14px ${c.primary}88` }}>
          {data.title || 'Tên của bạn'}
        </p>
        <p className="mt-0.5 text-[8.5px] opacity-70" style={{ color: c.primary }}>
          {data.subtitle || 'Bio / Tagline'}
        </p>
      </div>

      <div className="h-px w-24"
        style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)`,
          boxShadow: `0 0 6px ${c.primary}88` }} />

      {/* Social icon pills */}
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
                  background: `${c.primary}${hasLink ? '1a' : '0a'}`,
                  border: `1.5px solid ${c.primary}${hasLink ? '55' : '20'}`,
                  boxShadow: hasLink ? `0 0 8px ${c.primary}22` : 'none',
                  opacity: hasLink ? 1 : 0.35,
                }}>
                {icon}
              </div>
              <span className="text-[6.5px] font-bold opacity-60" style={{ color: hasLink ? c.primary : 'rgba(255,255,255,0.3)' }}>{label}</span>
            </Tag>
          );
        })}
      </div>

      {data.description && (
        <p className="text-center text-[8px] leading-[1.75]" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
