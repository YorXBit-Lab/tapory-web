'use client';
import { useRef } from 'react';
import type { FieldMeta } from '@/templates/types';
import { GALLERY_MAX } from '../../hooks/useGalleryUpload';
import { MAX_IMAGE_MB } from '@/utils/image-file';

interface Props {
  field: FieldMeta;
  urls: string[];
  uploading: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

const MIN_RECOMMENDED = 10;

export function GalleryField({ field, urls, uploading, onAdd, onRemove, onMove }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const full = urls.length >= GALLERY_MAX;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-content2">{field.label}</label>
        <span className={`text-[11px] ${urls.length < MIN_RECOMMENDED ? 'text-amber-500' : 'text-content3'}`}>
          {urls.length}/{GALLERY_MAX} ảnh
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {urls.map((url, i) => (
          <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-elevated">
            <img src={url} className="h-full w-full object-cover" alt="" />
            {/* index badge */}
            <span className="absolute left-1 top-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              {i + 1}
            </span>
            {/* controls */}
            <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-black/55 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onMove(i, i - 1)}
                  disabled={i === 0}
                  className="flex h-5 w-5 items-center justify-center rounded bg-white/85 text-[11px] text-black disabled:opacity-30"
                  title="Sang trái"
                >‹</button>
                <button
                  type="button"
                  onClick={() => onMove(i, i + 1)}
                  disabled={i === urls.length - 1}
                  className="flex h-5 w-5 items-center justify-center rounded bg-white/85 text-[11px] text-black disabled:opacity-30"
                  title="Sang phải"
                >›</button>
              </div>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[11px] text-white"
                title="Xóa"
              >×</button>
            </div>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-elevated text-content4 transition-colors hover:border-primary/50"
          >
            {uploading ? (
              <span className="text-[10px]">Đang tải…</span>
            ) : (
              <>
                <span className="text-2xl leading-none">＋</span>
                <span className="text-[10px]">Thêm ảnh</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-content3">
        Nên thêm {MIN_RECOMMENDED}–{GALLERY_MAX} ảnh, tối đa {MAX_IMAGE_MB} MB/ảnh. Kéo ‹ › để sắp thứ tự hiển thị.
      </p>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onAdd(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
