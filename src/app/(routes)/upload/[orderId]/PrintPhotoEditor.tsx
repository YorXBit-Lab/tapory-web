'use client'

import dynamic from 'next/dynamic'
import type { IPrintConfig } from '@/configs/types'
import type { PhotoEditorState } from './PrintPhotoEditorCanvas'

const Canvas = dynamic(
  () => import('./PrintPhotoEditorCanvas').then((m) => m.PrintPhotoEditorCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-md bg-amber-50" style={{ width: 120, height: 160 }} />
    ),
  },
)

const MAX_PX = 160

export function cfgToDims(cfg: IPrintConfig) {
  const isCircle = cfg.shape === 'circle'
  const wCm = isCircle
    ? (cfg.diameter ?? 3)
    : (cfg.width ?? (cfg.shape === 'square' ? 3.35 : 3.2))
  const hCm = isCircle ? wCm : (cfg.shape === 'square' ? wCm : (cfg.height ?? 5))
  const scale = MAX_PX / Math.max(wCm, hCm)
  return { W: Math.round(wCm * scale), H: Math.round(hCm * scale), isCircle }
}

interface Props {
  imageUrl: string
  cfg: IPrintConfig
  state: PhotoEditorState | null
  onChange: (s: PhotoEditorState) => void
}

export function PrintPhotoEditor({ imageUrl, cfg, state, onChange }: Props) {
  const { W, H, isCircle } = cfgToDims(cfg)

  return (
    <div
      className={`overflow-hidden shadow-sm ring-1 ring-border ${isCircle ? 'rounded-full' : 'rounded-md'}`}
      style={{ width: W, height: H }}
    >
      <Canvas imageUrl={imageUrl} W={W} H={H} isCircle={isCircle} state={state} onChange={onChange} />
    </div>
  )
}
