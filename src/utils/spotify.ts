/**
 * Spotify URL parsing, validation, and URI conversion utilities.
 *
 * Supported resource types: track, playlist, album.
 * Intentionally excluded: episode, show (not needed for this app).
 */

export type SpotifyResourceType = 'track' | 'playlist' | 'album';

export interface ParsedSpotifyUrl {
  type: SpotifyResourceType;
  id: string;
  /** spotify:track:{id} — used by the IFrame API */
  uri: string;
  /** https://open.spotify.com/embed/track/{id}?... — used for the iframe src */
  embedUrl: string;
}

export interface SpotifyValidationResult {
  valid: true;
  parsed: ParsedSpotifyUrl;
}

export interface SpotifyValidationError {
  valid: false;
  error: string;
}

export type SpotifyValidation = SpotifyValidationResult | SpotifyValidationError;

const SUPPORTED_TYPES = new Set<SpotifyResourceType>(['track', 'playlist', 'album']);

// Spotify resource IDs: alphanumeric, typically 22 chars but not enforced by length.
const ID_RE = /^[A-Za-z0-9]+$/;

/**
 * Parse a Spotify share URL into its components.
 * Returns null for any URL that cannot be recognized as a valid Spotify resource.
 *
 * Handles:
 *   https://open.spotify.com/track/{id}
 *   https://open.spotify.com/track/{id}?si=...
 *   https://open.spotify.com/intl-vi/track/{id}   (locale prefix)
 *   https://spotify.com/...
 */
export function parseSpotifyUrl(url: string): ParsedSpotifyUrl | null {
  if (!url || typeof url !== 'string') return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (!parsed.hostname.includes('spotify.com')) return null;

  // pathname: /track/{id} or /intl-vi/track/{id}
  const segments = parsed.pathname.replace(/^\//, '').split('/').filter(Boolean);
  if (segments.length < 2) return null;

  // Skip optional locale prefix like "intl-vi"
  const offset = segments[0]?.startsWith('intl-') ? 1 : 0;
  const type = segments[offset] as SpotifyResourceType;
  const id = segments[offset + 1];

  if (!type || !id) return null;
  if (!SUPPORTED_TYPES.has(type)) return null;
  if (!ID_RE.test(id)) return null;

  return {
    type,
    id,
    uri: `spotify:${type}:${id}`,
    embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
  };
}

/**
 * Validate a Spotify URL and return a typed result.
 * Provides specific error messages for common mistakes.
 */
export function validateSpotifyUrl(url: string | undefined): SpotifyValidation {
  if (!url?.trim()) {
    return { valid: false, error: 'Vui lòng nhập link Spotify' };
  }

  let href: URL;
  try {
    href = new URL(url.trim());
  } catch {
    return { valid: false, error: 'Link không đúng định dạng URL' };
  }

  if (!href.hostname.includes('spotify.com')) {
    return { valid: false, error: 'Link phải từ open.spotify.com' };
  }

  const result = parseSpotifyUrl(url);
  if (!result) {
    return {
      valid: false,
      error: 'Không nhận ra định dạng. Hỗ trợ: track, playlist, album',
    };
  }

  return { valid: true, parsed: result };
}

/**
 * Convert a Spotify share URL to a spotify: URI for the IFrame API.
 * Returns null if the URL is invalid or unsupported.
 *
 * @example
 * toSpotifyUri('https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh')
 * // → 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh'
 */
export function toSpotifyUri(url: string | undefined): string | null {
  return url ? (parseSpotifyUrl(url)?.uri ?? null) : null;
}

/**
 * Convert a Spotify share URL to an embed iframe URL.
 * Returns null if the URL is invalid.
 */
export function toSpotifyEmbed(url: string | undefined): string | null {
  return url ? (parseSpotifyUrl(url)?.embedUrl ?? null) : null;
}
