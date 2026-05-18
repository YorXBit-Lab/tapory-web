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
// Shared across all hook instances — script is injected once per page.

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
  | 'idle'         // no URI
  | 'loading_api'  // waiting for Spotify script
  | 'loading_ctrl' // controller initialising
  | 'ready'        // paused, ready for first play
  | 'playing'      // audio playing
  | 'paused'       // paused after at least one play
  | 'blocked'      // resume() called but browser blocked autoplay
  | 'error';       // unrecoverable

// ─── Types ─────────────────────────────────────────────────────────────────────

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

// ─── Hook ──────────────────────────────────────────────────────────────────────

/**
 * iOS Safari-safe Spotify playback hook.
 *
 * Key differences from useSpotifyEmbed:
 * - No autoPlay — resume() is only called synchronously inside user gesture handlers
 * - URI changes use loadUri() — controller is never destroyed/recreated mid-session
 * - holderRef iframe holder uses opacity:0, NOT visibility:hidden (hidden kills iOS audio)
 * - Blocked detection: if resume() yields no playing event within 800ms → status:'blocked'
 * - Controller is destroyed only on component unmount
 */
export function useSpotifyPlayer(uri: string | null): UseSpotifyPlayerReturn {
  const holderRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const statusRef = useRef<PlaybackStatus>('idle');
  const mountedRef = useRef(true);
  const creatingRef = useRef(false);
  const pendingUriRef = useRef<string | null>(null);
  const blockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Stable setter — guards against post-unmount updates
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

  // ── Destroy controller only on unmount ─────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (blockedTimerRef.current !== null) clearTimeout(blockedTimerRef.current);
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

    // Controller already exists — swap track with loadUri, never destroy/recreate
    if (controllerRef.current) {
      try {
        controllerRef.current.loadUri(uri);
        setStatusSafe('ready');
      } catch {
        setStatusSafe('error');
        setError('Không thể tải bài hát.');
      }
      return;
    }

    // Creation already in flight — queue the latest URI for when it finishes
    if (creatingRef.current) {
      pendingUriRef.current = uri;
      return;
    }

    // First init
    creatingRef.current = true;
    setStatusSafe('loading_api');
    setError(null);

    loadSpotifyIFrameApi()
      .then((api) => {
        if (!mountedRef.current) { creatingRef.current = false; return; }
        if (!holderRef.current)  { creatingRef.current = false; return; }

        // If URI changed while loading the API, use the latest one
        const uriToLoad = pendingUriRef.current ?? uri;
        pendingUriRef.current = null;
        setStatusSafe('loading_ctrl');

        api.createController(
          holderRef.current,
          { uri: uriToLoad, height: 1, width: 1 },
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
            });

            setStatusSafe('ready');

            // Apply any URI that arrived while createController was running
            if (pendingUriRef.current) {
              try { controller.loadUri(pendingUriRef.current); } catch { /* ignore */ }
              pendingUriRef.current = null;
            }
          },
        );
      })
      .catch((err: unknown) => {
        creatingRef.current = false;
        if (!mountedRef.current) return;
        setStatusSafe('error');
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      });
  }, [uri, setStatusSafe, clearBlockedTimer]);

  // ── Play / Pause — must be called synchronously inside a user gesture ───────
  const play = useCallback(() => {
    const ctrl = controllerRef.current;
    if (!ctrl) return;
    clearBlockedTimer();
    ctrl.resume();
    // iOS Safari blocked detection: if no 'playing' event within 800ms, browser blocked us
    blockedTimerRef.current = setTimeout(() => {
      if (statusRef.current !== 'playing' && mountedRef.current) {
        setStatusSafe('blocked');
      }
    }, BLOCKED_TIMEOUT_MS);
  }, [clearBlockedTimer, setStatusSafe]);

  const pause = useCallback(() => {
    clearBlockedTimer();
    controllerRef.current?.pause();
  }, [clearBlockedTimer]);

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') pause();
    else play();
  }, [play, pause]);

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading_api' || status === 'loading_ctrl';
  const isReady   = status === 'ready' || status === 'playing' || status === 'paused' || status === 'blocked';
  const isBlocked = status === 'blocked';

  return { holderRef, status, isPlaying, isLoading, isReady, isBlocked, error, toggle, play, pause };
}
