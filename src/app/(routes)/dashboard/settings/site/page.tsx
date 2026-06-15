'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Typography, notification } from 'antd';
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/siteSettings';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { uploadSiteImage } from '@/utils/r2-upload';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import type { ISiteSettings } from '@/services/SettingsAPI';

const { Text } = Typography;

/* ─────────────────────────────────────────────
   Trường ảnh dùng chung (logo / favicon / OG)
───────────────────────────────────────────── */
function ImageField({
  value,
  onChange,
  hint,
}: {
  value?: string;
  onChange?: (v: string) => void;
  hint?: string;
}) {
  const { user } = useAdminAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!user) {
      notification.error({ message: 'Bạn chưa đăng nhập' });
      return;
    }
    setUploading(true);
    try {
      const idToken = await user.getIdToken();
      const url = await uploadSiteImage(file, idToken);
      onChange?.(url);
    } catch (err) {
      notification.error({ message: err instanceof Error ? err.message : 'Tải ảnh thất bại' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ImageUploader
      value={value}
      uploading={uploading}
      onUpload={handleUpload}
      onRemove={() => onChange?.('')}
      hint={hint}
    />
  );
}

/** Loại bỏ các giá trị undefined trước khi gửi (Firestore Admin từ chối undefined) */
function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/* ─────────────────────────────────────────────
   Trang
───────────────────────────────────────────── */
export default function SiteSettingsPage() {
  const { data, isLoading } = useSiteSettings();
  const { mutateAsync: save, isPending } = useUpdateSiteSettings();
  const [form] = Form.useForm<ISiteSettings>();

  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data, form]);

  const handleSave = async (values: ISiteSettings) => {
    try {
      await save(clean({
        brand: values.brand ?? {},
        contact: values.contact ?? {},
        social: values.social ?? {},
        seo: values.seo ?? {},
      }));
      notification.success({ message: 'Đã lưu thông tin website' });
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : 'Lưu thất bại',
      });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      disabled={isLoading}
      className="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-5">
        {/* Thương hiệu */}
        <Card title="Thương hiệu">
          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item label="Logo" name={['brand', 'logoUrl']}>
              <ImageField hint="PNG nền trong suốt · cao tối thiểu 80px" />
            </Form.Item>
            <Form.Item label="Favicon" name={['brand', 'faviconUrl']}>
              <ImageField hint="Vuông · PNG · 32–512px" />
            </Form.Item>
          </div>
          <Form.Item label="Tên thương hiệu" name={['brand', 'name']}>
            <Input placeholder="VD: Góc Chạm" />
          </Form.Item>
          <Form.Item
            label="Slogan / Tagline"
            name={['brand', 'tagline']}
            className="mb-0"
          >
            <Input placeholder="VD: Móc khóa kỷ niệm NFC" />
          </Form.Item>
        </Card>

        {/* Liên hệ */}
        <Card title="Liên hệ">
          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item
              label="Email"
              name={['contact', 'email']}
              rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input placeholder="hello@tapory.com" />
            </Form.Item>
            <Form.Item label="Hotline / Điện thoại" name={['contact', 'hotline']}>
              <Input placeholder="0900 000 000" />
            </Form.Item>
          </div>
          <Form.Item label="Địa chỉ" name={['contact', 'address']}>
            <Input.TextArea rows={2} placeholder="Số nhà, đường, phường, quận, thành phố" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item label="Giờ làm việc" name={['contact', 'businessHours']}>
              <Input placeholder="VD: 8:00 – 21:00 hằng ngày" />
            </Form.Item>
            <Form.Item label="Mã số thuế" name={['contact', 'taxCode']} className="mb-0">
              <Input placeholder="MST (nếu có)" />
            </Form.Item>
          </div>
        </Card>

        {/* Mạng xã hội */}
        <Card title="Mạng xã hội">
          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item label="Facebook" name={['social', 'facebook']}>
              <Input placeholder="https://facebook.com/..." />
            </Form.Item>
            <Form.Item label="Instagram" name={['social', 'instagram']}>
              <Input placeholder="https://instagram.com/..." />
            </Form.Item>
            <Form.Item label="TikTok" name={['social', 'tiktok']}>
              <Input placeholder="https://tiktok.com/@..." />
            </Form.Item>
            <Form.Item label="Zalo" name={['social', 'zalo']}>
              <Input placeholder="https://zalo.me/..." />
            </Form.Item>
            <Form.Item label="YouTube" name={['social', 'youtube']} className="mb-0">
              <Input placeholder="https://youtube.com/@..." />
            </Form.Item>
          </div>
        </Card>

        {/* SEO mặc định */}
        <Card title="SEO mặc định">
          <Text type="secondary" className="mb-4 block text-xs">
            Dùng làm tiêu đề / mô tả mặc định cho các trang chưa có SEO riêng.
          </Text>
          <Form.Item label="Meta title" name={['seo', 'metaTitle']}>
            <Input placeholder="Tiêu đề hiển thị trên Google / tab trình duyệt" maxLength={70} showCount />
          </Form.Item>
          <Form.Item label="Meta description" name={['seo', 'metaDescription']}>
            <Input.TextArea
              rows={3}
              placeholder="Mô tả ngắn xuất hiện dưới tiêu đề trên kết quả tìm kiếm"
              maxLength={160}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="Ảnh chia sẻ mặc định (OG image)"
            name={['seo', 'ogImageUrl']}
            className="mb-0"
          >
            <ImageField hint="Tỉ lệ 1.91:1 · khuyến nghị 1200×630px" />
          </Form.Item>
        </Card>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background/80 py-3 backdrop-blur">
          <Button onClick={() => data && form.setFieldsValue(data)} disabled={isPending}>
            Hoàn tác
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Form>
  );
}
