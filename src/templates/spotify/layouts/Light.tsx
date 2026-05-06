import type { LayoutProps } from '@/templates/types';

function parseSpotifyEmbed(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
}

export function SpotLight({ data, c }: LayoutProps) {
  const embedUrl = parseSpotifyEmbed(data.spotifyUrl);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Soft green radial wash — top */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}14 0%, transparent 65%)`, filter: 'blur(44px)' }} />

      {/* Bottom-left complementary wash */}
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}0b 0%, transparent 65%)`, filter: 'blur(36px)' }} />

      <div className="flex-shrink-0" style={{ height: 52 }} />

      {/* Album art disc */}
      <div className="relative z-10 mx-auto flex-shrink-0">
        <div className="absolute -inset-4 rounded-[28px]"
          style={{ background: `radial-gradient(circle, ${c.primary}16 0%, transparent 70%)`, filter: 'blur(14px)' }} />
        <div className="relative flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-[22px]"
          style={{
            background: `linear-gradient(140deg, ${c.primary}e0 0%, ${c.primary}88 55%, ${c.secondary}22 100%)`,
            boxShadow: `0 12px 40px ${c.primary}30, 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}>
          {/* Inner light spot */}
          <div className="pointer-events-none absolute left-[10%] top-[8%] h-10 w-10 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <span className="relative z-10 text-[34px]" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' }}>🎵</span>
        </div>
      </div>

      {/* Track name — Georgia serif, large */}
      <p className="relative z-10 mt-4 px-6 text-center text-[20px] font-bold leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.secondary, letterSpacing: '-0.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>

      {/* Artist — primary color, small caps */}
      <p className="relative z-10 mt-1 text-center text-[8.5px] font-semibold tracking-[0.18em] uppercase"
        style={{ color: c.primary }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Hairline separator */}
      <div className="relative z-10 mx-auto mt-4 rounded-full"
        style={{ width: 36, height: 1.5, backgroundColor: c.primary, opacity: 0.32 }} />

      {/* Spotify embed — full player */}
      <div className="relative z-10 mx-4 mt-4 flex-shrink-0 overflow-hidden rounded-2xl"
        style={{
          boxShadow: '0 2px 20px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}>
        {embedUrl ? (
          <iframe
            title="Spotify player"
            src={embedUrl}
            width="100%"
            height={152}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ border: 'none', display: 'block' }}
          />
        ) : (
          <div className="flex h-[152px] flex-col items-center justify-center gap-3"
            style={{
              background: `linear-gradient(145deg, ${c.primary}0d, ${c.primary}06)`,
              border: `1.5px dashed ${c.primary}28`,
            }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: `${c.primary}14` }}>
              <span className="text-[22px]">🎵</span>
            </div>
            <p className="px-8 text-center text-[7.5px] leading-[1.7]"
              style={{ color: c.secondary, opacity: 0.38 }}>
              Dán link Spotify để nghe nhạc
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="relative z-10 mt-4 px-7 text-center text-[7.5px] leading-[1.88]"
          style={{ color: c.secondary, opacity: 0.42 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
