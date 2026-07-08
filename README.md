# Tapory Web (Góc Chạm)

Web bán **móc khóa kỷ niệm cá nhân hóa**: mỗi móc khóa có thể gắn **chip NFC** trỏ tới một **trang kỷ niệm** (album/lời nhắn/nhạc…) do khách tự chỉnh sửa, cùng dịch vụ **in ảnh** lên móc khóa.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 · Ant Design 6 · Redux Toolkit · TanStack Query · Firebase (Firestore + Auth) · Cloudflare R2 (ảnh) · pdf-lib.

---

## Chạy dự án

```bash
yarn install
yarn dev      # dev (localhost:3000)
yarn build    # build production (đã bật type-check)
yarn start    # chạy bản build
yarn lint
```

Tạo `.env.local`:

```
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
# Firebase Admin (server) — JSON service account 1 dòng
FIREBASE_SERVICE_ACCOUNT_KEY=...
# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
NEXT_PUBLIC_R2_PUBLIC_URL=https://...
# Khác
NEXT_PUBLIC_SITE_URL=https://...
```

> Không đọc `process.env` trực tiếp — import từ `src/libs/env.ts`.

---

## Luồng sử dụng

**Khách hàng**
1. Xem sản phẩm ở trang chủ / `/product/[slug]` → đặt hàng.
2. Đơn có **NFC** → hệ thống sinh sẵn chip `ORD...C1, C2...`. Khách vào `/edit/[cardId]` chỉnh nội dung trang kỷ niệm (bảo vệ bằng **SĐT làm mật khẩu**). Người xem chạm chip → mở `/view/[cardId]`.
3. Đơn có **in ảnh** → khách vào `/upload/[orderId]`, chọn ảnh, căn khung, bấm **Lưu** (ảnh được bake đúng vùng cắt rồi gửi cho bên in).

**Admin** (`/dashboard`, đăng nhập email/password)
- `orders` tạo/sửa đơn, ghi NFC, copy link upload ảnh in.
- `nfcs` quản lý mọi chip, **tạo link template độc lập** (không cần đơn), ghi NFC.
- `products` / `inventory` sản phẩm, biến thể, BOM, tồn kho.
- `print` xuất PDF ảnh in theo đơn. `settings` phí ship + tích hợp TikTok.

---

## Bản đồ tính năng — sửa ở đâu

| Tính năng | Nơi code |
|---|---|
| **Route/trang** | `src/app/(routes)/` (nhóm `(routes)` không vào URL) |
| **Template thẻ kỷ niệm** | `src/templates/<loại>/` + `registry.ts`. Sửa/thêm layout tại đây |
| **Editor thẻ** (`/edit`) | `src/features/editor/` · **Viewer** (`/view`): `src/features/view/` + hiệu ứng `src/features/preview/` |
| **Xác thực thẻ** (mật khẩu SĐT) | `src/features/auth/CardAuthGate.tsx` + `src/app/api/auth/{register,token,change-password}` · hash chung: **`src/utils/phone.ts`** |
| **Đơn hàng** | `src/services/OrderAPI.ts` · tạo đơn + sinh chip + trừ kho: **`src/utils/order-create.ts`** · API: `api/admin/create-order` |
| **Chip NFC** | `src/services/CardAPI.ts` · tạo link rời: `api/admin/create-card` · ghi chip: Web NFC trong `orders/[orderId]` & `nfcs` |
| **In ấn — kích thước/bố cục** | ⭐ **`src/configs/print.ts`** (nguồn sự thật: cỡ, DPI, gap, preset) |
| **In ấn — dàn lưới PDF A4** | **`src/utils/pdf-grid.ts`** (dùng chung cho cả 2 luồng) |
| **In ấn — editor cắt ảnh** | **`src/components/crop/ShapeCropCanvas.tsx`** · bake ra PNG 300 DPI: **`src/utils/crop-bake.ts`** |
| **In ấn — upload ảnh khách** | `app/(routes)/upload/[orderId]/` + `api/upload/print-photo` |
| **In ấn — xuất PDF** | theo đơn: `api/admin/export-print-pdf` · hàng loạt: `/keychain` + `src/features/keychain/` |
| **Sản phẩm / kho / BOM** | `dashboard/products/` · `ProductAPI` · `ComponentAPI` · `src/utils/bom.ts` |
| **Tích hợp TikTok** | `src/app/api/tiktok/*` + `dashboard/settings/TiktokCard.tsx` |
| **Hằng số / kiểu** | `src/configs/` · **CRUD hook dùng chung**: `src/hooks/base` |

---

## Lưu ý bảo trì

- **In ấn có 4 file "nguồn sự thật" dùng chung** (`configs/print`, `utils/pdf-grid`, `components/crop/ShapeCropCanvas`, `utils/crop-bake`) — chỉnh cỡ/bố cục/crop **chỉ sửa ở đây**, cả `/upload` lẫn `/keychain` ăn theo.
- **Đổi thuật toán mật khẩu → chỉ sửa `utils/phone.ts`** (đừng viết lại nơi khác kẻo lệch hash).
- State: **Redux** (`src/redux`, editor, có persist) cho trạng thái chỉnh sửa; **TanStack Query** cho dữ liệu server.
- Đọc `AGENTS.md` — bản Next.js này có thay đổi so với thói quen cũ; xem `node_modules/next/dist/docs/` khi cần.
