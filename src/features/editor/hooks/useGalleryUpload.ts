import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { updateField } from '@/redux/editSlice';
import { auth } from '@/libs/firebase';
import { uploadCardImage, deleteCardImage, r2KeyFromUrl } from '@/utils/r2-upload';

export const GALLERY_MAX = 30;

export function useGalleryUpload(orderId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const galleryUrls = useSelector((s: RootState) => s.edit.galleryUrls ?? []);

  const addPhotos = async (files: File[]) => {
    const room = GALLERY_MAX - galleryUrls.length;
    if (room <= 0) return;
    const slice = files.slice(0, room);

    // Demo mode — local object URLs, no upload
    if (orderId === 'demo') {
      const urls = slice.map((f) => URL.createObjectURL(f));
      dispatch(updateField({ galleryUrls: [...galleryUrls, ...urls] }));
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setUploading(true);
    try {
      const token = await currentUser.getIdToken();
      const uploaded: string[] = [];
      for (const file of slice) {
        const { url } = await uploadCardImage(file, token, orderId);
        uploaded.push(url);
      }
      dispatch(updateField({ galleryUrls: [...galleryUrls, ...uploaded] }));
    } catch (err) {
      console.error('[useGalleryUpload]', err);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (index: number) => {
    const url = galleryUrls[index];
    dispatch(updateField({ galleryUrls: galleryUrls.filter((_, i) => i !== index) }));

    // Best-effort xóa khỏi R2 (không chặn UI)
    if (orderId === 'demo' || !url) return;
    const key = r2KeyFromUrl(url);
    if (!key) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) deleteCardImage(key, token);
    } catch {}
  };

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= galleryUrls.length) return;
    const next = [...galleryUrls];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    dispatch(updateField({ galleryUrls: next }));
  };

  return { uploading, addPhotos, removePhoto, movePhoto, count: galleryUrls.length };
}
