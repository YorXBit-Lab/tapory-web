import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/libs/firebase-admin';
import { createOrderRecord } from '@/utils/order-create';
import type { IOrderItem } from '@/services/OrderAPI';
import type { IPrintConfig } from '@/configs/types';

/**
 * Đặt hàng công khai từ website (configurator). Không yêu cầu đăng nhập.
 * Giá/biến thể resolve THẲNG từ document product (không tin client) để tránh sửa giá.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      customerName?: string;
      phone?: string;
      address?: string;
      note?: string;
      productId?: string;
      variantId?: string;
      quantity?: number;
      presetPhotoUrl?: string;
      message?: string;
    };

    const { customerName, phone, address, note, productId, variantId, presetPhotoUrl, message } = body;
    const quantity = Math.max(1, Math.floor(body.quantity ?? 1));

    if (!customerName?.trim()) return NextResponse.json({ error: 'Vui lòng nhập họ tên' }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: 'Vui lòng nhập số điện thoại' }, { status: 400 });
    if (!address?.trim()) return NextResponse.json({ error: 'Vui lòng nhập địa chỉ giao hàng' }, { status: 400 });
    if (!productId) return NextResponse.json({ error: 'Thiếu sản phẩm' }, { status: 400 });

    const adminDb = getAdminDb();
    const snap = await adminDb.collection('products').doc(productId).get();
    if (!snap.exists) return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 });
    const p = snap.data()!;
    if (p.status === 'archived') return NextResponse.json({ error: 'Sản phẩm đã ngừng bán' }, { status: 400 });

    const variant = variantId
      ? (p.variants as Record<string, Record<string, unknown>> | undefined)?.[variantId]
      : undefined;
    if (variantId && !variant) return NextResponse.json({ error: 'Biến thể không tồn tại' }, { status: 400 });

    const unitPrice = (variant?.price as number) ?? (p.price as number) ?? 0;
    const isNfc = (variant?.isNfc as boolean) ?? false;
    const printConfig = (variant?.printConfig ?? p.printConfig) as IPrintConfig | undefined;

    const item: IOrderItem = {
      productId,
      productName: (p.name as string) ?? '',
      quantity,
      unitPrice,
      isNfc,
      ...(variantId ? { variantId, variantName: variant?.name as string } : {}),
      ...(isNfc && p.templateId ? { templateId: p.templateId as string } : {}),
      ...(printConfig?.enabled ? { printConfig } : {}),
      ...(presetPhotoUrl ? { presetPhotoUrl } : {}),
      ...(variant
        ? {
            variantSnapshot: {
              variantId,
              name: (variant.name as string) ?? '',
              unitPrice,
              ...(variant.sku ? { sku: variant.sku as string } : {}),
              ...(Array.isArray(variant.optionValues) ? { optionValues: variant.optionValues as string[] } : {}),
              ...(isNfc ? { isNfc: true } : {}),
              ...(printConfig?.enabled ? { printConfig } : {}),
            },
          }
        : {}),
      ...((message?.trim() || presetPhotoUrl)
        ? { customization: { ...(message?.trim() ? { message: message.trim() } : {}), ...(presetPhotoUrl ? { presetPhotoUrl } : {}) } }
        : {}),
    };

    const { orderId } = await createOrderRecord(adminDb, {
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: note,
      items: [item],
      source: 'web',
    });

    return NextResponse.json({ orderId });
  } catch (err) {
    console.error('[order]', err);
    const msg = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
