import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';

export interface IGlobalSettings {
  // Placeholder — các cài đặt toàn hệ thống (mở rộng sau)
  [key: string]: unknown;
}

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
