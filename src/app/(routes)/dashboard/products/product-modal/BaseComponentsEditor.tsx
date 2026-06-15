'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Button, InputNumber, Select, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { IBomLine, IComponent } from '@/configs/types';

const { Text } = Typography;

interface BaseComponentsEditorProps {
  components: IComponent[];
  componentOptions: { value: string; label: string }[];
  baseComponents: IBomLine[];
  setBaseComponents: Dispatch<SetStateAction<IBomLine[]>>;
}

/** Base BOM lines deducted from stock for every unit of the product. */
export function BaseComponentsEditor({
  components,
  componentOptions,
  baseComponents,
  setBaseComponents,
}: BaseComponentsEditorProps) {
  if (components.length === 0) {
    return (
      <Text type="secondary" className="text-xs">
        Chưa có linh kiện nào. Tạo ở trang <b>Kho linh kiện</b> trước để gắn định mức trừ kho.
      </Text>
    );
  }

  return (
    <div className="space-y-1.5">
      {baseComponents.map((line, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Select
            size="small"
            placeholder="Chọn linh kiện"
            className="flex-1"
            showSearch
            optionFilterProp="label"
            value={line.componentId || undefined}
            options={componentOptions}
            onChange={(cid: string) =>
              setBaseComponents((prev) => prev.map((b, i) => (i === idx ? { ...b, componentId: cid } : b)))
            }
          />
          <InputNumber
            size="small"
            min={1}
            style={{ width: 64 }}
            value={line.qty}
            onChange={(n) =>
              setBaseComponents((prev) => prev.map((b, i) => (i === idx ? { ...b, qty: n ?? 1 } : b)))
            }
          />
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => setBaseComponents((prev) => prev.filter((_, i) => i !== idx))}
          />
        </div>
      ))}
      <Button
        type="dashed"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => setBaseComponents((prev) => [...prev, { componentId: '', qty: 1 }])}
      >
        Thêm linh kiện nền
      </Button>
    </div>
  );
}
