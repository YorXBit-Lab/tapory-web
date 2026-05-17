'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpotifyEmbedController, SpotifyIFrameAPI } from '@/types/spotify-iframe';

// ─── Window augmentation ───────────────────────────────────────────────────────

declare global {
  interface Window {
    onSpotifyIframeApiReady: ((api: SpotifyIFrameAPI) => void) | undefined;
  }
}

// ─── Singleton API loader ──────────────────────────────────────────────────────
//
// The Spotify IFrame API script is loaded once per page, not once per component.
// All hook instances share the same API object via module-level state.

const SCRIPT_ID = 'spotify-iframe-api';
const SCRIPT_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

type ApiPending = {
  resolve: (api: SpotifyIFrameAPI) => void;
  reject: (err: Error) => void;
};

let _apiState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
let _apiInstance: SpotifyIFrameAPI | null = null;
let _apiError: Error | null = null;
const _apiPending: ApiPending[] = [];

function loadSpotifyIFrameApi(): Promise<SpotifyIFrameAPI> {
  if (_apiState === 'ready' && _apiInstance) return Promise.resolve(_apiInstance);
  if (_apiState === 'error' && _apiError) return Promise.reject(_apiError);

  return new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    _apiPending.push({ resolve, reject });

    if (_apiState === 'loading') return; // already loading, just queue
    _apiState = 'loading';

    // Preserve any existing handler (defensive — other libs may use the same API)
    const prevHandler = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      _apiInstance = api;
      _apiState = 'ready';
      _apiPending.splice(0).forEach(({ resolve: res }) => res(api));
      prevHandler?.(api);
    };

    // Guard against duplicate script tags (e.g. React StrictMode double-invoke)
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      const err = new Error('Không thể tải Spotify IFrame API. Kiểm tra kết nối mạng.');
      _apiState = 'error';
      _apiError = err;
      _apiPending.splice(0).forEach(({ reject: rej }) => rej(err));
    };
    document.head.appendChild(script);
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UseSpotifyEmbedState {
  /** Controller created and ready — play/pause commands will work */
  isReady: boolean;
  /** Currently playing (false when paused or stopped) */
  isPlaying: boolean;
  /** API script or controller initialising, or track buffering */
  isLoading: boolean;
  /** Non-null when the API failed to load or the URI is invalid */
  error: string | null;
}

export interface UseSpotifyEmbedReturn extends UseSpotifyEmbedState {
  /** Attach to a hidden div in your layout — Spotify injects the iframe here */
  holderRef: React.RefObject<HTMLDivElement>;
  /** Resume playback. Must be called synchronously inside a user gesture. */
  play: () => void;
  /** Pause playback. */
  pause: () => void;
  /** Toggle play/pause. Must be called synchronously inside a user gesture on first play. */
  toggle: () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Controls a Spotify embed via the official IFrame API.
 *
 * @param uri    - spotify:track/playlist/album:{id} — pass null to disable.
 * @param autoPlay - When true, calls resume() as soon as the controller is ready.
 *   Works on pages the user navigated to via a click (browser preserves user
 *   activation across same-origin navigations). Silently ignored if the browser
 *   blocks autoplay (e.g. direct URL open) — the Play button remains available.
 */
export function useSpotifyEmbed(uri: string | null, autoPlay = false): UseSpotifyEmbedReturn {
  const holderRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  // Ref mirror of isPlaying so toggle() is always stable with no deps
  const isPlayingRef = useRef(false);

  const [state, setState] = useState<UseSpotifyEmbedState>({
    isReady: false,
    isPlaying: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!uri) {
      setState({ isReady: false, isPlaying: false, isLoading: false, error: null });
      return;
    }

    let cancelled = false;

    const destroyController = () => {
      if (controllerRef.current) {
        try { controllerRef.current.destroy(); } catch { /* ignore */ }
        controllerRef.current = null;
      }
      // Clear the iframe Spotify injected — keeps the DOM clean on URI change
      if (holderRef.current) holderRef.current.innerHTML = '';
      isPlayingRef.current = false;
    };

    destroyController();
    setState({ isReady: false, isPlaying: false, isLoading: true, error: null });

    loadSpotifyIFrameApi()
      .then((api) => {
        if (cancelled || !holderRef.current) return;

        api.createController(
          holderRef.current,
          { uri, height: 1, width: 1 },
          (controller) => {
            // Effect may have been cleaned up while createController was async
            if (cancelled) {
              try { controller.destroy(); } catch { /* ignore */ }
              return;
            }

            controllerRef.current = controller;

            controller.addListener('playback_update', (e) => {
              if (cancelled) return;
              isPlayingRef.current = !e.data.isPaused;
              setState({
                isReady: true,
                isPlaying: !e.data.isPaused,
                isLoading: e.data.isBuffering,
                error: null,
              });
            });

            setState((prev) => ({ ...prev, isReady: true, isLoading: false }));

            // Attempt autoplay — succeeds when the user navigated here via a click
            // (browser preserves user activation across navigations). Silently
            // ignored if the browser blocks it; the Play button remains functional.
            if (autoPlay) {
              controller.resume();
            }
          },
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          isReady: false,
          isPlaying: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Lỗi không xác định',
        });
      });

    return () => {
      cancelled = true;
      destroyController();
      setState({ isReady: false, isPlaying: false, isLoading: false, error: null });
    };
  }, [uri, autoPlay]);

  // Stable callbacks — no deps needed because they read from refs
  const play = useCallback(() => {
    controllerRef.current?.resume();
  }, []);

  const pause = useCallback(() => {
    controllerRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    if (isPlayingRef.current) {
      ctrl.pause();
    } else {
      ctrl.resume();
    }
  }, []);

  return { ...state, holderRef, play, pause, toggle };
}
