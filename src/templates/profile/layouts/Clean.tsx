import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { SOCIAL_PLATFORMS } from '../SocialIcons';

export function ProfileClean({ data, c }: LayoutProps) {
  const font      = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode      = data.imageMode || 'circle';

  const socials    = SOCIAL_PLATFORMS.filter(p => !!data[p.key]);
  const hasContact = !!(data.email || data.phone);

  return (
    <div className="relative flex min-h-full w-full flex-col" style={{ backgroundColor: '#ffffff' }}>

      {/* Top accent stripe — absolute so camera island overlays it, not content */}
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: c.secondary }} />

      {/* Camera-safe spacer (Dynamic Island: top 10 → 40 px) */}
      <div className="flex-shrink-0" style={{ height: 54 }} />

      <div className="flex flex-1 flex-col items-center px-6 pb-5">

        {/* ── Avatar ── */}
        {mode === 'circle' && (
          <div style={{ width: 86, height: 86, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: `2.5px solid ${c.secondary}`, boxShadow: `0 0 0 4px ${c.secondary}18` }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: `${c.secondary}10` }}>👤</div>}
          </div>
        )}
        {mode === 'card' && (
          <div style={{ width: 76, height: 96, overflow: 'hidden', flexShrink: 0,
            border: `2px solid ${c.secondary}44`, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover object-top" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-3xl" style={{ background: `${c.secondary}10` }}>👤</div>}
          </div>
        )}
        {mode === 'full' && (
          <div className="-mx-6 flex-shrink-0 overflow-hidden" style={{ width: 'calc(100% + 48px)', height: 108 }}>
            {data.imageUrl
              ? <img src={data.imageUrl} className="h-full w-full object-cover" alt="" style={{ filter: imgFilter }} />
              : <div className="flex h-full w-full items-center justify-center text-4xl" style={{ background: `${c.secondary}10` }}>👤</div>}
          </div>
        )}

        {/* ── Name + role ── */}
        <p className={`${mode === 'full' ? 'mt-4' : 'mt-3'} text-center font-bold leading-tight`}
          style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}>
          {data.title || 'Họ và tên'}
        </p>
        {data.subtitle && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: c.secondary }} />
            <p className="text-[10.5px] font-semibold" style={{ color: c.secondary }}>{data.subtitle}</p>
          </div>
        )}

        {/* ── Contact ── */}
        {hasContact && (
          <>
            <div className="my-3 flex w-full items-center gap-2">
              <div className="h-px flex-1 opacity-[0.08]" style={{ backgroundColor: c.primary }} />
              <p className="text-[8px] font-bold tracking-[0.3em] uppercase" style={{ color: c.primary, opacity: 0.3 }}>Liên hệ</p>
              <div className="h-px flex-1 opacity-[0.08]" style={{ backgroundColor: c.primary }} />
            </div>
            <div className="w-full space-y-2">
              {data.email && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{ backgroundColor: `${c.secondary}14` }}>✉️</div>
                  <p className="truncate text-[10px] opacity-60" style={{ color: c.primary }}>{data.email}</p>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{ backgroundColor: `${c.secondary}14` }}>📞</div>
                  <p className="text-[10px] opacity-60" style={{ color: c.primary }}>{data.phone}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Social ── */}
        {socials.length > 0 && (
          <>
            <div className="my-3 h-px w-full opacity-[0.08]" style={{ backgroundColor: c.primary }} />
            <div className="flex gap-2.5">
              {socials.map(({ key, bg, Icon }) => (
                <a key={key} href={data[key] as string} target="_blank" rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: bg, textDecoration: 'none' }}>
                  <Icon />
                </a>
              ))}
            </div>
          </>
        )}

        {/* ── Bio ── */}
        {data.description && (
          <p className="mt-3 text-center text-[9.5px] leading-[1.75] opacity-40" style={{ color: c.primary }}>
            {data.description}
          </p>
        )}
      </div>

      {/* Bottom accent stripe */}
      <div className="h-[2px] w-full flex-shrink-0" style={{ backgroundColor: `${c.secondary}30` }} />
    </div>
  );
}
