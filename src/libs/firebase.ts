import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { env } from './env';

const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(env.firebase);

export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
