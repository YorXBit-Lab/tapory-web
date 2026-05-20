import { useState, useCallback } from 'react'
import type { KeychainImage, KeychainTemplate, ImageEditorState } from '../types'
import { EDITOR_PX_PER_CM } from '../constants'

function computeCoverFit(
  imageUrl: string,
  template: KeychainTemplate,
): Promise<ImageEditorState> {
  const W = Math.round(template.widthCm  * EDITOR_PX_PER_CM)
  const H = Math.round(template.heightCm * EDITOR_PX_PER_CM)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
      resolve({
        x:     (W - img.naturalWidth  * scale) / 2,
        y:     (H - img.naturalHeight * scale) / 2,
        scale,
      })
    }
    img.src = imageUrl
  })
}

export function useKeychainImages() {
  const [images,   setImages]   = useState<KeychainImage[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const addImages = useCallback(async (files: File[], defaultTemplate: KeychainTemplate) => {
    const valid = files.filter((f) => f.type.startsWith('image/'))
    if (valid.length === 0) return

    const next: KeychainImage[] = await Promise.all(
      valid.map(async (file) => {
        const previewUrl   = URL.createObjectURL(file)
        const editorState  = await computeCoverFit(previewUrl, defaultTemplate)
        return {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          printed:     false,
          template:    defaultTemplate,
          duplex:      false,
          editorState,
          exportedPng: null,
        }
      }),
    )

    setImages((prev) => [...prev, ...next])
    setActiveId((prev) => prev ?? next[0].id)
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const updateTemplate = useCallback(async (id: string, template: KeychainTemplate) => {
    // Recompute editorState for the new frame size immediately
    const img = images.find((i) => i.id === id)
    if (!img) return
    const editorState = await computeCoverFit(img.previewUrl, template)
    setImages((prev) =>
      prev.map((i) => i.id === id ? { ...i, template, editorState } : i),
    )
  }, [images])

  const updateEditorState = useCallback((id: string, state: ImageEditorState) =>
    setImages((prev) =>
      prev.map((img) => img.id === id ? { ...img, editorState: state } : img),
    ), [])

  const toggleDuplex = useCallback((id: string) =>
    setImages((prev) =>
      prev.map((img) => img.id === id ? { ...img, duplex: !img.duplex } : img),
    ), [])

  const markPrinted = useCallback((ids: string[]) =>
    setImages((prev) =>
      prev.map((img) => ids.includes(img.id) ? { ...img, printed: true } : img),
    ), [])

  const activeImage     = images.find((i) => i.id === activeId) ?? null
  const unprintedImages = images.filter((i) => !i.printed)

  return {
    images,
    activeId,
    activeImage,
    unprintedImages,
    setActiveId,
    addImages,
    removeImage,
    updateTemplate,
    updateEditorState,
    toggleDuplex,
    markPrinted,
  }
}
