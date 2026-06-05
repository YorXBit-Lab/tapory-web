import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { updateField } from '@/redux/editSlice';
import { auth } from '@/libs/firebase';
import { uploadCardImage, deleteCardImage } from '@/utils/r2-upload';

const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '');

function isR2Url(url: string) {
  return R2_BASE.length > 0 && url.startsWith(R2_BASE);
}

function keyFromR2Url(url: string) {
  return url.slice(R2_BASE.length + 1);
}

export function useImageUpload(orderId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);

  const imageUrl = useSelector((s: RootState) => s.edit.imageUrl ?? '');

  // Key of the most recently uploaded (pending, not yet saved) image this session
  const pendingKeyRef = useRef<string | null>(null);
  // imageUrl saved in memorial before this edit session (captured on first upload)
  const originalSavedUrlRef = useRef<string | null>(null);

  const handlePhoto = async (file: File) => {
    // Demo mode — use a local object URL, no upload, no auth needed
    if (orderId === 'demo') {
      const localUrl = URL.createObjectURL(file);
      dispatch(updateField({ imageUrl: localUrl }));
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return; // not authenticated yet

    // Capture original saved URL on first upload of this session
    if (originalSavedUrlRef.current === null) {
      originalSavedUrlRef.current = imageUrl;
    }

    setUploading(true);
    try {
      const token = await currentUser.getIdToken();

      // Xóa ảnh pending cũ nếu đã upload trước đó nhưng chưa save
      if (pendingKeyRef.current) {
        deleteCardImage(pendingKeyRef.current, token); // best-effort, no await
        pendingKeyRef.current = null;
      }

      const { url, key } = await uploadCardImage(file, token, orderId);
      dispatch(updateField({ imageUrl: url }));
      pendingKeyRef.current = key;
    } catch (err) {
      console.error('[useImageUpload]', err);
    } finally {
      setUploading(false);
    }
  };

  /** Gọi sau khi save thành công — xóa ảnh cũ đã lưu trước đó nếu bị thay thế */
  const onSaved = async (savedImageUrl: string) => {
    try {
      const oldUrl = originalSavedUrlRef.current;
      if (oldUrl && isR2Url(oldUrl) && oldUrl !== savedImageUrl) {
        const token = await auth.currentUser?.getIdToken();
        if (token) deleteCardImage(keyFromR2Url(oldUrl), token); // best-effort
      }
    } catch {}
    originalSavedUrlRef.current = savedImageUrl;
    pendingKeyRef.current = null;
  };

  return { uploading, handlePhoto, onSaved };
}
