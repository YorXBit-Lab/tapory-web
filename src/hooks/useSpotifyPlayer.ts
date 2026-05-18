'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpotifyEmbedController, SpotifyIFrameAPI } from '@/types/spotify-iframe';

declare global {
  interface Window {
    onSpotifyIframeApiReady: ((api: SpotifyIFrameAPI) => void) | undefined;
  }
}

// ─── Singleton API loader ──────────────────────────────────────────────────────

const SCRIPT_ID = 'spotify-iframe-api';
const SCRIPT_SRC = 'https://open.spotify.com/embed/iframe-api/v1';

type ApiPending = { resolve: (api: SpotifyIFrameAPI) => void; reject: (err: Error) => void };

let _apiState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
let _apiInstance: SpotifyIFrameAPI | null = null;
let _apiError: Error | null = null;
const _apiPending: ApiPending[] = [];

function loadSpotifyIFrameApi(): Promise<SpotifyIFrameAPI> {
  if (_apiState === 'ready' && _apiInstance) return Promise.resolve(_apiInstance);
  if (_apiState === 'error' && _apiError) return Promise.reject(_apiError);

  return new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    _apiPending.push({ resolve, reject });
    if (_apiState === 'loading') return;
    _apiState = 'loading';

    const prevHandler = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      _apiInstance = api;
      _apiState = 'ready';
      _apiPending.splice(0).forEach(({ resolve: res }) => res(api));
      prevHandler?.(api);
    };

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

// ─── State machine ─────────────────────────────────────────────────────────────

export type PlaybackStatus =
  | 'idle'
  | 'loading_api'
  | 'loading_ctrl'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'blocked'
  | 'error';

export interface UseSpotifyPlayerReturn {
  holderRef: React.RefObject<HTMLDivElement | null>;
  status: PlaybackStatus;
  isPlaying: boolean;
  isLoading: boolean;
  isReady: boolean;
  isBlocked: boolean;
  error: string | null;
  toggle: () => void;
  play: () => void;
  pause: () => void;
}

const BLOCKED_TIMEOUT_MS = 800;

// Give the Spotify embed a real working size so the holder div is a real element.
// The wrapper div (0×0 with overflow:hidden) clips the visual output without
// triggering iOS resource throttling based on element size.
const IFRAME_WIDTH  = 300;
const IFRAME_HEIGHT = 80;

// Watchdog: if no playback_update arrives while status==='playing', reset to 'paused'
// so the button unsticks (iOS iframe throttle, Spotify 30s preview end, etc.)
const HEARTBEAT_MS = 8_000;

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * @param uri      Spotify URI (spotify:track:xxx) or null to disable.
 * @param autoPlay When true, attempts to resume() as soon as the controller is ready.
 *                 Works when the user arrived via a click/link/NFC tap (browser
 *                 preserves user activation across navigations). If the browser blocks
 *                 it, isBlocked activates so the user can tap once to start.
 */
export function useSpotifyPlayer(uri: string | null, autoPlay = false): UseSpotifyPlayerReturn {
  const holderRef       = useRef<HTMLDivElement>(null);
  const controllerRef   = useRef<SpotifyEmbedController | null>(null);
  const statusRef       = useRef<PlaybackStatus>('idle');
  const mountedRef      = useRef(true);
  const creatingRef     = useRef(false);
  const pendingUriRef   = useRef<string | null>(null);
  const blockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayRef     = useRef(autoPlay);
  autoPlayRef.current   = autoPlay;

  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [error,  setError]  = useState<string | null>(null);

  const setStatusSafe = useCallback((s: PlaybackStatus) => {
    if (!mountedRef.current) return;
    statusRef.current = s;
    setStatus(s);
  }, []);

  const clearBlockedTimer = useCallback(() => {
    if (blockedTimerRef.current !== null) {
      clearTimeout(blockedTimerRef.current);
      blockedTimerRef.current = null;
    }
  }, []);

  const clearHeartbeat = useCallback(() => {
    if (heartbeatRef.current !== null) {
      clearTimeout(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const resetHeartbeat = useCallback(() => {
    if (heartbeatRef.current !== null) clearTimeout(heartbeatRef.current);
    heartbeatRef.current = setTimeout(() => {
      if (statusRef.current === 'playing' && mountedRef.current) {
        setStatusSafe('paused');
      }
    }, HEARTBEAT_MS);
  }, [setStatusSafe]);

  // ── Play / Pause ─────────────────────────────────────────────────────────────
  // Defined before the URI effect so the createController callback can call play().

  const play = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    clearBlockedTimer();
    ctrl.resume();
    blockedTimerRef.current = setTimeout(() => {
      if (statusRef.current !== 'playing' && mountedRef.current) {
        setStatusSafe('blocked');
      }
    }, BLOCKED_TIMEOUT_MS);
  }, [clearBlockedTimer, setStatusSafe]);

  const pause = useCallback(() => {
    clearBlockedTimer();
    clearHeartbeat();
    controllerRef.current?.pause();
  }, [clearBlockedTimer, clearHeartbeat]);

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') pause();
    else play();
  }, [play, pause]);

  // ── Destroy controller only on unmount ─────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (blockedTimerRef.current !== null) clearTimeout(blockedTimerRef.current);
      if (heartbeatRef.current   !== null) clearTimeout(heartbeatRef.current);
      if (controllerRef.current) {
        try { controllerRef.current.destroy(); } catch { /* ignore */ }
        controllerRef.current = null;
      }
    };
  }, []);

  // ── Handle URI changes ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!uri) {
      setStatusSafe('idle');
      setError(null);
      return;
    }

    // Controller exists — swap track, never destroy/recreate
    if (controllerRef.current) {
      try {
        controllerRef.current.loadUri(uri);
        clearHeartbeat();
        setStatusSafe('ready');
      } catch {
        setStatusSafe('error');
        setError('Không thể tải bài hát.');
      }
      return;
    }

    if (creatingRef.current) {
      pendingUriRef.current = uri;
      return;
    }

    creatingRef.current = true;
    setStatusSafe('loading_api');
    setError(null);

    loadSpotifyIFrameApi()
      .then((api) => {
        if (!mountedRef.current) { creatingRef.current = false; return; }
        if (!holderRef.current)  { creatingRef.current = false; return; }

        const uriToLoad = pendingUriRef.current ?? uri;
        pendingUriRef.current = null;
        setStatusSafe('loading_ctrl');

        api.createController(
          holderRef.current,
          { uri: uriToLoad, height: IFRAME_HEIGHT, width: IFRAME_WIDTH },
          (controller) => {
            creatingRef.current = false;

            if (!mountedRef.current) {
              try { controller.destroy(); } catch { /* ignore */ }
              return;
            }

            controllerRef.current = controller;

            controller.addListener('playback_update', (e) => {
              if (!mountedRef.current) return;
              clearBlockedTimer();
              const next: PlaybackStatus = e.data.isPaused
                ? (statusRef.current === 'playing' || statusRef.current === 'blocked' ? 'paused' : 'ready')
                : 'playing';
              setStatusSafe(next);
              if (next === 'playing') resetHeartbeat();
              else clearHeartbeat();
            });

            setStatusSafe('ready');

            if (pendingUriRef.current) {
              try { controller.loadUri(pendingUriRef.current); } catch { /* ignore */ }
              pendingUriRef.current = null;
            }

            // Autoplay — succeeds when user navigated via click/NFC (activation preserved).
            // Fails silently on direct URL open; isBlocked activates so user can tap once.
            if (autoPlayRef.current) play();
          },
        );
      })
      .catch((err: unknown) => {
        creatingRef.current = false;
        if (!mountedRef.current) return;
        setStatusSafe('error');
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      });
  }, [uri, setStatusSafe, clearBlockedTimer, clearHeartbeat, resetHeartbeat, play]);

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading_api' || status === 'loading_ctrl';
  const isReady   = status === 'ready' || status === 'playing' || status === 'paused' || status === 'blocked';
  const isBlocked = status === 'blocked';

  return { holderRef, status, isPlaying, isLoading, isReady, isBlocked, error, toggle, play, pause };
}
