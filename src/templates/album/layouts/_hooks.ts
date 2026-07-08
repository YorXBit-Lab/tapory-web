'use client';
import { useEffect, useRef } from 'react';

const D2R = Math.PI / 180;
const rotX = (v: number[], a: number) => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
const rotY = (v: number[], a: number) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };

interface SpinOpts {
  auto?: number;
  initX?: number;
  /** Làm mờ/đậm ô theo độ sâu 3D (cần data-nx/ny/nz trên mỗi ô con). */
  depth?: boolean;
  /** Rê chuột vào (chỉ mouse) → tạm dừng auto-rotate. */
  hoverPause?: boolean;
  /** Chạm (không kéo) vào ô có data-idx → trả về index. */
  onTap?: (i: number) => void;
  /** Gọi mỗi frame với góc xoay Y hiện tại (deg) — để layout đồng bộ nội dung theo vòng quay. */
  onSpin?: (ry: number) => void;
}

/**
 * Tự xoay + kéo (có quán tính) cho container 3D. Cập nhật transform & độ sâu
 * trực tiếp qua ref mỗi frame — không re-render React.
 */
export function useDragSpin(opts: SpinOpts = {}) {
  const { auto = 0.25, initX = -6, depth = false, hoverPause = false } = opts;
  const ref = useRef<HTMLDivElement>(null);
  const onTapRef = useRef(opts.onTap);
  const onSpinRef = useRef(opts.onSpin);
  useEffect(() => { onTapRef.current = opts.onTap; onSpinRef.current = opts.onSpin; });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rx = initX, ry = 0;
    let dragging = false, moved = false, hovering = false;
    let lastX = 0, lastY = 0, vel = 0, idle = 0, raf = 0;
    let normals: (number[] | null)[] | null = null;

    const apply = () => {
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      onSpinRef.current?.(ry);
      if (!depth) return;
      const kids = el.children;
      if (!normals || normals.length !== kids.length) {
        // Phần tử không có data-nx (vd vòng quỹ đạo trang trí) → bỏ qua depth shading.
        normals = Array.from(kids).map(ch => {
          const d = (ch as HTMLElement).dataset;
          if (d.nx === undefined) return null;
          return [Number(d.nx) || 0, Number(d.ny) || 0, Number(d.nz) || 1];
        });
      }
      const rxr = rx * D2R, ryr = ry * D2R;
      for (let i = 0; i < kids.length; i++) {
        const nrm = normals[i];
        if (!nrm) continue;
        const w = rotX(rotY(nrm, ryr), rxr);
        const t = Math.max(0, w[2]);          // 0 (cạnh) → 1 (chính diện)
        const k = kids[i] as HTMLElement;
        k.style.opacity = String(0.3 + 0.7 * t);
        k.style.filter = `brightness(${0.55 + 0.55 * t})`;
        k.style.zIndex = String(Math.round(t * 1000));
      }
    };

    const tick = () => {
      if (!dragging) {
        if (Math.abs(vel) > 0.05) { ry += vel; vel *= 0.94; }
        else if (idle > 0) idle -= 1;
        else if (!hovering) ry += auto;
      }
      apply();
      raf = requestAnimationFrame(tick);
    };

    const down = (e: PointerEvent) => {
      dragging = true; moved = false; vel = 0;
      lastX = e.clientX; lastY = e.clientY;
      try { el.setPointerCapture(e.pointerId); } catch {}
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 5) moved = true;
      ry += dx * 0.45; vel = dx * 0.45;
      rx = Math.max(-78, Math.min(78, rx - dy * 0.45));
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      dragging = false; idle = 150;
      if (!moved && onTapRef.current) {
        const hit = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-idx]') as HTMLElement | null;
        if (hit) { const i = Number(hit.dataset.idx); if (!Number.isNaN(i)) onTapRef.current(i); }
      }
    };

    // Chỉ mouse mới pause khi hover — cảm ứng không có hover thật, tránh kẹt trạng thái.
    const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') hovering = true; };
    const leave = () => { hovering = false; };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    if (hoverPause) {
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointerleave', leave);
    };
  }, [auto, initX, depth, hoverPause]);

  return ref;
}
