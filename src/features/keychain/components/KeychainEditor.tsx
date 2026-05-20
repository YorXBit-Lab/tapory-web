'use client'

import dynamic from 'next/dynamic'
import type { KeychainTemplate, ImageEditorState } from '../types'
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

interface Props {
  imageUrl:    string
  template:    KeychainTemplate
  editorState: ImageEditorState | null
  onChange:    (s: ImageEditorState) => void
}

export function KeychainEditor({ template, ...rest }: Props) {
  const W = Math.round(template.widthCm  * EDITOR_PX_PER_CM)
  const H = Math.round(template.heightCm * EDITOR_PX_PER_CM)

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-gray-400">
        Scroll để zoom · Kéo để di chuyển · {template.widthCm}×{template.heightCm} cm
      </p>
      <div
        className="overflow-hidden rounded-lg shadow-md"
        style={{ width: W, height: H }}
      >
        <KeychainEditorCanvas template={template} {...rest} />
      </div>
    </div>
  )
}
