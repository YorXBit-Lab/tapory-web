'use client';

import { useRef } from 'react';
import { Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { Spinner } from '@/components/ui/Spinner';

const { Text } = Typography;

interface ImageUploaderProps {
  value?: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  hint?: string;
}

export function ImageUploader({
  value,
  uploading,
  onUpload,
  onRemove,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  hint = 'JPEG · PNG · WebP · tối đa 5 MB',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-start gap-3">
      <div
        className="relative flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-elevated transition-colors hover:border-primary"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <Image src={value} alt="upload preview" fill className="object-cover" sizes="80px" unoptimized />
        ) : (
          <div className="flex flex-col items-center gap-1 text-content3">
            <UploadOutlined className="text-xl" />
            <span className="text-[10px]">Tải ảnh</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Button size="small" icon={<UploadOutlined />} loading={uploading} onClick={() => inputRef.current?.click()}>
          {value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
        {value && (
          <Button size="small" danger onClick={onRemove}>
            Xóa ảnh
          </Button>
        )}
        <Text type="secondary" className="text-[10px]">{hint}</Text>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
