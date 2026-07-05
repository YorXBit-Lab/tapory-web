'use client';

import { useRef, useState } from 'react';
import { Button, Typography, notification } from 'antd';
import { UploadOutlined, CheckCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { uploadPrintPhoto } from '@/utils/r2-upload';
import { bakeCropToBlob } from '@/utils/crop-bake';
import { resolvePrintSize, cmToPx, PRINT_DPI } from '@/configs/print';
import type { IPrintConfig, IPrintPhotoSlot } from '@/configs/types';
import { PrintPhotoEditor, cfgToDims } from './PrintPhotoEditor';
import type { PhotoEditorState } from './PrintPhotoEditorCanvas';
import { Spinner } from '@/components/ui/Spinner';

const { Text } = Typography;

interface PrintItem {
  itemIndex: number;
  productName: string;
  quantity: number;
  printConfig: IPrintConfig;
}

interface Props {
  orderId: string;
  customerName: string;
  printItems: PrintItem[];
  initialPhotos: IPrintPhotoSlot[];
}

function shapeLabel(cfg: IPrintConfig) {
  if (cfg.shape === 'circle') return `Hình tròn • ⌀${cfg.diameter ?? 3} cm`;
  if (cfg.shape === 'square') return `Hình vuông • ${cfg.width ?? 3.35} × ${cfg.width ?? 3.35} cm`;
  return `Chữ nhật • ${cfg.width ?? 3.2} × ${cfg.height ?? 5} cm`;
}

function ShapePlaceholder({ cfg }: { cfg: IPrintConfig }) {
  const { W, H, isCircle } = cfgToDims(cfg);
  const label = cfg.shape === 'circle'
    ? `⌀${cfg.diameter ?? 3}cm`
    : `${cfg.width ?? (cfg.shape === 'square' ? 3.35 : 3.2)}×${cfg.shape === 'square' ? (cfg.width ?? 3.35) : (cfg.height ?? 5)}cm`;

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center border-2 border-dashed border-warning/50 bg-warning/5 text-[10px] font-medium text-warning ${isCircle ? 'rounded-full' : 'rounded-md'}`}
      style={{ width: W, height: H }}
    >
      {label}
    </div>
  );
}

function photoKey(itemIndex: number, slotIndex: number, side: 'a' | 'b') {
  return `${itemIndex}-${slotIndex}-${side}`;
}

function totalSlotsForItem(item: PrintItem) {
  return item.quantity * 2;
}

export default function UploadForm({ orderId, customerName, printItems, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of initialPhotos) {
      const side = p.side ?? 'a';
      init[photoKey(p.itemIndex, p.slotIndex, side)] = p.url;
    }
    return init;
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [rawFiles, setRawFiles] = useState<Record<string, File>>({});
  const [editorStates, setEditorStates] = useState<Record<string, PhotoEditorState | null>>({});
  const [samePhoto, setSamePhoto] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const item of initialPhotos) {
      const keyAB = `${item.itemIndex}-${item.slotIndex}`;
      const urlA = initialPhotos.find(p => p.itemIndex === item.itemIndex && p.slotIndex === item.slotIndex && (p.side ?? 'a') === 'a')?.url;
      const urlB = initialPhotos.find(p => p.itemIndex === item.itemIndex && p.slotIndex === item.slotIndex && p.side === 'b')?.url;
      if (urlA && urlB && urlA === urlB) init[keyAB] = true;
    }
    return init;
  });
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Chọn ảnh: chỉ preview cục bộ (chưa upload). Khách chỉnh crop rồi bấm "Lưu".
  const selectPhoto = (file: File, itemIndex: number, slotIndex: number, sides: ('a' | 'b')[]) => {
    const objectUrl = URL.createObjectURL(file);
    const keys = sides.map(s => photoKey(itemIndex, slotIndex, s));
    setPhotos(prev => ({ ...prev, ...Object.fromEntries(keys.map(k => [k, objectUrl])) }));
    setRawFiles(prev => ({ ...prev, ...Object.fromEntries(keys.map(k => [k, file])) }));
    setEditorStates(prev => ({ ...prev, ...Object.fromEntries(keys.map(k => [k, null])) }));
  };

  // Bake vùng crop hiện tại thành PNG 300 DPI rồi upload — bản in đúng như preview.
  const savePhoto = async (itemIndex: number, slotIndex: number, cfg: IPrintConfig, sides: ('a' | 'b')[]) => {
    const keys = sides.map(s => photoKey(itemIndex, slotIndex, s));
    const file = rawFiles[keys[0]];
    const transform = editorStates[keys[0]];
    if (!file || !transform) return;

    const { W, H } = cfgToDims(cfg);
    const { widthCm, heightCm, isCircle } = resolvePrintSize(cfg);

    setUploading(prev => ({ ...prev, ...Object.fromEntries(keys.map(k => [k, true])) }));
    try {
      const blob = await bakeCropToBlob(file, {
        displayW: W, displayH: H,
        outputW: cmToPx(widthCm, PRINT_DPI),
        outputH: cmToPx(heightCm, PRINT_DPI),
        isCircle, transform,
      });
      const baked = new File([blob], 'print.png', { type: 'image/png' });
      const results = await Promise.all(
        sides.map(s => uploadPrintPhoto(baked, orderId, itemIndex, slotIndex, s)),
      );
      setPhotos(prev => {
        const next = { ...prev };
        sides.forEach((s, i) => { next[photoKey(itemIndex, slotIndex, s)] = results[i].url; });
        return next;
      });
      setRawFiles(prev => {
        const next = { ...prev };
        for (const k of keys) delete next[k];
        return next;
      });
      notification.success({ message: sides.length > 1 ? 'Đã lưu cho cả 2 mặt' : 'Đã lưu ảnh', duration: 2 });
    } catch (err) {
      notification.error({
        message: 'Lưu ảnh thất bại',
        description: err instanceof Error ? err.message : 'Thử lại sau',
      });
    } finally {
      setUploading(prev => ({ ...prev, ...Object.fromEntries(keys.map(k => [k, false])) }));
    }
  };

  const totalSlots = printItems.reduce((s, item) => s + totalSlotsForItem(item), 0);
  const uploadedCount = Object.keys(photos).filter(k => !rawFiles[k]).length;
  const allDone = uploadedCount >= totalSlots;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-content1">Upload ảnh in ấn</h1>
          <p className="text-sm text-content2">
            Đơn <span className="font-mono font-semibold">{orderId}</span> — {customerName}
          </p>
        </div>

        {allDone && (
          <div className="flex items-center gap-2 rounded-xl bg-success/10 p-4 text-success shadow-sm">
            <CheckCircleOutlined className="text-xl" />
            <Text className="text-sm text-success">Tất cả ảnh đã được gửi thành công. Cảm ơn bạn!</Text>
          </div>
        )}

        <div className="space-y-4">
          {printItems.map((item) => (
            <section key={item.itemIndex} className="rounded-xl bg-elevated p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-4">
                <ShapePlaceholder cfg={item.printConfig} />
                <div className="min-w-0">
                  <p className="font-semibold text-content1">{item.productName}</p>
                  <p className="mt-0.5 text-xs text-content2">{shapeLabel(item.printConfig)}</p>
                  <p className="mt-0.5 text-xs text-content3">
                    {item.quantity > 1 ? `${item.quantity} sản phẩm · ` : ''}In 2 mặt — upload Mặt A và Mặt B, hoặc dùng cùng 1 ảnh
                  </p>
                  <div className="mt-1.5 text-xs font-medium text-warning">
                    {uploadedCount}/{totalSlots} ảnh đã upload
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: item.quantity }, (_, slotIndex) => {
                  const sk = `${item.itemIndex}-${slotIndex}`;
                  const same = !!samePhoto[sk];
                  const bothUploading =
                    !!uploading[photoKey(item.itemIndex, slotIndex, 'a')] ||
                    !!uploading[photoKey(item.itemIndex, slotIndex, 'b')];

                  return (
                    <div key={slotIndex}>
                      {item.quantity > 1 && (
                        <Text type="secondary" className="mb-2 block text-xs font-medium">
                          Sản phẩm {slotIndex + 1}
                        </Text>
                      )}

                      <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-content2 select-none">
                        <input
                          type="checkbox"
                          checked={same}
                          onChange={(e) => setSamePhoto(prev => ({ ...prev, [sk]: e.target.checked }))}
                          className="rounded"
                        />
                        2 mặt giống nhau
                      </label>

                      {same ? (
                        <div className="flex justify-center">
                          <UploadSlot
                            label="Mặt A = B"
                            slotKey={`${sk}-same`}
                            url={photos[photoKey(item.itemIndex, slotIndex, 'a')]}
                            isUploading={bothUploading}
                            cfg={item.printConfig}
                            editorState={editorStates[photoKey(item.itemIndex, slotIndex, 'a')] ?? null}
                            onEditorChange={(s) =>
                              setEditorStates(prev => ({
                                ...prev,
                                [photoKey(item.itemIndex, slotIndex, 'a')]: s,
                                [photoKey(item.itemIndex, slotIndex, 'b')]: s,
                              }))
                            }
                            inputRef={(el) => { inputRefs.current[`${sk}-same`] = el; }}
                            onTrigger={() => inputRefs.current[`${sk}-same`]?.click()}
                            onChange={(file) => selectPhoto(file, item.itemIndex, slotIndex, ['a', 'b'])}
                            isDraft={!!rawFiles[photoKey(item.itemIndex, slotIndex, 'a')]}
                            onSave={() => savePhoto(item.itemIndex, slotIndex, item.printConfig, ['a', 'b'])}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {(['a', 'b'] as const).map((side) => {
                            const key = photoKey(item.itemIndex, slotIndex, side);
                            return (
                              <UploadSlot
                                key={side}
                                label={side === 'a' ? 'Mặt A' : 'Mặt B'}
                                slotKey={key}
                                url={photos[key]}
                                isUploading={!!uploading[key]}
                                cfg={item.printConfig}
                                editorState={editorStates[key] ?? null}
                                onEditorChange={(s) => setEditorStates(prev => ({ ...prev, [key]: s }))}
                                inputRef={(el) => { inputRefs.current[key] = el; }}
                                onTrigger={() => inputRefs.current[key]?.click()}
                                onChange={(file) => selectPhoto(file, item.itemIndex, slotIndex, [side])}
                                isDraft={!!rawFiles[key]}
                                onSave={() => savePhoto(item.itemIndex, slotIndex, item.printConfig, [side])}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <p className="text-center text-xs text-content3">
          Ảnh gửi trực tiếp cho bên in ấn · JPEG · PNG · WebP · tối đa 10 MB
        </p>
      </div>
    </div>
  );
}

interface SlotProps {
  label?: string;
  slotKey: string;
  url?: string;
  isUploading: boolean;
  cfg: IPrintConfig;
  editorState: PhotoEditorState | null;
  onEditorChange: (s: PhotoEditorState) => void;
  inputRef: (el: HTMLInputElement | null) => void;
  onTrigger: () => void;
  onChange: (file: File) => void;
  isDraft: boolean;
  onSave: () => void;
}

function UploadSlot({
  label, slotKey, url, isUploading, cfg,
  editorState, onEditorChange,
  inputRef, onTrigger, onChange,
  isDraft, onSave,
}: SlotProps) {
  const { W, H, isCircle } = cfgToDims(cfg);

  const zoom = (factor: number) => {
    if (!editorState) return;
    const newScale = Math.max(0.1, Math.min(20, editorState.scale * factor));
    const cx = W / 2, cy = H / 2;
    const ratio = newScale / editorState.scale;
    onEditorChange({ scale: newScale, x: cx - (cx - editorState.x) * ratio, y: cy - (cy - editorState.y) * ratio });
  };

  const hasImage = !!url && !isUploading;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <Text type="secondary" className="text-xs font-semibold">{label}</Text>}

      {/* tầng 1: canvas hoặc placeholder — luôn W×H */}
      {hasImage ? (
        <PrintPhotoEditor imageUrl={url} cfg={cfg} state={editorState} onChange={onEditorChange} />
      ) : (
        <button
          type="button"
          onClick={onTrigger}
          disabled={isUploading}
          className={`flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border bg-elevated text-content3 transition-colors hover:border-primary hover:text-primary disabled:opacity-50 ${isCircle ? 'rounded-full' : 'rounded-md'}`}
          style={{ width: W, height: H }}
        >
          {isUploading
            ? <Spinner size="sm" />
            : <><UploadOutlined className="text-lg" /><span className="text-[10px]">Chọn ảnh</span></>
          }
        </button>
      )}

      {/* tầng 2: controls row — luôn chiếm h-6, giữ layout cố định */}
      <div className="flex h-6 items-center justify-center gap-2">
        {hasImage && (
          <>
            <button type="button" onClick={() => zoom(1 / 1.15)}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs text-content2 shadow-sm hover:bg-elevated">
              −
            </button>
            <span className="text-[10px] text-content3">Kéo · zoom</span>
            <button type="button" onClick={() => zoom(1.15)}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs text-content2 shadow-sm hover:bg-elevated">
              +
            </button>
          </>
        )}
      </div>

      {/* tầng 3: action buttons */}
      {isDraft ? (
        <div className="flex w-full flex-col gap-1">
          <Button
            size="small"
            type="primary"
            icon={<SaveOutlined />}
            loading={isUploading}
            disabled={!editorState}
            onClick={onSave}
            className="w-full"
          >
            Lưu ảnh in
          </Button>
          <Button size="small" icon={<UploadOutlined />} onClick={onTrigger} disabled={isUploading} className="w-full">
            Đổi ảnh
          </Button>
          <span className="text-center text-[10px] text-warning">Chưa lưu — bấm “Lưu” sau khi căn ảnh</span>
        </div>
      ) : (
        <Button size="small" icon={<UploadOutlined />} loading={isUploading} onClick={onTrigger} className="w-full">
          {hasImage ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
      )}

      <input
        key={slotKey}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
