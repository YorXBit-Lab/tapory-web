'use client';

import { useState } from 'react';
import { Button, InputNumber, Modal, Typography, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const { Text } = Typography;

export function AddChipModal({ orderId, onAdded }: { orderId: string; onAdded: () => void }) {
  const { user } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/add-chip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, count }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Thất bại');
      notification.success({ message: `Đã thêm ${count} chip mới` });
      setOpen(false);
      onAdded();
    } catch (e) {
      notification.error({ message: e instanceof Error ? e.message : 'Lỗi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        Thêm chip
      </Button>
      <Modal
        title="Thêm chip NFC"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleAdd}
        okText="Thêm"
        confirmLoading={loading}
        width={320}
      >
        <div className="py-3">
          <Text className="mb-3 block text-sm">Số lượng chip muốn thêm:</Text>
          <InputNumber
            min={1}
            max={10}
            value={count}
            onChange={(v) => setCount(v ?? 1)}
            style={{ width: '100%' }}
          />
        </div>
      </Modal>
    </>
  );
}
