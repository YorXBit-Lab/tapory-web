/**
 * TypeScript types for the Spotify IFrame Embed Controller API.
 * @see https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api
 */

export interface EmbedPlaybackRestrictions {
  canSkipNext: boolean;
  canSkipPrev: boolean;
  canSeek: boolean;
  canRepeatContext: boolean;
  canRepeatTrack: boolean;
  canShuffleContext: boolean;
}

export interface EmbedPlaybackState {
  duration: number;
  isPaused: boolean;
  isBuffering: boolean;
  position: number;
  restrictions: EmbedPlaybackRestrictions;
}

export interface SpotifyEmbedController {
  /** Resume (play) the current track. Must be called from a user gesture on first play. */
  resume(): void;
  /** Pause the current track. */
  pause(): void;
  /** Toggle play/pause. */
  togglePlay(): void;
  /** Seek to a position in seconds. */
  seek(positionSeconds: number): void;
  /** Set volume (0–1). */
  setVolume(volume: number): void;
  /**
   * Load a new Spotify URI without creating a new controller.
   * Useful when the user picks a different track.
   */
  loadUri(uri: string, preferVideo?: boolean, startAt?: number): void;
  /** Destroy the controller and remove the iframe from the DOM. */
  destroy(): void;
  addListener(
    event: 'playback_update',
    callback: (e: { data: EmbedPlaybackState }) => void,
  ): boolean;
  removeListener(
    event: 'playback_update',
    callback: (e: { data: EmbedPlaybackState }) => void,
  ): boolean;
}

export interface EmbedControllerOptions {
  uri: string;
  width?: number | string;
  height?: number | string;
}

export interface SpotifyIFrameAPI {
  createController(
    element: HTMLElement,
    options: EmbedControllerOptions,
    callback: (controller: SpotifyEmbedController) => void,
  ): void;
}
