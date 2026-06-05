'use client'

import { useEffect, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Circle } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
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
  const [image, status] = useImage(imageUrl, 'anonymous')
  const W = Math.round(template.widthCm  * EDITOR_PX_PER_CM)
  const H = Math.round(template.heightCm * EDITOR_PX_PER_CM)
  const isCircle = template.id === 'circle'

  const appliedRef = useRef<{ fitMode: FitMode; W: number; H: number } | null>(null)

  // Re-fit when image loads, template changes, or fitMode changes
  useEffect(() => {
    if (status !== 'loaded' || !image) return
    const fitMode = editorState?.fitMode ?? 'cover'
    const prev = appliedRef.current
    if (prev?.fitMode === fitMode && prev.W === W && prev.H === H) return
    appliedRef.current = { fitMode, W, H }
    onChange({ ...computeFit(fitMode, image.naturalWidth, image.naturalHeight, W, H), fitMode })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, image, W, H, editorState?.fitMode])

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) =>
    onChange({ ...editorState!, x: e.target.x(), y: e.target.y() })

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    if (!editorState) return
    const factor    = e.evt.deltaY < 0 ? 1.06 : 1 / 1.06
    const newScale  = Math.max(0.05, Math.min(30, editorState.scale * factor))
    const stage     = e.target.getStage()!
    const { x: px, y: py } = stage.getPointerPosition()!
    const ratio     = newScale / editorState.scale
    onChange({
      scale:   newScale,
      scaleY:  editorState.scaleY != null ? editorState.scaleY * factor : undefined,
      x:       px - (px - editorState.x) * ratio,
      y:       py - (py - editorState.y) * ratio,
      fitMode: editorState.fitMode,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clipFn = isCircle
    ? (ctx: any) => { ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2) }
    : (ctx: any) => { ctx.rect(0, 0, W, H) }

  return (
    <Stage width={W} height={H} onWheel={handleWheel} style={{ cursor: 'grab' }}>
      {/* Image layer — clipped to template shape */}
      <Layer clipFunc={clipFn}>
        {image && editorState && (
          <KonvaImage
            image={image}
            x={editorState.x}
            y={editorState.y}
            scaleX={editorState.scale}
            scaleY={editorState.scaleY ?? editorState.scale}
            draggable
            onDragEnd={handleDragEnd}
          />
        )}
      </Layer>
      {/* Border overlay — not clipped, no pointer events */}
      <Layer listening={false}>
        {isCircle ? (
          <Circle
            x={W / 2} y={H / 2} radius={W / 2}
            stroke="#1677ff" strokeWidth={2}
          />
        ) : (
          <Rect
            x={0} y={0} width={W} height={H}
            stroke="#1677ff" strokeWidth={2}
          />
        )}
      </Layer>
    </Stage>
  )
}
