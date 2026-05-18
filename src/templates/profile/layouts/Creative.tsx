import { getFontFamily, getImageFilter, getTitleFontSize } from '@/shared/utils/styleHelpers';
import type { LayoutProps } from '@/templates/types';
import { SOCIAL_PLATFORMS } from '../SocialIcons';

export function ProfileCreative({ data, c }: LayoutProps) {
  const font = getFontFamily(data.fontStyle);
  const titleSize = getTitleFontSize(data.titleSize);
  const imgFilter = getImageFilter(data.imageFilter);
  const mode = data.imageMode || 'circle';

  const socials = SOCIAL_PLATFORMS.filter((p) => !!data[p.key]);
  const hasContact = !!(data.email || data.phone);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* ── Full mode: ảnh toàn màn hình từ y=0 (camera phủ lên ảnh — chấp nhận được) ── */}
      {mode === 'full' && (
        <div className="relative w-full flex-shrink-0" style={{ height: 130 }}>
          {data.imageUrl ? (
            <img
              src={data.imageUrl}
              className="h-full w-full object-cover"
              alt=""
              style={{ filter: imgFilter }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-4xl"
              style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
            >
              👤
            </div>
          )}
          {/* mờ đáy để chữ dễ đọc */}
          <div
            className="absolute inset-x-0 bottom-0 h-10"
            style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.7), transparent)' }}
          />
        </div>
      )}

      {/* ── Circle / Card mode: camera spacer → banner gradient ── */}
      {mode !== 'full' && (
        <>
          {/* Camera-safe spacer (Dynamic Island y=10–40, content bắt đầu từ y≥48) */}
          <div className="flex-shrink-0 bg-white" style={{ height: 48 }} />
          {/* Gradient banner bắt đầu dưới camera */}
          <div
            className="relative flex-shrink-0"
            style={{
              height: 68,
              background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.8) 5px, rgba(255,255,255,0.8) 6px)',
              }}
            />
          </div>
        </>
      )}

      {/* ── Content area ── */}
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Avatar + header row */}
        {mode !== 'full' ? (
          <div className="-mt-8 flex items-end gap-3">
            {mode === 'circle' && (
              <div
                className="relative z-10 flex-shrink-0 overflow-hidden rounded-full border-[3px] border-white shadow-lg"
                style={{ width: 64, height: 64 }}
              >
                {data.imageUrl ? (
                  <img
                    src={data.imageUrl}
                    className="h-full w-full object-cover object-top"
                    alt=""
                    style={{ filter: imgFilter }}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-2xl"
                    style={{ background: `${c.secondary}18` }}
                  >
                    👤
                  </div>
                )}
              </div>
            )}
            {mode === 'card' && (
              <div
                className="relative z-10 flex-shrink-0 overflow-hidden border-[2.5px] border-white shadow-lg"
                style={{ width: 56, height: 72 }}
              >
                {data.imageUrl ? (
                  <img
                    src={data.imageUrl}
                    className="h-full w-full object-cover object-top"
                    alt=""
                    style={{ filter: imgFilter }}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-2xl"
                    style={{ background: `${c.secondary}18` }}
                  >
                    👤
                  </div>
                )}
              </div>
            )}
            <div className="relative z-10 min-w-0 pb-1">
              <p
                className="leading-tight font-bold break-words"
                style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}
              >
                {data.title || 'Họ và tên'}
              </p>
              {data.subtitle && (
                <p className="mt-0.5 text-[10px] font-semibold" style={{ color: c.secondary }}>
                  {data.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p
              className="leading-tight font-bold break-words"
              style={{ fontFamily: font, fontSize: titleSize, color: c.primary }}
            >
              {data.title || 'Họ và tên'}
            </p>
            {data.subtitle && (
              <p className="mt-0.5 text-[10px] font-semibold" style={{ color: c.secondary }}>
                {data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="my-3 h-px w-full" style={{ backgroundColor: `${c.primary}0d` }} />

        {/* ── Contact ── */}
        {hasContact && (
          <div className="space-y-1.5">
            {data.email && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 flex-shrink-0 text-[12px]">✉️</span>
                <p className="truncate text-[10px]" style={{ color: c.primary, opacity: 0.6 }}>
                  {data.email}
                </p>
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 flex-shrink-0 text-[12px]">📞</span>
                <p className="text-[10px]" style={{ color: c.primary, opacity: 0.6 }}>
                  {data.phone}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Social ── */}
        {socials.length > 0 && (
          <>
            <div className="my-3 h-px w-full" style={{ backgroundColor: `${c.primary}0d` }} />
            <div className="flex gap-2">
              {socials.map(({ key, bg, Icon }) => (
                <a
                  key={key}
                  href={data[key] as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: bg, textDecoration: 'none' }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </>
        )}

        {/* ── Bio ── */}
        {data.description && (
          <>
            <div className="my-3 h-px w-full" style={{ backgroundColor: `${c.primary}0d` }} />
            <p className="text-[10px] leading-[1.75]" style={{ color: c.primary, opacity: 0.45 }}>
              {data.description}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
