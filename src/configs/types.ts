export type TemplateId = 'graduation' | 'wedding' | 'birthday' | 'anniversary' | 'spotify' | 'social' | 'profile' | 'redirect';

export type CardStatus = 'blank' | 'assigned' | 'published' | 'locked' | 'expired';

export interface ICard {
  id: string;
  orderId: string;
  status: CardStatus;
  hasContent: boolean;
  templateId?: TemplateId;
  editDeadline?: string;
  publishedAt?: string;
  lockedAt?: string;
  lockedBy?: string;
  nfcWritten?: boolean;
  nfcWrittenAt?: string;
  stats: { totalViews: number; lastViewedAt?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface ITemplateStyle {
  id: string;
  name: string;
  layout: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface IFrame {
  id: string;
  name: string;
  icon: string;
}

export interface IEffect {
  id: string;
  name: string;
  icon: string;
}

export interface IIntro {
  id: string;
  name: string;
  icon: string;
  hint: string;
}

export interface ITemplate {
  id: TemplateId;
  name: string;
  icon: string;
  occasion: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export type ProductStatus = 'draft' | 'active' | 'archived';

/** Mức phí vận chuyển */
export interface IShippingRate {
  id: string;
  name: string;           // "Nội thành HCM", "Tỉnh thành khác"
  price: number;
  estimatedDays?: string; // "1-2 ngày", "3-5 ngày"
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Ảnh mẫu in sẵn gắn với một sản phẩm */
export interface IPresetPhoto {
  id: string;
  productId: string;
  url: string;
  key: string;       // R2 key để xóa
  name?: string;
  sortOrder?: number;
  createdAt?: string;
}

/** Dịch vụ cộng thêm toàn hệ thống (NFC, Gói quà, Express...) */
export interface IService {
  id: string;
  name: string;
  price: number;
  enablesNfc?: boolean;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PrintShape = 'rectangle' | 'square' | 'circle';

export interface IPrintPhotoSlot {
  itemIndex: number;
  slotIndex: number; // 0..quantity-1
  side?: 'a' | 'b'; // NFC items have 2 sides; non-NFC omits this (treated as 'a')
  url: string;
  uploadedAt: string;
}

export interface IPrintConfig {
  enabled: boolean;
  shape?: PrintShape;
  width?: number;    // cm - cho rectangle / square
  height?: number;   // cm - cho rectangle
  diameter?: number; // cm - cho circle
}

/**
 * Loại sản phẩm vật lý — quyết định flow xử lý & các thuộc tính cá nhân hóa riêng.
 * Mở rộng dòng hàng mới (gấu bông, khung ảnh...) = thêm một giá trị ở đây, không đổi schema.
 */
export type ProductType = 'keychain' | 'plush' | 'photo-frame' | 'standee' | 'card' | 'other';

/** Linh kiện / nguyên vật liệu rời — đơn vị tồn kho thực tế trong mô hình BOM. */
export interface IComponent {
  id: string;
  name: string;              // "Chip NFC", "Charm ngôi sao", "Phôi tròn"
  description?: string;      // ghi chú: kích thước, màu, nhà cung cấp...
  stock: number;             // qty_on_hand
  reserved?: number;         // qty_reserved (để dành cho checkout đồng thời sau này)
  unit?: string;             // "cái", "chiếc"
  lowStockThreshold?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Một dòng định mức (BOM): mỗi sản phẩm tiêu hao `qty` đơn vị của linh kiện `componentId`. */
export interface IBomLine {
  componentId: string;
  name?: string;   // snapshot tên linh kiện để hiển thị
  qty: number;
}

/**
 * Một giá trị của tùy chọn sản phẩm.
 * VD trong option "Hình dạng": { id: 'circle', name: 'Tròn' }.
 */
export interface IOptionValue {
  id: string;            // 'circle' | 'yes' | 'star'...
  name: string;          // nhãn hiển thị: 'Tròn'
  priceDelta?: number;   // chênh lệch giá so với base (chỉ dùng khi option.createsVariant)
  imageUrl?: string;
  /** Linh kiện tiêu hao khi chọn giá trị này (BOM). VD value "Tròn" → phôi tròn. */
  componentId?: string;
  componentQty?: number; // số lượng tiêu hao, mặc định 1
}

/**
 * Một nhóm tùy chọn của sản phẩm.
 *
 * Quy tắc phân loại (áp dụng nhất quán):
 * - `createsVariant: true`  → mỗi value làm đổi giá vốn/giá bán/tồn kho ⇒ là VARIANT
 *   (hình dạng, có/không NFC, charm). Tổ hợp các option này sinh ra `IProductVariant`.
 * - `createsVariant: false` → chỉ là nội dung khách hóa cá nhân lên cùng một sản phẩm
 *   vật lý ⇒ là CUSTOMIZATION (ảnh upload, thông điệp, ảnh chọn từ thư viện).
 *   KHÔNG nhân tồn kho, lưu vào `IItemCustomization` (JSON).
 */
export interface IProductOption {
  id: string;            // 'shape' | 'nfc' | 'charm' | 'photo' | 'message'
  name: string;          // 'Hình dạng'
  createsVariant: boolean;
  required?: boolean;
  values: IOptionValue[];
  sortOrder?: number;
}

/** Một tổ hợp cấu hình + giá cố định của sản phẩm (VD: "NFC + In vuông 3×3cm") */
export interface IProductVariant {
  name: string;
  price: number;
  /** Mã SKU duy nhất để quản lý kho & đối soát đơn. */
  sku?: string;
  /**
   * Tổ hợp option tạo nên biến thể này, mỗi phần tử dạng "optionId:valueId".
   * VD: ['shape:circle', 'nfc:yes', 'charm:star'].
   * Đây là cách Firestore thay thế bảng nối VariantValue (n-n) trong mô hình SQL —
   * lưu thẳng mảng trong document thay vì JOIN.
   */
  optionValues?: string[];
  /** Tồn kho thực có (qty_on_hand). */
  stock?: number;
  /**
   * Số lượng đang giữ chỗ cho đơn chưa hoàn tất (qty_reserved) để tránh oversell.
   * Số bán được = stock - reserved. Hiện chưa dùng (đơn nhập tay từ TikTok/Shopee),
   * để sẵn cho khi có checkout trực tiếp đồng thời — khi đó reserve/release phải
   * chạy trong Firestore runTransaction.
   */
  reserved?: number;
  imageUrl?: string;
  isNfc?: boolean;           // variant này bao gồm NFC (không cần toggle thêm)
  printConfig?: IPrintConfig; // override printConfig của sản phẩm cha
}

export interface IProduct {
  id: string;
  name: string;
  type?: ProductType;        // mặc định 'keychain' nếu thiếu (tương thích data cũ)
  price: number;
  status: ProductStatus;
  stock?: number;            // chỉ dùng khi không có variants (qty_on_hand)
  reserved?: number;         // giữ chỗ khi không có variants — xem IProductVariant.reserved
  canBeNfc: boolean;         // chỉ dùng khi không có variants
  nfcExtraPrice?: number;
  templateId?: TemplateId;
  description?: string;
  imageUrl?: string;
  printConfig?: IPrintConfig;
  /** Định nghĩa các tùy chọn (cả tạo-variant lẫn cá nhân hóa). Driver cho UI & validate. */
  options?: IProductOption[];
  /** Linh kiện LUÔN tiêu hao cho mỗi sản phẩm bất kể tùy chọn (VD: body móc khóa). */
  baseComponents?: IBomLine[];
  variants?: Record<string, IProductVariant>;
  serviceIds?: string[];   // tham chiếu đến IService trong collection services
  /** Bài viết chi tiết sản phẩm — lưu HTML từ rich text editor. */
  detailArticle?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Nội dung CÁ NHÂN HÓA của một dòng đơn — KHÔNG ảnh hưởng tồn kho.
 * Lưu JSON tự do để mỗi loại sản phẩm thêm thuộc tính riêng mà không cần đổi schema:
 * gấu bông/khung ảnh chỉ việc nhét vào `extra`.
 */
export interface IItemCustomization {
  message?: string;             // thông điệp khắc/in
  uploadedPhotoUrls?: string[]; // ảnh khách upload
  presetPhotoUrl?: string;      // ảnh chọn sẵn từ thư viện
  templateId?: TemplateId;      // template thẻ digital
  /** Thuộc tính riêng theo ProductType (gấu bông, khung ảnh, standee...). */
  extra?: Record<string, unknown>;
}

/**
 * Ảnh chụp (snapshot) biến thể tại thời điểm đặt — nguồn sự thật cho đơn cũ.
 * OrderItem đọc giá/tên/option từ ĐÂY, không đọc lại từ Variant hiện tại.
 * Đổi giá hoặc xóa variant về sau không làm sai đơn đã tạo.
 */
export interface IVariantSnapshot {
  variantId?: string;
  sku?: string;
  name: string;
  optionValues?: string[];
  unitPrice: number;
  isNfc?: boolean;
  printConfig?: IPrintConfig;
}

export interface IMemorial {
  orderId: string;
  templateId: TemplateId;
  styleId: string;
  frameId: string;
  effectId: string;
  introId?: string;
  bgColor: string;
  bgImageUrl: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  date?: string;
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
}

export interface IMemorialDoc extends IMemorial {
  createdAt?: string;
  updatedAt?: string;
}

export interface IEditDraft extends IMemorial {
  isDirty: boolean;
}

export type PurchaseOrderStatus = 'planned' | 'ordered' | 'received';

export interface IPurchaseOrderItem {
  componentId: string;
  componentName: string;
  quantity: number;
  unitCost: number;
}

export interface IPurchaseOrder {
  id: string;
  status: PurchaseOrderStatus;
  items: IPurchaseOrderItem[];
  totalCost: number;
  supplier?: string;
  note?: string;
  expectedDate?: string;
  imageUrls?: string[];
  receivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
