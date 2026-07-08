'use client';

import { App, Button, Modal, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface PrintUploadLinkModalProps {
  link: string | null;
  onClose: () => void;
}

/** Shown after creating an order that needs customer-uploaded print photos. */
export function PrintUploadLinkModal({ link, onClose }: PrintUploadLinkModalProps) {
  const { notification } = App.useApp();

  return (
    <Modal
      title="Đơn hàng đã được tạo"
      open={!!link}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          Đóng
        </Button>
      }
      width={480}
    >
      <div className="space-y-3 py-2">
        <Text>Đơn có sản phẩm cần in ảnh. Gửi link sau cho khách hàng để họ upload ảnh:</Text>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-3">
          <Text className="flex-1 break-all font-mono text-xs text-primary">{link}</Text>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => {
              if (link) {
                navigator.clipboard.writeText(link);
                notification.success({ message: 'Đã copy link', duration: 2 });
              }
            }}
          >
            Copy
          </Button>
        </div>
      </div>
    </Modal>
  );
}
