import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';

const PLATFORMS = [
  { key: 'facebookUrl'  as const, icon: '📘', label: 'Facebook'  },
  { key: 'instagramUrl' as const, icon: '📸', label: 'Instagram' },
  { key: 'tiktokUrl'    as const, icon: '🎵', label: 'TikTok'    },
  { key: 'youtubeUrl'   as const, icon: '▶️', label: 'YouTube'   },
];

export function SocLinktree({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);

  const socials = PLATFORMS.filter(p => !!data[p.key]);
  const rows    = socials.length > 0 ? socials : PLATFORMS;

  return (
    <div className="relative flex min-h-full w-full flex-col items-center overflow-hidden px-5 pb-6 pt-[48px]"
      style={{ background: `linear-gradient(145deg, ${c.accent} 0%, #ffffff 100%)` }}>

      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full opacity-22"
        style={{ background: `radial-gradient(circle, ${c.primary}, transparent)`, filter: 'blur(22px)' }} />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-36 w-36 rounded-full opacity-15"
        style={{ background: `radial-gradient(circle, ${c.secondary}, transparent)`, filter: 'blur(18px)' }} />

      {/* Avatar */}
      <div className="relative z-10 flex-shrink-0 overflow-hidden rounded-full"
        style={{ width: 82, height: 82, border: '3.5px solid white', boxShadow: '0 4px 24px rgba(0,0,0,0.14)' }}>
        {data.imageUrl
          ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
          : <div className="flex h-full w-full items-center justify-center text-3xl"
              style={{ background: '#e5e7eb' }}>👤</div>}
      </div>

      <p className="relative z-10 mt-3 font-bold" style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
        {data.title || 'Tên của bạn'}
      </p>
      <p className="relative z-10 mt-0.5 text-center text-[10.5px]" style={{ color: c.secondary }}>
        {data.subtitle || 'Bio / Tagline'}
      </p>

      {/* Link buttons */}
      <div className="relative z-10 mt-5 flex w-full flex-col gap-2">
        {rows.map(({ key, icon, label }, i) => {
          const url = data[key] as string | undefined;
          const hasLink = !!url;
          const Tag = hasLink ? 'a' : 'div';
          return (
            <Tag key={key}
              {...(hasLink ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[12px] font-semibold shadow-sm"
              style={{
                backgroundColor: (hasLink && i === 0) ? c.primary : hasLink ? `${c.primary}12` : `${c.primary}07`,
                color: (hasLink && i === 0) ? '#fff' : hasLink ? c.primary : `${c.primary}44`,
                border: `1.5px solid ${c.primary}${hasLink ? '22' : '12'}`,
                cursor: hasLink ? 'pointer' : 'default',
                textDecoration: 'none',
              }}>
              <span>{icon}</span>
              <span>{label}</span>
              {!hasLink && <span className="text-[9px] opacity-50">— chưa có link</span>}
            </Tag>
          );
        })}
      </div>

      {data.description && (
        <p className="relative z-10 mt-4 text-center text-[9.5px] leading-[1.7] opacity-45"
          style={{ color: c.primary }}>{data.description}</p>
      )}
    </div>
  );
}
