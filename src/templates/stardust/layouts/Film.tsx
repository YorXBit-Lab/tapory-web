'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import type { LayoutProps } from '@/templates/types';

// Engine 3D (three + gsap) tách chunk riêng, chỉ tải khi layout stardust hiển thị
const StardustExperience = dynamic(() => import('@/features/stardust/StardustExperience'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.3em]"
      style={{ background: '#030104', color: '#8d7fa5' }}
    >
      đang thắp sáng những vì sao…
    </div>
  ),
});

/**
 * Preview trong editor: bộ phim ký ức 3D chạy nhúng ngay trong khung
 * điện thoại, kèm nút mở fullscreen. Trang view dùng thẳng
 * StardustExperience (không qua layout này).
 */
export function StardustFilm({ data, c }: LayoutProps) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: '#030104' }}>
      {/* chỉ một Stage tồn tại tại một thời điểm — fullscreen mở thì gỡ bản nhúng */}
      {!fullscreen && <StardustExperience data={data} embedded />}

      <button
        onClick={() => setFullscreen(true)}
        className="absolute bottom-4 right-2.5 z-30 rounded-full border px-3 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm transition-opacity hover:opacity-80"
        style={{ borderColor: `${c.secondary}55`, color: c.secondary, background: 'rgba(10,4,12,0.4)' }}
      >
        ⛶ toàn màn hình
      </button>

      {fullscreen && typeof document !== 'undefined' && createPortal(
        <StardustExperience data={data} onExit={() => setFullscreen(false)} />,
        document.body,
      )}
    </div>
  );
}
