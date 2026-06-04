import type { KeychainTemplate } from './types'

export const PRINT_DPI        = 300
export const EDITOR_PX_PER_CM = 80 // 80px = 1cm on screen

export const KEYCHAIN_TEMPLATES: KeychainTemplate[] = [
  { id: 'rectangle', label: 'Chữ nhật 3×4.7 cm', widthCm: 3,   heightCm: 4.7 },
  { id: 'square',    label: 'Vuông 3.3×3.3 cm',  widthCm: 3.3, heightCm: 3.3 },
  { id: 'circle',    label: 'Tròn ∅3.5 cm',      widthCm: 3.5, heightCm: 3.5 },
]
