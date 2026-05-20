'use client'

import { useRef, useState } from 'react'
import { Upload, X, CheckCircle2, Download, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { KeychainEditor }     from '@/features/keychain/components/KeychainEditor'
import { useKeychainImages }  from '@/features/keychain/hooks/useKeychainImages'
import { useExportPDF }       from '@/features/keychain/hooks/useExportPDF'
import { KEYCHAIN_TEMPLATES } from '@/features/keychain/constants'
import { GAP_BY_SHAPE }       from '@/features/keychain/utils/pdfLayout'
import { mmToPt, A4_W_PT, A4_H_PT } from '@/features/keychain/utils/dpi'
import type { KeychainTemplate } from '@/features/keychain/types'

function LayoutInfo({ template }: { template: KeychainTemplate }) {
  const gapMm  = GAP_BY_SHAPE[template.id] ?? 3
  const gap    = mmToPt(gapMm)
  const margin = mmToPt(8)
  const itemW  = mmToPt(template.widthCm  * 10)
  const itemH  = mmToPt(template.heightCm * 10)
  const cols   = Math.max(1, Math.floor((A4_W_PT - 2 * margin + gap) / (itemW + gap)))
  const rows   = Math.max(1, Math.floor((A4_H_PT - 2 * margin + gap) / (itemH + gap)))
  return (
    <p className="text-xs text-gray-400">
      {template.widthCm}×{template.heightCm} cm · gap {gapMm}mm →&nbsp;
      {cols}×{rows} = <strong>{cols * rows}</strong> cái / trang A4
    </p>
  )
}

export default function KeychainPage() {
  // Default template for newly uploaded images
  const [defaultTemplate, setDefaultTemplate] = useState<KeychainTemplate>(KEYCHAIN_TEMPLATES[0])
  const inputRef = useRef<HTMLInputElement>(null)

  const {
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
  } = useKeychainImages()

  const { exportPDF, exporting, progress } = useExportPDF()

  const readyCount = unprintedImages.filter((i) => i.editorState !== null).length

  // Summary of how many images per template type
  const templateSummary = KEYCHAIN_TEMPLATES
    .map((t) => ({ t, count: images.filter((i) => i.template.id === t.id && !i.printed).length }))
    .filter(({ count }) => count > 0)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">In ảnh móc khóa</h1>
          <p className="text-sm text-gray-500">Upload ảnh · Chọn template từng ảnh · Chỉnh sửa · Xuất PDF 300 DPI</p>
        </div>

        {/* Step 1 — Upload + default template */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            1. Upload ảnh
          </h2>

          {/* Default template for new uploads */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">Template mặc định khi upload:</span>
            {KEYCHAIN_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setDefaultTemplate(t)}
                className={clsx(
                  'rounded-md border px-3 py-1 text-xs font-medium transition',
                  defaultTemplate.id === t.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-8 transition hover:border-blue-400 hover:bg-blue-50/30"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addImages(Array.from(e.dataTransfer.files), defaultTemplate) }}
          >
            <Upload size={28} className="text-gray-400" />
            <p className="text-sm text-gray-500">Kéo thả hoặc click để chọn nhiều ảnh</p>
            <p className="text-xs text-gray-400">JPG · PNG · WEBP</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addImages(Array.from(e.target.files ?? []), defaultTemplate)}
            />
          </div>

          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={clsx(
                    'relative cursor-pointer overflow-hidden rounded-lg border-2 transition',
                    activeId === img.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-transparent hover:border-gray-300',
                  )}
                  style={{ width: 72, height: 72 }}
                  onClick={() => setActiveId(img.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />

                  {/* Bottom bar: template + duplex toggle */}
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/55 px-1">
                    <span className="text-[9px] leading-4 text-white/80">
                      {img.template.id === 'rectangle' ? 'rect' : img.template.id === 'square' ? 'sq' : 'circ'}
                    </span>
                    <button
                      className={clsx(
                        'rounded px-1 text-[9px] font-bold leading-4 transition',
                        img.duplex
                          ? 'bg-yellow-400 text-black'
                          : 'text-white/60 hover:text-white',
                      )}
                      onClick={(e) => { e.stopPropagation(); toggleDuplex(img.id) }}
                      title="In 2 mặt"
                    >
                      2M
                    </button>
                  </div>

                  {img.printed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <CheckCircle2 size={20} className="text-green-400" />
                    </div>
                  )}
                  <button
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white transition hover:bg-black/70"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Step 2 — Editor (template selector is per image, inside this section) */}
        {activeImage ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              2. Chỉnh sửa ảnh
            </h2>

            {/* Per-image template selector */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400">Khung ảnh này:</span>
              {KEYCHAIN_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateTemplate(activeImage.id, t)}
                  className={clsx(
                    'rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition',
                    activeImage.template.id === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  )}
                >
                  {t.label}
                </button>
              ))}
              <LayoutInfo template={activeImage.template} />
            </div>

            <KeychainEditor
              imageUrl={activeImage.previewUrl}
              template={activeImage.template}
              editorState={activeImage.editorState}
              onChange={(s) => updateEditorState(activeImage.id, s)}
            />
          </section>
        ) : images.length > 0 ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              2. Chỉnh sửa ảnh
            </h2>
            <p className="text-sm text-gray-400">Chọn một ảnh ở trên để bắt đầu chỉnh sửa</p>
          </section>
        ) : null}

        {/* Step 3 — Export */}
        {images.length > 0 && (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              3. Xuất PDF
            </h2>

            {/* Summary per template */}
            {templateSummary.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {templateSummary.map(({ t, count }) => (
                  <span key={t.id} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {t.label}: <strong>{count}</strong> ảnh
                  </span>
                ))}
                {templateSummary.length > 1 && (
                  <span className="text-xs text-gray-400 self-center">→ xuất thành {templateSummary.length} nhóm trang riêng</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => exportPDF(images, markPrinted)}
                disabled={readyCount === 0 || exporting}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Download size={18} />
                }
                {exporting
                  ? `Đang xuất... ${progress}%`
                  : `Xuất PDF (${readyCount} ảnh)`
                }
              </button>

              {images.filter((i) => i.printed).length > 0 && (
                <span className="text-sm text-green-600">
                  ✓ {images.filter((i) => i.printed).length} ảnh đã in
                </span>
              )}
              {unprintedImages.length === 0 && images.length > 0 && (
                <span className="text-sm font-medium text-green-600">Tất cả đã in xong!</span>
              )}
            </div>

            {readyCount === 0 && unprintedImages.length > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                Chọn ảnh và điều chỉnh vị trí trước khi xuất
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
