'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Trái tim ảnh WebGL — cùng cách làm với quả cầu (SphereScene):
 *  • mặt tim 3D phồng được CẮT thành ~38 mảnh cong theo lưới (θ = quanh viền tim,
 *    v = chiều sâu) + 2 chỏm mặt trước/sau — các mảnh dính khít nhau thành khối
 *    tim liền mạch, mỗi mảnh dán 1 ảnh;
 *  • tim ĐẬP nhịp (scale pulse) và lơ lửng trên vòng sáng dưới chân;
 *  • kéo xoay có quán tính, tự xoay chậm, rê chuột vào thì dừng;
 *  • mở màn: từng mảnh bay từ ngoài vào ráp thành tim;
 *  • fog màu nền làm mặt sau tối dần (chiều sâu).
 */

const ROWS = 4;     // số hàng theo chiều sâu (không kể 2 chỏm)
const EQ_COLS = 10; // số mảnh ở viền tim (v=0); hàng khác tỉ lệ √(1−v²)
const VMAX = 0.82;  // thân tim phủ v ∈ [−VMAX, VMAX]; ngoài ra là 2 chỏm
const DEPTH = 0.55; // độ phồng theo chiều sâu (so với bề ngang)

/** Điểm trên mặt tim 3D phồng (three.js: y hướng lên). */
function heartPoint(theta: number, v: number): THREE.Vector3 {
  const cosp = Math.sqrt(Math.max(0, 1 - v * v));
  const u = Math.sin(theta) ** 3;
  const hy = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta);
  const w = (hy + 2.64) / 16; // +2.64: căn đúng tâm dọc (dải hy ≈ [-17, 11.7])
  return new THREE.Vector3(u * cosp, w * cosp, DEPTH * v);
}

/**
 * Một mảnh cong của mặt tim: lưới (θ, v) → BufferGeometry.
 * UV mặc định trải 0..1 trên mảnh (mỗi mảnh 1 ảnh); chỏm dùng UV chiếu phẳng
 * theo (x, y) để ảnh không bị xoáy quanh cực.
 */
function heartPatch(t0: number, t1: number, v0: number, v1: number, segT: number, segV: number, planarUV: boolean): THREE.BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= segV; j++) {
    const v = v0 + ((v1 - v0) * j) / segV;
    for (let i = 0; i <= segT; i++) {
      const p = heartPoint(t0 + ((t1 - t0) * i) / segT, v);
      pos.push(p.x, p.y, p.z);
      if (planarUV) uv.push(p.x / 1.25 + 0.5, p.y / 1.25 + 0.5);
      else uv.push(i / segT, 1 - j / segV);
    }
  }
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segT; i++) {
      const a = j * (segT + 1) + i, b = a + 1, cc = a + segT + 1, d = cc + 1;
      idx.push(a, cc, b, b, cc, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Cắt mặt tim thành lưới mảnh cong khít nhau (như sphereGrid của quả cầu). */
function buildPatches(): THREE.BufferGeometry[] {
  const out: THREE.BufferGeometry[] = [];
  const dV = (2 * VMAX) / ROWS;
  for (let r = 0; r < ROWS; r++) {
    const v0 = -VMAX + r * dV;
    const vc = v0 + dV / 2;
    const n = Math.max(4, Math.round(EQ_COLS * Math.sqrt(Math.max(0, 1 - vc * vc))));
    const off = (r % 2) * (Math.PI / n); // so le hàng để mạch ghép tự nhiên
    for (let k = 0; k < n; k++) {
      const t0 = off + (k * 2 * Math.PI) / n;
      out.push(heartPatch(t0, t0 + (2 * Math.PI) / n, v0, v0 + dV, 8, 4, false));
    }
  }
  // 2 chỏm mặt trước / mặt sau
  out.push(heartPatch(0, 2 * Math.PI, VMAX, 1, 24, 4, true));
  out.push(heartPatch(0, 2 * Math.PI, -1, -VMAX, 24, 4, true));
  return out;
}

/** Hook: tạo mảnh + viền outline (placeholder) và giải phóng khi unmount. */
function usePatches() {
  const patches = useMemo(() => buildPatches(), []);
  // Ngưỡng 80°: chỉ giữ đường BIÊN mảnh, bỏ nếp gấp nội bộ ở vùng cong gắt (khe tim,
  // mũi tim) — khung chờ gọn gàng, không rối mắt.
  const edges = useMemo(() => patches.map(p => new THREE.EdgesGeometry(p, 80)), [patches]);
  useEffect(() => () => {
    for (const p of patches) p.dispose();
    for (const e of edges) e.dispose();
  }, [patches, edges]);
  return { patches, edges };
}

/** Tham số repeat/offset để crop texture kiểu object-cover về ô vuông. */
function coverParams(t: THREE.Texture): { repeat: [number, number]; offset: [number, number] } {
  const img = t.image as HTMLImageElement | undefined;
  const a = img?.width && img?.height ? img.width / img.height : 1;
  return a > 1
    ? { repeat: [1 / a, 1], offset: [(1 - 1 / a) / 2, 0] }
    : { repeat: [1, a], offset: [0, (1 - a) / 2] };
}

/** PRNG tất định theo index. */
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

const FLY_DUR = 1.0;
const FLY_STAGGER = 0.05; // 50ms mỗi mảnh (spec)

/** Mở màn: mảnh bay từ ngoài vào + xoáy quanh tâm rồi ráp đúng vị trí. */
function FlyIn({ index, children }: { index: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const done = useRef(false);
  const t0 = useRef<number | null>(null);
  const start = useMemo(() => ({
    pos: new THREE.Vector3(seeded(index, 1) * 2 - 1, seeded(index, 2) * 2 - 1, seeded(index, 3) * 2 - 1)
      .normalize().multiplyScalar(2.4 + seeded(index, 4) * 3),
    rot: new THREE.Euler((seeded(index, 5) - 0.5) * 2.4, (seeded(index, 6) - 0.5) * 2.4, (seeded(index, 7) - 0.5) * 2.4),
  }), [index]);

  useFrame(({ clock }) => {
    if (done.current) return;
    const g = ref.current;
    if (!g) return;
    if (t0.current === null) t0.current = clock.elapsedTime;
    const t = clock.elapsedTime - t0.current - index * FLY_STAGGER;
    const p = Math.min(1, Math.max(0, t / FLY_DUR));
    const e = 1 - Math.pow(1 - p, 3);
    g.position.copy(start.pos).multiplyScalar(1 - e);
    g.rotation.set(start.rot.x * (1 - e), start.rot.y * (1 - e), start.rot.z * (1 - e));
    g.scale.setScalar(0.25 + 0.75 * e);
    if (p >= 1) done.current = true;
  });

  return <group ref={ref}>{children}</group>;
}

/** Mảnh trống khi chưa có ảnh: nền mờ + viền hồng để thấy rõ khung tim chờ ảnh. */
function PlaceholderPatches({ secondary }: { secondary: string }) {
  const { patches, edges } = usePatches();
  return (
    <>
      {patches.map((p, i) => (
        <FlyIn key={i} index={i}>
          <mesh geometry={p}>
            <meshBasicMaterial color="#2a121c" side={THREE.DoubleSide} transparent opacity={0.92}
              polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          </mesh>
          <lineSegments geometry={edges[i]}>
            <lineBasicMaterial color={secondary} transparent opacity={0.6} />
          </lineSegments>
        </FlyIn>
      ))}
    </>
  );
}

function PhotoPatches({ photos, onTap }: { photos: string[]; onTap?: (i: number) => void }) {
  const { patches } = usePatches();
  const textures = useLoader(THREE.TextureLoader, photos);
  return (
    <>
      {patches.map((p, i) => {
        const u = i % textures.length;
        const cov = coverParams(textures[u]);
        return (
          <FlyIn key={i} index={i}>
            <mesh geometry={p}
              onClick={(e) => {
                e.stopPropagation();
                if (e.delta < 8 && onTap) onTap(u); // kéo xoay thì không tính là chạm
              }}>
              <meshBasicMaterial map={textures[u]} map-colorSpace={THREE.SRGBColorSpace} map-anisotropy={4}
                map-repeat={cov.repeat} map-offset={cov.offset} side={THREE.DoubleSide} />
            </mesh>
          </FlyIn>
        );
      })}
    </>
  );
}

/** Group tim: đập nhịp (scale pulse) — mọi thứ bên trong đập cùng nhau. */
function BeatingGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Nhịp đập: thump nhanh rồi thả — chu kỳ 2.4s
    const phase = (t % 2.4) / 2.4;
    const beat = Math.exp(-phase * 9) * Math.sin(phase * Math.PI * 5);
    ref.current?.scale.setScalar(1 + Math.max(0, beat) * 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

export interface HeartSceneProps {
  photos: string[];
  isPlaceholder: boolean;
  secondary: string;
  accent: string;
  /** CSS filter của ảnh (grayscale/sepia…) — áp lên cả canvas. */
  filter?: string;
  onTap?: (index: number) => void;
}

export function HeartScene({ photos, isPlaceholder, secondary, accent, filter, onTap }: HeartSceneProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="absolute inset-0"
      style={{ filter: filter && filter !== 'none' ? filter : undefined }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
    >
      <Canvas flat dpr={[1, 2]} gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.15, 2.7], fov: 45, near: 0.01, far: 30 }}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <fog attach="fog" args={[accent, 2.6, 4.4]} />

        <BeatingGroup>
          <Suspense fallback={<PlaceholderPatches secondary={secondary} />}>
            {isPlaceholder
              ? <PlaceholderPatches secondary={secondary} />
              : <PhotoPatches photos={photos} onTap={onTap} />}
          </Suspense>
        </BeatingGroup>

        {/* Vòng sáng dưới chân tim */}
        <group position={[0, -1.06, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.72, 0.745, 64]} />
            <meshBasicMaterial color={secondary} transparent opacity={0.8}
              blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 48]} />
            <meshBasicMaterial color={secondary} transparent opacity={0.12}
              blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Kéo xoay (quán tính) · tự xoay chậm, rê chuột vào thì dừng · không zoom quá gần/xa */}
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.55}
          autoRotate={!hovered} autoRotateSpeed={1.4}
          minDistance={1.5} maxDistance={4.2} />
      </Canvas>
    </div>
  );
}
