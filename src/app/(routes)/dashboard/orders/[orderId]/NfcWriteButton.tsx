'use client';

import { useState } from 'react';
import { Button, Spin, Tooltip, notification } from 'antd';
import { WifiOutlined } from '@ant-design/icons';
import { CardAPI } from '@/services/CardAPI';
import type { ICard } from '@/configs/types';

/* ── Web NFC types (not in TS stdlib) ── */
interface NDEFRecord {
  recordType: string;
  data: string;
}
interface NDEFWriter {
  write(msg: { records: NDEFRecord[] }): Promise<void>;
}
declare const NDEFReader: new () => NDEFWriter;

type NfcStatus = 'idle' | 'waiting' | 'error';

export function NfcWriteButton({ card, onWritten }: { card: ICard; onWritten: () => void }) {
  const [status, setStatus] = useState<NfcStatus>('idle');
  const [errMsg, setErrMsg] = useState('');

  const nfcUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/view/${card.id}`;

  const handleWrite = async () => {
    if (typeof NDEFReader === 'undefined') {
      notification.error({
        message: 'Trình duyệt không hỗ trợ',
        description: 'Dùng Chrome + bật chrome://flags/#enable-experimental-web-platform-features',
      });
      return;
    }
    setStatus('waiting');
    setErrMsg('');
    try {
      await new NDEFReader().write({ records: [{ recordType: 'url', data: nfcUrl }] });
      await CardAPI.markNfcWritten(card.id);
      notification.success({ message: `Đã ghi NFC: ${card.id}` });
      onWritten();
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setErrMsg(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  };

  if (status === 'waiting') {
    return (
      <div className="flex items-center gap-2 text-xs text-primary">
        <Spin size="small" />
        <span>Đặt chip vào thiết bị…</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <Tooltip title={errMsg}>
        <button onClick={handleWrite} className="text-xs text-red-500 hover:underline">
          ✗ Lỗi — thử lại
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={nfcUrl}>
      <Button
        size="small"
        icon={<WifiOutlined />}
        onClick={handleWrite}
        type={card.nfcWritten ? 'default' : 'primary'}
      >
        {card.nfcWritten ? 'Ghi lại' : 'Ghi NFC'}
      </Button>
    </Tooltip>
  );
}
