/**
 * Backfill field `slug` cho mọi sản phẩm cũ (tạo trước khi có field này).
 * slug = toSlug(name) — khớp với src/utils/slug.ts để fast-path query
 * trong getFullProductBySlug hoạt động không cần full-scan.
 *
 * Chạy: node --env-file=.env.local scripts/backfill-product-slug.mjs
 * Idempotent: chỉ ghi khi slug bị thiếu hoặc khác giá trị mong muốn.
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) {
  console.error('Thiếu FIREBASE_SERVICE_ACCOUNT_KEY. Chạy: node --env-file=.env.local scripts/backfill-product-slug.mjs');
  process.exit(1);
}
if (!getApps().length) initializeApp({ credential: cert(JSON.parse(key)) });
const db = getFirestore();

// Phải khớp 1:1 với src/utils/slug.ts
function toSlug(name) {
  return (name ?? '')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function run() {
  const snap = await db.collection('products').get();
  let updated = 0;
  let skipped = 0;
  const collisions = new Map();

  const batch = db.batch();
  for (const doc of snap.docs) {
    const data = doc.data();
    const want = toSlug(data.name);

    // Cảnh báo nếu 2 sản phẩm cùng slug (cùng tên) → sẽ tranh chấp URL.
    if (want) collisions.set(want, (collisions.get(want) ?? 0) + 1);

    if (data.slug === want) { skipped++; continue; }
    batch.update(doc.ref, { slug: want });
    updated++;
    console.log(`  ${doc.id}: "${data.name}" → slug="${want}"`);
  }

  if (updated > 0) await batch.commit();

  console.log(`\n✓ Backfill xong: ${updated} cập nhật, ${skipped} đã đúng (tổng ${snap.size}).`);

  const dups = [...collisions.entries()].filter(([, n]) => n > 1);
  if (dups.length > 0) {
    console.warn('\n⚠ Slug trùng (nhiều sản phẩm cùng tên) — cần đổi tên để tránh URL tranh chấp:');
    for (const [s, n] of dups) console.warn(`  "${s}" × ${n}`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
