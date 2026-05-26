import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { DEFAULT_NFC_EXTRA_PRICE } from '@/configs/constants';

export interface IGlobalSettings {
  nfcExtraPrice: number;
}

const FALLBACK: IGlobalSettings = { nfcExtraPrice: DEFAULT_NFC_EXTRA_PRICE };

export const SettingsAPI = {
  get: async (): Promise<IGlobalSettings> => {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (!snap.exists()) return FALLBACK;
    const d = snap.data() as Record<string, unknown>;
    return {
      nfcExtraPrice: (d.nfcExtraPrice as number) ?? FALLBACK.nfcExtraPrice,
    };
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
