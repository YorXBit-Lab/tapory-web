'use client';
import { useRef } from 'react';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';
import { BG_PRESETS } from '@/configs/constants';

export function BgPicker() {
  const { draft, dispatch } = useEditorContext();
  const imgRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  const handleBgImage = (file: File) => {
    const local = URL.createObjectURL(file);
    dispatch(updateField({ bgImageUrl: local, bgColor: '' }));
  };

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content3">Nền trang</p>

      {draft.bgImageUrl ? (
        <div className="relative mb-3 h-20 w-full overflow-hidden rounded-xl">
          <img src={draft.bgImageUrl} className="h-full w-full object-cover" alt="" />
          <button
            onClick={() => dispatch(updateField({ bgImageUrl: '', bgColor: '' }))}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
          >✕</button>
          <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white">Ảnh nền</span>
        </div>
      ) : (
        <button
          onClick={() => imgRef.current?.click()}
          className="mb-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-border bg-elevated px-3 py-2.5 text-xs text-content3 hover:border-primary/40 transition-colors"
        >
          <span>🖼️</span> Upload ảnh nền
        </button>
      )}
      <input
        ref={imgRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleBgImage(f); e.target.value = ''; }}
      />

      <div className="flex flex-wrap gap-2">
        {BG_PRESETS.map(hex => (
          <button
            key={hex}
            onClick={() => dispatch(updateField({ bgColor: hex, bgImageUrl: '' }))}
            title={hex}
            className={`h-7 w-7 rounded-full border-2 shadow-sm transition-transform hover:scale-110 ${
              draft.bgColor === hex && !draft.bgImageUrl ? 'border-primary scale-110' : 'border-border'
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
        <button
          onClick={() => colorRef.current?.click()}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-border bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 hover:scale-110 transition-transform"
        />
        <input
          ref={colorRef}
          type="color"
          className="hidden"
          value={draft.bgColor || '#ffffff'}
          onChange={e => dispatch(updateField({ bgColor: e.target.value, bgImageUrl: '' }))}
        />
      </div>
    </div>
  );
}
