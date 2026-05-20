import type { KeychainTemplate } from './types'

export const PRINT_DPI        = 300
export const EDITOR_PX_PER_CM = 80 // 80px = 1cm on screen

export const KEYCHAIN_TEMPLATES: KeychainTemplate[] = [
  { id: 'rectangle', label: 'Chữ nhật 3.4×5 cm', widthCm: 3.4, heightCm: 5 },
  { id: 'square',    label: 'Vuông 5×5 cm',       widthCm: 5, heightCm: 5   },
  { id: 'circle',    label: 'Tròn ∅3 cm',         widthCm: 3, heightCm: 3   },
]
