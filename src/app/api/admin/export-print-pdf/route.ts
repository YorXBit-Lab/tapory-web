import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, type PDFPage } from 'pdf-lib';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import type { IOrderItem } from '@/services/OrderAPI';
import type { IPrintPhotoSlot, IPrintConfig, PrintShape } from '@/configs/types';
import { mmToPt, resolvePrintSize, printSizeKey } from '@/configs/print';
import { layoutGridA4, type GridItem, type GridBox } from '@/utils/pdf-grid';

interface LayoutItem {
  frontBytes: Uint8Array;
  frontIsJpeg: boolean;
  backBytes?: Uint8Array;   // present for non-NFC duplex items
  backIsJpeg?: boolean;
  widthPt: number;
  heightPt: number;
  shape: PrintShape;
  groupKey: string;
}

/* ── Helpers ── */
function isJpeg(url: string) { return /\.(jpg|jpeg)(\?|$)/i.test(url); }

/** Vẽ 1 ảnh (jpg/png) vào ô box trên trang PDF. */
async function drawImage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  bytes: Uint8Array,
  isJpg: boolean,
  box: GridBox,
) {
  const img = isJpg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
  page.drawImage(img, { x: box.x, y: box.y, width: box.width, height: box.height });
}

function printConfigToGroupKey(cfg: IPrintConfig): { key: string; widthPt: number; heightPt: number } {
  const { widthCm, heightCm } = resolvePrintSize(cfg);
  return {
    key: printSizeKey(cfg),
    widthPt: mmToPt(widthCm * 10),
    heightPt: mmToPt(heightCm * 10),
  };
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
        const shape: PrintShape = item.printConfig.shape ?? 'rectangle';

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
              if (bytes) allItems.push({ frontBytes: bytes, frontIsJpeg: isJpeg(photoA.url), widthPt, heightPt, shape, groupKey: key });
            }
            if (photoB) {
              const bytes = await fetchBytes(photoB.url);
              if (bytes) allItems.push({ frontBytes: bytes, frontIsJpeg: isJpeg(photoB.url), widthPt, heightPt, shape, groupKey: key });
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
              shape,
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

    const gridItems: GridItem[] = allItems.map((it) => ({
      widthPt: it.widthPt,
      heightPt: it.heightPt,
      shape: it.shape,
      groupKey: it.groupKey,
      drawFront: (page, box) => drawImage(pdfDoc, page, it.frontBytes, it.frontIsJpeg, box),
      ...(it.backBytes
        ? { drawBack: (page: PDFPage, box: GridBox) => drawImage(pdfDoc, page, it.backBytes!, it.backIsJpeg ?? false, box) }
        : {}),
    }));

    await layoutGridA4(pdfDoc, gridItems);

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
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
