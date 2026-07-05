/**
 * Nguồn sự thật duy nhất cho kích thước & bố cục in.
 * Dùng chung cho: /keychain (in hàng loạt) và /upload + export-print-pdf (in theo đơn).
 * Muốn thêm cỡ/hình mới → chỉ sửa ở đây.
 */
import type { PrintShape, IPrintConfig } from './types';

/* ── Đơn vị & khổ giấy ── */

const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;

/** mm → điểm PDF (1pt = 1/72 inch). */
export function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * 72;
}
/** cm → pixel ở một DPI cho trước. */
export function cmToPx(cm: number, dpi: number): number {
  return Math.round((cm / CM_PER_INCH) * dpi);
}

/** Độ phân giải ảnh khi xuất in. */
export const PRINT_DPI = 300;
/** Tỉ lệ hiển thị trên editor (px = cm × giá trị này). */
export const EDITOR_PX_PER_CM = 80;

/** Thông số khổ giấy in (mm) — mọi luồng dàn PDF dùng chung. */
export const PRINT_SHEET = {
  widthMm: 210, // A4
  heightMm: 297,
  marginMm: 8,
  groupGapMm: 4,
} as const;

export const A4_W_PT = mmToPt(PRINT_SHEET.widthMm);
export const A4_H_PT = mmToPt(PRINT_SHEET.heightMm);

/** Khoảng cách giữa các item theo hình dạng (mm). */
export const GAP_BY_SHAPE: Record<PrintShape, number> = {
  rectangle: 1,
  square: 1,
  circle: 5,
};

/* ── Kích thước ── */

/** Kích thước mặc định (cm) khi printConfig thiếu số đo. */
export const PRINT_DEFAULT_SIZE: Record<PrintShape, { widthCm: number; heightCm: number }> = {
  circle: { widthCm: 3, heightCm: 3 },
  square: { widthCm: 3.35, heightCm: 3.35 },
  rectangle: { widthCm: 3.2, heightCm: 5 },
};

export interface PrintSize {
  widthCm: number;
  heightCm: number;
  isCircle: boolean;
}

type SizeCfg = Pick<IPrintConfig, 'shape' | 'width' | 'height' | 'diameter'>;

/** Quy đổi printConfig → kích thước cm cụ thể (nguồn sự thật cho preview & export). */
export function resolvePrintSize(cfg: SizeCfg): PrintSize {
  const shape: PrintShape = cfg.shape ?? 'rectangle';
  const def = PRINT_DEFAULT_SIZE[shape];
  if (shape === 'circle') {
    const d = cfg.diameter ?? def.widthCm;
    return { widthCm: d, heightCm: d, isCircle: true };
  }
  if (shape === 'square') {
    const s = cfg.width ?? def.widthCm;
    return { widthCm: s, heightCm: s, isCircle: false };
  }
  return {
    widthCm: cfg.width ?? def.widthCm,
    heightCm: cfg.height ?? def.heightCm,
    isCircle: false,
  };
}

/** Khoá gộp nhóm các item cùng cỡ khi dàn PDF. */
export function printSizeKey(cfg: SizeCfg): string {
  const { widthCm, heightCm } = resolvePrintSize(cfg);
  return `${cfg.shape ?? 'rectangle'}-${widthCm}x${heightCm}`;
}

/* ── Preset đặt tên (cho công cụ /keychain) ── */

export interface PrintPreset {
  id: string;
  label: string;
  shape: PrintShape;
  widthCm: number;
  heightCm: number;
}

/** Thêm preset mới vào đây để mở rộng danh sách chọn ở /keychain. */
export const PRINT_PRESETS: PrintPreset[] = [
  { id: 'rectangle', label: 'Chữ nhật 3.2×5 cm',  shape: 'rectangle', widthCm: 3.2,  heightCm: 5 },
  { id: 'square',    label: 'Vuông 3.35×3.35 cm', shape: 'square',    widthCm: 3.35, heightCm: 3.35 },
  { id: 'circle',    label: 'Tròn ∅3 cm',         shape: 'circle',    widthCm: 3,    heightCm: 3 },
];
