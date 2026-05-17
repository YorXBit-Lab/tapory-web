# Góc Chạm — Firebase Database Design

## Luồng hệ thống

```
Khách mua thẻ NFC
       ↓
Admin tạo Order → gắn Card ID → lập trình NFC chip với URL: tapory.vn/c/[cardId]
       ↓
Khách quét thẻ → /c/[cardId]
  ├── Chưa có content → /edit/[cardId]  (nhập SĐT + mật khẩu để xác thực)
  └── Đã có content   → /view/[cardId]  (xem trang kết quả — không cần login)
```

---

## Collections

### 1. `orders` — Đơn hàng

**Path:** `orders/{orderId}`

```ts
{
  id: string;                    // Auto ID hoặc "ORD-20260508-001"
  orderCode: string;             // Mã hiển thị: "TP-001234"

  customerName: string;
  customerPhone: string;         // SĐT chuẩn hoá: "0912345678" — chỉ admin đọc
  customerEmail?: string;
  customerNote?: string;

  cardIds: string[];             // ["card_abc"] — 1 order có thể nhiều thẻ
  quantity: number;
  packageType: 'basic' | 'premium' | 'bundle';

  totalAmount: number;           // VNĐ
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paidAt?: Timestamp;

  shippingAddress: {
    recipientName: string;
    phone: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  shippingProvider?: string;     // "GHTK", "GHN"
  trackingCode?: string;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;

  status: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // UID admin
}
```

---

### 2. `cards` — Thẻ NFC vật lý

**Path:** `cards/{cardId}`

> `cardId` được lập trình vào chip NFC. URL thẻ: `https://tapory.vn/c/{cardId}`  
> Doc này **world-readable** — không chứa thông tin nhạy cảm.

```ts
{
  id: string;
  orderId: string;               // Ref → orders/{orderId}

  status: 'blank'                // Thẻ mới, chưa gắn order
         | 'assigned'            // Đã gắn order, chưa có content
         | 'published'           // Khách đã lưu content
         | 'locked'              // Admin khoá
         | 'expired';

  hasContent: boolean;           // true khi đã có doc trong memorials/{cardId}
  templateId?: TemplateId;       // Cache để dashboard khỏi join

  editDeadline?: Timestamp;      // Sau mốc này tự khoá
  publishedAt?: Timestamp;
  lockedAt?: Timestamp;
  lockedBy?: string;             // UID admin khoá

  stats: {
    totalViews: number;
    lastViewedAt?: Timestamp;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 3. `cardAuth` — Xác thực thẻ _(tách riêng để bảo mật)_

**Path:** `cardAuth/{cardId}`

> Collection này **chỉ Cloud Function đọc/ghi** — client không bao giờ truy cập trực tiếp.  
> Tách khỏi `cards` để Firestore Rules có thể deny client hoàn toàn.

```ts
{
  cardId: string;
  orderId: string;

  phoneHash: string;             // SHA-256(normalisePhone(phone))
  passwordHash: string;          // bcrypt hash của mật khẩu (cost factor 10)
                                 // Mật khẩu khởi tạo do admin set khi tạo order

  passwordChangedAt?: Timestamp; // Lần cuối đổi mật khẩu
  failedAttempts: number;        // Đếm thử sai liên tiếp (reset khi thành công)
  lockedUntil?: Timestamp;       // Khoá tạm 15 phút sau 5 lần sai

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Lý do dùng bcrypt cho password (không phải SHA-256):**  
SHA-256 không có salt — dễ bị rainbow table attack. bcrypt tự thêm salt và có work factor điều chỉnh được.

---

### 4. `memorials` — Nội dung thẻ

**Path:** `memorials/{cardId}`

> Doc ID = `cardId`. Hiện tại codebase dùng `orderId` làm doc ID, nhưng vì 1 order = 1 thẻ nên `cardId == orderId` — **không cần migrate data**.

```ts
{
  orderId: string;               // = cardId (giữ field để backward compat)

  templateId: TemplateId;        // 'graduation' | 'wedding' | 'birthday' | ...
  styleId: string;
  frameId: string;
  effectId: string;

  bgColor: string;
  bgImageUrl?: string;

  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  imageUrl?: string;
  spotifyUrl?: string;

  fontStyle?: string;
  titleSize?: string;
  imageMode?: string;
  imageFilter?: string;

  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  email?: string;
  phone?: string;
  website?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 5. `cardViews` — Analytics lượt xem

**Path:** `cardViews/{autoId}`

> Collection phẳng (không dùng subcollection) để aggregate dễ trên dashboard.

```ts
{
  cardId: string;
  orderId: string;
  timestamp: Timestamp;

  deviceType?: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;

  city?: string;
  country?: string;

  isOwnerView: boolean;          // true nếu người xem vừa auth thành công
}
```

**Indexes cần tạo (Firestore Console):**

```
cardId ASC + timestamp DESC    → query views theo từng thẻ
timestamp DESC                 → dashboard tổng hệ thống
```

---

### 6. `admins` — Tài khoản quản trị

**Path:** `admins/{uid}`

```ts
{
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  role: 'super_admin' | 'staff'; // super_admin: full quyền; staff: xem + tạo order
  createdAt: Timestamp;
}
```

---

## Firestore Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isSuperAdmin() {
      return isAdmin() &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'super_admin';
    }

    function isCardOwner(cardId) {
      // Custom token do Cloud Function cấp sẽ có claim: { cardId, role: "card_owner" }
      return request.auth != null &&
        request.auth.token.role == 'card_owner' &&
        request.auth.token.cardId == cardId;
    }

    // Orders: chỉ admin
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }

    // Cards: world-readable (cần kiểm tra status khi quét NFC), chỉ admin ghi
    match /cards/{cardId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // CardAuth: KHÔNG cho client đọc/ghi — chỉ Cloud Functions (qua Admin SDK)
    match /cardAuth/{cardId} {
      allow read, write: if false;
    }

    // Memorials: đọc public, ghi cần custom token từ Cloud Function
    match /memorials/{cardId} {
      allow read: if true;
      allow create, update: if isCardOwner(cardId);
      allow delete: if isSuperAdmin();
    }

    // Analytics: ghi public (anonymous tracking), đọc chỉ admin
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

## Auth Flow — Khách xác thực để edit

### Đăng nhập (SĐT + Mật khẩu)

```
Client gửi: POST /api/auth/card  { cardId, phone, password }
       ↓
Cloud Function verifyCardAuth:
  1. Đọc cardAuth/{cardId} (Admin SDK — không qua Firestore Rules)
  2. hash(normalise(phone)) == phoneHash ?  → Nếu sai: 401
  3. bcrypt.compare(password, passwordHash) → Nếu sai: tăng failedAttempts
     - failedAttempts >= 5 → set lockedUntil = now + 15 phút → 429
  4. Nếu đúng:
     - Reset failedAttempts = 0
     - Issue Firebase Custom Token với claims: { cardId, role: "card_owner" }
       ↓
Client: signInWithCustomToken(token)
       ↓
Được phép write vào memorials/{cardId}
```

### Đổi mật khẩu

```
Client gửi: POST /api/auth/change-password  { cardId, phone, currentPassword, newPassword }
       ↓
Cloud Function changeCardPassword:
  1. Xác thực phone + currentPassword (giống luồng đăng nhập)
  2. Validate newPassword: tối thiểu 6 ký tự
  3. bcrypt.hash(newPassword, 10)
  4. Cập nhật cardAuth/{cardId}.passwordHash + passwordChangedAt
       ↓
Trả về: { success: true }
```

### Chuẩn hoá SĐT trước khi hash

```ts
function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('84')) return '0' + digits.slice(2);
  return digits;
}
// "0912 345 678" | "+84912345678" | "84912345678" → "0912345678"
```

### Mật khẩu khởi tạo

Admin khi tạo order sẽ set mật khẩu mặc định cho khách (ví dụ: 4 số cuối SĐT).  
Khách được khuyến khích đổi mật khẩu ngay lần đầu đăng nhập.

---

## Dashboard — Queries tối ưu

| Widget               | Query                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ |
| Tổng đơn hàng        | `orders` — `getCountFromServer()`                                                    |
| Đơn chờ xử lý        | `orders` where `status == 'paid'`                                                    |
| Thẻ đã publish       | `cards` where `status == 'published'` — `getCountFromServer()`                       |
| Thẻ chưa dùng        | `cards` where `status == 'assigned'`                                                 |
| Lượt xem hôm nay     | `cardViews` where `timestamp >= startOfDay` — `getCountFromServer()`                 |
| Template phổ biến    | `memorials` orderBy `templateId` — group client-side (hoặc Cloud Function aggregate) |
| Đơn gần nhất         | `orders` orderBy `createdAt DESC` limit 20                                           |
| Thẻ sắp hết hạn edit | `cards` where `editDeadline <= now + 3 ngày`                                         |

> Dùng `getCountFromServer()` thay vì fetch toàn bộ docs để tránh đọc document không cần thiết — tiết kiệm chi phí Firestore đáng kể khi scale.

---

## Mở rộng trong tương lai

### Analytics cho khách

- Trang `/stats/[cardId]` — auth bằng SĐT + mật khẩu giống flow edit.
- Hiển thị tổng lượt quét, thiết bị, thời gian.

### Tái sử dụng thẻ (Re-skin)

- Admin mở khoá `cards/{cardId}.status = 'assigned'` → khách edit lại.
- Bán thêm gói "Re-skin" qua một order mới liên kết cùng `cardId`.

### Hẹn giờ publish

- Field `publishAt: Timestamp` trên `memorials`.
- `/view/[cardId]` kiểm tra: nếu `publishAt > now` → render trang đếm ngược.

### Bulk Order doanh nghiệp

- 1 order → nhiều `cardId` trong `cardIds[]`.
- Mỗi `cardAuth` có password riêng, cùng phone (phone công ty).
- Template đồng nhất, chỉ cho đổi thông tin cá nhân từng nhân viên.

### Giới hạn template theo mùa

- Thêm `availableFrom / availableTo` vào template config.
- Dashboard hiện badge "Sắp hết hạn" cho template Tết, Valentine, v.v.
