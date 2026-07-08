/**
 * Dàn item lên trang A4 theo lưới — NGUỒN SỰ THẬT DUY NHẤT cho bố cục in.
 * Dùng chung cho /keychain (in hàng loạt) và export-print-pdf (in theo đơn).
 *
 * Việc "vẽ gì" do caller quyết định qua callback drawFront/drawBack (embed ảnh),
 * còn toàn bộ toán vị trí (cột/hàng, ngắt trang, gộp nhóm, lật mặt sau) nằm ở đây.
 */
import type { PDFDocument, PDFPage } from 'pdf-lib';
import { mmToPt, A4_W_PT, A4_H_PT, PRINT_SHEET, GAP_BY_SHAPE } from '@/configs/print';
import type { PrintShape } from '@/configs/types';

export interface GridBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridItem {
  /** Kích thước item trên trang (điểm PDF). */
  widthPt: number;
  heightPt: number;
  /** Hình dạng — để tra khoảng cách GAP_BY_SHAPE. */
  shape: PrintShape;
  /** Item cùng groupKey được gộp chung nhóm (cùng cỡ, cùng trang). */
  groupKey: string;
  /** Vẽ mặt trước vào ô đã tính. */
  drawFront: (page: PDFPage, box: GridBox) => void | Promise<void>;
  /** Nếu có → item in 2 mặt: vẽ mặt sau (đã lật ngang) lên trang sau. */
  drawBack?: (page: PDFPage, box: GridBox) => void | Promise<void>;
}

interface Cursor {
  page: PDFPage;
  topUsed: number;
}

interface BackRecord {
  box: GridBox;
  draw: (page: PDFPage, box: GridBox) => void | Promise<void>;
}

const MARGIN_PT = mmToPt(PRINT_SHEET.marginMm);
const GROUP_GAP_PT = mmToPt(PRINT_SHEET.groupGapMm);

function groupByKey(items: GridItem[]): GridItem[][] {
  const map = new Map<string, GridItem[]>();
  for (const item of items) {
    if (!map.has(item.groupKey)) map.set(item.groupKey, []);
    map.get(item.groupKey)!.push(item);
  }
  return Array.from(map.values());
}

/**
 * Dàn toàn bộ items lên A4 (tạo trang trong pdfDoc). Sau các trang mặt trước,
 * sinh trang mặt sau cho mỗi trang có item 2 mặt (lật ngang theo cạnh dài).
 */
export async function layoutGridA4(pdfDoc: PDFDocument, items: GridItem[]): Promise<void> {
  const groups = groupByKey(items);
  const usableH = A4_H_PT - 2 * MARGIN_PT;

  // Mỗi trang mặt trước → danh sách item 2 mặt đã đặt trên đó.
  const frontPageDuplex = new Map<PDFPage, BackRecord[]>();

  let cursor: Cursor | null = null;

  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    const itemW = group[0].widthPt;
    const itemH = group[0].heightPt;
    const gapPt = mmToPt(GAP_BY_SHAPE[group[0].shape] ?? 3);
    const usableW = A4_W_PT - 2 * MARGIN_PT;
    const cols = Math.max(1, Math.floor((usableW + gapPt) / (itemW + gapPt)));

    if (cursor && g > 0) {
      cursor.topUsed += GROUP_GAP_PT;
      if (cursor.topUsed + itemH > usableH) cursor = null;
    }

    let i = 0;
    while (i < group.length) {
      if (!cursor) {
        cursor = { page: pdfDoc.addPage([A4_W_PT, A4_H_PT]), topUsed: 0 };
      }

      const remaining = usableH - cursor.topUsed;
      const rowsFit = Math.floor((remaining + gapPt) / (itemH + gapPt));
      if (rowsFit <= 0) { cursor = null; continue; }

      const chunk = group.slice(i, i + rowsFit * cols);
      const actualRows = Math.ceil(chunk.length / cols);

      for (let j = 0; j < chunk.length; j++) {
        const col = j % cols;
        const row = Math.floor(j / cols);
        const x = MARGIN_PT + col * (itemW + gapPt);
        const y = A4_H_PT - MARGIN_PT - cursor.topUsed - (row + 1) * itemH - row * gapPt;
        const box: GridBox = { x, y, width: itemW, height: itemH };

        await chunk[j].drawFront(cursor.page, box);

        if (chunk[j].drawBack) {
          if (!frontPageDuplex.has(cursor.page)) frontPageDuplex.set(cursor.page, []);
          frontPageDuplex.get(cursor.page)!.push({ box, draw: chunk[j].drawBack! });
        }
      }

      cursor.topUsed += actualRows * (itemH + gapPt);
      i += chunk.length;
    }
  }

  // Trang mặt sau — lật ngang mỗi item để khớp khi lật giấy theo cạnh dài.
  for (const [, backItems] of frontPageDuplex) {
    if (!backItems.length) continue;
    const backPage = pdfDoc.addPage([A4_W_PT, A4_H_PT]);
    for (const { box, draw } of backItems) {
      const xMirrored = A4_W_PT - box.x - box.width;
      await draw(backPage, { ...box, x: xMirrored });
    }
  }
}
