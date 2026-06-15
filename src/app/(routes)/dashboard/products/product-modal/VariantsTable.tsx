'use client';

import { Divider, Input, InputNumber, Switch, Tag, Typography } from 'antd';
import { priceFormatter, priceParser } from '@/utils/format';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { PrintConfigEditor } from '@/components/dashboard/PrintConfigEditor';
import type { GenVariant } from '../types';

const { Text } = Typography;

interface VariantsTableProps {
  variants: GenVariant[];
  patchVariant: (id: string, patch: Partial<GenVariant>) => void;
  variantUploadingId: string | null;
  onUploadVariantImage: (variantId: string, file: File) => void;
}

/** Auto-generated variant rows (price / stock / sku / nfc / image / print config). */
export function VariantsTable({
  variants,
  patchVariant,
  variantUploadingId,
  onUploadVariantImage,
}: VariantsTableProps) {
  if (variants.length === 0) return null;

  return (
    <>
      <Divider titlePlacement="start" orientationMargin={0} className="!mt-4 !mb-2 !text-xs !text-content3">
        Biến thể ({variants.length}) — tự sinh từ tùy chọn tạo-biến-thể
      </Divider>

      <div className="mb-1 grid grid-cols-12 gap-2 px-1">
        <Text type="secondary" className="col-span-4 text-[10px]">Giá (đ)</Text>
        <Text type="secondary" className="col-span-3 text-[10px]">Kho</Text>
        <Text type="secondary" className="col-span-3 text-[10px]">SKU</Text>
        <Text type="secondary" className="col-span-2 text-center text-[10px]">NFC</Text>
      </div>

      <div className="space-y-2">
        {variants.map((v) => (
          <div key={v.id} className="rounded-lg border border-divider bg-elevated p-3">
            <div className="mb-2 flex flex-wrap gap-1">
              {v.valueNames.map((n, i) => (
                <Tag key={i} className="text-[10px]">{n || '—'}</Tag>
              ))}
            </div>

            <div className="mb-2">
              <ImageUploader
                value={v.imageUrl}
                uploading={variantUploadingId === v.id}
                onUpload={(file) => onUploadVariantImage(v.id, file)}
                onRemove={() => patchVariant(v.id, { imageUrl: undefined })}
              />
            </div>

            <div className="grid grid-cols-12 items-center gap-2">
              <InputNumber
                className="col-span-4"
                size="small"
                min={0}
                style={{ width: '100%' }}
                formatter={priceFormatter}
                parser={priceParser}
                value={v.price}
                onChange={(n) => patchVariant(v.id, { price: n ?? 0 })}
              />
              <InputNumber
                className="col-span-3"
                size="small"
                min={0}
                style={{ width: '100%' }}
                placeholder="∞"
                value={v.stock}
                onChange={(n) => patchVariant(v.id, { stock: n ?? undefined })}
              />
              <Input
                className="col-span-3"
                size="small"
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => patchVariant(v.id, { sku: e.target.value })}
              />
              <div className="col-span-2 flex items-center justify-center">
                <Switch
                  size="small"
                  checkedChildren="📡"
                  unCheckedChildren="—"
                  checked={!!v.isNfc}
                  onChange={(c) => patchVariant(v.id, { isNfc: c })}
                />
              </div>
            </div>

            <div className="mt-2 border-t border-border pt-2">
              <PrintConfigEditor
                compact
                value={v.printConfig ?? { enabled: false }}
                onChange={(pc) => patchVariant(v.id, { printConfig: pc })}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
