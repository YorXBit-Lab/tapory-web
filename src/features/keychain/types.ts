export type TemplateShape = 'rectangle' | 'square' | 'circle'

export interface KeychainTemplate {
  id: TemplateShape
  label: string
  widthCm: number
  heightCm: number
}

export interface KeychainImage {
  id: string
  file: File
  previewUrl: string
  printed: boolean
  template: KeychainTemplate
  duplex: boolean
  editorState: ImageEditorState | null
  exportedPng: string | null
}

export interface ImageEditorState {
  x: number
  y: number
  scale: number
}
