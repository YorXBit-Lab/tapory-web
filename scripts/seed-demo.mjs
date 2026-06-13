/**
 * Seed dữ liệu demo: linh kiện + 2 sản phẩm + 1 đơn hàng test.
 * Chạy: node --env-file=.env.local scripts/seed-demo.mjs
 * Idempotent: dùng doc id cố định nên chạy lại sẽ ghi đè, không nhân bản.
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) {
  console.error('Thiếu FIREBASE_SERVICE_ACCOUNT_KEY. Chạy: node --env-file=.env.local scripts/seed-demo.mjs');
  process.exit(1);
}
if (!getApps().length) initializeApp({ credential: cert(JSON.parse(key)) });
const db = getFirestore();
const now = new Date();

// ─────────────────────────────────────────
// LINH KIỆN
// ─────────────────────────────────────────
const components = [
  { id: 'cmp-phoi-cn',   name: 'Phôi MC hình chữ nhật', description: '3.4 × 5 cm',  stock: 200, unit: 'cái' },
  { id: 'cmp-phoi-vuong',name: 'Phôi MC hình vuông',     description: '4 × 4 cm',    stock: 150, unit: 'cái' },
  { id: 'cmp-phoi-tron', name: 'Phôi MC hình tròn',      description: 'Ø 3.5 cm',   stock: 200, unit: 'cái' },
  { id: 'cmp-charm-rnd', name: 'Charm ngẫu nhiên',        description: 'Charm trang trí bất kỳ', stock: 100, unit: 'cái' },
  { id: 'cmp-charm-ear', name: 'Charm tai nghe',           description: 'Charm hình tai nghe',   stock: 80,  unit: 'cái' },
  { id: 'cmp-nfc',       name: 'Chip NFC',                description: 'NTAG215',               stock: 120, unit: 'cái' },
];

// ─────────────────────────────────────────
// SẢN PHẨM 1: Móc khóa thông điệp (10k base)
// Biến thể: Thông điệp × Charm
// ─────────────────────────────────────────
const MSG_PRICE = 10000;

const msgOptions = [
  {
    id: 'thongdiep',
    name: 'Thông điệp',
    createsVariant: true,
    values: [
      { id: 'thi',  name: 'Chúc thi tốt' },
      { id: 'bo',   name: 'Đã có bồ' },
      { id: 'sn',   name: 'Chúc sinh nhật' },
      { id: 'tn',   name: 'Chúc tốt nghiệp' },
      { id: 'ct',   name: 'Chúc cuối tuần vui' },
    ],
  },
  {
    id: 'charm',
    name: 'Charm',
    createsVariant: true,
    values: [
      { id: 'rnd', name: 'Charm ngẫu nhiên', priceDelta: 3000, componentId: 'cmp-charm-rnd', componentQty: 1 },
      { id: 'ear', name: 'Charm tai nghe',   priceDelta: 3000, componentId: 'cmp-charm-ear', componentQty: 1 },
      { id: 'no',  name: 'Không charm' },
    ],
  },
];

const msgVariants = {};
let vi = 0;
for (const td of msgOptions[0].values) {
  for (const ch of msgOptions[1].values) {
    vi++;
    const price = MSG_PRICE + (ch.priceDelta ?? 0);
    const sku = `MKT-${td.id.toUpperCase()}-${ch.id.toUpperCase()}`;
    msgVariants[`mv${vi}`] = {
      name: `${td.name} · ${ch.name}`,
      price,
      sku,
      optionValues: [`thongdiep:${td.id}`, `charm:${ch.id}`],
    };
  }
}

const PRODUCT_MSG_ID = 'prod-mockhoa-thongdiep';
const productMsg = {
  name: 'Móc khóa thông điệp',
  type: 'keychain',
  status: 'active',
  price: MSG_PRICE,
  canBeNfc: false,
  description: 'Móc khóa khắc thông điệp theo yêu cầu — chọn câu chúc và charm trang trí.',
  options: msgOptions,
  baseComponents: [],
  variants: msgVariants,
  createdAt: now,
  updatedAt: now,
};

// ─────────────────────────────────────────
// SẢN PHẨM 2: Móc khóa in ảnh theo yêu cầu (12k base)
// Biến thể: Hình dạng × Charm × NFC
// ─────────────────────────────────────────
const PHOTO_PRICE = 12000;

const photoOptions = [
  {
    id: 'shape',
    name: 'Hình dạng',
    createsVariant: true,
    values: [
      { id: 'cn',    name: 'Chữ nhật', componentId: 'cmp-phoi-cn',    componentQty: 1 },
      { id: 'vuong', name: 'Vuông',    componentId: 'cmp-phoi-vuong', componentQty: 1 },
      { id: 'tron',  name: 'Tròn',     componentId: 'cmp-phoi-tron',  componentQty: 1 },
    ],
  },
  {
    id: 'charm',
    name: 'Charm',
    createsVariant: true,
    values: [
      { id: 'rnd', name: 'Charm ngẫu nhiên', priceDelta: 3000, componentId: 'cmp-charm-rnd', componentQty: 1 },
      { id: 'ear', name: 'Charm tai nghe',   priceDelta: 3000, componentId: 'cmp-charm-ear', componentQty: 1 },
      { id: 'no',  name: 'Không charm' },
    ],
  },
  {
    id: 'nfc',
    name: 'NFC',
    createsVariant: true,
    values: [
      { id: 'yes', name: 'Có NFC',    priceDelta: 10000, componentId: 'cmp-nfc', componentQty: 1 },
      { id: 'no',  name: 'Không NFC' },
    ],
  },
];

const PRINT_CONFIG = {
  cn:    { enabled: true, shape: 'rectangle', width: 3.4, height: 5 },
  vuong: { enabled: true, shape: 'square',    width: 4 },
  tron:  { enabled: true, shape: 'circle',    diameter: 3.5 },
};

const photoVariants = {};
let pi = 0;
for (const sh of photoOptions[0].values) {
  for (const ch of photoOptions[1].values) {
    for (const nf of photoOptions[2].values) {
      pi++;
      const price = PHOTO_PRICE + (ch.priceDelta ?? 0) + (nf.priceDelta ?? 0);
      const sku = `MKI-${sh.id.toUpperCase()}-${ch.id.toUpperCase()}-${nf.id.toUpperCase()}`;
      const entry = {
        name: `${sh.name} · ${ch.name} · ${nf.name}`,
        price,
        sku,
        optionValues: [`shape:${sh.id}`, `charm:${ch.id}`, `nfc:${nf.id}`],
        printConfig: PRINT_CONFIG[sh.id],
      };
      if (nf.id === 'yes') entry.isNfc = true;
      photoVariants[`pv${pi}`] = entry;
    }
  }
}

const PRODUCT_PHOTO_ID = 'prod-mockhoa-inanh';
const productPhoto = {
  name: 'Móc khóa in ảnh theo yêu cầu',
  type: 'keychain',
  status: 'active',
  price: PHOTO_PRICE,
  canBeNfc: false,
  description: 'Móc khóa in ảnh khách cung cấp — chọn hình dạng, charm và tùy chọn NFC.',
  options: photoOptions,
  baseComponents: [],
  variants: photoVariants,
  createdAt: now,
  updatedAt: now,
};

// ─────────────────────────────────────────
// ĐƠN HÀNG TEST: 2 items — 1 có NFC, 1 không
// Item 1: Tròn · Charm ngẫu nhiên · Có NFC = 12k + 3k + 10k = 25k
// Item 2: Đã có bồ · Không charm = 10k
// ─────────────────────────────────────────

// Tìm variant id tương ứng để gán đúng vào snapshot
const nfcVariantEntry = Object.entries(photoVariants).find(
  ([, v]) => v.optionValues.includes('shape:tron') && v.optionValues.includes('charm:rnd') && v.optionValues.includes('nfc:yes'),
);
const noNfcVariantEntry = Object.entries(msgVariants).find(
  ([, v]) => v.optionValues.includes('thongdiep:bo') && v.optionValues.includes('charm:no'),
);

const [nfcVId, nfcV] = nfcVariantEntry;   // Tròn · Charm ngẫu nhiên · Có NFC
const [noNfcVId, noNfcV] = noNfcVariantEntry; // Đã có bồ · Không charm

const ORDER_ID = 'order-test-001';
const order = {
  customerName: 'Nguyễn Văn A',
  phone: '0901234567',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  source: 'local',
  status: 'new',
  customized: false,
  price: nfcV.price + noNfcV.price,
  items: [
    {
      productId: PRODUCT_PHOTO_ID,
      productName: productPhoto.name,
      variantId: nfcVId,
      variantName: nfcV.name,
      quantity: 1,
      unitPrice: nfcV.price,
      isNfc: true,
      printConfig: nfcV.printConfig,
      variantSnapshot: {
        variantId: nfcVId,
        sku: nfcV.sku,
        name: nfcV.name,
        optionValues: nfcV.optionValues,
        unitPrice: nfcV.price,
        isNfc: true,
        printConfig: nfcV.printConfig,
      },
    },
    {
      productId: PRODUCT_MSG_ID,
      productName: productMsg.name,
      variantId: noNfcVId,
      variantName: noNfcV.name,
      quantity: 1,
      unitPrice: noNfcV.price,
      isNfc: false,
      variantSnapshot: {
        variantId: noNfcVId,
        sku: noNfcV.sku,
        name: noNfcV.name,
        optionValues: noNfcV.optionValues,
        unitPrice: noNfcV.price,
        isNfc: false,
      },
    },
  ],
  createdAt: now,
  updatedAt: now,
};

// ─────────────────────────────────────────
// GHI VÀO FIRESTORE
// ─────────────────────────────────────────
async function run() {
  const batch = db.batch();

  for (const c of components) {
    const { id, ...rest } = c;
    batch.set(db.collection('components').doc(id), { ...rest, reserved: 0, createdAt: now, updatedAt: now });
  }

  batch.set(db.collection('products').doc(PRODUCT_MSG_ID), productMsg);
  batch.set(db.collection('products').doc(PRODUCT_PHOTO_ID), productPhoto);
  batch.set(db.collection('orders').doc(ORDER_ID), order);

  await batch.commit();

  console.log(`✓ Seed xong:`);
  console.log(`  ${components.length} linh kiện`);
  console.log(`  Sản phẩm 1: "${productMsg.name}" (${Object.keys(msgVariants).length} biến thể) → ${PRODUCT_MSG_ID}`);
  console.log(`  Sản phẩm 2: "${productPhoto.name}" (${Object.keys(photoVariants).length} biến thể) → ${PRODUCT_PHOTO_ID}`);
  console.log(`  1 đơn hàng test → ${ORDER_ID}`);
  console.log(`    Item 1 (NFC): ${nfcV.name} — ${nfcV.price.toLocaleString('vi-VN')}đ`);
  console.log(`    Item 2:       ${noNfcV.name} — ${noNfcV.price.toLocaleString('vi-VN')}đ`);
  console.log(`    Tổng: ${order.price.toLocaleString('vi-VN')}đ`);
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
