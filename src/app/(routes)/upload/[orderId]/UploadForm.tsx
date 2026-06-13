'use client';

import { useRef, useState } from 'react';
import { Button, Typography, notification } from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { uploadPrintPhoto } from '@/utils/r2-upload';
import type { IPrintConfig, IPrintPhotoSlot } from '@/configs/types';

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

const MAX_PREVIEW_H = 96;

function ShapePreview({ cfg }: { cfg: IPrintConfig }) {
  const base = 'bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center text-amber-300 text-xs font-medium';

  if (cfg.shape === 'circle') {
    const d = cfg.diameter ?? 3;
    const px = MAX_PREVIEW_H;
    return <div className={`${base} rounded-full flex-shrink-0`} style={{ width: px, height: px }} >⌀{d}cm</div>;
  }

  const wCm = cfg.width ?? (cfg.shape === 'square' ? 3.35 : 3.2);
  const hCm = cfg.shape === 'square' ? wCm : (cfg.height ?? 5);
  const scale = MAX_PREVIEW_H / hCm;
  const previewW = Math.round(wCm * scale);

  return (
    <div className={`${base} rounded-md flex-shrink-0`} style={{ width: previewW, height: MAX_PREVIEW_H }}>
      {wCm}×{hCm}cm
    </div>
  );
}

// Key for photos map: `${itemIndex}-${slotIndex}-${side}`
// Non-NFC items always use side 'a'
function photoKey(itemIndex: number, slotIndex: number, side: 'a' | 'b') {
  return `${itemIndex}-${slotIndex}-${side}`;
}

function totalSlotsForItem(item: PrintItem) {
  return item.quantity * 2; // luôn 2 mặt: A + B
}

export default function UploadForm({ orderId, customerName, printItems, initialPhotos }: Props) {
  // photos map: key → url
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of initialPhotos) {
      const side = p.side ?? 'a';
      init[photoKey(p.itemIndex, p.slotIndex, side)] = p.url;
    }
    return init;
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  // samePhoto[`${itemIndex}-${slotIndex}`] = true → 2 mặt dùng cùng ảnh
  const [samePhoto, setSamePhoto] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    // Tự detect nếu ảnh A và B giống nhau từ initialPhotos
    for (const item of initialPhotos) {
      const keyAB = `${item.itemIndex}-${item.slotIndex}`;
      const urlA = initialPhotos.find(p => p.itemIndex === item.itemIndex && p.slotIndex === item.slotIndex && (p.side ?? 'a') === 'a')?.url;
      const urlB = initialPhotos.find(p => p.itemIndex === item.itemIndex && p.slotIndex === item.slotIndex && p.side === 'b')?.url;
      if (urlA && urlB && urlA === urlB) init[keyAB] = true;
    }
    return init;
  });
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = async (file: File, itemIndex: number, slotIndex: number, side: 'a' | 'b') => {
    const key = photoKey(itemIndex, slotIndex, side);
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const { url } = await uploadPrintPhoto(file, orderId, itemIndex, slotIndex, side);
      setPhotos(prev => ({ ...prev, [key]: url }));
      notification.success({ message: 'Upload thành công', duration: 2 });
    } catch (err) {
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : 'Thử lại sau',
      });
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Upload cùng 1 file cho cả 2 mặt song song
  const handleUploadBoth = async (file: File, itemIndex: number, slotIndex: number) => {
    const keyA = photoKey(itemIndex, slotIndex, 'a');
    const keyB = photoKey(itemIndex, slotIndex, 'b');
    setUploading(prev => ({ ...prev, [keyA]: true, [keyB]: true }));
    try {
      const [resA, resB] = await Promise.all([
        uploadPrintPhoto(file, orderId, itemIndex, slotIndex, 'a'),
        uploadPrintPhoto(file, orderId, itemIndex, slotIndex, 'b'),
      ]);
      setPhotos(prev => ({ ...prev, [keyA]: resA.url, [keyB]: resB.url }));
      notification.success({ message: 'Upload thành công cho cả 2 mặt', duration: 2 });
    } catch (err) {
      notification.error({
        message: 'Upload thất bại',
        description: err instanceof Error ? err.message : 'Thử lại sau',
      });
    } finally {
      setUploading(prev => ({ ...prev, [keyA]: false, [keyB]: false }));
    }
  };

  const totalSlots = printItems.reduce((s, item) => s + totalSlotsForItem(item), 0);
  const uploadedCount = Object.keys(photos).length;
  const allDone = uploadedCount >= totalSlots;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-xl space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload ảnh in ấn</h1>
        <p className="text-sm text-gray-500">
          Đơn <span className="font-mono font-semibold">{orderId}</span> — {customerName}
        </p>
      </div>

      {allDone && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700 shadow-sm">
          <CheckCircleOutlined className="text-xl" />
          <Text className="text-sm text-green-700">Tất cả ảnh đã được gửi thành công. Cảm ơn bạn!</Text>
        </div>
      )}

      <div className="space-y-4">
        {printItems.map((item) => (
          <section key={item.itemIndex} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-4">
              <ShapePreview cfg={item.printConfig} />
              <div className="min-w-0">
                <p className="font-semibold text-gray-800">{item.productName}</p>
                <p className="mt-0.5 text-xs text-gray-500">{shapeLabel(item.printConfig)}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {item.quantity > 1 ? `${item.quantity} sản phẩm · ` : ''}In 2 mặt — upload ảnh Mặt A và Mặt B, hoặc dùng cùng 1 ảnh
                </p>
                <div className="mt-1.5 text-xs font-medium text-amber-600">
                  {uploadedCount}/{totalSlots} ảnh đã upload
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: item.quantity }, (_, slotIndex) => (
                <div key={slotIndex}>
                  {item.quantity > 1 && (
                    <Text type="secondary" className="mb-2 block text-xs font-medium">
                      Sản phẩm {slotIndex + 1}
                    </Text>
                  )}

                  {(() => {
                    const sk = `${item.itemIndex}-${slotIndex}`;
                    const same = !!samePhoto[sk];
                    const bothUploading = !!uploading[photoKey(item.itemIndex, slotIndex, 'a')] || !!uploading[photoKey(item.itemIndex, slotIndex, 'b')];
                    return (
                      <div>
                        <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-gray-500 select-none">
                          <input
                            type="checkbox"
                            checked={same}
                            onChange={(e) => setSamePhoto(prev => ({ ...prev, [sk]: e.target.checked }))}
                            className="rounded"
                          />
                          2 mặt giống nhau
                        </label>

                        {same ? (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <UploadSlot
                              label="Mặt A = B"
                              slotKey={`${sk}-same`}
                              url={photos[photoKey(item.itemIndex, slotIndex, 'a')]}
                              isUploading={bothUploading}
                              inputRef={(el) => { inputRefs.current[`${sk}-same`] = el; }}
                              onTrigger={() => inputRefs.current[`${sk}-same`]?.click()}
                              onChange={(file) => handleUploadBoth(file, item.itemIndex, slotIndex)}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {(['a', 'b'] as const).map((side) => (
                              <UploadSlot
                                key={side}
                                label={side === 'a' ? 'Mặt A' : 'Mặt B'}
                                slotKey={photoKey(item.itemIndex, slotIndex, side)}
                                url={photos[photoKey(item.itemIndex, slotIndex, side)]}
                                isUploading={!!uploading[photoKey(item.itemIndex, slotIndex, side)]}
                                inputRef={(el) => { inputRefs.current[photoKey(item.itemIndex, slotIndex, side)] = el; }}
                                onTrigger={() => inputRefs.current[photoKey(item.itemIndex, slotIndex, side)]?.click()}
                                onChange={(file) => handleUpload(file, item.itemIndex, slotIndex, side)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
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
  inputRef: (el: HTMLInputElement | null) => void;
  onTrigger: () => void;
  onChange: (file: File) => void;
}

function UploadSlot({ label, slotKey, url, isUploading, inputRef, onTrigger, onChange }: SlotProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <Text type="secondary" className="text-xs font-semibold">{label}</Text>}

      <div
        className="relative flex h-28 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400"
        onClick={onTrigger}
      >
        {url ? (
          <Image src={url} alt={label ?? 'ảnh'} fill className="object-cover" sizes="150px" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <UploadOutlined style={{ fontSize: 22 }} />
            <span className="text-[11px]">Chọn ảnh</span>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
          </div>
        )}
        {url && !isUploading && (
          <div className="absolute bottom-1 right-1 rounded-full bg-green-500 p-0.5 text-white">
            <CheckCircleOutlined style={{ fontSize: 12 }} />
          </div>
        )}
      </div>

      <Button size="small" icon={<UploadOutlined />} loading={isUploading} onClick={onTrigger} className="w-full">
        {url ? 'Đổi ảnh' : 'Chọn ảnh'}
      </Button>

      <input
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
