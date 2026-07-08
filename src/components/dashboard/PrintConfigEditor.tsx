'use client';

import { InputNumber, Select, Switch, Typography } from 'antd';
import type { IPrintConfig, PrintShape } from '@/configs/types';

const { Text } = Typography;

const SHAPE_OPTIONS = [
  { value: 'rectangle' as PrintShape, label: '▭ Chữ nhật' },
  { value: 'square' as PrintShape, label: '▢ Vuông' },
  { value: 'circle' as PrintShape, label: '○ Tròn' },
];

interface PrintConfigEditorProps {
  value: IPrintConfig;
  onChange: (next: IPrintConfig) => void;
  compact?: boolean;
}

export function PrintConfigEditor({ value, onChange, compact = false }: PrintConfigEditorProps) {
  const set = (patch: Partial<IPrintConfig>) => onChange({ ...value, ...patch });
  const numSize = compact ? 'small' : 'middle';

  return (
    <div>
      <div className="flex items-center gap-2">
        <Switch size="small" checked={value.enabled} onChange={(enabled) => set({ enabled })} />
        <Text type="secondary" className="text-xs">In ảnh</Text>
      </div>

      {value.enabled && (
        <div className={compact ? 'mt-2 grid grid-cols-3 gap-2' : 'mt-3 space-y-3'}>
          <Select
            size={numSize}
            placeholder="Hình dạng"
            value={value.shape}
            style={{ width: '100%' }}
            onChange={(shape: PrintShape) =>
              set({ shape, width: undefined, height: undefined, diameter: undefined })
            }
            options={SHAPE_OPTIONS}
          />

          {value.shape === 'rectangle' && (
            <>
              <InputNumber
                size={numSize}
                min={0.1}
                step={0.1}
                placeholder="Rộng cm"
                style={{ width: '100%' }}
                addonAfter={compact ? undefined : 'cm'}
                value={value.width}
                onChange={(width) => set({ width: width ?? undefined })}
              />
              <InputNumber
                size={numSize}
                min={0.1}
                step={0.1}
                placeholder="Cao cm"
                style={{ width: '100%' }}
                addonAfter={compact ? undefined : 'cm'}
                value={value.height}
                onChange={(height) => set({ height: height ?? undefined })}
              />
            </>
          )}
          {value.shape === 'square' && (
            <InputNumber
              size={numSize}
              min={0.1}
              step={0.1}
              placeholder="Cạnh cm"
              className={compact ? 'col-span-2' : ''}
              style={{ width: '100%' }}
              addonAfter={compact ? undefined : 'cm'}
              value={value.width}
              onChange={(width) => set({ width: width ?? undefined })}
            />
          )}
          {value.shape === 'circle' && (
            <InputNumber
              size={numSize}
              min={0.1}
              step={0.1}
              placeholder="Đường kính cm"
              className={compact ? 'col-span-2' : ''}
              style={{ width: '100%' }}
              addonAfter={compact ? undefined : 'cm'}
              value={value.diameter}
              onChange={(diameter) => set({ diameter: diameter ?? undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}
