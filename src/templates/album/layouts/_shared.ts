import type { IEditDraft } from '@/configs/types';

/**
 * Trả về danh sách ảnh để hiển thị. Khi chưa có ảnh nào, sinh `min` ô trống
 * (chuỗi rỗng) để layout vẽ placeholder — giữ bố cục không bị vỡ ở bản xem thử.
 */
export function getPhotos(data: IEditDraft, min = 6): { photos: string[]; isPlaceholder: boolean } {
  const real = (data.galleryUrls ?? []).filter(Boolean);
  if (real.length === 0) {
    return { photos: Array.from({ length: min }, () => ''), isPlaceholder: true };
  }
  return { photos: real, isPlaceholder: false };
}

const D2R = Math.PI / 180;
const rotX = (v: number[], a: number) => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]; };
const rotY = (v: number[], a: number) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]; };

export interface Placed {
  transform: string;
  /** Pháp tuyến mặt ô (hướng ra ngoài) — dùng cho depth shading. */
  n: [number, number, number];
}

/**
 * Phân bố n điểm đều trên mặt cầu (Fibonacci sphere) → transform 3D + pháp tuyến.
 * Mỗi ô hướng ra ngoài; mặt sau ẩn nhờ backface-visibility.
 */
export function spherePositions(n: number, radius: number): Placed[] {
  const golden = Math.PI * (3 - Math.sqrt(5)); // ~2.399963 rad
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;     // 1 → -1
    const latDeg = Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI);
    const lngDeg = (i * golden) * (180 / Math.PI);
    // pháp tuyến = Ry(lng)·Rx(-lat) áp lên (0,0,1) — khớp thứ tự transform CSS
    const w = rotY(rotX([0, 0, 1], -latDeg * D2R), lngDeg * D2R);
    return {
      transform: `rotateY(${lngDeg}deg) rotateX(${-latDeg}deg) translateZ(${radius}px)`,
      n: [w[0], w[1], w[2]] as [number, number, number],
    };
  });
}

/**
 * Toạ độ (x,y) trên đường cong trái tim, đã căn giữa quanh (0,0).
 * scale ~ kích thước; trả về theo pixel để đặt absolute.
 */
export function heartPositions(n: number, scale: number): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: hx * scale, y: -hy * scale };
  });
}
