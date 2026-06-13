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
import type { KeychainTemplate, FitMode } from '@/features/keychain/types'

const FIT_LABELS: Record<FitMode, string> = {
  cover:   'Lấp đầy',
  contain: 'Vừa khít',
  stretch: 'Kéo giãn',
}

function LayoutInfo({ template }: { template: KeychainTemplate }) {
  const gapMm  = GAP_BY_SHAPE[template.id] ?? 3
  const gap    = mmToPt(gapMm)
  const margin = mmToPt(8)
  const itemW  = mmToPt(template.widthCm  * 10)
  const itemH  = mmToPt(template.heightCm * 10)
  const cols   = Math.max(1, Math.floor((A4_W_PT - 2 * margin + gap) / (itemW + gap)))
  const rows   = Math.max(1, Math.floor((A4_H_PT - 2 * margin + gap) / (itemH + gap)))
  return (
    <p className="text-xs text-content3">
      {template.widthCm}×{template.heightCm} cm · gap {gapMm}mm →&nbsp;
      {cols}×{rows} = <strong>{cols * rows}</strong> cái / trang A4
    </p>
  )
}

export default function KeychainPage() {
  const [defaultTemplate, setDefaultTemplate] = useState<KeychainTemplate>(KEYCHAIN_TEMPLATES[0])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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
    batchApplyFitMode,
    toggleDuplex,
    markPrinted,
  } = useKeychainImages()

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleBatchFit = (fitMode: FitMode) => {
    batchApplyFitMode([...selectedIds], fitMode)
    setSelectedIds(new Set())
  }

  const { exportPDF, exporting, progress } = useExportPDF()

  const readyCount = unprintedImages.filter((i) => i.editorState !== null).length

  const templateSummary = KEYCHAIN_TEMPLATES
    .map((t) => ({ t, count: images.filter((i) => i.template.id === t.id && !i.printed).length }))
    .filter(({ count }) => count > 0)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-content1">In ảnh móc khóa</h1>
          <p className="text-sm text-content2">Upload ảnh · Chọn template từng ảnh · Chỉnh sửa · Xuất PDF 300 DPI</p>
        </div>

        {/* Step 1 — Upload + default template */}
        <section className="rounded-xl bg-elevated p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-content2">
            1. Upload ảnh
          </h2>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-content3">Template mặc định khi upload:</span>
            {KEYCHAIN_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setDefaultTemplate(t)}
                className={clsx(
                  'rounded-md border px-3 py-1 text-xs font-medium transition',
                  defaultTemplate.id === t.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-content2 hover:border-primary/50',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 transition hover:border-primary hover:bg-primary/5"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addImages(Array.from(e.dataTransfer.files), defaultTemplate) }}
          >
            <Upload size={28} className="text-content3" />
            <p className="text-sm text-content2">Kéo thả hoặc click để chọn nhiều ảnh</p>
            <p className="text-xs text-content3">JPG · PNG · WEBP</p>
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
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    selectedIds.size === images.length
                      ? setSelectedIds(new Set())
                      : setSelectedIds(new Set(images.map((i) => i.id)))
                  }
                  className="text-xs text-primary hover:underline"
                >
                  {selectedIds.size === images.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
                <span className="text-xs text-content4">·</span>
                <span className="text-xs text-content3">{images.length} ảnh</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((img) => {
                  const isSelected = selectedIds.has(img.id)
                  return (
                    <div
                      key={img.id}
                      className={clsx(
                        'relative cursor-pointer overflow-hidden rounded-lg border-2 transition',
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30'
                          : activeId === img.id
                            ? 'border-primary/60 ring-2 ring-primary/20'
                            : 'border-transparent hover:border-border',
                      )}
                      style={{ width: 72, height: 72 }}
                      onClick={() => setActiveId(img.id)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />

                      {/* Checkbox top-left */}
                      <button
                        className={clsx(
                          'absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded border transition',
                          isSelected
                            ? 'border-primary bg-primary text-background'
                            : 'border-white/70 bg-black/30 text-transparent hover:bg-black/50',
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleSelect(img.id) }}
                        title="Chọn nhiều"
                      >
                        {isSelected && <span className="text-[9px] font-bold leading-none">✓</span>}
                      </button>

                      {/* Bottom bar: template + duplex toggle */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/55 px-1">
                        <span className="text-[9px] leading-4 text-white/80">
                          {img.template.id === 'rectangle' ? 'rect' : img.template.id === 'square' ? 'sq' : 'circ'}
                        </span>
                        <button
                          className={clsx(
                            'rounded px-1 text-[9px] font-bold leading-4 transition',
                            img.duplex
                              ? 'bg-warning text-background'
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
                          <CheckCircle2 size={20} className="text-success" />
                        </div>
                      )}
                      <button
                        className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white transition hover:bg-black/70"
                        onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Batch action bar */}
              {selectedIds.size > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm">
                  <span className="font-medium text-primary">{selectedIds.size} ảnh đã chọn</span>
                  <span className="text-content3">·</span>
                  <span className="text-content2">Áp dụng scale:</span>
                  {(['cover', 'contain', 'stretch'] as FitMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleBatchFit(mode)}
                      className="rounded-md border border-primary/30 bg-background px-2.5 py-0.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                    >
                      {FIT_LABELS[mode]}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="ml-auto text-content3 hover:text-content1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Step 2 — Editor */}
        {activeImage ? (
          <section className="rounded-xl bg-elevated p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-content2">
              2. Chỉnh sửa ảnh
            </h2>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-content3">Khung ảnh này:</span>
              {KEYCHAIN_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateTemplate(activeImage.id, t)}
                  className={clsx(
                    'rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition',
                    activeImage.template.id === t.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-content2 hover:border-primary/50',
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
          <section className="rounded-xl bg-elevated p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-content2">
              2. Chỉnh sửa ảnh
            </h2>
            <p className="text-sm text-content3">Chọn một ảnh ở trên để bắt đầu chỉnh sửa</p>
          </section>
        ) : null}

        {/* Step 3 — Export */}
        {images.length > 0 && (
          <section className="rounded-xl bg-elevated p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-content2">
              3. Xuất PDF
            </h2>

            {templateSummary.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {templateSummary.map(({ t, count }) => (
                  <span key={t.id} className="rounded-md bg-divider px-2 py-1 text-xs text-content2">
                    {t.label}: <strong>{count}</strong> ảnh
                  </span>
                ))}
                {templateSummary.length > 1 && (
                  <span className="self-center text-xs text-content3">→ xuất thành {templateSummary.length} nhóm trang riêng</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => exportPDF(images, markPrinted)}
                disabled={readyCount === 0 || exporting}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-background transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                <span className="text-sm text-success">
                  ✓ {images.filter((i) => i.printed).length} ảnh đã in
                </span>
              )}
              {unprintedImages.length === 0 && images.length > 0 && (
                <span className="text-sm font-medium text-success">Tất cả đã in xong!</span>
              )}
            </div>

            {readyCount === 0 && unprintedImages.length > 0 && (
              <p className="mt-2 text-xs text-content3">
                Chọn ảnh và điều chỉnh vị trí trước khi xuất
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
