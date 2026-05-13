# Góc Chạm — Luồng hoàn chỉnh từ đặt hàng đến xem trang final

> **Kênh bán hàng:** TikTok Shop & Shopee — không có form đặt hàng trên website.

---

## Tổng quan 6 giai đoạn

```
[1] KHÁCH ĐẶT TRÊN TIKTOK/SHOPEE
        ↓
[2] ADMIN NHẬN ĐƠN & NHẬP VÀO TAPORY DASHBOARD
        ↓
[3] LẬP TRÌNH CHIP & ĐÓNG GÓI & GIAO HÀNG
        ↓
[4] KHÁCH QUÉT THẺ NFC LẦN ĐẦU
        ↓
[5] XÁC THỰC SĐT & CHỈNH SỬA
        ↓
[6] XEM TRANG KẾT QUẢ FINAL
```

---

## GIAI ĐOẠN 1 — Khách đặt hàng trên TikTok Shop / Shopee

### 1.1 Khách tìm thấy sản phẩm

- Xem video TikTok demo thẻ NFC → vào TikTok Shop đặt.
- Hoặc tìm kiếm "thẻ NFC kỷ niệm" trên Shopee → xem ảnh mẫu → đặt.
- Khách **không cần vào tapory.vn** ở bước này.

### 1.2 Khách đặt hàng trên sàn

- Điền địa chỉ giao hàng như mọi đơn bình thường.
- Chọn biến thể nếu có (Basic / Premium / Bundle).
- Phần **Ghi chú đơn hàng** (note): khuyến khích khách ghi thêm:

  ```
  "SĐT nhận thẻ: 0912345678 (nếu khác SĐT đặt hàng)"
  ```

  > Vì SĐT trên TikTok/Shopee có thể là SĐT phụ hoặc bị ẩn một phần.

- Thanh toán qua cổng của sàn (COD, ShopeePay, TikTok Pay...).

### 1.3 Sàn thông báo cho shop

- TikTok Shop / Shopee gửi notification đơn mới vào app Seller Center.
- Admin thấy đơn kèm:
  - Tên người mua (có thể là nickname)
  - SĐT (đôi khi bị ẩn 3 số giữa: `091***678`)
  - Địa chỉ giao hàng
  - Ghi chú đơn hàng
  - Sản phẩm + số lượng

---

## GIAI ĐOẠN 2 — Admin nhận đơn & nhập vào Góc Chạm Dashboard

### 2.1 Admin nhập đơn vào Góc Chạm Dashboard

Admin mở Seller Center TikTok/Shopee → thấy đơn mới với đầy đủ thông tin (tên, SĐT, địa chỉ).

Admin vào `/dashboard/orders` → **"Thêm đơn mới"** → copy thông tin từ Seller Center vào:

```
Nguồn đơn:      [x] TikTok Shop  [ ] Shopee  [ ] Khác
Mã đơn sàn:     TK-20260508-ABC123   ← copy từ Seller Center
Tên khách:      Nguyễn Thị Mai
SĐT kích hoạt:  0912345678           ← SĐT đầy đủ, thấy rõ trong Seller Center
Địa chỉ:        Q.1, TP.HCM
Sản phẩm:       [x] Basic  [ ] Premium  [ ] Bundle
Ghi chú:        Khách ghi "tặng bạn gái ngày 20/5"
```

> **Lưu ý duy nhất về SĐT:** Nếu khách mua để **tặng người khác**, SĐT trong Seller Center là SĐT người mua — nhưng người dùng thẻ lại là người được tặng. Cần nhờ khách nhắn chat shop SĐT người nhận trong trường hợp này.

### 2.3 Hệ thống tạo đơn trong Firestore

```
orders/{autoId} = {
  orderCode:     "TP-001234",         ← mã nội bộ Góc Chạm
  source:        "tiktok",            ← "tiktok" | "shopee" | "other"
  platformOrderId: "TK-20260508-ABC", ← mã đơn trên sàn (để tra cứu)
  customerName:  "Nguyễn Thị Mai",
  customerPhone: "0912345678",        ← plain text, chỉ admin đọc
  shippingAddress: { ... },
  quantity:      1,
  packageType:   "basic",
  status:        "processing",        ← bỏ qua bước pending_payment vì sàn lo
  paymentStatus: "paid",              ← sàn đã xử lý
  createdAt:     now,
  createdBy:     "admin_uid",
}
```

### 2.4 Admin sinh Card ID & liên kết vào đơn

```
Admin click "Tạo thẻ NFC" trong đơn hàng
  ↓
Hệ thống sinh cardId: "tp_x7k2m9"
  ↓
Tạo cards/tp_x7k2m9 = {
  orderId:       "TP-001234",
  customerPhone: "0912345678",         ← plain text
  phoneHash:     sha256("0912345678"), ← dùng để client verify
  status:        "assigned",
  hasContent:    false,
  stats:         { totalViews: 0 },
  createdAt:     now,
}
  ↓
orders/TP-001234.cardIds = ["tp_x7k2m9"]
  ↓
Dashboard hiển thị: URL sẽ ghi vào chip: "tapory.vn/c/tp_x7k2m9"
```

---

## GIAI ĐOẠN 3 — Lập trình chip & Đóng gói & Giao hàng

### 3.1 Lập trình NFC chip

Kỹ thuật viên (hoặc chính admin):

1. Mở **NFC Tools** (Android) hoặc **NFC for iPhone**.
2. Chọn **Write → URL**.
3. Nhập: `https://tapory.vn/c/tp_x7k2m9`
4. Chạm điện thoại vào chip NFC → ghi xong (~2 giây).
5. **Test bắt buộc:** Quét lại → trình duyệt mở đúng URL → pass.
6. Admin cập nhật trên dashboard: in nhãn hoặc đánh dấu chip đã lập trình.

> Với đơn Bundle 3 thẻ → lặp lại 3 lần với 3 cardId khác nhau.

### 3.2 In tờ hướng dẫn (cực quan trọng)

Mỗi đơn hàng kèm 1 tờ nhỏ:

```
╔══════════════════════════════════════╗
║   TAPORY — HƯỚNG DẪN KÍCH HOẠT      ║
╠══════════════════════════════════════╣
║                                      ║
║  Bước 1: Quét thẻ NFC bằng          ║
║          điện thoại của bạn          ║
║                                      ║
║  Bước 2: Nhập số điện thoại bạn     ║
║          dùng khi đặt hàng          ║
║          (SĐT: 091***678)            ║ ← hiện 3 số đầu + 3 cuối để gợi nhớ
║                                      ║
║  Bước 3: Chọn mẫu, thêm ảnh và     ║
║          nội dung theo ý thích       ║
║                                      ║
║  Bước 4: Nhấn Lưu — Xong! 🎉       ║
║                                      ║
╠══════════════════════════════════════╣
║  Hỗ trợ: Chat shop TikTok/Shopee    ║
║  Mã thẻ: TP-001234                   ║
╚══════════════════════════════════════╝
```

> Tại sao gợi nhớ SĐT? Vì khách mua trên TikTok/Shopee hay dùng nhiều SĐT, dễ quên cái nào đã đặt.

### 3.3 Đóng gói & giao qua sàn

- Đóng gói thẻ + tờ hướng dẫn.
- **Bắt buộc giao qua kênh ship của sàn** (TikTok Shipping / SPX Express) để:
  - Được bảo vệ bởi chính sách sàn.
  - Khách đánh giá 5 sao trực tiếp trên sàn.
  - Shop nhận doanh thu từ sàn sau khi giao thành công.
- Admin cập nhật trạng thái giao hàng trên Seller Center của sàn.
- Đồng thời cập nhật trên Góc Chạm dashboard: `status: 'shipped'`, nhập mã vận đơn.

---

## GIAI ĐOẠN 4 — Khách quét thẻ NFC lần đầu

### 4.1 Khách nhận hàng & quét thẻ

- Khách nhận hàng → mở hộp → đọc tờ hướng dẫn.
- Chạm điện thoại vào thẻ:
  - **Android:** Notification popup xuất hiện → tap để mở Chrome.
  - **iPhone iOS 14+:** Banner trên cùng → tap để mở Safari.
- Trình duyệt mở: `https://tapory.vn/c/tp_x7k2m9`

### 4.2 Route /c/[cardId] — Bộ điều hướng trung tâm

```
GET /c/tp_x7k2m9  (Next.js Route Handler)
  ↓
Đọc Firestore: cards/tp_x7k2m9
  ↓
┌──────────────────────────────────────────────────────────┐
│ Không tìm thấy doc                                        │
│   → Trang: "Thẻ không hợp lệ" + link liên hệ hỗ trợ     │
│                                                           │
│ status = "blank"                                          │
│   → Trang: "Thẻ chưa được kích hoạt" + link liên hệ      │
│                                                           │
│ status = "expired"                                        │
│   → Trang: "Thẻ đã hết hạn" + link gia hạn               │
│                                                           │
│ status = "locked"                                         │
│   ├── hasContent = true  → redirect /view/tp_x7k2m9       │
│   └── hasContent = false → "Thẻ bị khoá, liên hệ hỗ trợ" │
│                                                           │
│ status = "assigned"  (hasContent = false)                 │
│   → redirect /edit/tp_x7k2m9  ← LUỒNG CHÍNH lần đầu      │
│                                                           │
│ status = "published" (hasContent = true)                  │
│   → redirect /view/tp_x7k2m9  ← LUỒNG CHÍNH lần sau      │
└──────────────────────────────────────────────────────────┘
  ↓ (song song, không block redirect)
Ghi cardViews: { cardId, timestamp, userAgent, isOwnerView: false }
Increment cards.stats.totalViews += 1
```

---

## GIAI ĐOẠN 5 — Xác thực SĐT & Chỉnh sửa

### 5.1 Trang /edit/tp_x7k2m9 load lên

Trước khi hiện editor, kiểm tra auth:

```
Có "tapory_auth_tp_x7k2m9" trong sessionStorage?
  ├── Có & còn hạn → vào editor luôn
  └── Không → hiện màn hình nhập SĐT
```

### 5.2 Màn hình xác thực SĐT

```
┌─────────────────────────────────────┐
│                                      │
│         🪪  Góc Chạm                  │
│                                      │
│   Nhập số điện thoại bạn đã dùng    │
│   khi đặt hàng trên TikTok/Shopee   │
│                                      │
│   ┌─────────────────────────────┐   │
│   │  0912 345 678               │   │
│   └─────────────────────────────┘   │
│                                      │
│   ┌─────────────────────────────┐   │
│   │      Xác nhận →             │   │
│   └─────────────────────────────┘   │
│                                      │
│   Không nhớ SĐT? Chat với shop      │
│   TikTok / Shopee để được hỗ trợ    │
│                                      │
└─────────────────────────────────────┘
```

> **Lý do dùng SĐT thay vì mã đơn hàng:** Khách nhớ SĐT hơn mã đơn. Hơn nữa, mã đơn sàn dài và khó gõ.

### 5.3 Luồng xác thực

```
Khách nhập SĐT → client chuẩn hoá:
  "0912 345 678" → "0912345678"
  "+84912345678" → "0912345678"
  "84912345678"  → "0912345678"
  ↓
Client tính: inputHash = sha256("0912345678")
  ↓
Đọc Firestore: cards/tp_x7k2m9.phoneHash
  ↓
inputHash === phoneHash ?
  │
  ├── SAI (≤ 5 lần)
  │    → Lỗi: "Số điện thoại không đúng."
  │    → Gợi ý: "Thử lại với SĐT bạn dùng trên TikTok/Shopee"
  │
  ├── SAI (> 5 lần)
  │    → Khoá 30 phút
  │    → Hiện: "Vui lòng liên hệ shop qua TikTok/Shopee để được hỗ trợ"
  │
  └── ĐÚNG
       ↓
       Gọi Cloud Function: POST /issueCardToken { cardId }
         (Function verify lại server-side, tránh bypass)
         → Trả Firebase Custom Token { cardId, role: "card_owner" }
       ↓
       signInWithCustomToken(token)
       ↓
       sessionStorage.set("tapory_auth_tp_x7k2m9", token)
       ↓
       Hiện Editor
```

### 5.4 Lần đầu vào — Chọn template

Vì `memorials/tp_x7k2m9` chưa tồn tại, editor hiện bước **chọn mẫu**:

```
┌──────────────────────────────────────────────────┐
│  Chọn mẫu thẻ của bạn                            │
│  (Bạn có thể đổi mẫu bất cứ lúc nào)            │
│                                                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │   🎓   │ │   💍   │ │   🎂   │ │   💕   │    │
│  │Tốt     │ │Đám     │ │Sinh    │ │Kỷ      │    │
│  │Nghiệp  │ │Cưới    │ │Nhật    │ │Niệm    │    │
│  └────────┘ └────────┘ └────────┘ └────────┘    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │   🎵   │ │   📲   │ │   🪪   │ │   🔗   │    │
│  │Spotify │ │Social  │ │Profile │ │Redirect│    │
│  └────────┘ └────────┘ └────────┘ └────────┘    │
│                                                   │
│  [Preview mẫu khi hover/tap vào từng ô]          │
└──────────────────────────────────────────────────┘
```

### 5.5 Editor chỉnh sửa

```
┌────────────────┬───────────────────────────────┐
│  PREVIEW       │  PANEL CHỈNH SỬA              │
│  (real-time)   │                               │
│                │  Style:   [Luxury] [Soft]...  │
│  [Phone        │  Khung:   [Floral] [Lace]...  │
│   mockup       │  Hiệu ứng:[Tim bay][Pháo hoa] │
│   232×500px    │                               │
│   live update] │  Tên:     [_______________]   │
│                │  Ngày:    [_______________]   │
│                │  Mô tả:   [_______________]   │
│                │  Ảnh:     [📷 Tải ảnh lên]   │
│                │  Spotify: [_______________]   │
│                │                               │
│                │  [👁 Xem toàn màn hình]       │
│                │  [💾 Lưu thẻ của tôi]        │
└────────────────┴───────────────────────────────┘
```

Mọi thay đổi → lưu vào Redux (persist localStorage) → không mất khi tắt app.

### 5.6 Upload ảnh

```
Khách chọn ảnh từ camera roll
  ↓
Client compress: max 1200px, max 800KB
  ↓
Upload lên Firebase Storage:
  cards/tp_x7k2m9/avatar_[timestamp].jpg
  ↓
Nhận downloadURL → cập nhật preview ngay
```

### 5.7 Khách nhấn "Lưu thẻ của tôi"

```
Validate: title không trống
  ↓
Confirm dialog:
  "Lưu và chia sẻ thẻ?
   Sau khi lưu, bất kỳ ai quét thẻ NFC đều xem được.
   Bạn vẫn có thể chỉnh sửa sau."
  ↓
Gọi MemorialAPI.createOne({ orderId: "tp_x7k2m9", ... })
  → Tạo memorials/tp_x7k2m9
  ↓
Cập nhật cards/tp_x7k2m9:
  { status: "published", hasContent: true, publishedAt: now }
  ↓
Xoá Redux draft khỏi localStorage
  ↓
Toast: "🎉 Thẻ của bạn đã sẵn sàng!"
  ↓
Redirect → /view/tp_x7k2m9 (sau 1.5 giây)
  ↓
Admin dashboard tự cập nhật:
  orders/TP-001234.status = "done"
  cards/tp_x7k2m9.status  = "published"
```

---

## GIAI ĐOẠN 6 — Xem trang kết quả

### 6.1 Mọi lần quét sau khi đã publish

```
Bất kỳ ai quét thẻ:
  → /c/tp_x7k2m9
  → cards.hasContent = true
  → redirect /view/tp_x7k2m9
```

### 6.2 Middleware xử lý template Redirect

```ts
// middleware.ts chạy tại /view/[cardId]
// Nếu templateId === 'redirect' AND memorial.website hợp lệ
// → 302 redirect ra ngoài ngay, người xem không thấy trang Góc Chạm
```

### 6.3 Trang /view render

```
ViewClient mount
  ↓
TanStack Query: MemorialAPI.getOne("tp_x7k2m9")
  (staleTime: 5 phút — cache tốt khi nhiều người quét cùng lúc)
  ↓
Tính scale = min(vw/232, vh/500)
  → Fit khít màn hình mọi thiết bị (iPhone SE → iPad)
  ↓
Render full-screen:
  ├── TemplateRenderer  (layout theo templateId + styleId)
  ├── FrameOverlay      (khung trang trí)
  └── EffectOverlay     (hiệu ứng động chạy tự động)
  ↓
Góc phải dưới: nút ✏️ nhỏ
  → Chủ thẻ nhấn để vào /edit và chỉnh sửa lại
  → Người lạ nhấn vào cũng bị chặn tại màn hình nhập SĐT
```

---

## Sơ đồ trạng thái thẻ

```
[blank] ──── admin assign vào đơn ────→ [assigned]
                                              │
                                    khách quét & lưu memorial
                                              │
                                         [published] ←── khách edit lại
                                              │
                              admin khoá / quá editDeadline
                                              │
                                          [locked]
                                              │
                                   (subscription model)
                                              │
                                          [expired]
```

---

## Edge cases thực tế khi bán qua sàn

### ❌ Khách quên SĐT đã đặt hàng

**Tình huống:** Khách có nhiều SĐT, không nhớ dùng SĐT nào khi đặt trên TikTok/Shopee.

**Giải pháp:**

- Tờ hướng dẫn trong hộp ghi gợi nhớ: _"SĐT kích hoạt: 091\*\*\*678"_ (3 số đầu + 3 số cuối).
- Khách vẫn không nhớ → chat shop TikTok/Shopee → admin tra `platformOrderId` → báo lại SĐT cho khách.
- Admin có thể **đổi SĐT** trên dashboard nếu khách yêu cầu (xác minh qua chat sàn là đủ).

### 🎁 Mua tặng người khác

- Người mua đặt hàng → trong ghi chú ghi _"SĐT người nhận: 0933333333"_.
- Admin nhập `customerPhone = 0933333333` (SĐT người nhận, không phải người mua).
- Người nhận quà nhập SĐT của mình → vào editor được.

### 📦 Đơn Bundle 3 thẻ

- Admin tạo 3 cardId riêng: `tp_aaa111`, `tp_bbb222`, `tp_ccc333`.
- Cả 3 đều có `phoneHash` giống nhau (cùng 1 SĐT đặt hàng).
- Hoặc nếu 3 thẻ cho 3 người khác nhau → admin nhập 3 SĐT riêng.

### ⭐ Quản lý đánh giá sàn

- Sau khi `cards.status = "published"`, hệ thống có thể gửi SMS/Zalo:
  _"Thẻ Góc Chạm của bạn đã hoạt động! Nếu hài lòng, hãy đánh giá 5⭐ cho shop nhé: [link review Shopee/TikTok]"_
- Tăng rating sàn, tăng hiển thị tự nhiên.

### 🔄 Khách muốn đổi mẫu sau khi đã publish

- Nhấn ✏️ → `/edit/tp_x7k2m9` → nhập lại SĐT → vào editor với data cũ.
- Thay đổi thoải mái → nhấn Lưu → `MemorialAPI.updateOne(...)` ghi đè.

### 📵 Khách không biết cách quét NFC (iPhone cũ / không quen)

- Tờ hướng dẫn cần có QR code backup: `qr.tapory.vn/tp_x7k2m9` → cùng redirect logic.
- Khách quét QR = quét NFC, cùng kết quả.

---

## Timeline thực tế

```
T+0       Khách đặt hàng trên TikTok/Shopee
T+1-2h    Admin nhận đơn trên Seller Center
T+2-3h    Admin nhập đơn vào Góc Chạm Dashboard, sinh cardId
T+2-3h    Kỹ thuật viên lập trình chip NFC
T+3-4h    Đóng gói, bàn giao shipper (nội thành)
T+1-3d    Shipper giao hàng đến khách
T+?       Khách quét thẻ → nhập SĐT → chọn mẫu → chỉnh sửa
T+?       Khách nhấn Lưu → thẻ live 🎉
T+?+SMS   Hệ thống nhắc khách đánh giá sàn ⭐⭐⭐⭐⭐
```

---

## Mapping vào codebase hiện tại

| Bước                               | Hiện trạng      | Cần làm                                    |
| ---------------------------------- | --------------- | ------------------------------------------ |
| Route `/c/[cardId]`                | ❌ Chưa có      | Tạo `app/(routes)/c/[cardId]/route.ts`     |
| Màn hình auth SĐT                  | ❌ Chưa có      | Gate trước `EditorContainer`               |
| Bước chọn template lần đầu         | ❌ Chưa có      | Thêm vào `EditClient` khi chưa có memorial |
| Cloud Function `issueCardToken`    | ❌ Chưa có      | Firebase Functions                         |
| Dashboard nhập đơn thủ công        | ✅ UI có (mock) | Wire Firestore + form tạo đơn              |
| Field `source` / `platformOrderId` | ❌ Chưa có      | Thêm vào `orders` schema                   |
| Analytics `cardViews`              | ❌ Chưa có      | Tạo collection + ghi khi quét              |
| SMS/Zalo nhắc đánh giá             | ❌ Chưa có      | ESMS / Zalo OA API (sau này)               |
