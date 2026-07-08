'use client';
import { Tabs } from 'antd';
import { useEditorContext } from '@/features/editor/context';
import { updateField } from '@/redux/editSlice';
import { useImageUpload } from '../hooks/useImageUpload';
import { useImagesUpload } from '../hooks/useImagesUpload';
import { useGalleryUpload } from '../hooks/useGalleryUpload';
import { useSaveDraft } from '../hooks/useSaveDraft';
import { StylePicker } from './pickers/StylePicker';
import { FontPicker } from './pickers/FontPicker';
import { ImageModePicker } from './pickers/ImageModePicker';
import { ImageFilterPicker } from './pickers/ImageFilterPicker';
import { FramePicker } from './pickers/FramePicker';
import { EffectPicker } from './pickers/EffectPicker';
import { IntroPicker } from './pickers/IntroPicker';
import { TemplatePicker } from './pickers/TemplatePicker';
import { SmartSuggestBanner } from './SmartSuggestBanner';
import { ImageField } from './fields/ImageField';
import { ImagesField } from './fields/ImagesField';
import { GalleryField } from './fields/GalleryField';
import { TextField } from './fields/TextField';
import { TextareaField } from './fields/TextareaField';

export function EditorForm() {
  const { orderId, draft, fields, dispatch } = useEditorContext();
  const { uploading, handlePhoto, onSaved } = useImageUpload(orderId);
  const { uploading: uploadingMany, upload: uploadOne, trackRemoved, cleanupRemoved } = useImagesUpload(orderId);
  const gallery = useGalleryUpload(orderId);
  const { handleSave } = useSaveDraft(orderId, {
    onSaved: url => { onSaved(url); void cleanupRemoved(); },
  });
  const isSpotify   = draft.templateId === 'spotify';
  const isRedirect  = draft.templateId === 'redirect';
  // const isStardust  = draft.templateId === 'stardust';
  const isStardust  = true; 

  return (
    <section className="flex-1 space-y-5">
      <TemplatePicker />
      {/* AI Smart Suggest — analyses imageUrl, shows top 3 style recommendations */}
      {draft.imageUrl && !isRedirect && !isSpotify && (
        <SmartSuggestBanner imageUrl={draft.imageUrl} />
      )}
      <StylePicker />

      {/* Stardust: phim dựng ở site ngoài — các picker chữ/ảnh/trang trí không áp dụng */}
      {isStardust && (
        <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/60 px-4 py-3 text-[11px] leading-relaxed text-purple-700">
          🌌 Phim Ký Ức 3D — nội dung và ảnh bên dưới sẽ được dựng thành một bộ phim vũ trụ
          tương tác. Quét thẻ (hoặc mở trang xem) để trải nghiệm đầy đủ.
        </div>
      )}
      {!isStardust && <Tabs
        size="small"
        items={
          isRedirect
            ? [
                {
                  key: 'info',
                  label: 'Chuyển hướng',
                  children: (
                    <div className="pt-1">
                      <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-3 text-[11px] leading-relaxed text-indigo-700">
                        Khi ai đó mở link này, họ sẽ được chuyển ngay đến URL bên dưới — không cần bấm gì thêm.
                      </div>
                    </div>
                  ),
                },
              ]
            : isSpotify
              ? [
                  {
                    key: 'deco',
                    label: 'Trang trí',
                    children: (
                      <div className="space-y-5 pt-1">
                        <IntroPicker />
                        <FramePicker />
                        <EffectPicker />
                      </div>
                    ),
                  },
                ]
              : [
                  {
                    key: 'text',
                    label: 'Chữ',
                    children: (
                      <div className="pt-1">
                        <FontPicker />
                      </div>
                    ),
                  },
                  {
                    key: 'image',
                    label: 'Ảnh',
                    children: (
                      <div className="space-y-5 pt-1">
                        <ImageModePicker />
                        <ImageFilterPicker />
                      </div>
                    ),
                  },
                  {
                    key: 'deco',
                    label: 'Trang trí',
                    children: (
                      <div className="space-y-5 pt-1">
                        <IntroPicker />
                        <FramePicker />
                        <EffectPicker />
                      </div>
                    ),
                  },
                ]
        }
      />}

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-content3">Nội dung</p>
        {fields.map(field => {
          if (field.type === 'images') {
            const urls = (draft[field.key] as unknown as string[] | undefined) ?? [];
            return (
              <ImagesField
                key={String(field.key)}
                field={field}
                value={urls}
                uploading={uploadingMany}
                onAdd={async files => {
                  const next = [...urls];
                  for (const file of files) {
                    const url = await uploadOne(file);
                    if (url) { next.push(url); dispatch(updateField({ [field.key]: [...next] })); }
                  }
                }}
                onRemove={i => {
                  trackRemoved(urls[i]);
                  dispatch(updateField({ [field.key]: urls.filter((_, j) => j !== i) }));
                }}
              />
            );
          }
          if (field.type === 'gallery') return (
            <GalleryField
              key={String(field.key)}
              field={field}
              urls={draft.galleryUrls ?? []}
              uploading={gallery.uploading}
              onAdd={gallery.addPhotos}
              onRemove={gallery.removePhoto}
              onMove={gallery.movePhoto}
            />
          );
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

      {/* Sticky on mobile, normal on desktop */}
      <div className="sticky bottom-0 z-10 -mx-4 bg-white/95 px-4 pb-8 pt-3 backdrop-blur-sm lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom, 32px))' }}>
        {orderId === 'demo' ? (
          <div className="w-full rounded-xl border border-dashed border-content4 py-3.5 text-center text-sm text-content3">
            Đây là bản xem thử — không thể lưu
          </div>
        ) : (
          <button
            onClick={handleSave}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 lg:shadow-none"
          >
            Lưu & hoàn thành →
          </button>
        )}
      </div>
    </section>
  );
}
