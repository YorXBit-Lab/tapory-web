'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useSpotifyEmbed } from '@/hooks/useSpotifyEmbed';
import { toSpotifyUri, validateSpotifyUrl } from '@/utils/spotify';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ButtonState {
  isPlaying: boolean;
  isLoading: boolean;
  isReady: boolean;
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
//   - visibility:hidden  → hides all visual Spotify UI; iframe stays fully active
//   - position:fixed     → removed from document flow, no layout shift
//   - pointer-events:none → can't be accidentally clicked
//
// Do NOT use display:none — browsers suspend iframes in display:none containers,
// which breaks playback and postMessage communication.

const HOLDER_STYLE: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  right: 0,
  width: 1,
  height: 1,
  visibility: 'hidden',
  pointerEvents: 'none',
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

  const { holderRef, isReady, isPlaying, isLoading, error, play, pause, toggle } =
    useSpotifyEmbed(uri);

  const displayError = validationError ?? error;
  const isDisabled = !uri || isLoading || !isReady || !!displayError;

  const buttonState: ButtonState = {
    isPlaying,
    isLoading,
    isReady,
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

      {uri && (
        <div ref={holderRef} aria-hidden="true" style={HOLDER_STYLE} />
      )}
    </>
  );
}
