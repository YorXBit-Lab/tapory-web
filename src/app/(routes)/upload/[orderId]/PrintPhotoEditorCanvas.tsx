'use client'

import { ShapeCropCanvas } from '@/components/crop/ShapeCropCanvas'

export interface PhotoEditorState {
  x: number
  y: number
  scale: number
}

interface Props {
  imageUrl: string
  W: number
  H: number
  isCircle: boolean
  state: PhotoEditorState | null
  onChange: (s: PhotoEditorState) => void
}

function computeCover(imgW: number, imgH: number, fW: number, fH: number): PhotoEditorState {
  const scale = Math.max(fW / imgW, fH / imgH)
  return { x: (fW - imgW * scale) / 2, y: (fH - imgH * scale) / 2, scale }
}

export function PrintPhotoEditorCanvas({ imageUrl, W, H, isCircle, state, onChange }: Props) {
  return (
    <ShapeCropCanvas
      imageUrl={imageUrl}
      W={W}
      H={H}
      isCircle={isCircle}
      state={state}
      onChange={(t) => onChange({ x: t.x, y: t.y, scale: t.scale })}
      borderColor="#f59e0b"
      borderWidth={1.5}
      minScale={0.1}
      maxScale={20}
      onImageLoad={(iw, ih) => { if (!state) onChange(computeCover(iw, ih, W, H)) }}
    />
  )
}
