'use client';
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Hàng cuộn ngang cho các picker (Loại template / Phong cách). Scrollbar ẩn nên
 * desktop vốn không có cách cuộn — bù lại bằng: lăn chuột dọc → cuộn ngang,
 * và giữ-kéo bằng chuột để lướt (touch cuộn native sẵn). Sau khi kéo thì chặn
 * click để không chọn nhầm mục dưới con trỏ.
 */
export function HScrollRow({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });

  // React gắn wheel dạng passive — muốn preventDefault (chặn trang cuộn dọc
  // khi đang cuộn ngang hàng này) phải gắn listener native non-passive.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') return;
        drag.current = { down: true, moved: false, startX: e.clientX, startLeft: ref.current?.scrollLeft ?? 0 };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d.down || !ref.current) return;
        const dx = e.clientX - d.startX;
        if (Math.abs(dx) > 4) d.moved = true;
        ref.current.scrollLeft = d.startLeft - dx;
      }}
      onPointerUp={() => { drag.current.down = false; }}
      onPointerLeave={() => { drag.current.down = false; }}
      onClickCapture={(e) => {
        // vừa kéo xong thì cú nhả chuột không được tính là chọn
        if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
      }}
    >
      {children}
    </div>
  );
}
