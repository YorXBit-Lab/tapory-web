import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import type { IOrderItem } from '@/services/OrderAPI';
import type { IPrintPhotoSlot, IPrintConfig } from '@/configs/types';

/* ── Layout constants — mirrors /keychain pdfLayout.ts ── */
const MARGIN_MM = 8;
const GROUP_GAP_MM = 4;
const GAP_MM: Record<string, number> = { rectangle: 1, square: 1, circle: 5 };

function mmToPt(mm: number) { return (mm / 25.4) * 72; }
const A4_W_PT = mmToPt(210);
const A4_H_PT = mmToPt(297);

interface LayoutItem {
  frontBytes: Uint8Array;
  frontIsJpeg: boolean;
  backBytes?: Uint8Array;   // present for non-NFC duplex items
  backIsJpeg?: boolean;
  widthPt: number;
  heightPt: number;
  groupKey: string;
}

interface DuplexRecord {
  x: number;
  y: number;
  w: number;
  h: number;
  backBytes: Uint8Array;
  backIsJpeg: boolean;
}

type PdfPage = ReturnType<PDFDocument['addPage']>;

interface Cursor { page: PdfPage; topUsed: number; }

async function buildGrid(
  pdfDoc: PDFDocument,
  items: LayoutItem[],
  frontPageDuplex: Map<PdfPage, DuplexRecord[]>,
): Promise<void> {
  // Group by shape/size so same-size photos land on the same pages
  const groupMap = new Map<string, LayoutItem[]>();
  for (const item of items) {
    if (!groupMap.has(item.groupKey)) groupMap.set(item.groupKey, []);
    groupMap.get(item.groupKey)!.push(item);
  }
  const groups = Array.from(groupMap.values());

  const marginPt   = mmToPt(MARGIN_MM);
  const groupGapPt = mmToPt(GROUP_GAP_MM);

  let cursor: Cursor | null = null;

  for (let g = 0; g < groups.length; g++) {
    const group    = groups[g];
    const itemW    = group[0].widthPt;
    const itemH    = group[0].heightPt;
    const shapeKey = group[0].groupKey.split('-')[0];
    const gapPt    = mmToPt(GAP_MM[shapeKey] ?? 3);
    const usableW  = A4_W_PT - 2 * marginPt;
    const usableH  = A4_H_PT - 2 * marginPt;
    const cols     = Math.max(1, Math.floor((usableW + gapPt) / (itemW + gapPt)));

    if (cursor && g > 0) {
      cursor.topUsed += groupGapPt;
      if (cursor.topUsed + itemH > usableH) cursor = null;
    }

    let i = 0;
    while (i < group.length) {
      if (!cursor) {
        cursor = { page: pdfDoc.addPage([A4_W_PT, A4_H_PT]), topUsed: 0 };
      }

      const remaining = usableH - cursor.topUsed;
      const rowsFit   = Math.floor((remaining + gapPt) / (itemH + gapPt));
      if (rowsFit <= 0) { cursor = null; continue; }

      const chunk      = group.slice(i, i + rowsFit * cols);
      const actualRows = Math.ceil(chunk.length / cols);

      for (let j = 0; j < chunk.length; j++) {
        const col = j % cols;
        const row = Math.floor(j / cols);
        const x   = marginPt + col * (itemW + gapPt);
        const y   = A4_H_PT - marginPt - cursor.topUsed - (row + 1) * itemH - row * gapPt;

        const img = chunk[j].frontIsJpeg
          ? await pdfDoc.embedJpg(chunk[j].frontBytes)
          : await pdfDoc.embedPng(chunk[j].frontBytes);
        cursor.page.drawImage(img, { x, y, width: itemW, height: itemH });

        if (chunk[j].backBytes) {
          if (!frontPageDuplex.has(cursor.page)) frontPageDuplex.set(cursor.page, []);
          frontPageDuplex.get(cursor.page)!.push({
            x, y, w: itemW, h: itemH,
            backBytes: chunk[j].backBytes!,
            backIsJpeg: chunk[j].backIsJpeg ?? false,
          });
        }
      }

      cursor.topUsed += actualRows * (itemH + gapPt);
      i += chunk.length;
    }
  }
}

/* ── Helpers ── */
function isJpeg(url: string) { return /\.(jpg|jpeg)(\?|$)/i.test(url); }

function printConfigToGroupKey(cfg: IPrintConfig): { key: string; widthPt: number; heightPt: number } {
  if (cfg.shape === 'circle') {
    const d = mmToPt((cfg.diameter ?? 5) * 10);
    return { key: `circle-${cfg.diameter}`, widthPt: d, heightPt: d };
  }
  if (cfg.shape === 'square') {
    const s = mmToPt((cfg.width ?? 5) * 10);
    return { key: `square-${cfg.width}`, widthPt: s, heightPt: s };
  }
  const w = mmToPt((cfg.width ?? 5) * 10);
  const h = mmToPt((cfg.height ?? 7) * 10);
  return { key: `rectangle-${cfg.width}-${cfg.height}`, widthPt: w, heightPt: h };
}

interface OrderData {
  id: string;
  items: IOrderItem[];
  printPhotos: IPrintPhotoSlot[];
}

/* ── Route ── */
export async function POST(req: NextRequest) {
  const idToken = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/, '');
  if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const db = getAdminDb();
    const adminSnap = await db.collection('admins').doc(decoded.uid).get();
    if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: { orderIds?: string[] };
  try {
    body = (await req.json()) as { orderIds?: string[] };
  } catch {
    return NextResponse.json({ error: 'Request body khong hop le' }, { status: 400 });
  }

  const orderIds = body.orderIds ?? [];
  if (!orderIds.length) return NextResponse.json({ error: 'Khong co don hang nao duoc chon' }, { status: 400 });

  try {
    const db = getAdminDb();

    const orders: OrderData[] = [];
    for (const id of orderIds) {
      const snap = await db.collection('orders').doc(id).get();
      if (!snap.exists) continue;
      const d = snap.data() as Record<string, unknown>;
      orders.push({
        id,
        items: (d.items as IOrderItem[]) ?? [],
        printPhotos: Array.isArray(d.printPhotos) ? (d.printPhotos as IPrintPhotoSlot[]) : [],
      });
    }

    if (!orders.length) return NextResponse.json({ error: 'Khong tim thay don hang' }, { status: 404 });

    async function fetchBytes(url: string): Promise<Uint8Array | null> {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return new Uint8Array(await res.arrayBuffer());
      } catch {
        return null;
      }
    }

    const allItems: LayoutItem[] = [];

    for (const order of orders) {
      for (let itemIdx = 0; itemIdx < order.items.length; itemIdx++) {
        const item = order.items[itemIdx];
        if (!item.printConfig?.enabled) continue;
        const { key, widthPt, heightPt } = printConfigToGroupKey(item.printConfig);

        for (let slotIdx = 0; slotIdx < item.quantity; slotIdx++) {
          const photoA = order.printPhotos.find(
            p => p.itemIndex === itemIdx && p.slotIndex === slotIdx && (p.side ?? 'a') === 'a',
          );
          const photoB = order.printPhotos.find(
            p => p.itemIndex === itemIdx && p.slotIndex === slotIdx && p.side === 'b',
          );

          if (item.isNfc) {
            // NFC: 2 cutout photos — both placed as independent items (no duplex)
            if (photoA) {
              const bytes = await fetchBytes(photoA.url);
              if (bytes) allItems.push({ frontBytes: bytes, frontIsJpeg: isJpeg(photoA.url), widthPt, heightPt, groupKey: key });
            }
            if (photoB) {
              const bytes = await fetchBytes(photoB.url);
              if (bytes) allItems.push({ frontBytes: bytes, frontIsJpeg: isJpeg(photoB.url), widthPt, heightPt, groupKey: key });
            }
          } else {
            // Non-NFC: duplex — side A on front, side B mirrored on back
            if (!photoA) continue;
            const frontBytes = await fetchBytes(photoA.url);
            if (!frontBytes) continue;

            const layoutItem: LayoutItem = {
              frontBytes,
              frontIsJpeg: isJpeg(photoA.url),
              widthPt,
              heightPt,
              groupKey: key,
            };

            if (photoB) {
              const backBytes = await fetchBytes(photoB.url);
              if (backBytes) {
                layoutItem.backBytes = backBytes;
                layoutItem.backIsJpeg = isJpeg(photoB.url);
              }
            }

            allItems.push(layoutItem);
          }
        }
      }
    }

    if (!allItems.length) {
      return NextResponse.json(
        { error: 'Khong co anh nao de xuat. Hay dam bao don hang da co anh duoc upload.' },
        { status: 400 },
      );
    }

    const pdfDoc = await PDFDocument.create();
    const frontPageDuplex = new Map<PdfPage, DuplexRecord[]>();

    await buildGrid(pdfDoc, allItems, frontPageDuplex);

    // Generate back pages — mirror each duplex item horizontally (long-edge flip)
    for (const [, duplexItems] of frontPageDuplex) {
      if (!duplexItems.length) continue;
      const backPage = pdfDoc.addPage([A4_W_PT, A4_H_PT]);
      for (const di of duplexItems) {
        const xMirrored = A4_W_PT - di.x - di.w;
        const img = di.backIsJpeg
          ? await pdfDoc.embedJpg(di.backBytes)
          : await pdfDoc.embedPng(di.backBytes);
        backPage.drawImage(img, { x: xMirrored, y: di.y, width: di.w, height: di.h });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="in-anh-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[export-print-pdf]', err);
    return NextResponse.json({ error: 'Loi he thong khi tao PDF' }, { status: 500 });
  }
}
