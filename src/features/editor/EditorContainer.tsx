'use client';
import '@/templates/init';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { Alert, Button, Form, Input, Modal } from 'antd';
import { auth } from '@/libs/firebase';
import type { TemplateId } from '@/configs/types';
import { TEMPLATES } from '@/configs/constants';
import type { RootState } from '@/redux/store';
import { EditorProvider } from './context';
import { useEditorInit } from './hooks/useEditorInit';
import { EditorForm } from './components/EditorForm';
import { PhonePreview } from '@/features/preview/PhonePreview';

interface Props {
  orderId: string;
  initialTemplate: TemplateId;
}

/* ── Change password modal ── */
function ChangePasswordModal({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = async ({ currentPhone, newPhone }: { currentPhone: string; newPhone: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, currentPhone, newPhone }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) { setError(data.message ?? 'Đổi mật khẩu thất bại'); return; }
      setSuccess(true);
      form.resetFields();
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setOpen(false); setError(null); setSuccess(false); form.resetFields(); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-content3 underline-offset-2 hover:underline transition-colors"
      >
        Đổi mật khẩu
      </button>
      <Modal title="Đổi mật khẩu" open={open} onCancel={handleClose} footer={null} width={380} destroyOnHidden>
        {success ? (
          <div className="py-4 text-center">
            <p className="mb-4 text-sm text-green-600">Đổi mật khẩu thành công!</p>
            <Button type="primary" onClick={handleClose}>Đóng</Button>
          </div>
        ) : (
          <Form form={form} layout="vertical" onFinish={handleFinish} className="pt-2">
            <Form.Item
              label="Mật khẩu hiện tại (SĐT cũ)"
              name="currentPhone"
              rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}
            >
              <Input placeholder="0912345678" inputMode="tel" />
            </Form.Item>
            <Form.Item
              label="Mật khẩu mới (SĐT mới)"
              name="newPhone"
              rules={[{ required: true, message: 'Nhập mật khẩu mới' }]}
            >
              <Input placeholder="0987654321" inputMode="tel" />
            </Form.Item>
            {error && <Alert type="error" message={error} className="mb-3" showIcon />}
            <div className="flex justify-end gap-2">
              <Button onClick={handleClose}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Xác nhận</Button>
            </div>
          </Form>
        )}
      </Modal>
    </>
  );
}

function EditorInner({ orderId, initialTemplate }: Props) {
  useEditorInit(orderId, initialTemplate);
  const templateId = useSelector((s: RootState) => s.edit.templateId);
  const tpl = TEMPLATES[templateId] ?? TEMPLATES[initialTemplate];

  // Only card owners (not admins) see the change-password option
  const isCardOwner = auth.currentUser?.uid.startsWith('card_') ?? false;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 lg:py-8">
      <div className="mb-4 flex items-center gap-2 text-sm lg:mb-6">
        <Link href="/templates" className="text-content3 transition-colors hover:text-primary">← Đổi loại</Link>
        <span className="text-content4">/</span>
        <span className="font-medium text-content1">{tpl?.icon} {tpl?.name}</span>
        <span className="text-xs text-content4">#{orderId}</span>
        {isCardOwner && (
          <span className="ml-auto">
            <ChangePasswordModal cardId={orderId} />
          </span>
        )}
      </div>

      {/* Mobile: preview first (top), form below. Desktop: form left, preview sticky right */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        <div className="order-last min-w-0 flex-1 lg:order-none">
          <EditorForm />
        </div>
        <div className="order-first lg:order-none">
          <PhonePreview />
        </div>
      </div>
    </main>
  );
}

export function EditorContainer({ orderId, initialTemplate }: Props) {
  return (
    <EditorProvider>
      <EditorInner orderId={orderId} initialTemplate={initialTemplate} />
    </EditorProvider>
  );
}
