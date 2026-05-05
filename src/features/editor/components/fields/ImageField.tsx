'use client';
import { useRef } from 'react';
import type { FieldMeta } from '@/templates/types';

interface Props {
  field: FieldMeta;
  value: string;
  uploading: boolean;
  onFile: (file: File) => void;
}

export function ImageField({ field, value, uploading, onFile }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-content2">{field.label}</label>
      <div
        onClick={() => ref.current?.click()}
        className="cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border bg-elevated transition-colors hover:border-primary/50"
      >
        {value ? (
          <div className="relative">
            <img src={value} className="h-44 w-full object-cover" alt="" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-sm text-white">Đang tải lên…</span>
              </div>
            )}
            <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white">Đổi ảnh</span>
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-content4">
            <span className="text-3xl">📷</span>
            <span className="text-sm">Nhấn để chọn ảnh</span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
