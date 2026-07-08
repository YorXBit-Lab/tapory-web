import type { KeychainTemplate } from './types';
import { PRINT_PRESETS } from '@/configs/print';

// Re-export từ nguồn sự thật chung để giữ tương thích import cũ.
export { PRINT_DPI, EDITOR_PX_PER_CM } from '@/configs/print';

/** Danh sách khung móc khóa — dẫn xuất từ PRINT_PRESETS (@/configs/print). */
export const KEYCHAIN_TEMPLATES: KeychainTemplate[] = PRINT_PRESETS.map((p) => ({
  id: p.shape,
  label: p.label,
  widthCm: p.widthCm,
  heightCm: p.heightCm,
}));
