'use client';

import { Image } from 'antd';

const TEMPLATES = [
  { name: 'Sinh Nhật', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/sinhnhat.png' },
  { name: 'Âm Nhạc', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/nhac.png' },
  { name: 'Cá Nhân', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/canhan.png' },
  { name: 'Đám Cưới', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/damcuoii.png' },
  { name: 'Kỷ Niệm', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/kiniem.png' },
  { name: 'Chuyển Hướng', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/redicrect.png' },
  { name: 'Tốt Nghiệp', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/totnghiep.png' },
  { name: 'Mạng Xã Hội', imageUrl: 'https://pub-38354b71296248bba2cc5c4b1ca7af25.r2.dev/app/mxh.png' },
];

/** Template thumbnails grid with click-to-zoom (AntD Image preview group). */
export function TemplatesGallery() {
  return (
    <Image.PreviewGroup>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TEMPLATES.map((t) => (
          <div
            key={t.name}
            className="relative aspect-[9/16] overflow-hidden rounded-2xl shadow-md transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.02]"
          >
            <Image
              src={t.imageUrl}
              alt={t.name}
              styles={{ root: { position: 'absolute', inset: 0 } }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div
              className="pointer-events-none absolute right-3 bottom-3 left-3 text-[13px] font-bold text-white"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,.8)' }}
            >
              {t.name}
            </div>
          </div>
        ))}
      </div>
    </Image.PreviewGroup>
  );
}
