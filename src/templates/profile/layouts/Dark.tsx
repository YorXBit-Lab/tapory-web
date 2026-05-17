import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { SOCIAL_PLATFORMS } from '../SocialIcons';

export function ProfileDark({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  const socials    = SOCIAL_PLATFORMS.filter(p => !!data[p.key]);
  const hasContact = !!(data.email || data.phone);

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>

      {/* Top gradient fade */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 opacity-20"
        style={{ background: `linear-gradient(to bottom, ${c.secondary}55, transparent)` }} />

      {/* ── Full mode: ảnh nền + overlay ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: 250 }}>
          {data.imageUrl
            ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
            : <div className="flex h-full w-full items-center justify-center text-5xl" style={{ background: '#1a1a1a' }}>👤</div>}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, transparent 35%, rgba(13,13,13,0.9) 100%)' }} />
          <div className="absolute bottom-5 left-0 right-0 px-6 text-center">
            <p className="font-bold leading-tight text-white" style={{ fontFamily: font, fontSize: titleSize }}>
              {data.title || 'Họ và tên'}
            </p>
            {data.subtitle && (
              <p className="mt-0.5 text-[8.5px] font-medium" style={{ color: c.secondary }}>{data.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Circle / Card mode ── */}
      {mode !== 'full' && (
        <div className="relative z-10 flex flex-col items-center px-6 pb-4" style={{ paddingTop: 52 }}>
          {mode === 'circle' && (
            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: `2.5px solid ${c.secondary}`,
              boxShadow: `0 0 20px ${c.secondary}44, 0 0 0 5px ${c.secondary}14` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: '#1a1a1a' }}>👤</div>}
            </div>
          )}
          {mode === 'card' && (
            <div style={{ width: 74, height: 94, overflow: 'hidden', flexShrink: 0,
              border: `2px solid ${c.secondary}66` }}>
              {data.imageUrl
                ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
                : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: '#1a1a1a' }}>👤</div>}
            </div>
          )}
          <p className="mt-4 text-center font-bold leading-tight text-white"
            style={{ fontFamily: font, fontSize: titleSize }}>
            {data.title || 'Họ và tên'}
          </p>
          {data.subtitle && (
            <p className="mt-0.5 text-[8.5px] font-medium" style={{ color: c.secondary }}>{data.subtitle}</p>
          )}
        </div>
      )}

      {/* ── Gold separator ── */}
      <div className="relative z-10 mx-6 mt-1 mb-3 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${c.secondary}55)` }} />
        <div className="h-1 w-1 rounded-full" style={{ backgroundColor: c.secondary }} />
        <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${c.secondary}55)` }} />
      </div>

      {/* ── Contact ── */}
      {hasContact && (
        <div className="relative z-10 mx-6 space-y-2">
          {data.email && (
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.secondary }} />
              <p className="truncate text-[8px]" style={{ color: 'rgba(255,255,255,0.48)' }}>{data.email}</p>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.secondary }} />
              <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.48)' }}>{data.phone}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Social ── */}
      {socials.length > 0 && (
        <div className="relative z-10 mx-6 mt-4 flex gap-2.5">
          {socials.map(({ key, bg, Icon }) => (
            <a key={key} href={data[key] as string} target="_blank" rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: bg, textDecoration: 'none' }}>
              <Icon />
            </a>
          ))}
        </div>
      )}

      {/* ── Bio ── */}
      {data.description && (
        <p className="relative z-10 mx-6 mt-3 text-[7.5px] leading-[1.75]"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
