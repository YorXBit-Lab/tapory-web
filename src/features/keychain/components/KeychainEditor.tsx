'use client'

import dynamic from 'next/dynamic'
import { Segmented } from 'antd'
import type { KeychainTemplate, ImageEditorState, FitMode } from '../types'
import { EDITOR_PX_PER_CM } from '../constants'

const KeychainEditorCanvas = dynamic(
  () => import('./KeychainEditorCanvas').then((m) => m.KeychainEditorCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-lg bg-gray-200" style={{ width: 400, height: 300 }} />
    ),
  },
)

const FIT_OPTIONS: { label: string; value: FitMode }[] = [
  { label: 'Lấp đầy', value: 'cover' },
  { label: 'Vừa khít', value: 'contain' },
  { label: 'Kéo giãn', value: 'stretch' },
]

interface Props {
  imageUrl:    string
  template:    KeychainTemplate
  editorState: ImageEditorState | null
  onChange:    (s: ImageEditorState) => void
}

export function KeychainEditor({ template, editorState, onChange, ...rest }: Props) {
  const W = Math.round(template.widthCm  * EDITOR_PX_PER_CM)
  const H = Math.round(template.heightCm * EDITOR_PX_PER_CM)

  const handleFitMode = (mode: FitMode) =>
    onChange({ ...(editorState ?? { x: 0, y: 0, scale: 1, fitMode: 'cover' }), fitMode: mode })

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-400">
        Scroll để zoom · Kéo để di chuyển · {template.widthCm}×{template.heightCm} cm
      </p>
      <Segmented
        size="small"
        options={FIT_OPTIONS}
        value={editorState?.fitMode ?? 'cover'}
        onChange={(v) => handleFitMode(v as FitMode)}
      />
      <div
        className="overflow-hidden rounded-lg shadow-md"
        style={{ width: W, height: H }}
      >
        <KeychainEditorCanvas template={template} editorState={editorState} onChange={onChange} {...rest} />
      </div>
    </div>
  )
}
