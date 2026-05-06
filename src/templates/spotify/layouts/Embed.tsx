import type { LayoutProps } from '@/templates/types';

const SPOTIFY_GREEN = '#1db954';

export function SpotEmbed({ data }: LayoutProps) {
  const hasUrl = !!data.spotifyUrl;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      backgroundColor: '#191414',
      overflow: 'hidden',
    }}>

      {/* Dynamic Island safe zone */}
      <div style={{ flexShrink: 0, height: 52 }} />

      {/* Top ambient glow */}
      <div style={{
        position: 'absolute',
        top: -60,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${SPOTIFY_GREEN}22 0%, transparent 65%)`,
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── MAIN CARD ── */}
      <a
        href={hasUrl ? data.spotifyUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 'calc(100% - 40px)',
          margin: '16px 20px 0',
          padding: '28px 20px 24px',
          borderRadius: 24,
          background: 'linear-gradient(155deg, #1e2b1e 0%, #111811 100%)',
          border: `1px solid ${SPOTIFY_GREEN}22`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.7), 0 0 60px ${SPOTIFY_GREEN}12`,
          textDecoration: 'none',
          cursor: hasUrl ? 'pointer' : 'default',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Glass sheen */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 40%)',
          pointerEvents: 'none',
        }} />

        {/* Spotify logo mark */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: SPOTIFY_GREEN,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 0 8px ${SPOTIFY_GREEN}18, 0 8px 28px ${SPOTIFY_GREEN}40`,
          flexShrink: 0,
        }}>
          {/* Spotify icon — 3 arcs */}
          <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.13-9.965-1.166a.779.779 0 01-.973-.519.78.78 0 01.52-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/>
          </svg>
        </div>

        {/* Label */}
        <p style={{
          margin: '16px 0 4px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: hasUrl ? SPOTIFY_GREEN : 'rgba(255,255,255,0.25)',
        }}>
          {hasUrl ? 'Nghe trên Spotify' : 'Chưa có link Spotify'}
        </p>

        <p style={{
          margin: 0,
          fontSize: 8,
          color: 'rgba(255,255,255,0.32)',
          letterSpacing: '0.04em',
        }}>
          {hasUrl ? 'Nhấn để mở' : 'Thêm link vào phần chỉnh sửa'}
        </p>

        {/* Green pill button */}
        {hasUrl && (
          <div style={{
            marginTop: 20,
            padding: '8px 24px',
            borderRadius: 999,
            backgroundColor: SPOTIFY_GREEN,
            boxShadow: `0 4px 16px ${SPOTIFY_GREEN}50`,
          }}>
            <p style={{
              margin: 0,
              fontSize: 9,
              fontWeight: 700,
              color: '#000',
              letterSpacing: '0.06em',
            }}>
              ▶ PLAY
            </p>
          </div>
        )}
      </a>

      {/* ── DESCRIPTION ── */}
      {data.description && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          margin: '16px 20px 0',
          padding: '12px 16px',
          borderRadius: 16,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Accent line */}
          <div style={{
            height: 1.5,
            width: 28,
            borderRadius: 1,
            backgroundColor: SPOTIFY_GREEN,
            opacity: 0.5,
            marginBottom: 8,
          }} />
          <p style={{
            margin: 0,
            fontSize: 7.5,
            color: 'rgba(255,255,255,0.42)',
            lineHeight: 1.85,
            fontStyle: 'italic',
            textAlign: 'center',
          }}>
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
}
