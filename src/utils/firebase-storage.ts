import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/libs/firebase';

export const uploadImage = async (file: File, orderId: string): Promise<string> => {
  const path = `memorials/${orderId}/${Date.now()}-${file.name}`;
  const snapshot = await uploadBytes(ref(storage, path), file);
  return getDownloadURL(snapshot.ref);
};
