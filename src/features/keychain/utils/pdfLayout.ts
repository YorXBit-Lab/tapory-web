import { PDFDocument } from 'pdf-lib'
import { mmToPt, A4_W_PT, A4_H_PT, PRINT_SHEET, GAP_BY_SHAPE } from '@/configs/print'
import type { KeychainTemplate } from '../types'

const MARGIN_MM    = PRINT_SHEET.marginMm
const GROUP_GAP_MM = PRINT_SHEET.groupGapMm

// Re-export để các nơi đang import GAP_BY_SHAPE từ file này vẫn hoạt động.
export { GAP_BY_SHAPE }

export interface PdfExportItem {
  pngDataUrl: string
  template: KeychainTemplate
  duplex: boolean
}

type PdfPage = ReturnType<PDFDocument['addPage']>

interface Cursor {
  page: PdfPage
  topUsed: number
}

// Track where each duplex item was placed on its front page
interface DuplexRecord {
  x: number
  y: number
  w: number
  h: number
  pngDataUrl: string
}

export async function layoutAndExportPDF(items: PdfExportItem[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const groups = groupByTemplate(items)

  // frontPageDuplex: map from front PdfPage → list of duplex items placed on it
  const frontPageDuplex = new Map<PdfPage, DuplexRecord[]>()

  let cursor: Cursor | null = null
  for (let g = 0; g < groups.length; g++) {
    cursor = await fillGroup(pdfDoc, groups[g], cursor, g > 0, frontPageDuplex)
  }

  // Generate back pages — one per front page that has duplex items
  // Back page mirrors each item horizontally so it aligns when paper is flipped on long edge
  for (const [, duplexItems] of frontPageDuplex) {
    if (duplexItems.length === 0) continue
    const backPage = pdfDoc.addPage([A4_W_PT, A4_H_PT])
    for (const di of duplexItems) {
      // Mirror on vertical axis: x_back = pageWidth - x_front - itemWidth
      const xMirrored = A4_W_PT - di.x - di.w
      const pngImg = await pdfDoc.embedPng(dataUrlToBytes(di.pngDataUrl))
      backPage.drawImage(pngImg, { x: xMirrored, y: di.y, width: di.w, height: di.h })
    }
  }

  return pdfDoc.save()
}

function groupByTemplate(items: PdfExportItem[]): PdfExportItem[][] {
  const map = new Map<string, PdfExportItem[]>()
  for (const item of items) {
    if (!map.has(item.template.id)) map.set(item.template.id, [])
    map.get(item.template.id)!.push(item)
  }
  return Array.from(map.values())
}

async function fillGroup(
  pdfDoc: PDFDocument,
  items: PdfExportItem[],
  cursor: Cursor | null,
  isNewGroup: boolean,
  frontPageDuplex: Map<PdfPage, DuplexRecord[]>,
): Promise<Cursor> {
  const tmpl       = items[0].template
  const gapPt      = mmToPt(GAP_BY_SHAPE[tmpl.id] ?? 3)
  const marginPt   = mmToPt(MARGIN_MM)
  const groupGapPt = mmToPt(GROUP_GAP_MM)
  const itemW      = mmToPt(tmpl.widthCm  * 10)
  const itemH      = mmToPt(tmpl.heightCm * 10)
  const usableW    = A4_W_PT - 2 * marginPt
  const usableH    = A4_H_PT - 2 * marginPt
  const cols       = Math.max(1, Math.floor((usableW + gapPt) / (itemW + gapPt)))

  if (cursor && isNewGroup) {
    cursor.topUsed += groupGapPt
    if (cursor.topUsed + itemH > usableH) cursor = null
  }

  let i = 0
  while (i < items.length) {
    if (!cursor) {
      cursor = { page: pdfDoc.addPage([A4_W_PT, A4_H_PT]), topUsed: 0 }
    }

    const remainingH = usableH - cursor.topUsed
    const rowsFit    = Math.floor((remainingH + gapPt) / (itemH + gapPt))

    if (rowsFit <= 0) { cursor = null; continue }

    const chunk      = items.slice(i, i + rowsFit * cols)
    const actualRows = Math.ceil(chunk.length / cols)

    for (let j = 0; j < chunk.length; j++) {
      const col = j % cols
      const row = Math.floor(j / cols)
      const x   = marginPt + col * (itemW + gapPt)
      const y   = A4_H_PT - marginPt - cursor.topUsed - (row + 1) * itemH - row * gapPt

      const pngImg = await pdfDoc.embedPng(dataUrlToBytes(chunk[j].pngDataUrl))
      cursor.page.drawImage(pngImg, { x, y, width: itemW, height: itemH })

      // Record position for back page generation
      if (chunk[j].duplex) {
        if (!frontPageDuplex.has(cursor.page)) frontPageDuplex.set(cursor.page, [])
        frontPageDuplex.get(cursor.page)!.push({ x, y, w: itemW, h: itemH, pngDataUrl: chunk[j].pngDataUrl })
      }
    }

    cursor.topUsed += actualRows * (itemH + gapPt)
    i += chunk.length
  }

  return cursor!
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const bin = atob(dataUrl.split(',')[1])
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf
}
