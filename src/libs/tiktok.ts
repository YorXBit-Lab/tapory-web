import { createHmac } from 'crypto';
import type { StatusKey } from '@/components/dashboard';
import type { IOrder, IOrderItem } from '@/services/OrderAPI';

// firebase-admin được import động để tránh Turbopack bundle vào client
async function db() {
  const { getAdminDb } = await import('./firebase-admin');
  return getAdminDb();
}

// ── Endpoints ──────────────────────────────────────────────────────────────
// BASE_URL: có thể override bằng env nếu dùng region riêng
const BASE_URL = process.env.TIKTOK_BASE_URL ?? 'https://open-api.tiktokglobalshop.com';
// AUTH_URL: dùng endpoint quốc tế — hoạt động cho cả VN/SEA lẫn US/UK
const AUTH_URL = process.env.TIKTOK_AUTH_URL ?? 'https://auth.tiktok-shops.com/oauth/authorize';
const TOKEN_URL = 'https://auth.tiktok-shops.com/api/v2/token/get';

// ── Types ──────────────────────────────────────────────────────────────────
export interface TiktokConfig {
  access_token: string;
  refresh_token: string;
  shop_id: string;
  expires_at: number;   // Unix seconds
  last_sync_at?: string; // ISO string
}

// ── Signing (TikTok Shop API v202309) ──────────────────────────────────────
// String to sign: {appSecret}{path}{sorted_param_key_values}{body}
function makeSign(appSecret: string, path: string, params: Record<string, string>, body = ''): string {
  const paramStr = Object.entries(params)
    .filter(([k]) => k !== 'sign' && k !== 'access_token')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}${v}`)
    .join('');
  return createHmac('sha256', appSecret)
    .update(appSecret + path + paramStr + body)
    .digest('hex')
    .toUpperCase();
}

// ── Config (stored in Firestore system_config/tiktok) ─────────────────────
export async function getTiktokConfig(): Promise<TiktokConfig | null> {
  const firestore = await db();
  const snap = await firestore.collection('system_config').doc('tiktok').get();
  return snap.exists ? (snap.data() as TiktokConfig) : null;
}

export async function saveTiktokConfig(data: Partial<TiktokConfig>): Promise<void> {
  const firestore = await db();
  await firestore.collection('system_config').doc('tiktok').set(data, { merge: true });
}

// ── Token management ───────────────────────────────────────────────────────
export async function getValidToken(): Promise<Pick<TiktokConfig, 'access_token' | 'shop_id'>> {
  const config = await getTiktokConfig();
  if (!config) throw new Error('TikTok chưa được kết nối');

  // Still valid (buffer 5 phút)
  if (Date.now() / 1000 < config.expires_at - 300) {
    return { access_token: config.access_token, shop_id: config.shop_id };
  }

  // Refresh
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      app_key: process.env.TIKTOK_APP_KEY!,
      app_secret: process.env.TIKTOK_APP_SECRET!,
      refresh_token: config.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const json = await res.json();
  if (json.code !== 0) throw new Error(`Refresh token thất bại: ${json.message}`);

  const updated = {
    access_token: json.data.access_token as string,
    refresh_token: json.data.refresh_token as string,
    expires_at: Math.floor(Date.now() / 1000) + (json.data.access_token_expire_in as number),
  };
  await saveTiktokConfig(updated);
  return { access_token: updated.access_token, shop_id: config.shop_id };
}

// ── Signed API request ─────────────────────────────────────────────────────
function buildSignedUrl(path: string, extraParams: Record<string, string>, access_token: string): URL {
  const appKey = process.env.TIKTOK_APP_KEY!;
  const appSecret = process.env.TIKTOK_APP_SECRET!;
  const timestamp = String(Math.floor(Date.now() / 1000));

  const params: Record<string, string> = { app_key: appKey, timestamp, ...extraParams };
  // Body là rỗng với GET
  params.sign = makeSign(appSecret, path, params, '');

  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('access_token', access_token);
  return url;
}

async function tiktokGet<T>(path: string, extraParams: Record<string, string>, access_token: string): Promise<T> {
  const url = buildSignedUrl(path, extraParams, access_token);
  const res = await fetch(url.toString());
  const json = (await res.json()) as { code: number; message: string; data: T };
  if (json.code !== 0) throw new Error(`TikTok API ${json.code}: ${json.message}`);
  return json.data;
}

async function tiktokPost<T>(path: string, body: unknown, access_token: string, shop_id: string): Promise<T> {
  const appKey = process.env.TIKTOK_APP_KEY!;
  const appSecret = process.env.TIKTOK_APP_SECRET!;
  const timestamp = String(Math.floor(Date.now() / 1000));

  const queryParams: Record<string, string> = { app_key: appKey, timestamp, shop_id };
  const bodyStr = JSON.stringify(body);
  queryParams.sign = makeSign(appSecret, path, queryParams, bodyStr);

  const url = new URL(BASE_URL + path);
  Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('access_token', access_token);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyStr,
  });

  const json = (await res.json()) as { code: number; message: string; data: T };
  if (json.code !== 0) throw new Error(`TikTok API ${json.code}: ${json.message}`);
  return json.data;
}

// ── Test connection (get authorized shops) ─────────────────────────────────
export async function testConnection(): Promise<{ shops: unknown[] }> {
  const { access_token } = await getValidToken();
  return tiktokGet<{ shops: unknown[] }>(
    '/authorization/202309/shops',
    {},
    access_token,
  );
}

// ── Status mapping ─────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, StatusKey> = {
  UNPAID: 'new',
  ON_HOLD: 'new',
  AWAITING_SHIPMENT: 'pending',
  AWAITING_COLLECTION: 'pending',
  PARTIALLY_SHIPPED: 'active',
  IN_TRANSIT: 'active',
  DELIVERED: 'done',
  COMPLETED: 'done',
  CANCELLED: 'cancel',
};

// ── Order mapping ──────────────────────────────────────────────────────────
const NFC_KEYWORDS = /nfc|móc khóa|moc khoa|keychain/i;

function mapTiktokOrder(raw: Record<string, unknown>): Omit<IOrder, 'id'> & { id: string } {
  const recipient = (raw.recipient_address ?? {}) as Record<string, unknown>;
  const payment = (raw.payment_info ?? {}) as Record<string, unknown>;

  const items: IOrderItem[] = ((raw.item_list ?? []) as Record<string, unknown>[]).map(i => {
    const name = (i.product_name as string) ?? '';
    return {
      productName: name,
      quantity: Number(i.quantity ?? 1),
      unitPrice: Number(i.sku_sale_price ?? 0),
      isNfc: NFC_KEYWORDS.test(name),
    };
  });

  return {
    id: `TT-${raw.order_id as string}`,
    customerName: (recipient.name as string) ?? '',
    phone: (recipient.phone_number as string) ?? '',
    address: (recipient.full_address as string) ?? '',
    price: Number(payment.total_amount ?? 0),
    status: STATUS_MAP[(raw.order_status as string)] ?? 'new',
    source: 'tiktok',
    items,
    notes: (raw.buyer_message as string) ?? '',
    customized: false,
    createdAt: new Date(Number(raw.create_time) * 1000).toISOString(),
    updatedAt: new Date(Number(raw.update_time ?? raw.create_time) * 1000).toISOString(),
  };
}

// ── Sync ───────────────────────────────────────────────────────────────────
interface SyncResult { synced: number; lastOrderTime: number }

export async function syncTiktokOrders(sinceTs: number): Promise<SyncResult> {
  const { access_token, shop_id } = await getValidToken();
  const firestore = await db();

  let totalSynced = 0;
  let lastOrderTime = sinceTs;
  let hasMore = true;
  let page = 1;

  while (hasMore && page <= 20) {
    const data = await tiktokPost<{ orders: Record<string, unknown>[]; total_count: number }>(
      '/order/202309/orders/search',
      {
        page_size: 50,
        sort_field: 'CREATE_TIME',
        sort_order: 'ASC',
        create_time_ge: sinceTs,
        create_time_lt: Math.floor(Date.now() / 1000),
      },
      access_token,
      shop_id,
    );

    const orders = data.orders ?? [];
    if (orders.length === 0) break;

    const batch = firestore.batch();
    for (const raw of orders) {
      const order = mapTiktokOrder(raw);
      const ts = Math.floor(new Date(order.createdAt ?? '').getTime() / 1000);
      if (ts > lastOrderTime) lastOrderTime = ts;

      const { id, createdAt, updatedAt, ...rest } = order;
      batch.set(firestore.collection('orders').doc(id), {
        ...rest,
        createdAt: new Date(createdAt ?? Date.now()),
        updatedAt: new Date(),
      }, { merge: true });
    }
    await batch.commit();

    totalSynced += orders.length;
    hasMore = orders.length === 50;
    page++;
  }

  return { synced: totalSynced, lastOrderTime };
}

// ── OAuth helpers ──────────────────────────────────────────────────────────
export function getAuthUrl(): string {
  const appKey = process.env.TIKTOK_APP_KEY!;
  const redirectUri = encodeURIComponent(process.env.TIKTOK_REDIRECT_URI!);
  return `${AUTH_URL}?app_key=${appKey}&redirect_uri=${redirectUri}`;
}

export async function exchangeCode(authCode: string): Promise<void> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      app_key: process.env.TIKTOK_APP_KEY!,
      app_secret: process.env.TIKTOK_APP_SECRET!,
      auth_code: authCode,
      grant_type: 'authorized_code',
    }),
  });

  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message ?? 'Lỗi đổi code lấy token');

  const d = json.data as Record<string, unknown>;
  await saveTiktokConfig({
    access_token: d.access_token as string,
    refresh_token: d.refresh_token as string,
    shop_id: (d.open_id ?? d.seller_id ?? d.shop_id) as string,
    expires_at: Math.floor(Date.now() / 1000) + (d.access_token_expire_in as number),
    last_sync_at: undefined,
  });
}
