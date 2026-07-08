import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';

/** Nhận diện thương hiệu */
export interface ISiteBrand {
  name?: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

/** Thông tin liên hệ / pháp lý */
export interface ISiteContact {
  email?: string;
  hotline?: string;
  address?: string;
  businessHours?: string;
  taxCode?: string;
}

/** Liên kết mạng xã hội */
export interface ISiteSocial {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  zalo?: string;
  youtube?: string;
}

/** Cấu hình SEO mặc định */
export interface ISiteSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

export interface IGlobalSettings {
  brand?: ISiteBrand;
  contact?: ISiteContact;
  social?: ISiteSocial;
  seo?: ISiteSeo;
  /** Phụ phí gắn chip NFC (đ) */
  nfcExtraPrice?: number;
  [key: string]: unknown;
}

/** Alias rõ nghĩa cho phần cài đặt thông tin website */
export type ISiteSettings = IGlobalSettings;

export const SettingsAPI = {
  get: async (): Promise<IGlobalSettings> => {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (!snap.exists()) return {};
    return snap.data() as IGlobalSettings;
  },

  update: async (idToken: string, data: Partial<IGlobalSettings>): Promise<void> => {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      throw new Error(json.error ?? 'Cập nhật thất bại');
    }
  },
};
