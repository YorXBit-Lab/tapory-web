import type { LayoutProps } from '@/templates/types';

function parseSpotifyEmbed(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
}

export function SpotPlayer({ data, c }: LayoutProps) {
  const embedUrl = parseSpotifyEmbed(data.spotifyUrl);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: c.accent }}>

      {/* Top atmospheric glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}2e 0%, transparent 65%)`, filter: 'blur(48px)' }} />

      {/* Bottom-right secondary glow */}
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rounded-full"
        style={{ background: `radial-gradient(circle, ${c.primary}18 0%, transparent 60%)`, filter: 'blur(38px)' }} />

      {/* Subtle diagonal texture */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 9px)' }} />

      <div className="flex-shrink-0" style={{ height: 52 }} />

      {/* NOW PLAYING badge */}
      <div className="relative z-10 mx-5 flex items-center gap-2">
        {/* Pulsing dot */}
        <div className="relative h-1.5 w-1.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: c.primary }}>
          <div className="absolute inset-0 animate-ping rounded-full opacity-50"
            style={{ backgroundColor: c.primary }} />
        </div>
        <p className="text-[6px] font-bold tracking-[0.52em] uppercase"
          style={{ color: c.primary }}>
          Now Playing
        </p>
      </div>

      {/* Track name */}
      <p className="relative z-10 mt-2.5 px-5 text-[19px] font-bold leading-tight"
        style={{ color: c.secondary, letterSpacing: '-0.015em' }}>
        {data.title || 'Tên bài hát'}
      </p>

      {/* Artist */}
      <p className="relative z-10 mt-0.5 px-5 text-[9px]"
        style={{ color: c.secondary, opacity: 0.42 }}>
        {data.subtitle || 'Nghệ sĩ'}
      </p>

      {/* Spotify embed */}
      <div className="relative z-10 mx-4 mt-5 flex-shrink-0 overflow-hidden rounded-2xl"
        style={{
          boxShadow: `0 0 0 1px ${c.primary}20, 0 8px 40px rgba(0,0,0,0.65), 0 0 80px ${c.primary}0e`,
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
              background: `linear-gradient(135deg, ${c.primary}12 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${c.primary}18`,
            }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: `${c.primary}1a`, border: `1.5px solid ${c.primary}35` }}>
              <span className="text-[26px]">🎵</span>
            </div>
            <p className="px-8 text-center text-[7.5px] leading-[1.7]"
              style={{ color: c.secondary, opacity: 0.35 }}>
              Dán link Spotify để phát nhạc
            </p>
          </div>
        )}
      </div>

      {/* Description — glassmorphism card */}
      {data.description && (
        <div className="relative z-10 mx-4 mt-3.5 rounded-2xl px-4 py-3"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.07)',
          }}>
          {/* Accent top line */}
          <div className="mb-2 h-px w-8 rounded-full"
            style={{ background: `linear-gradient(to right, ${c.primary}88, transparent)` }} />
          <p className="text-[7.5px] italic leading-[1.85]"
            style={{ color: c.secondary, opacity: 0.45 }}>
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
}
