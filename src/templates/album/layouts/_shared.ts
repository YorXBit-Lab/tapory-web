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

const DEG = 180 / Math.PI;
const HEART_DEPTH = 0.55; // độ phồng theo chiều sâu (so với bán kính ngang)

/**
 * Điểm trên **mặt trái tim 3D phồng** ở toạ độ màn hình (chưa nhân scale).
 * Quét đường cong tim 2D kinh điển (16 sin³θ, 13cosθ−5cos2θ−2cos3θ−cos4θ) — đã
 * căn giữa & chuẩn hoá — rồi thu nhỏ theo cos(ψ)=√(1−v²) và đẩy sâu theo v: nhìn
 * thẳng cho đúng silhouette trái tim (2 thuỳ + mũi nhọn).
 */
function heartSurfacePoint(theta: number, v: number): [number, number, number] {
  const cosp = Math.sqrt(Math.max(0, 1 - v * v));
  const u = Math.sin(theta) ** 3; // = 16 sin³θ / 16
  const hy = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta);
  const w = (hy + 2.64) / 16; // +2.64: căn đúng tâm dọc (dải hy ≈ [-17, 11.7])
  return [u * cosp, -w * cosp, HEART_DEPTH * v]; // X ngang · Y dọc (CSS xuống) · Z sâu
}

const sub3 = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Một ô ảnh trên mặt tim: vị trí + pháp tuyến (∂θ × ∂v) → transform 3D. */
function heartPlaced(theta: number, v: number, scale: number): Placed {
  const h = 1e-3;
  const p = heartSurfacePoint(theta, v);
  const pt = heartSurfacePoint(theta + h, v);
  const pv = heartSurfacePoint(theta, Math.min(0.97, Math.max(-0.97, v + h)));
  let nrm = cross3(sub3(pt, p), sub3(pv, p));
  const nl = Math.hypot(nrm[0], nrm[1], nrm[2]) || 1;
  nrm = [nrm[0] / nl, nrm[1] / nl, nrm[2] / nl];
  if (nrm[0] * p[0] + nrm[1] * p[1] + nrm[2] * p[2] < 0) nrm = [-nrm[0], -nrm[1], -nrm[2]];

  const [Nx, Ny, Nz] = nrm;
  const px = p[0] * scale, py = p[1] * scale, pz = p[2] * scale;
  const latDeg = Math.asin(Math.max(-1, Math.min(1, Ny))) * DEG;
  const lngDeg = Math.atan2(Nx, Nz) * DEG;
  return {
    transform: `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, ${pz.toFixed(1)}px) rotateY(${lngDeg.toFixed(1)}deg) rotateX(${(-latDeg).toFixed(1)}deg)`,
    n: [Nx, Ny, Nz] as [number, number, number],
  };
}

/**
 * Phân bố n ảnh phủ ĐỀU toàn bộ mặt trái tim 3D khép kín (cả mặt trước lẫn sau,
 * tới tận tâm hai cực) — xoay góc nào cũng đầy, giống hình cầu:
 *  • viền dày ở mép (v≈0) → đường tim sắc nét;
 *  • thân: v trải đều [−0.98, 0.98] (góc vàng) → phủ kín cả hai mặt, không
 *    chừa lỗ giữa (v≈±0.98 chính là tâm mặt trước/sau).
 * Trả cùng định dạng spherePositions để dùng chung useDragSpin.
 */
export function heart3DPositions(n: number, scale: number): Placed[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const out: Placed[] = [];

  // Viền: bám sát mép tim, lệch nhẹ ±v để có độ dày, không trùng mặt phẳng.
  const rim = Math.max(16, Math.round(n * 0.3));
  for (let k = 0; k < rim; k++) {
    out.push(heartPlaced((k / rim) * Math.PI * 2, (k % 2 ? 1 : -1) * 0.05, scale));
  }
  // Thân: trải đều theo chiều sâu cả hai mặt (kể cả tâm), góc vàng cho phân bố mịn.
  const body = n - rim;
  for (let j = 0; j < body; j++) {
    const v = (1 - ((j + 0.5) / body) * 2) * 0.98;
    out.push(heartPlaced(j * golden, v, scale));
  }
  return out;
}
