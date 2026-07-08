'use client';

import { Button, Input, InputNumber, Select, Switch, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { priceFormatter, priceParser } from '@/utils/format';
import { rid } from '../utils';
import type { OptionRow, OptValueRow } from '../types';

const { Text } = Typography;

interface VariantOptionsEditorProps {
  options: OptionRow[];
  applyOptions: (next: OptionRow[]) => void;
  componentOptions: { value: string; label: string }[];
}

/** Editor for product options (each option's values, price deltas, component deductions). */
export function VariantOptionsEditor({
  options,
  applyOptions,
  componentOptions,
}: VariantOptionsEditorProps) {
  return (
    <>
      <Text type="secondary" className="mb-1 block text-xs font-medium">
        Tùy chọn
      </Text>
      <div className="space-y-2">
        {options.map((o) => (
          <div key={o.id} className="rounded-lg border border-divider p-3">
            <div className="flex items-center gap-2">
              <Input
                size="small"
                placeholder="Tên tùy chọn (VD: Hình dạng)"
                value={o.name}
                className="flex-1"
                onChange={(e) =>
                  applyOptions(options.map((x) => (x.id === o.id ? { ...x, name: e.target.value } : x)))
                }
              />
              <Switch
                size="small"
                checked={o.createsVariant}
                checkedChildren="Biến thể"
                unCheckedChildren="Cá nhân hóa"
                onChange={(c) =>
                  applyOptions(options.map((x) => (x.id === o.id ? { ...x, createsVariant: c } : x)))
                }
              />
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => applyOptions(options.filter((x) => x.id !== o.id))}
              />
            </div>

            <div className="mt-2 space-y-1">
              {o.values.map((val) => {
                const setVal = (patch: Partial<OptValueRow>) =>
                  applyOptions(
                    options.map((x) =>
                      x.id === o.id
                        ? { ...x, values: x.values.map((y) => (y.id === val.id ? { ...y, ...patch } : y)) }
                        : x,
                    ),
                  );
                return (
                  <div key={val.id} className="flex flex-wrap items-center gap-2">
                    <Input
                      size="small"
                      placeholder="Giá trị (VD: Tròn)"
                      value={val.name}
                      style={{ width: 140 }}
                      onChange={(e) => setVal({ name: e.target.value })}
                    />
                    {o.createsVariant && (
                      <>
                        <InputNumber
                          size="small"
                          placeholder="+ giá"
                          style={{ width: 100 }}
                          formatter={priceFormatter}
                          parser={priceParser}
                          value={val.priceDelta}
                          onChange={(n) => setVal({ priceDelta: n ?? undefined })}
                        />
                        <Select
                          size="small"
                          placeholder="Trừ linh kiện"
                          style={{ width: 150 }}
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          value={val.componentId ?? undefined}
                          options={componentOptions}
                          onChange={(cid?: string) =>
                            setVal({ componentId: cid, componentQty: cid ? (val.componentQty ?? 1) : undefined })
                          }
                        />
                        {val.componentId && (
                          <InputNumber
                            size="small"
                            min={1}
                            style={{ width: 56 }}
                            value={val.componentQty ?? 1}
                            onChange={(n) => setVal({ componentQty: n ?? 1 })}
                          />
                        )}
                      </>
                    )}
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        applyOptions(
                          options.map((x) =>
                            x.id === o.id ? { ...x, values: x.values.filter((y) => y.id !== val.id) } : x,
                          ),
                        )
                      }
                    />
                  </div>
                );
              })}
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() =>
                  applyOptions(
                    options.map((x) =>
                      x.id === o.id ? { ...x, values: [...x.values, { id: rid('o'), name: '' }] } : x,
                    ),
                  )
                }
              >
                Thêm giá trị
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() =>
            applyOptions([
              ...options,
              { id: rid('opt'), name: '', createsVariant: true, values: [{ id: rid('o'), name: '' }] },
            ])
          }
        >
          Thêm tùy chọn
        </Button>
      </div>
    </>
  );
}
