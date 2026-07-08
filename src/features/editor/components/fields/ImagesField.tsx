'use client';
import { useRef } from 'react';
import type { FieldMeta } from '@/templates/types';

const MAX_PHOTOS = 12;

interface Props {
  field: FieldMeta;
  value: string[];
  uploading: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

/** Multi-photo picker: thumbnail grid + add tile (Stardust memory film). */
export function ImagesField({ field, value, uploading, onAdd, onRemove }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const canAdd = value.length < MAX_PHOTOS;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-content2">
        {field.label}
        <span className="ml-2 text-xs font-normal text-content4">{value.length}/{MAX_PHOTOS}</span>
      </label>
      <div className="grid grid-cols-3 gap-2">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-elevated">
            <img src={url} className="h-full w-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Xoá ảnh"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white opacity-80 transition-opacity hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-elevated text-content4 transition-colors hover:border-primary/50"
          >
            {uploading
              ? <span className="text-xs">Đang tải…</span>
              : <><span className="text-2xl leading-none">＋</span><span className="text-[10px]">Thêm ảnh</span></>}
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - value.length);
          if (files.length) onAdd(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
