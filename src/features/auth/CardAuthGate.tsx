'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { Alert, Button, Form, Input, Modal } from 'antd';
import { auth } from '@/libs/firebase';
import { MemorialAPI } from '@/services/MemorialAPI';
import { CardAuthCtx } from './CardAuthContext';
import { getSession, saveSession } from './utils';

type Mode =
  | 'checking' // determining if memorial exists
  | 'gate' // existing memorial → require phone before showing editor
  | 'free' // new memorial → show editor, require phone only on save
  | 'verified'; // phone confirmed, editor fully accessible

interface Props {
  cardId: string;
  children: React.ReactNode;
}

export function CardAuthGate({ cardId, children }: Props) {
  const [mode, setMode] = useState<Mode>('checking');
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pendingCb = useRef<(() => void) | null>(null);

  // Check existing session + memorial existence.
  // Wait for Firebase Auth to finish restoring its session (async) before deciding.
  useEffect(() => {
    // Demo mode — no auth whatsoever, editor is read-only (no save button shown)
    if (cardId === 'demo') {
      setMode('verified');
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      unsub(); // only need the first emission

      // Already signed in → skip gate
      if (user) {
        // Admin users sign in with email/password (uid doesn't start with 'card_')
        if (!user.uid.startsWith('card_')) setIsAdmin(true);
        setMode('verified');
        return;
      }

      const session = getSession(cardId);
      if (session) {
        setMode('verified');
        return;
      }

      MemorialAPI.getOne(cardId)
        .then(({ data }) => setMode(data ? 'gate' : 'free'))
        .catch(() => setMode('free'));
    });

    return unsub;
  }, [cardId]);

  const requireAuth = useCallback(
    (onSuccess: () => void) => {
      if (isAdmin) {
        onSuccess();
        return;
      }
      pendingCb.current = onSuccess;
      setShowModal(true);
    },
    [isAdmin],
  );

  const onVerified = useCallback(
    (phone: string) => {
      saveSession(cardId, phone);
      setShowModal(false);
      if (mode === 'gate') {
        setMode('verified');
      } else {
        setMode('verified');
        pendingCb.current?.();
        pendingCb.current = null;
      }
    },
    [cardId, mode],
  );

  if (mode === 'checking') return <LoadingScreen />;

  // Existing memorial: full-screen phone gate, children hidden until verified
  if (mode === 'gate') {
    return <PhoneGate cardId={cardId} fullScreen onVerified={onVerified} />;
  }

  // New memorial OR already verified: render editor with context
  return (
    <CardAuthCtx.Provider value={{ isReady: true, isVerified: mode === 'verified', requireAuth }}>
      {children}
      <PhoneGate
        cardId={cardId}
        fullScreen={false}
        asModal
        register
        saveMode
        open={showModal}
        onVerified={onVerified}
        onCancel={() => {
          setShowModal(false);
          pendingCb.current = null;
        }}
      />
    </CardAuthCtx.Provider>
  );
}

/* ── Phone verification form (shared for gate + modal) ── */
interface PhoneGateProps {
  cardId: string;
  fullScreen: boolean;
  asModal?: boolean;
  register?: boolean; // true = đặt SĐT lần đầu, false = xác minh SĐT đã có
  saveMode?: boolean; // true = modal xác nhận trước khi lưu
  open?: boolean;
  onVerified: (phone: string) => void;
  onCancel?: () => void;
}

function PhoneGate({
  cardId,
  fullScreen,
  asModal,
  register,
  saveMode,
  open,
  onVerified,
  onCancel,
}: PhoneGateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleFinish = async ({ phone }: { phone: string }) => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      const body = JSON.stringify({ cardId, phone });
      let endpoint = register ? '/api/auth/register' : '/api/auth/token';
      let res = await fetch(endpoint, { method: 'POST', headers, body });
      let data = (await res.json()) as { token?: string; message?: string };

      // Admin already set up phoneHash for this card → fall back to verification
      if (register && res.status === 409) {
        endpoint = '/api/auth/token';
        res = await fetch(endpoint, { method: 'POST', headers, body });
        data = (await res.json()) as { token?: string; message?: string };
      }

      if (!res.ok) {
        setError(data.message ?? (register ? 'Không thể xác thực' : 'Số điện thoại không đúng'));
        return;
      }
      await signInWithCustomToken(auth, data.token!);
      onVerified(phone);
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <Form form={form} onFinish={handleFinish} layout="vertical" requiredMark={false}>
      <Form.Item
        name="phone"
        rules={[
          {
            required: true,
            message: register
              ? 'Nhập số điện thoại của bạn'
              : 'Nhập số điện thoại đã dùng khi đặt hàng',
          },
        ]}
      >
        <Input
          size="large"
          placeholder="Số điện thoại"
          inputMode="tel"
          autoComplete="tel"
          prefix={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3 4.2 2 2 0 0 1 4.91 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          }
        />
      </Form.Item>
      {error && <Alert type="error" message={error} className="mb-4" showIcon />}
      <Button type="primary" htmlType="submit" loading={loading} block size="large">
        {saveMode ? 'Lưu' : register ? 'Đặt mật khẩu & Lưu' : 'Xác nhận'}
      </Button>
      {onCancel && (
        <Button onClick={onCancel} block className="mt-2">
          Huỷ
        </Button>
      )}
    </Form>
  );

  if (asModal) {
    const modalTitle = saveMode
      ? 'Xác nhận để lưu'
      : register
        ? 'Đặt mật khẩu cho trang của bạn'
        : 'Xác nhận số điện thoại';
    const modalDesc = saveMode
      ? 'Nhập mật khẩu (mặc định: số điện thoại) để lưu thay đổi.'
      : register
        ? 'Nhập mật khẩu để bảo vệ trang. Mật khẩu mặc định là số điện thoại này.'
        : 'Nhập mật khẩu đã dùng khi đặt hàng. Mật khẩu mặc định là số điện thoại.';
    return (
      <Modal
        title={modalTitle}
        open={open}
        onCancel={onCancel}
        footer={null}
        width={380}
      >
        <p className="mb-4 text-sm text-gray-400">{modalDesc}</p>
        {formContent}
      </Modal>
    );
  }

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
      >
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Xác thực để chỉnh sửa</h2>
            <p className="mt-1 text-sm text-gray-400">Nhập mật khẩu (mặc định: số điện thoại)</p>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return null;
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-indigo-500" />
    </div>
  );
}
