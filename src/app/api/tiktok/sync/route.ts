import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/libs/firebase-admin';
import { getTiktokConfig, saveTiktokConfig, syncTiktokOrders } from '@/libs/tiktok';

// POST /api/tiktok/sync  — có thể gọi từ UI (admin auth) hoặc cron job (CRON_SECRET header)
export async function POST(req: NextRequest) {
  // Xác thực: admin Firebase hoặc cron secret
  const authHeader = req.headers.get('authorization') ?? '';
  const cronSecret = req.headers.get('x-cron-secret');

  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const idToken = authHeader.replace(/^Bearer\s+/, '');
    if (!idToken) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      const adminSnap = await getAdminDb().collection('admins').doc(decoded.uid).get();
      if (!adminSnap.exists) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } catch {
      return NextResponse.json({ error: 'Token không hợp lệ' }, { status: 401 });
    }
  }

  try {
    const config = await getTiktokConfig();
    if (!config) return NextResponse.json({ error: 'TikTok chưa kết nối' }, { status: 400 });

    // Sync từ lần cuối, hoặc 30 ngày trước nếu chưa sync lần nào
    const sinceTs = config.last_sync_at
      ? Math.floor(new Date(config.last_sync_at).getTime() / 1000)
      : Math.floor(Date.now() / 1000) - 30 * 24 * 3600;

    const { synced, lastOrderTime } = await syncTiktokOrders(sinceTs);

    if (lastOrderTime > sinceTs) {
      await saveTiktokConfig({ last_sync_at: new Date(lastOrderTime * 1000).toISOString() });
    }

    return NextResponse.json({
      synced,
      last_sync_at: new Date(lastOrderTime * 1000).toISOString(),
    });
  } catch (err) {
    console.error('[tiktok/sync]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi hệ thống' },
      { status: 500 },
    );
  }
}
