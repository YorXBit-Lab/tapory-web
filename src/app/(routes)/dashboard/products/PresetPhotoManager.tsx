'use client';

import { useRef, useState } from 'react';
import { App, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { usePresetPhotos, useCreatePresetPhoto, useDeletePresetPhoto } from '@/hooks/presetPhoto';
import { uploadProductImage, deleteProductImage } from '@/utils/r2-upload';
import type { IPresetPhoto } from '@/configs/types';

const { Text } = Typography;

export function PresetPhotoManager({ productId }: { productId: string }) {
  const { user } = useAdminAuth();
  const { notification } = App.useApp();
  const { data: presets = [], isLoading } = usePresetPhotos(productId);
  const { mutateAsync: createPreset } = useCreatePresetPhoto(productId);
  const { mutateAsync: deletePreset } = useDeletePresetPhoto(productId);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const idToken = await user.getIdToken();
      const { url, key } = await uploadProductImage(file, idToken);
      await createPreset({ productId, url, key, sortOrder: (presets as IPresetPhoto[]).length });
    } catch (err) {
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (preset: IPresetPhoto) => {
    try {
      if (user) {
        const idToken = await user.getIdToken();
        deleteProductImage(preset.key, idToken);
      }
      await deletePreset(preset.id);
    } catch {
      notification.error({ message: 'Xóa thất bại' });
    }
  };

  if (isLoading) return <Text type="secondary" className="text-xs">Đang tải...</Text>;

  const list = presets as IPresetPhoto[];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {list.map((preset) => (
          <div key={preset.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            <Image src={preset.url} alt="preset" fill className="object-cover" sizes="80px" unoptimized />
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => handleDelete(preset)}
            >
              <DeleteOutlined style={{ color: '#fff', fontSize: 16 }} />
            </button>
          </div>
        ))}

        {list.length < 20 && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
            ) : (
              <>
                <PlusOutlined style={{ fontSize: 18 }} />
                <span className="mt-1 text-[10px]">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      {list.length === 0 && !uploading && (
        <Text type="secondary" className="mt-1 block text-xs">Chưa có ảnh mẫu nào.</Text>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
