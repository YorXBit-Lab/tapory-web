'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Alert, Button, Form, Input } from 'antd';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

function LoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Email hoặc mật khẩu không đúng';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Góc Chạm" width={160} height={48} style={{ height: 48, width: 'auto', objectFit: 'contain' }} priority />
          </div>
          <p className="mt-1 text-sm text-gray-400">Đăng nhập để quản lý hệ thống</p>
        </div>

        <Form onFinish={handleFinish} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input size="large" placeholder="admin@tapory.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}
          >
            <Input.Password size="large" placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>

          {error && <Alert type="error" message={error} className="mb-4" showIcon />}

          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Đăng nhập
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
