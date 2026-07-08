import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/libs/seo';
import { getAllProductsForSeo } from '@/libs/products-server';

// Regenerate the sitemap at most once an hour instead of on every crawl.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
      images: [`${SITE_URL}/opengraph-image`],
    },
    {
      url: `${SITE_URL}/moc-khoa`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [`${SITE_URL}/opengraph-image`],
    },
    {
      url: `${SITE_URL}/moc-khoa-in-anh-theo-yeu-cau`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [`${SITE_URL}/opengraph-image`],
    },
    {
      url: `${SITE_URL}/moc-khoa-nfc`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      images: [`${SITE_URL}/opengraph-image`],
    },
    {
      url: `${SITE_URL}/templates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
      images: [`${SITE_URL}/opengraph-image`],
    },
  ];

  const products = await getAllProductsForSeo();
  const productEntries: MetadataRoute.Sitemap = products
    .filter((p) => p.status === 'active' && p.slug)
    .map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt ?? now,
      changeFrequency: 'weekly',
      priority: 0.7,
      images: [p.imageUrl ?? `${SITE_URL}/opengraph-image`],
    }));

  return [...staticEntries, ...productEntries];
}
