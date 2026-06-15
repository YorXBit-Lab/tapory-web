'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export function OrderImageUploader({
  imageUrls,
  uploading,
  onAdd,
  onRemove,
}: {
  imageUrls: string[];
  uploading: boolean;
  onAdd: (file: File) => void;
  onRemove: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap gap-2">
      {imageUrls.map((url, i) => (
        <div key={url + i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border">
          <Image src={url} alt={`Ảnh ${i + 1}`} fill className="object-cover" sizes="80px" unoptimized />
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onRemove(i)}
          >
            <DeleteOutlined style={{ color: '#fff', fontSize: 16 }} />
          </button>
        </div>
      ))}

      <button
        type="button"
        className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-elevated text-content3 transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        ) : (
          <>
            <PlusOutlined className="text-lg" />
            <span className="mt-1 text-[10px]">Thêm ảnh</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAdd(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
