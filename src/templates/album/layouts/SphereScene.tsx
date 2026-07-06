'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Quả cầu ảnh WebGL (three.js qua react-three-fiber):
 *  • ~44 ô ảnh là MẢNH CẦU CONG (SphereGeometry cắt theo kinh/vĩ độ) — mọi mảnh
 *    nằm đúng trên một mặt cầu nên khối tròn mịn, không bị cạnh đa diện;
 *  • OrbitControls: kéo xoay có quán tính, lăn chuột / chụm 2 ngón zoom
 *    vào tận TRONG lòng cầu xem ảnh như panorama (minDistance < bán kính);
 *  • mỗi ô có 2 lớp — lớp trong lật UV nên ảnh không bị lật gương khi xem từ trong;
 *  • fog màu nền làm ảnh phía sau tối dần (chiều sâu).
 */

const R = 1;            // bán kính cầu (đơn vị thế giới)
const ROWS = 5;         // số hàng vĩ độ (phủ −75° → 75°, chừa 2 chỏm cực)
const EQ_COLS = 12;     // số ô ở xích đạo; các hàng khác tỉ lệ cos(lat)
const GAP = 0;          // 0 = các ô dính khít nhau thành mặt cầu liền mạch

interface TileGeos {
  outer: THREE.SphereGeometry;
  /** Bản sao lật UV ngang, render mặt trong (BackSide) → ảnh đúng chiều khi xem từ trong. */
  inner: THREE.SphereGeometry;
}

/** Cắt mặt cầu thành lưới mảnh cong kinh–vĩ tuyến; mỗi hàng số ô tỉ lệ cos(lat). */
function buildTileGeos(): TileGeos[] {
  const out: TileGeos[] = [];
  const dLat = (150 / ROWS) * (Math.PI / 180);
  for (let r = 0; r < ROWS; r++) {
    const latC = (-75 * Math.PI) / 180 + dLat * (r + 0.5);
    const n = Math.max(4, Math.round(EQ_COLS * Math.cos(latC)));
    const dLng = (2 * Math.PI) / n;
    const off = (r % 2) * (dLng / 2); // so le hàng để mạch ghép tự nhiên
    const latHalf = (dLat / 2) * (1 - GAP);
    const lngHalf = (dLng / 2) * (1 - GAP);
    for (let k = 0; k < n; k++) {
      const lngC = off + k * dLng;
      // theta của SphereGeometry đo từ cực bắc (0) → nam (π)
      const thetaStart = Math.PI / 2 - (latC + latHalf);
      const outer = new THREE.SphereGeometry(R, 8, 6, lngC - lngHalf, lngHalf * 2, thetaStart, latHalf * 2);
      const inner = outer.clone();
      const uv = inner.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
      out.push({ outer, inner });
    }
  }
  return out;
}

/** Hook dùng chung: tạo lưới mảnh cầu + giải phóng geometry khi unmount. */
function useTileGeos(): TileGeos[] {
  const tiles = useMemo(() => buildTileGeos(), []);
  useEffect(() => () => { for (const t of tiles) { t.outer.dispose(); t.inner.dispose(); } }, [tiles]);
  return tiles;
}

/** Tham số repeat/offset để crop texture kiểu object-cover về ô vuông. */
function coverParams(t: THREE.Texture): { repeat: [number, number]; offset: [number, number] } {
  const img = t.image as HTMLImageElement | undefined;
  const a = img?.width && img?.height ? img.width / img.height : 1;
  return a > 1
    ? { repeat: [1 / a, 1], offset: [(1 - 1 / a) / 2, 0] }
    : { repeat: [1, a], offset: [0, (1 - a) / 2] };
}

const FLY_DUR = 1.1;       // thời gian bay của một ô (giây)
const FLY_STAGGER = 0.035; // độ trễ giữa 2 ô liên tiếp → ráp dần theo từng hàng

/** PRNG tất định theo index — mỗi ô một hướng xuất phát cố định, không nhảy khi re-render. */
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Hiệu ứng mở màn: ô ảnh xuất phát rải rác ngoài xa, bay vào + xoáy quanh tâm
 * rồi ráp đúng vị trí trên mặt cầu (easeOutCubic, so le theo index).
 */
function FlyIn({ index, children }: { index: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const done = useRef(false);
  const t0 = useRef<number | null>(null);
  const start = useMemo(() => ({
    pos: new THREE.Vector3(seeded(index, 1) * 2 - 1, seeded(index, 2) * 2 - 1, seeded(index, 3) * 2 - 1)
      .normalize().multiplyScalar(2.6 + seeded(index, 4) * 3),
    rot: new THREE.Euler((seeded(index, 5) - 0.5) * 2.4, (seeded(index, 6) - 0.5) * 2.4, (seeded(index, 7) - 0.5) * 2.4),
  }), [index]);

  useFrame(({ clock }) => {
    if (done.current) return;
    const g = ref.current;
    if (!g) return;
    if (t0.current === null) t0.current = clock.elapsedTime;
    const t = clock.elapsedTime - t0.current - index * FLY_STAGGER;
    const p = Math.min(1, Math.max(0, t / FLY_DUR));
    const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
    g.position.copy(start.pos).multiplyScalar(1 - e);
    g.rotation.set(start.rot.x * (1 - e), start.rot.y * (1 - e), start.rot.z * (1 - e));
    g.scale.setScalar(0.25 + 0.75 * e);
    if (p >= 1) done.current = true;
  });

  return <group ref={ref}>{children}</group>;
}

interface TileShellProps {
  geos: TileGeos;
  map: THREE.Texture;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

/** Một ô ảnh cong: mặt ngoài + mặt trong (lật UV để ảnh đúng chiều khi xem từ trong). */
function TileShell({ geos, map, onClick }: TileShellProps) {
  // Cấu hình texture qua props (R3F tự áp) — không tự mutate giá trị từ useLoader
  const cov = coverParams(map);
  const texProps = {
    'map-colorSpace': THREE.SRGBColorSpace,
    'map-anisotropy': 4,
    'map-repeat': cov.repeat,
    'map-offset': cov.offset,
  } as const;
  return (
    <group>
      <mesh geometry={geos.outer} onClick={onClick}>
        <meshBasicMaterial map={map} {...texProps} side={THREE.FrontSide} />
      </mesh>
      <mesh geometry={geos.inner} onClick={onClick}>
        <meshBasicMaterial map={map} {...texProps} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

/**
 * Ô trống khi chưa có ảnh (và làm fallback lúc texture đang tải):
 * nền mờ + viền sáng màu chủ đề quanh từng ô để người dùng thấy rõ khung chờ ảnh.
 */
function PlaceholderTiles({ secondary }: { secondary: string }) {
  const tiles = useTileGeos();
  const edges = useMemo(() => tiles.map(t => new THREE.EdgesGeometry(t.outer, 30)), [tiles]);
  useEffect(() => () => { for (const e of edges) e.dispose(); }, [edges]);
  return (
    <>
      {tiles.map((t, i) => (
        <FlyIn key={i} index={i}>
          <mesh geometry={t.outer}>
            {/* polygonOffset đẩy mặt nền lùi nhẹ để viền line không bị z-fighting */}
            <meshBasicMaterial color="#1c1c2a" side={THREE.DoubleSide} transparent opacity={0.9}
              polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
          </mesh>
          <lineSegments geometry={edges[i]}>
            <lineBasicMaterial color={secondary} transparent opacity={0.65} />
          </lineSegments>
        </FlyIn>
      ))}
    </>
  );
}

function PhotoTiles({ photos, onTap }: { photos: string[]; onTap?: (i: number) => void }) {
  const tiles = useTileGeos();
  const textures = useLoader(THREE.TextureLoader, photos);

  return (
    <>
      {tiles.map((t, i) => {
        const u = i % textures.length;
        return (
          <FlyIn key={i} index={i}>
            <TileShell geos={t} map={textures[u]}
              onClick={(e) => {
                e.stopPropagation();
                if (e.delta < 8 && onTap) onTap(u); // kéo xoay thì không tính là chạm
              }} />
          </FlyIn>
        );
      })}
    </>
  );
}

/** Group bọc cầu + vòng quỹ đạo: hover phóng 1.03 (lerp mượt), mọi thứ scale cùng nhau. */
function SphereGroup({ hovered, children }: { hovered: boolean; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const s = hovered ? 1.03 : 1;
    ref.current?.scale.lerp(target.set(s, s, s), Math.min(1, dt * 6));
  });
  return <group ref={ref}>{children}</group>;
}

export interface SphereSceneProps {
  photos: string[];
  isPlaceholder: boolean;
  /** Màu chủ đề — dùng cho viền ô placeholder. */
  secondary: string;
  accent: string;
  /** CSS filter của ảnh (grayscale/sepia…) — áp lên cả canvas. */
  filter?: string;
  onTap?: (index: number) => void;
}

export function SphereScene({ photos, isPlaceholder, secondary, accent, filter, onTap }: SphereSceneProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="absolute inset-0"
      style={{ filter: filter && filter !== 'none' ? filter : undefined }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
    >
      <Canvas flat dpr={[1, 2]} gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.6, 3.05], fov: 46, near: 0.01, far: 30 }}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        {/* Fog màu nền: ảnh phía sau chìm dần vào bóng tối → chiều sâu */}
        <fog attach="fog" args={[accent, 2.7, 4.5]} />

        <SphereGroup hovered={hovered}>
          <Suspense fallback={<PlaceholderTiles secondary={secondary} />}>
            {isPlaceholder
              ? <PlaceholderTiles secondary={secondary} />
              : <PhotoTiles photos={photos} onTap={onTap} />}
          </Suspense>
        </SphereGroup>

        {/* Kéo xoay (damping = quán tính) · zoom vào tận trong lòng cầu · tự xoay ~30s/vòng, dừng khi hover */}
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.55}
          autoRotate={!hovered} autoRotateSpeed={2}
          minDistance={0.12} maxDistance={4.4} />
      </Canvas>
    </div>
  );
}
