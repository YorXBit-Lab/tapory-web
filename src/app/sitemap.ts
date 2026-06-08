import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/libs/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
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
}
