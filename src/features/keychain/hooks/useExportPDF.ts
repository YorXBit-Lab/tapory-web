import { useState } from 'react'
import { exportImageToPng }   from '../utils/canvasExport'
import { layoutAndExportPDF } from '../utils/pdfLayout'
import type { KeychainImage } from '../types'

export function useExportPDF() {
  const [exporting, setExporting] = useState(false)
  const [progress,  setProgress]  = useState(0)

  const exportPDF = async (
    images:    KeychainImage[],
    onSuccess: (ids: string[]) => void,
  ) => {
    const queue = images.filter((img) => !img.printed && img.editorState !== null)
    if (queue.length === 0) return

    setExporting(true)
    setProgress(0)

    try {
      const exportItems = []

      for (let i = 0; i < queue.length; i++) {
        const img  = queue[i]
        const png  = await exportImageToPng(img.previewUrl, img.template, img.editorState!)
        exportItems.push({ pngDataUrl: png, template: img.template, duplex: img.duplex })
        setProgress(Math.round(((i + 1) / queue.length) * 90))
      }

      const pdfBytes = await layoutAndExportPDF(exportItems)
      setProgress(100)

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `keychain-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      onSuccess(queue.map((img) => img.id))
    } finally {
      setExporting(false)
      setProgress(0)
    }
  }

  return { exportPDF, exporting, progress }
}
