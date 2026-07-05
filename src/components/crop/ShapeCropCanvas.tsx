'use client'

import { useEffect, useRef } from 'react'
import { Stage, Layer, Image as KonvaImage, Rect, Circle } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'

/**
 * Canvas crop dùng chung (react-konva): hiển thị ảnh trong khung tròn/chữ nhật,
 * kéo để di chuyển, cuộn để zoom quanh con trỏ. KHÔNG chứa chính sách "fit" —
 * việc tính vị trí ban đầu do wrapper quyết qua onImageLoad, nhờ đó dùng được
 * cho cả editor in theo đơn lẫn editor móc khóa.
 */

export interface CropTransform {
  x: number
  y: number
  scale: number
  scaleY?: number // chỉ dùng khi kéo giãn (stretch)
}

interface Props {
  imageUrl: string
  W: number
  H: number
  isCircle: boolean
  state: CropTransform | null
  onChange: (s: CropTransform) => void
  borderColor?: string
  borderWidth?: number
  minScale?: number
  maxScale?: number
  crossOrigin?: 'anonymous'
  /** Gọi khi ảnh vừa load xong — wrapper dùng để tính fit ban đầu. */
  onImageLoad?: (imgW: number, imgH: number) => void
}

export function ShapeCropCanvas({
  imageUrl,
  W,
  H,
  isCircle,
  state,
  onChange,
  borderColor = '#1677ff',
  borderWidth = 2,
  minScale = 0.1,
  maxScale = 20,
  crossOrigin,
  onImageLoad,
}: Props) {
  const [image, status] = useImage(imageUrl, crossOrigin)
  const onLoadRef = useRef(onImageLoad)
  useEffect(() => { onLoadRef.current = onImageLoad })

  useEffect(() => {
    if (status !== 'loaded' || !image) return
    onLoadRef.current?.(image.naturalWidth, image.naturalHeight)
  }, [status, image, imageUrl])

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!state) return
    onChange({ x: e.target.x(), y: e.target.y(), scale: state.scale, scaleY: state.scaleY })
  }

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    if (!state) return
    const factor = e.evt.deltaY < 0 ? 1.06 : 1 / 1.06
    const newScale = Math.max(minScale, Math.min(maxScale, state.scale * factor))
    const stage = e.target.getStage()!
    const { x: px, y: py } = stage.getPointerPosition()!
    const ratio = newScale / state.scale
    onChange({
      scale: newScale,
      scaleY: state.scaleY != null ? state.scaleY * factor : undefined,
      x: px - (px - state.x) * ratio,
      y: py - (py - state.y) * ratio,
    })
  }

  const clipFn = isCircle
    ? (ctx: Konva.Context) => { ctx.arc(W / 2, H / 2, W / 2, 0, Math.PI * 2) }
    : (ctx: Konva.Context) => { ctx.rect(0, 0, W, H) }

  return (
    <Stage width={W} height={H} onWheel={handleWheel} style={{ cursor: 'grab', display: 'block' }}>
      <Layer clipFunc={clipFn}>
        {image && state && (
          <KonvaImage
            image={image}
            x={state.x}
            y={state.y}
            scaleX={state.scale}
            scaleY={state.scaleY ?? state.scale}
            draggable
            onDragEnd={handleDragEnd}
          />
        )}
      </Layer>
      <Layer listening={false}>
        {isCircle ? (
          <Circle x={W / 2} y={H / 2} radius={W / 2} stroke={borderColor} strokeWidth={borderWidth} />
        ) : (
          <Rect x={0} y={0} width={W} height={H} stroke={borderColor} strokeWidth={borderWidth} />
        )}
      </Layer>
    </Stage>
  )
}
