'use client'

import { useEffect, useRef } from 'react'
import { ShapeCropCanvas } from '@/components/crop/ShapeCropCanvas'
import type { KeychainTemplate, ImageEditorState, FitMode } from '../types'
import { EDITOR_PX_PER_CM } from '../constants'

interface Props {
  imageUrl:    string
  template:    KeychainTemplate
  editorState: ImageEditorState | null
  onChange:    (s: ImageEditorState) => void
}

function computeFit(
  mode: FitMode,
  imgW: number, imgH: number,
  frameW: number, frameH: number,
): { x: number; y: number; scale: number; scaleY?: number } {
  if (mode === 'stretch') {
    return { x: 0, y: 0, scale: frameW / imgW, scaleY: frameH / imgH }
  }
  const scale = mode === 'cover'
    ? Math.max(frameW / imgW, frameH / imgH)
    : Math.min(frameW / imgW, frameH / imgH)
  return {
    x: (frameW - imgW * scale) / 2,
    y: (frameH - imgH * scale) / 2,
    scale,
  }
}

export function KeychainEditorCanvas({ imageUrl, template, editorState, onChange }: Props) {
  const W = Math.round(template.widthCm  * EDITOR_PX_PER_CM)
  const H = Math.round(template.heightCm * EDITOR_PX_PER_CM)
  const isCircle = template.id === 'circle'

  const dimsRef    = useRef<{ w: number; h: number } | null>(null)
  const appliedRef = useRef<{ fitMode: FitMode; W: number; H: number } | null>(null)

  const applyFit = () => {
    const d = dimsRef.current
    if (!d) return
    const fitMode = editorState?.fitMode ?? 'cover'
    appliedRef.current = { fitMode, W, H }
    onChange({ ...computeFit(fitMode, d.w, d.h, W, H), fitMode })
  }

  // Re-fit khi đổi template (W/H) hoặc đổi fitMode — ảnh đã load sẵn.
  useEffect(() => {
    if (!dimsRef.current) return
    const fitMode = editorState?.fitMode ?? 'cover'
    const prev = appliedRef.current
    if (prev?.fitMode === fitMode && prev.W === W && prev.H === H) return
    applyFit()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, H, editorState?.fitMode])

  return (
    <ShapeCropCanvas
      imageUrl={imageUrl}
      W={W}
      H={H}
      isCircle={isCircle}
      state={editorState}
      onChange={(t) =>
        onChange({
          x: t.x,
          y: t.y,
          scale: t.scale,
          scaleY: t.scaleY,
          fitMode: editorState?.fitMode ?? 'cover',
        })
      }
      borderColor="#1677ff"
      borderWidth={2}
      minScale={0.05}
      maxScale={30}
      crossOrigin="anonymous"
      onImageLoad={(iw, ih) => { dimsRef.current = { w: iw, h: ih }; appliedRef.current = null; applyFit() }}
    />
  )
}
