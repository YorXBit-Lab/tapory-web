import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function createAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY env var not set. See DATABASE.md → Auth Flow.');
  return initializeApp({ credential: cert(JSON.parse(key)) });
}

export function getAdminAuth() {
  return getAuth(createAdminApp());
}

export function getAdminDb() {
  return getFirestore(createAdminApp());
}
