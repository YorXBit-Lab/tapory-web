import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { updateField } from '@/redux/editSlice';
import { uploadImage } from '@/utils/firebase-storage';

export function useImageUpload(orderId: string) {
  const dispatch = useDispatch<AppDispatch>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (file: File) => {
    const local = URL.createObjectURL(file);
    dispatch(updateField({ imageUrl: local }));
    setUploading(true);
    try {
      const url = await uploadImage(file, orderId);
      dispatch(updateField({ imageUrl: url }));
    } catch {}
    finally { setUploading(false); }
  };

  return { uploading, fileRef, handlePhoto };
}
