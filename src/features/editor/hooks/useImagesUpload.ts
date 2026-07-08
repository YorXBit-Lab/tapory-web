import { useRef, useState } from 'react';
import { auth } from '@/libs/firebase';
import { uploadCardImage, deleteCardImage } from '@/utils/r2-upload';

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

/** Multi-photo upload for gallery-style templates (Stardust). */
export function useImagesUpload(orderId: string) {
  const [uploading, setUploading] = useState(false);
  // R2 keys the user removed from the gallery this session — deleted after save
  const removedKeysRef = useRef<string[]>([]);

  /** Upload one file, return its public URL (null on failure). */
  const upload = async (file: File): Promise<string | null> => {
    // Demo mode — local object URL, no upload, no auth
    if (orderId === 'demo') return URL.createObjectURL(file);

    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    setUploading(true);
    try {
      const token = await currentUser.getIdToken();
      const { url } = await uploadCardImage(file, token, orderId);
      return url;
    } catch (err) {
      console.error('[useImagesUpload]', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /** Ghi nhận một URL vừa bị gỡ khỏi gallery (chỉ xoá thật sau khi lưu). */
  const trackRemoved = (url: string) => {
    if (R2_BASE && url.startsWith(`${R2_BASE}/`)) {
      removedKeysRef.current.push(url.slice(R2_BASE.length + 1));
    }
  };

  /** Best-effort: xoá các file đã gỡ khỏi R2 — gọi ngay sau khi save thành công. */
  const cleanupRemoved = async () => {
    const keys = removedKeysRef.current;
    if (!keys.length) return;
    removedKeysRef.current = [];
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      keys.forEach(key => deleteCardImage(key, token)); // best-effort, no await
    } catch { /* ignore — orphan files are harmless */ }
  };

  return { uploading, upload, trackRemoved, cleanupRemoved };
}
