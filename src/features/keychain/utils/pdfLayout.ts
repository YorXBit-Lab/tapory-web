import { PDFDocument } from 'pdf-lib'
import { mmToPt, GAP_BY_SHAPE } from '@/configs/print'
import { layoutGridA4, type GridItem } from '@/utils/pdf-grid'
import type { KeychainTemplate } from '../types'

// Re-export để các nơi đang import GAP_BY_SHAPE từ file này vẫn hoạt động.
export { GAP_BY_SHAPE }

export interface PdfExportItem {
  pngDataUrl: string
  template: KeychainTemplate
  duplex: boolean
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.split(',')[1])
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf
}

export async function layoutAndExportPDF(items: PdfExportItem[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  const gridItems: GridItem[] = items.map((item) => {
    const bytes = dataUrlToBytes(item.pngDataUrl)
    // Mặt sau (duplex) in cùng thiết kế → dùng lại chính ảnh mặt trước.
    const draw = async (page: Parameters<GridItem['drawFront']>[0], box: Parameters<GridItem['drawFront']>[1]) => {
      const png = await pdfDoc.embedPng(bytes)
      page.drawImage(png, { x: box.x, y: box.y, width: box.width, height: box.height })
    }
    return {
      widthPt: mmToPt(item.template.widthCm * 10),
      heightPt: mmToPt(item.template.heightCm * 10),
      shape: item.template.id,
      groupKey: item.template.id,
      drawFront: draw,
      ...(item.duplex ? { drawBack: draw } : {}),
    }
  })

  await layoutGridA4(pdfDoc, gridItems)
  return pdfDoc.save()
}
