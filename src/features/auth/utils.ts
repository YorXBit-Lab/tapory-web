import { normalisePhone } from '@/utils/phone';

// Re-export để các import cũ từ '@/features/auth/utils' vẫn hoạt động.
export { normalisePhone, hashPhone } from '@/utils/phone';

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
