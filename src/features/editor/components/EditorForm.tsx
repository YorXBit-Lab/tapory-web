'use client';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';
import { useImageUpload } from '../hooks/useImageUpload';
import { useSaveDraft } from '../hooks/useSaveDraft';
import { StylePicker } from './pickers/StylePicker';
import { FramePicker } from './pickers/FramePicker';
import { ImageField } from './fields/ImageField';
import { TextField } from './fields/TextField';
import { TextareaField } from './fields/TextareaField';

export function EditorForm() {
  const { draft, fields, dispatch } = useEditorContext();
  const { uploading, handlePhoto } = useImageUpload(draft.orderId);
  const { handleSave } = useSaveDraft();
  const isSpotify = draft.templateId === 'spotify';

  return (
    <section className="flex-1 space-y-6">
      {!isSpotify && <StylePicker />}
      {!isSpotify && <FramePicker />}

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-content3">Nội dung</p>
        {fields.map(field => {
          const value = (draft[field.key] as string) || '';
          if (field.type === 'image') return (
            <ImageField key={String(field.key)} field={field} value={value} uploading={uploading} onFile={handlePhoto} />
          );
          if (field.type === 'textarea') return (
            <TextareaField key={String(field.key)} field={field} value={value} onChange={v => dispatch(updateField({ [field.key]: v }))} />
          );
          return (
            <TextField key={String(field.key)} field={field} value={value} onChange={v => dispatch(updateField({ [field.key]: v }))} />
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Lưu & hoàn thành →
      </button>
    </section>
  );
}
