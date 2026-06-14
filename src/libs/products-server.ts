import 'server-only';
import { cache } from 'react';
import { getAdminDb } from '@/libs/firebase-admin';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import { mapProductDoc } from '@/services/productMapper';
import { toSlug } from '@/utils/slug';
import type { IProduct } from '@/configs/types';

/** Thông tin sản phẩm tối thiểu cần cho SEO (metadata, JSON-LD, sitemap). */
export type ProductSeo = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  price: number;
  status: string;
  canBeNfc: boolean;
  updatedAt?: Date;
};

function toProductSeo(id: string, d: FirebaseFirestore.DocumentData): ProductSeo {
  const name = (d.name as string) ?? '';
  return {
    id,
    name,
    slug: toSlug(name),
    description: d.description as string | undefined,
    imageUrl: d.imageUrl as string | undefined,
    price: (d.price as number) ?? 0,
    status: (d.status as string) ?? 'active',
    canBeNfc: (d.canBeNfc as boolean) ?? false,
    updatedAt: (d.updatedAt as FirebaseFirestore.Timestamp)?.toDate?.(),
  };
}

/** Tất cả sản phẩm cho sitemap/listing. Trả về [] nếu không truy cập được DB. */
export async function getAllProductsForSeo(): Promise<ProductSeo[]> {
  try {
    const snap = await getAdminDb().collection(FIRESTORE_COLLECTIONS.PRODUCTS).get();
    return snap.docs.map((doc) => toProductSeo(doc.id, doc.data()));
  } catch {
    return [];
  }
}

/**
 * Sản phẩm đầy đủ (IProduct) theo slug, để render server-side cho trang chi tiết.
 * Bọc trong React cache() để generateMetadata, JSON-LD và body trang dùng chung
 * 1 lần đọc Firestore mỗi request.
 */
export const getFullProductBySlug = cache(
  async (slug: string): Promise<IProduct | null> => {
    try {
      const col = getAdminDb().collection(FIRESTORE_COLLECTIONS.PRODUCTS);

      // Fast path: indexed lookup by the stored `slug` field (written on
      // create/update). Single-field equality → no composite index needed.
      const bySlug = await col.where('slug', '==', slug).limit(1).get();
      if (!bySlug.empty) {
        const doc = bySlug.docs[0];
        return mapProductDoc(doc.id, doc.data() as Record<string, unknown>);
      }

      // Fallback for products saved before the `slug` field existed: scan and
      // match on the name-derived slug.
      const snap = await col.get();
      for (const doc of snap.docs) {
        if (toSlug((doc.data().name as string) ?? '') === slug) {
          return mapProductDoc(doc.id, doc.data() as Record<string, unknown>);
        }
      }
      return null;
    } catch {
      return null;
    }
  },
);

/** Thông tin SEO rút gọn của một sản phẩm theo slug. */
export async function getProductForSeoBySlug(slug: string): Promise<ProductSeo | null> {
  const product = await getFullProductBySlug(slug);
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    slug: toSlug(product.name),
    description: product.description,
    imageUrl: product.imageUrl,
    price: product.price,
    status: product.status,
    canBeNfc: product.canBeNfc,
    updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
  };
}
