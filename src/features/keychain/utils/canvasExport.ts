// Native Canvas API — NOT html2canvas
import { cmToPx } from './dpi'
import type { KeychainTemplate, ImageEditorState } from '../types'
import { PRINT_DPI, EDITOR_PX_PER_CM } from '../constants'

/**
 * Renders the editor state to a high-resolution PNG (300 DPI).
 * Scales up from display coordinates to print coordinates.
 */
export async function exportImageToPng(
  imageUrl: string,
  template: KeychainTemplate,
  state: ImageEditorState,
): Promise<string> {
  const displayW = Math.round(template.widthCm * EDITOR_PX_PER_CM)
  const printW   = cmToPx(template.widthCm,  PRINT_DPI)
  const printH   = cmToPx(template.heightCm, PRINT_DPI)
  const upscale  = printW / displayW

  const canvas = document.createElement('canvas')
  canvas.width  = printW
  canvas.height = printH
  const ctx = canvas.getContext('2d')!

  ctx.save()
  ctx.beginPath()
  if (template.id === 'circle') {
    ctx.arc(printW / 2, printH / 2, printW / 2, 0, Math.PI * 2)
  } else {
    ctx.rect(0, 0, printW, printH)
  }
  ctx.clip()

  const img = await loadImage(imageUrl)
  ctx.drawImage(
    img,
    state.x * upscale,
    state.y * upscale,
    img.naturalWidth  * state.scale * upscale,
    img.naturalHeight * state.scale * upscale,
  )
  ctx.restore()

  return canvas.toDataURL('image/png')
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
