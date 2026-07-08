import { cmToPx } from './dpi'
import type { KeychainTemplate, ImageEditorState } from '../types'
import { PRINT_DPI, EDITOR_PX_PER_CM } from '../constants'
import { bakeCropToBlob } from '@/utils/crop-bake'

/**
 * Render editorState thành PNG 300 DPI (dataURL) để nhúng vào PDF.
 * Uỷ thác toàn bộ toán vẽ/clip cho util chung crop-bake.
 */
export async function exportImageToPng(
  imageUrl: string,
  template: KeychainTemplate,
  state: ImageEditorState,
): Promise<string> {
  const blob = await bakeCropToBlob(imageUrl, {
    displayW: Math.round(template.widthCm * EDITOR_PX_PER_CM),
    displayH: Math.round(template.heightCm * EDITOR_PX_PER_CM),
    outputW: cmToPx(template.widthCm, PRINT_DPI),
    outputH: cmToPx(template.heightCm, PRINT_DPI),
    isCircle: template.id === 'circle',
    transform: state,
  })
  return blobToDataUrl(blob)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
