'use client';

import { Button, Divider, Form, InputNumber, Select, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { fmtVnd } from '@/utils/format';
import type { IComponent } from '@/configs/types';
import type { FormItem, OrderFormValues } from './types';

const { Text } = Typography;

export function ItemsTable({
  form,
  components,
  onRequestCreate,
}: {
  form: ReturnType<typeof Form.useForm<OrderFormValues>>[0];
  components: IComponent[];
  onRequestCreate: (itemName: number) => void;
}) {
  const itemValues: FormItem[] = Form.useWatch('items', form) ?? [];

  return (
    <Form.List name="items" rules={[{
      validator: async (_, items) => {
        if (!items || items.length === 0) throw new Error('Cần ít nhất 1 linh kiện');
      },
    }]}>
      {(fields, { add, remove }, { errors }) => (
        <div className="space-y-2">
          {fields.map(({ key, name }) => (
            <div key={key} className="grid grid-cols-12 items-start gap-2 rounded-lg border border-border bg-elevated p-2">
              <Form.Item
                name={[name, 'componentId']}
                className="col-span-5 mb-0"
                rules={[{ required: true, message: 'Chọn linh kiện' }]}
              >
                <Select
                  showSearch
                  size="small"
                  placeholder="Chọn linh kiện"
                  optionFilterProp="label"
                  options={components.map(c => ({ value: c.id, label: `${c.name} (tồn ${c.stock})` }))}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div
                        style={{ padding: '6px 12px', cursor: 'pointer', color: '#1677ff', fontSize: 12 }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onRequestCreate(name)}
                      >
                        <PlusOutlined /> Tạo linh kiện mới
                      </div>
                    </>
                  )}
                />
              </Form.Item>

              <Form.Item
                name={[name, 'quantity']}
                className="col-span-2 mb-0"
                rules={[{ required: true, message: 'SL' }]}
              >
                <InputNumber min={1} size="small" style={{ width: '100%' }} placeholder="SL" />
              </Form.Item>

              <Form.Item
                name={[name, 'unitCost']}
                className="col-span-3 mb-0"
                rules={[{ required: true, message: 'Giá' }]}
              >
                <InputNumber
                  min={0}
                  size="small"
                  style={{ width: '100%' }}
                  placeholder="Giá nhập"
                  formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(v) => Number((v ?? '').replace(/\./g, '')) as 0}
                />
              </Form.Item>

              <div className="col-span-2 flex justify-center pt-1">
                {fields.length > 1 && (
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(name)} />
                )}
              </div>

              {itemValues[name]?.quantity > 0 && itemValues[name]?.unitCost > 0 && (
                <Text type="secondary" className="col-span-12 text-right text-xs">
                  = {fmtVnd(itemValues[name].quantity * itemValues[name].unitCost)}
                </Text>
              )}
            </div>
          ))}

          <Form.ErrorList errors={errors} />

          <Button type="dashed" block size="small" icon={<PlusOutlined />} onClick={() => add({ quantity: 1, unitCost: 0 })}>
            Thêm linh kiện
          </Button>

          {itemValues.length > 0 && (
            <div className="flex justify-end border-t border-border pt-2">
              <Text strong>
                Tổng:{' '}
                {fmtVnd(itemValues.reduce((s, i) => s + (i?.quantity ?? 0) * (i?.unitCost ?? 0), 0))}
              </Text>
            </div>
          )}
        </div>
      )}
    </Form.List>
  );
}
