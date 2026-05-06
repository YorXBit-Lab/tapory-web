import type { LayoutProps } from '@/templates/types';

function parseSpotifyEmbed(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
}

export function SpotVinyl({ data, c }: LayoutProps) {
  const embedUrl = parseSpotifyEmbed(data.spotifyUrl);

  return (
    <div className="relative flex h-full w-full flex-col items-center overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Deep glow behind vinyl */}
      <div className="pointer-events-none absolute top-[10%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}28 0%, transparent 62%)`, filter: 'blur(52px)' }} />

      {/* Lower ambient */}
      <div className="pointer-events-none absolute bottom-[18%] -left-20 h-56 w-56 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}16 0%, transparent 65%)`, filter: 'blur(40px)' }} />

      {/* Very subtle vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />

      <div className="flex-shrink-0" style={{ height: 52 }} />

      {/* VINYL DISC */}
      <div className="relative z-10 mt-1 flex-shrink-0">
        {/* Outer ambient glow halo */}
        <div className="absolute -inset-8 rounded-full"
          style={{ background: `radial-gradient(circle, ${c.primary}20 0%, transparent 68%)`, filter: 'blur(18px)' }} />

        {/* Record */}
        <div className="relative h-[150px] w-[150px] rounded-full"
          style={{
            background: 'repeating-radial-gradient(circle at center, #282828 0px, #282828 1.5px, #161616 2px, #161616 7.5px)',
            boxShadow: `0 0 0 1px rgba(255,255,255,0.035), 0 20px 70px rgba(0,0,0,0.85), 0 0 50px ${c.primary}1a`,
          }}>

          {/* Groove highlight ring */}
          <div className="pointer-events-none absolute inset-[18px] rounded-full"
            style={{ border: `1px solid rgba(255,255,255,0.03)` }} />
          <div className="pointer-events-none absolute inset-[36px] rounded-full"
            style={{ border: `1px solid rgba(255,255,255,0.025)` }} />

          {/* Center label */}
          <div className="absolute left-1/2 top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: `radial-gradient(circle at 38% 32%, ${c.primary}ff, ${c.primary}bb)`,
              boxShadow: `0 0 16px ${c.primary}60, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}>
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#050505', boxShadow: 'inset 0 0 4px rgba(255,255,255,0.1)' }} />
          </div>

          {/* Reflection sheen */}
          <div className="pointer-events-none absolute left-[18%] top-[12%] h-14 w-7 rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(ellipse, white, transparent)', transform: 'rotate(-22deg)' }} />
        </div>
      </div>

      {/* Track name */}
      <p className="relative z-10 mt-5 px-6 text-center text-[17px] font-bold leading-tight"
        style={{ fontFamily: 'Georgia, serif', color: c.secondary, letterSpacing: '0.01em' }}>
        {data.title || 'Tên bài hát'}
      </p>

      {/* Artist — spaced caps in primary */}
      <p className="relative z-10 mt-1 text-[7.5px] font-semibold tracking-[0.28em] uppercase"
        style={{ color: c.primary, opacity: 0.8 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Gold rule */}
      <div className="relative z-10 mt-3 w-[52%]"
        style={{ height: 1, background: `linear-gradient(to right, transparent, ${c.primary}77, transparent)` }} />

      {/* Spotify compact embed */}
      <div className="relative z-10 mx-4 mt-3.5 w-[calc(100%-32px)] flex-shrink-0 overflow-hidden rounded-xl"
        style={{
          boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.6)`,
        }}>
        {embedUrl ? (
          <iframe
            title="Spotify player"
            src={embedUrl}
            width="100%"
            height={80}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ border: 'none', display: 'block' }}
          />
        ) : (
          <div className="flex h-20 items-center gap-3 px-4"
            style={{
              background: `rgba(255,255,255,0.04)`,
              border: `1px solid rgba(255,255,255,0.06)`,
            }}>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: `${c.primary}20`, border: `1px solid ${c.primary}30` }}>
              <span className="text-[16px]">🎵</span>
            </div>
            <p className="text-[7px] leading-[1.6]" style={{ color: c.secondary, opacity: 0.32 }}>
              Dán link Spotify để phát nhạc
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <p className="relative z-10 mt-3.5 px-7 text-center text-[7.5px] italic leading-[1.85]"
          style={{ color: c.secondary, opacity: 0.35 }}>
          {data.description}
        </p>
      )}
    </div>
  );
}
