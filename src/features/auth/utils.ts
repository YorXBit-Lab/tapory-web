export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 11) return '0' + digits.slice(2);
  return digits;
}

export async function hashPhone(phone: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalisePhone(phone)),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface CardSession {
  phone: string;
  exp: number;
}

export function saveSession(cardId: string, phone: string) {
  const session: CardSession = { phone: normalisePhone(phone), exp: Date.now() + SESSION_TTL_MS };
  sessionStorage.setItem(`tapory:auth:${cardId}`, JSON.stringify(session));
}

export function getSession(cardId: string): CardSession | null {
  try {
    const raw = sessionStorage.getItem(`tapory:auth:${cardId}`);
    if (!raw) return null;
    const session: CardSession = JSON.parse(raw);
    if (Date.now() > session.exp) {
      sessionStorage.removeItem(`tapory:auth:${cardId}`);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(cardId: string) {
  sessionStorage.removeItem(`tapory:auth:${cardId}`);
}
