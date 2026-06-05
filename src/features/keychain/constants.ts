import type { KeychainTemplate } from './types';

export const PRINT_DPI = 300;
export const EDITOR_PX_PER_CM = 80; // 80px = 1cm on screen

export const KEYCHAIN_TEMPLATES: KeychainTemplate[] = [
  { id: 'rectangle', label: 'Chữ nhật 3.2×5 cm', widthCm: 3.2, heightCm: 5 },
  { id: 'square', label: 'Vuông 3.35×3.35 cm', widthCm: 3.35, heightCm: 3.35 },
  { id: 'circle', label: 'Tròn ∅3 cm', widthCm: 3, heightCm: 3 },
];
