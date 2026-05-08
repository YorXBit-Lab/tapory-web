# Tapory — Firebase Database Design

## Tổng quan luồng hệ thống

```
Khách mua thẻ NFC
       ↓
Admin tạo Order + sinh Card ID → lập trình NFC chip với URL: tapory.vn/c/[cardId]
       ↓
Khách quét thẻ → /c/[cardId]
  ├── Chưa có memorial → /edit/[cardId]  (yêu cầu nhập SĐT để xác thực)
  └── Đã có memorial   → /view/[cardId]  (xem trang kết quả)
```

---

## Firestore Collections

### 1. `orders` — Đơn hàng

**Path:** `orders/{orderId}`

```ts
{
  // Identity
  id: string;                    // Auto ID hoặc "ORD-20260508-001"
  orderCode: string;             // Mã hiển thị: "TP-001234"

  // Thông tin khách hàng
  customerName: string;
  customerPhone: string;         // SĐT gốc — dùng để auth vào edit card
  customerEmail?: string;
  customerNote?: string;

  // Đơn hàng
  cardIds: string[];             // ["card_abc", "card_xyz"] — 1 order có thể nhiều thẻ
  quantity: number;
  packageType: 'basic' | 'premium' | 'bundle';  // Loại gói

  // Thanh toán
  totalAmount: number;           // VNĐ
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paidAt?: Timestamp;

  // Vận chuyển
  shippingAddress: {
    recipientName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  shippingProvider?: string;     // "GHTK", "GHN", v.v.
  trackingCode?: string;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;

  // Trạng thái đơn
  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  // Thời gian
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // UID admin tạo đơn
}
```

---

### 2. `cards` — Thẻ NFC vật lý

**Path:** `cards/{cardId}`

> `cardId` chính là giá trị được lập trình vào chip NFC, ví dụ: `"tp_x7k2m9"`.  
> URL trên thẻ: `https://tapory.vn/c/{cardId}`

```ts
{
  // Identity
  id: string;                    // Trùng với doc ID

  // Liên kết đơn hàng
  orderId: string;               // Ref → orders/{orderId}
  customerPhone: string;         // Copy từ order để auth nhanh (plain text — chỉ admin đọc được)
  phoneHash: string;             // SHA-256 của SĐT chuẩn hoá — dùng để xác thực client-side

  // Trạng thái thẻ
  status: 'blank'                // Thẻ mới, chưa assign vào order
         | 'assigned'            // Đã assign vào order, chưa có memorial
         | 'published'           // Khách đã lưu memorial
         | 'locked'              // Admin khoá, không cho edit thêm
         | 'expired';            // Hết hạn (nếu dùng subscription)

  // Memorial
  hasContent: boolean;           // true khi đã có doc trong `memorials/{cardId}`
  templateId?: TemplateId;       // Copy nhanh để dashboard khỏi join

  // Thời hạn chỉnh sửa
  editDeadline?: Timestamp;      // Sau mốc này tự động locked
  publishedAt?: Timestamp;
  lockedAt?: Timestamp;
  lockedBy?: string;             // UID admin khoá

  // Analytics (cập nhật bằng Cloud Function hoặc client)
  stats: {
    totalViews: number;
    lastViewedAt?: Timestamp;
  };

  // Thời gian
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Lý do tách `cards` và `memorials`:**
- `cards` = metadata vật lý, admin quản lý, có security rules chặt.
- `memorials` = content do khách tự edit, rules riêng.

---

### 3. `memorials` — Nội dung thẻ (giữ nguyên collection hiện tại)

**Path:** `memorials/{cardId}`

> Doc ID = `cardId` (thay vì `orderId` như hiện tại — cần migration nhỏ).

```ts
{
  // Identity (giữ field orderId để backward compat, value = cardId)
  orderId: string;               // = cardId

  // Template
  templateId: TemplateId;
  styleId: string;
  frameId: string;
  effectId: string;

  // Background
  bgColor: string;
  bgImageUrl?: string;

  // Nội dung
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  spotifyUrl?: string;

  // Tuỳ chỉnh giao diện
  fontStyle?: string;
  titleSize?: string;
  imageMode?: string;
  imageFilter?: string;

  // Mạng xã hội / liên hệ
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  email?: string;
  phone?: string;
  website?: string;

  // Thời gian
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 4. `cardViews` — Analytics lượt xem

**Path:** `cardViews/{autoId}`

> Collection phẳng (không dùng subcollection) để dễ aggregate trên dashboard.

```ts
{
  cardId: string;
  orderId: string;
  timestamp: Timestamp;

  // Thiết bị
  userAgent?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';

  // Geo (nếu dùng IP lookup)
  city?: string;
  country?: string;

  isOwnerView: boolean;          // true nếu người xem là chủ thẻ (đã auth)
}
```

**Index cần tạo:**
```
cardId ASC + timestamp DESC    (để query views theo card)
timestamp DESC                 (để dashboard xem views toàn hệ thống)
```

---

### 5. `admins` — Tài khoản quản trị

**Path:** `admins/{uid}`

```ts
{
  uid: string;                   // Firebase Auth UID
  email: string;
  displayName: string;
  role: 'super_admin' | 'staff'; // super_admin: full quyền, staff: chỉ xem + tạo order
  createdAt: Timestamp;
}
```

---

## Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    function isSuperAdmin() {
      return isAdmin() &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
    }

    // Orders: chỉ admin đọc/ghi
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }

    // Cards: admin full quyền, client chỉ đọc status + phoneHash
    match /cards/{cardId} {
      allow read: if true;                          // Cần đọc để check status khi quét NFC
      allow write: if isAdmin();
    }

    // Memorials: đọc public, ghi cần xác thực qua Cloud Function hoặc custom token
    match /memorials/{cardId} {
      allow read: if true;
      allow create, update: if request.auth != null; // Xác thực bằng custom token (xem Auth Flow)
      allow delete: if isSuperAdmin();
    }

    // Analytics: ghi public (anonymous), đọc chỉ admin
    match /cardViews/{viewId} {
      allow create: if true;
      allow read: if isAdmin();
    }

    // Admins: chỉ super_admin quản lý
    match /admins/{uid} {
      allow read: if isAdmin();
      allow write: if isSuperAdmin();
    }
  }
}
```

---

## Auth Flow — Xác thực khách bằng SĐT

Không dùng Firebase Auth cho khách (tránh phức tạp). Dùng **Custom Token** từ Cloud Function:

```
Client nhập SĐT trên trang /edit/[cardId]
  ↓
Gọi Cloud Function: verifyCardPhone({ cardId, phone })
  ↓
Function: hash(normalise(phone)) == cards[cardId].phoneHash ?
  ├── Đúng → issue Firebase Custom Token với claims: { cardId, role: "card_owner" }
  └── Sai  → trả 401
  ↓
Client signInWithCustomToken(token)
  ↓
Được phép write vào memorials/{cardId}
```

**Chuẩn hoá SĐT trước khi hash:**
```ts
// "0912 345 678" | "+84912345678" | "84912345678" → "0912345678"
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('84')) return '0' + digits.slice(2);
  return digits;
}
const phoneHash = sha256(normalisePhone(phone));
```

---

## Dashboard — Dữ liệu cần thiết

| Widget | Query Firestore |
|---|---|
| Tổng đơn hàng | `orders` — `countDocuments()` |
| Đơn chờ xử lý | `orders` where `status == 'paid'` |
| Thẻ đã publish | `cards` where `status == 'published'` |
| Thẻ chưa dùng | `cards` where `status == 'assigned'` |
| Lượt xem hôm nay | `cardViews` where `timestamp >= today` |
| Template phổ biến | `memorials` — group by `templateId` |
| Đơn gần nhất | `orders` orderBy `createdAt DESC` limit 20 |
| Card sắp hết hạn edit | `cards` where `editDeadline` in next 3 days |

---

## Ý tưởng mở rộng hay

### 🔒 Bảo mật nâng cao
- **OTP qua Zalo / SMS** thay vì chỉ nhập SĐT — dùng Zalo OA API hoặc ESMS, tăng độ tin cậy cho khách.
- **PIN 6 số** riêng biệt (khách tự đặt lần đầu) thay vì SĐT.

### 📊 Analytics cho khách hàng
- Khách xem được **bao nhiêu người đã quét thẻ của mình**, khi nào, ở đâu.
- Trang `/stats/[cardId]` riêng — auth bằng SĐT giống flow edit.
- Push notification (qua email) khi có người quét thẻ.

### ♻️ Tái sử dụng thẻ
- Cho phép khách **đổi template** sau sự kiện (ví dụ: sau đám cưới đổi thành Business Card).
- Admin bán thêm gói "Re-skin" — thu phí update.
- Field `reactivationCount: number` trên card để track.

### ⏰ Hẹn giờ publish
- Khách cài trước, thẻ **tự động live đúng ngày sự kiện** (đám cưới ngày 15/6 thì set publishAt = 15/6).
- Trước thời điểm đó, người quét thẻ thấy trang "Coming Soon" đếm ngược.

### 📦 Bulk Order cho doanh nghiệp
- Công ty đặt 50 thẻ business card → 50 card ID riêng, mỗi nhân viên nhập SĐT để setup.
- Template đồng nhất (logo công ty cố định), chỉ cho thay đổi thông tin cá nhân.
- Field `orderId` liên kết về một order duy nhất.

### 🎁 Mẫu giới hạn theo mùa
- Template Tết, Noel, Valentine — chỉ available trong thời gian nhất định.
- Field `availableFrom / availableTo` trên template config.

### 📱 Mini CMS cho khách
- Sau khi publish, khách vẫn có thể **cập nhật thông tin** (SĐT, website) mà không cần reset toàn bộ.
- Phân biệt "layout & design" (chỉ edit 1 lần) vs "contact info" (edit mãi mãi).

### 🔗 Deep link thông minh
- Nếu điện thoại chưa cài app (tương lai) → web. Nếu cài rồi → mở app.
- Dùng Firebase Dynamic Links hoặc custom redirect logic.

---

## Migration từ codebase hiện tại

Hiện tại `memorials` dùng `orderId` làm doc ID và URL param.  
Khi chuyển sang model mới, `cardId` = `orderId` (1 order 1 thẻ) — **không cần migrate data**.  
Chỉ cần:
1. Thêm collection `orders` và `cards` mới.
2. Khi tạo order mới → sinh `cardId` → tạo doc trong `cards` → lập trình NFC với URL `/c/[cardId]`.
3. Route `/c/[cardId]` kiểm tra `cards/{cardId}.hasContent` → redirect `/edit` hoặc `/view`.
