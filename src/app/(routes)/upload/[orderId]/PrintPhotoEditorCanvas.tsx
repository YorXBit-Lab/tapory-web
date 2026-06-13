'use client'

import { useEffect, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Circle } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'

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
  const [image, status] = useImage(imageUrl)
  const initialized = useRef(false)
  const onChangeRef = useRef(onChange)

  useEffect(() => { onChangeRef.current = onChange })
  useEffect(() => { initialized.current = false }, [imageUrl])

  useEffect(() => {
    if (status !== 'loaded' || !image || initialized.current) return
    initialized.current = true
    onChangeRef.current(computeCover(image.naturalWidth, image.naturalHeight, W, H))
  }, [status, image, W, H])

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) =>
    onChange({ ...state!, x: e.target.x(), y: e.target.y() })

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    if (!state) return
    const factor = e.evt.deltaY < 0 ? 1.06 : 1 / 1.06
    const newScale = Math.max(0.1, Math.min(20, state.scale * factor))
    const stage = e.target.getStage()!
    const { x: px, y: py } = stage.getPointerPosition()!
    const ratio = newScale / state.scale
    onChange({ scale: newScale, x: px - (px - state.x) * ratio, y: py - (py - state.y) * ratio })
  }

  const clipFn = isCircle
    ? (ctx: CanvasRenderingContext2D) => { ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2) }
    : (ctx: CanvasRenderingContext2D) => { ctx.rect(0, 0, W, H) }

  return (
    <Stage width={W} height={H} onWheel={handleWheel} style={{ cursor: 'grab', display: 'block' }}>
      <Layer clipFunc={clipFn}>
        {image && state && (
          <KonvaImage
            image={image}
            x={state.x} y={state.y}
            scaleX={state.scale} scaleY={state.scale}
            draggable
            onDragEnd={handleDragEnd}
          />
        )}
      </Layer>
      <Layer listening={false}>
        {isCircle
          ? <Circle x={W / 2} y={H / 2} radius={W / 2} stroke="#f59e0b" strokeWidth={1.5} />
          : <Rect x={0} y={0} width={W} height={H} stroke="#f59e0b" strokeWidth={1.5} />
        }
      </Layer>
    </Stage>
  )
}
