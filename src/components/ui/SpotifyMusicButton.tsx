'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useSpotifyPlayer } from '@/hooks/useSpotifyPlayer';
import { toSpotifyUri, validateSpotifyUrl } from '@/utils/spotify';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ButtonState {
  isPlaying: boolean;
  isLoading: boolean;
  isReady: boolean;
  isBlocked: boolean;
  error: string | null;
  toggle: () => void;
  play: () => void;
  pause: () => void;
}

interface SpotifyMusicButtonProps {
  spotifyUrl?: string;
  /**
   * Render prop for fully custom button UI.
   * If provided, the default button is not rendered.
   */
  children?: (state: ButtonState) => ReactNode;
  /** Applied to the default button element. */
  className?: string;
  style?: CSSProperties;
  playLabel?: ReactNode;
  pauseLabel?: ReactNode;
  loadingLabel?: ReactNode;
}

// ─── Holder style ──────────────────────────────────────────────────────────────
//
// Rules:
//   - clip-path:inset(100%) → clips all rendering; iOS Safari keeps iframe active
//   - position:fixed         → removed from document flow, no layout shift
//   - pointer-events:none    → can't be accidentally clicked
//
// Do NOT use opacity:0 — cross-origin iframes render in a separate GPU layer on
// iOS Safari and do not inherit parent opacity, so the Spotify player stays visible.
// Do NOT use visibility:hidden or display:none — those suspend JS/audio in the iframe.

const WRAPPER_STYLE: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: 0,
  height: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
};

const HOLDER_STYLE: CSSProperties = {
  width: 300,
  height: 80,
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * Drop-in Spotify play/pause button.
 * Manages the hidden IFrame API holder internally.
 *
 * Simple usage:
 *   <SpotifyMusicButton spotifyUrl={data.spotifyUrl} />
 *
 * Custom UI via render prop:
 *   <SpotifyMusicButton spotifyUrl={data.spotifyUrl}>
 *     {({ isPlaying, isLoading, isReady, toggle }) => (
 *       <button onClick={toggle} disabled={!isReady || isLoading}>
 *         {isPlaying ? '⏸' : '▶'}
 *       </button>
 *     )}
 *   </SpotifyMusicButton>
 */
export function SpotifyMusicButton({
  spotifyUrl,
  children,
  className,
  style,
  playLabel = '▶ Phát nhạc',
  pauseLabel = '⏸ Dừng lại',
  loadingLabel = '⏳ Đang kết nối...',
}: SpotifyMusicButtonProps) {
  const validation = spotifyUrl ? validateSpotifyUrl(spotifyUrl) : null;
  const uri = validation?.valid ? toSpotifyUri(spotifyUrl) : null;
  const validationError = validation && !validation.valid ? validation.error : null;

  const { holderRef, isReady, isPlaying, isLoading, isBlocked, error, play, pause, toggle } =
    useSpotifyPlayer(uri);

  const displayError = validationError ?? error;
  const isDisabled = !uri || isLoading || !isReady || !!displayError;

  const buttonState: ButtonState = {
    isPlaying,
    isLoading,
    isReady,
    isBlocked,
    error: displayError,
    toggle,
    play,
    pause,
  };

  return (
    <>
      {children ? (
        children(buttonState)
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={isDisabled}
          className={className}
          style={style}
          aria-label={isPlaying ? 'Dừng nhạc' : 'Phát nhạc'}
          aria-pressed={isPlaying}
        >
          {isLoading ? loadingLabel : isPlaying ? pauseLabel : playLabel}
        </button>
      )}

      <div aria-hidden="true" style={WRAPPER_STYLE}>
        <div ref={holderRef} style={HOLDER_STYLE} />
      </div>
    </>
  );
}
