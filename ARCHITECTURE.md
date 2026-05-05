# Ecommerce Frontend — Next.js + Ant Design

Tài liệu tổng quan về cấu trúc, kiến trúc và cấu hình của dự án. Dùng làm **template hướng dẫn AI dựng lại một project tương tự** (ví dụ thay backend REST hiện tại bằng **Firebase**).

> Stack chính: **Next.js 15 (App Router) + React 19 + TypeScript + Ant Design 5 + Tailwind CSS 4 + Redux Toolkit + Redux Persist + TanStack Query + Axios**.

---

## 1. Tech stack

| Lớp                   | Thư viện                                                                                                     | Vai trò                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Framework             | `next@15.2.8` (App Router), `react@19`                                                                       | SSR / SSG / Routing                               |
| UI                    | `antd@5`, `@ant-design/icons`, `@ant-design/nextjs-registry`, `@ant-design/v5-patch-for-react-19`            | Component library + SSR cho AntD trong App Router |
| Styling               | `tailwindcss@4`, `@tailwindcss/postcss`, `tailwind-merge`, `clsx`, `class-variance-authority`, `next-themes` | Utility CSS + theme tối/sáng                      |
| State (client global) | `@reduxjs/toolkit`, `react-redux`, `redux-persist`                                                           | Auth state, cart, user — persist vào localStorage |
| State (server cache)  | `@tanstack/react-query`, `@tanstack/react-query-devtools`                                                    | Cache list/detail, mutation, invalidation         |
| HTTP                  | `axios` (instance riêng + interceptor)                                                                       | Gắn token, refresh token, xử lý 401               |
| Form / Validation     | `zod`, AntD `Form`                                                                                           | Schema + UI form                                  |
| Storage               | `js-cookie`, `next-cookies`, `localStorage`, `sessionStorage`                                                | Lưu token, cài đặt                                |
| Rich text             | `@tiptap/*`, `lexical`                                                                                       | Editor mô tả sản phẩm                             |
| Khác                  | `swiper`, `recharts`, `lucide-react`, `lodash`, `moment`, `aframe`, `sonner`                                 | Slider, biểu đồ, icon, util                       |
| Image                 | Cloudinary (upload trực tiếp client)                                                                         | Upload ảnh sản phẩm                               |
| Lint/Format           | `eslint` + `eslint-config-next` + `prettier` + `prettier-plugin-tailwindcss`                                 | Code quality                                      |

---

## 2. Cấu trúc thư mục

```
ecommerce-frontend/
├── public/                       # Static assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout — gắn tất cả Provider
│   │   ├── page.tsx              # Trang chủ
│   │   ├── globals.css           # Tailwind + biến CSS + override AntD
│   │   ├── (routes)/             # Route group — không xuất hiện trong URL
│   │   │   ├── auth/login/
│   │   │   ├── branches/
│   │   │   ├── dashboard/        # Khu vực admin (có layout riêng)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── categories/
│   │   │   │   ├── orders/
│   │   │   │   ├── products/
│   │   │   │   ├── product-item/
│   │   │   │   ├── promotions/
│   │   │   │   ├── statistics/
│   │   │   │   └── variation/
│   │   │   └── track-order/
│   │   ├── account/
│   │   ├── category/
│   │   ├── products/[slug]/      # Trang chi tiết sản phẩm (dynamic route)
│   │   ├── search/
│   │   └── shop-order/
│   │
│   ├── components/               # Component dùng chung
│   │   ├── base/                 # CartIcon, FilterSection, FloatingButton...
│   │   ├── layout/               # Header, Footer, MainLayout, HeroSection, ...
│   │   ├── ui/                   # Wrapper UI nhỏ: button, toggle, Section
│   │   ├── category/
│   │   ├── products/
│   │   └── rich-text-editor/
│   │
│   ├── configs/
│   │   ├── constants.ts          # Enum OrderStatus, PaymentType, status meta
│   │   ├── custom-constants.ts
│   │   ├── custom-types.ts       # IToken, ITokenPayload, IUser
│   │   └── types.ts              # IBaseQuery, ICreateCategory, ICreateProduct...
│   │
│   ├── hooks/                    # Custom hooks (1 thư mục/1 domain)
│   │   ├── base/                 # useFetchList / useFetchOne / useCreateItem / useUpdateItem / useDeleteItem
│   │   ├── category/
│   │   ├── category-variation/
│   │   ├── order/
│   │   ├── product/
│   │   ├── product-item/
│   │   ├── promotion/
│   │   ├── promotion-category/
│   │   ├── promotion-product/
│   │   ├── user-address/
│   │   ├── utils/
│   │   ├── variation/
│   │   └── variation-option/
│   │
│   ├── libs/
│   │   ├── custom-axios.ts       # Axios instance + interceptor (token, 401 redirect)
│   │   ├── env.ts                # Đọc env (NEXT_PUBLIC_*)
│   │   ├── storage.ts            # Wrapper Cookie / Local / Session / ServerCookie
│   │   ├── utils.ts              # cn(), format date/price, decode JWT, slug VN...
│   │   ├── ReduxProvider.tsx     # Provider Redux + PersistGate
│   │   └── TanstackProvider.tsx  # QueryClientProvider + Devtools
│   │
│   ├── redux/
│   │   ├── store.ts              # configureStore + persistReducer
│   │   ├── authSlice.ts          # Login, logout, decode token
│   │   ├── cartSlice.ts          # Giỏ hàng (persist)
│   │   └── userSlice.ts
│   │
│   ├── services/                 # Lớp gọi API (axios)
│   │   ├── AuthAPI.ts
│   │   ├── CategoryAPI.ts
│   │   ├── ProductAPI.ts
│   │   ├── ProductItemAPI.ts
│   │   ├── ShopOrderAPI.ts
│   │   ├── UserAPI.ts
│   │   ├── UserAdressAPI.ts
│   │   ├── VariationAPIs.ts
│   │   ├── VariationOptionAPIs.ts
│   │   ├── CategoryVariationAPIs.ts
│   │   ├── PromotionAPIs.ts
│   │   ├── PromotionCategoryAPIs.ts
│   │   ├── PromotionProductAPIs.ts
│   │   └── ProvinceAPI.ts
│   │
│   └── utils/
│       ├── cloudinary.ts         # Upload ảnh trực tiếp lên Cloudinary
│       └── slug.ts               # createSlug / extractIdFromSlug
│
├── .env                          # Biến môi trường
├── .eslintrc.js
├── .prettierrc
├── next.config.ts                # remotePatterns cho next/image
├── tailwind.config.js
├── postcss.config.mjs
├── tsconfig.json                 # baseUrl: ./src, paths: { "@/*": ["*"] }
└── package.json
```

---

## 3. Kiến trúc & quy ước

### 3.1 Phân lớp dữ liệu (data layer)

```
UI Component
   │
   ▼
Custom Hook (src/hooks/<domain>/index.ts)
   │  ── dựa trên hook generic ở src/hooks/base/index.ts
   ▼
Service API (src/services/*API.ts)
   │
   ▼
Axios instance (src/libs/custom-axios.ts)
   │
   ▼
Backend REST
```

**Quy ước generic CRUD** (`src/hooks/base/index.ts`): mỗi service implement interface tối thiểu

```ts
type CrudService = {
  getAll?: (params?: any) => Promise<any>;
  getOne?: (id: string, params?: any) => Promise<any>;
  createOne?: (data: any) => Promise<any>;
  updateOne?: (id: string, data: any) => Promise<any>;
  deleteOne?: (id: string) => Promise<any>;
};
```

→ Tự động có sẵn các hook: `useFetchList`, `useFetchOne`, `useCreateItem`, `useUpdateItem`, `useDeleteItem` (kèm toast `antd.message` + invalidate cache).

Ví dụ một domain hoàn chỉnh chỉ tốn ~30 dòng (xem `src/hooks/category/index.ts`):

```ts
const CATEGORY_KEY = ["categories"];
export const useCategories = () => useFetchList(CATEGORY_KEY, CategoryAPI);
export const useCategory = (id?: string) =>
  useFetchOne([CATEGORY_KEY, id], CategoryAPI, { enabled: !!id }, id);
export const useCreateCategory = () =>
  useCreateItem(CATEGORY_KEY, CategoryAPI, "Tạo thành công!", "Tạo thất bại!");
export const useUpdateCategory = () => useUpdateItem(CATEGORY_KEY, CategoryAPI);
export const useDeleteCategory = () => useDeleteItem(CATEGORY_KEY, CategoryAPI);
```

### 3.2 Provider stack (`src/app/layout.tsx`)

Thứ tự bọc rất quan trọng:

```tsx
<ThemeProvider>
  {" "}
  {/* next-themes: dark/light */}
  <ReduxProvider>
    {" "}
    {/* Redux + PersistGate */}
    <TanstackProvider>
      {" "}
      {/* React Query */}
      <AntdRegistry>
        {" "}
        {/* AntD SSR cho App Router */}
        <ConfigProvider>
          {" "}
          {/* AntD theme: token.fontFamily */}
          <StyleProvider hashPriority="low">{children}</StyleProvider>
        </ConfigProvider>
      </AntdRegistry>
    </TanstackProvider>
  </ReduxProvider>
</ThemeProvider>
```

- `@ant-design/v5-patch-for-react-19` import ở đầu file → fix tương thích AntD 5 với React 19.
- `StyleProvider hashPriority="low"` → cho Tailwind override AntD dễ hơn.

### 3.3 State management — chia rõ trách nhiệm

| Loại state                                      | Công cụ                                    | Slice/Key       |
| ----------------------------------------------- | ------------------------------------------ | --------------- |
| **Auth** (đã đăng nhập?, role, token payload)   | Redux + `redux-persist`                    | `auth`          |
| **Cart** (giỏ hàng client)                      | Redux + `redux-persist`                    | `cart`          |
| **User profile**                                | Redux (không persist, fetch lại sau login) | `user`          |
| **Server data** (categories, products, orders…) | TanStack Query                             | `[domain, ...]` |

`persistConfig` (`src/redux/store.ts`):

```ts
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["cart", "auth"],
};
```

→ Chỉ persist `cart` và `auth`; `user` luôn fetch lại để tránh stale.

### 3.4 Cấu hình Axios (`src/libs/custom-axios.ts`)

- Timeout 5 phút.
- Request interceptor: lấy `token` từ cookie (`Storage.Cookie.get<IToken>('token')`) → gắn header `Authorization: Bearer <accessToken>`.
- Response interceptor: nhận 401 → thử retry 1 lần; thất bại tiếp → xóa cookie + redirect `/auth/login`.
- Tự set `Content-Type: application/json` (trừ khi body là `FormData` — phục vụ upload).

### 3.5 Storage helper (`src/libs/storage.ts`)

API thống nhất 4 nguồn: `Cookie`, `ServerCookie` (đọc trong `getServerSideProps`), `Session`, `Local`. Tất cả đều typed generic `<T>`, tự `JSON.parse/stringify`.

### 3.6 Aliases & path

`tsconfig.json`:

```json
"baseUrl": "./src",
"paths": { "@/*": ["*"] }
```

→ Có thể import theo 2 cách (codebase đang dùng cả hai):

```ts
import { axios } from "@/libs/custom-axios";
import { axios } from "libs/custom-axios";
```

> **Khuyến nghị khi tái sử dụng:** thống nhất chỉ dùng `@/...` để dễ đọc.

### 3.7 Convention đặt tên

- Service: `<Domain>API.ts` — export `const <Domain>API = { getAll, getOne, createOne, updateOne, deleteOne, ...extra }`.
- Hook: `src/hooks/<domain>/index.ts` — `useXxxs` (list), `useXxx` (detail), `useCreateXxx`, `useUpdateXxx`, `useDeleteXxx`.
- Page: `src/app/.../page.tsx`. Layout riêng: `src/app/.../layout.tsx`.
- Route group: `src/app/(routes)/...` — không xuất hiện trong URL, dùng để gom layout admin/auth/...

---

## 4. Cấu hình cơ bản

### 4.1 Yêu cầu

- Node.js ≥ 18.18
- npm/yarn/pnpm bất kỳ (lockfile hiện có cả `package-lock.json` và `yarn.lock`)

### 4.2 Cài đặt & chạy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
npm run lint
```

### 4.3 Biến môi trường (`.env` ở root)

```env
# URL nội bộ
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://your-backend.example.com/api
NEXT_PUBLIC_MEDIA_URL=https://cdn.example.com

# Cloudinary (upload ảnh trực tiếp từ client)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_CLOUDINARY_API_KEY=xxx
NEXT_PUBLIC_CLOUDINARY_API_SECRET=xxx
```

> Biến public phải có prefix `NEXT_PUBLIC_`. Đọc tập trung qua `src/libs/env.ts`.

### 4.4 `next.config.ts`

- `images.remotePatterns`: whitelist các host được dùng với `next/image`.
- `typescript.ignoreBuildErrors: true` — bỏ qua lỗi TS khi build (chỉ nên giữ trong giai đoạn dev nhanh).

### 4.5 Tailwind 4 + AntD

- `tailwind.config.js`: `corePlugins.preflight: false` để **không reset CSS của AntD**.
- `globals.css`: dùng `@layer base, antd, components, utilities` để kiểm soát thứ tự override; viết override AntD trong `@layer utilities`.
- AntD theme đặt trong `<ConfigProvider theme={{ token: { fontFamily } }}>`.

### 4.6 Lint/Format

- ESLint: extend `next/core-web-vitals`; tắt một loạt rule khắt khe (`no-unused-vars`, `no-explicit-any`, `react-hooks/exhaustive-deps`...). Khi tái sử dụng cho project mới, cân nhắc bật lại để code chặt chẽ hơn.
- Prettier: `singleQuote: true`, `trailingComma: "all"`.

---

## 5. Hướng dẫn chuyển sang backend Firebase

> Toàn bộ lớp UI / Provider / Redux / hook / convention CRUD **giữ nguyên**. Chỉ thay lớp service API và một phần auth/storage. Đây là điểm mạnh của kiến trúc tách layer hiện tại.

### 5.1 Cài đặt Firebase

```bash
npm install firebase
# hoặc kèm hooks tiện dụng
npm install firebase react-firebase-hooks
```

Tạo `src/libs/firebase.ts`:

```ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
```

`.env` thay thế:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 5.2 Bỏ `custom-axios.ts`

Không còn REST endpoint → bỏ file `src/libs/custom-axios.ts`. Mọi service viết lại dựa trên Firebase SDK nhưng **giữ nguyên shape `CrudService`** để hook generic không phải sửa.

Ví dụ `src/services/CategoryAPI.ts` viết lại với Firestore:

```ts
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/libs/firebase";

const COL = "categories";

export const CategoryAPI = {
  getAll: async () => {
    const snap = await getDocs(
      query(collection(db, COL), orderBy("createdAt", "desc")),
    );
    return { data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  },
  getOne: async (id: string) => {
    const snap = await getDoc(doc(db, COL, id));
    return { data: snap.exists() ? { id: snap.id, ...snap.data() } : null };
  },
  createOne: async (data: any) => {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { data: { id: ref.id } };
  },
  updateOne: async (id: string, data: any) => {
    await updateDoc(doc(db, COL, id), data);
    return { data: { id } };
  },
  deleteOne: async (id: string) => {
    await deleteDoc(doc(db, COL, id));
    return { data: { id } };
  },
};
```

> Trả về theo dạng `{ data: ... }` để hook generic ở `src/hooks/base/index.ts` (`response?.data`) không phải đổi.

### 5.3 Thay `AuthAPI`

Dùng Firebase Authentication:

```ts
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/libs/firebase";

export const AuthAPI = {
  logIn: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),
  logOut: () => signOut(auth),
  onAuthStateChanged: (cb: (user: any) => void) => onAuthStateChanged(auth, cb),
};
```

Sửa `redux/authSlice.ts`:

- Bỏ phần decode JWT thủ công (`Buffer.from(...).toString`).
- Lưu `uid`, `email`, `role` (custom claim hoặc đọc từ Firestore `users/{uid}`).
- `logIn` thunk: gọi `AuthAPI.logIn`, sau đó nghe `onAuthStateChanged` để cập nhật state thay vì đọc cookie.
- Có thể bỏ `Storage.Cookie.set('token', ...)` — Firebase SDK tự quản lý token trong IndexedDB.

### 5.4 Upload ảnh — Firebase Storage thay Cloudinary

Tạo `src/utils/firebase-storage.ts`:

```ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/libs/firebase";

export const uploadImage = async (
  file: File,
  path = `images/${Date.now()}-${file.name}`,
) => {
  const r = await uploadBytes(ref(storage, path), file);
  return { secure_url: await getDownloadURL(r.ref), public_id: r.ref.fullPath };
};
```

Có thể bỏ hoàn toàn `src/utils/cloudinary.ts` và bỏ các biến `NEXT_PUBLIC_CLOUDINARY_*` trong `env.ts`.

### 5.5 Realtime (tùy chọn — điểm mạnh của Firebase)

Với những list cần cập nhật realtime (đơn hàng, tồn kho), thay `useFetchList` bằng hook tự viết quanh `onSnapshot`:

```ts
export const useOrdersRealtime = () => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) =>
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return unsub;
  }, []);
  return { data };
};
```

### 5.6 Bảo mật

- Viết **Firestore Security Rules** thay cho việc kiểm tra role ở backend.
- Role lưu ở custom claims (`auth.token.role`) hoặc collection `users/{uid}`.
- Mọi mutation nhạy cảm (cập nhật giá, xóa đơn) nên đẩy lên **Cloud Functions** thay vì gọi trực tiếp từ client.

### 5.7 Checklist chuyển đổi

- [ ] Cài `firebase`, tạo `src/libs/firebase.ts`.
- [ ] Cập nhật `.env` (bỏ `NEXT_PUBLIC_API_URL`, thêm `NEXT_PUBLIC_FIREBASE_*`).
- [ ] Xóa `src/libs/custom-axios.ts`, gỡ import `axios` ở các service.
- [ ] Viết lại từng `*API.ts` theo Firestore, **giữ nguyên shape `{ getAll, getOne, createOne, updateOne, deleteOne }`** và format trả về `{ data }`.
- [ ] Sửa `redux/authSlice.ts` để dùng `onAuthStateChanged` thay cookie/JWT decode.
- [ ] Thay `utils/cloudinary.ts` bằng `firebase/storage`.
- [ ] Cập nhật `next.config.ts` → thêm `firebasestorage.googleapis.com` vào `images.remotePatterns`.
- [ ] Viết Security Rules cho Firestore + Storage.
- [ ] (Tuỳ chọn) Convert một số hook sang `onSnapshot` để có realtime.

---

## 6. Quy ước thêm domain mới (giữ chung cho cả 2 backend)

1. Định nghĩa type ở `src/configs/types.ts` (hoặc `custom-types.ts`).
2. Tạo service `src/services/<Domain>API.ts` implement đủ `getAll/getOne/createOne/updateOne/deleteOne`.
3. Tạo hook `src/hooks/<domain>/index.ts` gồm 5 hook chuẩn dựa trên generic.
4. Tạo page trong `src/app/(routes)/dashboard/<domain>/page.tsx` cho admin và `src/app/<domain>/...` cho frontend user.
5. Component dùng riêng cho domain đặt trong `src/components/<domain>/`; component dùng chung đặt ở `base/` hoặc `ui/`.

---

## 7. Lưu ý khi đưa cho AI dựng project mới

Khi prompt cho AI dựng template tương tự với Firebase, nên nhấn các điểm sau để giữ kiến trúc thống nhất:

1. **Không gọi Firebase SDK trực tiếp trong component** — luôn đi qua `services/*API.ts` và hook `hooks/<domain>/`.
2. **Hook generic ở `src/hooks/base/index.ts` không được sửa** — service phải tự thích nghi để khớp interface.
3. **Provider stack giữ nguyên thứ tự** ở `src/app/layout.tsx` (Theme → Redux → Tanstack → AntdRegistry → ConfigProvider → StyleProvider).
4. **Persist whitelist** chỉ gồm `cart` và `auth`; không persist server data.
5. **Tailwind không preflight** để không phá AntD; override AntD trong `@layer utilities`.
6. **Mọi biến env phải có `NEXT_PUBLIC_`** nếu dùng phía client, và đọc tập trung qua `src/libs/env.ts`.
